//go:build integration

package integration

import (
	"context"
	"errors"
	"testing"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/rocker15962/AIForAllFullStack/backend/internal/repository"
	"github.com/rocker15962/AIForAllFullStack/backend/internal/service"
)

func createTestUser(t *testing.T, ctx context.Context) uuid.UUID {
	t.Helper()
	u, err := testQueries.CreateUser(ctx, repository.CreateUserParams{
		Name: "Rules Learner", Email: "rules-" + uuid.New().String()[:8] + "@test.com",
		Provider: repository.AuthProviderGoogle,
	})
	if err != nil {
		t.Fatalf("create user: %v", err)
	}
	return u.ID
}

func createPublishedCourse(t *testing.T, ctx context.Context, toolID, skillID uuid.UUID, creatorID string) repository.Course {
	t.Helper()
	creatorUUID, _ := uuid.Parse(creatorID)
	c, err := testQueries.AdminCreateCourse(ctx, repository.AdminCreateCourseParams{
		Title: "Course " + uuid.New().String()[:6], Description: "d", YoutubeUrl: "https://youtu.be/x",
		YoutubeID: "x", ThumbnailUrl: "t", ToolID: toolID, SkillID: skillID, CreatorID: creatorUUID,
		Difficulty: repository.DifficultyLevelBeginner, Duration: 600, Status: repository.CourseStatusPublished,
	})
	if err != nil {
		t.Fatalf("create course: %v", err)
	}
	return c
}

func mcOptions() []service.QuestionOptionInput {
	return []service.QuestionOptionInput{{ID: "a", Text: "A"}, {ID: "b", Text: "B"}, {ID: "c", Text: "C"}, {ID: "d", Text: "D"}}
}

// BR-28 / BR-29: course, creator, duration and questions are saved together.
func TestSaveCourseWithQuestions(t *testing.T) {
	ctx := context.Background()
	toolID, skillID, creatorID := createCoursePrereqs(t, ctx)
	creatorUUID, _ := uuid.Parse(creatorID)
	svc := service.NewAdminCourseService(testPool)

	questions := []service.QuestionInput{
		{ID: "temp-1", Type: "multiple_choice", Question: "Q1", Options: mcOptions(), CorrectAnswer: "b", Explanation: "e1"},
		{ID: "temp-2", Type: "short_answer", Question: "Q2", SampleAnswer: "Sample two"},
		{ID: "temp-3", Type: "short_answer", Question: "Q3", SampleAnswer: "Sample three"},
	}
	in := service.CourseInput{
		Title: "Saved", Description: "D", YoutubeURL: "https://youtu.be/abc", YoutubeID: "abc", ThumbnailURL: "t",
		ToolID: toolID, SkillID: skillID, CreatorID: creatorUUID, Difficulty: "beginner", Duration: 750,
		Status: "draft", Questions: &questions,
	}
	course, err := svc.SaveCourse(ctx, nil, in)
	if err != nil {
		t.Fatalf("create: %v", err)
	}
	if course.CreatorID != creatorUUID || course.Duration != 750 {
		t.Errorf("creator/duration not saved: %s %d", course.CreatorID, course.Duration)
	}

	saved, _ := testQueries.GetQuestionsByCourse(ctx, course.ID)
	if len(saved) != 3 || saved[1].SampleAnswer != "Sample two" || saved[0].CorrectAnswer != "b" {
		t.Fatalf("unexpected saved questions: %+v", saved)
	}

	// Reorder (3 before 1), edit 1, drop 2, add a new one, and publish — in one save.
	edited := []service.QuestionInput{
		{ID: saved[2].ID.String(), Type: "short_answer", Question: "Q3", SampleAnswer: "Sample three"},
		{ID: saved[0].ID.String(), Type: "multiple_choice", Question: "Q1 edited", Options: mcOptions(), CorrectAnswer: "d"},
		{ID: "temp-9", Type: "short_answer", Question: "Q4", SampleAnswer: "Sample four"},
	}
	in.Questions = &edited
	in.Status = "published"
	course, err = svc.SaveCourse(ctx, &course.ID, in)
	if err != nil {
		t.Fatalf("update: %v", err)
	}
	if course.Status != repository.CourseStatusPublished {
		t.Errorf("status = %s, want published", course.Status)
	}

	after, _ := testQueries.GetQuestionsByCourse(ctx, course.ID)
	if len(after) != 3 {
		t.Fatalf("got %d questions, want 3", len(after))
	}
	if after[0].ID != saved[2].ID || after[1].ID != saved[0].ID || after[2].Question != "Q4" {
		t.Errorf("order not applied: %v %v %v", after[0].Question, after[1].Question, after[2].Question)
	}
	if after[1].Question != "Q1 edited" || after[1].CorrectAnswer != "d" {
		t.Errorf("edit not applied: %+v", after[1])
	}
}

