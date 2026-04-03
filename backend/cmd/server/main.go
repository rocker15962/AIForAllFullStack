package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/redis/go-redis/v9"
	"github.com/rocker15962/AIForAllFullStack/backend/internal/handler"
	"github.com/rocker15962/AIForAllFullStack/backend/internal/middleware"
	"github.com/rocker15962/AIForAllFullStack/backend/internal/repository"
	"github.com/rocker15962/AIForAllFullStack/backend/internal/service"
)

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	ctx := context.Background()

	// PostgreSQL connection
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		log.Fatal("DATABASE_URL environment variable is required")
	}

	pool, err := pgxpool.New(ctx, dbURL)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer pool.Close()

	if err := pool.Ping(ctx); err != nil {
		log.Fatalf("Failed to ping database: %v", err)
	}
	log.Println("Connected to PostgreSQL")

	// Redis connection
	redisURL := os.Getenv("REDIS_URL")
	if redisURL == "" {
		log.Fatal("REDIS_URL environment variable is required")
	}

	opt, err := redis.ParseURL(redisURL)
	if err != nil {
		log.Fatalf("Failed to parse Redis URL: %v", err)
	}

	rdb := redis.NewClient(opt)
	defer rdb.Close()

	if err := rdb.Ping(ctx).Err(); err != nil {
		log.Fatalf("Failed to ping Redis: %v", err)
	}
	log.Println("Connected to Redis")

	// Repository
	queries := repository.New(pool)

	// Services
	authService := service.NewAuthService(
		queries,
		os.Getenv("GOOGLE_CLIENT_ID"),
		os.Getenv("GOOGLE_CLIENT_SECRET"),
		os.Getenv("GOOGLE_REDIRECT_URL"),
		os.Getenv("JWT_SECRET"),
	)

	courseService := service.NewCourseService(queries, queries, queries, queries, queries, queries)

	// Handlers
	healthHandler := handler.NewHealthHandler(pool, rdb)
	authHandler := handler.NewAuthHandler(authService, os.Getenv("FRONTEND_URL"))
	courseHandler := handler.NewCourseHandler(courseService)
	categoryHandler := handler.NewCategoryHandler(queries, queries)
	userHandler := handler.NewUserHandler(queries)

	// Gin setup
	r := gin.Default()

	// Global middleware
	frontendURL := os.Getenv("FRONTEND_URL")
	if frontendURL == "" {
		frontendURL = "http://localhost:3000"
	}
	r.Use(middleware.CORS(frontendURL))
	r.Use(middleware.RateLimit(rdb))

	api := r.Group("/api/v1")
	api.GET("/health", healthHandler.Check)

	// Auth routes
	auth := api.Group("/auth")
	auth.GET("/google/login", authHandler.GoogleLogin)
	auth.GET("/google/callback", authHandler.GoogleCallback)
	auth.POST("/refresh", authHandler.Refresh)
	auth.POST("/logout", authHandler.Logout)
	auth.GET("/me", middleware.Auth(authService), authHandler.Me)

	// Category routes (public)
	api.GET("/tools", categoryHandler.ListTools)
	api.GET("/skills", categoryHandler.ListSkills)

	// Course routes
	api.GET("/courses", courseHandler.List)
	api.GET("/courses/:id", courseHandler.Get)
	api.GET("/courses/:id/recommended", courseHandler.Recommended)
	api.POST("/courses/:id/submit", middleware.Auth(authService), courseHandler.Submit)
	api.POST("/courses/:id/complete", middleware.Auth(authService), courseHandler.Complete)

	// User routes (all require auth)
	my := api.Group("/my", middleware.Auth(authService))
	my.GET("/progress", userHandler.GetProgress)
	my.GET("/completed", userHandler.GetCompleted)
	my.GET("/badges", userHandler.GetBadges)
	my.GET("/stats", userHandler.GetStats)
	my.GET("/profile", userHandler.GetProfile)
	my.PUT("/profile", userHandler.UpdateProfile)
	my.POST("/avatar", userHandler.UploadAvatar)

	// Static file serving for uploads
	r.Static("/uploads", "./uploads")

	// HTTP server with graceful shutdown
	srv := &http.Server{
		Addr:    ":" + port,
		Handler: r,
	}

	go func() {
		log.Printf("Server starting on :%s", port)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Failed to start server: %v", err)
		}
	}()

	// Wait for interrupt signal
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Println("Shutting down server...")

	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer shutdownCancel()

	if err := srv.Shutdown(shutdownCtx); err != nil {
		log.Fatalf("Server forced to shutdown: %v", err)
	}

	log.Println("Server exited cleanly")
}
