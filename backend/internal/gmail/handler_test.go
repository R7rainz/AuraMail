package gmail

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/jackc/pgx/v5"

	"github.com/r7rainz/auramail/internal/ai"
	"github.com/r7rainz/auramail/internal/auth"
	"github.com/r7rainz/auramail/internal/config"
	"github.com/r7rainz/auramail/internal/user"
)

func TestDecodeGmailAttachmentAcceptsPaddedAndRawData(t *testing.T) {
	want := []byte("attachment bytes")

	for _, encoded := range []string{
		base64.RawURLEncoding.EncodeToString(want),
		base64.URLEncoding.EncodeToString(want),
	} {
		got, err := decodeGmailAttachment(encoded)
		if err != nil {
			t.Fatalf("decodeGmailAttachment() error = %v", err)
		}
		if string(got) != string(want) {
			t.Fatalf("decodeGmailAttachment() = %q, want %q", got, want)
		}
	}
}

// fakeUserRepo is a hand-rolled fake implementing gmail.UserRepository for
// handler tests, avoiding the need for a real database.
type fakeUserRepo struct {
	findByIDFunc            func(ctx context.Context, id string) (*user.User, error)
	getSummariesByQueryFunc func(ctx context.Context, userID, searchQuery string) ([]*ai.AIResult, error)
	getSummaryFunc          func(ctx context.Context, gmailID string) (*ai.AIResult, error)
	setImportantFunc        func(ctx context.Context, userID, gmailID string, important bool) error
}

func (f *fakeUserRepo) FindByID(ctx context.Context, id string) (*user.User, error) {
	return f.findByIDFunc(ctx, id)
}

func (f *fakeUserRepo) GetSummariesByQuery(ctx context.Context, userID, searchQuery string) ([]*ai.AIResult, error) {
	return f.getSummariesByQueryFunc(ctx, userID, searchQuery)
}

func (f *fakeUserRepo) GetSummary(ctx context.Context, gmailID string) (*ai.AIResult, error) {
	if f.getSummaryFunc != nil {
		return f.getSummaryFunc(ctx, gmailID)
	}
	return nil, errors.New("not implemented")
}

func (f *fakeUserRepo) SaveSummary(ctx context.Context, userID, gmailID string, res *ai.AIResult) error {
	return errors.New("not implemented")
}

func (f *fakeUserRepo) SetImportant(ctx context.Context, userID, gmailID string, important bool) error {
	if f.setImportantFunc != nil {
		return f.setImportantFunc(ctx, userID, gmailID, important)
	}
	return errors.New("not implemented")
}

func newTestHandler(repo UserRepository) *GmailHandler {
	return NewHandler(&config.Config{}, repo)
}

func TestGetEmails_Unauthorized(t *testing.T) {
	h := newTestHandler(&fakeUserRepo{})
	req := httptest.NewRequest(http.MethodGet, "/emails", nil)
	rr := httptest.NewRecorder()

	h.GetEmails(rr, req)

	if rr.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401, got %d", rr.Code)
	}
}

func TestGetEmails_RepoError(t *testing.T) {
	repo := &fakeUserRepo{
		getSummariesByQueryFunc: func(ctx context.Context, userID, searchQuery string) ([]*ai.AIResult, error) {
			return nil, errors.New("db down")
		},
	}
	h := newTestHandler(repo)

	req := httptest.NewRequest(http.MethodGet, "/emails", nil)
	ctx := context.WithValue(req.Context(), auth.UserIDContextKey, "1")
	req = req.WithContext(ctx)
	rr := httptest.NewRecorder()

	h.GetEmails(rr, req)

	if rr.Code != http.StatusInternalServerError {
		t.Fatalf("expected 500, got %d", rr.Code)
	}
}

