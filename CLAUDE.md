# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI for All is a nonprofit AI education platform that partners with YouTube creators. Users watch embedded tutorial videos, complete quizzes, and track learning progress. The platform is bilingual (English + Traditional Chinese / 繁體中文).

**Current state**: All 6 development phases are complete. Next.js frontend in `frontend/`, Go API server in `backend/`, PostgreSQL + Redis, all orchestrated via Docker Compose. 44 API endpoints, Google OAuth2 authentication, full test suite (unit, integration, E2E), and GitHub Actions CI pipeline.

## Commands

```bash
cd frontend
npm install              # Install dependencies (first time)
npm run dev              # Start dev server (port 3000)
npm run build            # Production build
npm run start            # Start production server
npm run lint             # ESLint
npm run lint:fix         # ESLint with auto-fix
npm run format           # Prettier format all files
npm run format:check     # Check formatting without writing
npm run type-check       # TypeScript strict type-check (tsc --noEmit)
npm run test             # Vitest run (single pass)
npm run test:watch       # Vitest watch mode
npm run test:coverage    # Vitest with coverage report
npm run quality          # Full suite: lint + type-check + format:check + test
```

Run `npm run quality` before merging any feature branch.

### Backend (Go)

```bash
cd backend
go build ./cmd/server     # Build backend binary
go test ./...             # Run Go tests
```

### Docker Compose (from repo root)

```bash
make dev                  # Start all 4 services (foreground)
make dev-detach           # Start all 4 services (background)
make stop                 # Stop all services
make clean                # Stop + remove volumes
make migrate              # Run database migrations
make migrate-down         # Rollback last migration
make seed                 # Load seed data (courses, tools, skills)
make sqlc                 # Regenerate sqlc code
make health               # Quick health check
make logs                 # Follow all service logs
make logs-backend         # Follow backend logs only
make build                # Build all Docker images
make lint-backend         # Run Go linter
make monitoring           # Start all services + Prometheus + Grafana
make swagger              # Regenerate Swagger docs (swag init)
make admin EMAIL=x@y.com  # Promote a user to admin (must have logged in first)
```

## Feature Development Lifecycle

Every feature follows these phases in order. **Do not skip phases.**

### Phase 0: Preparation
1. Read this CLAUDE.md
2. Create feature branch from `dev`: `git checkout -b feat/<name> dev`
3. `git pull origin dev` to ensure latest code

### Phase 1: Understand Requirements
1. Read `PRODUCT_ROADMAP.md` — find the relevant Phase and feature checklist
2. View `AIForAll.pen` via Pencil MCP tools for visual design reference
3. Identify user flows, API endpoints, and success criteria from the roadmap

### Phase 2: TDD Cycle
1. Write failing tests based on feature requirements
2. Implement minimum code to make tests pass
3. Refactor while keeping tests green
4. Run `npm run test` after each implementation chunk — don't wait until the end

### Phase 3: Quality Checks
1. `npm run lint` — zero errors
2. `npm run type-check` — passes
3. `npm run format:check` — passes
4. `npm run test` — all tests pass
5. Manual verification: `npm run dev`, walk through the feature in browser

### Phase 4: Commit & Self-Review
Self-review checklist before committing:
- [ ] Error handling and loading states implemented
- [ ] Empty states handled (when no data exists)
- [ ] Matches visual design from `AIForAll.pen`
- [ ] Responsive on mobile
- [ ] Semantic HTML and basic accessibility
- [ ] No hardcoded data — connected to API/database
- [ ] No `console.log` or debugging artifacts left

Then: `git add` only necessary files → `git commit` (pre-commit hook runs automatically)

### Phase 5: Completion
1. Merge feature branch to `dev` when all features for a milestone are done
2. Run `npm run quality` — full suite must pass

## Code Standards

### TypeScript
- **Strict mode** — no `any`, no `@ts-ignore`
- **Path alias**: `@/*` maps to `src/*` — always use `@/` for imports
- **Type imports**: Use `import type { ... }` for type-only imports
- **Component exports**: Each feature directory has an `index.ts` barrel export
- **Client components**: Use `'use client'` directive on interactive components

