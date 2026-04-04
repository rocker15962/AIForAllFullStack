🌐 **English** | [繁體中文](PRODUCT_ROADMAP.zh-TW.md)

# AI for All — Product Roadmap

## 1. Product Vision

### Summary

AI for All is a nonprofit AI education platform that partners with YouTube creators to deliver structured AI learning experiences. Users watch embedded tutorial videos, complete post-lesson quizzes to verify understanding, and track their learning progress with completion badges.

### Problems & Solutions

| Problem | Solution |
|---------|----------|
| AI learning resources are scattered | Curate quality YouTube creator content on a single platform so learners don't have to search everywhere |
| Watching a video doesn't confirm understanding | Post-lesson quizzes (multiple choice + short answer) help learners verify they truly understand and can apply what they learned |
| Learning progress is hard to track | User accounts record completed courses and display completion badges, giving learners a clear view of their journey |
| Don't know where to start | Courses categorized by tool, skill, and difficulty level help learners find the right starting point |

### Key Features

- Embedded YouTube video playback
- Post-lesson quiz system (multiple choice + short answer)
- User registration and login (Google/Facebook OAuth)
- Learning progress tracking and completion badges
- Browse by tool (ChatGPT, Midjourney, Cursor, etc.)
- Browse by skill (copywriting, image generation, coding, etc.)
- Course difficulty levels (beginner, intermediate, advanced)
- Course search and filtering
- Admin dashboard (course, user, and category management)

### Target Users

- **Learners**: People who want to learn AI tools but don't know where to start or how to verify their understanding
- **YouTube Creators**: AI educators who want to reach a wider audience through a structured learning platform
- **Administrators**: Platform managers who curate content, manage users, and monitor platform health

---

## 2. Data Model

### Entities

#### User
Platform learner with an account and learning progress tracking.

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier |
| `name` | string | Display name |
| `email` | string | Email address (from OAuth) |
| `avatarUrl` | string | Profile picture URL |
| `provider` | `'google' \| 'facebook'` | OAuth provider |
| `isAdmin` | boolean | Admin flag |
| `createdAt` | timestamp | Account creation |
| `lastActiveAt` | timestamp | Last activity |

#### Course
A learning unit with a YouTube video link and difficulty level.

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier |
| `title` | string | Course title |
| `description` | string | Course description |
| `youtubeUrl` | string | Full YouTube URL |
| `youtubeId` | string | YouTube video ID (for embedding) |
| `thumbnailUrl` | string | Video thumbnail URL |
| `toolId` | string | Reference to Tool |
| `skillId` | string | Reference to Skill |
| `creatorId` | string | Reference to Creator |
| `difficulty` | `'beginner' \| 'intermediate' \| 'advanced'` | Difficulty level |
| `duration` | number | Video duration in seconds |
| `status` | `'draft' \| 'published'` | Publication status |
| `createdAt` | timestamp | Creation time |
| `updatedAt` | timestamp | Last update |

#### Question
Quiz question for a course — either multiple choice or short answer.

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier |
| `courseId` | string | Reference to Course |
| `type` | `'multiple_choice' \| 'short_answer'` | Question type |
| `question` | string | Question text |
| `options` | `array<{id: string, text: string}>` | Options (for multiple choice) |
| `correctAnswer` | string | Correct answer (option ID or text) |
| `acceptableKeywords` | array | Keywords for short answer validation |
| `explanation` | string | Explanation shown after answering |
| `order` | number | Display order within course |

#### Tool
Tool category (e.g., ChatGPT, Midjourney, Cursor) for course classification.

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier |
| `name` | string | Tool name |
| `icon` | string | Lucide icon name |
| `order` | number | Display order |

#### Skill
Skill category (e.g., copywriting, image generation, coding) for course classification.

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier |
| `name` | string | Skill name |
| `icon` | string | Lucide icon name |
| `order` | number | Display order |

