.PHONY: dev dev-detach stop clean migrate migrate-down seed sqlc logs logs-backend health build lint-backend

# Start all services (foreground)
dev:
	docker compose up --build

# Start all services (background)
dev-detach:
	docker compose up --build -d

# Stop all services
stop:
	docker compose down

# Stop all services and remove volumes
clean:
	docker compose down -v

# Run database migrations
migrate:
	docker compose exec backend sh -c 'migrate -path /app/db/migrations -database "$$DATABASE_URL" up'

# Rollback last migration
migrate-down:
	docker compose exec backend sh -c 'migrate -path /app/db/migrations -database "$$DATABASE_URL" down 1'

# Load seed data
seed:
	docker compose exec -T postgres psql -U aiforall -d aiforall < backend/db/seed.sql

# Regenerate sqlc code (runs on host)
sqlc:
	cd backend && sqlc generate

# Follow all service logs
logs:
	docker compose logs -f

# Follow backend logs only
logs-backend:
	docker compose logs -f backend

# Quick health check
health:
	@curl -s http://localhost:8080/api/v1/health | python3 -m json.tool

# Build all Docker images
build:
	docker compose build

# Run Go linter
lint-backend:
	cd backend && golangci-lint run ./...
