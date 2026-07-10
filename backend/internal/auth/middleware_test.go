package auth

import (
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestAuthMiddleware_NoHeader(t *testing.T) {
	t.Setenv("JWT_SECRET", "test-secret-for-middleware")
	var saw bool
	h := AuthMiddleware(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		saw = true
	}))
	req := httptest.NewRequest(http.MethodGet, "/x", nil)
	rr := httptest.NewRecorder()
	h.ServeHTTP(rr, req)
	if saw {
		t.Fatal("handler should not run")
	}
	if rr.Code != http.StatusUnauthorized {
		t.Fatalf("status %d", rr.Code)
	}
}

func TestAuthMiddleware_ValidToken(t *testing.T) {
	t.Setenv("JWT_SECRET", "test-secret-for-middleware-32chars!ok")
	tok, err := GenerateAccessToken("user-1", "a@b.test", "A")
	if err != nil {
		t.Fatal(err)
	}
	var uid string
	h := AuthMiddleware(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		uid, _ = r.Context().Value(UserIDContextKey).(string)
		w.WriteHeader(http.StatusOK)
	}))
	req := httptest.NewRequest(http.MethodGet, "/x", nil)
	req.Header.Set("Authorization", "Bearer "+tok)
	rr := httptest.NewRecorder()
	h.ServeHTTP(rr, req)
	if rr.Code != http.StatusOK {
		t.Fatalf("status %d body %s", rr.Code, rr.Body.String())
	}
	if uid != "user-1" {
		t.Fatalf("user id %q", uid)
	}
}

func TestAuthMiddleware_MalformedHeaderUsesJSON(t *testing.T) {
	t.Setenv("JWT_SECRET", "x")
	h := AuthMiddleware(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {}))
	req := httptest.NewRequest(http.MethodGet, "/", nil)
	req.Header.Set("Authorization", "NotBearer x")
	rr := httptest.NewRecorder()
	h.ServeHTTP(rr, req)
	if rr.Code != http.StatusUnauthorized {
		t.Fatalf("got %d", rr.Code)
	}
}
