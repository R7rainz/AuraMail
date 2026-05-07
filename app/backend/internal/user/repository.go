package user

import (
	"context"
)

type Repository interface {
	FindOrCreateGoogleUser(
		ctx context.Context,
		email string,
		name string,
		googleSub string,
	) (*User, error)

	UpdateRefreshToken(
		ctx context.Context,
		userID string,
		refreshToken string,
	) error

	FindByRefreshToken(ctx context.Context, token string) (*User, error)

	ClearRefreshToken(ctx context.Context, userID string) error

	FindByID(ctx context.Context, id string) (*User, error)

	Save(ctx context.Context, user *User) error

	UpdateGoogleRefreshToken(ctx context.Context, userID string, token string) error
}