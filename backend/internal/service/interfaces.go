package service

import (
	"context"

	"github.com/google/uuid"
	"github.com/rocker15962/AIForAllFullStack/backend/internal/repository"
)

type UserRepository interface {
	FindUserByEmail(ctx context.Context, email string) (repository.User, error)
	CreateUser(ctx context.Context, arg repository.CreateUserParams) (repository.User, error)
	UpdateUser(ctx context.Context, arg repository.UpdateUserParams) (repository.User, error)
	GetUserByID(ctx context.Context, id uuid.UUID) (repository.User, error)
}
