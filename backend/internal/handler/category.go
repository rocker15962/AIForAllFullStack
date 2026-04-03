package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/rocker15962/AIForAllFullStack/backend/internal/service"
)

type CategoryHandler struct {
	tools  service.ToolRepository
	skills service.SkillRepository
}

func NewCategoryHandler(tools service.ToolRepository, skills service.SkillRepository) *CategoryHandler {
	return &CategoryHandler{tools: tools, skills: skills}
}

func (h *CategoryHandler) ListTools(c *gin.Context) {
	tools, err := h.tools.ListTools(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to list tools"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"tools": tools})
}

func (h *CategoryHandler) ListSkills(c *gin.Context) {
	skills, err := h.skills.ListSkills(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to list skills"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"skills": skills})
}
