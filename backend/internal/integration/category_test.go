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

func TestDeleteTool(t *testing.T) {
	ctx := context.Background()
	tool, _ := testQueries.AdminCreateTool(ctx, repository.AdminCreateToolParams{
		Name: "ToDelete-" + uuid.New().String()[:6], Icon: "x", Order: 1,
	})
	err := testQueries.AdminDeleteTool(ctx, tool.ID)
	if err != nil {
		t.Fatalf("DeleteTool failed: %v", err)
	}
	_, err = testQueries.GetToolByID(ctx, tool.ID)
	if err == nil {
		t.Error("expected error after delete")
	}
}
