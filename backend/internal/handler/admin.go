package handler

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/rocker15962/AIForAllFullStack/backend/internal/repository"
	"github.com/rocker15962/AIForAllFullStack/backend/internal/service"
)

type AdminHandler struct {
	queries *repository.Queries
}

func NewAdminHandler(queries *repository.Queries) *AdminHandler {
	return &AdminHandler{queries: queries}
}

// Dashboard godoc
//
//	@Summary		Admin dashboard
//	@Description	Returns platform stats, user trends, and popular courses
//	@Tags			admin
//	@Produce		json
//	@Success		200	{object}	map[string]interface{}
//	@Failure		403	{object}	map[string]interface{}
//	@Router			/admin/dashboard [get]
func (h *AdminHandler) Dashboard(c *gin.Context) {
	ctx := c.Request.Context()

	stats, err := h.queries.GetDashboardStats(ctx)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get dashboard stats"})
		return
	}

	trend, err := h.queries.GetUserTrend(ctx)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get user trend"})
		return
	}

	trendItems := make([]gin.H, len(trend))
	for i, t := range trend {
		dateStr := ""
		if t.Date.Valid {
			dateStr = t.Date.Time.Format("2006-01-02")
		}
		trendItems[i] = gin.H{
			"date":       dateStr,
			"totalUsers": t.TotalUsers,
			"newUsers":   t.NewUsers,
		}
	}

	popular, err := h.queries.GetPopularCourses(ctx)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get popular courses"})
		return
	}

	popularItems := make([]gin.H, len(popular))
	for i, p := range popular {
		popularItems[i] = gin.H{
			"id":          p.ID.String(),
			"title":       p.Title,
			"completions": p.Completions,
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"stats": gin.H{
			"totalUsers":       stats.TotalUsers,
			"totalCourses":     stats.TotalCourses,
			"totalCompletions": stats.TotalCompletions,
			"activeUsers":      stats.ActiveUsers,
		},
		"userTrend":      trendItems,
		"popularCourses": popularItems,
	})
}

// formatCourseResponse formats a course row for JSON response.
func (h *AdminHandler) formatCourseResponse(ctx context.Context, row repository.AdminListCoursesRow) gin.H {
	toolName := h.resolveToolName(ctx, row.ToolID)
	skillName := h.resolveSkillName(ctx, row.SkillID)

	return gin.H{
		"id":            row.ID.String(),
		"title":         row.Title,
		"description":   row.Description,
		"youtubeUrl":    row.YoutubeUrl,
		"youtubeId":     row.YoutubeID,
		"thumbnailUrl":  row.ThumbnailUrl,
		"toolId":        row.ToolID.String(),
		"toolName":      toolName,
		"skillId":       row.SkillID.String(),
		"skillName":     skillName,
		"creatorId":     row.CreatorID.String(),
		"difficulty":    string(row.Difficulty),
		"duration":      row.Duration,
		"status":        string(row.Status),
		"questionCount": row.QuestionCount,
		"createdAt":     row.CreatedAt.Format(time.RFC3339),
		"updatedAt":     row.UpdatedAt.Format(time.RFC3339),
	}
}

// formatFullCourse formats a full Course model for JSON response.
func (h *AdminHandler) formatFullCourse(ctx context.Context, course repository.Course) gin.H {
	toolName := h.resolveToolName(ctx, course.ToolID)
	skillName := h.resolveSkillName(ctx, course.SkillID)

	return gin.H{
		"id":           course.ID.String(),
		"title":        course.Title,
		"description":  course.Description,
		"youtubeUrl":   course.YoutubeUrl,
		"youtubeId":    course.YoutubeID,
		"thumbnailUrl": course.ThumbnailUrl,
		"toolId":       course.ToolID.String(),
		"toolName":     toolName,
		"skillId":      course.SkillID.String(),
		"skillName":    skillName,
		"creatorId":    course.CreatorID.String(),
		"difficulty":   string(course.Difficulty),
		"duration":     course.Duration,
		"status":       string(course.Status),
		"createdAt":    course.CreatedAt.Format(time.RFC3339),
		"updatedAt":    course.UpdatedAt.Format(time.RFC3339),
	}
}

