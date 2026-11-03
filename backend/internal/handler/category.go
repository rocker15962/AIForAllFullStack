package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/rocker15962/AIForAllFullStack/backend/internal/service"
)

type CategoryHandler struct {
	tools    service.ToolRepository
	skills   service.SkillRepository
	creators service.CreatorRepository
}

func NewCategoryHandler(tools service.ToolRepository, skills service.SkillRepository, creators service.CreatorRepository) *CategoryHandler {
	return &CategoryHandler{tools: tools, skills: skills, creators: creators}
}

// ListTools godoc
//
//	@Summary		List all tools
//	@Description	Returns all tool categories, including archived ones (archived_at set) so existing courses can show their names. Hide archived ones in filters.
//	@Tags			categories
//	@Produce		json
//	@Success		200	{object}	map[string]interface{}
//	@Router			/tools [get]
func (h *CategoryHandler) ListTools(c *gin.Context) {
	tools, err := h.tools.ListTools(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to list tools"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"tools": tools})
}

// ListSkills godoc
//
//	@Summary		List all skills
//	@Description	Returns all skill categories, including archived ones (archived_at set) so existing courses can show their names. Hide archived ones in filters.
//	@Tags			categories
//	@Produce		json
//	@Success		200	{object}	map[string]interface{}
//	@Router			/skills [get]
func (h *CategoryHandler) ListSkills(c *gin.Context) {
	skills, err := h.skills.ListSkills(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to list skills"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"skills": skills})
}

// ListCreators godoc
//
//	@Summary		List all creators
//	@Description	Returns all content creators
//	@Tags			categories
//	@Produce		json
//	@Success		200	{object}	map[string]interface{}
//	@Router			/creators [get]
func (h *CategoryHandler) ListCreators(c *gin.Context) {
	creators, err := h.creators.ListCreators(c.Request.Context())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to list creators"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"creators": creators})
}
