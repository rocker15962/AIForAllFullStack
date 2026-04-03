package service

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"strings"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/rocker15962/AIForAllFullStack/backend/internal/repository"
)

type CourseService struct {
	courses   CourseRepository
	questions QuestionRepository
	tools     ToolRepository
	skills    SkillRepository
	creators  CreatorRepository
	progress  ProgressRepository
}

func NewCourseService(
	courses CourseRepository,
	questions QuestionRepository,
	tools ToolRepository,
	skills SkillRepository,
	creators CreatorRepository,
	progress ProgressRepository,
) *CourseService {
	return &CourseService{
		courses:   courses,
		questions: questions,
		tools:     tools,
		skills:    skills,
		creators:  creators,
		progress:  progress,
	}
}

type ListCoursesParams struct {
	Search     string
	ToolID     string
	SkillID    string
	Difficulty string
	Page       int
	Limit      int
}

type CourseListItem struct {
	ID            uuid.UUID `json:"id"`
	Title         string    `json:"title"`
	Description   string    `json:"description"`
	ThumbnailUrl  string    `json:"thumbnailUrl"`
	Difficulty    string    `json:"difficulty"`
	Duration      int32     `json:"duration"`
	ToolID        uuid.UUID `json:"toolId"`
	SkillID       uuid.UUID `json:"skillId"`
	CreatorID     uuid.UUID `json:"creatorId"`
	QuestionCount int32     `json:"questionCount"`
}

type CourseListResult struct {
	Courses []CourseListItem `json:"courses"`
	Total   int64            `json:"total"`
	Page    int              `json:"page"`
	Limit   int              `json:"limit"`
}

func (s *CourseService) ListCourses(ctx context.Context, params ListCoursesParams) (*CourseListResult, error) {
	if params.Page < 1 {
		params.Page = 1
	}
	if params.Limit < 1 || params.Limit > 50 {
		params.Limit = 20
	}
	offset := (params.Page - 1) * params.Limit

	dbParams := repository.ListCoursesParams{
		Search:     NullableText(params.Search),
		ToolID:     NullableUUID(params.ToolID),
		SkillID:    NullableUUID(params.SkillID),
		Difficulty: NullableText(params.Difficulty),
		OffsetVal:  int32(offset),
		LimitVal:   int32(params.Limit),
	}

	rows, err := s.courses.ListCourses(ctx, dbParams)
	if err != nil {
		return nil, fmt.Errorf("list courses: %w", err)
	}

	countParams := repository.CountCoursesParams{
		Search:     dbParams.Search,
		ToolID:     dbParams.ToolID,
		SkillID:    dbParams.SkillID,
		Difficulty: dbParams.Difficulty,
	}
	total, err := s.courses.CountCourses(ctx, countParams)
	if err != nil {
		return nil, fmt.Errorf("count courses: %w", err)
	}

	items := make([]CourseListItem, len(rows))
	for i, r := range rows {
		items[i] = CourseListItem{
			ID:            r.ID,
			Title:         r.Title,
			Description:   r.Description,
			ThumbnailUrl:  r.ThumbnailUrl,
			Difficulty:    string(r.Difficulty),
			Duration:      r.Duration,
			ToolID:        r.ToolID,
			SkillID:       r.SkillID,
			CreatorID:     r.CreatorID,
			QuestionCount: r.QuestionCount,
		}
	}

	return &CourseListResult{
		Courses: items,
		Total:   total,
		Page:    params.Page,
		Limit:   params.Limit,
	}, nil
}

type CourseDetail struct {
	ID           uuid.UUID        `json:"id"`
	Title        string           `json:"title"`
	Description  string           `json:"description"`
	YoutubeID    string           `json:"youtubeId"`
	ThumbnailUrl string           `json:"thumbnailUrl"`
	Difficulty   string           `json:"difficulty"`
	Duration     int32            `json:"duration"`
	Tool         CategoryItem     `json:"tool"`
	Skill        CategoryItem     `json:"skill"`
	Creator      CreatorItem      `json:"creator"`
	Questions    []QuestionItem   `json:"questions"`
}

type CategoryItem struct {
	ID   uuid.UUID `json:"id"`
	Name string    `json:"name"`
	Icon string    `json:"icon"`
}

