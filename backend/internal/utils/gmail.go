package utils

import (
	"encoding/base64"
	"fmt"
	"net/url"
	"regexp"
	"strings"
	"sync"

	"golang.org/x/net/html"
	"google.golang.org/api/gmail/v1"
)

type EmailMessage struct {
	ID      string `json:"id"`
	Subject string `json:"subject"`
	From    string `json:"from"`
	Date    string `json:"date"`
	Body    string `json:"body"`
	Snippet string `json:"snippet"`
}

type ExtractedLink struct {
	URL   string
	Label string
}

func ListPlacementEmails(srv *gmail.Service, query string, maxResults int64) ([]*EmailMessage, error) {
	//getting list of ids
	res, err := srv.Users.Messages.List("me").Q(query).MaxResults(maxResults).Do()
	if err != nil {
		return nil, err
	}

	//channels setup ( the queue) - 'jobs' sends IDs to the workers; 'results' collects finished emails
	jobs := make(chan string, len(res.Messages))
	results := make(chan *EmailMessage, len(res.Messages))

	var wg sync.WaitGroup

	for range 10 {
		wg.Add(1)
		go func() {
			defer wg.Done()
			for id := range jobs {
				msg, err := srv.Users.Messages.Get("me", id).Format("full").Do()
				if err != nil {
					continue
				}

				email := &EmailMessage{
					ID:      id,
					Snippet: msg.Snippet,
				}

				//header parsing
				for _, h := range msg.Payload.Headers {
					if h.Name == "Subject" {
						email.Subject = h.Value
					}
					if h.Name == "From" {
						email.From = h.Value
					}
				}

				email.Body = ParseBody(msg.Payload)
				results <- email
			}
		}()
	}

	//Feeding the workers
	for _, m := range res.Messages {
		jobs <- m.Id
	}
	close(jobs) //no more ids to send

	//wait and collect results
	go func() {
		wg.Wait()
		close(results)
	}()

	var finalResult []*EmailMessage
	for email := range results {
		finalResult = append(finalResult, email)
	}
	return finalResult, nil
}

// CleanTextForAI
func CleanTextForAi(input string) string {
	return cleanText(input, 2000)
}

func CleanTextForStorage(input string) string {
	cleaned := strings.TrimSpace(strings.ReplaceAll(input, "\r\n", "\n"))
	cleaned = regexp.MustCompile(`[ \t]+`).ReplaceAllString(cleaned, " ")
	cleaned = regexp.MustCompile(`\n{3,}`).ReplaceAllString(cleaned, "\n\n")
	if len(cleaned) > 24000 {
		return cleaned[:24000] + "... [truncated]"
	}
	return cleaned
}

func cleanText(input string, limit int) string {
	re := regexp.MustCompile(`\s+`)
	cleaned := re.ReplaceAllString(input, " ")

	cleaned = strings.TrimSpace(cleaned)

	//limiting to size 2000
	if len(cleaned) > limit {
		return cleaned[:limit] + "... [truncated]"
	}

	return cleaned
}

func ParseBody(payload *gmail.MessagePart) string {
	if payload == nil {
		return ""
	}

	if payload.Body != nil && payload.Body.Data != "" {
		data := decodeBody(payload.Body.Data)
		switch payload.MimeType {
		case "text/plain":
			return cleanBody(data)
		case "text/html":
			return cleanBody(htmlText(data))
		}
	}

	for _, part := range payload.Parts {
		if result := ParseBody(part); result != "" {
			return result
		}
	}

	return ""
}

func cleanBody(input string) string {
	cleaned := CleanTextForStorage(input)
	if index := footerStart(cleaned); index >= 0 {
		cleaned = strings.TrimSpace(cleaned[:index])
	}
	return cleaned
}

func decodeBody(data string) string {
	decoded, err := base64.URLEncoding.DecodeString(data)
	if err != nil {
		decoded, _ = base64.RawURLEncoding.DecodeString(data)
	}
	return string(decoded)
}

