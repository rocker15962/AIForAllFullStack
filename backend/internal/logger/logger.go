package logger

import (
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"go.uber.org/zap"
)

// L is the global logger instance.
var L *zap.Logger

// Init initializes the global logger. Use "release" for production JSON output.
func Init(mode string) {
	var err error
	if mode == "release" {
		L, err = zap.NewProduction()
	} else {
		L, err = zap.NewDevelopment()
	}
	if err != nil {
		panic("failed to init logger: " + err.Error())
	}
}

// RequestID assigns a unique ID to each request and sets the X-Request-ID header.
func RequestID() gin.HandlerFunc {
	return func(c *gin.Context) {
		id := c.GetHeader("X-Request-ID")
		if id == "" {
			id = uuid.New().String()
		}
		c.Set("request_id", id)
		c.Header("X-Request-ID", id)
		c.Next()
	}
}

// RequestLogger logs each HTTP request with structured fields.
func RequestLogger() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		c.Next()

		L.Info("request",
			zap.String("method", c.Request.Method),
			zap.String("path", c.Request.URL.Path),
			zap.Int("status", c.Writer.Status()),
			zap.Duration("latency", time.Since(start)),
			zap.String("request_id", c.GetString("request_id")),
			zap.String("client_ip", c.ClientIP()),
		)
	}
}
