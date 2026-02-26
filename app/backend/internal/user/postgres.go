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
	query := `SELECT id, email, name, provider, "providerId", "refreshToken" 
			  FROM users WHERE id = $1;`

	err := r.db.QueryRow(ctx, query, id).Scan(
		&u.ID, &u.Email, &u.Name, &u.Provider, &u.ProviderID, &u.RefreshToken,
	)

	if err != nil {
		log.Printf("DB ERROR for ID %s: %v", id, err)
		return nil, err
	}

	log.Printf("DB SUCCESS: Found user %s", u.Email)
	return &u, nil
}

// Save implements [Repository].
func (r *PostgresRepository) Save(ctx context.Context, user *User) error {
	query := `UPDATE users SET email = $1, name = $2, refresh_token = $3 WHERE id = $4;`

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
	query := `SELECT summary, category, company, role, deadline, "applyLink", eligibility, timings, salary, location FROM emails WHERE id = $1`

	var res ai.AIResult
	var eligibility, timings, salary, location []byte
	err := r.db.QueryRow(ctx, query, gmailID).Scan(&res.Summary, &res.Category, &res.Company, &res.Role, &res.Deadline, &res.ApplyLink, &eligibility, &timings, &salary, &location)
	if err != nil {
		return nil, err
	}

	json.Unmarshal(eligibility, &res.Eligibility)
	json.Unmarshal(timings, &res.Timings)
	json.Unmarshal(salary, &res.Salary)
	json.Unmarshal(location, &res.Location)

	return &res, nil
}

func (r *PostgresRepository) SaveSummary(ctx context.Context, userID string, gmailID string, res *ai.AIResult) error {
	jsonData, err := json.Marshal(res)
	if err != nil {
		return fmt.Errorf("failed to marshal AI result: %w", err)
	}

	query := `
		INSERT INTO emails (id, "userId", subject, snippet, summary, category, company, role, deadline, "applyLink", eligibility, timings, salary, location, body)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
		ON CONFLICT (id) DO NOTHING`

	eligibility, _ := json.Marshal(res.Eligibility)
	timings, _ := json.Marshal(res.Timings)
	salary, _ := json.Marshal(res.Salary)
	location, _ := json.Marshal(res.Location)

	_, err = r.db.Exec(ctx, query,
		gmailID,
		userID,
		res.Company,
		res.Summary,
		res.Summary,
		res.Category,
		res.Company,
		res.Role,
		res.Deadline,
		res.ApplyLink,
		string(eligibility),
		string(timings),
		string(salary),
		string(location),
		string(jsonData),
	)
	if err != nil {
		return fmt.Errorf("failed to save summary to db: %w", err)
	}
	return nil
}

func (r *PostgresRepository) GetSummariesByQuery(ctx context.Context, userID string, searchQuery string) ([]*ai.AIResult, error) {
	query := `SELECT summary, category, company, role, deadline, "applyLink", eligibility, timings, salary, location FROM emails WHERE "userId" = $1 AND (summary ILIKE $2 OR company ILIKE $2 OR role ILIKE $2) ORDER BY "createdAt" DESC LIMIT 50`
	rows, err := r.db.Query(ctx, query, userID, "%"+searchQuery+"%")
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var results []*ai.AIResult
	for rows.Next() {
		var res ai.AIResult
		var eligibility, timings, salary, location []byte
		err := rows.Scan(&res.Summary, &res.Category, &res.Company, &res.Role, &res.Deadline, &res.ApplyLink, &eligibility, &timings, &salary, &location)
		if err != nil {
			continue
		}
		json.Unmarshal(eligibility, &res.Eligibility)
		json.Unmarshal(timings, &res.Timings)
		json.Unmarshal(salary, &res.Salary)
		json.Unmarshal(location, &res.Location)
		results = append(results, &res)
	}
	return results, nil
}
