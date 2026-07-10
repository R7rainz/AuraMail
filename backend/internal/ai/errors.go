package ai

import "errors"

// Sentinel errors returned to callers. Underlying causes are logged server-side only.
var (
	ErrOpenAIKeyMissing  = errors.New("OPENAI_API_KEY environment variable is not set")
	ErrAnalysisFailed    = errors.New("email analysis failed")
	ErrInvalidModelReply = errors.New("model returned invalid data")
)
