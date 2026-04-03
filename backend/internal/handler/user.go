package handler

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/rocker15962/AIForAllFullStack/backend/internal/middleware"
	"github.com/rocker15962/AIForAllFullStack/backend/internal/repository"
)

type UserHandler struct {
	queries *repository.Queries
}

func NewUserHandler(queries *repository.Queries) *UserHandler {
	return &UserHandler{queries: queries}
}

func (h *UserHandler) GetProgress(c *gin.Context) {
	userID := c.MustGet(middleware.ContextKeyUserID).(uuid.UUID)

	rows, err := h.queries.GetUserInProgress(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get progress"})
		return
	}

	items := make([]gin.H, len(rows))
	for i, r := range rows {
		var answers []map[string]interface{}
		json.Unmarshal(r.Answers, &answers)
		answeredCount := len(answers)
		progressPct := 0
		if r.TotalQuestions > 0 {
			progressPct = answeredCount * 100 / int(r.TotalQuestions)
		}

		items[i] = gin.H{
			"id":             r.ID.String(),
			"courseId":       r.CourseID.String(),
			"title":          r.Title,
			"thumbnailUrl":   r.ThumbnailUrl,
			"difficulty":     string(r.Difficulty),
			"toolId":         r.ToolID.String(),
			"skillId":        r.SkillID.String(),
			"progress":       progressPct,
			"currentQuestion": answeredCount,
			"totalQuestions":  r.TotalQuestions,
			"lastAccessedAt": r.LastAccessedAt.Format(time.RFC3339),
		}
	}

	c.JSON(http.StatusOK, gin.H{"courses": items})
}

func (h *UserHandler) GetCompleted(c *gin.Context) {
	userID := c.MustGet(middleware.ContextKeyUserID).(uuid.UUID)

	rows, err := h.queries.GetUserCompleted(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get completed"})
		return
	}

	items := make([]gin.H, len(rows))
	for i, r := range rows {
		completedAt := ""
		if r.CompletedAt.Valid {
			completedAt = r.CompletedAt.Time.Format(time.RFC3339)
		}
		score := 0.0
		if r.Score.Valid {
			f, _ := r.Score.Float64Value()
			score = f.Float64
		}

		items[i] = gin.H{
			"id":           r.ID.String(),
			"courseId":     r.CourseID.String(),
			"title":        r.Title,
			"thumbnailUrl": r.ThumbnailUrl,
			"difficulty":   string(r.Difficulty),
			"toolId":       r.ToolID.String(),
			"skillId":      r.SkillID.String(),
			"score":        score,
			"totalQuestions": r.TotalQuestions,
			"completedAt":  completedAt,
		}
	}

	c.JSON(http.StatusOK, gin.H{"courses": items})
}

func (h *UserHandler) GetBadges(c *gin.Context) {
	userID := c.MustGet(middleware.ContextKeyUserID).(uuid.UUID)

	rows, err := h.queries.GetUserBadges(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get badges"})
		return
	}

	items := make([]gin.H, len(rows))
	for i, r := range rows {
		earnedAt := ""
		if r.CompletedAt.Valid {
			earnedAt = r.CompletedAt.Time.Format(time.RFC3339)
		}
		items[i] = gin.H{
			"id":           r.ID.String(),
			"courseId":     r.CourseID.String(),
			"title":        r.Title,
			"thumbnailUrl": r.ThumbnailUrl,
			"earnedAt":     earnedAt,
		}
	}

	c.JSON(http.StatusOK, gin.H{"badges": items})
}

func (h *UserHandler) GetProfile(c *gin.Context) {
	userID := c.MustGet(middleware.ContextKeyUserID).(uuid.UUID)

	user, err := h.queries.GetUserByID(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}

	counts, _ := h.queries.CountUserProgress(c.Request.Context(), userID)

	c.JSON(http.StatusOK, gin.H{
		"id":              user.ID.String(),
		"name":            user.Name,
		"email":           user.Email,
		"avatarUrl":       user.AvatarUrl,
		"provider":        string(user.Provider),
		"isAdmin":         user.IsAdmin,
		"createdAt":       user.CreatedAt.Format(time.RFC3339),
		"inProgressCount": counts.InProgressCount,
		"completedCount":  counts.CompletedCount,
	})
}

type updateProfileRequest struct {
	Name string `json:"name" binding:"required"`
}

func (h *UserHandler) UpdateProfile(c *gin.Context) {
	userID := c.MustGet(middleware.ContextKeyUserID).(uuid.UUID)

	var req updateProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "name is required"})
		return
	}

	user, err := h.queries.UpdateUserProfile(c.Request.Context(), repository.UpdateUserProfileParams{
		Name: req.Name,
		ID:   userID,
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update profile"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"id":        user.ID.String(),
		"name":      user.Name,
		"email":     user.Email,
		"avatarUrl": user.AvatarUrl,
	})
}

// GetStats returns counts for the My Learning dashboard header
func (h *UserHandler) GetStats(c *gin.Context) {
	userID := c.MustGet(middleware.ContextKeyUserID).(uuid.UUID)

	counts, err := h.queries.CountUserProgress(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get stats"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"inProgress": counts.InProgressCount,
		"completed":  counts.CompletedCount,
		"badges":     counts.CompletedCount, // badges = completed courses
	})
}

func (h *UserHandler) UploadAvatar(c *gin.Context) {
	userID := c.MustGet(middleware.ContextKeyUserID).(uuid.UUID)

	file, err := c.FormFile("avatar")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "avatar file is required"})
		return
	}

	// Validate file size (max 2MB)
	if file.Size > 2*1024*1024 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "file too large (max 2MB)"})
		return
	}

	// Validate file type
	ext := filepath.Ext(file.Filename)
	allowed := map[string]bool{".jpg": true, ".jpeg": true, ".png": true, ".webp": true}
	if !allowed[ext] {
		c.JSON(http.StatusBadRequest, gin.H{"error": "only jpg, png, webp allowed"})
		return
	}

	// Save file
	uploadDir := "uploads/avatars"
	os.MkdirAll(uploadDir, 0755)

	filename := fmt.Sprintf("%s%s", userID.String(), ext)
	savePath := filepath.Join(uploadDir, filename)

	if err := c.SaveUploadedFile(file, savePath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to save file"})
		return
	}

	// Build URL and update DB
	avatarURL := fmt.Sprintf("/uploads/avatars/%s", filename)

	user, err := h.queries.UpdateUserAvatar(c.Request.Context(), repository.UpdateUserAvatarParams{
		AvatarUrl: avatarURL,
		ID:        userID,
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update avatar"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"avatarUrl": user.AvatarUrl,
	})
}
