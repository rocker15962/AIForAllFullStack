//go:build integration

package integration

import (
	"context"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"testing"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/rocker15962/AIForAllFullStack/backend/internal/repository"
	"github.com/testcontainers/testcontainers-go"
	"github.com/testcontainers/testcontainers-go/modules/postgres"
	"github.com/testcontainers/testcontainers-go/wait"
)

var (
	testPool    *pgxpool.Pool
	testQueries *repository.Queries
)

func TestMain(m *testing.M) {
	ctx := context.Background()

	pgContainer, err := postgres.Run(ctx, "postgres:16-alpine",
		postgres.WithDatabase("aiforall_test"),
		postgres.WithUsername("test"),
		postgres.WithPassword("test"),
		testcontainers.WithWaitStrategy(
			wait.ForLog("database system is ready to accept connections").
				WithOccurrence(2).
				WithStartupTimeout(30*time.Second),
		),
	)
	if err != nil {
		fmt.Fprintf(os.Stderr, "failed to start postgres container: %v\n", err)
		os.Exit(1)
	}
	defer pgContainer.Terminate(ctx)

	connStr, err := pgContainer.ConnectionString(ctx, "sslmode=disable")
	if err != nil {
		fmt.Fprintf(os.Stderr, "failed to get connection string: %v\n", err)
		os.Exit(1)
	}

	testPool, err = pgxpool.New(ctx, connStr)
	if err != nil {
		fmt.Fprintf(os.Stderr, "failed to connect: %v\n", err)
		os.Exit(1)
	}
	defer testPool.Close()

	if err := runMigrations(ctx, testPool); err != nil {
		fmt.Fprintf(os.Stderr, "failed to run migrations: %v\n", err)
		os.Exit(1)
	}

	testQueries = repository.New(testPool)

	os.Exit(m.Run())
}

func runMigrations(ctx context.Context, pool *pgxpool.Pool) error {
	files, err := filepath.Glob("../../db/migrations/*.up.sql")
	if err != nil {
		return fmt.Errorf("glob migrations: %w", err)
	}
	sort.Strings(files)

	for _, f := range files {
		sql, err := os.ReadFile(f)
		if err != nil {
			return fmt.Errorf("read %s: %w", f, err)
		}
		if _, err := pool.Exec(ctx, string(sql)); err != nil {
			return fmt.Errorf("exec %s: %w", filepath.Base(f), err)
		}
	}
	return nil
}

// createTestCreator inserts a creator via raw SQL (no sqlc query for create)
func createTestCreator(ctx context.Context, name string) (string, error) {
	var id string
	err := testPool.QueryRow(ctx,
		`INSERT INTO creators (name, avatar_url, channel_url) VALUES ($1, '', 'https://youtube.com') RETURNING id`,
		name,
	).Scan(&id)
	return id, err
}

// createTestQuestion inserts a question via raw SQL
func createTestQuestion(ctx context.Context, courseID, qType, question, correctAnswer string, order int) (string, error) {
	var id string
	err := testPool.QueryRow(ctx,
		`INSERT INTO questions (course_id, type, question, correct_answer, "order") VALUES ($1, $2, $3, $4, $5) RETURNING id`,
		courseID, qType, question, correctAnswer, order,
	).Scan(&id)
	return id, err
}