func TestGetEmails_Success(t *testing.T) {
	company := "Acme"
	repo := &fakeUserRepo{
		getSummariesByQueryFunc: func(ctx context.Context, userID, searchQuery string) ([]*ai.AIResult, error) {
			return []*ai.AIResult{
				{GmailMessageID: "m1", Subject: "Interview", Sender: "hr@acme.com", Company: &company, Summary: "sum"},
			}, nil
		},
	}
	h := newTestHandler(repo)

	req := httptest.NewRequest(http.MethodGet, "/emails", nil)
	ctx := context.WithValue(req.Context(), auth.UserIDContextKey, "1")
	req = req.WithContext(ctx)
	rr := httptest.NewRecorder()

	h.GetEmails(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", rr.Code)
	}

	var body map[string]any
	if err := json.NewDecoder(rr.Body).Decode(&body); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}
	if body["total"].(float64) != 1 {
		t.Errorf("expected total=1, got %v", body["total"])
	}
	if body["page"].(float64) != 1 {
		t.Errorf("expected page=1, got %v", body["page"])
	}
}

func TestSyncPlacementEmails_Unauthorized(t *testing.T) {
	h := newTestHandler(&fakeUserRepo{})
	req := httptest.NewRequest(http.MethodPost, "/sync", nil)
	rr := httptest.NewRecorder()

	h.SyncPlacementEmails(rr, req)

	if rr.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401, got %d", rr.Code)
	}
	var body map[string]any
	_ = json.NewDecoder(rr.Body).Decode(&body)
	if body["error"] != "UNAUTHORIZED" {
		t.Errorf("expected UNAUTHORIZED error code, got %v", body["error"])
	}
}

func TestSyncPlacementEmails_UserNotFound(t *testing.T) {
	repo := &fakeUserRepo{
		findByIDFunc: func(ctx context.Context, id string) (*user.User, error) {
			return nil, errors.New("no rows")
		},
	}
	h := newTestHandler(repo)

	req := httptest.NewRequest(http.MethodPost, "/sync", nil)
	ctx := context.WithValue(req.Context(), auth.UserIDContextKey, "1")
	req = req.WithContext(ctx)
	rr := httptest.NewRecorder()

	h.SyncPlacementEmails(rr, req)

	if rr.Code != http.StatusNotFound {
		t.Fatalf("expected 404, got %d", rr.Code)
	}
	var body map[string]any
	_ = json.NewDecoder(rr.Body).Decode(&body)
	if body["error"] != "USER_NOT_FOUND" {
		t.Errorf("expected USER_NOT_FOUND error code, got %v", body["error"])
	}
}

func TestSyncPlacementEmails_MissingRefreshToken(t *testing.T) {
	repo := &fakeUserRepo{
		findByIDFunc: func(ctx context.Context, id string) (*user.User, error) {
			return &user.User{ID: "1", Email: "a@b.com", GoogleRefreshToken: ""}, nil
		},
	}
	h := newTestHandler(repo)

	req := httptest.NewRequest(http.MethodPost, "/sync", nil)
	ctx := context.WithValue(req.Context(), auth.UserIDContextKey, "1")
	req = req.WithContext(ctx)
	rr := httptest.NewRecorder()

	h.SyncPlacementEmails(rr, req)

	if rr.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401, got %d", rr.Code)
	}
	var body map[string]any
	_ = json.NewDecoder(rr.Body).Decode(&body)
	if body["error"] != "INVALID_REFRESH_TOKEN" {
		t.Errorf("expected INVALID_REFRESH_TOKEN error code, got %v", body["error"])
	}
}

func TestStreamPlacementEmails_MissingUserID(t *testing.T) {
	h := newTestHandler(&fakeUserRepo{})
	req := httptest.NewRequest(http.MethodGet, "/stream", nil)
	rr := httptest.NewRecorder()

	h.StreamPlacementEmails(rr, req)

	body := rr.Body.String()
	if rr.Header().Get("Content-Type") != "text/event-stream" {
		t.Errorf("expected SSE content type, got %q", rr.Header().Get("Content-Type"))
	}
	if !containsAll(body, "event: error", "unauthorized") {
		t.Errorf("expected unauthorized SSE error event, got body: %q", body)
	}
}

