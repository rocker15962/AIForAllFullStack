package service

import (
	"context"
	"crypto/subtle"
	"encoding/json"
	"errors"
	"fmt"
	"strings"
	"time"

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
	grader    ShortAnswerGrader
}

// PassingScore is the minimum score (percent) that completes a course and earns its badge (BR-12).
const PassingScore = 60

var (
	// ErrCourseNotFound is returned when a course does not exist or the viewer may not open it.
	ErrCourseNotFound = errors.New("course not found")
	// ErrQuestionNotInCourse is returned when an answer targets another course's question.
	ErrQuestionNotInCourse = errors.New("question does not belong to this course")
	// ErrQuizIncomplete is returned when completing a course before every question is answered.
	ErrQuizIncomplete = errors.New("not all questions have been answered")
	// ErrNoQuestions is returned when completing a course that has no quiz.
	ErrNoQuestions = errors.New("course has no questions")
)

// Viewer is who is looking at a course: a guest, a signed-in learner, or an admin.
type Viewer struct {
	UserID   uuid.UUID
	SignedIn bool
	IsAdmin  bool
}

// UserIDParam returns the viewer's ID as a nullable query parameter.
func (v Viewer) UserIDParam() pgtype.UUID {
	if !v.SignedIn {
		return pgtype.UUID{}
	}
	return pgtype.UUID{Bytes: v.UserID, Valid: true}
}

// canView applies BR-05 and BR-31: published courses are public; drafts open only for admins
// or with a valid preview link; archived courses only for admins.
func canView(course repository.Course, viewer Viewer, previewToken string) bool {
	switch course.Status {
	case repository.CourseStatusPublished:
		return true
	case repository.CourseStatusDraft:
		return viewer.IsAdmin || validPreviewToken(course, previewToken)
	default:
		return viewer.IsAdmin
	}
}

func validPreviewToken(course repository.Course, token string) bool {
	if token == "" || !course.PreviewToken.Valid {
		return false
	}
	return subtle.ConstantTimeCompare([]byte(token), []byte(course.PreviewToken.String)) == 1
}

// NewCourseService wires the course service. grader may be nil, in which case short-answer
// questions cannot be graded and submissions return ErrGradingUnavailable.
func NewCourseService(
	courses CourseRepository,
	questions QuestionRepository,
	tools ToolRepository,
	skills SkillRepository,
	creators CreatorRepository,
	progress ProgressRepository,
	grader ShortAnswerGrader,
) *CourseService {
	return &CourseService{
		courses:   courses,
		questions: questions,
		tools:     tools,
		skills:    skills,
		creators:  creators,
		progress:  progress,
		grader:    grader,
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
	ID           uuid.UUID      `json:"id"`
	Title        string         `json:"title"`
	Description  string         `json:"description"`
	YoutubeID    string         `json:"youtubeId"`
	ThumbnailUrl string         `json:"thumbnailUrl"`
	Difficulty   string         `json:"difficulty"`
	Duration     int32          `json:"duration"`
	Tool         CategoryItem   `json:"tool"`
	Skill        CategoryItem   `json:"skill"`
	Creator      CreatorItem    `json:"creator"`
	Questions    []QuestionItem `json:"questions"`
	Status       string         `json:"status"`
	// IsPreview is true when the course is not published (admin or preview-link view).
	// Answers are graded but not recorded.
	IsPreview bool `json:"isPreview"`
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
	ID       uuid.UUID       `json:"id"`
	Type     string          `json:"type"`
	Question string          `json:"question"`
	Options  json.RawMessage `json:"options,omitempty"`
	Order    int32           `json:"order"`
}

func (s *CourseService) loadCourse(ctx context.Context, id uuid.UUID) (repository.Course, error) {
	course, err := s.courses.GetCourseByID(ctx, id)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return repository.Course{}, ErrCourseNotFound
		}
		return repository.Course{}, fmt.Errorf("get course: %w", err)
	}
	return course, nil
}

// GetCourse returns a course the viewer is allowed to open (BR-05, BR-31).
func (s *CourseService) GetCourse(ctx context.Context, id uuid.UUID, viewer Viewer, previewToken string) (*CourseDetail, error) {
	course, err := s.loadCourse(ctx, id)
	if err != nil {
		return nil, err
	}
	if !canView(course, viewer, previewToken) {
		return nil, ErrCourseNotFound
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
		Status:       string(course.Status),
		IsPreview:    course.Status != repository.CourseStatusPublished,
	}, nil
}

// storedAnswer is one entry of progress.answers.
type storedAnswer struct {
	QuestionID string `json:"questionId"`
	Answer     string `json:"answer"`
	IsCorrect  bool   `json:"isCorrect"`
}

