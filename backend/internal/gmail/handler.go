package gmail

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"log"
	"log/slog"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/r7rainz/auramail/internal/ai"
	"github.com/r7rainz/auramail/internal/auth"
	"github.com/r7rainz/auramail/internal/auth/google"
	"github.com/r7rainz/auramail/internal/config"
	"github.com/r7rainz/auramail/internal/response"
	"github.com/r7rainz/auramail/internal/user"
	"github.com/r7rainz/auramail/internal/utils"
)

// UserRepository is the subset of user.Repository (plus email-summary
// storage) that the gmail package depends on. Narrowing to an interface
// here (rather than reusing *user.PostgresRepository directly) lets tests
// substitute a fake without needing a real database.
type UserRepository interface {
	FindByID(ctx context.Context, id string) (*user.User, error)
	GetSummariesByQuery(ctx context.Context, userID string, searchQuery string) ([]*ai.AIResult, error)
	GetSummary(ctx context.Context, gmailID string) (*ai.AIResult, error)
	SaveSummary(ctx context.Context, userID string, gmailID string, res *ai.AIResult) error
}

type GmailHandler struct {
	userRepo UserRepository
	cfg      *config.Config
}

func NewHandler(cfg *config.Config, repo UserRepository) *GmailHandler {
	return &GmailHandler{
		userRepo: repo,
		cfg:      cfg,
	}
}

// GetEmails returns stored email summaries for the authenticated user
func (h *GmailHandler) GetEmails(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	userID, ok := ctx.Value(auth.UserIDContextKey).(string)
	if !ok {
		response.Unauthorized(w, "No UserID found in context")
		return
	}

	// Get optional query params
	searchQuery := r.URL.Query().Get("q")
	pageStr := r.URL.Query().Get("page")
	page := 1
	if pageStr != "" {
		if p, err := strconv.Atoi(pageStr); err == nil && p > 0 {
			page = p
		}
	}

	// Fetch stored summaries from database
	summaries, err := h.userRepo.GetSummariesByQuery(ctx, userID, searchQuery)
	if err != nil {
		slog.ErrorContext(ctx, "failed to fetch email summaries", "err", err)
		response.InternalError(w, "Failed to fetch emails")
		return
	}

	// Transform to frontend expected format
	type emailResponse struct {
		ID                string   `json:"id"`
		GmailMessageID    string   `json:"gmailMessageId"`
		ThreadID          string   `json:"threadId"`
		Subject           string   `json:"subject"`
		Sender            string   `json:"sender"`
		Snippet           string   `json:"snippet"`
		ReceivedAt        string   `json:"receivedAt"`
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
		Description       *string                `json:"description"`
		AttachmentSummary *string                `json:"attachmentSummary"`
		Attachments       []utils.AttachmentMeta `json:"attachments"`
		Category          string                 `json:"category"`
		Tags              []string               `json:"tags"`
		Priority          string                 `json:"priority"`
		Summary           string                 `json:"summary"`
	}

	emails := make([]emailResponse, 0, len(summaries))
	for _, s := range summaries {
		subject := s.Subject
		if subject == "" {
			subject = s.Summary
		}

		emails = append(emails, emailResponse{
			ID:                s.GmailMessageID,
			GmailMessageID:    s.GmailMessageID,
			ThreadID:          s.ThreadID,
			Subject:           subject,
			Sender:            s.Sender,
			Snippet:           s.Summary,
			ReceivedAt:        s.ReceiverAt,
			Company:           s.Company,
			Role:              s.Role,
			Deadline:          s.Deadline,
			ApplyLink:         s.ApplyLink,
			OtherLinks:        s.OtherLinks,
			Eligibility:       s.Eligibility,
			Timings:           s.Timings,
			Salary:            s.Salary,
			Location:          s.Location,
			EventDetails:      s.EventDetails,
			Requirements:      s.Requirements,
			Description:       s.Description,
			AttachmentSummary: s.AttachmentSummary,
			Attachments:       s.Attachments,
			Category:          s.Category,
			Tags:              s.Tags,
			Priority:          s.Priority,
			Summary:           s.Summary,
		})
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{
		"success":    true,
		"emails":     emails,
		"total":      len(emails),
		"page":       page,
		"totalPages": 1,
	})
}

