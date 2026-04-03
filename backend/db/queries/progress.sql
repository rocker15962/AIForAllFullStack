-- name: GetProgress :one
SELECT * FROM progress WHERE user_id = $1 AND course_id = $2;

-- name: CreateProgress :one
INSERT INTO progress (user_id, course_id, status, current_question, answers)
VALUES ($1, $2, 'in_progress', $3, $4)
RETURNING *;

-- name: UpdateProgressAnswers :one
UPDATE progress
SET answers = $1, current_question = $2, last_accessed_at = NOW()
WHERE user_id = $3 AND course_id = $4
RETURNING *;

-- name: CompleteProgress :one
UPDATE progress
SET status = 'completed', score = $1, completed_at = NOW(), last_accessed_at = NOW()
WHERE user_id = $2 AND course_id = $3
RETURNING *;