type CreatorItem struct {
	ID         uuid.UUID `json:"id"`
	Name       string    `json:"name"`
	AvatarUrl  string    `json:"avatarUrl"`
	ChannelUrl string    `json:"channelUrl"`
}

type QuestionItem struct {
	ID       uuid.UUID        `json:"id"`
	Type     string           `json:"type"`
	Question string           `json:"question"`
	Options  json.RawMessage  `json:"options,omitempty"`
	Order    int32            `json:"order"`
}

func (s *CourseService) GetCourse(ctx context.Context, id uuid.UUID) (*CourseDetail, error) {
	course, err := s.courses.GetCourseByID(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("get course: %w", err)
	}

	tool, err := s.tools.GetToolByID(ctx, course.ToolID)
	if err != nil {
		return nil, fmt.Errorf("get tool: %w", err)
	}

	skill, err := s.skills.GetSkillByID(ctx, course.SkillID)
	if err != nil {
		return nil, fmt.Errorf("get skill: %w", err)
	}

	creator, err := s.creators.GetCreatorByID(ctx, course.CreatorID)
	if err != nil {
		return nil, fmt.Errorf("get creator: %w", err)
	}

	questions, err := s.questions.GetQuestionsByCourse(ctx, id)
	if err != nil {
		return nil, fmt.Errorf("get questions: %w", err)
	}

	qItems := make([]QuestionItem, len(questions))
	for i, q := range questions {
		qItems[i] = QuestionItem{
			ID:       q.ID,
			Type:     string(q.Type),
			Question: q.Question,
			Options:  q.Options,
			Order:    q.Order,
		}
	}

	return &CourseDetail{
		ID:           course.ID,
		Title:        course.Title,
		Description:  course.Description,
		YoutubeID:    course.YoutubeID,
		ThumbnailUrl: course.ThumbnailUrl,
		Difficulty:   string(course.Difficulty),
		Duration:     course.Duration,
		Tool:         CategoryItem{ID: tool.ID, Name: tool.Name, Icon: tool.Icon},
		Skill:        CategoryItem{ID: skill.ID, Name: skill.Name, Icon: skill.Icon},
		Creator:      CreatorItem{ID: creator.ID, Name: creator.Name, AvatarUrl: creator.AvatarUrl, ChannelUrl: creator.ChannelUrl},
		Questions:    qItems,
	}, nil
}

type SubmitAnswerResult struct {
	Correct       bool   `json:"correct"`
	CorrectAnswer string `json:"correctAnswer"`
	Explanation   string `json:"explanation"`
}

func (s *CourseService) SubmitAnswer(ctx context.Context, userID, courseID, questionID uuid.UUID, answer string) (*SubmitAnswerResult, error) {
	question, err := s.questions.GetQuestionByID(ctx, questionID)
	if err != nil {
		return nil, fmt.Errorf("get question: %w", err)
	}

	if question.CourseID != courseID {
		return nil, errors.New("question does not belong to this course")
	}

	correct := validateAnswer(question, answer)

	// Update progress
	prog, err := s.progress.GetProgress(ctx, repository.GetProgressParams{UserID: userID, CourseID: courseID})
	if err != nil {
		if !errors.Is(err, pgx.ErrNoRows) {
			return nil, fmt.Errorf("get progress: %w", err)
		}
		// Create new progress
		answersJSON, _ := json.Marshal([]map[string]interface{}{
			{"questionId": questionID.String(), "answer": answer, "isCorrect": correct},
		})
		_, err = s.progress.CreateProgress(ctx, repository.CreateProgressParams{
			UserID:          userID,
			CourseID:        courseID,
			CurrentQuestion: pgtype.Int4{Int32: 1, Valid: true},
			Answers:         answersJSON,
		})
		if err != nil {
			return nil, fmt.Errorf("create progress: %w", err)
		}
	} else {
		// Append answer
		var answers []map[string]interface{}
		json.Unmarshal(prog.Answers, &answers)
		answers = append(answers, map[string]interface{}{
			"questionId": questionID.String(), "answer": answer, "isCorrect": correct,
		})
		answersJSON, _ := json.Marshal(answers)
		_, err = s.progress.UpdateProgressAnswers(ctx, repository.UpdateProgressAnswersParams{
			Answers:         answersJSON,
			CurrentQuestion: pgtype.Int4{Int32: int32(len(answers)), Valid: true},
			UserID:          userID,
			CourseID:        courseID,
		})
		if err != nil {
			return nil, fmt.Errorf("update progress: %w", err)
		}
	}

	return &SubmitAnswerResult{
		Correct:       correct,
		CorrectAnswer: question.CorrectAnswer,
		Explanation:   question.Explanation,
	}, nil
}