func (h *GmailHandler) SyncPlacementEmails(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	userID, ok := ctx.Value(auth.UserIDContextKey).(string)
	if !ok {
		response.JSON(w, http.StatusUnauthorized, map[string]any{
			"success": false,
			"error":   "UNAUTHORIZED",
			"message": "No UserID found in context. Please log in again.",
		})
		return
	}

	u, err := h.userRepo.FindByID(ctx, userID)
	if err != nil {
		response.JSON(w, http.StatusNotFound, map[string]any{
			"success": false,
			"error":   "USER_NOT_FOUND",
			"message": "User not found. Please log in again.",
		})
		return
	}

	// Validate Google refresh token exists.
	if u.GoogleRefreshToken == "" {
		response.JSON(w, http.StatusUnauthorized, map[string]any{
			"success": false,
			"error":   "INVALID_REFRESH_TOKEN",
			"message": "Your Gmail authorization has expired. Please log out and log in again to re-authorize.",
		})
		return
	}

	srv, err := google.CreateGmailService(ctx, u.GoogleRefreshToken)
	if err != nil {
		slog.ErrorContext(ctx, "gmail service init failed", "err", err)
		response.JSON(w, http.StatusInternalServerError, map[string]any{
			"success": false,
			"error":   "GMAIL_AUTH_FAILED",
			"message": "Failed to connect to Gmail. Your authorization may have expired. Please log out and log in again.",
		})
		return
	}

	// Use configurable query with fallback
	query := r.URL.Query().Get("query")
	if query == "" {
		query = h.cfg.DefaultEmailQuery
	}

	slog.Info("Starting email sync with AI processing", "query", query, "userID", userID)

	processedEmails, syncError := SyncUserPlacementEmails(ctx, srv, h.userRepo, query, u.ID, SyncOptions{
		MaxResults:            h.cfg.SyncMaxResults,
		IncludeThreadMessages: h.cfg.SyncIncludeThreads,
	})

	// Check for errors after processing
	if syncError != nil {
		// Check if it's a SyncError with a specific code
		if se, ok := syncError.(*SyncError); ok {
			response.JSON(w, http.StatusOK, map[string]any{
				"success":   false,
				"error":     se.Code,
				"message":   se.Message,
				"processed": len(processedEmails),
				"emails":    processedEmails,
			})
			return
		}
		response.JSON(w, http.StatusInternalServerError, map[string]any{
			"success": false,
			"error":   "SYNC_FAILED",
			"message": fmt.Sprintf("Email sync failed: %v", syncError),
		})
		return
	}

	slog.Info("Email sync completed", "processed", len(processedEmails))

	response.Success(w, map[string]any{
		"success":   true,
		"processed": len(processedEmails),
		"emails":    processedEmails,
	})
}

func (h *GmailHandler) StreamPlacementEmails(w http.ResponseWriter, r *http.Request) {
	// Setting headers for SSE
	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")
	w.Header().Set("Access-Control-Allow-Origin", "*") // for development

	ctx := r.Context()

	rawID := ctx.Value(auth.UserIDContextKey)
	if rawID == nil {
		sendSSEError(w, "unauthorized", "No UserID in context")
		return
	}

	userID, ok := rawID.(string)
	if !ok {
		sendSSEError(w, "unauthorized", "Invalid UserID type")
		return
	}

	u, err := h.userRepo.FindByID(ctx, userID)
	if err != nil {
		sendSSEError(w, "not_found", "User not found")
		return
	}

	if u.GoogleRefreshToken == "" {
		sendSSEError(w, "auth_error", "Missing Google refresh token")
		return
	}

	srv, err := google.CreateGmailService(ctx, u.GoogleRefreshToken)
	if err != nil {
		sendSSEError(w, "auth_error", "Failed to initialize Gmail service")
		return
	}

	// Use query param or configurable default
	query := r.URL.Query().Get("query")
	if query == "" {
		query = h.cfg.DefaultEmailQuery
	}

	// Send cached history first for instant UI update
	history, _ := h.userRepo.GetSummariesByQuery(ctx, u.ID, "")
	for _, hist := range history {
		jsonData, _ := json.Marshal(hist)
		_, _ = fmt.Fprintf(w, "data: %s\n\n", jsonData)
	}
	w.(http.Flusher).Flush()

	// Start live stream for new emails
	emailStream, errChan := FetchAndSummarize(ctx, srv, h.userRepo, query, u.ID, SyncOptions{
		MaxResults:            h.cfg.SyncMaxResults,
		IncludeThreadMessages: h.cfg.SyncIncludeThreads,
	})

	foundAny := false

	ticker := time.NewTicker(15 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			// User closed connection
			return
		case err, ok := <-errChan:
			if !ok {
				errChan = nil
				continue
			}
			if err != nil {
				if se, ok := err.(*SyncError); ok {
					sendSSEError(w, se.Code, se.Message)
				} else {
					sendSSEError(w, "SYNC_ERROR", err.Error())
				}
			}
		case summary, ok := <-emailStream:
			if !ok {
				// Channel closed
				if !foundAny {
					sendSSEError(w, "no_emails", "No emails found matching the query")
				}
				// Send completion event
				_, _ = fmt.Fprintf(w, "event: complete\ndata: {\"status\": \"done\"}\n\n")
				w.(http.Flusher).Flush()
				return
			}

			foundAny = true
			jsonData, err := json.Marshal(summary)
			if err != nil {
				log.Printf("Error marshaling AI result: %v", err)
				continue
			}
			_, _ = fmt.Fprintf(w, "data: %s\n\n", jsonData)
			w.(http.Flusher).Flush()
		case <-ticker.C:
			// Heartbeat to keep connection alive
			_, _ = fmt.Fprintf(w, ": heartbeat\n\n")
			w.(http.Flusher).Flush()
		}
	}
}

