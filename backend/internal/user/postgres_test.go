package user

import (
	"context"
	"encoding/json"
	"errors"
	"testing"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/pashagolub/pgxmock/v4"

	"github.com/r7rainz/auramail/internal/ai"
)

var userColumns = []string{"id", "email", "name", "provider", "provider_id", "refresh_token", "google_refresh_token", "notifications_enabled"}

func newMockRepo(t *testing.T) (*PostgresRepository, pgxmock.PgxPoolIface) {
	t.Helper()
	mock, err := pgxmock.NewPool()
	if err != nil {
		t.Fatalf("failed to create pgxmock pool: %v", err)
	}
	t.Cleanup(mock.Close)
	return NewPostgresRepository(mock), mock
}

func TestParseUserID(t *testing.T) {
	t.Run("valid numeric id", func(t *testing.T) {
		id, err := parseUserID("42")
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if id != 42 {
			t.Errorf("got %d, want 42", id)
		}
	})

	t.Run("invalid non-numeric id", func(t *testing.T) {
		if _, err := parseUserID("abc"); err == nil {
			t.Fatal("expected error for non-numeric id")
		}
	})
}

func TestScanUser_NullHandling(t *testing.T) {
	mock, err := pgxmock.NewPool()
	if err != nil {
		t.Fatalf("failed to create pgxmock pool: %v", err)
	}
	defer mock.Close()

	rows := pgxmock.NewRows(userColumns).AddRow(
		int64(7), "user@example.com", nil, nil, "provider-id", nil, nil, true,
	)
	mock.ExpectQuery("SELECT").WillReturnRows(rows)

	row := mock.QueryRow(context.Background(), "SELECT id, email, name, provider, provider_id, refresh_token, google_refresh_token FROM users")
	u, err := scanUser(row)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	if u.ID != "7" {
		t.Errorf("ID = %q, want %q", u.ID, "7")
	}
	if u.Email != "user@example.com" {
		t.Errorf("Email = %q, want %q", u.Email, "user@example.com")
	}
	if u.Name != "" || u.Provider != "" || u.RefreshToken != "" || u.GoogleRefreshToken != "" {
		t.Errorf("expected null columns to scan as empty strings, got %+v", u)
	}
	if u.ProviderID != "provider-id" {
		t.Errorf("ProviderID = %q, want %q", u.ProviderID, "provider-id")
	}

	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("unmet expectations: %v", err)
	}
}

func TestFindByID(t *testing.T) {
	t.Run("invalid id does not hit the database", func(t *testing.T) {
		repo, mock := newMockRepo(t)
		if _, err := repo.FindByID(context.Background(), "not-a-number"); err == nil {
			t.Fatal("expected error for invalid id")
		}
		if err := mock.ExpectationsWereMet(); err != nil {
			t.Errorf("unmet expectations: %v", err)
		}
	})

	t.Run("success", func(t *testing.T) {
		repo, mock := newMockRepo(t)
		rows := pgxmock.NewRows(userColumns).AddRow(
			int64(1), "a@b.com", "Alice", "google", "gid-1", "rt", "grt", true,
		)
		mock.ExpectQuery("SELECT id, email, name, provider, provider_id, refresh_token, google_refresh_token, notifications_enabled").
			WithArgs(int64(1)).
			WillReturnRows(rows)

		u, err := repo.FindByID(context.Background(), "1")
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if u.Email != "a@b.com" {
			t.Errorf("Email = %q, want %q", u.Email, "a@b.com")
		}
		if err := mock.ExpectationsWereMet(); err != nil {
			t.Errorf("unmet expectations: %v", err)
		}
	})

	t.Run("not found", func(t *testing.T) {
		repo, mock := newMockRepo(t)
		mock.ExpectQuery("SELECT id, email, name, provider, provider_id, refresh_token, google_refresh_token, notifications_enabled").
			WithArgs(int64(99)).
			WillReturnError(pgx.ErrNoRows)

		if _, err := repo.FindByID(context.Background(), "99"); err == nil {
			t.Fatal("expected error when user not found")
		}
		if err := mock.ExpectationsWereMet(); err != nil {
			t.Errorf("unmet expectations: %v", err)
		}
	})
}