// GetCourse godoc
//
//	@Summary		Get course detail (admin)
//	@Description	Returns full course with questions and answers
//	@Tags			admin
//	@Produce		json
//	@Param			id	path	string	true	"Course ID"
//	@Success		200	{object}	map[string]interface{}
//	@Failure		403	{object}	map[string]interface{}
//	@Router			/admin/courses/{id} [get]
func (h *AdminHandler) GetCourse(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid course ID"})
		return
	}

	course, err := h.queries.GetCourseByID(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "course not found"})
		return
	}

	result := h.formatFullCourse(c.Request.Context(), course)

	// Include full questions with correctAnswer, explanation, acceptableKeywords
	questions, _ := h.queries.GetQuestionsByCourse(c.Request.Context(), id)
	qItems := make([]gin.H, len(questions))
	for i, q := range questions {
		// Unmarshal json.RawMessage fields so they serialize as JSON objects, not base64
		var options interface{}
		if q.Options != nil {
			_ = json.Unmarshal(q.Options, &options)
		}
		var keywords interface{}
		if q.AcceptableKeywords != nil {
			_ = json.Unmarshal(q.AcceptableKeywords, &keywords)
		}

		qItems[i] = gin.H{
			"id":                 q.ID.String(),
			"type":               string(q.Type),
			"question":           q.Question,
			"options":            options,
			"correctAnswer":      q.CorrectAnswer,
			"acceptableKeywords": keywords,
			"explanation":        q.Explanation,
			"order":              q.Order,
		}
	}
	result["questions"] = qItems

	c.JSON(http.StatusOK, result)
}

func (h *AdminHandler) resolveToolName(ctx context.Context, toolID uuid.UUID) string {
	tool, err := h.queries.GetToolByID(ctx, toolID)
	if err != nil {
		return ""
	}
	return tool.Name
}

func (h *AdminHandler) resolveSkillName(ctx context.Context, skillID uuid.UUID) string {
	skill, err := h.queries.GetSkillByID(ctx, skillID)
	if err != nil {
		return ""
	}
	return skill.Name
}

// ListCourses godoc
//
//	@Summary		List all courses (admin)
//	@Description	Returns all courses with search and status filter
//	@Tags			admin
//	@Produce		json
//	@Param			search	query	string	false	"Search by title"
//	@Param			status	query	string	false	"Filter by status (draft/published)"
//	@Success		200	{object}	map[string]interface{}
//	@Failure		403	{object}	map[string]interface{}
//	@Router			/admin/courses [get]
func (h *AdminHandler) ListCourses(c *gin.Context) {
	ctx := c.Request.Context()

	rows, err := h.queries.AdminListCourses(ctx, repository.AdminListCoursesParams{
		Search:       service.NullableText(c.Query("search")),
		StatusFilter: service.NullableText(c.Query("status")),
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to list courses"})
		return
	}

	items := make([]gin.H, len(rows))
	for i, row := range rows {
		items[i] = h.formatCourseResponse(ctx, row)
	}

	c.JSON(http.StatusOK, gin.H{"courses": items})
}

type adminCourseRequest struct {
	Title        string `json:"title" binding:"required"`
	Description  string `json:"description" binding:"required"`
	YoutubeURL   string `json:"youtubeUrl" binding:"required"`
	YoutubeID    string `json:"youtubeId" binding:"required"`
	ThumbnailURL string `json:"thumbnailUrl" binding:"required"`
	ToolID       string `json:"toolId" binding:"required"`
	SkillID      string `json:"skillId" binding:"required"`
	CreatorID    string `json:"creatorId" binding:"required"`
	Difficulty   string `json:"difficulty" binding:"required"`
	Duration     int32  `json:"duration"`
	Status       string `json:"status"`
}

// CreateCourse godoc
//
//	@Summary		Create course
//	@Description	Create a new course
//	@Tags			admin
//	@Accept			json
//	@Produce		json
//	@Param			body	body	object	true	"Course data"
//	@Success		201	{object}	map[string]interface{}
//	@Failure		403	{object}	map[string]interface{}
//	@Router			/admin/courses [post]
func (h *AdminHandler) CreateCourse(c *gin.Context) {
	var req adminCourseRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}

	toolID, err := uuid.Parse(req.ToolID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid tool ID"})
		return
	}
	skillID, err := uuid.Parse(req.SkillID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid skill ID"})
		return
	}
	creatorID, err := uuid.Parse(req.CreatorID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid creator ID"})
		return
	}

	status := repository.CourseStatusDraft
	if req.Status == "published" {
		status = repository.CourseStatusPublished
	}

	course, err := h.queries.AdminCreateCourse(c.Request.Context(), repository.AdminCreateCourseParams{
		Title:        req.Title,
		Description:  req.Description,
		YoutubeUrl:   req.YoutubeURL,
		YoutubeID:    req.YoutubeID,
		ThumbnailUrl: req.ThumbnailURL,
		ToolID:       toolID,
		SkillID:      skillID,
		CreatorID:    creatorID,
		Difficulty:   repository.DifficultyLevel(req.Difficulty),
		Duration:     req.Duration,
		Status:       status,
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create course"})
		return
	}

	c.JSON(http.StatusCreated, h.formatFullCourse(c.Request.Context(), course))
}

// UpdateCourse godoc
//
//	@Summary		Update course
//	@Description	Update an existing course
//	@Tags			admin
//	@Accept			json
//	@Produce		json
//	@Param			id		path	string	true	"Course ID"
//	@Param			body	body	object	true	"Course data"
//	@Success		200	{object}	map[string]interface{}
//	@Failure		403	{object}	map[string]interface{}
//	@Router			/admin/courses/{id} [put]
func (h *AdminHandler) UpdateCourse(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid course ID"})
		return
	}

	var req adminCourseRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}

	toolID, err := uuid.Parse(req.ToolID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid tool ID"})
		return
	}
	skillID, err := uuid.Parse(req.SkillID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid skill ID"})
		return
	}
	creatorID, err := uuid.Parse(req.CreatorID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid creator ID"})
		return
	}

	course, err := h.queries.AdminUpdateCourse(c.Request.Context(), repository.AdminUpdateCourseParams{
		Title:        req.Title,
		Description:  req.Description,
		YoutubeUrl:   req.YoutubeURL,
		YoutubeID:    req.YoutubeID,
		ThumbnailUrl: req.ThumbnailURL,
		ToolID:       toolID,
		SkillID:      skillID,
		CreatorID:    creatorID,
		Difficulty:   repository.DifficultyLevel(req.Difficulty),
		Duration:     req.Duration,
		ID:           id,
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update course"})
		return
	}

	c.JSON(http.StatusOK, h.formatFullCourse(c.Request.Context(), course))
}

