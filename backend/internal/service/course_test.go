package service

import (
	"context"
	"encoding/json"
	"errors"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/rocker15962/AIForAllFullStack/backend/internal/repository"
)

// ── fakes ──────────────────────────────────────────────────────────────────

type fakeCourses struct {
	byID map[uuid.UUID]repository.Course
}

func (f *fakeCourses) ListCourses(context.Context, repository.ListCoursesParams) ([]repository.ListCoursesRow, error) {
	return nil, nil
}
func (f *fakeCourses) CountCourses(context.Context, repository.CountCoursesParams) (int64, error) {
	return 0, nil
}
func (f *fakeCourses) GetCourseByID(_ context.Context, id uuid.UUID) (repository.Course, error) {
	c, ok := f.byID[id]
	if !ok {
		return repository.Course{}, pgx.ErrNoRows
	}
	return c, nil
}
func (f *fakeCourses) GetRecommendedCourses(context.Context, repository.GetRecommendedCoursesParams) ([]repository.Course, error) {
	return nil, nil
}

type fakeQuestions struct{ list []repository.Question }

func (f *fakeQuestions) GetQuestionsByCourse(_ context.Context, courseID uuid.UUID) ([]repository.Question, error) {
	var out []repository.Question
	for _, q := range f.list {
		if q.CourseID == courseID {
			out = append(out, q)
		}
	}
	return out, nil
}
func (f *fakeQuestions) GetQuestionByID(_ context.Context, id uuid.UUID) (repository.Question, error) {
	for _, q := range f.list {
		if q.ID == id {
			return q, nil
		}
	}
	return repository.Question{}, pgx.ErrNoRows
}

type fakeProgress struct {
	rows     map[uuid.UUID]repository.Progress // keyed by course
	finished *repository.FinishAttemptParams
}

func (f *fakeProgress) GetProgress(_ context.Context, arg repository.GetProgressParams) (repository.Progress, error) {
	p, ok := f.rows[arg.CourseID]
	if !ok {
		return repository.Progress{}, pgx.ErrNoRows
	}
	return p, nil
}
func (f *fakeProgress) CreateProgress(_ context.Context, arg repository.CreateProgressParams) (repository.Progress, error) {
	p := repository.Progress{UserID: arg.UserID, CourseID: arg.CourseID, Status: repository.ProgressStatusInProgress, Answers: arg.Answers}
	f.rows[arg.CourseID] = p
	return p, nil
}
func (f *fakeProgress) UpdateProgressAnswers(_ context.Context, arg repository.UpdateProgressAnswersParams) (repository.Progress, error) {
	p := f.rows[arg.CourseID]
	p.Answers = arg.Answers
	f.rows[arg.CourseID] = p
	return p, nil
}
func (f *fakeProgress) StartProgress(_ context.Context, arg repository.StartProgressParams) error {
	if _, ok := f.rows[arg.CourseID]; !ok {
		f.rows[arg.CourseID] = repository.Progress{CourseID: arg.CourseID, Status: repository.ProgressStatusInProgress, Answers: json.RawMessage("[]")}
	}
	return nil
}

// FinishAttempt mirrors the SQL: passing completes the course and earns the badge; a course
// passed before stays completed (BR-36).
func (f *fakeProgress) FinishAttempt(_ context.Context, arg repository.FinishAttemptParams) (repository.Progress, error) {
	f.finished = &arg
	p := f.rows[arg.CourseID]
	if arg.Passed && !p.BadgeEarnedAt.Valid {
		p.BadgeEarnedAt = pgtype.Timestamptz{Time: time.Date(2026, 9, 23, 8, 0, 0, 0, time.UTC), Valid: true}
	}
	if arg.Passed || p.BadgeEarnedAt.Valid {
		p.Status = repository.ProgressStatusCompleted
	} else {
		p.Status = repository.ProgressStatusInProgress
	}
	p.Score = arg.Score
	p.LatestRoundPassed = pgtype.Bool{Bool: arg.Passed, Valid: true}
	p.RoundFinished = true
	f.rows[arg.CourseID] = p
	return p, nil
}
func (f *fakeProgress) RetakeProgress(_ context.Context, arg repository.RetakeProgressParams) (repository.Progress, error) {
	p, ok := f.rows[arg.CourseID]
	if !ok {
		return repository.Progress{}, pgx.ErrNoRows
	}
	p.Answers = json.RawMessage("[]")
	p.RoundFinished = false
	if p.BadgeEarnedAt.Valid {
		p.Status = repository.ProgressStatusCompleted
	} else {
		p.Status = repository.ProgressStatusInProgress
	}
	f.rows[arg.CourseID] = p
	return p, nil
}

