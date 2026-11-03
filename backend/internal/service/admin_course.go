package service

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"strings"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/rocker15962/AIForAllFullStack/backend/internal/repository"
)

// TxBeginner starts a database transaction (*pgxpool.Pool implements it).
type TxBeginner interface {
	Begin(ctx context.Context) (pgx.Tx, error)
}

// ValidationError is a problem with admin input; handlers return it as 400.
type ValidationError struct {
	Message string
}

func (e *ValidationError) Error() string { return e.Message }

func invalid(format string, args ...any) error {
	return &ValidationError{Message: fmt.Sprintf(format, args...)}
}

// QuestionOptionInput is one multiple-choice option.
type QuestionOptionInput struct {
	ID   string `json:"id"`
	Text string `json:"text"`
}

// QuestionInput is a question as edited in the course editor. ID is the existing question's
// UUID, or empty / a temporary client ID for a new question.
type QuestionInput struct {
	ID            string                `json:"id"`
	Type          string                `json:"type"`
	Question      string                `json:"question"`
	Options       []QuestionOptionInput `json:"options"`
	CorrectAnswer string                `json:"correctAnswer"`
	SampleAnswer  string                `json:"sampleAnswer"`
	Explanation   string                `json:"explanation"`
}

// CourseInput is the course editor's payload.
type CourseInput struct {
	Title        string
	Description  string
	YoutubeURL   string
	YoutubeID    string
	ThumbnailURL string
	ToolID       uuid.UUID
	SkillID      uuid.UUID
	CreatorID    uuid.UUID
	Difficulty   string
	// Duration is the video length in seconds (BR-28); required, used for the 10% start rule.
	Duration int32
	// Status is "draft", "published", or empty to keep the current status.
	Status string
	// Questions replaces the course's questions in order when non-nil (BR-29).
	// Nil leaves the questions untouched.
	Questions *[]QuestionInput
}

// AdminCourseService saves a course and its questions together.
type AdminCourseService struct {
	db TxBeginner
}

func NewAdminCourseService(db TxBeginner) *AdminCourseService {
	return &AdminCourseService{db: db}
}

func validateCourseInput(in CourseInput) error {
	switch {
	case strings.TrimSpace(in.Title) == "":
		return invalid("Title is required")
	case strings.TrimSpace(in.Description) == "":
		return invalid("Description is required")
	case in.Duration <= 0:
		return invalid("Video length is required")
	}
	switch repository.DifficultyLevel(in.Difficulty) {
	case repository.DifficultyLevelBeginner, repository.DifficultyLevelIntermediate, repository.DifficultyLevelAdvanced:
	default:
		return invalid("Invalid difficulty")
	}
	switch in.Status {
	case "", "draft", "published":
	default:
		return invalid("Invalid status")
	}
	if in.Questions == nil {
		return nil
	}
	for i, q := range *in.Questions {
		n := i + 1
		if strings.TrimSpace(q.Question) == "" {
			return invalid("Question %d: question text is required", n)
		}
		switch repository.QuestionType(q.Type) {
		case repository.QuestionTypeMultipleChoice:
			if len(q.Options) != 4 {
				return invalid("Question %d: multiple choice needs 4 options", n)
			}
			found := false
			seen := map[string]bool{}
			for _, o := range q.Options {
				if strings.TrimSpace(o.ID) == "" || strings.TrimSpace(o.Text) == "" {
					return invalid("Question %d: all options are required", n)
				}
				if seen[o.ID] {
					return invalid("Question %d: option IDs must be unique", n)
				}
				seen[o.ID] = true
				if o.ID == q.CorrectAnswer {
					found = true
				}
			}
			if !found {
				return invalid("Question %d: select the correct answer", n)
			}
		case repository.QuestionTypeShortAnswer:
			if strings.TrimSpace(q.SampleAnswer) == "" {
				return invalid("Question %d: sample answer is required", n)
			}
		default:
			return invalid("Question %d: invalid question type", n)
		}
	}
	return nil
}

