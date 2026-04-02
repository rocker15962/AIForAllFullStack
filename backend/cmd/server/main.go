package main

import (
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/rocker15962/AIForAllFullStack/backend/internal/handler"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	r := gin.Default()

	healthHandler := handler.NewHealthHandler()

	api := r.Group("/api/v1")
	api.GET("/health", healthHandler.Check)

	log.Printf("Server starting on :%s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
