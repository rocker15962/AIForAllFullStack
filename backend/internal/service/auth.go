package service

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/rocker15962/AIForAllFullStack/backend/internal/repository"
	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
)

type AuthService struct {
	userRepo    UserRepository
	oauthConfig *oauth2.Config
	jwtSecret   []byte
}

func NewAuthService(userRepo UserRepository, clientID, clientSecret, redirectURL, jwtSecret string) *AuthService {
	return &AuthService{
		userRepo: userRepo,
		oauthConfig: &oauth2.Config{
			ClientID:     clientID,
			ClientSecret: clientSecret,
			RedirectURL:  redirectURL,
			Scopes:       []string{"openid", "email", "profile"},
			Endpoint:     google.Endpoint,
		},
		jwtSecret: []byte(jwtSecret),
	}
}

func (s *AuthService) GetGoogleAuthURL(state string) string {
	return s.oauthConfig.AuthCodeURL(state, oauth2.AccessTypeOffline)
}

type GoogleUserInfo struct {
	Email   string `json:"email"`
	Name    string `json:"name"`
	Picture string `json:"picture"`
}

func (s *AuthService) ExchangeCodeAndGetUserInfo(ctx context.Context, code string) (*GoogleUserInfo, error) {
	token, err := s.oauthConfig.Exchange(ctx, code)
	if err != nil {
		return nil, fmt.Errorf("exchange code: %w", err)
	}

	client := s.oauthConfig.Client(ctx, token)
	resp, err := client.Get("https://www.googleapis.com/oauth2/v2/userinfo")
	if err != nil {
		return nil, fmt.Errorf("fetch user info: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("google userinfo returned status %d", resp.StatusCode)
	}

	var info GoogleUserInfo
	if err := json.NewDecoder(resp.Body).Decode(&info); err != nil {
		return nil, fmt.Errorf("decode user info: %w", err)
	}

	return &info, nil
}

func (s *AuthService) UpsertUser(ctx context.Context, info *GoogleUserInfo) (repository.User, error) {
	user, err := s.userRepo.FindUserByEmail(ctx, info.Email)
	if err != nil {
		if !errors.Is(err, pgx.ErrNoRows) {
			return repository.User{}, fmt.Errorf("find user: %w", err)
		}

		// Create new user
		user, err = s.userRepo.CreateUser(ctx, repository.CreateUserParams{
			Name:      info.Name,
			Email:     info.Email,
			AvatarUrl: info.Picture,
			Provider:  repository.AuthProviderGoogle,
		})
		if err != nil {
			return repository.User{}, fmt.Errorf("create user: %w", err)
		}
		return user, nil
	}

	// Update existing user
	user, err = s.userRepo.UpdateUser(ctx, repository.UpdateUserParams{
		Name:      info.Name,
		AvatarUrl: info.Picture,
		ID:        user.ID,
	})
	if err != nil {
		return repository.User{}, fmt.Errorf("update user: %w", err)
	}
	return user, nil
}

type TokenPair struct {
	AccessToken  string
	RefreshToken string
}

func (s *AuthService) GenerateTokens(user repository.User) (*TokenPair, error) {
	now := time.Now()

	// Access token (15 min)
	accessClaims := jwt.MapClaims{
		"sub":      user.ID.String(),
		"email":    user.Email,
		"is_admin": user.IsAdmin,
		"iat":      now.Unix(),
		"exp":      now.Add(15 * time.Minute).Unix(),
	}
	accessToken := jwt.NewWithClaims(jwt.SigningMethodHS256, accessClaims)
	accessStr, err := accessToken.SignedString(s.jwtSecret)
	if err != nil {
		return nil, fmt.Errorf("sign access token: %w", err)
	}

	// Refresh token (7 days)
	refreshClaims := jwt.MapClaims{
		"sub":  user.ID.String(),
		"type": "refresh",
		"iat":  now.Unix(),
		"exp":  now.Add(7 * 24 * time.Hour).Unix(),
	}
	refreshToken := jwt.NewWithClaims(jwt.SigningMethodHS256, refreshClaims)
	refreshStr, err := refreshToken.SignedString(s.jwtSecret)
	if err != nil {
		return nil, fmt.Errorf("sign refresh token: %w", err)
	}

	return &TokenPair{
		AccessToken:  accessStr,
		RefreshToken: refreshStr,
	}, nil
}

type AccessClaims struct {
	UserID  uuid.UUID
	Email   string
	IsAdmin bool
}

func (s *AuthService) ValidateAccessToken(tokenStr string) (*AccessClaims, error) {
	token, err := jwt.Parse(tokenStr, func(t *jwt.Token) (interface{}, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", t.Header["alg"])
		}
		return s.jwtSecret, nil
	})
	if err != nil {
		return nil, err
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok || !token.Valid {
		return nil, errors.New("invalid token")
	}

	// Reject refresh tokens used as access tokens
	if tokenType, exists := claims["type"]; exists && tokenType == "refresh" {
		return nil, errors.New("refresh token cannot be used as access token")
	}

	sub, _ := claims["sub"].(string)
	userID, err := uuid.Parse(sub)
	if err != nil {
		return nil, fmt.Errorf("invalid user ID in token: %w", err)
	}

	email, _ := claims["email"].(string)
	isAdmin, _ := claims["is_admin"].(bool)

	return &AccessClaims{
		UserID:  userID,
		Email:   email,
		IsAdmin: isAdmin,
	}, nil
}

func (s *AuthService) ValidateRefreshToken(tokenStr string) (uuid.UUID, error) {
	token, err := jwt.Parse(tokenStr, func(t *jwt.Token) (interface{}, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", t.Header["alg"])
		}
		return s.jwtSecret, nil
	})
	if err != nil {
		return uuid.Nil, err
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok || !token.Valid {
		return uuid.Nil, errors.New("invalid token")
	}

	tokenType, _ := claims["type"].(string)
	if tokenType != "refresh" {
		return uuid.Nil, errors.New("not a refresh token")
	}

	sub, _ := claims["sub"].(string)
	userID, err := uuid.Parse(sub)
	if err != nil {
		return uuid.Nil, fmt.Errorf("invalid user ID in token: %w", err)
	}

	return userID, nil
}

func (s *AuthService) GetUserByID(ctx context.Context, id uuid.UUID) (repository.User, error) {
	return s.userRepo.GetUserByID(ctx, id)
}

// RecordActivity marks the user active today: it bumps last_active_at and records the day for
// the daily-active-users metric (BR-39). Called on login and on session refresh.
func (s *AuthService) RecordActivity(ctx context.Context, userID uuid.UUID) error {
	return s.userRepo.RecordUserActivity(ctx, userID)
}
