package middleware

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/rocker15962/AIForAllFullStack/backend/internal/repository"
	"github.com/rocker15962/AIForAllFullStack/backend/internal/service"
)

const testSecret = "test-secret-key-at-least-32-chars-long"

func newTestAuthService() *service.AuthService {
	return service.NewAuthService(nil, "id", "secret", "http://localhost/cb", testSecret)
}

func setupRouter(authSvc *service.AuthService) *gin.Engine {
	gin.SetMode(gin.TestMode)
	r := gin.New()
	r.GET("/protected", Auth(authSvc), func(c *gin.Context) {
		userID, _ := c.Get(ContextKeyUserID)
		email, _ := c.Get(ContextKeyEmail)
		isAdmin, _ := c.Get(ContextKeyIsAdmin)
		c.JSON(http.StatusOK, gin.H{
			"userID":  userID.(uuid.UUID).String(),
			"email":   email,
			"isAdmin": isAdmin,
		})
	})
	return r
}

func TestAuthMiddleware_MissingHeader(t *testing.T) {
	r := setupRouter(newTestAuthService())
	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/protected", nil)
	r.ServeHTTP(w, req)

	if w.Code != http.StatusUnauthorized {
		t.Errorf("expected 401, got %d", w.Code)
	}
}

func TestAuthMiddleware_MalformedBearer(t *testing.T) {
	r := setupRouter(newTestAuthService())
	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/protected", nil)
	req.Header.Set("Authorization", "InvalidFormat")
	r.ServeHTTP(w, req)

	if w.Code != http.StatusUnauthorized {
		t.Errorf("expected 401, got %d", w.Code)
	}
}

func TestAuthMiddleware_InvalidToken(t *testing.T) {
	r := setupRouter(newTestAuthService())
	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/protected", nil)
	req.Header.Set("Authorization", "Bearer invalid-token-string")
	r.ServeHTTP(w, req)

	if w.Code != http.StatusUnauthorized {
		t.Errorf("expected 401, got %d", w.Code)
	}
}

func TestAuthMiddleware_ValidToken(t *testing.T) {
	authSvc := newTestAuthService()
	user := repository.User{
		ID:      uuid.New(),
		Email:   "test@example.com",
		IsAdmin: true,
	}
	tokens, _ := authSvc.GenerateTokens(user)

	r := setupRouter(authSvc)
	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/protected", nil)
	req.Header.Set("Authorization", "Bearer "+tokens.AccessToken)
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("expected 200, got %d", w.Code)
	}
}
