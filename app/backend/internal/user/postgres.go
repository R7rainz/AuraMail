package user

import (
	"context"
	"encoding/json"
	"fmt"
	"log"

	"github.com/jackc/pgx/v5/pgxpool"

	"github.com/r7rainz/auramail/internal/ai"
)

type PostgresRepository struct {
	db *pgxpool.Pool
}

func (r *PostgresRepository) FindByID(ctx context.Context, id string) (*User, error) {
	log.Printf("DB QUERY: Looking for ID [%s]", id)

	var u User
	var googleToken *string // Use pointer to safely handle NULLs if the user hasn't generated a token yet

	// Added google_refresh_token to the SELECT statement
	query := `SELECT id, email, name, provider, "providerId", "refreshToken", google_refresh_token 
	          FROM users WHERE id = $1;`

	// Added &googleToken to the Scan function
	err := r.db.QueryRow(ctx, query, id).Scan(
		&u.ID, &u.Email, &u.Name, &u.Provider, &u.ProviderID, &u.RefreshToken, &googleToken,
	)
	if err != nil {
		log.Printf("DB ERROR for ID %s: %v", id, err)
		return nil, err
	}

	// Safely assign it if it exists
	if googleToken != nil {
		u.GoogleRefreshToken = *googleToken
	}

	log.Printf("DB SUCCESS: Found user %s", u.Email)
	return &u, nil
}

// Save implements [Repository].
func (r *PostgresRepository) Save(ctx context.Context, user *User) error {
	// FIXED: Using "refreshToken" wrapped in double quotes
	query := `UPDATE users SET email = $1, name = $2, "refreshToken" = $3 WHERE id = $4;`

	_, err := r.db.Exec(ctx, query, user.Email, user.Name, user.RefreshToken, user.ID)
	return err
}

func NewPostgresRepository(db *pgxpool.Pool) *PostgresRepository {
	return &PostgresRepository{db: db}
}

func (r *PostgresRepository) FindOrCreateGoogleUser(ctx context.Context, email, name, sub string) (*User, error) {
	var u User
	query := `SELECT id, email, name FROM users WHERE email = $1`
	err := r.db.QueryRow(ctx, query, email).Scan(&u.ID, &u.Email, &u.Name)

	if err == nil {
		return &u, nil
	}

	insertQuery := `INSERT INTO users (id, email, name, provider, "providerId") 
	                VALUES (gen_random_uuid(), $1, $2, 'google', $3) 
	                RETURNING id, email, name`
	err = r.db.QueryRow(ctx, insertQuery, email, name, sub).Scan(&u.ID, &u.Email, &u.Name)
	if err != nil {
		return nil, err
	}

	return &u, nil
}

func (r *PostgresRepository) UpdateRefreshToken(
	ctx context.Context,
	userID string,
	refreshToken string,
) error {
	query := `UPDATE users SET "refreshToken" = $1 WHERE id = $2;`

	_, err := r.db.Exec(ctx, query, refreshToken, userID)
	if err != nil {
		return fmt.Errorf("failed to update refresh token for user %s: %w", userID, err)
	}

	return nil
}

func (r *PostgresRepository) FindByRefreshToken(ctx context.Context, token string) (*User, error) {
	query := `SELECT id, email, name, provider, "providerId", "refreshToken" FROM users WHERE "refreshToken" = $1;`

	var u User
	err := r.db.QueryRow(ctx, query, token).Scan(&u.ID, &u.Email, &u.Name, &u.Provider, &u.ProviderID, &u.RefreshToken)
	if err != nil {
		return nil, fmt.Errorf("failed to find user by refresh token: %w", err)
	}

	return &u, nil
}

func (r *PostgresRepository) ClearRefreshToken(ctx context.Context, userID string) error {
	query := `UPDATE users SET "refreshToken" = NULL WHERE id = $1;`
	_, err := r.db.Exec(ctx, query, userID)
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
	jsonData, err := json.Marshal(res)
	if err != nil {
		return fmt.Errorf("failed to marshal AI result: %w", err)
	}

	query := `
		INSERT INTO email_summaries (user_id, gmail_id, category, company, role, summary, deadline, apply_link, data)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		ON CONFLICT (gmail_id) DO NOTHING`

	// eligibility, _ := json.Marshal(res.Eligibility)
	// timings, _ := json.Marshal(res.Timings)
	// salary, _ := json.Marshal(res.Salary)
	// location, _ := json.Marshal(res.Location)

	_, err = r.db.Exec(ctx, query,
		userID,        // $1
		gmailID,       // $2
		res.Category,  // $3
		res.Company,   // $4
		res.Role,      // $5
		res.Summary,   // $6
		res.Deadline,  // $7
		res.ApplyLink, // $8
		jsonData,      // $9 (The JSONB payload)
	)
	if err != nil {
		return fmt.Errorf("failed to save summary to db: %w", err)
	}
	return nil
}

func (r *PostgresRepository) GetSummariesByQuery(ctx context.Context, userID string, searchQuery string) ([]*ai.AIResult, error) {
	// Query the JSONB column, utilizing the correct column names (user_id, created_at)
	query := `
		SELECT data 
		FROM email_summaries 
		WHERE user_id = $1 
		AND (summary ILIKE $2 OR company ILIKE $2 OR role ILIKE $2) 
		ORDER BY created_at DESC 
		LIMIT 50`

	rows, err := r.db.Query(ctx, query, userID, "%"+searchQuery+"%")
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

func (r *PostgresRepository) UpdateGoogleRefreshToken(ctx context.Context, userID string, token string) error {
	query := `UPDATE users SET google_refresh_token = $1 WHERE id = $2`

	_, err := r.db.Exec(ctx, query, token, userID)
	return err
}