#### Progress
User's course completion record including status and score.

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier |
| `userId` | string | Reference to User |
| `courseId` | string | Reference to Course |
| `status` | `'in_progress' \| 'completed'` | Progress status |
| `currentQuestion` | number | Current question index (if in progress) |
| `score` | number | Final score (if completed) |
| `answers` | `array<{questionId: string, answer: string, isCorrect: boolean}>` | User's answers |
| `startedAt` | timestamp | Start time |
| `completedAt` | timestamp | Completion time |
| `lastAccessedAt` | timestamp | Last access |

#### Creator
YouTube creator partner who provides tutorial content.

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier |
| `name` | string | Creator name |
| `avatarUrl` | string | Profile picture URL |
| `channelUrl` | string | YouTube channel URL |

### Relationships

```
User ─────────< Progress >───────── Course
                                      │
                                      ├──< Question
                                      │
                                      ├──> Tool
                                      │
                                      ├──> Skill
                                      │
                                      └──> Creator
```

- **Course has many Question** — Each course has multiple quiz questions
- **Course belongs to one Tool** — Categorized under one tool
- **Course belongs to one Skill** — Categorized under one skill
- **Course belongs to one Creator** — Created by one YouTube creator
- **User has many Progress** — Each user can have progress on multiple courses
- **Progress belongs to User and Course** — Links a user to a course

### Implementation Notes

1. **Authentication**: Users authenticate via Google or Facebook OAuth. Store provider info for profile display.
2. **Progress Tracking**: Create a Progress record with `status: 'in_progress'` when a user starts a course. Update `currentQuestion` as they progress. Set `status: 'completed'` and calculate `score` when all questions are answered.
3. **Badges**: Implicitly created when a Progress record is completed. Query completed Progress records to display badges.
4. **Course Filtering**: Use `toolId`, `skillId`, and `difficulty` for filtering in Course Discovery.
5. **Admin Access**: Use the `isAdmin` flag on User to gate admin functionality.
6. **Score Calculation**: Score = (correct answers / total questions). Multiple choice: exact match. Short answer: at least one `acceptableKeyword` found in the answer (case-insensitive).
7. **Recommended Courses**: Based on matching `toolId` or `skillId` with the completed course, excluding courses the user has already completed. No separate data model needed — computed at query time.
8. **Course Duration**: Entered manually by admin during course creation. Future enhancement: auto-extract from YouTube API.

---

## 3. Design System

### Colors

| Role | Color | Usage |
|------|-------|-------|
| **Primary** | `cyan` | Buttons, links, key accents, active states |
| **Secondary** | `amber` | Tags, highlights, badges, completion indicators |
| **Neutral** | `zinc` | Backgrounds, text, borders, cards |

**Semantic colors**:
- Success: `emerald` — correct answers
- Error: `red` — incorrect answers
- Info: `cyan` — hints and tips
- Warning: `amber` — warning messages

**Dark mode**: All components support light/dark mode via Tailwind `dark:` classes.

### Typography

| Role | Font | Weights |
|------|------|---------|
| **Heading** | DM Sans | 600 (semibold), 700 (bold) |
| **Body** | DM Sans | 400 (normal), 500 (medium) |
| **Code** | JetBrains Mono | 400 (normal), 500 (medium) |

**Tailwind configuration**:
```css
@theme {
  --font-sans: 'DM Sans', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}
```

### Typography Scale

| Element | Classes |
|---------|---------|
| Page title | `text-3xl font-bold` |
| Section heading | `text-xl font-semibold` |
| Card title | `text-lg font-semibold` |
| Body text | `text-base` |
| Small/caption | `text-sm text-zinc-500` |

---

## 4. Development Phases Overview

| Phase | Name | Goal | Status |
|-------|------|------|--------|
| 1 | Foundation | Set up Go skeleton, Docker Compose, PostgreSQL, design tokens, routing, App Shell | ✅ Complete |
| 2 | Authentication | OAuth2 + JWT auth system with role-based access | ✅ Complete |
| 3 | Course Discovery & Learning | Browse, search, filter courses + video playback + quiz system | ✅ Complete |
| 4 | User & Progress | Learning dashboard, progress tracking, profile, badges | ✅ Complete |
| 5 | Admin Dashboard | Analytics, course/user/category management | ✅ Complete |
| 6 | Quality Assurance | Testing, CI/CD, API docs, linting | ✅ Complete |

