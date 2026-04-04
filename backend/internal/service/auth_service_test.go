package service

import (
	"context"
	"testing"

	"github.com/google/uuid"
	"github.com/rocker15962/AIForAllFullStack/backend/internal/repository"
)

func TestUpsertUser_NewUser(t *testing.T) {
	repo := newMockUserRepo()
	svc := NewAuthService(repo, "cid", "cs", "http://cb", testSecret)

	info := &GoogleUserInfo{Email: "new@test.com", Name: "New", Picture: "pic.jpg"}
	user, err := svc.UpsertUser(context.Background(), info)
	if err != nil {
		t.Fatalf("UpsertUser failed: %v", err)
	}
	if user.Email != "new@test.com" {
		t.Errorf("expected email new@test.com, got %s", user.Email)
	}
	if user.Name != "New" {
		t.Errorf("expected name New, got %s", user.Name)
	}
}

func TestUpsertUser_ExistingUser(t *testing.T) {
	repo := newMockUserRepo()
	existing := repository.User{
		ID: uuid.New(), Name: "Old", Email: "exist@test.com", Provider: repository.AuthProviderGoogle,
	}
	repo.users["exist@test.com"] = existing

	svc := NewAuthService(repo, "cid", "cs", "http://cb", testSecret)
	info := &GoogleUserInfo{Email: "exist@test.com", Name: "Updated", Picture: "new.jpg"}
	user, err := svc.UpsertUser(context.Background(), info)
	if err != nil {
		t.Fatalf("UpsertUser failed: %v", err)
	}
	if user.Name != "Updated" {
		t.Errorf("expected name Updated, got %s", user.Name)
	}
}

func TestGetUserByID_Found(t *testing.T) {
	repo := newMockUserRepo()
	id := uuid.New()
	repo.users["test@test.com"] = repository.User{ID: id, Email: "test@test.com", Name: "Test"}

	svc := NewAuthService(repo, "cid", "cs", "http://cb", testSecret)
	user, err := svc.GetUserByID(context.Background(), id)
	if err != nil {
		t.Fatalf("GetUserByID failed: %v", err)
	}
	if user.Name != "Test" {
		t.Errorf("expected Test, got %s", user.Name)
	}
}

func TestGetUserByID_NotFound(t *testing.T) {
	repo := newMockUserRepo()
	svc := NewAuthService(repo, "cid", "cs", "http://cb", testSecret)
	_, err := svc.GetUserByID(context.Background(), uuid.New())
	if err == nil {
		t.Error("expected error for non-existent user")
	}
}