// DeleteCourse godoc
//
//	@Summary		Delete course
//	@Description	Delete a course and its questions
//	@Tags			admin
//	@Produce		json
//	@Param			id	path	string	true	"Course ID"
//	@Success		200	{object}	map[string]interface{}
//	@Failure		403	{object}	map[string]interface{}
//	@Router			/admin/courses/{id} [delete]
func (h *AdminHandler) DeleteCourse(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid course ID"})
		return
	}

	if err := h.queries.AdminDeleteCourse(c.Request.Context(), id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete course"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "course deleted"})
}

// TogglePublish godoc
//
//	@Summary		Toggle course publish status
//	@Description	Switch course between draft and published
//	@Tags			admin
//	@Produce		json
//	@Param			id	path	string	true	"Course ID"
//	@Success		200	{object}	map[string]interface{}
//	@Failure		403	{object}	map[string]interface{}
//	@Router			/admin/courses/{id}/publish [put]
func (h *AdminHandler) TogglePublish(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid course ID"})
		return
	}

	ctx := c.Request.Context()

	currentStatus, err := h.queries.AdminGetCourseStatus(ctx, id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "course not found"})
		return
	}

	var course repository.Course
	if currentStatus == repository.CourseStatusPublished {
		course, err = h.queries.AdminUnpublishCourse(ctx, id)
	} else {
		course, err = h.queries.AdminPublishCourse(ctx, id)
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to toggle publish status"})
		return
	}

	c.JSON(http.StatusOK, h.formatFullCourse(ctx, course))
}

