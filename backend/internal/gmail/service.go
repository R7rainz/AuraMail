package gmail

import (
	"context"
	"fmt"
	"log"
	"log/slog"
	"math"
	"strings"
	"sync"
	"time"

	"google.golang.org/api/gmail/v1"

	"github.com/r7rainz/auramail/internal/ai"
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

type SyncOptions struct {
	MaxResults            int64
	IncludeThreadMessages bool
}

func (e *SyncError) Error() string {
	return fmt.Sprintf("%s: %s", e.Code, e.Message)
}

func (o SyncOptions) withDefaults() SyncOptions {
	if o.MaxResults <= 0 {
		o.MaxResults = 25
	}
	return o
}

func headerValue(msg *gmail.Message, name string) string {
	if msg == nil || msg.Payload == nil {
		return ""
	}
	for _, h := range msg.Payload.Headers {
		if strings.EqualFold(h.Name, name) {
			return h.Value
		}
	}
	return ""
}

func messageReceivedAt(msg *gmail.Message) string {
	if msg != nil && msg.InternalDate > 0 {
		return time.UnixMilli(msg.InternalDate).Format(time.RFC3339)
	}
	return headerValue(msg, "Date")
}

func collectMessageIDs(srv *gmail.Service, messages []*gmail.Message, includeThreads bool) []string {
	seenMessages := make(map[string]struct{})
	seenThreads := make(map[string]struct{})
	ids := make([]string, 0, len(messages))

	addMessage := func(id string) {
		if id == "" {
			return
		}
		if _, ok := seenMessages[id]; ok {
			return
		}
		seenMessages[id] = struct{}{}
		ids = append(ids, id)
	}

	for _, msg := range messages {
		addMessage(msg.Id)

		if !includeThreads || msg.ThreadId == "" {
			continue
		}
		if _, ok := seenThreads[msg.ThreadId]; ok {
			continue
		}
		seenThreads[msg.ThreadId] = struct{}{}

		thread, err := srv.Users.Threads.Get("me", msg.ThreadId).Format("minimal").Do()
		if err != nil {
			slog.Warn("failed to expand gmail thread", "threadID", msg.ThreadId, "err", err)
			continue
		}
		for _, threadMsg := range thread.Messages {
			addMessage(threadMsg.Id)
		}
	}

	return ids
}

func FetchAndSummarize(ctx context.Context, srv *gmail.Service, repo UserRepository, query string, userID string, opts SyncOptions) (chan *ai.AIResult, chan error) {
	out := make(chan *ai.AIResult)
	errChan := make(chan error, 1) // Buffered to prevent blocking

	opts = opts.withDefaults()
	var aiSemaphore = make(chan struct{}, 10) //limit to 10 concurrent AI requests
	go func() {
		defer close(out)
		defer close(errChan)

		slog.Info("FetchAndSummarize started", "query", query, "userID", userID, "maxResults", opts.MaxResults, "includeThreads", opts.IncludeThreadMessages)

		// 1. Safety check: Ensure list is not nil
		list, err := srv.Users.Messages.List("me").Q(query).MaxResults(opts.MaxResults).Do()
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

		messageIDs := collectMessageIDs(srv, list.Messages, opts.IncludeThreadMessages)
		slog.Info("Found messages to process", "matched", len(list.Messages), "expanded", len(messageIDs))

		var wg sync.WaitGroup
		jobs := make(chan string, len(messageIDs))

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
						if msg, fetchErr := srv.Users.Messages.Get("me", id).Format("full").Do(); fetchErr == nil {
							changed := mergeExtractedLinks(cached, msg.Payload)
							body := utils.ParseBody(msg.Payload)
							if body != "" && (cached.Description == nil || *cached.Description != body) {
								cached.Description = &body
								changed = true
							}
							if changed {
								if saveErr := repo.SaveSummary(ctx, userID, id, cached); saveErr != nil {
									slog.Error("Error updating cached email", "id", id, "err", saveErr)
								}
							}
						}
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
					subject = headerValue(msg, "Subject")

					slog.Info("Analyzing email with AI", "id", id, "subject", subject)

					body := utils.ParseBody(msg.Payload)
					attachments := utils.ExtractAttachments(msg.Payload)

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

					summary.GmailMessageID = id
					summary.ThreadID = msg.ThreadId
					summary.Subject = subject
					summary.Sender = headerValue(msg, "From")
					summary.Snippet = msg.Snippet
					summary.ReceiverAt = messageReceivedAt(msg)
					if body != "" {
						summary.Description = &body
					}
					summary.Attachments = attachments
					mergeExtractedLinks(summary, msg.Payload)

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
		for _, id := range messageIDs {
			jobs <- id
		}
		close(jobs)

		// 5. Wait for completion
		wg.Wait()
		slog.Info("FetchAndSummarize completed")
	}()
	return out, errChan
}

func mergeExtractedLinks(summary *ai.AIResult, payload *gmail.MessagePart) bool {
	extracted := utils.ExtractLinks(payload)
	if len(extracted) > 0 {
		oldApply := ""
		if summary.ApplyLink != nil {
			oldApply = *summary.ApplyLink
		}
		changed := oldApply != extracted[0] || len(summary.OtherLinks) != len(extracted)-1
		if !changed {
			for i, link := range extracted[1:] {
				if summary.OtherLinks[i] != link {
					changed = true
					break
				}
			}
		}
		applyLink := extracted[0]
		summary.ApplyLink = &applyLink
		summary.OtherLinks = extracted[1:]
		return changed
	}

	changed := false
	if summary.ApplyLink != nil && utils.IsFooterLink(*summary.ApplyLink) {
		summary.ApplyLink = nil
		changed = true
	}
	filtered := summary.OtherLinks[:0]
	for _, link := range summary.OtherLinks {
		if !utils.IsFooterLink(link) {
			filtered = append(filtered, link)
		}
	}
	if len(filtered) != len(summary.OtherLinks) {
		summary.OtherLinks = filtered
		changed = true
	}
	return changed
}

func SyncUserPlacementEmails(ctx context.Context, srv *gmail.Service, repo UserRepository, query string, userID string, opts SyncOptions) ([]*ai.AIResult, error) {
	emailStream, errChan := FetchAndSummarize(ctx, srv, repo, query, userID, opts)

	var processedEmails []*ai.AIResult
	var syncError error

	for emailStream != nil || errChan != nil {
		select {
		case summary, ok := <-emailStream:
			if !ok {
				emailStream = nil
				continue
			}
			if summary != nil {
				processedEmails = append(processedEmails, summary)
			}
		case err, ok := <-errChan:
			if !ok {
				errChan = nil
				continue
			}
			if err != nil {
				syncError = err
			}
		case <-ctx.Done():
			return processedEmails, ctx.Err()
		}
	}

	return processedEmails, syncError
}