---

## 5. Phase Details

### Phase 1: Foundation

**Goal**: Set up the project infrastructure — Go backend skeleton, Docker Compose with PostgreSQL and Redis, design system tokens, TypeScript types, routing, and the application shell.

**Status**: ✅ Complete

#### Feature Checklist

**Backend Infrastructure**:
- [x] Go project scaffold (`cmd/server/`, `internal/handler|service|repository/`)
- [x] Docker Compose with PostgreSQL, Redis, Go server, Next.js frontend
- [x] PostgreSQL migrations setup (golang-migrate)
- [x] sqlc configuration and initial queries
- [x] Health check endpoint (`GET /api/v1/health`)
- [x] Makefile with common commands (`make dev`, `make migrate`, `make sqlc`)

**Frontend Foundation**:
- [x] Design tokens (colors, fonts, spacing) in Tailwind config
- [x] TypeScript type definitions for all entities (User, Course, Question, Tool, Skill, Progress, Creator)
- [x] Route structure (9 routes — see below)
- [x] App Shell (AppShell + TopNav + UserMenu)
- [x] Responsive navigation (desktop: horizontal nav, mobile: hamburger menu)

#### Routes

| Route | Page | Notes |
|-------|------|-------|
| `/` | Home | Landing page |
| `/courses` | Course Discovery | Browse and filter courses |
| `/courses/:id` | Course Learning | Watch video + quiz |
| `/my-learning` | My Learning | User dashboard |
| `/profile` | Profile | Edit profile |
| `/admin` | Admin Dashboard | Analytics overview |
| `/admin/courses` | Course Management | CRUD courses |
| `/admin/users` | User Management | View users |
| `/admin/categories` | Category Management | Manage tools/skills |

#### Navigation Structure

| Item | Route | Notes |
|------|-------|-------|
| Logo (AI for All) | `/` | Home page |
| 探索課程 | `/courses` | Course Discovery |
| 我的學習 | `/my-learning` | User dashboard |
| 個人資料 | `/profile` | In user menu |
| 後台管理 | `/admin` | In user menu, admin only |
| 登出 | — | Logout action |

#### Success Criteria

- `docker compose up` starts all 4 services (frontend, backend, PostgreSQL, Redis) without errors
- Health check endpoint returns 200
- All 9 routes render placeholder pages
- App Shell displays correctly on desktop and mobile
- Design tokens (colors, fonts) are applied consistently

---

### Phase 2: Authentication

**Goal**: Implement the complete authentication system — OAuth2 login (Google), JWT token management, auth middleware, admin middleware, and rate limiting.

**Status**: ✅ Complete

#### Feature Checklist

- [x] OAuth2 login flow (Google)
- [x] JWT token generation and verification
- [x] Auth middleware (protect authenticated routes)
- [x] Admin middleware (protect admin routes)
- [x] Rate limiting middleware (Redis-based)
- [x] CORS configuration
- [x] Login button in TopNav (shows when not authenticated)
- [x] User dropdown menu (shows when authenticated: avatar, name, links, logout)
- [x] Session persistence (JWT in cookie/localStorage)

