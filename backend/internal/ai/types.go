package ai

import (
	"encoding/json"
	"strings"

	"github.com/r7rainz/auramail/internal/utils"
)

// AIResult is the structured output from email analysis (persisted and returned to clients).
type AIResult struct {
	AnalysisVersion   string                 `json:"analysisVersion,omitempty"`
	GmailMessageID    string                 `json:"gmailMessageId"`
	ThreadID          string                 `json:"threadId"`
	Subject           string                 `json:"subject"`
	Sender            string                 `json:"sender"`
	ReceiverAt        string                 `json:"receiverAt"`
	Snippet           string                 `json:"snippet"`
	Summary           string                 `json:"summary"`
	Category          string                 `json:"category"`
	Tags              []string               `json:"tags"`
	Priority          string                 `json:"priority"`
	Company           *string                `json:"company"`
	Role              *string                `json:"role"`
	Deadline          *string                `json:"deadline"`
	ApplyLink         *string                `json:"applyLink"`
	OtherLinks        []string               `json:"otherLinks"`
	LinkLabels        []string               `json:"linkLabels,omitempty"`
	Eligibility       any                    `json:"eligibility"`
	Timings           any                    `json:"timings"`
	Salary            any                    `json:"salary"`
	Location          any                    `json:"location"`
	EventDetails      any                    `json:"eventDetails"`
	Requirements      any                    `json:"requirements"`
	Description       *string                `json:"description"`
	AttachmentSummary *string                `json:"attachmentSummary"`
	Attachments       []utils.AttachmentMeta `json:"attachments"`
	Important         bool                   `json:"important"`
}

func (r *AIResult) UnmarshalJSON(data []byte) error {
	type alias AIResult
	decoded := struct {
		Summary json.RawMessage `json:"summary"`
		*alias
	}{alias: (*alias)(r)}

	if err := json.Unmarshal(data, &decoded); err != nil {
		return err
	}

	r.Summary = ""
	if len(decoded.Summary) == 0 || string(decoded.Summary) == "null" {
		return nil
	}

	var summary string
	if err := json.Unmarshal(decoded.Summary, &summary); err == nil {
		r.Summary = summary
		return nil
	}

	var bullets []string
	if err := json.Unmarshal(decoded.Summary, &bullets); err != nil {
		return err
	}
	lines := make([]string, 0, len(bullets))
	for _, bullet := range bullets {
		if bullet = strings.TrimSpace(bullet); bullet != "" {
			lines = append(lines, "• "+bullet)
		}
	}
	r.Summary = strings.Join(lines, "\n")
	return nil
}