// ListUsers godoc
//
//	@Summary		List all users
//	@Description	Returns all users with optional search
//	@Tags			admin
//	@Produce		json
//	@Param			search	query	string	false	"Search by name or email"
//	@Success		200	{object}	map[string]interface{}
//	@Failure		403	{object}	map[string]interface{}
//	@Router			/admin/users [get]
func (h *AdminHandler) ListUsers(c *gin.Context) {
	users, err := h.queries.AdminListUsers(c.Request.Context(), service.NullableText(c.Query("search")))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to list users"})
		return
	}

	items := make([]gin.H, len(users))
	for i, u := range users {
		items[i] = gin.H{
			"id":           u.ID.String(),
			"name":         u.Name,
			"email":        u.Email,
			"avatarUrl":    u.AvatarUrl,
			"provider":     string(u.Provider),
			"isAdmin":      u.IsAdmin,
			"createdAt":    u.CreatedAt.Format(time.RFC3339),
			"lastActiveAt": u.LastActiveAt.Format(time.RFC3339),
		}
	}

	c.JSON(http.StatusOK, gin.H{"users": items})
}

// GetUserProgress godoc
//
//	@Summary		Get user progress (admin)
//	@Description	Returns a user's course progress details
//	@Tags			admin
//	@Produce		json
//	@Param			id	path	string	true	"User ID"
//	@Success		200	{object}	map[string]interface{}
//	@Failure		403	{object}	map[string]interface{}
//	@Router			/admin/users/{id}/progress [get]
func (h *AdminHandler) GetUserProgress(c *gin.Context) {
	userID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user ID"})
		return
	}

	rows, err := h.queries.AdminGetUserProgress(c.Request.Context(), userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get user progress"})
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
		currentQuestion := 0
		if r.CurrentQuestion.Valid {
			currentQuestion = int(r.CurrentQuestion.Int32)
		}

		items[i] = gin.H{
			"courseId":        r.CourseID.String(),
			"courseTitle":     r.CourseTitle,
			"status":          string(r.Status),
			"score":           score,
			"completedAt":     completedAt,
			"currentQuestion": currentQuestion,
			"totalQuestions":  r.TotalQuestions,
		}
	}

	c.JSON(http.StatusOK, gin.H{"progress": items})
}

// ListCategories godoc
//
//	@Summary		List all categories
//	@Description	Returns all tools and skills
//	@Tags			admin
//	@Produce		json
//	@Success		200	{object}	map[string]interface{}
//	@Failure		403	{object}	map[string]interface{}
//	@Router			/admin/categories [get]
func (h *AdminHandler) ListCategories(c *gin.Context) {
	ctx := c.Request.Context()

	tools, err := h.queries.ListTools(ctx)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to list tools"})
		return
	}

	skills, err := h.queries.ListSkills(ctx)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to list skills"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"tools":  tools,
		"skills": skills,
	})
}

type categoryRequest struct {
	Name string `json:"name" binding:"required"`
	Icon string `json:"icon" binding:"required"`
}

// CreateTool godoc
//
//	@Summary		Create tool
//	@Tags			admin
//	@Accept			json
//	@Produce		json
//	@Param			body	body	object	true	"Tool data (name, icon)"
//	@Success		201	{object}	map[string]interface{}
//	@Router			/admin/tools [post]
func (h *AdminHandler) CreateTool(c *gin.Context) {
	var req categoryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "name and icon are required"})
		return
	}

	// Auto-assign order: count existing tools
	tools, err := h.queries.ListTools(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create tool"})
		return
	}

	tool, err := h.queries.AdminCreateTool(c.Request.Context(), repository.AdminCreateToolParams{
		Name:  req.Name,
		Icon:  req.Icon,
		Order: int32(len(tools)),
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create tool"})
		return
	}

	c.JSON(http.StatusCreated, tool)
}

// UpdateTool godoc
//
//	@Summary		Update tool
//	@Tags			admin
//	@Accept			json
//	@Produce		json
//	@Param			id		path	string	true	"Tool ID"
//	@Param			body	body	object	true	"Tool data (name, icon)"
//	@Success		200	{object}	map[string]interface{}
//	@Router			/admin/tools/{id} [put]
func (h *AdminHandler) UpdateTool(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid tool ID"})
		return
	}

	var req categoryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "name and icon are required"})
		return
	}

	tool, err := h.queries.AdminUpdateTool(c.Request.Context(), repository.AdminUpdateToolParams{
		Name: req.Name,
		Icon: req.Icon,
		ID:   id,
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update tool"})
		return
	}

	c.JSON(http.StatusOK, tool)
}

