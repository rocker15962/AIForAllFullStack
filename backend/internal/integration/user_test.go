//go:build integration

package integration

import (
	"context"
	"testing"

	"github.com/google/uuid"
	"github.com/rocker15962/AIForAllFullStack/backend/internal/repository"
)

func TestCreateUser(t *testing.T) {
	ctx := context.Background()
	user, err := testQueries.CreateUser(ctx, repository.CreateUserParams{
		Name:      "Integration Test User",
		Email:     "inttest-" + uuid.New().String()[:8] + "@test.com",
		AvatarUrl: "https://example.com/avatar.jpg",
		Provider:  repository.AuthProviderGoogle,
	})
	if err != nil {
		t.Fatalf("CreateUser failed: %v", err)
	}
	if user.Name != "Integration Test User" {
		t.Errorf("expected name 'Integration Test User', got %q", user.Name)
	}
	if user.Provider != repository.AuthProviderGoogle {
		t.Errorf("expected provider google, got %q", user.Provider)
	}
}

func TestFindUserByEmail(t *testing.T) {
	ctx := context.Background()
	email := "find-" + uuid.New().String()[:8] + "@test.com"
	_, err := testQueries.CreateUser(ctx, repository.CreateUserParams{
		Name: "Find Me", Email: email, Provider: repository.AuthProviderGoogle,
	})
	if err != nil {
		t.Fatalf("CreateUser failed: %v", err)
	}

	found, err := testQueries.FindUserByEmail(ctx, email)
	if err != nil {
		t.Fatalf("FindUserByEmail failed: %v", err)
	}
	if found.Name != "Find Me" {
		t.Errorf("expected 'Find Me', got %q", found.Name)
	}
}

func TestUpdateUser(t *testing.T) {
	ctx := context.Background()
	user, _ := testQueries.CreateUser(ctx, repository.CreateUserParams{
		Name: "Before", Email: "update-" + uuid.New().String()[:8] + "@test.com", Provider: repository.AuthProviderGoogle,
	})

	updated, err := testQueries.UpdateUser(ctx, repository.UpdateUserParams{
		Name: "After", AvatarUrl: "new-avatar.jpg", ID: user.ID,
	})
	if err != nil {
		t.Fatalf("UpdateUser failed: %v", err)
	}
	if updated.Name != "After" {
		t.Errorf("expected 'After', got %q", updated.Name)
	}
}

func TestGetUserByID(t *testing.T) {
	ctx := context.Background()
	user, _ := testQueries.CreateUser(ctx, repository.CreateUserParams{
		Name: "Get By ID", Email: "getid-" + uuid.New().String()[:8] + "@test.com", Provider: repository.AuthProviderFacebook,
	})

	found, err := testQueries.GetUserByID(ctx, user.ID)
	if err != nil {
		t.Fatalf("GetUserByID failed: %v", err)
	}
	if found.Provider != repository.AuthProviderFacebook {
		t.Errorf("expected facebook, got %q", found.Provider)
	}
}