### Commit Messages — Conventional Commits

```
<type>(<scope>): <description>

Types: feat, fix, test, chore, docs, refactor, style
Scopes: foundation, course-discovery, course-learning, user-progress, admin, auth, db
```

Examples:
- `feat(course-discovery): add search and filter functionality`
- `test(course-learning): add quiz submission tests`
- `fix(auth): resolve token expiration handling`

### Dependencies
Do NOT add dependencies without documenting why. Business dependencies (shadcn/ui, TanStack Query, Zustand, Zod, Recharts) are installed during their respective milestone, not upfront.

## Git Strategy

```
main ─────────────────────── (production-ready, merge from dev)
  └── dev ────────────────── (integration branch)
        ├── feat/foundation
        ├── feat/course-discovery
        ├── feat/course-learning
        ├── feat/user-progress
        └── feat/admin-dashboard
```

- Feature branch → `dev`: all tests pass, lint clean, type-check clean
- `dev` → `main`: milestone fully complete, manual verification done

## Quality Tooling

### Pre-commit Hooks (husky + lint-staged)

husky lives at git root (`AIForAllFullStack/.husky/`), but Next.js is in `frontend/`. The pre-commit hook `cd frontend` before running checks.

Pre-commit runs:
1. **lint-staged**: ESLint `--fix` + Prettier `--write` on staged `.ts`/`.tsx` files; Prettier on `.json`/`.md`/`.css`
2. **tsc --noEmit**: Full project type-check (type errors can cascade beyond staged files)

If any step fails, the commit is blocked.

### ESLint
- Extends `eslint-config-next/core-web-vitals` + `eslint-config-next/typescript`
- `eslint-config-prettier` disables conflicting formatting rules
- `no-console: "warn"` (allow `console.error`/`console.warn`)
- `@typescript-eslint/no-explicit-any: "error"`
- `@typescript-eslint/no-unused-vars: "error"`

### Prettier