// decodeAnswers reads progress.answers, keeping one answer per question (the latest one).
// Older records could hold several answers for the same question.
func decodeAnswers(raw json.RawMessage) []storedAnswer {
	var all []storedAnswer
	_ = json.Unmarshal(raw, &all)
	index := make(map[string]int, len(all))
	result := make([]storedAnswer, 0, len(all))
	for _, a := range all {
		if i, ok := index[a.QuestionID]; ok {
			result[i] = a
			continue
		}
		index[a.QuestionID] = len(result)
		result = append(result, a)
	}
	return result
}

func findAnswer(answers []storedAnswer, questionID string) (storedAnswer, bool) {
	for _, a := range answers {
		if a.QuestionID == questionID {
			return a, true
		}
	}
	return storedAnswer{}, false
}

type SubmitAnswerResult struct {
	Correct       bool   `json:"correct"`
	CorrectAnswer string `json:"correctAnswer"`
	Explanation   string `json:"explanation"`
	// Recorded is false for preview views (unpublished course): the answer is graded only.
	Recorded bool `json:"recorded"`
	// AlreadyAnswered is true when this question was already answered in the current round;
	// the stored verdict is returned and the new answer is ignored (BR-19).
	AlreadyAnswered bool `json:"alreadyAnswered"`
}

// SubmitAnswer grades an answer and, for published courses, records it in the learner's
// current round. Each question counts once per round (BR-16, BR-19).
func (s *CourseService) SubmitAnswer(ctx context.Context, viewer Viewer, courseID, questionID uuid.UUID, answer, previewToken string) (*SubmitAnswerResult, error) {
	course, err := s.loadCourse(ctx, courseID)
	if err != nil {
		return nil, err
	}
	if !canView(course, viewer, previewToken) {
		return nil, ErrCourseNotFound
	}

	question, err := s.questions.GetQuestionByID(ctx, questionID)
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrQuestionNotInCourse
		}
		return nil, fmt.Errorf("get question: %w", err)
	}
	if question.CourseID != courseID {
		return nil, ErrQuestionNotInCourse
	}

	record := viewer.SignedIn && course.Status == repository.CourseStatusPublished
	result := func(correct bool) *SubmitAnswerResult {
		r := &SubmitAnswerResult{Correct: correct, Explanation: question.Explanation, Recorded: record}
		// BR-09: short-answer feedback is only right/wrong plus the explanation.
		if question.Type == repository.QuestionTypeMultipleChoice {
			r.CorrectAnswer = question.CorrectAnswer
		}
		return r
	}

	var prog repository.Progress
	hasProgress := false
	if record {
		prog, err = s.progress.GetProgress(ctx, repository.GetProgressParams{UserID: viewer.UserID, CourseID: courseID})
		switch {
		case err == nil:
			hasProgress = true
			if prev, ok := findAnswer(decodeAnswers(prog.Answers), questionID.String()); ok {
				r := result(prev.IsCorrect)
				r.AlreadyAnswered = true
				return r, nil
			}
		case !errors.Is(err, pgx.ErrNoRows):
			return nil, fmt.Errorf("get progress: %w", err)
		}
	}

	correct, err := s.grade(ctx, question, answer)
	if err != nil {
		// BR-09: when grading fails the answer is not recorded; the learner tries again later.
		return nil, err
	}
	if !record {
		return result(correct), nil
	}

	entry := storedAnswer{QuestionID: questionID.String(), Answer: answer, IsCorrect: correct}
	if !hasProgress {
		answersJSON, _ := json.Marshal([]storedAnswer{entry})
		_, err = s.progress.CreateProgress(ctx, repository.CreateProgressParams{
			UserID:          viewer.UserID,
			CourseID:        courseID,
			CurrentQuestion: pgtype.Int4{Int32: 1, Valid: true},
			Answers:         answersJSON,
		})
		if err != nil {
			return nil, fmt.Errorf("create progress: %w", err)
		}
		return result(correct), nil
	}

	answers := append(decodeAnswers(prog.Answers), entry)
	answersJSON, _ := json.Marshal(answers)
	_, err = s.progress.UpdateProgressAnswers(ctx, repository.UpdateProgressAnswersParams{
		Answers:         answersJSON,
		CurrentQuestion: pgtype.Int4{Int32: int32(len(answers)), Valid: true},
		UserID:          viewer.UserID,
		CourseID:        courseID,
	})
	if err != nil {
		return nil, fmt.Errorf("update progress: %w", err)
	}
	return result(correct), nil
}

