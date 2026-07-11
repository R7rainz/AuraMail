package calendar

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/r7rainz/auramail/internal/auth"
	"github.com/r7rainz/auramail/internal/user"
)

type fakeUserRepo struct {
	findByIDFunc func(ctx context.Context, id string) (*user.User, error)
}

func (f *fakeUserRepo) FindByID(ctx context.Context, id string) (*user.User, error) {
	return f.findByIDFunc(ctx, id)
}

func withUserID(req *http.Request, userID string) *http.Request {
	ctx := context.WithValue(req.Context(), auth.UserIDContextKey, userID)
	return req.WithContext(ctx)
}

func TestAddEvent_Unauthorized(t *testing.T) {
	h := NewHandler(&fakeUserRepo{})
	req := httptest.NewRequest(http.MethodPost, "/events", nil)
	rr := httptest.NewRecorder()

	h.AddEvent(rr, req)

	if rr.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401, got %d", rr.Code)
	}
}

func TestAddEvent_MalformedBody(t *testing.T) {
	h := NewHandler(&fakeUserRepo{})
	req := withUserID(httptest.NewRequest(http.MethodPost, "/events", bytes.NewBufferString("{not-json")), "1")
	rr := httptest.NewRecorder()

	h.AddEvent(rr, req)

	if rr.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d", rr.Code)
	}
}

func TestAddEvent_MissingRequiredFields(t *testing.T) {
	h := NewHandler(&fakeUserRepo{})
	body, _ := json.Marshal(AddEventRequest{Title: "", StartTime: ""})
	req := withUserID(httptest.NewRequest(http.MethodPost, "/events", bytes.NewBuffer(body)), "1")
	rr := httptest.NewRecorder()

	h.AddEvent(rr, req)

	if rr.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d", rr.Code)
	}
}

func TestAddEvent_UserNotFound(t *testing.T) {
	repo := &fakeUserRepo{
		findByIDFunc: func(ctx context.Context, id string) (*user.User, error) {
			return nil, errors.New("no rows")
		},
	}
	h := NewHandler(repo)
	body, _ := json.Marshal(AddEventRequest{Title: "Interview", StartTime: "2026-02-15T10:00:00Z"})
	req := withUserID(httptest.NewRequest(http.MethodPost, "/events", bytes.NewBuffer(body)), "1")
	rr := httptest.NewRecorder()

	h.AddEvent(rr, req)

	if rr.Code != http.StatusNotFound {
		t.Fatalf("expected 404, got %d", rr.Code)
	}
}

func TestGetColorForEventType(t *testing.T) {
	tests := []struct {
		eventType string
		want      string
	}{
		{"deadline", "11"},
		{"interview", "7"},
		{"exam", "6"},
		{"event", "9"},
		{"something-else", "1"},
		{"", "1"},
	}

	for _, tt := range tests {
		if got := getColorForEventType(tt.eventType); got != tt.want {
			t.Errorf("getColorForEventType(%q) = %q, want %q", tt.eventType, got, tt.want)
		}
	}
}

func TestDeleteEvent_Unauthorized(t *testing.T) {
	h := NewHandler(&fakeUserRepo{})
	req := httptest.NewRequest(http.MethodDelete, "/events", nil)
	rr := httptest.NewRecorder()

	h.DeleteEvent(rr, req)

	if rr.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401, got %d", rr.Code)
	}
}

func TestDeleteEvent_MissingEventID(t *testing.T) {
	h := NewHandler(&fakeUserRepo{})
	req := withUserID(httptest.NewRequest(http.MethodDelete, "/events", nil), "1")
	rr := httptest.NewRecorder()

	h.DeleteEvent(rr, req)

	if rr.Code != http.StatusBadRequest {
		t.Fatalf("expected 400, got %d", rr.Code)
	}
}

func TestDeleteEvent_UserNotFound(t *testing.T) {
	repo := &fakeUserRepo{
		findByIDFunc: func(ctx context.Context, id string) (*user.User, error) {
			return nil, errors.New("no rows")
		},
	}
	h := NewHandler(repo)
	req := withUserID(httptest.NewRequest(http.MethodDelete, "/events?eventId=abc", nil), "1")
	rr := httptest.NewRecorder()

	h.DeleteEvent(rr, req)

	if rr.Code != http.StatusNotFound {
		t.Fatalf("expected 404, got %d", rr.Code)
	}
}

func TestGetEvents_Unauthorized(t *testing.T) {
	h := NewHandler(&fakeUserRepo{})
	req := httptest.NewRequest(http.MethodGet, "/events", nil)
	rr := httptest.NewRecorder()

	h.GetEvents(rr, req)

	if rr.Code != http.StatusUnauthorized {
		t.Fatalf("expected 401, got %d", rr.Code)
	}
}

func TestGetEvents_UserNotFound(t *testing.T) {
	repo := &fakeUserRepo{
		findByIDFunc: func(ctx context.Context, id string) (*user.User, error) {
			return nil, errors.New("no rows")
		},
	}
	h := NewHandler(repo)
	req := withUserID(httptest.NewRequest(http.MethodGet, "/events", nil), "1")
	rr := httptest.NewRecorder()

	h.GetEvents(rr, req)

	if rr.Code != http.StatusNotFound {
		t.Fatalf("expected 404, got %d", rr.Code)
	}
}