```json
{
  "semi": false,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

### Vitest
- Environment: `jsdom`
- Setup: `src/test/setup.ts` (imports `@testing-library/jest-dom`)
- Coverage: `v8` provider
- Test files: co-located as `*.test.ts` / `*.test.tsx`
- Path aliases match `tsconfig.json` (`@/*` → `./src/*`)

### Dev Dependencies for Tooling

| Package | Purpose |
|---------|---------|
| `vitest` | Test runner |
| `@testing-library/react` | React component testing |
| `@testing-library/jest-dom` | DOM assertion matchers |
| `@testing-library/user-event` | Simulate user interactions |
| `@vitejs/plugin-react` | React support for Vitest |
| `jsdom` | Browser environment simulation |
| `prettier` | Code formatting |
| `prettier-plugin-tailwindcss` | Auto-sort Tailwind classes |
| `eslint-config-prettier` | Disable conflicting ESLint rules |
| `husky` | Git hooks management |
| `lint-staged` | Run linters on staged files only |

## Design System

- **Primary**: `cyan` — buttons, links, active states
- **Secondary**: `amber` — tags, badges, completion indicators
- **Neutral**: `zinc` — backgrounds, text, borders
- **Fonts**: DM Sans (headings/body), JetBrains Mono (code)
- **Dark mode**: All components must support `dark:` variants
- Design tokens defined as CSS custom properties in `frontend/src/app/globals.css`
- Visual designs in `AIForAll.pen` — open with Pencil MCP tools

## Architecture

```
frontend/  → Next.js (port 3000) — route groups: (marketing), (app), (admin)
backend/   → Go + Gin (port 8080) — 3-Layer Clean Architecture
             Handler → Service (interfaces) → Repository (sqlc-generated)
PostgreSQL → Primary database (port 5432)
Redis      → Cache + rate limiting (port 6379)
```

### Frontend Structure

```
frontend/src/
├── app/
│   ├── (marketing)/      # Landing page, login, auth callback
│   ├── (app)/            # Courses, my-learning, profile (user routes)
│   └── (admin)/          # Admin dashboard, course/user/category management
├── components/
│   ├── ui/               # shadcn/ui components (8 installed)
│   ├── shell/            # AppShell, TopNav, UserMenu
│   ├── course-discovery/ # Course cards, filter sidebar
│   ├── course-learning/  # Video player, quiz, completion view
│   ├── my-learning/      # Progress, completed, badges tabs
│   ├── admin/            # Dashboard stats, course editor, question editor
│   └── shared/           # ConfirmDialog, Toast, EmptyState, ErrorState
├── contexts/             # AuthContext (wraps Zustand store)
├── stores/               # Zustand auth store
├── lib/                  # API client, Zod schemas, query provider
└── types/                # TypeScript type definitions
```

The Go backend follows 3-Layer Clean Architecture: Handler (HTTP parsing) → Service (business logic, defines interfaces) → Repository (data access, implements interfaces). Service defines the interface, Repository implements it — enabling dependency inversion for testing.

### Data Model
7 entities: User, Course, Question, Tool, Skill, Progress, Creator. Full field definitions and relationships are in `PRODUCT_ROADMAP.md` Section 2. TypeScript types are in `frontend/src/types/index.ts`.

## Language

- UI text is in Traditional Chinese (正體中文) only — no i18n layer
- Code identifiers, comments, and docs use English
- `README.md` is Chinese-first with an English `README.en.md`; other key docs have paired `.zh-TW.md` versions — **always update both** when making changes

## Gotchas

- **Gitignored work dirs**: `docs/superpowers/` (design specs) and `.claude/` (plans) are gitignored — don't `git add` them
- **Working directory matters**: All `npm` commands must run from `frontend/`, not the repo root. husky pre-commit hook handles this automatically with `cd frontend`.
- **Docker required**: `make dev` (or `docker compose up --build`) starts the full stack. PostgreSQL and Redis run in containers. First Go build in Docker on macOS is slow (~15 min) due to Linux emulation; subsequent builds are cached via named volumes.
- **Go tooling on host**: `sqlc generate` runs on the host machine (not in Docker) so generated files are available for IDE support. Install with `go install github.com/sqlc-dev/sqlc/cmd/sqlc@latest`.
- **`.env` required for OAuth**: Copy `.env.example` to `.env` and fill in Google OAuth credentials. Without valid OAuth credentials, login will fail (but the rest of the app works).
- **Root `package.json`**: A minimal `package.json` exists at the git root solely for husky's `prepare` script. It is NOT the app's package.json.
- **`app/` is legacy**: The frontend source code is in `frontend/`, not `app/`. Any remaining `app/` references are outdated.
- **Monitoring is optional**: `make dev` starts 4 core services. `make monitoring` adds Prometheus (9090) + Grafana (3001) via Docker Compose profiles.
- **Swagger docs are generated**: Run `make swagger` after changing handler annotations. Generated files in `backend/docs/swagger/` must be committed.

## Important Files

- `PRODUCT_ROADMAP.md` — Complete product spec with 6 development phases, data model, API endpoints, success criteria
- `README.md` — Tech stack rationale, architecture diagram, production readiness evaluation
- `AIForAll.pen` — Visual design file (open with Pencil MCP tools)
- `frontend/src/types/index.ts` — TypeScript type definitions (source of truth for data shapes)
- `frontend/src/app/globals.css` — Design tokens and color scale definitions
- `backend/cmd/server/main.go` — All 44 API endpoint registrations + Swagger general info
- `backend/db/migrations/` — PostgreSQL schema (golang-migrate)
- `backend/docs/swagger/` — Generated Swagger/OpenAPI spec (committed to git)
- `backend/internal/middleware/metrics.go` — Prometheus HTTP metrics middleware
- `monitoring/` — Prometheus config + Grafana dashboard provisioning
- `docs/ENVIRONMENT.md` — All environment variables documentation
- `scripts/verify-services.sh` — Verify all 6 services are running and connected
