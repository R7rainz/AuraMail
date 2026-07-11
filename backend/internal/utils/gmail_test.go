package utils

import (
	"testing"

	"google.golang.org/api/gmail/v1"
)

func TestCleanTextForAi(t *testing.T){
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
            expected: "... [truncated]",           // Should end with this
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