#### API Requirements

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/v1/auth/google` | Google OAuth callback |
| `POST` | `/api/v1/auth/refresh` | Refresh JWT token |
| `POST` | `/api/v1/auth/logout` | Logout (invalidate token) |
| `GET` | `/api/v1/auth/me` | Get current user info |

#### Success Criteria

- User can log in via Google OAuth and receive a JWT
- Authenticated routes reject unauthenticated requests with 401
- Admin routes reject non-admin users with 403
- Rate limiting blocks excessive requests (429)
- Login state persists across page refreshes

#### Test Highlights

- OAuth flow completes successfully
- JWT expiration and refresh work correctly
- Unauthorized access to protected routes is blocked
- Admin-only routes reject regular users
- Rate limiting triggers after threshold

---

### Phase 3: Course Discovery & Learning

**Goal**: Implement the core learning experience — users browse and filter courses, watch embedded YouTube videos, and complete step-by-step quizzes with feedback.

**Status**: ✅ Complete

#### Feature Checklist

**Course Discovery**:
- [x] Course card grid/list view
- [x] Search by keyword (title/description)
- [x] Filter by tool (ChatGPT, Midjourney, etc.)
- [x] Filter by skill (copywriting, image generation, etc.)
- [x] Filter by difficulty (beginner, intermediate, advanced)
- [x] Combined filters (tool + skill + difficulty)
- [x] Filter sidebar (collapsible on mobile as drawer)
- [x] Active filter count badge on mobile
- [x] Results count display
- [x] Empty state when no courses match
- [x] Clear all filters action
- [x] Click course card to navigate to learning page

**Course Learning**:
- [x] Embedded YouTube video player (16:9 responsive)
- [x] Step-by-step quiz (one question at a time)
- [x] Quiz progress bar ("Question X of Y")
- [x] Multiple choice question UI (select → submit → feedback)
- [x] Short answer question UI (type → submit → keyword validation)
- [x] Answer feedback (correct: green + explanation, incorrect: red + correct answer + explanation)
- [x] Completion view (score summary, trophy icon, congratulations message)
- [x] Score-based feedback (100%: gold, 60%+: cyan, <60%: gray)
- [x] Recommended next courses
- [x] Back to course list navigation

#### User Flows

**Discovery**:
1. Browse all courses in card grid
2. Search by keyword → grid filters in real-time
3. Filter by tool/skill/difficulty → grid updates
4. Combine multiple filters → shows intersection
5. Clear filters → shows all courses
6. Click course card → navigates to `/courses/:id`

**Learning**:
1. Watch embedded YouTube video
2. Answer questions one at a time (MC: select option → submit; SA: type answer → submit)
3. View feedback after each answer (correct/incorrect + explanation)
4. Click "Next question" to proceed
5. After last question, view completion summary with score
6. View recommended courses or return to course list

#### API Requirements

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/courses` | List courses (supports search, filter, pagination) |
| `GET` | `/api/v1/courses/:id` | Get course detail with questions |
| `GET` | `/api/v1/tools` | List all tools |
| `GET` | `/api/v1/skills` | List all skills |
| `POST` | `/api/v1/courses/:id/submit` | Submit quiz answer |
| `POST` | `/api/v1/courses/:id/complete` | Mark course as completed |
| `GET` | `/api/v1/courses/:id/recommended` | Get recommended courses |

#### Success Criteria

- Users can find courses within 3 clicks using filters
- Filter results respond in < 200ms
- Mobile filter drawer opens/closes smoothly
- YouTube video embeds and plays correctly
- Quiz progress is preserved during the session
- Correct/incorrect feedback displays immediately after submission
- Completion view shows accurate score

#### Test Highlights

**Discovery**:
- Browse shows all courses, search narrows results, empty state appears for no matches
- Each filter type works independently and in combination
- Clearing filters restores full course list
- Mobile: filter sidebar becomes a drawer with count badge

**Learning**:
- MC question: select → submit → shows green/red feedback with explanation
- SA question: type → submit → keyword matching validates answer
- Progress bar updates after each question
- Last question shows "View results" instead of "Next question"
- Completion view shows correct score, trophy, and dynamic message
- Recommended courses display (or section hidden if none)
- Edge cases: 1 question, 20+ questions, no questions, long text

---

### Phase 4: User & Progress

**Goal**: Implement the learning dashboard where users track their progress, view completed courses and badges, and manage their profile.

**Status**: ✅ Complete

#### Feature Checklist

- [x] My Learning dashboard with 3 tabs (In Progress / Completed / Badges)
- [x] In-progress course cards (thumbnail, title, progress %, current question, "Continue" button)
- [x] Completed course cards (thumbnail, title, score, completion date)
- [x] Badge cards (course thumbnail, title, earned date)
- [x] Tab switching with active highlight
- [x] Profile page (view/edit name and avatar)
- [x] Profile form validation (name required)
- [x] Empty states for each tab
- [x] Grid layout for badges

#### User Flows

