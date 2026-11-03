-- name: FindUserByEmail :one
SELECT * FROM users WHERE email = $1;

-- name: CreateUser :one
INSERT INTO users (name, email, avatar_url, provider)
VALUES ($1, $2, $3, $4)
RETURNING *;

-- name: UpdateUser :one
UPDATE users
SET name = $1, avatar_url = $2, last_active_at = NOW()
WHERE id = $3
RETURNING *;

-- name: GetUserByID :one
SELECT * FROM users WHERE id = $1;

-- BR-39: mark the user active today (login and session refresh).
-- name: RecordUserActivity :exec
WITH touched AS (
    UPDATE users SET last_active_at = NOW() WHERE id = $1 RETURNING id
)
INSERT INTO user_activity_days (user_id, day)
SELECT id, CURRENT_DATE FROM touched
ON CONFLICT DO NOTHING;