func TestDeleteEmailSummariesBefore(t *testing.T) {
	repo, mock := newMockRepo(t)
	cutoff := time.Date(2026, 8, 1, 0, 0, 0, 0, time.UTC)
	mock.ExpectExec("DELETE FROM email_summaries WHERE created_at < \\$1").
		WithArgs(cutoff).
		WillReturnResult(pgxmock.NewResult("DELETE", 3))

	deleted, err := repo.DeleteEmailSummariesBefore(context.Background(), cutoff)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if deleted != 3 {
		t.Fatalf("deleted = %d, want 3", deleted)
	}
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Fatalf("unmet expectations: %v", err)
	}
}

func TestSave(t *testing.T) {
	repo, mock := newMockRepo(t)
	u := &User{ID: "5", Email: "new@example.com", Name: "New", RefreshToken: "rt"}

	mock.ExpectExec("UPDATE users SET email").
		WithArgs(u.Email, u.Name, u.RefreshToken, int64(5)).
		WillReturnResult(pgxmock.NewResult("UPDATE", 1))

	if err := repo.Save(context.Background(), u); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("unmet expectations: %v", err)
	}
}

func TestFindOrCreateGoogleUser(t *testing.T) {
	t.Run("existing user is returned without insert", func(t *testing.T) {
		repo, mock := newMockRepo(t)
		rows := pgxmock.NewRows(userColumns).AddRow(
			int64(2), "existing@example.com", "Existing", "google", "sub-2", "rt", "grt", true,
		)
		mock.ExpectQuery("SELECT id, email, name, provider, provider_id, refresh_token, google_refresh_token, notifications_enabled").
			WithArgs("existing@example.com").
			WillReturnRows(rows)

		u, err := repo.FindOrCreateGoogleUser(context.Background(), "existing@example.com", "Existing", "sub-2")
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if u.ID != "2" {
			t.Errorf("ID = %q, want %q", u.ID, "2")
		}
		if err := mock.ExpectationsWereMet(); err != nil {
			t.Errorf("unmet expectations: %v", err)
		}
	})

	t.Run("new user is inserted when not found", func(t *testing.T) {
		repo, mock := newMockRepo(t)
		mock.ExpectQuery("SELECT id, email, name, provider, provider_id, refresh_token, google_refresh_token, notifications_enabled").
			WithArgs("new@example.com").
			WillReturnError(pgx.ErrNoRows)

		insertedRows := pgxmock.NewRows(userColumns).AddRow(
			int64(3), "new@example.com", "New", "google", "sub-3", nil, nil, true,
		)
		mock.ExpectQuery("INSERT INTO users").
			WithArgs("new@example.com", "New", "sub-3").
			WillReturnRows(insertedRows)

		u, err := repo.FindOrCreateGoogleUser(context.Background(), "new@example.com", "New", "sub-3")
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if u.ID != "3" {
			t.Errorf("ID = %q, want %q", u.ID, "3")
		}
		if err := mock.ExpectationsWereMet(); err != nil {
			t.Errorf("unmet expectations: %v", err)
		}
	})
}

func TestUpdateRefreshToken(t *testing.T) {
	repo, mock := newMockRepo(t)
	mock.ExpectExec("UPDATE users SET refresh_token").
		WithArgs("new-refresh", int64(10)).
		WillReturnResult(pgxmock.NewResult("UPDATE", 1))

	if err := repo.UpdateRefreshToken(context.Background(), "10", "new-refresh"); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("unmet expectations: %v", err)
	}
}

