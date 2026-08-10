package utils

import (
	"encoding/base64"
	"strings"
	"testing"

	"google.golang.org/api/gmail/v1"
)

func TestCleanTextForAi(t *testing.T) {
	tests := []struct {
		name     string
		input    string
		expected string
	}{
		{
			name:     "Removes extra whitespace",
			input:    "Hello    World  \n  Test",
			expected: "Hello World Test",
		},
		{
			name:     "Truncates long text",
			input:    string(make([]byte, 3000)), // 3000 characters
			expected: "... [truncated]",          // Should end with this
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := CleanTextForAi(tt.input)

			//checking logic
			if tt.name == "Removes extra whitespace" && result != tt.expected {
				t.Errorf("got %q, want %q", result, tt.expected)
			}

			if tt.name == "Truncates long text" && len(result) > 2015 {
				t.Error("Text was not truncated correctly")
			}
		})
	}
}

func TestParseBodyHTMLIncludesLink(t *testing.T) {
	payload := &gmail.MessagePart{
		MimeType: "text/html",
		Body: &gmail.MessagePartBody{Data: base64.URLEncoding.EncodeToString([]byte(
			`<p>Apply here</p><a href="https://jobs.example/apply">Open form</a>`,
		))},
	}

	body := ParseBody(payload)
	if !strings.Contains(body, "Apply here") || !strings.Contains(body, "https://jobs.example/apply") {
		t.Fatalf("expected HTML text and link, got %q", body)
	}
}

func TestParseBodyRemovesExactFooter(t *testing.T) {
	payload := &gmail.MessagePart{
		MimeType: "text/plain",
		Body: &gmail.MessagePartBody{Data: base64.URLEncoding.EncodeToString([]byte(
			"Role: Software Engineer\n\nIn God bless you mails, if the link that starts in lnkd.in/... does not open, copy the link.\nWork hard - success will be yours.\nGod Bless Us.\nQueries must be to patqueries.bhopal@vitbhopal.ac.in only.\nOur videos can be seen at https://www.youtube.com/@placementvitbhopal/streams\nWebsite: www.vitbhopal.ac.in\nFollow us: Facebook | Instagram | LinkedIn | YouTube\n---\nFacebook: facebook.com/VITUnivBhopal\nInstagram: instagram.com/vit.bhopal\nLinkedIn: linkedin.com/company/vit-bhopal-university\nYouTube: youtube.com/c/VITBHOPALOfficial",
		))},
	}

	if got := ParseBody(payload); got != "Role: Software Engineer" {
		t.Fatalf("footer was not removed: %q", got)
	}
}

func TestExtractLinkDetailsKeepsVisibleLabel(t *testing.T) {
	payload := &gmail.MessagePart{
		MimeType: "text/html",
		Body: &gmail.MessagePartBody{Data: base64.URLEncoding.EncodeToString([]byte(
			`<a href="https://jobs.example/apply"><strong>Apply for Software Engineer</strong></a>`,
		))},
	}

	got := ExtractLinkDetails(payload)
	if len(got) != 1 || got[0].Label != "Apply for Software Engineer" {
		t.Fatalf("unexpected link details: %#v", got)
	}
}

func TestExtractLinksFromHTMLAndPlainText(t *testing.T) {
	payload := &gmail.MessagePart{
		MimeType: "multipart/alternative",
		Parts: []*gmail.MessagePart{
			{MimeType: "text/plain", Body: &gmail.MessagePartBody{Data: base64.URLEncoding.EncodeToString([]byte(
				"Apply at https://jobs.example/plain.",
			))}},
			{MimeType: "text/html", Body: &gmail.MessagePartBody{Data: base64.URLEncoding.EncodeToString([]byte(
				`<a href="https://jobs.example/html">Apply</a><a href="mailto:hr@example.com">Email</a>`,
			))}},
		},
	}

	got := ExtractLinks(payload)
	if len(got) != 2 || got[0] != "https://jobs.example/plain" || got[1] != "https://jobs.example/html" {
		t.Fatalf("unexpected links: %#v", got)
	}
}

