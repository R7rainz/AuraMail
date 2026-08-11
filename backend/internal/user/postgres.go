package user

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"strconv"
	"time"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"

	"github.com/r7rainz/auramail/internal/ai"
)

// dbConn is the subset of *pgxpool.Pool used by PostgresRepository. Narrowing
// to an interface allows tests to substitute a mock (e.g. pgxmock) in place
// of a real connection pool.
type dbConn interface {
	Exec(ctx context.Context, sql string, args ...any) (pgconn.CommandTag, error)
	Query(ctx context.Context, sql string, args ...any) (pgx.Rows, error)
	QueryRow(ctx context.Context, sql string, args ...any) pgx.Row
}

type PostgresRepository struct {
	db dbConn
}

func scanUser(row pgx.Row) (*User, error) {
	var (
		id                 int64
		u                  User
		name               sql.NullString
		provider           sql.NullString
		refreshToken       sql.NullString
		googleRefreshToken sql.NullString
	)

	err := row.Scan(
		&id,
		&u.Email,
		&name,
		&provider,
		&u.ProviderID,
		&refreshToken,
		&googleRefreshToken,
		&u.NotificationsEnabled,
	)
	if err != nil {
		return nil, err
	}

	u.ID = strconv.FormatInt(id, 10)
	u.Name = name.String
	u.Provider = provider.String
	u.RefreshToken = refreshToken.String
	u.GoogleRefreshToken = googleRefreshToken.String
	return &u, nil
}

func parseUserID(userID string) (int64, error) {
	id, err := strconv.ParseInt(userID, 10, 64)
	if err != nil {
		return 0, fmt.Errorf("invalid user id %q: %w", userID, err)
	}
	return id, nil
}

func (r *PostgresRepository) FindByID(ctx context.Context, id string) (*User, error) {
	log.Printf("DB QUERY: Looking for ID [%s]", id)

	userID, err := parseUserID(id)
	if err != nil {
		return nil, err
	}

	query := `SELECT id, email, name, provider, provider_id, refresh_token, google_refresh_token, notifications_enabled
	          FROM users WHERE id = $1;`

	u, err := scanUser(r.db.QueryRow(ctx, query, userID))
	if err != nil {
		log.Printf("DB ERROR for ID %s: %v", id, err)
		return nil, err
	}

	log.Printf("DB SUCCESS: Found user %s", u.Email)
	return u, nil
}

// Save implements [Repository].
func (r *PostgresRepository) Save(ctx context.Context, user *User) error {
	userID, err := parseUserID(user.ID)
	if err != nil {
		return err
	}

	query := `UPDATE users SET email = $1, name = $2, refresh_token = $3 WHERE id = $4;`

	_, err = r.db.Exec(ctx, query, user.Email, user.Name, user.RefreshToken, userID)
	return err
}

func NewPostgresRepository(db dbConn) *PostgresRepository {
	return &PostgresRepository{db: db}
}

func (r *PostgresRepository) FindOrCreateGoogleUser(ctx context.Context, email, name, sub string) (*User, error) {
	query := `SELECT id, email, name, provider, provider_id, refresh_token, google_refresh_token, notifications_enabled
	          FROM users WHERE email = $1`
	u, err := scanUser(r.db.QueryRow(ctx, query, email))

	if err == nil {
		return u, nil
	}

	insertQuery := `INSERT INTO users (email, name, provider, provider_id)
	                VALUES ($1, $2, 'google', $3)
	                RETURNING id, email, name, provider, provider_id, refresh_token, google_refresh_token, notifications_enabled`
	u, err = scanUser(r.db.QueryRow(ctx, insertQuery, email, name, sub))
	if err != nil {
		return nil, err
	}

	return u, nil
}

func (r *PostgresRepository) UpdateRefreshToken(
	ctx context.Context,
	userID string,
	refreshToken string,
) error {
	id, err := parseUserID(userID)
	if err != nil {
		return err
	}

	query := `UPDATE users SET refresh_token = $1 WHERE id = $2;`

	_, err = r.db.Exec(ctx, query, refreshToken, id)
	if err != nil {
		return fmt.Errorf("failed to update refresh token for user %s: %w", userID, err)
	}

	return nil
}

func (r *PostgresRepository) FindByRefreshToken(ctx context.Context, token string) (*User, error) {
	query := `SELECT id, email, name, provider, provider_id, refresh_token, google_refresh_token, notifications_enabled
	          FROM users WHERE refresh_token = $1;`

	u, err := scanUser(r.db.QueryRow(ctx, query, token))
	if err != nil {
		return nil, fmt.Errorf("failed to find user by refresh token: %w", err)
	}

	return u, nil
}

func (r *PostgresRepository) ClearRefreshToken(ctx context.Context, userID string) error {
	id, err := parseUserID(userID)
	if err != nil {
		return err
	}

	query := `UPDATE users SET refresh_token = NULL WHERE id = $1;`
	_, err = r.db.Exec(ctx, query, id)
	if err != nil {
		return fmt.Errorf("failed to clear refresh token for user %s: %w", userID, err)
	}

	return nil
}

func (r *PostgresRepository) GetSummary(ctx context.Context, gmailID string) (*ai.AIResult, error) {
	// Query the JSONB column from the correct table
	query := `SELECT data FROM email_summaries WHERE gmail_id = $1`

	var jsonData []byte
	err := r.db.QueryRow(ctx, query, gmailID).Scan(&jsonData)
	if err != nil {
		return nil, err
	}

	// Unmarshal the JSON directly into your struct
	var res ai.AIResult
	if err := json.Unmarshal(jsonData, &res); err != nil {
		return nil, err
	}

	return &res, nil
}

