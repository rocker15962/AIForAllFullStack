//	@title			AI for All API
//	@version		1.0
//	@description	RESTful API for the AI for All education platform.

//	@host		localhost:8080
//	@BasePath	/api/v1

package main

import (
	"context"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/prometheus/client_golang/prometheus/promhttp"
	"github.com/redis/go-redis/v9"
	"github.com/rocker15962/AIForAllFullStack/backend/internal/handler"
	"github.com/rocker15962/AIForAllFullStack/backend/internal/logger"
	"github.com/rocker15962/AIForAllFullStack/backend/internal/middleware"
	"github.com/rocker15962/AIForAllFullStack/backend/internal/repository"
	"github.com/rocker15962/AIForAllFullStack/backend/internal/service"
	swaggerFiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
	"go.uber.org/zap"

	_ "github.com/rocker15962/AIForAllFullStack/backend/docs/swagger"
)

func main() {
	logger.Init(os.Getenv("GIN_MODE"))
	defer func() { _ = logger.L.Sync() }()

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	ctx := context.Background()

	// PostgreSQL connection
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		logger.L.Fatal("DATABASE_URL environment variable is required")
	}

	pool, err := pgxpool.New(ctx, dbURL)
	if err != nil {
		logger.L.Fatal("Failed to connect to database", zap.Error(err))
	}
	defer pool.Close()

	if err := pool.Ping(ctx); err != nil {
		logger.L.Fatal("Failed to ping database", zap.Error(err))
	}
	logger.L.Info("Connected to PostgreSQL")

	// Redis connection
	redisURL := os.Getenv("REDIS_URL")
	if redisURL == "" {
		logger.L.Fatal("REDIS_URL environment variable is required")
	}

	opt, err := redis.ParseURL(redisURL)
	if err != nil {
		logger.L.Fatal("Failed to parse Redis URL", zap.Error(err))
	}

	rdb := redis.NewClient(opt)
	defer rdb.Close()

	if err := rdb.Ping(ctx).Err(); err != nil {
		logger.L.Fatal("Failed to ping Redis", zap.Error(err))
	}
	logger.L.Info("Connected to Redis")

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
	categoryHandler := handler.NewCategoryHandler(queries, queries, queries)
	userHandler := handler.NewUserHandler(queries)

	// Gin setup
	r := gin.Default()

	// Global middleware
	frontendURL := os.Getenv("FRONTEND_URL")
	if frontendURL == "" {
		frontendURL = "http://localhost:3000"
	}
	r.Use(logger.RequestID())
	r.Use(logger.RequestLogger())
	r.Use(middleware.CORS(frontendURL))
	r.Use(middleware.Metrics())
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
	api.GET("/creators", categoryHandler.ListCreators)

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

	// Admin routes (require auth + admin)
	adminHandler := handler.NewAdminHandler(queries)

	admin := api.Group("/admin", middleware.Auth(authService), middleware.Admin())
	admin.GET("/dashboard", adminHandler.Dashboard)
	admin.GET("/courses", adminHandler.ListCourses)
	admin.GET("/courses/:id", adminHandler.GetCourse)
	admin.POST("/courses", adminHandler.CreateCourse)
	admin.PUT("/courses/:id", adminHandler.UpdateCourse)
	admin.DELETE("/courses/:id", adminHandler.DeleteCourse)
	admin.PUT("/courses/:id/publish", adminHandler.TogglePublish)
	admin.GET("/users", adminHandler.ListUsers)
	admin.GET("/users/:id/progress", adminHandler.GetUserProgress)
	admin.GET("/categories", adminHandler.ListCategories)
	admin.POST("/tools", adminHandler.CreateTool)
	admin.PUT("/tools/:id", adminHandler.UpdateTool)
	admin.DELETE("/tools/:id", adminHandler.DeleteTool)
	admin.PUT("/tools/reorder", adminHandler.ReorderTools)
	admin.POST("/skills", adminHandler.CreateSkill)
	admin.PUT("/skills/:id", adminHandler.UpdateSkill)
	admin.DELETE("/skills/:id", adminHandler.DeleteSkill)
	admin.PUT("/skills/reorder", adminHandler.ReorderSkills)

	// Static file serving for uploads
	r.Static("/uploads", "./uploads")

	// Prometheus metrics endpoint
	r.GET("/metrics", gin.WrapH(promhttp.Handler()))

	// Swagger API documentation
	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerFiles.Handler))

	// HTTP server with graceful shutdown
	srv := &http.Server{
		Addr:    ":" + port,
		Handler: r,
	}

	go func() {
		logger.L.Info("Server starting", zap.String("port", port))
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			logger.L.Fatal("Failed to start server", zap.Error(err))
		}
	}()

	// Wait for interrupt signal
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	logger.L.Info("Shutting down server...")

	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer shutdownCancel()

	if err := srv.Shutdown(shutdownCtx); err != nil {
		logger.L.Fatal("Server forced to shutdown", zap.Error(err))
	}

	logger.L.Info("Server exited cleanly")
}