// grade judges one answer. Multiple choice must match the correct option exactly (BR-08);
// short answers are judged by AI against the sample answer (BR-09).
func (s *CourseService) grade(ctx context.Context, question repository.Question, answer string) (bool, error) {
	answer = strings.TrimSpace(answer)
	switch question.Type {
	case repository.QuestionTypeMultipleChoice:
		return answer == question.CorrectAnswer, nil
	case repository.QuestionTypeShortAnswer:
		if answer == "" {
			return false, nil
		}
		sample := strings.TrimSpace(question.SampleAnswer)
		if sample == "" {
			// Legacy question without a sample answer: nothing to compare against.
			return true, nil
		}
		if s.grader == nil {
			return false, ErrGradingUnavailable
		}
		correct, err := s.grader.Grade(ctx, GradeInput{
			Question:     question.Question,
			SampleAnswer: sample,
			Answer:       answer,
		})
		if err != nil {
			return false, fmt.Errorf("%w: %v", ErrGradingUnavailable, err)
		}
		return correct, nil
	default:
		return false, nil
	}
}

// StartCourse records that a signed-in learner has started a published course (BR-17:
// the frontend calls this once the video has played 10% of its length).
func (s *CourseService) StartCourse(ctx context.Context, userID, courseID uuid.UUID) error {
	course, err := s.loadCourse(ctx, courseID)
	if err != nil {
		return err
	}
	if course.Status != repository.CourseStatusPublished {
		return ErrCourseNotFound
	}
	if err := s.progress.StartProgress(ctx, repository.StartProgressParams{UserID: userID, CourseID: courseID}); err != nil {
		return fmt.Errorf("start progress: %w", err)
	}
	return nil
}

// AnsweredQuestion is a question answered in the learner's current round.
type AnsweredQuestion struct {
	QuestionID string `json:"questionId"`
	Correct    bool   `json:"correct"`
}

// MyCourseProgress is the signed-in learner's state for one course, used to resume (BR-19).
type MyCourseProgress struct {
	// Status is "not_started", "in_progress" or "completed". A course that was passed stays
	// "completed" while a retake round is being answered (BR-36).
	Status string `json:"status"`
	// Answers holds the current round, limited to questions that still exist, in answer order.
	Answers []AnsweredQuestion `json:"answers"`
	// Score is the current round's score once it is scored; nil while it is being answered.
	Score       *float64 `json:"score"`
	BadgeEarned bool     `json:"badgeEarned"`
	// BadgeEarnedAt is when the badge was first earned (RFC3339), nil without a badge.
	BadgeEarnedAt *string `json:"badgeEarnedAt"`
	// LatestRoundPassed is the result of the most recently scored round; nil if never scored.
	LatestRoundPassed *bool `json:"latestRoundPassed"`
}

func formatTimestamptz(t pgtype.Timestamptz) *string {
	if !t.Valid {
		return nil
	}
	s := t.Time.UTC().Format(time.RFC3339)
	return &s
}

// GetMyProgress returns the learner's current round for a course.
func (s *CourseService) GetMyProgress(ctx context.Context, userID, courseID uuid.UUID) (*MyCourseProgress, error) {
	result := &MyCourseProgress{Status: "not_started", Answers: []AnsweredQuestion{}}

	prog, err := s.progress.GetProgress(ctx, repository.GetProgressParams{UserID: userID, CourseID: courseID})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return result, nil
		}
		return nil, fmt.Errorf("get progress: %w", err)
	}

	questions, err := s.questions.GetQuestionsByCourse(ctx, courseID)
	if err != nil {
		return nil, fmt.Errorf("get questions: %w", err)
	}
	current := make(map[string]bool, len(questions))
	for _, q := range questions {
		current[q.ID.String()] = true
	}

	for _, a := range decodeAnswers(prog.Answers) {
		if current[a.QuestionID] {
			result.Answers = append(result.Answers, AnsweredQuestion{QuestionID: a.QuestionID, Correct: a.IsCorrect})
		}
	}
	result.Status = string(prog.Status)
	if prog.RoundFinished && prog.Score.Valid {
		if f, err := prog.Score.Float64Value(); err == nil && f.Valid {
			score := f.Float64
			result.Score = &score
		}
	}
	result.BadgeEarned = prog.BadgeEarnedAt.Valid
	result.BadgeEarnedAt = formatTimestamptz(prog.BadgeEarnedAt)
	if prog.LatestRoundPassed.Valid {
		passed := prog.LatestRoundPassed.Bool
		result.LatestRoundPassed = &passed
	}
	return result, nil
}

