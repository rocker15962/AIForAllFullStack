package handler

import (
	"context"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/redis/go-redis/v9"
)

type HealthHandler struct {
	db    *pgxpool.Pool
	redis *redis.Client
}

func NewHealthHandler(db *pgxpool.Pool, redis *redis.Client) *HealthHandler {
	return &HealthHandler{db: db, redis: redis}
}

type healthResponse struct {
	Status    string            `json:"status"`
	Timestamp string            `json:"timestamp"`
	Services  map[string]string `json:"services"`
}

// Check godoc
//
//	@Summary		Health check
//	@Description	Returns service health status including database and Redis connectivity
//	@Tags			health
//	@Produce		json
//	@Success		200	{object}	map[string]interface{}
//	@Router			/health [get]
func (h *HealthHandler) Check(c *gin.Context) {
	ctx, cancel := context.WithTimeout(c.Request.Context(), 3*time.Second)
	defer cancel()

	dbStatus := "connected"
	if h.db == nil {
		dbStatus = "disconnected"
	} else if err := h.db.Ping(ctx); err != nil {
		dbStatus = "disconnected"
	}

	redisStatus := "connected"
	if h.redis == nil {
		redisStatus = "disconnected"
	} else if err := h.redis.Ping(ctx).Err(); err != nil {
		redisStatus = "disconnected"
	}

	status := "ok"
	if dbStatus == "disconnected" || redisStatus == "disconnected" {
		status = "degraded"
	}

	resp := healthResponse{
		Status:    status,
		Timestamp: time.Now().UTC().Format(time.RFC3339),
		Services: map[string]string{
			"database": dbStatus,
			"redis":    redisStatus,
		},
	}
	c.JSON(http.StatusOK, resp)
}