1. Navigate to "My Learning" → see in-progress courses (default tab)
2. Click "Continue" on an in-progress course → navigate to course learning page
3. Switch to "Completed" tab → see completed courses with scores
4. Switch to "Badges" tab → see earned badges
5. Navigate to "Profile" → edit name/avatar → save
6. Logout from user dropdown menu

#### API Requirements

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/my/progress` | Get user's in-progress courses |
| `GET` | `/api/v1/my/completed` | Get user's completed courses |
| `GET` | `/api/v1/my/badges` | Get user's earned badges |
| `GET` | `/api/v1/my/profile` | Get user profile |
| `PUT` | `/api/v1/my/profile` | Update user profile |

#### Success Criteria

- Dashboard loads quickly with all 3 tabs functional
- Progress percentages and scores are accurate
- Profile changes persist after save
- Empty states display helpful messages (not blank screens)

#### Test Highlights

- Tab switching shows correct content for each tab
- In-progress cards show progress bar and "Continue" button
- Completed cards show score with visual indicator
- Badges display in grid layout with earned dates
- Profile: pre-filled with current data, validates empty name, saves changes
- Empty states: "Start your first course!", "Complete a course to see it here", "Earn badges by completing courses"
- Edge cases: 1 item per tab, 50+ items, missing avatar uses fallback

---

### Phase 5: Admin Dashboard

**Goal**: Build the admin panel with analytics overview, course management (CRUD with quiz editor), user management, and category management.

**Status**: ✅ Complete

#### Feature Checklist

**Analytics Dashboard** (`/admin`):
- [x] 4 stat cards (total users, total courses, total completions, active users)
- [x] Trend indicator on each stat (up/down arrow with percentage)
- [x] Trend chart (line chart: new users vs. active users over time)
- [x] Popular courses ranking list

**Course Management** (`/admin/courses`):
- [x] Course table (title, status, difficulty, tool, skill)
- [x] Search courses by title
- [x] Filter by status (draft/published)
- [x] "Create course" button
- [x] Course editor drawer (slides from right)
- [x] Course form (title, description, YouTube URL, tool, skill, difficulty)
- [x] Quiz question editor (add/edit/delete/reorder questions)
- [x] MC question editor (question text, 4 options, mark correct, explanation)
- [x] SA question editor (question text, sample answer, keywords, explanation)
- [x] Toggle course publish/unpublish
- [x] Delete course with confirmation dialog

**User Management** (`/admin/users`):
- [x] User table (name, email, provider, registered, last active)
- [x] Search users by name/email
- [x] Expandable row to view user's course progress
- [x] Progress details (in-progress and completed courses with scores)

**Category Management** (`/admin/categories`):
- [x] Tool category list with drag-and-drop reordering
- [x] Skill category list with drag-and-drop reordering
- [x] Add/edit/delete tools
- [x] Add/edit/delete skills
- [x] Category count display

#### User Flows

1. View dashboard → see stats, trends, popular courses at a glance
2. Manage courses → search/filter → click to edit in drawer → save
3. Create course → fill form + add questions → save as draft → publish when ready
4. Manage users → search → expand row to see learning progress
5. Manage categories → add/edit/delete/reorder tools and skills

#### API Requirements

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/v1/admin/dashboard` | Dashboard stats and trends |
| `GET` | `/api/v1/admin/courses` | List all courses (with search/filter) |
| `POST` | `/api/v1/admin/courses` | Create course |
| `PUT` | `/api/v1/admin/courses/:id` | Update course |
| `DELETE` | `/api/v1/admin/courses/:id` | Delete course |
| `PUT` | `/api/v1/admin/courses/:id/publish` | Toggle publish status |
| `GET` | `/api/v1/admin/users` | List all users |
| `GET` | `/api/v1/admin/users/:id/progress` | Get user's progress |
| `GET` | `/api/v1/admin/categories` | List tools and skills |
| `POST` | `/api/v1/admin/tools` | Create tool |
| `PUT` | `/api/v1/admin/tools/:id` | Update tool |
| `DELETE` | `/api/v1/admin/tools/:id` | Delete tool |
| `PUT` | `/api/v1/admin/tools/reorder` | Reorder tools |
| `POST` | `/api/v1/admin/skills` | Create skill |
| `PUT` | `/api/v1/admin/skills/:id` | Update skill |
| `DELETE` | `/api/v1/admin/skills/:id` | Delete skill |
| `PUT` | `/api/v1/admin/skills/reorder` | Reorder skills |