// DeleteTool godoc
//
//	@Summary		Delete tool
//	@Tags			admin
//	@Produce		json
//	@Param			id	path	string	true	"Tool ID"
//	@Success		200	{object}	map[string]interface{}
//	@Router			/admin/tools/{id} [delete]
func (h *AdminHandler) DeleteTool(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid tool ID"})
		return
	}

	if err := h.queries.AdminDeleteTool(c.Request.Context(), id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete tool"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "tool deleted"})
}

type reorderRequest struct {
	IDs []string `json:"ids" binding:"required"`
}

// ReorderTools godoc
//
//	@Summary		Reorder tools
//	@Tags			admin
//	@Accept			json
//	@Produce		json
//	@Param			body	body	object	true	"Ordered tool IDs"
//	@Success		200	{object}	map[string]interface{}
//	@Router			/admin/tools/reorder [put]
func (h *AdminHandler) ReorderTools(c *gin.Context) {
	var req reorderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ids array is required"})
		return
	}

	ctx := c.Request.Context()
	for i, idStr := range req.IDs {
		id, err := uuid.Parse(idStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("invalid ID at index %d", i)})
			return
		}
		if _, execErr := h.queries.DB().Exec(ctx,
			`UPDATE tools SET "order" = $1 WHERE id = $2`,
			i, id,
		); execErr != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to reorder tools"})
			return
		}
	}

	tools, err := h.queries.ListTools(ctx)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to list tools"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"tools": tools})
}

// CreateSkill godoc
//
//	@Summary		Create skill
//	@Tags			admin
//	@Accept			json
//	@Produce		json
//	@Param			body	body	object	true	"Skill data (name, icon)"
//	@Success		201	{object}	map[string]interface{}
//	@Router			/admin/skills [post]
func (h *AdminHandler) CreateSkill(c *gin.Context) {
	var req categoryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "name and icon are required"})
		return
	}

	skills, err := h.queries.ListSkills(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create skill"})
		return
	}

	skill, err := h.queries.AdminCreateSkill(c.Request.Context(), repository.AdminCreateSkillParams{
		Name:  req.Name,
		Icon:  req.Icon,
		Order: int32(len(skills)),
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create skill"})
		return
	}

	c.JSON(http.StatusCreated, skill)
}

// UpdateSkill godoc
//
//	@Summary		Update skill
//	@Tags			admin
//	@Accept			json
//	@Produce		json
//	@Param			id		path	string	true	"Skill ID"
//	@Param			body	body	object	true	"Skill data (name, icon)"
//	@Success		200	{object}	map[string]interface{}
//	@Router			/admin/skills/{id} [put]
func (h *AdminHandler) UpdateSkill(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid skill ID"})
		return
	}

	var req categoryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "name and icon are required"})
		return
	}

	skill, err := h.queries.AdminUpdateSkill(c.Request.Context(), repository.AdminUpdateSkillParams{
		Name: req.Name,
		Icon: req.Icon,
		ID:   id,
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update skill"})
		return
	}

	c.JSON(http.StatusOK, skill)
}

// DeleteSkill godoc
//
//	@Summary		Delete skill
//	@Tags			admin
//	@Produce		json
//	@Param			id	path	string	true	"Skill ID"
//	@Success		200	{object}	map[string]interface{}
//	@Router			/admin/skills/{id} [delete]
func (h *AdminHandler) DeleteSkill(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid skill ID"})
		return
	}

	if err := h.queries.AdminDeleteSkill(c.Request.Context(), id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to delete skill"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "skill deleted"})
}

// ReorderSkills godoc
//
//	@Summary		Reorder skills
//	@Tags			admin
//	@Accept			json
//	@Produce		json
//	@Param			body	body	object	true	"Ordered skill IDs"
//	@Success		200	{object}	map[string]interface{}
//	@Router			/admin/skills/reorder [put]
func (h *AdminHandler) ReorderSkills(c *gin.Context) {
	var req reorderRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ids array is required"})
		return
	}

	ctx := c.Request.Context()
	for i, idStr := range req.IDs {
		id, err := uuid.Parse(idStr)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("invalid ID at index %d", i)})
			return
		}
		if _, execErr := h.queries.DB().Exec(ctx,
			`UPDATE skills SET "order" = $1 WHERE id = $2`,
			i, id,
		); execErr != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to reorder skills"})
			return
		}
	}

	skills, err := h.queries.ListSkills(ctx)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to list skills"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"skills": skills})
}