type CompleteResult struct {
	Score          float64 `json:"score"`
	TotalQuestions int     `json:"totalQuestions"`
	CorrectAnswers int     `json:"correctAnswers"`
	// Passed is true when Score >= PassingScore; only then is the course completed (BR-12).
	Passed       bool `json:"passed"`
	PassingScore int  `json:"passingScore"`
	// BadgeEarned is true when the learner holds this course's badge, from this or an earlier
	// attempt. Badges are never taken back (BR-16).
	BadgeEarned bool `json:"badgeEarned"`
	// BadgeEarnedAt is when the badge was first earned (RFC3339), nil without a badge.
	BadgeEarnedAt *string `json:"badgeEarnedAt"`
}

// CompleteCourse scores the current round once every question is answered (BR-12, BR-13).
func (s *CourseService) CompleteCourse(ctx context.Context, userID, courseID uuid.UUID) (*CompleteResult, error) {
	course, err := s.loadCourse(ctx, courseID)
	if err != nil {
		return nil, err
	}
	if course.Status != repository.CourseStatusPublished {
		return nil, ErrCourseNotFound
	}

	questions, err := s.questions.GetQuestionsByCourse(ctx, courseID)
	if err != nil {
		return nil, fmt.Errorf("get questions: %w", err)
	}
	if len(questions) == 0 {
		return nil, ErrNoQuestions
	}

	prog, err := s.progress.GetProgress(ctx, repository.GetProgressParams{UserID: userID, CourseID: courseID})
	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			return nil, ErrQuizIncomplete
		}
		return nil, fmt.Errorf("get progress: %w", err)
	}

	answers := decodeAnswers(prog.Answers)
	correctCount := 0
	for _, q := range questions {
		a, ok := findAnswer(answers, q.ID.String())
		if !ok {
			return nil, ErrQuizIncomplete
		}
		if a.IsCorrect {
			correctCount++
		}
	}

	total := len(questions)
	score := float64(correctCount) / float64(total) * 100
	// Integer comparison avoids float rounding at the boundary (3/5 must pass).
	passed := correctCount*100 >= PassingScore*total

	scoreNumeric := pgtype.Numeric{}
	if err := scoreNumeric.Scan(fmt.Sprintf("%.2f", score)); err != nil {
		return nil, fmt.Errorf("scan score: %w", err)
	}

	updated, err := s.progress.FinishAttempt(ctx, repository.FinishAttemptParams{
		Passed:   passed,
		Score:    scoreNumeric,
		UserID:   userID,
		CourseID: courseID,
	})
	if err != nil {
		return nil, fmt.Errorf("finish attempt: %w", err)
	}

	return &CompleteResult{
		Score:          score,
		TotalQuestions: total,
		CorrectAnswers: correctCount,
		Passed:         passed,
		PassingScore:   PassingScore,
		BadgeEarned:    updated.BadgeEarnedAt.Valid,
		BadgeEarnedAt:  formatTimestamptz(updated.BadgeEarnedAt),
	}, nil
}

// RetakeCourse starts a new round: previous answers and score are replaced, the badge stays (BR-16).
func (s *CourseService) RetakeCourse(ctx context.Context, userID, courseID uuid.UUID) error {
	course, err := s.loadCourse(ctx, courseID)
	if err != nil {
		return err
	}
	if course.Status != repository.CourseStatusPublished {
		return ErrCourseNotFound
	}
	_, err = s.progress.RetakeProgress(ctx, repository.RetakeProgressParams{UserID: userID, CourseID: courseID})
	if err != nil && !errors.Is(err, pgx.ErrNoRows) {
		return fmt.Errorf("retake: %w", err)
	}
	return nil
}

type RecommendedCourse struct {
	ID           uuid.UUID `json:"id"`
	Title        string    `json:"title"`
	ThumbnailUrl string    `json:"thumbnailUrl"`
	Difficulty   string    `json:"difficulty"`
	ToolName     string    `json:"toolName"`
	SkillName    string    `json:"skillName"`
}

// GetRecommended returns up to 4 published courses sharing the tool or skill, excluding this
// course and, for signed-in learners, courses they have completed (BR-15).
func (s *CourseService) GetRecommended(ctx context.Context, courseID uuid.UUID, viewer Viewer) ([]RecommendedCourse, error) {
	course, err := s.loadCourse(ctx, courseID)
	if err != nil {
		return nil, err
	}

	rows, err := s.courses.GetRecommendedCourses(ctx, repository.GetRecommendedCoursesParams{
		CourseID: courseID,
		ToolID:   course.ToolID,
		SkillID:  course.SkillID,
		UserID:   viewer.UserIDParam(),
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
