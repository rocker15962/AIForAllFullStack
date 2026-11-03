package handler

import (
	"errors"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/rocker15962/AIForAllFullStack/backend/internal/logger"
	"github.com/rocker15962/AIForAllFullStack/backend/internal/middleware"
	"github.com/rocker15962/AIForAllFullStack/backend/internal/service"
	"go.uber.org/zap"
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

// viewerFrom reads the (optional) signed-in user set by the auth middleware.
func viewerFrom(c *gin.Context) service.Viewer {
	v := service.Viewer{}
	if id, ok := c.Get(middleware.ContextKeyUserID); ok {
		if uid, ok := id.(uuid.UUID); ok {
			v.UserID = uid
			v.SignedIn = true
		}
	}
	if isAdmin, ok := c.Get(middleware.ContextKeyIsAdmin); ok {
		v.IsAdmin, _ = isAdmin.(bool)
	}
	return v
}

// writeCourseError maps service errors to HTTP responses.
func writeCourseError(c *gin.Context, err error) {
	switch {
	case errors.Is(err, service.ErrCourseNotFound):
		c.JSON(http.StatusNotFound, gin.H{"error": "course not found"})
	case errors.Is(err, service.ErrQuestionNotInCourse):
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
	case errors.Is(err, service.ErrQuizIncomplete), errors.Is(err, service.ErrNoQuestions):
		c.JSON(http.StatusConflict, gin.H{"error": err.Error()})
	case errors.Is(err, service.ErrGradingUnavailable):
		if logger.L != nil {
			logger.L.Warn("short answer grading failed", zap.Error(err))
		}
		c.JSON(http.StatusServiceUnavailable, gin.H{
			"error": "grading is temporarily unavailable, please try again later",
			"code":  "grading_unavailable",
		})
	default:
		if logger.L != nil {
			logger.L.Error("course request failed", zap.Error(err))
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "something went wrong"})
	}
}

// Get godoc
//
//	@Summary		Get course detail
//	@Description	Returns a course with its questions (without answers). Unpublished courses are visible only to admins or with a valid preview token; archived courses only to admins.
//	@Tags			courses
//	@Produce		json
//	@Param			id		path	string	true	"Course ID"
//	@Param			preview	query	string	false	"Preview token for an unpublished course"
//	@Success		200	{object}	map[string]interface{}
//	@Failure		404	{object}	map[string]interface{}
//	@Router			/courses/{id} [get]
func (h *CourseHandler) Get(c *gin.Context) {
	id, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid course ID"})
		return
	}

	detail, err := h.courseService.GetCourse(c.Request.Context(), id, viewerFrom(c), c.Query("preview"))
	if err != nil {
		writeCourseError(c, err)
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
//	@Description	Grades an answer. Answers to published courses are recorded once per question per round; previews are graded only. Short answers are graded by AI against the sample answer; 503 means try again later (not recorded).
//	@Tags			courses
//	@Accept			json
//	@Produce		json
//	@Param			id		path	string	true	"Course ID"
//	@Param			preview	query	string	false	"Preview token for an unpublished course"
//	@Param			body	body	object	true	"Answer submission"
//	@Success		200	{object}	map[string]interface{}
//	@Failure		401	{object}	map[string]interface{}
//	@Failure		503	{object}	map[string]interface{}
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

	result, err := h.courseService.SubmitAnswer(
		c.Request.Context(),
		viewerFrom(c),
		courseID,
		questionID,
		req.Answer,
		c.Query("preview"),
	)
	if err != nil {
		writeCourseError(c, err)
		return
	}

	c.JSON(http.StatusOK, result)
}

// Start godoc
//
//	@Summary		Start course
//	@Description	Creates the in-progress record once the video has played 10% of its length (idempotent)
//	@Tags			courses
//	@Produce		json
//	@Param			id	path	string	true	"Course ID"
//	@Success		200	{object}	map[string]interface{}
//	@Failure		401	{object}	map[string]interface{}
//	@Router			/courses/{id}/start [post]
func (h *CourseHandler) Start(c *gin.Context) {
	courseID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid course ID"})
		return
	}
	if err := h.courseService.StartCourse(c.Request.Context(), viewerFrom(c).UserID, courseID); err != nil {
		writeCourseError(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"started": true})
}

// MyProgress godoc
//
//	@Summary		My progress in a course
//	@Description	Returns the signed-in learner's current round, used to resume at the first unanswered question
//	@Tags			courses
//	@Produce		json
//	@Param			id	path	string	true	"Course ID"
//	@Success		200	{object}	map[string]interface{}
//	@Failure		401	{object}	map[string]interface{}
//	@Router			/courses/{id}/progress [get]
func (h *CourseHandler) MyProgress(c *gin.Context) {
	courseID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid course ID"})
		return
	}
	progress, err := h.courseService.GetMyProgress(c.Request.Context(), viewerFrom(c).UserID, courseID)
	if err != nil {
		writeCourseError(c, err)
		return
	}
	c.JSON(http.StatusOK, progress)
}

// Complete godoc
//
//	@Summary		Complete course
//	@Description	Scores the current round once every question is answered. 60% or more completes the course and earns the badge; badges are never taken back.
//	@Tags			courses
//	@Produce		json
//	@Param			id	path	string	true	"Course ID"
//	@Success		200	{object}	map[string]interface{}
//	@Failure		401	{object}	map[string]interface{}
//	@Failure		409	{object}	map[string]interface{}
//	@Router			/courses/{id}/complete [post]
func (h *CourseHandler) Complete(c *gin.Context) {
	courseID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid course ID"})
		return
	}

	result, err := h.courseService.CompleteCourse(c.Request.Context(), viewerFrom(c).UserID, courseID)
	if err != nil {
		writeCourseError(c, err)
		return
	}

	c.JSON(http.StatusOK, result)
}

// Retake godoc
//
//	@Summary		Retake course quiz
//	@Description	Starts a new round: previous answers and score are replaced; an earned badge is kept
//	@Tags			courses
//	@Produce		json
//	@Param			id	path	string	true	"Course ID"
//	@Success		200	{object}	map[string]interface{}
//	@Failure		401	{object}	map[string]interface{}
//	@Router			/courses/{id}/retake [post]
func (h *CourseHandler) Retake(c *gin.Context) {
	courseID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid course ID"})
		return
	}
	if err := h.courseService.RetakeCourse(c.Request.Context(), viewerFrom(c).UserID, courseID); err != nil {
		writeCourseError(c, err)
		return
	}
	c.JSON(http.StatusOK, gin.H{"retake": true})
}

// Recommended godoc
//
//	@Summary		Get recommended courses
//	@Description	Up to 4 published courses with the same tool or skill, excluding this course and, when signed in, courses the learner has completed
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

	courses, err := h.courseService.GetRecommended(c.Request.Context(), courseID, viewerFrom(c))
	if err != nil {
		writeCourseError(c, err)
		return
	}

	c.JSON(http.StatusOK, gin.H{"courses": courses})
}
