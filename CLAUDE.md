# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AI for All is a nonprofit AI education platform that partners with YouTube creators. Users watch embedded tutorial videos, complete quizzes, and track learning progress. The platform is bilingual (English + Traditional Chinese / 繁體中文).

**Current state**: Next.js frontend prototype with SQLite in `frontend/`. The Go backend, PostgreSQL, Redis, and Docker infrastructure have not been built yet.

**Target architecture**: Next.js frontend (`frontend/`) + Go API server (`backend/`) + PostgreSQL + Redis, all orchestrated via Docker Compose. See `PRODUCT_ROADMAP.md` for the full 6-phase plan.

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

### Current: Single-tier frontend

```
frontend/src/
├── app/              # Next.js App Router pages (9 routes)
│   ├── api/          # API routes (SQLite-backed, to be replaced by Go API)
│   ├── courses/      # /courses and /courses/[id]
│   ├── my-learning/  # User dashboard
│   ├── profile/      # User profile
│   └── admin/        # Admin dashboard (4 sub-routes)
├── components/       # React components organized by feature
│   ├── shell/        # AppShell, TopNav, UserMenu
│   ├── course-discovery/
│   ├── course-learning/
│   ├── my-learning/
│   └── admin/
├── contexts/         # AuthContext (React Context)
├── lib/              # db.ts (SQLite), data.ts, seed.ts
└── types/index.ts    # All TypeScript types (37 exports)
```

### Target: Frontend + Go Backend

```
frontend/  → Next.js (port 3000) — SSG for course pages, CSR for admin
backend/   → Go + Gin (port 8080) — 3-Layer Clean Architecture
             Handler → Service (interfaces) → Repository (sqlc-generated)
PostgreSQL → Primary database (port 5432)
Redis      → Cache + rate limiting (port 6379)
```

The Go backend follows 3-Layer Clean Architecture: Handler (HTTP parsing) → Service (business logic, defines interfaces) → Repository (data access, implements interfaces). Service defines the interface, Repository implements it — enabling dependency inversion for testing.

### Data Model
7 entities: User, Course, Question, Tool, Skill, Progress, Creator. Full field definitions and relationships are in `PRODUCT_ROADMAP.md` Section 2. All TypeScript types are defined in `frontend/src/types/index.ts`.

## Language

- UI text is in Traditional Chinese (繁體中文): 探索課程, 我的學習, etc.
- Code identifiers, comments, and docs use English
- Key docs have paired `.zh-TW.md` versions — **always update both** when making changes

## Gotchas

- **Gitignored work dirs**: `docs/superpowers/` (design specs) and `.claude/` (plans) are gitignored — don't `git add` them
- **Working directory matters**: All `npm` commands must run from `frontend/`, not the repo root. husky pre-commit hook handles this automatically with `cd frontend`.
- **SQLite auto-init**: The database (`frontend/data/aiforall.db`) is auto-created on first `npm run dev`. No manual setup needed.
- **No `.env` required**: Current prototype has no environment variables. This will change when OAuth and PostgreSQL are added.
- **Root `package.json`**: A minimal `package.json` exists at the git root solely for husky's `prepare` script. It is NOT the app's package.json.

## Important Files

- `PRODUCT_ROADMAP.md` — Complete product spec with 6 development phases, data model, API endpoints, success criteria
- `README.md` — Tech stack rationale, architecture diagram, production readiness evaluation
- `AIForAll.pen` — Visual design file (open with Pencil MCP tools)
- `frontend/src/types/index.ts` — All TypeScript type definitions (source of truth for data shapes)
- `frontend/src/lib/db.ts` — Current SQLite schema (reference for PostgreSQL migration design)
- `frontend/src/app/globals.css` — Design tokens and color scale definitions
