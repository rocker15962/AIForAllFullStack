# Environment Variables

All environment variables are defined in `.env.example` at the project root. Copy it to `.env` before running:

```bash
cp .env.example .env
```

## PostgreSQL

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `POSTGRES_DB` | Yes | `aiforall` | Database name |
| `POSTGRES_USER` | Yes | `aiforall` | Database user |
| `POSTGRES_PASSWORD` | Yes | `aiforall` | Database password |

## Backend

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | — | PostgreSQL connection string (e.g., `postgres://aiforall:aiforall@postgres:5432/aiforall?sslmode=disable`) |
| `REDIS_URL` | Yes | — | Redis connection string (e.g., `redis://redis:6379`) |
| `GIN_MODE` | No | `debug` | Gin framework mode (`debug` or `release`) |
| `PORT` | No | `8080` | Backend server port |

## Authentication (Google OAuth)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GOOGLE_CLIENT_ID` | Yes | — | Google OAuth 2.0 client ID (from Google Cloud Console) |
| `GOOGLE_CLIENT_SECRET` | Yes | — | Google OAuth 2.0 client secret |
| `GOOGLE_REDIRECT_URL` | Yes | `http://localhost:8080/api/v1/auth/google/callback` | OAuth callback URL |
| `JWT_SECRET` | Yes | — | Secret key for signing JWT tokens (minimum 32 characters) |
| `FRONTEND_URL` | Yes | `http://localhost:3000` | Frontend URL for CORS and OAuth redirect |

## AI Grading (short answers)

Short-answer questions are graded by Claude against the question's sample answer (business rule BR-09).

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `ANTHROPIC_API_KEY` | For short answers | — | Anthropic API key. Without it, short-answer submissions return HTTP 503 ("please try again later") and are not scored; multiple-choice questions are unaffected. |
| `CLAUDE_GRADER_MODEL` | No | `claude-opus-5-5` | Model used for grading. Each short-answer submission makes one API call (low effort, 20-second timeout, one retry). |

## Frontend

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | Yes | `http://localhost:8080` | Backend API base URL (exposed to browser) |

## Docker Compose Defaults

When running via `docker compose up`, the following defaults are pre-configured in `docker-compose.yml`:

- PostgreSQL: `aiforall:aiforall@postgres:5432/aiforall`
- Redis: `redis://redis:6379`
- Frontend: port 3000
- Backend: port 8080

You only need to configure **Google OAuth credentials** and **JWT_SECRET** in `.env` for local development.