#### Success Criteria

- All admin routes require admin authorization (non-admin gets 403)
- Dashboard stats load and display correctly
- Course CRUD works end-to-end (create → edit → publish → delete)
- Question editor supports both MC and SA question types
- User progress is viewable in expandable rows
- Category drag-and-drop persists new order

#### Test Highlights

- Authorization: non-admin users are redirected from all `/admin/*` routes
- Dashboard: 4 stat cards render, trend chart renders, popular courses show
- Course management: search filters table, create/edit in drawer, toggle publish, delete with confirmation
- Question editor: add MC question with 4 options + correct answer, add SA question with keywords
- User management: search users, expand row to see progress details
- Category management: add/edit/delete tools and skills, drag to reorder
- Empty states: "Create your first course", "No users yet", empty category lists

---

### Phase 6: Quality Assurance

**Goal**: Ensure production readiness through comprehensive testing, CI/CD pipeline, API documentation, and code quality tooling.

**Status**: ✅ Complete

#### Feature Checklist

**Testing**:
- [x] Go unit tests (service layer with mock repositories)
- [x] Go integration tests (testcontainers-go with real PostgreSQL)
- [x] Frontend unit tests (Vitest + React Testing Library)
- [x] E2E tests (Playwright)
- [x] Test coverage targets (Go: 80%+, Frontend: 70%+)

**CI/CD**:
- [x] GitHub Actions workflow: lint → test → build
- [x] Parallel test execution (Go tests + Frontend tests)
- [x] Docker image build and push
- [x] Branch protection rules

**Documentation**:
- [x] Swagger/OpenAPI spec for all API endpoints
- [x] README polish (setup guide, contributing guide)
- [x] Environment variables documentation

**Code Quality**:
- [x] Go: golangci-lint, gofmt
- [x] Frontend: ESLint, Prettier
- [x] Pre-commit hooks (lint-staged + husky)
- [x] Structured logging with request IDs

#### Success Criteria

- All tests pass in CI
- Test coverage meets targets
- `docker compose up` works from a fresh clone
- API documentation is browsable via Swagger UI
- No linting errors in CI

#### Test Highlights

- Unit tests cover all service-layer business logic
- Integration tests verify database operations with real PostgreSQL
- E2E tests cover critical user flows (browse → learn → complete → view progress)
- CI pipeline catches regressions before merge

---

## 6. Technical Architecture

### Stack Summary

**Frontend**: Next.js 16 (App Router) + React 19 + TypeScript
- UI: shadcn/ui + Tailwind CSS
- Data fetching: TanStack Query
- State: Zustand
- Forms: React Hook Form + Zod
- Charts: Recharts
- Icons: Lucide React

**Backend**: Go (Gin web framework)
- Data access: sqlc (SQL-first, type-safe generated code)
- Auth: OAuth2 + JWT
- Database: PostgreSQL
- Cache: Redis

**Infrastructure**: Docker Compose + GitHub Actions CI/CD

### Architecture Diagram

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

### Backend: 3-Layer Clean Architecture

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
│  • No HTTP knowledge │  • Depends on repository interfaces
└──────────┬──────────┘
           │ calls repository interface
           ▼
┌─────────────────────┐
│  Repository          │  Data access (sqlc-generated)
│  • No business logic │  • Implements service-defined interfaces
└─────────────────────┘
```

### Project Structure

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
└── docs/                        # Technical documentation
```

### Related Design Decisions

Detailed technical selection rationales are documented in:
- `docs/superpowers/specs/2026-04-01-backend-language-selection-design.md` — Go vs Node.js vs Python
- `docs/superpowers/specs/2026-04-01-frontend-tech-selection-design.md` — Next.js vs Nuxt vs SvelteKit
- `docs/superpowers/specs/2026-04-01-production-ready-design.md` — 14 production readiness areas
- `docs/superpowers/specs/2026-04-02-development-workflow-design.md` — Development workflow design
