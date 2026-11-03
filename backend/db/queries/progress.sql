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

-- BR-17: the in-progress record is created once the video has played 10%.
-- name: StartProgress :exec
INSERT INTO progress (user_id, course_id, status, current_question, answers)
VALUES ($1, $2, 'in_progress', 0, '[]')
ON CONFLICT (user_id, course_id) DO UPDATE SET last_accessed_at = NOW();

-- BR-12 / BR-16: record the result of the latest attempt. Passing (>= 60%) marks the course
-- completed and earns the badge; the badge is never taken back by a later attempt.
-- name: FinishAttempt :one
UPDATE progress
SET status = CASE WHEN sqlc.arg('passed')::boolean THEN 'completed'::progress_status ELSE 'in_progress'::progress_status END,
    score = sqlc.arg('score'),
    completed_at = CASE WHEN sqlc.arg('passed')::boolean THEN NOW() ELSE NULL END,
    badge_earned_at = CASE WHEN sqlc.arg('passed')::boolean THEN COALESCE(badge_earned_at, NOW()) ELSE badge_earned_at END,
    last_accessed_at = NOW()
WHERE user_id = sqlc.arg('user_id') AND course_id = sqlc.arg('course_id')
RETURNING *;

-- BR-16: a retake starts a new round that replaces the previous answers and score.
-- name: RetakeProgress :one
UPDATE progress
SET answers = '[]', current_question = 0, status = 'in_progress', score = NULL,
    completed_at = NULL, last_accessed_at = NOW()
WHERE user_id = $1 AND course_id = $2
RETURNING *;
