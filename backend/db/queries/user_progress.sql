-- name: GetUserInProgress :many
SELECT p.id, p.course_id, p.current_question, p.answers, p.started_at, p.last_accessed_at,
       c.title, c.thumbnail_url, c.difficulty, c.tool_id, c.skill_id, c.status AS course_status,
       (SELECT COUNT(*) FROM questions q WHERE q.course_id = c.id)::int AS total_questions
FROM progress p
JOIN courses c ON c.id = p.course_id
WHERE p.user_id = $1 AND p.status = 'in_progress'
ORDER BY p.last_accessed_at DESC;

-- name: GetUserCompleted :many
SELECT p.id, p.course_id, p.score, p.completed_at,
       c.title, c.thumbnail_url, c.difficulty, c.tool_id, c.skill_id, c.status AS course_status,
       (SELECT COUNT(*) FROM questions q WHERE q.course_id = c.id)::int AS total_questions
FROM progress p
JOIN courses c ON c.id = p.course_id
WHERE p.user_id = $1 AND p.status = 'completed'
ORDER BY p.completed_at DESC;

-- name: GetUserBadges :many
-- BR-12 / BR-16: badges are kept even when a later attempt drops below the pass line.
SELECT p.id, p.course_id, p.badge_earned_at,
       c.title, c.thumbnail_url, c.status AS course_status
FROM progress p
JOIN courses c ON c.id = p.course_id
WHERE p.user_id = $1 AND p.badge_earned_at IS NOT NULL
ORDER BY p.badge_earned_at DESC;

-- name: CountUserProgress :one
SELECT
  COUNT(*) FILTER (WHERE status = 'in_progress')::int AS in_progress_count,
  COUNT(*) FILTER (WHERE status = 'completed')::int AS completed_count,
  COUNT(*) FILTER (WHERE badge_earned_at IS NOT NULL)::int AS badge_count
FROM progress
WHERE user_id = $1;

-- name: UpdateUserProfile :one
UPDATE users
SET name = $1, last_active_at = NOW()
WHERE id = $2
RETURNING *;

-- name: UpdateUserAvatar :one
UPDATE users
SET avatar_url = $1, last_active_at = NOW()
WHERE id = $2
RETURNING *;