type fakeGrader struct {
	verdict bool
	err     error
	calls   int
}

func (g *fakeGrader) Grade(context.Context, GradeInput) (bool, error) {
	g.calls++
	return g.verdict, g.err
}

type fixture struct {
	svc       *CourseService
	progress  *fakeProgress
	grader    *fakeGrader
	published repository.Course
	draft     repository.Course
	archived  repository.Course
	mc        []repository.Question // 5 MC questions on the published course, correct answer "b"
	sa        repository.Question   // short answer on the draft course
}

func newFixture() *fixture {
	f := &fixture{
		published: repository.Course{ID: uuid.New(), Status: repository.CourseStatusPublished},
		draft:     repository.Course{ID: uuid.New(), Status: repository.CourseStatusDraft, PreviewToken: pgtype.Text{String: "secret-token", Valid: true}},
		archived:  repository.Course{ID: uuid.New(), Status: repository.CourseStatusArchived},
		progress:  &fakeProgress{rows: map[uuid.UUID]repository.Progress{}},
		grader:    &fakeGrader{verdict: true},
	}
	questions := &fakeQuestions{}
	for i := 0; i < 5; i++ {
		q := repository.Question{ID: uuid.New(), CourseID: f.published.ID, Type: repository.QuestionTypeMultipleChoice, CorrectAnswer: "b", Order: int32(i + 1)}
		f.mc = append(f.mc, q)
		questions.list = append(questions.list, q)
	}
	f.sa = repository.Question{ID: uuid.New(), CourseID: f.draft.ID, Type: repository.QuestionTypeShortAnswer, SampleAnswer: "Designing better prompts", Explanation: "why"}
	questions.list = append(questions.list, f.sa)

	courses := &fakeCourses{byID: map[uuid.UUID]repository.Course{
		f.published.ID: f.published, f.draft.ID: f.draft, f.archived.ID: f.archived,
	}}
	f.svc = NewCourseService(courses, questions, nil, nil, nil, f.progress, f.grader)
	return f
}

var (
	guest   = Viewer{}
	learner = Viewer{UserID: uuid.New(), SignedIn: true}
	admin   = Viewer{UserID: uuid.New(), SignedIn: true, IsAdmin: true}
)

// ── BR-05 / BR-31: who can open a course ───────────────────────────────────

func TestCanView(t *testing.T) {
	f := newFixture()
	cases := []struct {
		name   string
		course repository.Course
		viewer Viewer
		token  string
		want   bool
	}{
		{"published guest", f.published, guest, "", true},
		{"draft guest", f.draft, guest, "", false},
		{"draft learner", f.draft, learner, "", false},
		{"draft admin", f.draft, admin, "", true},
		{"draft valid preview", f.draft, guest, "secret-token", true},
		{"draft wrong preview", f.draft, guest, "nope", false},
		{"archived learner", f.archived, learner, "", false},
		{"archived with preview token", f.archived, guest, "secret-token", false},
		{"archived admin", f.archived, admin, "", true},
	}
	for _, tc := range cases {
		if got := canView(tc.course, tc.viewer, tc.token); got != tc.want {
			t.Errorf("%s: canView = %v, want %v", tc.name, got, tc.want)
		}
	}
}

// ── grading ────────────────────────────────────────────────────────────────

func TestGrade_MultipleChoice(t *testing.T) {
	f := newFixture()
	if ok, _ := f.svc.grade(context.Background(), f.mc[0], "b"); !ok {
		t.Error("expected correct option to pass")
	}
	if ok, _ := f.svc.grade(context.Background(), f.mc[0], "a"); ok {
		t.Error("expected wrong option to fail")
	}
}