func TestSaveCourseRejectsQuestionFromAnotherCourse(t *testing.T) {
	ctx := context.Background()
	toolID, skillID, creatorID := createCoursePrereqs(t, ctx)
	other := createPublishedCourse(t, ctx, toolID, skillID, creatorID)
	otherQ, _ := createTestQuestion(ctx, other.ID.String(), "short_answer", "Other", "", 1)

	creatorUUID, _ := uuid.Parse(creatorID)
	questions := []service.QuestionInput{{ID: otherQ, Type: "short_answer", Question: "Q", SampleAnswer: "S"}}
	target := createPublishedCourse(t, ctx, toolID, skillID, creatorID)
	_, err := service.NewAdminCourseService(testPool).SaveCourse(ctx, &target.ID, service.CourseInput{
		Title: "T", Description: "D", YoutubeURL: "u", YoutubeID: "x", ThumbnailURL: "t",
		ToolID: toolID, SkillID: skillID, CreatorID: creatorUUID, Difficulty: "beginner", Duration: 60,
		Questions: &questions,
	})
	var verr *service.ValidationError
	if !errors.As(err, &verr) {
		t.Fatalf("err = %v, want ValidationError", err)
	}
	// The transaction rolled back: the other course still has its question.
	if qs, _ := testQueries.GetQuestionsByCourse(ctx, other.ID); len(qs) != 1 {
		t.Error("other course's question must be untouched")
	}
}

// BR-12 / BR-16: passing earns the badge; a later failing round keeps it.
func TestFinishAttemptKeepsBadge(t *testing.T) {
	ctx := context.Background()
	toolID, skillID, creatorID := createCoursePrereqs(t, ctx)
	course := createPublishedCourse(t, ctx, toolID, skillID, creatorID)
	userID := createTestUser(t, ctx)

	if err := testQueries.StartProgress(ctx, repository.StartProgressParams{UserID: userID, CourseID: course.ID}); err != nil {
		t.Fatalf("start: %v", err)
	}
	// Starting again is a no-op.
	if err := testQueries.StartProgress(ctx, repository.StartProgressParams{UserID: userID, CourseID: course.ID}); err != nil {
		t.Fatalf("start twice: %v", err)
	}

	score := pgtype.Numeric{}
	_ = score.Scan("80.00")
	passed, err := testQueries.FinishAttempt(ctx, repository.FinishAttemptParams{Passed: true, Score: score, UserID: userID, CourseID: course.ID})
	if err != nil || passed.Status != repository.ProgressStatusCompleted || !passed.BadgeEarnedAt.Valid {
		t.Fatalf("pass: %+v err=%v", passed, err)
	}

	if _, err := testQueries.RetakeProgress(ctx, repository.RetakeProgressParams{UserID: userID, CourseID: course.ID}); err != nil {
		t.Fatalf("retake: %v", err)
	}
	low := pgtype.Numeric{}
	_ = low.Scan("20.00")
	failed, err := testQueries.FinishAttempt(ctx, repository.FinishAttemptParams{Passed: false, Score: low, UserID: userID, CourseID: course.ID})
	if err != nil {
		t.Fatal(err)
	}
	if failed.Status != repository.ProgressStatusInProgress || !failed.BadgeEarnedAt.Valid {
		t.Errorf("after failing retake: status=%s badge=%v", failed.Status, failed.BadgeEarnedAt.Valid)
	}
	if !failed.BadgeEarnedAt.Time.Equal(passed.BadgeEarnedAt.Time) {
		t.Error("badge time must not change")
	}

	badges, _ := testQueries.GetUserBadges(ctx, userID)
	if len(badges) != 1 {
		t.Errorf("got %d badges, want 1", len(badges))
	}
	counts, _ := testQueries.CountUserProgress(ctx, userID)
	if counts.BadgeCount != 1 || counts.CompletedCount != 0 {
		t.Errorf("counts = %+v", counts)
	}
}

