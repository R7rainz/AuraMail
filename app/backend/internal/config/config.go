package config

import (
	"errors"
	"os"
	"strconv"
	"strings"
	"time"
)

// Config holds all environment-based settings for the service.
type Config struct {
	ServerPort         string
	AllowedOrigins     []string
	DatabaseURL        string
	GooseDBString      string
	JWTSecret          string
	GoogleClientID     string
	GoogleClientSecret string
	GoogleRedirectURL  string
	OpenAIKey          string
	DefaultEmailQuery  string // Configurable default email query for Gmail
	FrontendURL        string // Frontend URL for OAuth redirects
	SyncEnabled        bool
	SyncInterval       time.Duration
	SyncMaxResults     int64
	SyncIncludeThreads bool
}

// Load reads configuration from environment variables and performs basic validation.
func Load() (*Config, error) {
	allowed := parseList(os.Getenv("ALLOWED_ORIGINS"))
	if len(allowed) == 0 {
		allowed = []string{"http://localhost:3000"}
	}

	cfg := &Config{
		ServerPort:         getEnvDefault("PORT", "8080"),
		AllowedOrigins:     allowed,
		DatabaseURL:        os.Getenv("DATABASE_URL"),
		GooseDBString:      os.Getenv("GOOSE_DBSTRING"),
		JWTSecret:          os.Getenv("JWT_SECRET"),
		GoogleClientID:     os.Getenv("GOOGLE_OAUTH_CLIENT_ID"),
		GoogleClientSecret: os.Getenv("GOOGLE_OAUTH_CLIENT_SECRET"),
		GoogleRedirectURL:  os.Getenv("GOOGLE_OAUTH_REDIRECT_URI"),
		OpenAIKey:          os.Getenv("OPENAI_API_KEY"),
		DefaultEmailQuery:  getEnvDefault("DEFAULT_EMAIL_QUERY", `(from:placementoffice@vitbhopal.ac.in OR subject:placement OR subject:internship OR subject:interview OR subject:recruitment OR subject:hiring OR subject:assessment OR subject:shortlist) newer_than:30d`),
		FrontendURL:        getEnvDefault("FRONTEND_URL", "http://localhost:3000"),
		SyncEnabled:        getEnvBoolDefault("SYNC_ENABLED", true),
		SyncInterval:       getEnvDurationDefault("SYNC_INTERVAL", 30*time.Minute),
		SyncMaxResults:     getEnvInt64Default("SYNC_MAX_RESULTS", 25),
		SyncIncludeThreads: getEnvBoolDefault("SYNC_INCLUDE_THREADS", true),
	}

	if err := cfg.Validate(); err != nil {
		return nil, err
	}
	return cfg, nil
}

// Validate enforces required settings.
func (c *Config) Validate() error {
	if c.DatabaseURL == "" {
		return errors.New("DATABASE_URL is required")
	}
	if c.JWTSecret == "" {
		return errors.New("JWT_SECRET is required")
	}
	if c.GoogleClientID == "" || c.GoogleClientSecret == "" || c.GoogleRedirectURL == "" {
		return errors.New("Google OAuth client configuration is required")
	}
	if c.SyncEnabled && c.SyncInterval <= 0 {
		return errors.New("SYNC_INTERVAL must be positive when sync is enabled")
	}
	if c.SyncMaxResults <= 0 {
		return errors.New("SYNC_MAX_RESULTS must be positive")
	}
	return nil
}

func getEnvDefault(key, def string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return def
}

func parseList(val string) []string {
	if val == "" {
		return nil
	}
	parts := strings.Split(val, ",")
	out := make([]string, 0, len(parts))
	for _, p := range parts {
		trimmed := strings.TrimSpace(p)
		if trimmed != "" {
			out = append(out, trimmed)
		}
	}
	return out
}

func getEnvBoolDefault(key string, def bool) bool {
	val := strings.TrimSpace(os.Getenv(key))
	if val == "" {
		return def
	}
	parsed, err := strconv.ParseBool(val)
	if err != nil {
		return def
	}
	return parsed
}

func getEnvDurationDefault(key string, def time.Duration) time.Duration {
	val := strings.TrimSpace(os.Getenv(key))
	if val == "" {
		return def
	}
	parsed, err := time.ParseDuration(val)
	if err != nil {
		return def
	}
	return parsed
}

func getEnvInt64Default(key string, def int64) int64 {
	val := strings.TrimSpace(os.Getenv(key))
	if val == "" {
		return def
	}
	parsed, err := strconv.ParseInt(val, 10, 64)
	if err != nil {
		return def
	}
	return parsed
}