func TestGrade_ShortAnswerUsesAIGrader(t *testing.T) {
	f := newFixture()
	f.grader.verdict = false
	ok, err := f.svc.grade(context.Background(), f.sa, "something else")
	if err != nil || ok || f.grader.calls != 1 {
		t.Fatalf("got ok=%v err=%v calls=%d", ok, err, f.grader.calls)
	}
	if ok, _ := f.svc.grade(context.Background(), f.sa, "   "); ok {
		t.Error("blank answer must be incorrect without calling the grader")
	}
	if f.grader.calls != 1 {
		t.Error("grader should not be called for a blank answer")
	}
}

func TestGrade_ShortAnswerGraderFailure(t *testing.T) {
	f := newFixture()
	f.grader.err = errors.New("timeout")
	_, err := f.svc.grade(context.Background(), f.sa, "an answer")
	if !errors.Is(err, ErrGradingUnavailable) {
		t.Fatalf("err = %v, want ErrGradingUnavailable", err)
	}
}

// ── submitting answers (BR-09, BR-11, BR-19) ───────────────────────────────

func TestSubmitAnswer_RecordsOncePerQuestion(t *testing.T) {
	f := newFixture()
	ctx := context.Background()

	r1, err := f.svc.SubmitAnswer(ctx, learner, f.published.ID, f.mc[0].ID, "a", "")
	if err != nil || r1.Correct || !r1.Recorded || r1.CorrectAnswer != "b" {
		t.Fatalf("first submit: %+v err=%v", r1, err)
	}
	// Re-answering the same question keeps the first verdict (no re-scoring).
	r2, err := f.svc.SubmitAnswer(ctx, learner, f.published.ID, f.mc[0].ID, "b", "")
	if err != nil || r2.Correct || !r2.AlreadyAnswered {
		t.Fatalf("second submit: %+v err=%v", r2, err)
	}
	if n := len(decodeAnswers(f.progress.rows[f.published.ID].Answers)); n != 1 {
		t.Fatalf("stored %d answers, want 1", n)
	}
}

func TestSubmitAnswer_PreviewIsGradedButNotRecorded(t *testing.T) {
	f := newFixture()
	r, err := f.svc.SubmitAnswer(context.Background(), learner, f.draft.ID, f.sa.ID, "prompt design", "secret-token")
	if err != nil || !r.Correct || r.Recorded {
		t.Fatalf("got %+v err=%v", r, err)
	}
	if r.CorrectAnswer != "" {
		t.Error("short-answer feedback must not include an answer key")
	}
	if _, ok := f.progress.rows[f.draft.ID]; ok {
		t.Error("preview answers must not create progress")
	}
}

func TestSubmitAnswer_DraftWithoutAccessIsNotFound(t *testing.T) {
	f := newFixture()
	_, err := f.svc.SubmitAnswer(context.Background(), learner, f.draft.ID, f.sa.ID, "x", "")
	if !errors.Is(err, ErrCourseNotFound) {
		t.Fatalf("err = %v, want ErrCourseNotFound", err)
	}
}

func TestSubmitAnswer_GradingFailureIsNotRecorded(t *testing.T) {
	f := newFixture()
	f.grader.err = errors.New("boom")
	// Publish a short-answer course to exercise the recording path.
	sa := f.sa
	sa.CourseID = f.published.ID
	f.svc.questions.(*fakeQuestions).list = append(f.svc.questions.(*fakeQuestions).list, sa)
	f.svc.questions.(*fakeQuestions).list[len(f.svc.questions.(*fakeQuestions).list)-1].ID = uuid.New()
	q := f.svc.questions.(*fakeQuestions).list[len(f.svc.questions.(*fakeQuestions).list)-1]

	_, err := f.svc.SubmitAnswer(context.Background(), learner, f.published.ID, q.ID, "answer", "")
	if !errors.Is(err, ErrGradingUnavailable) {
		t.Fatalf("err = %v, want ErrGradingUnavailable", err)
	}
	if _, ok := f.progress.rows[f.published.ID]; ok {
		t.Error("a failed grading must not record the answer")
	}
}

