package utils

import (
	"encoding/base64"
	"fmt"
	"regexp"
	"strings"
	"sync"

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
					ID: id, 
					Snippet: msg.Snippet,
				}

				//header parsing
				for _, h := range msg.Payload.Headers {
					if h.Name == "Subject" { email.Subject = h.Value }
					if h.Name == "From" { email.From = h.Value }
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
		finalResult = append(finalResult,email)
	}
	return finalResult, nil
}

//CleanTextForAI
func CleanTextForAi(input string) string {
	re := regexp.MustCompile(`\s+`)
	cleaned := re.ReplaceAllString(input, " ")

	cleaned = strings.TrimSpace(cleaned)

	//limiting to size 2000
	if len(cleaned) > 2000 {
		return cleaned[:2000] + "... [truncated]"
	}

	return cleaned
}

func ParseBody(payload *gmail.MessagePart) string {
	if payload.MimeType == "text/plain" && payload.Body.Data != "" {
		data, _ := base64.URLEncoding.DecodeString(payload.Body.Data)
		return CleanTextForAi(string(data))
	}

	for _, part := range payload.Parts {
		result := ParseBody(part)
		if result != "" {
			return result
		}
	}

	return ""

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