func htmlText(source string) string {
	doc, err := html.Parse(strings.NewReader(source))
	if err != nil {
		return source
	}

	var builder strings.Builder
	var walk func(*html.Node)
	walk = func(node *html.Node) {
		if node.Type == html.ElementNode && (node.Data == "script" || node.Data == "style") {
			return
		}
		if node.Type == html.TextNode {
			builder.WriteString(node.Data)
			builder.WriteByte(' ')
		}
		if node.Type == html.ElementNode && node.Data == "a" {
			for _, attr := range node.Attr {
				if attr.Key == "href" && isHTTPLink(attr.Val) {
					builder.WriteString(" ")
					builder.WriteString(attr.Val)
					builder.WriteString(" ")
				}
			}
		}
		for child := node.FirstChild; child != nil; child = child.NextSibling {
			walk(child)
		}
	}
	walk(doc)
	return builder.String()
}

// ExtractLinkDetails returns unique HTTP(S) links and their visible labels.
func ExtractLinkDetails(payload *gmail.MessagePart) []ExtractedLink {
	seen := make(map[string]struct{})
	links := make([]ExtractedLink, 0)
	add := func(link, label string) {
		link = strings.Trim(link, " \t\r\n.,;:!?)]}>")
		if !isHTTPLink(link) || IsFooterLink(link) {
			return
		}
		if _, ok := seen[link]; ok {
			return
		}
		seen[link] = struct{}{}
		label = strings.TrimSpace(strings.Join(strings.Fields(label), " "))
		if label == "" {
			label = defaultLinkLabel(link)
		}
		links = append(links, ExtractedLink{URL: link, Label: label})
	}
	var visit func(*gmail.MessagePart)
	visit = func(part *gmail.MessagePart) {
		if part == nil {
			return
		}
		if part.Body != nil && part.Body.Data != "" {
			source := decodeBody(part.Body.Data)
			switch part.MimeType {
			case "text/plain":
				if index := footerStart(source); index >= 0 {
					source = source[:index]
				}
				for _, match := range regexp.MustCompile(`https?://[^\s<>"']+`).FindAllStringIndex(source, -1) {
					add(source[match[0]:match[1]], plainLinkLabel(source, match[0]))
				}
			case "text/html":
				if doc, err := html.Parse(strings.NewReader(source)); err == nil {
					footerStarted := false
					var walk func(*html.Node)
					walk = func(node *html.Node) {
						if node.Type == html.TextNode && isFooterText(node.Data) {
							footerStarted = true
						}
						if !footerStarted && node.Type == html.ElementNode && node.Data == "a" {
							label := anchorText(node)
							for _, attr := range node.Attr {
								if attr.Key == "href" {
									add(attr.Val, label)
								}
							}
						}
						for child := node.FirstChild; child != nil; child = child.NextSibling {
							walk(child)
						}
					}
					walk(doc)
				}
			}
		}
		for _, child := range part.Parts {
			visit(child)
		}
	}
	visit(payload)
	return links
}

// ExtractLinks returns unique HTTP(S) links from plain-text URLs and HTML hrefs.
func ExtractLinks(payload *gmail.MessagePart) []string {
	details := ExtractLinkDetails(payload)
	links := make([]string, 0, len(details))
	for _, detail := range details {
		links = append(links, detail.URL)
	}
	return links
}

func anchorText(node *html.Node) string {
	var builder strings.Builder
	var walk func(*html.Node)
	walk = func(current *html.Node) {
		if current.Type == html.TextNode {
			builder.WriteString(current.Data)
			builder.WriteByte(' ')
		}
		for child := current.FirstChild; child != nil; child = child.NextSibling {
			walk(child)
		}
	}
	walk(node)
	return builder.String()
}