func TestStreamPlacementEmails_UserNotFound(t *testing.T) {
	repo := &fakeUserRepo{
		findByIDFunc: func(ctx context.Context, id string) (*user.User, error) {
			return nil, errors.New("no rows")
		},
	}
	h := newTestHandler(repo)

	req := httptest.NewRequest(http.MethodGet, "/stream", nil)
	ctx := context.WithValue(req.Context(), auth.UserIDContextKey, "1")
	req = req.WithContext(ctx)
	rr := httptest.NewRecorder()

	h.StreamPlacementEmails(rr, req)

	body := rr.Body.String()
	if !containsAll(body, "event: error", "not_found") {
		t.Errorf("expected not_found SSE error event, got body: %q", body)
	}
}

func TestStreamPlacementEmails_MissingRefreshToken(t *testing.T) {
	repo := &fakeUserRepo{
		findByIDFunc: func(ctx context.Context, id string) (*user.User, error) {
			return &user.User{ID: "1", Email: "a@b.com", GoogleRefreshToken: ""}, nil
		},
	}
	h := newTestHandler(repo)

	req := httptest.NewRequest(http.MethodGet, "/stream", nil)
	ctx := context.WithValue(req.Context(), auth.UserIDContextKey, "1")
	req = req.WithContext(ctx)
	rr := httptest.NewRecorder()

	h.StreamPlacementEmails(rr, req)

	body := rr.Body.String()
	if !containsAll(body, "event: error", "auth_error") {
		t.Errorf("expected auth_error SSE error event, got body: %q", body)
	}
}

func TestGetAttachment_Unauthorized(t *testing.T) {
	h := newTestHandler(&fakeUserRepo{})
	req := httptest.NewRequest(http.MethodGet, "/emails/msg-1/attachments/att-1", nil)
	rr := httptest.NewRecorder()

	h.GetAttachment(rr, req)

	if rr.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401, got %d", rr.Code)
	}
}

func TestGetAttachment_MissingPathParams(t *testing.T) {
	h := newTestHandler(&fakeUserRepo{})
	req := httptest.NewRequest(http.MethodGet, "/emails//attachments/", nil)
	ctx := context.WithValue(req.Context(), auth.UserIDContextKey, "1")
	req = req.WithContext(ctx)
	rr := httptest.NewRecorder()

	h.GetAttachment(rr, req)

	if rr.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d", rr.Code)
	}
}

func TestGetAttachment_UserNotFound(t *testing.T) {
	repo := &fakeUserRepo{
		findByIDFunc: func(ctx context.Context, id string) (*user.User, error) {
			return nil, errors.New("no rows")
		},
	}
	h := newTestHandler(repo)

	req := httptest.NewRequest(http.MethodGet, "/emails/msg-1/attachments/att-1", nil)
	req.SetPathValue("gmailMessageId", "msg-1")
	req.SetPathValue("attachmentId", "att-1")
	ctx := context.WithValue(req.Context(), auth.UserIDContextKey, "1")
	req = req.WithContext(ctx)
	rr := httptest.NewRecorder()

	h.GetAttachment(rr, req)

	if rr.Code != http.StatusNotFound {
		t.Fatalf("expected 404, got %d", rr.Code)
	}
}

func TestGetAttachment_MissingRefreshToken(t *testing.T) {
	repo := &fakeUserRepo{
		findByIDFunc: func(ctx context.Context, id string) (*user.User, error) {
			return &user.User{ID: "1", Email: "a@b.com", GoogleRefreshToken: ""}, nil
		},
	}
	h := newTestHandler(repo)

	req := httptest.NewRequest(http.MethodGet, "/emails/msg-1/attachments/att-1", nil)
	req.SetPathValue("gmailMessageId", "msg-1")
	req.SetPathValue("attachmentId", "att-1")
	ctx := context.WithValue(req.Context(), auth.UserIDContextKey, "1")
	req = req.WithContext(ctx)
	rr := httptest.NewRecorder()

	h.GetAttachment(rr, req)

	if rr.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401, got %d", rr.Code)
	}
}

