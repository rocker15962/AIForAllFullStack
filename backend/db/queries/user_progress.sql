-- name: GetUserInProgress :many
SELECT p.id, p.course_id, p.current_question, p.answers, p.started_at, p.last_accessed_at,
       c.title, c.thumbnail_url, c.difficulty, c.tool_id, c.skill_id,
       (SELECT COUNT(*) FROM questions q WHERE q.course_id = c.id)::int AS total_questions
FROM progress p
JOIN courses c ON c.id = p.course_id
WHERE p.user_id = $1 AND p.status = 'in_progress'
ORDER BY p.last_accessed_at DESC;

-- name: GetUserCompleted :many
SELECT p.id, p.course_id, p.score, p.completed_at,
       c.title, c.thumbnail_url, c.difficulty, c.tool_id, c.skill_id,
       (SELECT COUNT(*) FROM questions q WHERE q.course_id = c.id)::int AS total_questions
FROM progress p
JOIN courses c ON c.id = p.course_id
WHERE p.user_id = $1 AND p.status = 'completed'
ORDER BY p.completed_at DESC;

-- name: GetUserBadges :many
SELECT p.id, p.course_id, p.completed_at,
       c.title, c.thumbnail_url
FROM progress p
JOIN courses c ON c.id = p.course_id
WHERE p.user_id = $1 AND p.status = 'completed'
ORDER BY p.completed_at DESC;

-- name: CountUserProgress :one
SELECT
  COUNT(*) FILTER (WHERE status = 'in_progress')::int AS in_progress_count,
  COUNT(*) FILTER (WHERE status = 'completed')::int AS completed_count
FROM progress
WHERE user_id = $1;

-- name: UpdateUserProfile :one
UPDATE users
SET name = $1, last_active_at = NOW()
WHERE id = $2
RETURNING *;
