🌐 **English** | [繁體中文](README.zh-TW.md)

# AI for All — Full-Stack AI Education Platform

A nonprofit AI education platform that partners with YouTube creators to deliver structured AI learning experiences. Users can watch tutorial videos, complete quizzes, track learning progress, and earn completion badges.

## Tech Stack

### Frontend: Next.js + TypeScript

| Technology | Purpose | Rationale |
|------------|---------|-----------|
| **Next.js (App Router)** | SSR/SSG framework | Best SSR/SSG support, largest React ecosystem, first-class TypeScript. Course pages use SSG for SEO, admin pages use CSR — flexible rendering per page |
| **React** | UI library | Most mature ecosystem, largest talent pool, most enterprise-scale references |
| **TypeScript** | Type safety | Essential for large projects; consistent type safety strategy across frontend and backend (Go is also strongly typed) |
| **shadcn/ui** | UI components | Not an npm package — source code is copied into the project for full customization. Built on Radix UI (accessibility) + Tailwind CSS, currently the most popular React UI solution |
| **Tailwind CSS** | Styling | Native companion to shadcn/ui, utility-first for fast development, dark mode support, integrates directly with design tokens |
| **TanStack Query** | Data fetching | Standard solution for server data (caching, refetching, loading/error states), pairs perfectly with the Go API |
| **Zustand** | State management | Lightweight client-side state (filters, UI state), clean API, TypeScript-friendly |
| **React Hook Form + Zod** | Form handling | Form logic + validation schema, performant and type-safe |
| **Recharts** | Charts | Trend graphs and statistics for the admin dashboard, most mature charting library in the React ecosystem |
| **Lucide React** | Icons | Lightweight, consistent icon set, integrates well with shadcn/ui |

### Backend: Go

| Technology | Purpose | Rationale |
|------------|---------|-----------|
| **Go** | Backend language | Exceptional performance and concurrency — goroutines are built for high-concurrency workloads. Compiles to a single binary, simple deployment, low memory footprint. Intentionally simple language design, lowest long-term maintenance cost |
| **Gin** | Web framework | Most popular Go web framework, extremely high performance, largest community and middleware ecosystem |
| **sqlc** | Data access | SQL-first approach: write raw SQL, auto-generate type-safe Go code. Best performance, zero magic — learning SQL is learning a real skill |
| **OAuth2 + JWT** | Authentication | Google/Facebook OAuth login → issue JWT token → stateless verification. No session store needed for horizontal scaling |

### Infrastructure

| Technology | Purpose | Rationale |
|------------|---------|-----------|
| **PostgreSQL** | Primary database | Most versatile open-source database. Built-in full-text search (course search), JSON columns, excellent concurrency handling. Many free hosting options |
| **Redis** | Cache | Course list caching, rate limiting. Can serve as a message queue in the future |
| **Docker Compose** | Deployment | One-command startup for all services — `git clone` + `docker compose up` runs the full environment |
| **GitHub Actions** | CI/CD | Native GitHub integration, automated testing and builds |

### Why Next.js over Nuxt or SvelteKit?

- **SEO is critical for an education platform** — course pages are the primary organic traffic entry point; Next.js SSG/ISR handles this perfectly
- **Largest React ecosystem** — shadcn/ui, TanStack Query, Zustand, and more are all React ecosystem products
- **First-class TypeScript** — the entire framework and ecosystem are designed around TS
- Nuxt 3 (Vue) ecosystem is roughly 1/3 the size of React's, with fewer large-scale references
- SvelteKit has the best performance but the smallest ecosystem — doesn't meet the "mature ecosystem first" requirement

### Why Go over Node.js or Python?

This project is designed for long-term growth, targeting a large-scale education platform with 100,000+ users.

**Go vs Node.js (TypeScript)**
- Go's concurrency model (goroutines) far outperforms Node.js's single-threaded event loop under high traffic
- Compiles to a single binary; Docker image can be as small as ~20MB (Node.js is typically 200MB+)
- Go's dependency management is clean and stable, unlike npm's frequent breaking changes
- Trade-off: different languages for frontend and backend, no shared type definitions

**Go vs Python (Django/FastAPI)**
- Go's performance is 10–50x that of Python on equivalent hardware
- Python's GIL limits true parallel processing
- Python dominates in AI/ML ecosystem, but AI features are not a priority for this project
- If AI features are needed later, Go main service + Python AI microservice is the industry-standard architecture

## Architecture