func (r *PostgresRepository) SaveSummary(ctx context.Context, userID string, gmailID string, res *ai.AIResult) error {
	id, err := parseUserID(userID)
	if err != nil {
		return err
	}

	jsonData, err := json.Marshal(res)
	if err != nil {
		return fmt.Errorf("failed to marshal AI result: %w", err)
	}

	query := `
		INSERT INTO email_summaries (user_id, gmail_id, thread_id, category, company, role, summary, deadline, apply_link, data)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
		ON CONFLICT (gmail_id) DO UPDATE SET
			thread_id = EXCLUDED.thread_id,
			category = EXCLUDED.category,
			company = EXCLUDED.company,
			role = EXCLUDED.role,
			summary = EXCLUDED.summary,
			deadline = EXCLUDED.deadline,
			apply_link = EXCLUDED.apply_link,
			data = jsonb_set(EXCLUDED.data, '{important}', to_jsonb(email_summaries.important), true)`

	// eligibility, _ := json.Marshal(res.Eligibility)
	// timings, _ := json.Marshal(res.Timings)
	// salary, _ := json.Marshal(res.Salary)
	// location, _ := json.Marshal(res.Location)

	_, err = r.db.Exec(ctx, query,
		id,            // $1
		gmailID,       // $2
		res.ThreadID,  // $3
		res.Category,  // $4
		res.Company,   // $5
		res.Role,      // $6
		res.Summary,   // $7
		res.Deadline,  // $8
		res.ApplyLink, // $9
		jsonData,      // $10 (The JSONB payload)
	)
	if err != nil {
		return fmt.Errorf("failed to save summary to db: %w", err)
	}
	return nil
}

func (r *PostgresRepository) GetSummariesByQuery(ctx context.Context, userID string, searchQuery string) ([]*ai.AIResult, error) {
	id, err := parseUserID(userID)
	if err != nil {
		return nil, err
	}

	// Query the JSONB column, utilizing the correct column names (user_id, created_at)
	query := `
		SELECT data 
		FROM email_summaries 
		WHERE user_id = $1 
		AND (summary ILIKE $2 OR company ILIKE $2 OR role ILIKE $2) 
		ORDER BY created_at DESC 
		LIMIT 50`

	rows, err := r.db.Query(ctx, query, id, "%"+searchQuery+"%")
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var results []*ai.AIResult
	for rows.Next() {
		var jsonData []byte

		// Scan the single JSONB column
		if err := rows.Scan(&jsonData); err != nil {
			continue
		}

		// Unmarshal into the struct
		var res ai.AIResult
		if err := json.Unmarshal(jsonData, &res); err != nil {
			continue
		}

		results = append(results, &res)
	}

	return results, nil
}

// SetImportant flips the important flag for a user's email, keeping both
// the denormalized `important` column and the `data` JSONB blob in sync —
// GetSummary/GetSummariesByQuery only ever read `data`, so the JSONB copy
// is the one that actually matters for API responses.
func (r *PostgresRepository) SetImportant(ctx context.Context, userID string, gmailID string, important bool) error {
	id, err := parseUserID(userID)
	if err != nil {
		return err
	}

	query := `
		UPDATE email_summaries
		SET important = $1, data = jsonb_set(data, '{important}', to_jsonb($1::boolean), true)
		WHERE user_id = $2 AND gmail_id = $3`

	tag, err := r.db.Exec(ctx, query, important, id, gmailID)
	if err != nil {
		return fmt.Errorf("failed to update important flag: %w", err)
	}
	if tag.RowsAffected() == 0 {
		return pgx.ErrNoRows
	}
	return nil
}

func (r *PostgresRepository) DeleteEmailSummariesBefore(ctx context.Context, before time.Time) (int64, error) {
	tag, err := r.db.Exec(ctx,
		`DELETE FROM email_summaries WHERE created_at < $1`,
		before,
	)
	if err != nil {
		return 0, fmt.Errorf("failed to delete old email summaries: %w", err)
	}
	return tag.RowsAffected(), nil
}

func (r *PostgresRepository) UpdateGoogleRefreshToken(ctx context.Context, userID string, token string) error {
	id, err := parseUserID(userID)
	if err != nil {
		return err
	}

	query := `UPDATE users SET google_refresh_token = $1 WHERE id = $2`

	_, err = r.db.Exec(ctx, query, token, id)
	return err
}

func (r *PostgresRepository) UpdateNotificationsEnabled(ctx context.Context, userID string, enabled bool) error {
	id, err := parseUserID(userID)
	if err != nil {
		return err
	}

	query := `UPDATE users SET notifications_enabled = $1 WHERE id = $2`

	_, err = r.db.Exec(ctx, query, enabled, id)
	return err
}

func (r *PostgresRepository) ListUsersWithGoogleRefreshToken(ctx context.Context) ([]*User, error) {
	query := `SELECT id, email, name, provider, provider_id, refresh_token, google_refresh_token, notifications_enabled
	          FROM users
	          WHERE google_refresh_token IS NOT NULL AND google_refresh_token <> ''`

	rows, err := r.db.Query(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	users := make([]*User, 0)
	for rows.Next() {
		u, err := scanUser(rows)
		if err != nil {
			return nil, err
		}
		users = append(users, u)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	return users, nil
}