// ── completing a round (BR-12, BR-13, BR-16) ───────────────────────────────

func answerAll(t *testing.T, f *fixture, correct int) {
	t.Helper()
	for i, q := range f.mc {
		ans := "a"
		if i < correct {
			ans = "b"
		}
		if _, err := f.svc.SubmitAnswer(context.Background(), learner, f.published.ID, q.ID, ans, ""); err != nil {
			t.Fatalf("submit %d: %v", i, err)
		}
	}
}

func TestCompleteCourse_RequiresEveryQuestion(t *testing.T) {
	f := newFixture()
	_, _ = f.svc.SubmitAnswer(context.Background(), learner, f.published.ID, f.mc[0].ID, "b", "")
	if _, err := f.svc.CompleteCourse(context.Background(), learner.UserID, f.published.ID); !errors.Is(err, ErrQuizIncomplete) {
		t.Fatalf("err = %v, want ErrQuizIncomplete", err)
	}
}

func TestCompleteCourse_SixtyPercentPasses(t *testing.T) {
	f := newFixture()
	answerAll(t, f, 3) // 3/5 = 60%
	res, err := f.svc.CompleteCourse(context.Background(), learner.UserID, f.published.ID)
	if err != nil {
		t.Fatal(err)
	}
	if !res.Passed || !res.BadgeEarned || res.Score != 60 || res.PassingScore != 60 {
		t.Fatalf("got %+v", res)
	}
	if !f.progress.finished.Passed {
		t.Error("FinishAttempt should be called with passed=true")
	}
}

func TestCompleteCourse_BelowSixtyPercentFails(t *testing.T) {
	f := newFixture()
	answerAll(t, f, 2) // 40%
	res, err := f.svc.CompleteCourse(context.Background(), learner.UserID, f.published.ID)
	if err != nil {
		t.Fatal(err)
	}
	if res.Passed || res.BadgeEarned || res.CorrectAnswers != 2 || res.TotalQuestions != 5 {
		t.Fatalf("got %+v", res)
	}
}

func TestRetakeThenNewRoundCanBeAnswered(t *testing.T) {
	f := newFixture()
	answerAll(t, f, 5)
	if _, err := f.svc.CompleteCourse(context.Background(), learner.UserID, f.published.ID); err != nil {
		t.Fatal(err)
	}
	if err := f.svc.RetakeCourse(context.Background(), learner.UserID, f.published.ID); err != nil {
		t.Fatal(err)
	}
	r, err := f.svc.SubmitAnswer(context.Background(), learner, f.published.ID, f.mc[0].ID, "a", "")
	if err != nil || r.AlreadyAnswered || r.Correct {
		t.Fatalf("after retake: %+v err=%v", r, err)
	}
}

// BR-36: after passing, a failed retake keeps the course completed and the badge.
func TestFailedRetakeAfterPassingStaysCompleted(t *testing.T) {
	f := newFixture()
	ctx := context.Background()
	answerAll(t, f, 5)
	first, err := f.svc.CompleteCourse(ctx, learner.UserID, f.published.ID)
	if err != nil || !first.Passed || first.BadgeEarnedAt == nil {
		t.Fatalf("first round: %+v err=%v", first, err)
	}

	if err := f.svc.RetakeCourse(ctx, learner.UserID, f.published.ID); err != nil {
		t.Fatal(err)
	}
	during, _ := f.svc.GetMyProgress(ctx, learner.UserID, f.published.ID)
	if during.Status != "completed" || during.Score != nil || len(during.Answers) != 0 {
		t.Fatalf("during retake: %+v", during)
	}

	answerAll(t, f, 1) // 20%
	second, err := f.svc.CompleteCourse(ctx, learner.UserID, f.published.ID)
	if err != nil {
		t.Fatal(err)
	}
	if second.Passed || !second.BadgeEarned || second.BadgeEarnedAt == nil || *second.BadgeEarnedAt != *first.BadgeEarnedAt {
		t.Fatalf("second round: %+v", second)
	}
	after, _ := f.svc.GetMyProgress(ctx, learner.UserID, f.published.ID)
	if after.Status != "completed" || after.Score == nil || *after.Score != 20 ||
		after.LatestRoundPassed == nil || *after.LatestRoundPassed {
		t.Fatalf("after failed retake: %+v", after)
	}
}