```
                    docker compose up
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

## Project Structure

```
AIForAllFullStack/
├── frontend/                    # Next.js frontend
│   ├── src/
│   │   ├── app/                 # Page routes (App Router)
│   │   ├── components/          # UI components
│   │   ├── contexts/            # React Context (Auth)
│   │   ├── lib/                 # Utility functions
│   │   └── types/               # TypeScript types
│   ├── Dockerfile
│   └── package.json
├── backend/                     # Go API Server
│   ├── cmd/server/              # Entry point
│   ├── internal/
│   │   ├── handler/             # HTTP handlers
│   │   ├── middleware/          # JWT auth, CORS, rate limiting
│   │   ├── service/             # Business logic layer
│   │   └── repository/         # Data access layer (sqlc generated)
│   ├── db/
│   │   ├── migrations/          # SQL migrations
│   │   ├── queries/             # sqlc queries
│   │   └── seed.sql             # Seed data
│   ├── Dockerfile
│   └── go.mod
├── docker-compose.yml           # One-command startup
├── .env.example                 # Environment variables template
├── Makefile                     # Common commands
├── PRODUCT_ROADMAP.md           # Product roadmap (English)
├── PRODUCT_ROADMAP.zh-TW.md     # Product roadmap (繁體中文)
└── docs/                        # Technical documentation
```

## Features

- Embedded YouTube video playback
- Post-lesson quiz system (multiple choice and short answer)
- User registration and login (Google/Facebook OAuth)
- Learning progress tracking and completion badges
- Browse by tool (ChatGPT, Midjourney, Cursor, etc.)
- Browse by skill (copywriting, image generation, coding, etc.)
- Course difficulty levels (beginner, intermediate, advanced)
- Course search and filtering
- Admin dashboard (course, user, and category management)

## Design System

- Primary: `cyan` — buttons, links, emphasis
- Secondary: `amber` — tags, badges, completion indicators
- Neutral: `zinc` — backgrounds, text, borders
- Typography: DM Sans (headings/body), JetBrains Mono (code)

## Backend Architecture: 3-Layer Clean

The Go backend follows a 3-Layer Clean Architecture — the most mainstream pattern in the Go community. Each layer has a single responsibility and communicates through interfaces, enabling testability and separation of concerns.

```
HTTP Request
    │
    ▼
┌─────────────────────┐
│  Handler             │  Parse HTTP → call Service → return JSON
│  • No business logic │  • No direct DB access
└──────────┬──────────┘
           │ calls service interface
           ▼
┌─────────────────────┐
│  Service             │  Pure business logic
│  • No HTTP knowledge │  • Depends on repository interfaces (not implementations)
└──────────┬──────────┘
           │ calls repository interface
           ▼
┌─────────────────────┐
│  Repository          │  Data access (sqlc-generated)
│  • No business logic │  • Implements service-defined interfaces
└─────────────────────┘
```

**Key principle**: Service defines the interface, Repository implements it. This enables dependency inversion — each layer can be tested independently, and implementations can be swapped (e.g., mock repository for unit tests, real PostgreSQL for integration tests).

## Production-Ready Considerations

14 areas evaluated for production readiness:

- 🟢 Local / Docker Compose — fully achievable without external services
- 🟡 Local for now, upgradeable to external services later
- 🔴 Requires external services — not included in initial scope

| # | Area | Scope | Description |
|---|------|-------|-------------|
| 1 | Project structure | 🟢 | Monolith → separated frontend/ + backend/ |
| 2 | Go backend architecture | 🟢 | 3-Layer Clean (Handler → Service → Repository) |
| 3 | Database | 🟢 | PostgreSQL with golang-migrate versioned migrations |
| 4 | API design | 🟢 | RESTful, versioned (/api/v1/), unified response format |
| 5 | Authentication | 🟡 | Email/Password + JWT locally; OAuth2 upgrade path |
| 6 | Caching | 🟢 | Redis for list caching, rate limiting |
| 7 | Frontend adjustments | 🟢 | TanStack Query, Zustand, shadcn/ui, Zod |
| 8 | Testing | 🟢 | Go unit + integration (testcontainers-go); Vitest frontend |
| 9 | Dockerization | 🟢 | Multi-stage Go build (~20MB), 4-service compose with health checks |
| 10 | CI/CD | 🟡 | GitHub Actions (lint → test → build) |
| 11 | Security | 🟢 | CORS, rate limiting, input sanitization, secure headers |
| 12 | Observability | 🟡 | Structured logging + request ID locally; Prometheus/Grafana upgrade |
| 13 | Code quality | 🟢 | golangci-lint, gofmt, ESLint, Prettier, pre-commit hooks |
| 14 | Documentation | 🟢 | README, ADRs, Swagger/OpenAPI |

## Implementation Phases

Work is decomposed into 6 sequential phases, backend-first:

| Phase | Name | Key Deliverable |
|-------|------|----------------|
| 1 | Infrastructure + Go Skeleton | Docker Compose, Go scaffold, PostgreSQL migrations, sqlc, health check, Makefile |
| 2 | Authentication System | JWT auth flow, auth/admin middleware, rate limiting |
| 3 | Core API | Course browsing, progress tracking, search/filter/pagination, Redis cache |
| 4 | Admin API | Dashboard stats, course/user/category management |
| 5 | Frontend Migration | app/ → frontend/, remove SQLite, connect to Go API |
| 6 | Quality Assurance | Test coverage, CI/CD, Swagger docs, linting, README polish |
