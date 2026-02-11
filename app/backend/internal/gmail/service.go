package gmail

import (
	"context"
	"fmt"
	"log"
	"log/slog"
	"math"
	"sync"
	"time"

	"google.golang.org/api/gmail/v1"

	"github.com/r7rainz/auramail/internal/ai"
	"github.com/r7rainz/auramail/internal/user"
	"github.com/r7rainz/auramail/internal/utils"
)

// SyncResult contains both the AI result and any error that occurred
type SyncResult struct {
	Result *ai.AIResult
	Error  error
}

// SyncError represents an error during sync with a specific error code
type SyncError struct {
	Code    string
	Message string
}

func (e *SyncError) Error() string {
	return fmt.Sprintf("%s: %s", e.Code, e.Message)
}

func FetchAndSummarize(ctx context.Context, srv *gmail.Service, repo *user.PostgresRepository, query string, userID int) (chan *ai.AIResult, chan error) {
	out := make(chan *ai.AIResult)
	errChan := make(chan error, 1) // Buffered to prevent blocking

	var aiSemaphore = make(chan struct{}, 10) //limit to 10 concurrent AI requests
	go func() {
		defer close(out)
		defer close(errChan)

		slog.Info("FetchAndSummarize started", "query", query, "userID", userID)

		// 1. Safety check: Ensure list is not nil
		list, err := srv.Users.Messages.List("me").Q(query).MaxResults(10).Do()
		if err != nil {
			slog.Error("Gmail API error", "err", err)
			errChan <- &SyncError{Code: "GMAIL_API_ERROR", Message: fmt.Sprintf("Failed to fetch emails from Gmail: %v", err)}
			return
		}
		if list == nil || len(list.Messages) == 0 {
			slog.Warn("No messages found for query", "query", query)
			errChan <- &SyncError{Code: "NO_EMAILS_FOUND", Message: fmt.Sprintf("No emails found matching query: %s", query)}
			return
		}

		slog.Info("Found messages to process", "count", len(list.Messages))

		var wg sync.WaitGroup
		jobs := make(chan string, len(list.Messages))

		// 2. Start workers
		workerCount := 5 // 10 might hit OpenAI rate limits too fast, 5 is safer
		for i := 0; i < workerCount; i++ {
			wg.Add(1)
			go func() {
				defer wg.Done()
				for id := range jobs {
					slog.Info("Processing message", "id", id)

					//checking db first
					cached, err := repo.GetSummary(ctx, id)
					if err == nil && cached != nil {
						slog.Info("Using cached summary", "id", id)
						select {
						case <-ctx.Done():
							return
						case out <- cached:
							continue
						}
					}

					msg, err := srv.Users.Messages.Get("me", id).Format("full").Do()
					if err != nil {
						slog.Error("Failed to get message", "id", id, "err", err)
						continue
					}

					subject := ""
					for _, h := range msg.Payload.Headers {
						if h.Name == "Subject" {
							subject = h.Value
						}
					}

					slog.Info("Analyzing email with AI", "id", id, "subject", subject)

					body := utils.ParseBody(msg.Payload)

					var summary *ai.AIResult

					maxRetries := 3
					for i := 0; i < maxRetries; i++ {
						aiSemaphore <- struct{}{}
						summary, err = ai.AnalyzeEmail(ctx, userID, subject, msg.Snippet, body)
						<-aiSemaphore

						if err == nil {
							slog.Info("AI analysis successful", "id", id, "category", summary.Category)
							break
						}

						if i < maxRetries-1 {
							waitTime := time.Duration(math.Pow(2, float64(i+1))) * time.Second
							log.Printf("AI Error for %s: %v. Retrying in %v...", id, err, waitTime)

							select {
							case <-time.After(waitTime):
								continue
							case <-ctx.Done():
								return
							}
						}
					}

					if err != nil || summary == nil {
						slog.Error("Skipping message - AI failed", "id", id, "err", err)
						continue
					}

					err = repo.SaveSummary(ctx, userID, id, summary)
					if err != nil {
						slog.Error("Error saving summary to DB", "err", err)
					} else {
						slog.Info("Saved summary to DB", "id", id)
					}

					// Only send if we have a valid result
					select {
					case <-ctx.Done():
						return
					case out <- summary:
					}
				}
			}()
		}

		// 4. Feed the jobs
		for _, m := range list.Messages {
			jobs <- m.Id
		}
		close(jobs)

		// 5. Wait for completion
		wg.Wait()
		slog.Info("FetchAndSummarize completed")
	}()
	return out, errChan
}
