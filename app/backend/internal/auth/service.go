package auth

import (
	"context"
	"errors"
	"fmt"

	"github.com/r7rainz/auramail/internal/user"
)

var ErrInvalidRefreshToken = errors.New("invalid refresh token")

type Service struct {
	users user.Repository
}

func NewService(users user.Repository) *Service {
	return &Service{
		users: users,
	}
}

func (s *Service) Refresh(ctx context.Context, refreshToken string) (string, error) {
	_, err := ValidateRefreshToken(refreshToken)
	if err != nil {
		return "", fmt.Errorf("token validation failed: %w", err)
	}

	u, err := s.users.FindByRefreshToken(ctx, refreshToken)
	if err != nil {
		return "", fmt.Errorf("database lookup failed: %w", err)
	}
	accessToken, err := GenerateAccessToken(u.ID, u.Email, u.Name)
	if err != nil {
		return "", fmt.Errorf("failed to generate new access token: %w", err)
	}

	return accessToken, nil
}

func (s *Service) Logout(ctx context.Context, userID string) error {
	return s.users.ClearRefreshToken(ctx, userID)
}

