package server

import (
	"context"
	"net/http"
	"testing"
	"time"
)

func TestDefaultConfig(t *testing.T) {
	cfg := DefaultConfig(":8080")

	if cfg.Addr != ":8080" {
		t.Errorf("Addr = %q, want %q", cfg.Addr, ":8080")
	}
	if cfg.ReadTimeout != 5*time.Minute {
		t.Errorf("ReadTimeout = %v, want 5m", cfg.ReadTimeout)
	}
	if cfg.WriteTimeout != 5*time.Minute {
		t.Errorf("WriteTimeout = %v, want 5m", cfg.WriteTimeout)
	}
	if cfg.IdleTimeout != 5*time.Minute {
		t.Errorf("IdleTimeout = %v, want 5m", cfg.IdleTimeout)
	}
}

func TestNewAndAddr(t *testing.T) {
	s := New(DefaultConfig(":9999"), http.NewServeMux())

	if s.Addr() != ":9999" {
		t.Errorf("Addr() = %q, want %q", s.Addr(), ":9999")
	}
}

func TestNewWithDefaults(t *testing.T) {
	s := NewWithDefaults(":8081", http.NewServeMux())

	if s.Addr() != ":8081" {
		t.Errorf("Addr() = %q, want %q", s.Addr(), ":8081")
	}
}

func TestStartAndShutdown(t *testing.T) {
	// Bind to an OS-assigned free port so the test doesn't collide with
	// anything else running locally.
	s := NewWithDefaults("127.0.0.1:0", http.NewServeMux())

	errCh := make(chan error, 1)
	go func() {
		errCh <- s.Start()
	}()

	// Give the listener a moment to come up before shutting down.
	time.Sleep(50 * time.Millisecond)

	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()

	if err := s.Shutdown(ctx); err != nil {
		t.Fatalf("Shutdown returned error: %v", err)
	}

	select {
	case err := <-errCh:
		if err != nil && err != http.ErrServerClosed {
			t.Fatalf("Start returned unexpected error: %v", err)
		}
	case <-time.After(2 * time.Second):
		t.Fatal("Start did not return after Shutdown")
	}
}
