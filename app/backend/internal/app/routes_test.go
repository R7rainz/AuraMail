package app

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/r7rainz/auramail/internal/config"
)

func TestRegisterRoutes_ProtectedWithoutAuth(t *testing.T) {
	mux := http.NewServeMux()
	cfg := &config.Config{
		AllowedOrigins: []string{"http://localhost:3000"},
	}
	RegisterRoutes(mux, cfg, nil)

	paths := []struct {
		method string
		path   string
	}{
		{http.MethodGet, "/emails"},
		{http.MethodGet, "/emails/sync"},
		{http.MethodGet, "/emails/stream"},
		{http.MethodGet, "/calendar/events"},
		{http.MethodPost, "/calendar/events"},
		{http.MethodDelete, "/calendar/events"},
		{http.MethodGet, "/auth/me"},
		{http.MethodPost, "/auth/logout"},
	}
	for _, p := range paths {
		req := httptest.NewRequest(p.method, p.path, nil)
		rr := httptest.NewRecorder()
		mux.ServeHTTP(rr, req)
		if rr.Code != http.StatusUnauthorized {
			t.Fatalf("%s %s: want 401, got %d", p.method, p.path, rr.Code)
		}
	}
}

func TestRegisterRoutes_HealthWithoutDB(t *testing.T) {
	mux := http.NewServeMux()
	RegisterRoutes(mux, &config.Config{}, nil)
	req := httptest.NewRequest(http.MethodGet, "/health", nil)
	rr := httptest.NewRecorder()
	mux.ServeHTTP(rr, req)
	if rr.Code != http.StatusServiceUnavailable {
		t.Fatalf("health: %d", rr.Code)
	}
}