func TestGetAttachment_NotFoundInSummary(t *testing.T) {
	repo := &fakeUserRepo{
		findByIDFunc: func(ctx context.Context, id string) (*user.User, error) {
			return &user.User{ID: "1", Email: "a@b.com", GoogleRefreshToken: "rt"}, nil
		},
		getSummaryFunc: func(ctx context.Context, gmailID string) (*ai.AIResult, error) {
			return &ai.AIResult{GmailMessageID: gmailID, Attachments: nil}, nil
		},
	}
	h := newTestHandler(repo)

	req := httptest.NewRequest(http.MethodGet, "/emails/msg-1/attachments/att-1", nil)
	req.SetPathValue("gmailMessageId", "msg-1")
	req.SetPathValue("attachmentId", "att-1")
	ctx := context.WithValue(req.Context(), auth.UserIDContextKey, "1")
	req = req.WithContext(ctx)
	rr := httptest.NewRecorder()

	h.GetAttachment(rr, req)

	if rr.Code != http.StatusNotFound {
		t.Fatalf("expected 404, got %d", rr.Code)
	}
}

func TestSetImportant_Unauthorized(t *testing.T) {
	h := newTestHandler(&fakeUserRepo{})
	req := httptest.NewRequest(http.MethodPatch, "/emails/m1/important", strings.NewReader(`{"important":true}`))
	rr := httptest.NewRecorder()

	h.SetImportant(rr, req)

	if rr.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401, got %d", rr.Code)
	}
}

func TestSetImportant_InvalidBody(t *testing.T) {
	h := newTestHandler(&fakeUserRepo{})
	req := httptest.NewRequest(http.MethodPatch, "/emails/m1/important", strings.NewReader(`not json`))
	req.SetPathValue("gmailMessageId", "m1")
	ctx := context.WithValue(req.Context(), auth.UserIDContextKey, "1")
	req = req.WithContext(ctx)
	rr := httptest.NewRecorder()

	h.SetImportant(rr, req)

	if rr.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d", rr.Code)
	}
}

func TestSetImportant_NotFound(t *testing.T) {
	repo := &fakeUserRepo{
		setImportantFunc: func(ctx context.Context, userID, gmailID string, important bool) error {
			return pgx.ErrNoRows
		},
	}
	h := newTestHandler(repo)

	req := httptest.NewRequest(http.MethodPatch, "/emails/missing/important", strings.NewReader(`{"important":true}`))
	req.SetPathValue("gmailMessageId", "missing")
	ctx := context.WithValue(req.Context(), auth.UserIDContextKey, "1")
	req = req.WithContext(ctx)
	rr := httptest.NewRecorder()

	h.SetImportant(rr, req)

	if rr.Code != http.StatusNotFound {
		t.Fatalf("expected 404, got %d", rr.Code)
	}
}

func TestSetImportant_Success(t *testing.T) {
	var gotImportant bool
	var gotGmailID string
	repo := &fakeUserRepo{
		setImportantFunc: func(ctx context.Context, userID, gmailID string, important bool) error {
			gotGmailID = gmailID
			gotImportant = important
			return nil
		},
	}
	h := newTestHandler(repo)

	req := httptest.NewRequest(http.MethodPatch, "/emails/m1/important", strings.NewReader(`{"important":true}`))
	req.SetPathValue("gmailMessageId", "m1")
	ctx := context.WithValue(req.Context(), auth.UserIDContextKey, "1")
	req = req.WithContext(ctx)
	rr := httptest.NewRecorder()

	h.SetImportant(rr, req)

	if rr.Code != http.StatusOK {
		t.Fatalf("expected 200, got %d", rr.Code)
	}
	if gotGmailID != "m1" || !gotImportant {
		t.Errorf("expected repo called with (m1, true), got (%s, %v)", gotGmailID, gotImportant)
	}

	var body map[string]any
	if err := json.NewDecoder(rr.Body).Decode(&body); err != nil {
		t.Fatalf("failed to decode response: %v", err)
	}
	if body["important"] != true {
		t.Errorf("expected important=true in response, got %v", body["important"])
	}
}

func containsAll(s string, substrs ...string) bool {
	for _, sub := range substrs {
		if !strings.Contains(s, sub) {
			return false
		}
	}
	return true
}
