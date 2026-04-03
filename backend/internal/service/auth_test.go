package service

import (
	"testing"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/rocker15962/AIForAllFullStack/backend/internal/repository"
)

const testSecret = "test-secret-key-at-least-32-chars-long"

func newTestAuthService() *AuthService {
	return NewAuthService(nil, "client-id", "client-secret", "http://localhost/callback", testSecret)
}

func TestGenerateTokens(t *testing.T) {
	svc := newTestAuthService()
	user := repository.User{
		ID:       uuid.New(),
		Name:     "Test User",
		Email:    "test@example.com",
		IsAdmin:  false,
		Provider: repository.AuthProviderGoogle,
	}

	tokens, err := svc.GenerateTokens(user)
	if err != nil {
		t.Fatalf("GenerateTokens failed: %v", err)
	}

	if tokens.AccessToken == "" {
		t.Error("access token is empty")
	}
	if tokens.RefreshToken == "" {
		t.Error("refresh token is empty")
	}
	if tokens.AccessToken == tokens.RefreshToken {
		t.Error("access and refresh tokens should be different")
	}
}

func TestValidateAccessToken(t *testing.T) {
	svc := newTestAuthService()
	userID := uuid.New()
	user := repository.User{
		ID:      userID,
		Email:   "test@example.com",
		IsAdmin: true,
	}

	tokens, _ := svc.GenerateTokens(user)
	claims, err := svc.ValidateAccessToken(tokens.AccessToken)
	if err != nil {
		t.Fatalf("ValidateAccessToken failed: %v", err)
	}

	if claims.UserID != userID {
		t.Errorf("expected userID %s, got %s", userID, claims.UserID)
	}
	if claims.Email != "test@example.com" {
		t.Errorf("expected email test@example.com, got %s", claims.Email)
	}
	if !claims.IsAdmin {
		t.Error("expected isAdmin true")
	}
}

func TestValidateRefreshToken(t *testing.T) {
	svc := newTestAuthService()
	userID := uuid.New()
	user := repository.User{ID: userID}

	tokens, _ := svc.GenerateTokens(user)
	gotID, err := svc.ValidateRefreshToken(tokens.RefreshToken)
	if err != nil {
		t.Fatalf("ValidateRefreshToken failed: %v", err)
	}

	if gotID != userID {
		t.Errorf("expected userID %s, got %s", userID, gotID)
	}
}

func TestRejectRefreshTokenAsAccessToken(t *testing.T) {
	svc := newTestAuthService()
	user := repository.User{ID: uuid.New()}

	tokens, _ := svc.GenerateTokens(user)
	_, err := svc.ValidateAccessToken(tokens.RefreshToken)
	if err == nil {
		t.Error("expected error when using refresh token as access token")
	}
}

func TestRejectAccessTokenAsRefreshToken(t *testing.T) {
	svc := newTestAuthService()
	user := repository.User{ID: uuid.New()}

	tokens, _ := svc.GenerateTokens(user)
	_, err := svc.ValidateRefreshToken(tokens.AccessToken)
	if err == nil {
		t.Error("expected error when using access token as refresh token")
	}
}

func TestRejectExpiredAccessToken(t *testing.T) {
	svc := newTestAuthService()

	// Manually create an expired token
	claims := jwt.MapClaims{
		"sub":      uuid.New().String(),
		"email":    "test@example.com",
		"is_admin": false,
		"iat":      time.Now().Add(-1 * time.Hour).Unix(),
		"exp":      time.Now().Add(-30 * time.Minute).Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenStr, _ := token.SignedString([]byte(testSecret))

	_, err := svc.ValidateAccessToken(tokenStr)
	if err == nil {
		t.Error("expected error for expired token")
	}
}

func TestRejectInvalidSignature(t *testing.T) {
	// Create token with different secret
	claims := jwt.MapClaims{
		"sub":      uuid.New().String(),
		"email":    "test@example.com",
		"is_admin": false,
		"exp":      time.Now().Add(15 * time.Minute).Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenStr, _ := token.SignedString([]byte("wrong-secret-key-that-is-different"))

	svc := newTestAuthService()
	_, err := svc.ValidateAccessToken(tokenStr)
	if err == nil {
		t.Error("expected error for invalid signature")
	}
}