func TestExtractLinksSkipsFooter(t *testing.T) {
	payload := &gmail.MessagePart{
		MimeType: "text/plain",
		Body: &gmail.MessagePartBody{Data: base64.URLEncoding.EncodeToString([]byte(
			"Apply here: https://jobs.example/main\n---\nQueries must be to patqueries.bhopal@vitbhopal.ac.in only.\nOur videos can be seen at https://www.youtube.com/@placementvitbhopal/streams\nWebsite: https://www.vitbhopal.ac.in\n",
		))},
	}

	got := ExtractLinks(payload)
	if len(got) != 1 || got[0] != "https://jobs.example/main" {
		t.Fatalf("unexpected footer links: %#v", got)
	}
}

func TestExtractLinksSkipsKnownFooterURLs(t *testing.T) {
	if !IsFooterLink("https://lnkd.in/dKBWGCEN") {
		t.Fatal("expected sample LinkedIn URL to be recognized as footer")
	}
	payload := &gmail.MessagePart{
		MimeType: "text/html",
		Body: &gmail.MessagePartBody{Data: base64.URLEncoding.EncodeToString([]byte(
			`<a href="https://jobs.example/main">Apply</a><a href="https://www.youtube.com/@placementvitbhopal/streams">Videos</a><a href="https://www.vitbhopal.ac.in">Website</a><a href="https://lnkd.in/dKBWGCEN">LinkedIn</a>`,
		))},
	}

	got := ExtractLinks(payload)
	if len(got) != 1 || got[0] != "https://jobs.example/main" {
		t.Fatalf("unexpected known footer links: %#v", got)
	}
}

func TestExtractAttachments(t *testing.T) {
	t.Run("nil payload returns empty", func(t *testing.T) {
		if got := ExtractAttachments(nil); len(got) != 0 {
			t.Errorf("expected no attachments, got %v", got)
		}
	})

	t.Run("plain text part is not an attachment", func(t *testing.T) {
		payload := &gmail.MessagePart{
			MimeType: "text/plain",
			Body:     &gmail.MessagePartBody{Data: "aGVsbG8="},
		}
		if got := ExtractAttachments(payload); len(got) != 0 {
			t.Errorf("expected no attachments, got %v", got)
		}
	})

	t.Run("part with filename and attachmentId is an attachment", func(t *testing.T) {
		payload := &gmail.MessagePart{
			Filename: "resume.pdf",
			MimeType: "application/pdf",
			Body:     &gmail.MessagePartBody{AttachmentId: "att-1", Size: 1024},
		}
		got := ExtractAttachments(payload)
		if len(got) != 1 {
			t.Fatalf("expected 1 attachment, got %d", len(got))
		}
		if got[0].Filename != "resume.pdf" || got[0].AttachmentId != "att-1" || got[0].Size != 1024 {
			t.Errorf("unexpected attachment meta: %+v", got[0])
		}
	})

	t.Run("walks nested parts and collects all attachments", func(t *testing.T) {
		payload := &gmail.MessagePart{
			MimeType: "multipart/mixed",
			Parts: []*gmail.MessagePart{
				{MimeType: "text/plain", Body: &gmail.MessagePartBody{Data: "aGVsbG8="}},
				{
					MimeType: "multipart/related",
					Parts: []*gmail.MessagePart{
						{
							Filename: "photo.png",
							MimeType: "image/png",
							Body:     &gmail.MessagePartBody{AttachmentId: "att-a", Size: 200},
						},
					},
				},
				{
					Filename: "offer.pdf",
					MimeType: "application/pdf",
					Body:     &gmail.MessagePartBody{AttachmentId: "att-b", Size: 300},
				},
			},
		}
		got := ExtractAttachments(payload)
		if len(got) != 2 {
			t.Fatalf("expected 2 attachments, got %d: %+v", len(got), got)
		}
		if got[0].AttachmentId != "att-a" || got[1].AttachmentId != "att-b" {
			t.Errorf("unexpected attachment order/content: %+v", got)
		}
	})

	t.Run("filename without attachmentId is skipped", func(t *testing.T) {
		payload := &gmail.MessagePart{
			Filename: "inline.png",
			MimeType: "image/png",
			Body:     &gmail.MessagePartBody{Data: "aGVsbG8="},
		}
		if got := ExtractAttachments(payload); len(got) != 0 {
			t.Errorf("expected no attachments, got %v", got)
		}
	})
}