// GetAttachment proxies a single Gmail attachment's bytes to the client,
// fetched live from Gmail on each request (nothing is stored server-side).
func (h *GmailHandler) GetAttachment(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	userID, ok := ctx.Value(auth.UserIDContextKey).(string)
	if !ok {
		response.Unauthorized(w, "No UserID found in context")
		return
	}

	gmailMessageID := r.PathValue("gmailMessageId")
	attachmentID := r.PathValue("attachmentId")
	if gmailMessageID == "" || attachmentID == "" {
		response.BadRequest(w, "gmailMessageId and attachmentId are required", nil)
		return
	}

	u, err := h.userRepo.FindByID(ctx, userID)
	if err != nil {
		response.NotFound(w, "User not found")
		return
	}
	if u.GoogleRefreshToken == "" {
		response.Unauthorized(w, "Your Gmail authorization has expired. Please log out and log in again.")
		return
	}

	// Resolve filename/mimetype from the cached summary (server-derived,
	// not trusted from the client) rather than re-fetching the full message.
	var filename, mimeType string
	if summary, err := h.userRepo.GetSummary(ctx, gmailMessageID); err == nil && summary != nil {
		for _, att := range summary.Attachments {
			if att.AttachmentId == attachmentID {
				filename = att.Filename
				mimeType = att.MimeType
				break
			}
		}
	}
	if filename == "" {
		response.NotFound(w, "Attachment not found")
		return
	}

	srv, err := google.CreateGmailService(ctx, u.GoogleRefreshToken)
	if err != nil {
		slog.ErrorContext(ctx, "gmail service init failed", "err", err)
		response.InternalError(w, "Failed to connect to Gmail")
		return
	}

	att, err := srv.Users.Messages.Attachments.Get("me", gmailMessageID, attachmentID).Do()
	if err != nil {
		slog.ErrorContext(ctx, "failed to fetch attachment", "err", err)
		response.InternalError(w, "Failed to fetch attachment")
		return
	}

	decoded, err := base64.URLEncoding.DecodeString(att.Data)
	if err != nil {
		slog.ErrorContext(ctx, "failed to decode attachment", "err", err)
		response.InternalError(w, "Failed to decode attachment")
		return
	}

	disposition := "attachment"
	if strings.HasPrefix(mimeType, "image/") || mimeType == "application/pdf" {
		disposition = "inline"
	}

	w.Header().Set("Content-Type", mimeType)
	w.Header().Set("Content-Disposition", fmt.Sprintf(`%s; filename="%s"`, disposition, filename))
	w.Header().Set("Content-Length", strconv.Itoa(len(decoded)))
	_, _ = w.Write(decoded)
}

// sendSSEError sends an error message via SSE
func sendSSEError(w http.ResponseWriter, code, message string) {
	errData := map[string]string{
		"error":   code,
		"message": message,
	}
	jsonData, _ := json.Marshal(errData)
	_, _ = fmt.Fprintf(w, "event: error\ndata: %s\n\n", jsonData)
	w.(http.Flusher).Flush()
}