func plainLinkLabel(source string, start int) string {
	lineStart := strings.LastIndex(source[:start], "\n") + 1
	label := strings.TrimSpace(source[lineStart:start])
	return strings.Trim(label, "-–—•:| ")
}

func defaultLinkLabel(link string) string {
	parsed, err := url.Parse(link)
	if err != nil {
		return "Open link"
	}
	switch strings.TrimPrefix(strings.ToLower(parsed.Hostname()), "www.") {
	case "docs.google.com", "forms.gle", "forms.google.com":
		return "Application form"
	case "jobs.lever.co", "boards.greenhouse.io":
		return "Job application"
	default:
		return "Open link"
	}
}

func isHTTPLink(link string) bool {
	parsed, err := url.Parse(strings.TrimSpace(link))
	return err == nil && (parsed.Scheme == "http" || parsed.Scheme == "https") && parsed.Host != ""
}

func IsFooterLink(link string) bool {
	parsed, err := url.Parse(strings.TrimSpace(link))
	if err != nil {
		return false
	}
	host := strings.TrimPrefix(strings.ToLower(parsed.Hostname()), "www.")
	path := strings.TrimRight(parsed.Path, "/")
	switch host {
	case "lnkd.in":
		return strings.EqualFold(path, "/dKBWGCEN")
	case "vitbhopal.ac.in":
		return path == ""
	case "youtube.com":
		return strings.EqualFold(path, "/@placementvitbhopal/streams") || strings.EqualFold(path, "/c/VITBHOPALOfficial")
	case "facebook.com":
		return strings.EqualFold(path, "/VITUnivBhopal")
	case "instagram.com":
		return strings.EqualFold(path, "/vit.bhopal")
	case "linkedin.com":
		return strings.EqualFold(path, "/company/vit-bhopal-university")
	default:
		return false
	}
}

func footerStart(source string) int {
	lower := strings.ToLower(source)
	markers := []string{
		"in god bless you mails",
		"queries must be to",
		"our videos can be seen at",
		"follow us:",
		"work hard - success will be yours",
		"\n---",
		"---\n",
	}
	index := -1
	for _, marker := range markers {
		if candidate := strings.Index(lower, marker); candidate >= 0 && (index < 0 || candidate < index) {
			index = candidate
		}
	}
	return index
}

func isFooterText(text string) bool {
	return footerStart(text) >= 0
}

// AttachmentMeta describes a real Gmail attachment (filename + Gmail API
// identifiers needed to fetch its content later), as opposed to
// AttachmentSummary which is an AI-generated text guess.
type AttachmentMeta struct {
	Filename     string `json:"filename"`
	MimeType     string `json:"mimeType"`
	AttachmentId string `json:"attachmentId"`
	Size         int64  `json:"size"`
}

// ExtractAttachments walks the full MIME part tree of a Gmail message and
// collects every part that represents a real attachment (has a filename and
// an attachment ID), unlike ParseBody which only extracts the first
// text/plain body part.
func ExtractAttachments(payload *gmail.MessagePart) []AttachmentMeta {
	var out []AttachmentMeta
	if payload == nil {
		return out
	}

	if payload.Filename != "" && payload.Body != nil && payload.Body.AttachmentId != "" {
		out = append(out, AttachmentMeta{
			Filename:     payload.Filename,
			MimeType:     payload.MimeType,
			AttachmentId: payload.Body.AttachmentId,
			Size:         payload.Body.Size,
		})
	}

	for _, part := range payload.Parts {
		out = append(out, ExtractAttachments(part)...)
	}

	return out
}

func FormatForAI(emails []*EmailMessage) string {
	var builder strings.Builder
	builder.WriteString("Here are the latest placement emails:\n\n")

	for _, e := range emails {
		fmt.Fprintf(&builder, "FROM: %s\nSUBJECT, %s\nDATE: %s\nCONTENT: %s\n", e.From, e.Subject, e.Date, e.Body)
		builder.WriteString("\n---\n")
	}
	return builder.String()
}