// BR-15: recommendations exclude the learner's completed courses.
func TestRecommendedExcludesCompleted(t *testing.T) {
	ctx := context.Background()
	toolID, skillID, creatorID := createCoursePrereqs(t, ctx)
	current := createPublishedCourse(t, ctx, toolID, skillID, creatorID)
	done := createPublishedCourse(t, ctx, toolID, skillID, creatorID)
	open := createPublishedCourse(t, ctx, toolID, skillID, creatorID)
	userID := createTestUser(t, ctx)

	_ = testQueries.StartProgress(ctx, repository.StartProgressParams{UserID: userID, CourseID: done.ID})
	score := pgtype.Numeric{}
	_ = score.Scan("100.00")
	_, _ = testQueries.FinishAttempt(ctx, repository.FinishAttemptParams{Passed: true, Score: score, UserID: userID, CourseID: done.ID})

	ids := func(user pgtype.UUID) map[uuid.UUID]bool {
		rows, err := testQueries.GetRecommendedCourses(ctx, repository.GetRecommendedCoursesParams{
			CourseID: current.ID, ToolID: toolID, SkillID: skillID, UserID: user,
		})
		if err != nil {
			t.Fatal(err)
		}
		m := map[uuid.UUID]bool{}
		for _, r := range rows {
			m[r.ID] = true
		}
		return m
	}

	guest := ids(pgtype.UUID{})
	if !guest[done.ID] || !guest[open.ID] || guest[current.ID] {
		t.Errorf("guest recommendations wrong: %v", guest)
	}
	signedIn := ids(pgtype.UUID{Bytes: userID, Valid: true})
	if signedIn[done.ID] || !signedIn[open.ID] {
		t.Errorf("signed-in recommendations should drop completed courses: %v", signedIn)
	}
}

// BR-05: one preview token per draft, cleared on publish.
func TestPreviewToken(t *testing.T) {
	ctx := context.Background()
	toolID, skillID, creatorID := createCoursePrereqs(t, ctx)
	course := createPublishedCourse(t, ctx, toolID, skillID, creatorID)
	if _, err := testQueries.AdminEnsurePreviewToken(ctx, repository.AdminEnsurePreviewTokenParams{Token: "t1", ID: course.ID}); !errors.Is(err, pgx.ErrNoRows) {
		t.Fatalf("published course: err = %v, want no rows", err)
	}

	if _, err := testQueries.AdminUnpublishCourse(ctx, course.ID); err != nil {
		t.Fatal(err)
	}
	first, err := testQueries.AdminEnsurePreviewToken(ctx, repository.AdminEnsurePreviewTokenParams{Token: "tok-" + uuid.New().String(), ID: course.ID})
	if err != nil {
		t.Fatal(err)
	}
	second, _ := testQueries.AdminEnsurePreviewToken(ctx, repository.AdminEnsurePreviewTokenParams{Token: "other", ID: course.ID})
	if first.String != second.String {
		t.Errorf("preview token should be reused: %q vs %q", first.String, second.String)
	}

	published, _ := testQueries.AdminPublishCourse(ctx, course.ID)
	if published.PreviewToken.Valid {
		t.Error("publishing must clear the preview token")
	}
}

// BR-34: admin progress rows count answered questions that still exist.
func TestAdminGetUserProgressAnsweredCount(t *testing.T) {
	ctx := context.Background()
	toolID, skillID, creatorID := createCoursePrereqs(t, ctx)
	course := createPublishedCourse(t, ctx, toolID, skillID, creatorID)
	q1, _ := createTestQuestion(ctx, course.ID.String(), "multiple_choice", "Q1", "a", 1)
	_, _ = createTestQuestion(ctx, course.ID.String(), "multiple_choice", "Q2", "a", 2)
	userID := createTestUser(t, ctx)

	answers := []byte(`[{"questionId":"` + q1 + `","answer":"a","isCorrect":true},{"questionId":"` + uuid.NewString() + `","answer":"x","isCorrect":false}]`)
	if _, err := testQueries.CreateProgress(ctx, repository.CreateProgressParams{
		UserID: userID, CourseID: course.ID, CurrentQuestion: pgtype.Int4{Int32: 2, Valid: true}, Answers: answers,
	}); err != nil {
		t.Fatal(err)
	}

	rows, err := testQueries.AdminGetUserProgress(ctx, userID)
	if err != nil || len(rows) != 1 {
		t.Fatalf("rows=%d err=%v", len(rows), err)
	}
	if rows[0].AnsweredCount != 1 || rows[0].TotalQuestions != 2 || rows[0].CourseStatus != repository.CourseStatusPublished {
		t.Errorf("got %+v", rows[0])
	}
}
