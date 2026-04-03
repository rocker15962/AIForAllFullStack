# AI for All

[![Go](https://img.shields.io/badge/Go-1.23-00ADD8?logo=go&logoColor=white)](https://go.dev/)
[![Next.js](https://img.shields.io/badge/Next.js-15-000000?logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)](https://docs.docker.com/compose/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

A full-stack AI education platform that partners with YouTube creators to deliver structured, bilingual (English / 繁體中文) learning experiences — video tutorials, quizzes, progress tracking, and completion badges.

## Key Features

- **Embedded YouTube playback** with structured lesson flow
- **Quiz system** — multiple choice and short answer, auto-graded
- **Progress tracking** with completion badges and streaks
- **Course discovery** — browse by tool (ChatGPT, Midjourney, Cursor), skill, or difficulty
- **Full-text search** with filters and pagination
- **Google OAuth** authentication with JWT sessions
- **Admin dashboard** — course, user, and category management with analytics
- **Bilingual UI** — English and Traditional Chinese (繁體中文)
- **Dark mode** support across all components
- **Redis caching** and rate limiting for production workloads

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Next.js 15, React, TypeScript | SSG for SEO-critical pages, CSR for admin |
| | Tailwind CSS, shadcn/ui | Utility-first styling with accessible components |
| | TanStack Query, Zustand | Server state caching and client state management |
| | React Hook Form, Zod | Performant forms with schema validation |
| **Backend** | Go, Gin | High-performance REST API with middleware |
| | sqlc | Type-safe data access generated from raw SQL |
| | JWT, OAuth2 | Stateless authentication with Google login |
| **Infrastructure** | PostgreSQL 16 | Primary database with full-text search |
| | Redis | Caching, rate limiting |
| | Docker Compose | Single-command orchestration of all services |
| | GitHub Actions | CI/CD pipeline (lint, test, build) |

## Getting Started

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and [Docker Compose](https://docs.docker.com/compose/install/)
- [Go 1.23+](https://go.dev/dl/) (for local backend development)
- [Node.js 20+](https://nodejs.org/) (for local frontend development)

### Quick Start

```bash
# Clone the repository
git clone https://github.com/rocker15962/AIForAllFullStack.git
cd AIForAllFullStack

# Copy environment variables
cp .env.example .env

# Start all services
docker compose up -d

# Seed the database with sample data
docker compose exec backend go run cmd/seed/main.go
```

The application will be available at:

- **Frontend**: http://localhost:3000
- **API Server**: http://localhost:8080
- **API Health Check**: http://localhost:8080/api/v1/health

### Local Development (without Docker)

```bash
# Backend
cd backend
go mod download
go run cmd/server/main.go

# Frontend (separate terminal)
cd frontend
npm install
npm run dev
```

See [`docs/ENVIRONMENT.md`](docs/ENVIRONMENT.md) for all environment variables.

## API Documentation

The backend exposes a RESTful API under `/api/v1/`. Key endpoint groups:

| Group | Endpoints | Description |
|-------|----------|-------------|
| Auth | `POST /auth/register`, `POST /auth/login`, `GET /auth/google` | Registration, login, OAuth |
| Courses | `GET /courses`, `GET /courses/:id` | Browse, search, filter courses |
| Progress | `GET /progress`, `POST /progress` | Track learning progress |
| Quiz | `POST /courses/:id/quiz/submit` | Submit quiz answers |
| Admin | `GET /admin/stats`, CRUD endpoints | Dashboard and management |

All endpoints return a unified JSON response format:

```json
{
  "success": true,
  "data": { },
  "meta": { "page": 1, "per_page": 20, "total": 100 }
}
```

## Project Structure

```
AIForAllFullStack/
├── frontend/                    # Next.js frontend application
│   ├── src/
│   │   ├── app/                 # Page routes (App Router)
│   │   ├── components/          # UI components by feature
│   │   ├── lib/                 # Utilities, API client
│   │   └── types/               # TypeScript type definitions
│   ├── Dockerfile
│   └── package.json
├── backend/                     # Go API server
│   ├── cmd/server/              # Application entry point
│   ├── internal/
│   │   ├── handler/             # HTTP request handlers
│   │   ├── service/             # Business logic layer
│   │   ├── repository/          # Data access (sqlc-generated)
│   │   └── middleware/          # Auth, CORS, rate limiting
│   ├── db/
│   │   ├── migrations/          # Versioned SQL migrations
│   │   ├── queries/             # sqlc SQL queries
│   │   └── seed.sql             # Sample data
│   ├── Dockerfile
│   └── go.mod
├── docker-compose.yml           # Multi-service orchestration
├── .env.example                 # Environment variable template
├── Makefile                     # Common development commands
└── docs/                        # Documentation
    └── ENVIRONMENT.md           # Environment variable reference
```

## Architecture

The Go backend follows **3-Layer Clean Architecture**, the standard pattern in the Go ecosystem:

```
HTTP Request
    │
    ▼
┌─────────────────────┐
│  Handler             │  Parse HTTP → call Service → return JSON
│  (no business logic) │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Service             │  Pure business logic, defines interfaces
│  (no HTTP knowledge) │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Repository          │  Data access (sqlc-generated)
│  (implements ifaces) │  Swappable for testing
└─────────────────────┘
```

**Key principle**: Service defines the interface, Repository implements it. This enables dependency inversion — each layer can be tested independently with mock implementations.

Infrastructure overview:

```
┌──────────────────────────────────────────────────────┐
│                   Docker Compose                      │
│                                                       │
│  ┌─────────────────┐     ┌──────────────────────┐    │
│  │  Next.js Frontend│────▶│    Go API Server      │    │
│  │   (port 3000)    │     │    (Gin + sqlc)       │    │
│  └─────────────────┘     │    (port 8080)        │    │
│                           └──────┬──────────┬─────┘    │
│                                  │          │           │
│                           ┌──────▼──┐  ┌───▼────┐     │
│                           │PostgreSQL│  │ Redis  │     │
│                           │ (5432)   │  │ (6379) │     │
│                           └─────────┘  └────────┘     │
└──────────────────────────────────────────────────────┘
```

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
