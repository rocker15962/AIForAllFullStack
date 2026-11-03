package service

import (
	"context"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/rocker15962/AIForAllFullStack/backend/internal/repository"
)

type UserRepository interface {
	FindUserByEmail(ctx context.Context, email string) (repository.User, error)
	CreateUser(ctx context.Context, arg repository.CreateUserParams) (repository.User, error)
	UpdateUser(ctx context.Context, arg repository.UpdateUserParams) (repository.User, error)
	GetUserByID(ctx context.Context, id uuid.UUID) (repository.User, error)
	RecordUserActivity(ctx context.Context, id uuid.UUID) error
}

type CourseRepository interface {
	ListCourses(ctx context.Context, arg repository.ListCoursesParams) ([]repository.ListCoursesRow, error)
	CountCourses(ctx context.Context, arg repository.CountCoursesParams) (int64, error)
	GetCourseByID(ctx context.Context, id uuid.UUID) (repository.Course, error)
	GetRecommendedCourses(ctx context.Context, arg repository.GetRecommendedCoursesParams) ([]repository.Course, error)
}

type QuestionRepository interface {
	GetQuestionsByCourse(ctx context.Context, courseID uuid.UUID) ([]repository.Question, error)
	GetQuestionByID(ctx context.Context, id uuid.UUID) (repository.Question, error)
}

type ToolRepository interface {
	ListTools(ctx context.Context) ([]repository.Tool, error)
	GetToolByID(ctx context.Context, id uuid.UUID) (repository.Tool, error)
}

type SkillRepository interface {
	ListSkills(ctx context.Context) ([]repository.Skill, error)
	GetSkillByID(ctx context.Context, id uuid.UUID) (repository.Skill, error)
}

type CreatorRepository interface {
	GetCreatorByID(ctx context.Context, id uuid.UUID) (repository.Creator, error)
	ListCreators(ctx context.Context) ([]repository.Creator, error)
}

type ProgressRepository interface {
	GetProgress(ctx context.Context, arg repository.GetProgressParams) (repository.Progress, error)
	CreateProgress(ctx context.Context, arg repository.CreateProgressParams) (repository.Progress, error)
	UpdateProgressAnswers(ctx context.Context, arg repository.UpdateProgressAnswersParams) (repository.Progress, error)
	StartProgress(ctx context.Context, arg repository.StartProgressParams) error
	FinishAttempt(ctx context.Context, arg repository.FinishAttemptParams) (repository.Progress, error)
	RetakeProgress(ctx context.Context, arg repository.RetakeProgressParams) (repository.Progress, error)
}

// Ensure *repository.Queries implements all interfaces.
var _ UserRepository = (*repository.Queries)(nil)
var _ CourseRepository = (*repository.Queries)(nil)
var _ QuestionRepository = (*repository.Queries)(nil)
var _ ToolRepository = (*repository.Queries)(nil)
var _ SkillRepository = (*repository.Queries)(nil)
var _ CreatorRepository = (*repository.Queries)(nil)
var _ ProgressRepository = (*repository.Queries)(nil)

// GetProgressParams re-export for convenience.
type GetProgressParams = repository.GetProgressParams

// pgtype helpers for building nullable query params.
func NullableText(s string) pgtype.Text {
	if s == "" {
		return pgtype.Text{Valid: false}
	}
	return pgtype.Text{String: s, Valid: true}
}

func NullableUUID(s string) pgtype.UUID {
	if s == "" {
		return pgtype.UUID{Valid: false}
	}
	id, err := uuid.Parse(s)
	if err != nil {
		return pgtype.UUID{Valid: false}
	}
	return pgtype.UUID{Bytes: id, Valid: true}
}
