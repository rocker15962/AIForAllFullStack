package handler

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/rocker15962/AIForAllFullStack/backend/internal/middleware"
	"github.com/rocker15962/AIForAllFullStack/backend/internal/service"
)

type CourseHandler struct {
	courseService *service.CourseService
}

func NewCourseHandler(courseService *service.CourseService) *CourseHandler {
	return &CourseHandler{courseService: courseService}
}

// List godoc
//
//	@Summary		List courses
//	@Description	Returns paginated courses with optional search and filters
//	@Tags			courses
//	@Produce		json
//	@Param			page		query	int		false	"Page number"		default(1)
//	@Param			limit		query	int		false	"Items per page"	default(20)
//	@Param			search		query	string	false	"Search keyword"
//	@Param			tool_id		query	string	false	"Filter by tool ID"
//	@Param			skill_id	query	string	false	"Filter by skill ID"
//	@Param			difficulty	query	string	false	"Filter by difficulty"
//	@Success		200	{object}	map[string]interface{}
//	@Router			/courses [get]
func (h *CourseHandler) List(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))

	result, err := h.courseService.ListCourses(c.Request.Context(), service.ListCoursesParams{
		Search:     c.Query("search"),
		ToolID:     c.Query("tool_id"),
		SkillID:    c.Query("skill_id"),
		Difficulty: c.Query("difficulty"),
		Page:       page,
		Limit:      limit,
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to list courses"})
		return
	}

	c.JSON(http.StatusOK, result)
}

// Get godoc
//
//	@Summary		Get course detail
//	@Description	Returns course with questions
//	@Tags			courses
//	@Produce		json
//	@Param			id	path	string	true	"Course ID"
//	@Success		200	{object}	map[string]interface{}
//	@Failure		404	{object}	map[string]interface{}
//	@Router			/courses/{id} [get]
func (h *CourseHandler) Get(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid course ID"})
		return
	}

	detail, err := h.courseService.GetCourse(c.Request.Context(), id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "course not found"})
		return
	}

	c.JSON(http.StatusOK, detail)
}

type submitRequest struct {
	QuestionID string `json:"questionId" binding:"required"`
	Answer     string `json:"answer" binding:"required"`
}

// Submit godoc
//
//	@Summary		Submit quiz answer
//	@Description	Submit an answer for a course question
//	@Tags			courses
//	@Accept			json
//	@Produce		json
//	@Param			id		path	string	true	"Course ID"
//	@Param			body	body	object	true	"Answer submission"
//	@Success		200	{object}	map[string]interface{}
//	@Failure		401	{object}	map[string]interface{}
//	@Router			/courses/{id}/submit [post]
func (h *CourseHandler) Submit(c *gin.Context) {
	courseID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid course ID"})
		return
	}

	var req submitRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}

	questionID, err := uuid.Parse(req.QuestionID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid question ID"})
		return
	}

	userID, _ := c.Get(middleware.ContextKeyUserID)

	result, err := h.courseService.SubmitAnswer(
		c.Request.Context(),
		userID.(uuid.UUID),
		courseID,
		questionID,
		req.Answer,
	)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, result)
}

// Complete godoc
//
//	@Summary		Complete course
//	@Description	Mark a course as completed and calculate score
//	@Tags			courses
//	@Produce		json
//	@Param			id	path	string	true	"Course ID"
//	@Success		200	{object}	map[string]interface{}
//	@Failure		401	{object}	map[string]interface{}
//	@Router			/courses/{id}/complete [post]
func (h *CourseHandler) Complete(c *gin.Context) {
	courseID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid course ID"})
		return
	}

	userID, _ := c.Get(middleware.ContextKeyUserID)

	result, err := h.courseService.CompleteCourse(c.Request.Context(), userID.(uuid.UUID), courseID)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, result)
}

// Recommended godoc
//
//	@Summary		Get recommended courses
//	@Description	Returns recommended courses based on the current course
//	@Tags			courses
//	@Produce		json
//	@Param			id	path	string	true	"Course ID"
//	@Success		200	{object}	map[string]interface{}
//	@Router			/courses/{id}/recommended [get]
func (h *CourseHandler) Recommended(c *gin.Context) {
	courseID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid course ID"})
		return
	}

	courses, err := h.courseService.GetRecommended(c.Request.Context(), courseID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "course not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"courses": courses})
}
