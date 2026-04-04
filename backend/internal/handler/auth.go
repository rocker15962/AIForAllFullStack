package handler

import (
	"crypto/rand"
	"encoding/hex"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/rocker15962/AIForAllFullStack/backend/internal/middleware"
	"github.com/rocker15962/AIForAllFullStack/backend/internal/service"
)

type AuthHandler struct {
	authService  *service.AuthService
	frontendURL  string
	isProduction bool
}

func NewAuthHandler(authService *service.AuthService, frontendURL string) *AuthHandler {
	return &AuthHandler{
		authService:  authService,
		frontendURL:  frontendURL,
		isProduction: os.Getenv("GIN_MODE") == "release",
	}
}

// GoogleLogin godoc
//
//	@Summary		Initiate Google OAuth login
//	@Description	Redirects to Google OAuth consent screen
//	@Tags			auth
//	@Param			redirect	query	string	false	"Redirect path after login"
//	@Success		307
//	@Router			/auth/google/login [get]
func (h *AuthHandler) GoogleLogin(c *gin.Context) {
	redirect := c.DefaultQuery("redirect", "/")

	state, err := generateRandomState()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to generate state"})
		return
	}

	c.SetCookie("oauth_state", state, 300, "/", "", h.isProduction, true)
	c.SetCookie("oauth_redirect", redirect, 300, "/", "", h.isProduction, true)

	url := h.authService.GetGoogleAuthURL(state)
	c.Redirect(http.StatusTemporaryRedirect, url)
}

// GoogleCallback godoc
//
//	@Summary		Google OAuth callback
//	@Description	Handles Google OAuth callback and issues JWT tokens
//	@Tags			auth
//	@Param			state	query	string	true	"OAuth state"
//	@Param			code	query	string	true	"Authorization code"
//	@Success		307
//	@Router			/auth/google/callback [get]
func (h *AuthHandler) GoogleCallback(c *gin.Context) {
	// Validate state
	state := c.Query("state")
	cookieState, err := c.Cookie("oauth_state")
	if err != nil || state != cookieState {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid state"})
		return
	}

	// Get redirect URL from cookie
	redirect, _ := c.Cookie("oauth_redirect")
	if redirect == "" {
		redirect = "/"
	}

	// Clear state cookies
	c.SetCookie("oauth_state", "", -1, "/", "", h.isProduction, true)
	c.SetCookie("oauth_redirect", "", -1, "/", "", h.isProduction, true)

	// Exchange code for user info
	code := c.Query("code")
	userInfo, err := h.authService.ExchangeCodeAndGetUserInfo(c.Request.Context(), code)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "failed to authenticate with Google"})
		return
	}

	// Upsert user
	user, err := h.authService.UpsertUser(c.Request.Context(), userInfo)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create user"})
		return
	}

	// Generate tokens
	tokens, err := h.authService.GenerateTokens(user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to generate tokens"})
		return
	}

	// Set refresh token cookie
	c.SetCookie(
		"refresh_token",
		tokens.RefreshToken,
		7*24*3600, // 7 days
		"/api/v1/auth",
		"",
		h.isProduction,
		true, // HttpOnly
	)

	// Redirect to frontend with access token
	c.Redirect(http.StatusTemporaryRedirect,
		h.frontendURL+"/auth/callback?token="+tokens.AccessToken+"&redirect="+redirect)
}

// Refresh godoc
//
//	@Summary		Refresh access token
//	@Description	Uses refresh token cookie to issue a new access token
//	@Tags			auth
//	@Produce		json
//	@Success		200	{object}	map[string]interface{}
//	@Failure		401	{object}	map[string]interface{}
//	@Router			/auth/refresh [post]
func (h *AuthHandler) Refresh(c *gin.Context) {
	refreshToken, err := c.Cookie("refresh_token")
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "no refresh token"})
		return
	}

	userID, err := h.authService.ValidateRefreshToken(refreshToken)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid or expired refresh token"})
		return
	}

	user, err := h.authService.GetUserByID(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "user not found"})
		return
	}

	tokens, err := h.authService.GenerateTokens(user)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to generate tokens"})
		return
	}

	// Rotate refresh token cookie
	c.SetCookie(
		"refresh_token",
		tokens.RefreshToken,
		7*24*3600,
		"/api/v1/auth",
		"",
		h.isProduction,
		true,
	)

	c.JSON(http.StatusOK, gin.H{"accessToken": tokens.AccessToken})
}

// Logout godoc
//
//	@Summary		Logout
//	@Description	Clears refresh token cookie
//	@Tags			auth
//	@Produce		json
//	@Success		200	{object}	map[string]interface{}
//	@Router			/auth/logout [post]
func (h *AuthHandler) Logout(c *gin.Context) {
	c.SetCookie("refresh_token", "", -1, "/api/v1/auth", "", h.isProduction, true)
	c.JSON(http.StatusOK, gin.H{"message": "logged out"})
}

type meResponse struct {
	ID           string `json:"id"`
	Name         string `json:"name"`
	Email        string `json:"email"`
	AvatarUrl    string `json:"avatarUrl"`
	Provider     string `json:"provider"`
	IsAdmin      bool   `json:"isAdmin"`
	CreatedAt    string `json:"createdAt"`
	LastActiveAt string `json:"lastActiveAt"`
}

// Me godoc
//
//	@Summary		Get current user
//	@Description	Returns the authenticated user's profile
//	@Tags			auth
//	@Produce		json
//	@Success		200	{object}	map[string]interface{}
//	@Failure		401	{object}	map[string]interface{}
//	@Router			/auth/me [get]
func (h *AuthHandler) Me(c *gin.Context) {
	userID, _ := c.Get(middleware.ContextKeyUserID)

	user, err := h.authService.GetUserByID(c.Request.Context(), userID.(uuid.UUID))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}

	c.JSON(http.StatusOK, meResponse{
		ID:           user.ID.String(),
		Name:         user.Name,
		Email:        user.Email,
		AvatarUrl:    user.AvatarUrl,
		Provider:     string(user.Provider),
		IsAdmin:      user.IsAdmin,
		CreatedAt:    user.CreatedAt.Format(time.RFC3339),
		LastActiveAt: user.LastActiveAt.Format(time.RFC3339),
	})
}

func generateRandomState() (string, error) {
	b := make([]byte, 16)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return hex.EncodeToString(b), nil
}
