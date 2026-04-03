package middleware

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

func setupAdminRouter(isAdmin bool) *gin.Engine {
	gin.SetMode(gin.TestMode)
	r := gin.New()
	r.GET("/admin", func(c *gin.Context) {
		// Simulate AuthMiddleware having set context values
		c.Set(ContextKeyUserID, uuid.New())
		c.Set(ContextKeyEmail, "test@example.com")
		c.Set(ContextKeyIsAdmin, isAdmin)
		c.Next()
	}, Admin(), func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "admin access granted"})
	})
	return r
}

func TestAdminMiddleware_Forbidden(t *testing.T) {
	r := setupAdminRouter(false)
	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/admin", nil)
	r.ServeHTTP(w, req)

	if w.Code != http.StatusForbidden {
		t.Errorf("expected 403, got %d", w.Code)
	}
}

func TestAdminMiddleware_Allowed(t *testing.T) {
	r := setupAdminRouter(true)
	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/admin", nil)
	r.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("expected 200, got %d", w.Code)
	}
}
