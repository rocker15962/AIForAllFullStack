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
