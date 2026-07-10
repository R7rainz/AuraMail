package config

import (
	"testing"
	"time"
)

// setRequiredEnv sets the minimal set of env vars needed for Load to succeed.
func setRequiredEnv(t *testing.T) {
	t.Helper()
	t.Setenv("DATABASE_URL", "postgres://user:pass@localhost:5432/db")
	t.Setenv("JWT_SECRET", "secret")
	t.Setenv("GOOGLE_OAUTH_CLIENT_ID", "client-id")
	t.Setenv("GOOGLE_OAUTH_CLIENT_SECRET", "client-secret")
	t.Setenv("GOOGLE_OAUTH_REDIRECT_URI", "http://localhost:8080/auth/google/callback")
}

func TestLoad_MissingRequiredVars(t *testing.T) {
	tests := []struct {
		name  string
		unset string
	}{
		{"missing DATABASE_URL", "DATABASE_URL"},
		{"missing JWT_SECRET", "JWT_SECRET"},
		{"missing GOOGLE_OAUTH_CLIENT_ID", "GOOGLE_OAUTH_CLIENT_ID"},
		{"missing GOOGLE_OAUTH_CLIENT_SECRET", "GOOGLE_OAUTH_CLIENT_SECRET"},
		{"missing GOOGLE_OAUTH_REDIRECT_URI", "GOOGLE_OAUTH_REDIRECT_URI"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			setRequiredEnv(t)
			t.Setenv(tt.unset, "")

			cfg, err := Load()
			if err == nil {
				t.Fatalf("expected error when %s is unset, got nil (cfg=%+v)", tt.unset, cfg)
			}
		})
	}
}

func TestLoad_SyncValidation(t *testing.T) {
	t.Run("sync enabled with zero interval fails", func(t *testing.T) {
		setRequiredEnv(t)
		t.Setenv("SYNC_ENABLED", "true")
		t.Setenv("SYNC_INTERVAL", "0")

		if _, err := Load(); err == nil {
			t.Fatal("expected error for zero SYNC_INTERVAL with sync enabled")
		}
	})

	t.Run("sync disabled with zero interval succeeds", func(t *testing.T) {
		setRequiredEnv(t)
		t.Setenv("SYNC_ENABLED", "false")
		t.Setenv("SYNC_INTERVAL", "0")

		if _, err := Load(); err != nil {
			t.Fatalf("expected no error when sync disabled, got %v", err)
		}
	})

	t.Run("non-positive SYNC_MAX_RESULTS fails", func(t *testing.T) {
		setRequiredEnv(t)
		t.Setenv("SYNC_MAX_RESULTS", "0")

		if _, err := Load(); err == nil {
			t.Fatal("expected error for non-positive SYNC_MAX_RESULTS")
		}
	})
}

func TestLoad_Defaults(t *testing.T) {
	setRequiredEnv(t)

	cfg, err := Load()
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if cfg.ServerPort != "8080" {
		t.Errorf("expected default PORT 8080, got %q", cfg.ServerPort)
	}
	if len(cfg.AllowedOrigins) != 1 || cfg.AllowedOrigins[0] != "http://localhost:3000" {
		t.Errorf("expected default ALLOWED_ORIGINS, got %v", cfg.AllowedOrigins)
	}
	if cfg.FrontendURL != "http://localhost:3000" {
		t.Errorf("expected default FRONTEND_URL, got %q", cfg.FrontendURL)
	}
	if !cfg.SyncEnabled {
		t.Error("expected SyncEnabled to default true")
	}
	if cfg.SyncInterval != 30*time.Minute {
		t.Errorf("expected default SyncInterval 30m, got %v", cfg.SyncInterval)
	}
	if cfg.SyncMaxResults != 25 {
		t.Errorf("expected default SyncMaxResults 25, got %d", cfg.SyncMaxResults)
	}
	if !cfg.SyncIncludeThreads {
		t.Error("expected SyncIncludeThreads to default true")
	}
}

