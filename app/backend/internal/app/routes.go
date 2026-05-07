package app

import (
	"net/http"

	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/r7rainz/auramail/internal/auth"
	authgoogle "github.com/r7rainz/auramail/internal/auth/google"
	"github.com/r7rainz/auramail/internal/calendar"
	"github.com/r7rainz/auramail/internal/config"
	"github.com/r7rainz/auramail/internal/gmail"
	"github.com/r7rainz/auramail/internal/user"
)

// RegisterRoutes mounts all HTTP handlers on mux. db is used for the health handler.
func RegisterRoutes(mux *http.ServeMux, cfg *config.Config, db *pgxpool.Pool) {
	googleCfg := authgoogle.NewOAuthConfig()
	userRepo := user.NewPostgresRepository(db)
	googleHandler := authgoogle.NewHandler(googleCfg, userRepo, cfg.FrontendURL)
	authHandler := auth.NewHandler(googleCfg, userRepo)
	gmailHandler := gmail.NewHandler(cfg, userRepo)
	calendarHandler := calendar.NewHandler(userRepo)

	mux.HandleFunc("/health", healthHandler(db))

	mux.HandleFunc("/auth/google", googleHandler.GoogleAuth)
	mux.HandleFunc("/auth/google/callback", googleHandler.GoogleCallback)
	mux.HandleFunc("POST /auth/refresh", authHandler.Refresh)
	mux.Handle("GET /auth/me", auth.AuthMiddleware(http.HandlerFunc(authHandler.Me)))
	mux.Handle("POST /auth/logout", auth.AuthMiddleware(http.HandlerFunc(authHandler.Logout)))

	mux.Handle("GET /emails", auth.AuthMiddleware(http.HandlerFunc(gmailHandler.GetEmails)))
	mux.Handle("GET /emails/sync", auth.AuthMiddleware(http.HandlerFunc(gmailHandler.SyncPlacementEmails)))
	mux.Handle("GET /emails/stream", auth.AuthMiddleware(http.HandlerFunc(gmailHandler.StreamPlacementEmails)))

	mux.Handle("GET /calendar/events", auth.AuthMiddleware(http.HandlerFunc(calendarHandler.GetEvents)))
	mux.Handle("POST /calendar/events", auth.AuthMiddleware(http.HandlerFunc(calendarHandler.AddEvent)))
	mux.Handle("DELETE /calendar/events", auth.AuthMiddleware(http.HandlerFunc(calendarHandler.DeleteEvent)))
}
