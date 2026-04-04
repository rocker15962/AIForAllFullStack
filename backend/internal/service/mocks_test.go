package service

import (
	"context"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/rocker15962/AIForAllFullStack/backend/internal/repository"
)

// mockUserRepo
type mockUserRepo struct {
	users map[string]repository.User // keyed by email
}

func newMockUserRepo() *mockUserRepo {
	return &mockUserRepo{users: make(map[string]repository.User)}
}

func (m *mockUserRepo) FindUserByEmail(ctx context.Context, email string) (repository.User, error) {
	u, ok := m.users[email]
	if !ok {
		return repository.User{}, pgx.ErrNoRows
	}
	return u, nil
}

func (m *mockUserRepo) CreateUser(ctx context.Context, arg repository.CreateUserParams) (repository.User, error) {
	u := repository.User{
		ID:        uuid.New(),
		Name:      arg.Name,
		Email:     arg.Email,
		AvatarUrl: arg.AvatarUrl,
		Provider:  arg.Provider,
	}
	m.users[arg.Email] = u
	return u, nil
}

func (m *mockUserRepo) UpdateUser(ctx context.Context, arg repository.UpdateUserParams) (repository.User, error) {
	for email, u := range m.users {
		if u.ID == arg.ID {
			u.Name = arg.Name
			u.AvatarUrl = arg.AvatarUrl
			m.users[email] = u
			return u, nil
		}
	}
	return repository.User{}, pgx.ErrNoRows
}

func (m *mockUserRepo) GetUserByID(ctx context.Context, id uuid.UUID) (repository.User, error) {
	for _, u := range m.users {
		if u.ID == id {
			return u, nil
		}
	}
	return repository.User{}, pgx.ErrNoRows
}

// mockCourseRepo
type mockCourseRepo struct {
	courses []repository.ListCoursesRow
	detail  map[uuid.UUID]repository.Course
}

func (m *mockCourseRepo) ListCourses(ctx context.Context, arg repository.ListCoursesParams) ([]repository.ListCoursesRow, error) {
	return m.courses, nil
}

func (m *mockCourseRepo) CountCourses(ctx context.Context, arg repository.CountCoursesParams) (int64, error) {
	return int64(len(m.courses)), nil
}

func (m *mockCourseRepo) GetCourseByID(ctx context.Context, id uuid.UUID) (repository.Course, error) {
	c, ok := m.detail[id]
	if !ok {
		return repository.Course{}, pgx.ErrNoRows
	}
	return c, nil
}

func (m *mockCourseRepo) GetRecommendedCourses(ctx context.Context, arg repository.GetRecommendedCoursesParams) ([]repository.Course, error) {
	return nil, nil
}

// mockQuestionRepo
type mockQuestionRepo struct {
	questions map[uuid.UUID][]repository.Question // keyed by courseID
	byID      map[uuid.UUID]repository.Question
}

func (m *mockQuestionRepo) GetQuestionsByCourse(ctx context.Context, courseID uuid.UUID) ([]repository.Question, error) {
	return m.questions[courseID], nil
}

func (m *mockQuestionRepo) GetQuestionByID(ctx context.Context, id uuid.UUID) (repository.Question, error) {
	q, ok := m.byID[id]
	if !ok {
		return repository.Question{}, pgx.ErrNoRows
	}
	return q, nil
}

// mockToolRepo
type mockToolRepo struct {
	tools map[uuid.UUID]repository.Tool
}

func (m *mockToolRepo) ListTools(ctx context.Context) ([]repository.Tool, error) {
	var result []repository.Tool
	for _, t := range m.tools {
		result = append(result, t)
	}
	return result, nil
}

func (m *mockToolRepo) GetToolByID(ctx context.Context, id uuid.UUID) (repository.Tool, error) {
	t, ok := m.tools[id]
	if !ok {
		return repository.Tool{}, pgx.ErrNoRows
	}
	return t, nil
}

// mockSkillRepo
type mockSkillRepo struct {
	skills map[uuid.UUID]repository.Skill
}

func (m *mockSkillRepo) ListSkills(ctx context.Context) ([]repository.Skill, error) {
	var result []repository.Skill
	for _, s := range m.skills {
		result = append(result, s)
	}
	return result, nil
}

func (m *mockSkillRepo) GetSkillByID(ctx context.Context, id uuid.UUID) (repository.Skill, error) {
	s, ok := m.skills[id]
	if !ok {
		return repository.Skill{}, pgx.ErrNoRows
	}
	return s, nil
}

// mockCreatorRepo
type mockCreatorRepo struct {
	creators map[uuid.UUID]repository.Creator
}

func (m *mockCreatorRepo) GetCreatorByID(ctx context.Context, id uuid.UUID) (repository.Creator, error) {
	c, ok := m.creators[id]
	if !ok {
		return repository.Creator{}, pgx.ErrNoRows
	}
	return c, nil
}

// mockProgressRepo
type mockProgressRepo struct {
	progress map[string]repository.Progress // keyed by "userID:courseID"
}

func progressKey(userID, courseID uuid.UUID) string {
	return userID.String() + ":" + courseID.String()
}

func (m *mockProgressRepo) GetProgress(ctx context.Context, arg repository.GetProgressParams) (repository.Progress, error) {
	p, ok := m.progress[progressKey(arg.UserID, arg.CourseID)]
	if !ok {
		return repository.Progress{}, pgx.ErrNoRows
	}
	return p, nil
}

func (m *mockProgressRepo) CreateProgress(ctx context.Context, arg repository.CreateProgressParams) (repository.Progress, error) {
	p := repository.Progress{
		ID:              uuid.New(),
		UserID:          arg.UserID,
		CourseID:        arg.CourseID,
		CurrentQuestion: arg.CurrentQuestion,
		Answers:         arg.Answers,
	}
	m.progress[progressKey(arg.UserID, arg.CourseID)] = p
	return p, nil
}

func (m *mockProgressRepo) UpdateProgressAnswers(ctx context.Context, arg repository.UpdateProgressAnswersParams) (repository.Progress, error) {
	key := progressKey(arg.UserID, arg.CourseID)
	p, ok := m.progress[key]
	if !ok {
		return repository.Progress{}, pgx.ErrNoRows
	}
	p.Answers = arg.Answers
	p.CurrentQuestion = arg.CurrentQuestion
	m.progress[key] = p
	return p, nil
}

func (m *mockProgressRepo) CompleteProgress(ctx context.Context, arg repository.CompleteProgressParams) (repository.Progress, error) {
	key := progressKey(arg.UserID, arg.CourseID)
	p, ok := m.progress[key]
	if !ok {
		return repository.Progress{}, pgx.ErrNoRows
	}
	p.Score = arg.Score
	m.progress[key] = p
	return p, nil
}