func TestLoad_OverridesDefaults(t *testing.T) {
	setRequiredEnv(t)
	t.Setenv("PORT", "9090")
	t.Setenv("ALLOWED_ORIGINS", "http://a.com, http://b.com ,")
	t.Setenv("SYNC_ENABLED", "false")
	t.Setenv("SYNC_INTERVAL", "1h")
	t.Setenv("SYNC_MAX_RESULTS", "50")
	t.Setenv("SYNC_INCLUDE_THREADS", "false")

	cfg, err := Load()
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if cfg.ServerPort != "9090" {
		t.Errorf("expected PORT override 9090, got %q", cfg.ServerPort)
	}
	wantOrigins := []string{"http://a.com", "http://b.com"}
	if len(cfg.AllowedOrigins) != len(wantOrigins) || cfg.AllowedOrigins[0] != wantOrigins[0] || cfg.AllowedOrigins[1] != wantOrigins[1] {
		t.Errorf("expected parsed origins %v, got %v", wantOrigins, cfg.AllowedOrigins)
	}
	if cfg.SyncEnabled {
		t.Error("expected SyncEnabled false")
	}
	if cfg.SyncInterval != time.Hour {
		t.Errorf("expected SyncInterval 1h, got %v", cfg.SyncInterval)
	}
	if cfg.SyncMaxResults != 50 {
		t.Errorf("expected SyncMaxResults 50, got %d", cfg.SyncMaxResults)
	}
	if cfg.SyncIncludeThreads {
		t.Error("expected SyncIncludeThreads false")
	}
}

func TestParseList(t *testing.T) {
	tests := []struct {
		name string
		in   string
		want []string
	}{
		{"empty string", "", nil},
		{"single value", "a", []string{"a"}},
		{"multiple values with spaces", " a , b ,c", []string{"a", "b", "c"}},
		{"only commas and spaces", " , , ", nil},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := parseList(tt.in)
			if len(got) != len(tt.want) {
				t.Fatalf("parseList(%q) = %v, want %v", tt.in, got, tt.want)
			}
			for i := range got {
				if got[i] != tt.want[i] {
					t.Errorf("parseList(%q)[%d] = %q, want %q", tt.in, i, got[i], tt.want[i])
				}
			}
		})
	}
}

func TestGetEnvBoolDefault(t *testing.T) {
	t.Run("unset returns default", func(t *testing.T) {
		t.Setenv("BOOL_VAR", "")
		if got := getEnvBoolDefault("BOOL_VAR", true); got != true {
			t.Errorf("got %v, want true", got)
		}
	})
	t.Run("invalid falls back to default", func(t *testing.T) {
		t.Setenv("BOOL_VAR", "not-a-bool")
		if got := getEnvBoolDefault("BOOL_VAR", false); got != false {
			t.Errorf("got %v, want false", got)
		}
	})
	t.Run("valid value parsed", func(t *testing.T) {
		t.Setenv("BOOL_VAR", "true")
		if got := getEnvBoolDefault("BOOL_VAR", false); got != true {
			t.Errorf("got %v, want true", got)
		}
	})
}

func TestGetEnvDurationDefault(t *testing.T) {
	t.Run("unset returns default", func(t *testing.T) {
		t.Setenv("DUR_VAR", "")
		if got := getEnvDurationDefault("DUR_VAR", 5*time.Minute); got != 5*time.Minute {
			t.Errorf("got %v, want 5m", got)
		}
	})
	t.Run("invalid falls back to default", func(t *testing.T) {
		t.Setenv("DUR_VAR", "not-a-duration")
		if got := getEnvDurationDefault("DUR_VAR", 5*time.Minute); got != 5*time.Minute {
			t.Errorf("got %v, want 5m", got)
		}
	})
	t.Run("valid value parsed", func(t *testing.T) {
		t.Setenv("DUR_VAR", "2h")
		if got := getEnvDurationDefault("DUR_VAR", 5*time.Minute); got != 2*time.Hour {
			t.Errorf("got %v, want 2h", got)
		}
	})
}

func TestGetEnvInt64Default(t *testing.T) {
	t.Run("unset returns default", func(t *testing.T) {
		t.Setenv("INT_VAR", "")
		if got := getEnvInt64Default("INT_VAR", 10); got != 10 {
			t.Errorf("got %d, want 10", got)
		}
	})
	t.Run("invalid falls back to default", func(t *testing.T) {
		t.Setenv("INT_VAR", "not-an-int")
		if got := getEnvInt64Default("INT_VAR", 10); got != 10 {
			t.Errorf("got %d, want 10", got)
		}
	})
	t.Run("valid value parsed", func(t *testing.T) {
		t.Setenv("INT_VAR", "99")
		if got := getEnvInt64Default("INT_VAR", 10); got != 99 {
			t.Errorf("got %d, want 99", got)
		}
	})
}
