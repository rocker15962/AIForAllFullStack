package handler

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strings"
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

func (h *UserHandler) getToolName(c *gin.Context, toolID uuid.UUID) string {
	tool, err := h.queries.GetToolByID(c.Request.Context(), toolID)
	if err != nil {
		return ""
	}
	return tool.Name
}

func (h *UserHandler) getSkillName(c *gin.Context, skillID uuid.UUID) string {
	skill, err := h.queries.GetSkillByID(c.Request.Context(), skillID)
	if err != nil {
		return ""
	}
	return skill.Name
}

// GetProgress godoc
//
//	@Summary		Get in-progress courses
//	@Description	Returns courses the user is currently working on
//	@Tags			user
//	@Produce		json
//	@Success		200	{object}	map[string]interface{}
//	@Failure		401	{object}	map[string]interface{}
//	@Router			/my/progress [get]
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
		_ = json.Unmarshal(r.Answers, &answers)
		answeredCount := len(answers)
		progressPct := 0
		if r.TotalQuestions > 0 {
			progressPct = answeredCount * 100 / int(r.TotalQuestions)
		}

		items[i] = gin.H{
			"id":              r.ID.String(),
			"courseId":        r.CourseID.String(),
			"courseTitle":     r.Title,
			"courseThumbnail": r.ThumbnailUrl,
			"difficulty":      string(r.Difficulty),
			"toolName":        h.getToolName(c, r.ToolID),
			"skillName":       h.getSkillName(c, r.SkillID),
			"progress":        progressPct,
			"currentQuestion": answeredCount,
			"totalQuestions":  r.TotalQuestions,
			"lastAccessedAt":  r.LastAccessedAt.Format(time.RFC3339),
			// BR-31: archived (or unpublished) courses stay listed but can no longer be opened.
			"courseStatus": string(r.CourseStatus),
		}
	}

	c.JSON(http.StatusOK, gin.H{"courses": items})
}

// GetCompleted godoc
//
//	@Summary		Get completed courses
//	@Description	Returns courses the user has completed with scores
//	@Tags			user
//	@Produce		json
//	@Success		200	{object}	map[string]interface{}
//	@Failure		401	{object}	map[string]interface{}
//	@Router			/my/completed [get]
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
			"id":              r.ID.String(),
			"courseId":        r.CourseID.String(),
			"courseTitle":     r.Title,
			"courseThumbnail": r.ThumbnailUrl,
			"difficulty":      string(r.Difficulty),
			"toolName":        h.getToolName(c, r.ToolID),
			"skillName":       h.getSkillName(c, r.SkillID),
			"score":           score,
			"totalQuestions":  r.TotalQuestions,
			"completedAt":     completedAt,
			"courseStatus":    string(r.CourseStatus),
		}
	}

	c.JSON(http.StatusOK, gin.H{"courses": items})
}

// GetBadges godoc
//
//	@Summary		Get earned badges
//	@Description	Returns badges earned by completing courses
//	@Tags			user
//	@Produce		json
//	@Success		200	{object}	map[string]interface{}
//	@Failure		401	{object}	map[string]interface{}
//	@Router			/my/badges [get]
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
		if r.BadgeEarnedAt.Valid {
			earnedAt = r.BadgeEarnedAt.Time.Format(time.RFC3339)
		}
		items[i] = gin.H{
			"id":           r.ID.String(),
			"courseId":     r.CourseID.String(),
			"courseTitle":  r.Title,
			"thumbnailUrl": r.ThumbnailUrl,
			"earnedAt":     earnedAt,
			"courseStatus": string(r.CourseStatus),
		}
	}

	c.JSON(http.StatusOK, gin.H{"badges": items})
}

// GetProfile godoc
//
//	@Summary		Get user profile
//	@Description	Returns the user's profile with learning counts
//	@Tags			user
//	@Produce		json
//	@Success		200	{object}	map[string]interface{}
//	@Failure		401	{object}	map[string]interface{}
//	@Router			/my/profile [get]
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

// UpdateProfile godoc
//
//	@Summary		Update user profile
//	@Description	Update the user's display name
//	@Tags			user
//	@Accept			json
//	@Produce		json
//	@Param			body	body	object	true	"Profile update"
//	@Success		200	{object}	map[string]interface{}
//	@Failure		401	{object}	map[string]interface{}
//	@Router			/my/profile [put]
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

// GetStats godoc
//
//	@Summary		Get learning stats
//	@Description	Returns in-progress, completed, and badge counts
//	@Tags			user
//	@Produce		json
//	@Success		200	{object}	map[string]interface{}
//	@Failure		401	{object}	map[string]interface{}
//	@Router			/my/stats [get]
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
		"badges":     counts.BadgeCount,
	})
}

// maxAvatarBytes is the largest avatar upload accepted (BR-25).
const maxAvatarBytes = 5 << 20

// UploadAvatar godoc
//
//	@Summary		Upload avatar
//	@Description	Upload a new profile avatar (max 5MB, jpg/png/webp). The web app crops it to a square before uploading.
//	@Tags			user
//	@Accept			multipart/form-data
//	@Produce		json
//	@Param			avatar	formData	file	true	"Avatar image"
//	@Success		200	{object}	map[string]interface{}
//	@Failure		401	{object}	map[string]interface{}
//	@Router			/my/avatar [post]
func (h *UserHandler) UploadAvatar(c *gin.Context) {
	// Leave room for multipart overhead on top of the file itself.
	c.Request.Body = http.MaxBytesReader(c.Writer, c.Request.Body, maxAvatarBytes+1<<20)

	userID := c.MustGet(middleware.ContextKeyUserID).(uuid.UUID)

	file, err := c.FormFile("avatar")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "avatar file is required"})
		return
	}

	// BR-25: up to 5MB.
	if file.Size > maxAvatarBytes {
		c.JSON(http.StatusBadRequest, gin.H{"error": "file too large (max 5MB)"})
		return
	}

	ext := strings.ToLower(filepath.Ext(file.Filename))
	allowed := map[string]bool{".jpg": true, ".jpeg": true, ".png": true, ".webp": true}
	if !allowed[ext] {
		c.JSON(http.StatusBadRequest, gin.H{"error": "only jpg, png, webp allowed"})
		return
	}

	uploadDir := "uploads/avatars"
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create upload directory"})
		return
	}

	filename := fmt.Sprintf("%s%s", userID.String(), ext)
	savePath := filepath.Join(uploadDir, filename)

	if err := c.SaveUploadedFile(file, savePath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to save file"})
		return
	}

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
