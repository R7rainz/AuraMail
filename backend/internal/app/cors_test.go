package app

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/r7rainz/auramail/internal/config"
)

func TestCORS_AllowsAllUsedHTTPMethods(t *testing.T) {
	cfg := &config.Config{AllowedOrigins: []string{"http://localhost:3000"}}
	handler := CORS(cfg, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	}))

	req := httptest.NewRequest(http.MethodOptions, "/auth/me/notifications", nil)
	req.Header.Set("Origin", "http://localhost:3000")
	rr := httptest.NewRecorder()
	handler.ServeHTTP(rr, req)

	allowed := rr.Header().Get("Access-Control-Allow-Methods")
	// Every HTTP method actually used by a registered route (see routes.go)
	// must be present here, or the browser preflight blocks the real request.
	for _, method := range []string{"GET", "POST", "PATCH", "DELETE"} {
		if !strings.Contains(allowed, method) {
			t.Errorf("Access-Control-Allow-Methods %q missing %q", allowed, method)
		}
	}
}

func TestCORS_SetsAllowOriginForAllowedOrigin(t *testing.T) {
	cfg := &config.Config{AllowedOrigins: []string{"http://localhost:3000"}}
	handler := CORS(cfg, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	}))

	req := httptest.NewRequest(http.MethodGet, "/health", nil)
	req.Header.Set("Origin", "http://localhost:3000")
	rr := httptest.NewRecorder()
	handler.ServeHTTP(rr, req)

	if got := rr.Header().Get("Access-Control-Allow-Origin"); got != "http://localhost:3000" {
		t.Errorf("Access-Control-Allow-Origin = %q, want %q", got, "http://localhost:3000")
	}
}

func TestCORS_OmitsAllowOriginForDisallowedOrigin(t *testing.T) {
	cfg := &config.Config{AllowedOrigins: []string{"http://localhost:3000"}}
	handler := CORS(cfg, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	}))

	req := httptest.NewRequest(http.MethodGet, "/health", nil)
	req.Header.Set("Origin", "http://evil.example.com")
	rr := httptest.NewRecorder()
	handler.ServeHTTP(rr, req)

	if got := rr.Header().Get("Access-Control-Allow-Origin"); got != "" {
		t.Errorf("expected no Access-Control-Allow-Origin, got %q", got)
	}
}