func TestGetMyProgress_ResumesCurrentRound(t *testing.T) {
	f := newFixture()
	ctx := context.Background()
	p, err := f.svc.GetMyProgress(ctx, learner.UserID, f.published.ID)
	if err != nil || p.Status != "not_started" || len(p.Answers) != 0 {
		t.Fatalf("before: %+v err=%v", p, err)
	}
	_, _ = f.svc.SubmitAnswer(ctx, learner, f.published.ID, f.mc[0].ID, "b", "")
	_, _ = f.svc.SubmitAnswer(ctx, learner, f.published.ID, f.mc[1].ID, "a", "")
	p, _ = f.svc.GetMyProgress(ctx, learner.UserID, f.published.ID)
	if p.Status != "in_progress" || len(p.Answers) != 2 || !p.Answers[0].Correct || p.Answers[1].Correct {
		t.Fatalf("after: %+v", p)
	}
}

func TestStartCourse_OnlyPublished(t *testing.T) {
	f := newFixture()
	if err := f.svc.StartCourse(context.Background(), learner.UserID, f.published.ID); err != nil {
		t.Fatal(err)
	}
	if err := f.svc.StartCourse(context.Background(), learner.UserID, f.draft.ID); !errors.Is(err, ErrCourseNotFound) {
		t.Fatalf("draft: err = %v, want ErrCourseNotFound", err)
	}
}

func TestDecodeAnswers_KeepsLatestPerQuestion(t *testing.T) {
	raw := json.RawMessage(`[{"questionId":"q1","answer":"a","isCorrect":false},{"questionId":"q2","answer":"b","isCorrect":true},{"questionId":"q1","answer":"b","isCorrect":true}]`)
	got := decodeAnswers(raw)
	if len(got) != 2 || got[0].QuestionID != "q1" || !got[0].IsCorrect {
		t.Fatalf("got %+v", got)
	}
}

// ── admin course input (BR-28, BR-29) ──────────────────────────────────────

func validCourseInput() CourseInput {
	return CourseInput{Title: "T", Description: "D", Difficulty: "beginner", Duration: 750}
}

func TestValidateCourseInput(t *testing.T) {
	mcOptions := []QuestionOptionInput{{ID: "a", Text: "1"}, {ID: "b", Text: "2"}, {ID: "c", Text: "3"}, {ID: "d", Text: "4"}}
	cases := []struct {
		name    string
		mutate  func(*CourseInput)
		wantErr bool
	}{
		{"valid", func(*CourseInput) {}, false},
		{"missing duration", func(c *CourseInput) { c.Duration = 0 }, true},
		{"bad difficulty", func(c *CourseInput) { c.Difficulty = "expert" }, true},
		{"short answer needs sample", func(c *CourseInput) {
			c.Questions = &[]QuestionInput{{Type: "short_answer", Question: "Why?"}}
		}, true},
		{"short answer with sample", func(c *CourseInput) {
			c.Questions = &[]QuestionInput{{Type: "short_answer", Question: "Why?", SampleAnswer: "Because"}}
		}, false},
		{"mc needs correct answer", func(c *CourseInput) {
			c.Questions = &[]QuestionInput{{Type: "multiple_choice", Question: "Q", Options: mcOptions, CorrectAnswer: "z"}}
		}, true},
		{"mc valid", func(c *CourseInput) {
			c.Questions = &[]QuestionInput{{Type: "multiple_choice", Question: "Q", Options: mcOptions, CorrectAnswer: "c"}}
		}, false},
	}
	for _, tc := range cases {
		in := validCourseInput()
		tc.mutate(&in)
		err := validateCourseInput(in)
		if (err != nil) != tc.wantErr {
			t.Errorf("%s: err = %v, wantErr %v", tc.name, err, tc.wantErr)
		}
		var verr *ValidationError
		if err != nil && !errors.As(err, &verr) {
			t.Errorf("%s: expected ValidationError, got %T", tc.name, err)
		}
	}
}
