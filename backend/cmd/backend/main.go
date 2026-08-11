package main

import (
	"context"
	"errors"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/joho/godotenv"
	"github.com/r7rainz/auramail/internal/app"
	authgoogle "github.com/r7rainz/auramail/internal/auth/google"
	"github.com/r7rainz/auramail/internal/config"
	"github.com/r7rainz/auramail/internal/gmail"
	"github.com/r7rainz/auramail/internal/scheduler"
	"github.com/r7rainz/auramail/internal/server"
	"github.com/r7rainz/auramail/internal/user"
)

func main() {
	// Load .env from the current working directory if present.
	// Ignored (not an error) when the file is absent, e.g. in production
	// where env vars are provided directly.
	_ = godotenv.Load()

	if err := run(); err != nil {
		slog.Error("backend stopped", "error", err)
		os.Exit(1)
	}
}

func run() error {
	cfg, err := config.Load()
	if err != nil {
		return err
	}

	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	db, err := pgxpool.New(ctx, cfg.DatabaseURL)
	if err != nil {
		return err
	}
	defer db.Close()

	if err := db.Ping(ctx); err != nil {
		return err
	}

	userRepo := user.NewPostgresRepository(db)
	syncScheduler := startEmailSyncScheduler(ctx, cfg, userRepo)
	if syncScheduler != nil {
		defer syncScheduler.Stop()
	}

	mux := http.NewServeMux()
	app.RegisterRoutes(mux, cfg, db)

	addr := ":" + cfg.ServerPort
	srv := server.NewWithDefaults(addr, app.CORS(cfg, mux))

	errCh := make(chan error, 1)
	go func() {
		slog.Info("backend listening", "addr", srv.Addr())
		errCh <- srv.Start()
	}()

	select {
	case <-ctx.Done():
		shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
		defer cancel()
		return srv.Shutdown(shutdownCtx)
	case err := <-errCh:
		if errors.Is(err, http.ErrServerClosed) {
			return nil
		}
		return err
	}
}

func startEmailSyncScheduler(ctx context.Context, cfg *config.Config, userRepo *user.PostgresRepository) *scheduler.Scheduler {
	s := scheduler.New()
	if cfg.SyncEnabled {
		s.AddJob("email_sync", cfg.SyncInterval, func(jobCtx context.Context) error {
			return syncPlacementEmailsForAllUsers(jobCtx, cfg, userRepo)
		})
	} else {
		slog.Info("email sync scheduler disabled")
	}

	const retention = 30 * 24 * time.Hour
	s.AddJob("email_cleanup", 24*time.Hour, func(jobCtx context.Context) error {
		deleted, err := userRepo.DeleteEmailSummariesBefore(
			jobCtx,
			time.Now().Add(-retention),
		)
		if err != nil {
			return err
		}
		slog.Info("old email summaries cleaned up", "deleted", deleted, "retention", retention)
		return nil
	})
	s.Start(ctx)

	slog.Info("background scheduler enabled", "syncEnabled", cfg.SyncEnabled, "syncInterval", cfg.SyncInterval, "retention", retention)
	return s
}

func syncPlacementEmailsForAllUsers(ctx context.Context, cfg *config.Config, userRepo *user.PostgresRepository) error {
	users, err := userRepo.ListUsersWithGoogleRefreshToken(ctx)
	if err != nil {
		return err
	}
	if len(users) == 0 {
		slog.Debug("email sync skipped: no users with google refresh token")
		return nil
	}

	for _, u := range users {
		if err := ctx.Err(); err != nil {
			return err
		}

		gmailService, err := authgoogle.CreateGmailService(ctx, u.GoogleRefreshToken)
		if err != nil {
			slog.Error("scheduled email sync: gmail service init failed", "userID", u.ID, "err", err)
			continue
		}

		processed, err := gmail.SyncUserPlacementEmails(ctx, gmailService, userRepo, cfg.DefaultEmailQuery, u.ID, gmail.SyncOptions{
			MaxResults:            cfg.SyncMaxResults,
			IncludeThreadMessages: cfg.SyncIncludeThreads,
		})
		if err != nil {
			if se, ok := err.(*gmail.SyncError); ok && se.Code == "NO_EMAILS_FOUND" {
				slog.Debug("scheduled email sync: no matching emails", "userID", u.ID, "query", cfg.DefaultEmailQuery)
				continue
			}
			slog.Error("scheduled email sync failed", "userID", u.ID, "err", err, "processed", len(processed))
			continue
		}

		slog.Info("scheduled email sync completed", "userID", u.ID, "processed", len(processed))
	}

	return nil
}