// SaveCourse creates (id == nil) or updates a course, applies its status, and replaces its
// questions in one transaction.
func (s *AdminCourseService) SaveCourse(ctx context.Context, id *uuid.UUID, in CourseInput) (repository.Course, error) {
	if err := validateCourseInput(in); err != nil {
		return repository.Course{}, err
	}

	tx, err := s.db.Begin(ctx)
	if err != nil {
		return repository.Course{}, fmt.Errorf("begin: %w", err)
	}
	defer func() { _ = tx.Rollback(ctx) }()
	q := repository.New(tx)

	var course repository.Course
	if id == nil {
		status := repository.CourseStatusDraft
		if in.Status == "published" {
			status = repository.CourseStatusPublished
		}
		course, err = q.AdminCreateCourse(ctx, repository.AdminCreateCourseParams{
			Title:        in.Title,
			Description:  in.Description,
			YoutubeUrl:   in.YoutubeURL,
			YoutubeID:    in.YoutubeID,
			ThumbnailUrl: in.ThumbnailURL,
			ToolID:       in.ToolID,
			SkillID:      in.SkillID,
			CreatorID:    in.CreatorID,
			Difficulty:   repository.DifficultyLevel(in.Difficulty),
			Duration:     in.Duration,
			Status:       status,
		})
		if err != nil {
			return repository.Course{}, fmt.Errorf("create course: %w", err)
		}
	} else {
		course, err = q.AdminUpdateCourse(ctx, repository.AdminUpdateCourseParams{
			Title:        in.Title,
			Description:  in.Description,
			YoutubeUrl:   in.YoutubeURL,
			YoutubeID:    in.YoutubeID,
			ThumbnailUrl: in.ThumbnailURL,
			ToolID:       in.ToolID,
			SkillID:      in.SkillID,
			CreatorID:    in.CreatorID,
			Difficulty:   repository.DifficultyLevel(in.Difficulty),
			Duration:     in.Duration,
			ID:           *id,
		})
		if err != nil {
			if errors.Is(err, pgx.ErrNoRows) {
				return repository.Course{}, ErrCourseNotFound
			}
			return repository.Course{}, fmt.Errorf("update course: %w", err)
		}
		course, err = applyStatus(ctx, q, course, in.Status)
		if err != nil {
			return repository.Course{}, err
		}
	}

	if in.Questions != nil {
		if err := replaceQuestions(ctx, q, course.ID, *in.Questions); err != nil {
			return repository.Course{}, err
		}
	}

	if err := tx.Commit(ctx); err != nil {
		return repository.Course{}, fmt.Errorf("commit: %w", err)
	}
	return course, nil
}

func applyStatus(ctx context.Context, q *repository.Queries, course repository.Course, status string) (repository.Course, error) {
	var err error
	switch {
	case status == "published" && course.Status != repository.CourseStatusPublished:
		if course.Status == repository.CourseStatusArchived {
			if course, err = q.AdminRestoreCourse(ctx, course.ID); err != nil {
				return course, fmt.Errorf("restore course: %w", err)
			}
		}
		course, err = q.AdminPublishCourse(ctx, course.ID)
	case status == "draft" && course.Status == repository.CourseStatusPublished:
		course, err = q.AdminUnpublishCourse(ctx, course.ID)
	case status == "draft" && course.Status == repository.CourseStatusArchived:
		course, err = q.AdminRestoreCourse(ctx, course.ID)
	}
	if err != nil {
		return course, fmt.Errorf("set course status: %w", err)
	}
	return course, nil
}

// replaceQuestions makes the course's questions exactly `inputs`, in that order.
// Questions missing from the list are deleted. The (course_id, order) unique constraint is
// deferred to commit, so orders can be swapped freely here.
func replaceQuestions(ctx context.Context, q *repository.Queries, courseID uuid.UUID, inputs []QuestionInput) error {
	keep := make([]uuid.UUID, 0, len(inputs))
	ids := make([]*uuid.UUID, len(inputs))
	for i, in := range inputs {
		if id, err := uuid.Parse(in.ID); err == nil {
			keep = append(keep, id)
			ids[i] = &id
		}
	}
	if err := q.AdminDeleteQuestionsNotIn(ctx, repository.AdminDeleteQuestionsNotInParams{
		CourseID: courseID,
		KeepIds:  keep,
	}); err != nil {
		return fmt.Errorf("delete removed questions: %w", err)
	}

	for i, in := range inputs {
		qType := repository.QuestionType(in.Type)
		var options []byte
		correct := ""
		sample := strings.TrimSpace(in.SampleAnswer)
		if qType == repository.QuestionTypeMultipleChoice {
			options, _ = json.Marshal(in.Options)
			correct = in.CorrectAnswer
			sample = ""
		}
		order := int32(i + 1)

		if ids[i] != nil {
			_, err := q.AdminUpdateQuestion(ctx, repository.AdminUpdateQuestionParams{
				Type:          qType,
				Question:      strings.TrimSpace(in.Question),
				Options:       options,
				CorrectAnswer: correct,
				SampleAnswer:  sample,
				Explanation:   strings.TrimSpace(in.Explanation),
				Order:         order,
				ID:            *ids[i],
				CourseID:      courseID,
			})
			if errors.Is(err, pgx.ErrNoRows) {
				return invalid("Question %d does not belong to this course", i+1)
			}
			if err != nil {
				return fmt.Errorf("update question %d: %w", i+1, err)
			}
			continue
		}

		if _, err := q.AdminInsertQuestion(ctx, repository.AdminInsertQuestionParams{
			CourseID:      courseID,
			Type:          qType,
			Question:      strings.TrimSpace(in.Question),
			Options:       options,
			CorrectAnswer: correct,
			SampleAnswer:  sample,
			Explanation:   strings.TrimSpace(in.Explanation),
			Order:         order,
		}); err != nil {
			return fmt.Errorf("insert question %d: %w", i+1, err)
		}
	}
	return nil
}

// NewPreviewToken returns a random, URL-safe token for a course preview link (BR-05).
func NewPreviewToken() (string, error) {
	b := make([]byte, 24)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return base64.RawURLEncoding.EncodeToString(b), nil
}
