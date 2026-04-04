//go:build integration

package integration

import (
	"context"
	"testing"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/rocker15962/AIForAllFullStack/backend/internal/repository"
)

func createCoursePrereqs(t *testing.T, ctx context.Context) (toolID, skillID uuid.UUID, creatorID string) {
	t.Helper()
	tool, err := testQueries.AdminCreateTool(ctx, repository.AdminCreateToolParams{
		Name: "TestTool-" + uuid.New().String()[:6], Icon: "bot", Order: 1,
	})
	if err != nil {
		t.Fatalf("create tool: %v", err)
	}
	skill, err := testQueries.AdminCreateSkill(ctx, repository.AdminCreateSkillParams{
		Name: "TestSkill-" + uuid.New().String()[:6], Icon: "pen", Order: 1,
	})
	if err != nil {
		t.Fatalf("create skill: %v", err)
	}
	cID, err := createTestCreator(ctx, "Creator-"+uuid.New().String()[:6])
	if err != nil {
		t.Fatalf("create creator: %v", err)
	}
	return tool.ID, skill.ID, cID
}

func TestCreateAndListCourses(t *testing.T) {
	ctx := context.Background()
	toolID, skillID, creatorID := createCoursePrereqs(t, ctx)

	creatorUUID, _ := uuid.Parse(creatorID)
	course, err := testQueries.AdminCreateCourse(ctx, repository.AdminCreateCourseParams{
		Title: "Integration Test Course", Description: "Testing",
		YoutubeUrl: "https://youtube.com/watch?v=test", YoutubeID: "test123",
		ThumbnailUrl: "https://img.youtube.com/test", ToolID: toolID, SkillID: skillID,
		CreatorID: creatorUUID, Difficulty: repository.DifficultyLevelBeginner, Duration: 600,
		Status: repository.CourseStatusPublished,
	})
	if err != nil {
		t.Fatalf("CreateCourse failed: %v", err)
	}
	if course.Title != "Integration Test Course" {
		t.Errorf("expected title, got %q", course.Title)
	}

	// List should include it
	courses, err := testQueries.AdminListCourses(ctx, repository.AdminListCoursesParams{
		Search:       pgtype.Text{Valid: false},
		StatusFilter: pgtype.Text{Valid: false},
	})
	if err != nil {
		t.Fatalf("ListCourses failed: %v", err)
	}
	found := false
	for _, c := range courses {
		if c.ID == course.ID {
			found = true
			break
		}
	}
	if !found {
		t.Error("created course not found in list")
	}
}

func TestGetCourseByID(t *testing.T) {
	ctx := context.Background()
	toolID, skillID, creatorID := createCoursePrereqs(t, ctx)
	creatorUUID, _ := uuid.Parse(creatorID)

	course, _ := testQueries.AdminCreateCourse(ctx, repository.AdminCreateCourseParams{
		Title: "Get By ID Course", Description: "Test", YoutubeUrl: "https://youtube.com", YoutubeID: "abc",
		ThumbnailUrl: "https://img.youtube.com", ToolID: toolID, SkillID: skillID,
		CreatorID: creatorUUID, Difficulty: repository.DifficultyLevelIntermediate, Duration: 300,
		Status: repository.CourseStatusDraft,
	})

	found, err := testQueries.GetCourseByID(ctx, course.ID)
	if err != nil {
		t.Fatalf("GetCourseByID failed: %v", err)
	}
	if found.Difficulty != repository.DifficultyLevelIntermediate {
		t.Errorf("expected intermediate, got %q", found.Difficulty)
	}
}

func TestDeleteCourse(t *testing.T) {
	ctx := context.Background()
	toolID, skillID, creatorID := createCoursePrereqs(t, ctx)
	creatorUUID, _ := uuid.Parse(creatorID)

	course, _ := testQueries.AdminCreateCourse(ctx, repository.AdminCreateCourseParams{
		Title: "To Delete", Description: "Del", YoutubeUrl: "https://youtube.com", YoutubeID: "del",
		ThumbnailUrl: "https://img.youtube.com", ToolID: toolID, SkillID: skillID,
		CreatorID: creatorUUID, Difficulty: repository.DifficultyLevelAdvanced, Duration: 100,
		Status: repository.CourseStatusDraft,
	})

	err := testQueries.AdminDeleteCourse(ctx, course.ID)
	if err != nil {
		t.Fatalf("DeleteCourse failed: %v", err)
	}

	_, err = testQueries.GetCourseByID(ctx, course.ID)
	if err == nil {
		t.Error("expected error after delete, got nil")
	}
}
