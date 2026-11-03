//go:build integration

package integration

import (
	"context"
	"testing"

	"github.com/google/uuid"
	"github.com/rocker15962/AIForAllFullStack/backend/internal/repository"
)

func TestCreateTool(t *testing.T) {
	ctx := context.Background()
	tool, err := testQueries.AdminCreateTool(ctx, repository.AdminCreateToolParams{
		Name: "TestTool-" + uuid.New().String()[:6], Icon: "wrench", Order: 99,
	})
	if err != nil {
		t.Fatalf("CreateTool failed: %v", err)
	}
	if tool.Icon != "wrench" {
		t.Errorf("expected icon wrench, got %q", tool.Icon)
	}
}

func TestCreateSkill(t *testing.T) {
	ctx := context.Background()
	skill, err := testQueries.AdminCreateSkill(ctx, repository.AdminCreateSkillParams{
		Name: "TestSkill-" + uuid.New().String()[:6], Icon: "pen-tool", Order: 99,
	})
	if err != nil {
		t.Fatalf("CreateSkill failed: %v", err)
	}
	if skill.Icon != "pen-tool" {
		t.Errorf("expected icon pen-tool, got %q", skill.Icon)
	}
}

func TestUpdateTool(t *testing.T) {
	ctx := context.Background()
	tool, _ := testQueries.AdminCreateTool(ctx, repository.AdminCreateToolParams{
		Name: "OldName", Icon: "old", Order: 1,
	})
	updated, err := testQueries.AdminUpdateTool(ctx, repository.AdminUpdateToolParams{
		Name: "NewName", Icon: "new", ID: tool.ID,
	})
	if err != nil {
		t.Fatalf("UpdateTool failed: %v", err)
	}
	if updated.Name != "NewName" {
		t.Errorf("expected NewName, got %q", updated.Name)
	}
}

func TestArchiveTool(t *testing.T) {
	ctx := context.Background()
	tool, _ := testQueries.AdminCreateTool(ctx, repository.AdminCreateToolParams{
		Name: "ToArchive-" + uuid.New().String()[:6], Icon: "x", Order: 1,
	})
	if err := testQueries.AdminArchiveTool(ctx, tool.ID); err != nil {
		t.Fatalf("ArchiveTool failed: %v", err)
	}
	// BR-33: the tool still exists (courses keep it) but is no longer active.
	got, err := testQueries.GetToolByID(ctx, tool.ID)
	if err != nil {
		t.Fatalf("archived tool should still be readable: %v", err)
	}
	if !got.ArchivedAt.Valid {
		t.Error("expected archived_at to be set")
	}
	active, _ := testQueries.AdminListActiveTools(ctx)
	for _, a := range active {
		if a.ID == tool.ID {
			t.Error("archived tool must not be listed as active")
		}
	}
}
