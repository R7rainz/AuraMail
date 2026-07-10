package ai

// AIResult is the structured output from email analysis (persisted and returned to clients).
type AIResult struct {
	GmailMessageID    string   `json:"gmailMessageId"`
	Subject           string   `json:"subject"`
	Sender            string   `json:"sender"`
	ReceiverAt        string   `json:"receiverAt"`
	Snippet           string   `json:"snippet"`
	Summary           string   `json:"summary"`
	Category          string   `json:"category"`
	Tags              []string `json:"tags"`
	Priority          string   `json:"priority"`
	Company           *string  `json:"company"`
	Role              *string  `json:"role"`
	Deadline          *string  `json:"deadline"`
	ApplyLink         *string  `json:"applyLink"`
	OtherLinks        []string `json:"otherLinks"`
	Eligibility       any      `json:"eligibility"`
	Timings           any      `json:"timings"`
	Salary            any      `json:"salary"`
	Location          any      `json:"location"`
	EventDetails      any      `json:"eventDetails"`
	Requirements      any      `json:"requirements"`
	Description       *string  `json:"description"`
	AttachmentSummary *string  `json:"attachmentSummary"`
}
