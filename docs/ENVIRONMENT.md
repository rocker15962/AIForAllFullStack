# Environment Variables

All environment variables used by the application, organized by service. Copy `.env.example` to `.env` and fill in the values before running.

## PostgreSQL

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `POSTGRES_DB` | Database name | `aiforall` | Yes |
| `POSTGRES_USER` | Database user | `aiforall_user` | Yes |
| `POSTGRES_PASSWORD` | Database password | `change_me_in_production` | Yes |

These variables are used by the `postgres` service in `docker-compose.yml` to initialize the database on first run.

## Backend (Go API Server)

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `DATABASE_URL` | PostgreSQL connection string | `postgres://aiforall_user:change_me_in_production@postgres:5432/aiforall?sslmode=disable` | Yes |
| `REDIS_URL` | Redis connection string | `redis://redis:6379/0` | Yes |
| `GIN_MODE` | Gin framework mode (`debug` or `release`) | `release` | Optional |
| `PORT` | HTTP server port | `8080` | Optional |
| `JWT_SECRET` | Secret key for signing JWT tokens. Use a random 32+ character string. | `your-secret-key-min-32-chars` | Yes |
| `GOOGLE_CLIENT_ID` | Google OAuth 2.0 client ID from [Google Cloud Console](https://console.cloud.google.com/apis/credentials) | `123456789.apps.googleusercontent.com` | Optional |
| `GOOGLE_CLIENT_SECRET` | Google OAuth 2.0 client secret | `GOCSPX-...` | Optional |
| `GOOGLE_REDIRECT_URL` | OAuth callback URL registered in Google Cloud Console | `http://localhost:8080/api/v1/auth/google/callback` | Optional |
| `FRONTEND_URL` | Frontend origin for CORS configuration | `http://localhost:3000` | Yes |

**Notes:**

- `GIN_MODE` defaults to `debug` if not set. Use `release` in production to disable debug logging.
- `PORT` defaults to `8080` if not set.
- Google OAuth variables are only required if you want to enable Google login. The application falls back to email/password authentication without them.

## Frontend (Next.js)

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL. The `NEXT_PUBLIC_` prefix makes it available in the browser. | `http://localhost:8080/api/v1` | Yes |

**Notes:**

- In Docker Compose, this is set to the internal service name (`http://backend:8080/api/v1`) for server-side requests. Client-side requests use the browser-accessible URL.

## Example `.env` File

```env
# PostgreSQL
POSTGRES_DB=aiforall
POSTGRES_USER=aiforall_user
POSTGRES_PASSWORD=change_me_in_production

# Backend
DATABASE_URL=postgres://aiforall_user:change_me_in_production@postgres:5432/aiforall?sslmode=disable
REDIS_URL=redis://redis:6379/0
GIN_MODE=debug
PORT=8080
JWT_SECRET=replace-with-a-secure-random-string-at-least-32-chars
FRONTEND_URL=http://localhost:3000

# Google OAuth (optional — omit to disable Google login)
# GOOGLE_CLIENT_ID=
# GOOGLE_CLIENT_SECRET=
# GOOGLE_REDIRECT_URL=http://localhost:8080/api/v1/auth/google/callback

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
```