func validateAnswer(question repository.Question, answer string) bool {
	switch question.Type {
	case repository.QuestionTypeMultipleChoice:
		return answer == question.CorrectAnswer
	case repository.QuestionTypeShortAnswer:
		if question.AcceptableKeywords == nil {
			return answer != ""
		}
		var keywords []string
		json.Unmarshal(question.AcceptableKeywords, &keywords)
		lower := strings.ToLower(answer)
		for _, kw := range keywords {
			if strings.Contains(lower, strings.ToLower(kw)) {
				return true
			}
		}
		return false
	default:
		return false
	}
}

type CompleteResult struct {
	Score          float64 `json:"score"`
	TotalQuestions int     `json:"totalQuestions"`
	CorrectAnswers int    `json:"correctAnswers"`
}

func (s *CourseService) CompleteCourse(ctx context.Context, userID, courseID uuid.UUID) (*CompleteResult, error) {
	prog, err := s.progress.GetProgress(ctx, repository.GetProgressParams{UserID: userID, CourseID: courseID})
	if err != nil {
		return nil, fmt.Errorf("get progress: %w", err)
	}

	var answers []map[string]interface{}
	json.Unmarshal(prog.Answers, &answers)

	correctCount := 0
	for _, a := range answers {
		if isCorrect, ok := a["isCorrect"].(bool); ok && isCorrect {
			correctCount++
		}
	}

	total := len(answers)
	score := float64(0)
	if total > 0 {
		score = float64(correctCount) / float64(total) * 100
	}

	scoreNumeric := pgtype.Numeric{}
	scoreNumeric.Scan(fmt.Sprintf("%.2f", score))

	_, err = s.progress.CompleteProgress(ctx, repository.CompleteProgressParams{
		Score:    scoreNumeric,
		UserID:   userID,
		CourseID: courseID,
	})
	if err != nil {
		return nil, fmt.Errorf("complete progress: %w", err)
	}

	return &CompleteResult{
		Score:          score,
		TotalQuestions: total,
		CorrectAnswers: correctCount,
	}, nil
}

type RecommendedCourse struct {
	ID           uuid.UUID `json:"id"`
	Title        string    `json:"title"`
	ThumbnailUrl string    `json:"thumbnailUrl"`
	Difficulty   string    `json:"difficulty"`
	ToolName     string    `json:"toolName"`
	SkillName    string    `json:"skillName"`
}

func (s *CourseService) GetRecommended(ctx context.Context, courseID uuid.UUID) ([]RecommendedCourse, error) {
	course, err := s.courses.GetCourseByID(ctx, courseID)
	if err != nil {
		return nil, fmt.Errorf("get course: %w", err)
	}

	rows, err := s.courses.GetRecommendedCourses(ctx, repository.GetRecommendedCoursesParams{
		ID:      courseID,
		ToolID:  course.ToolID,
		SkillID: course.SkillID,
	})
	if err != nil {
		return nil, fmt.Errorf("get recommended: %w", err)
	}

	result := make([]RecommendedCourse, len(rows))
	for i, r := range rows {
		toolName := ""
		if tool, err := s.tools.GetToolByID(ctx, r.ToolID); err == nil {
			toolName = tool.Name
		}
		skillName := ""
		if skill, err := s.skills.GetSkillByID(ctx, r.SkillID); err == nil {
			skillName = skill.Name
		}
		result[i] = RecommendedCourse{
			ID:           r.ID,
			Title:        r.Title,
			ThumbnailUrl: r.ThumbnailUrl,
			Difficulty:   string(r.Difficulty),
			ToolName:     toolName,
			SkillName:    skillName,
		}
	}

	return result, nil
}
