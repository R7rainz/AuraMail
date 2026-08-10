package ai

import "github.com/r7rainz/auramail/internal/utils"

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