func TestFindByRefreshToken(t *testing.T) {
	repo, mock := newMockRepo(t)
	rows := pgxmock.NewRows(userColumns).AddRow(
		int64(4), "d@e.com", "D", "google", "sub-4", "tok", "grt", true,
	)
	mock.ExpectQuery("SELECT id, email, name, provider, provider_id, refresh_token, google_refresh_token, notifications_enabled").
		WithArgs("tok").
		WillReturnRows(rows)

	u, err := repo.FindByRefreshToken(context.Background(), "tok")
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if u.ID != "4" {
		t.Errorf("ID = %q, want %q", u.ID, "4")
	}
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("unmet expectations: %v", err)
	}
}

func TestClearRefreshToken(t *testing.T) {
	repo, mock := newMockRepo(t)
	mock.ExpectExec("UPDATE users SET refresh_token = NULL").
		WithArgs(int64(6)).
		WillReturnResult(pgxmock.NewResult("UPDATE", 1))

	if err := repo.ClearRefreshToken(context.Background(), "6"); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("unmet expectations: %v", err)
	}
}

func TestUpdateGoogleRefreshToken(t *testing.T) {
	repo, mock := newMockRepo(t)
	mock.ExpectExec("UPDATE users SET google_refresh_token").
		WithArgs("new-google-token", int64(8)).
		WillReturnResult(pgxmock.NewResult("UPDATE", 1))

	if err := repo.UpdateGoogleRefreshToken(context.Background(), "8", "new-google-token"); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("unmet expectations: %v", err)
	}
}

func TestUpdateNotificationsEnabled(t *testing.T) {
	repo, mock := newMockRepo(t)
	mock.ExpectExec("UPDATE users SET notifications_enabled").
		WithArgs(false, int64(9)).
		WillReturnResult(pgxmock.NewResult("UPDATE", 1))

	if err := repo.UpdateNotificationsEnabled(context.Background(), "9", false); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("unmet expectations: %v", err)
	}
}

func TestListUsersWithGoogleRefreshToken(t *testing.T) {
	repo, mock := newMockRepo(t)
	rows := pgxmock.NewRows(userColumns).
		AddRow(int64(1), "a@x.com", "A", "google", "sub-a", "rt-a", "grt-a", true).
		AddRow(int64(2), "b@x.com", "B", "google", "sub-b", "rt-b", "grt-b", true)
	mock.ExpectQuery("SELECT id, email, name, provider, provider_id, refresh_token, google_refresh_token, notifications_enabled").
		WillReturnRows(rows)

	users, err := repo.ListUsersWithGoogleRefreshToken(context.Background())
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if len(users) != 2 {
		t.Fatalf("got %d users, want 2", len(users))
	}
	if err := mock.ExpectationsWereMet(); err != nil {
		t.Errorf("unmet expectations: %v", err)
	}
}

func TestGetSummary(t *testing.T) {
	repo, mock := newMockRepo(t)
	res := &ai.AIResult{Category: "internship", Summary: "test summary"}

	t.Run("success", func(t *testing.T) {
		data, _ := json.Marshal(res)
		rows := pgxmock.NewRows([]string{"data"}).AddRow(data)
		mock.ExpectQuery("SELECT data FROM email_summaries").
			WithArgs("gmail-1").
			WillReturnRows(rows)

		got, err := repo.GetSummary(context.Background(), "gmail-1")
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if got.Category != res.Category {
			t.Errorf("Category = %q, want %q", got.Category, res.Category)
		}
		if err := mock.ExpectationsWereMet(); err != nil {
			t.Errorf("unmet expectations: %v", err)
		}
	})

	t.Run("not found", func(t *testing.T) {
		mock.ExpectQuery("SELECT data FROM email_summaries").
			WithArgs("missing").
			WillReturnError(pgx.ErrNoRows)

		if _, err := repo.GetSummary(context.Background(), "missing"); !errors.Is(err, pgx.ErrNoRows) {
			t.Fatalf("expected pgx.ErrNoRows, got %v", err)
		}
		if err := mock.ExpectationsWereMet(); err != nil {
			t.Errorf("unmet expectations: %v", err)
		}
	})
}
