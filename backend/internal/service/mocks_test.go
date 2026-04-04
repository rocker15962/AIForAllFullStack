package service

import (
	"context"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/rocker15962/AIForAllFullStack/backend/internal/repository"
)

// mockUserRepo
type mockUserRepo struct {
	users map[string]repository.User // keyed by email
}

func newMockUserRepo() *mockUserRepo {
	return &mockUserRepo{users: make(map[string]repository.User)}
}

func (m *mockUserRepo) FindUserByEmail(ctx context.Context, email string) (repository.User, error) {
	u, ok := m.users[email]
	if !ok {
		return repository.User{}, pgx.ErrNoRows
	}
	return u, nil
}

func (m *mockUserRepo) CreateUser(ctx context.Context, arg repository.CreateUserParams) (repository.User, error) {
	u := repository.User{
		ID:        uuid.New(),
		Name:      arg.Name,
		Email:     arg.Email,
		AvatarUrl: arg.AvatarUrl,
		Provider:  arg.Provider,
	}
	m.users[arg.Email] = u
	return u, nil
}

func (m *mockUserRepo) UpdateUser(ctx context.Context, arg repository.UpdateUserParams) (repository.User, error) {
	for email, u := range m.users {
		if u.ID == arg.ID {
			u.Name = arg.Name
			u.AvatarUrl = arg.AvatarUrl
			m.users[email] = u
			return u, nil
		}
	}
	return repository.User{}, pgx.ErrNoRows
}

func (m *mockUserRepo) GetUserByID(ctx context.Context, id uuid.UUID) (repository.User, error) {
	for _, u := range m.users {
		if u.ID == id {
			return u, nil
		}
	}
	return repository.User{}, pgx.ErrNoRows
}
