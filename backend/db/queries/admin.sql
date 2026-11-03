-- Dashboard stats
-- name: GetDashboardStats :one
SELECT
  (SELECT COUNT(*) FROM users)::int AS total_users,
  (SELECT COUNT(*) FROM courses WHERE status = 'published')::int AS total_courses,
  (SELECT COUNT(*) FROM progress WHERE status = 'completed')::int AS total_completions,
  (SELECT COUNT(*) FROM users WHERE last_active_at > NOW() - INTERVAL '7 days')::int AS active_users;

-- name: GetUserTrend :many
SELECT date::date,
  (SELECT COUNT(*) FROM users WHERE created_at::date <= date)::int AS total_users,
  (SELECT COUNT(*) FROM users WHERE created_at::date = date)::int AS new_users,
  -- BR-39: distinct users active on that day
  (SELECT COUNT(*) FROM user_activity_days a WHERE a.day = date)::int AS active_users
FROM generate_series(CURRENT_DATE - 29, CURRENT_DATE, '1 day') AS date
ORDER BY date;

-- name: GetPopularCourses :many
SELECT c.id, c.title, COUNT(p.id)::int AS completions
FROM courses c
LEFT JOIN progress p ON p.course_id = c.id AND p.status = 'completed'
WHERE c.status = 'published'
GROUP BY c.id
ORDER BY completions DESC
LIMIT 5;

-- Admin course list (all courses, not just published)
-- name: AdminListCourses :many
SELECT c.*, COUNT(q.id)::int AS question_count
FROM courses c
LEFT JOIN questions q ON q.course_id = c.id
WHERE (sqlc.narg('search')::text IS NULL OR c.title ILIKE '%' || sqlc.narg('search') || '%')
  -- archived courses only show up when explicitly filtered (BR-31)
  AND ((sqlc.narg('status_filter')::text IS NULL AND c.status != 'archived')
       OR c.status::text = sqlc.narg('status_filter'))
GROUP BY c.id
ORDER BY c.created_at DESC;

-- name: AdminCreateCourse :one
INSERT INTO courses (title, description, youtube_url, youtube_id, thumbnail_url, tool_id, skill_id, creator_id, difficulty, duration, status)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
RETURNING *;

-- name: AdminUpdateCourse :one
UPDATE courses
SET title = $1, description = $2, youtube_url = $3, youtube_id = $4, thumbnail_url = $5, tool_id = $6, skill_id = $7, creator_id = $8, difficulty = $9, duration = $10, updated_at = NOW()
WHERE id = $11
RETURNING *;

-- BR-31: "delete" archives the course; progress and badges are kept.
-- name: AdminArchiveCourse :one
UPDATE courses SET status = 'archived'::course_status, preview_token = NULL, updated_at = NOW()
WHERE id = $1
RETURNING *;

-- name: AdminRestoreCourse :one
UPDATE courses SET status = 'draft'::course_status, updated_at = NOW()
WHERE id = $1 AND status = 'archived'
RETURNING *;

-- BR-05: reuse the existing preview token, or store the new one. Only unpublished courses.
-- name: AdminEnsurePreviewToken :one
UPDATE courses SET preview_token = COALESCE(preview_token, sqlc.arg('token')::text)
WHERE id = sqlc.arg('id') AND status = 'draft'
RETURNING preview_token;

-- name: AdminGetCourseStatus :one
SELECT status FROM courses WHERE id = $1;

-- Publishing invalidates the preview link (BR-05).
-- name: AdminPublishCourse :one
UPDATE courses SET status = 'published'::course_status, preview_token = NULL, updated_at = NOW()
WHERE id = $1
RETURNING *;

-- name: AdminUnpublishCourse :one
UPDATE courses SET status = 'draft'::course_status, updated_at = NOW()
WHERE id = $1
RETURNING *;

-- Admin user list
-- name: AdminListUsers :many
SELECT id, name, email, avatar_url, provider, is_admin, created_at, last_active_at,
       (SELECT COUNT(*) FROM progress p WHERE p.user_id = users.id AND p.status = 'completed')::int AS completed_count
FROM users
WHERE (sqlc.narg('search')::text IS NULL OR name ILIKE '%' || sqlc.narg('search') || '%' OR email ILIKE '%' || sqlc.narg('search') || '%')
ORDER BY created_at DESC;

-- name: AdminGetUserProgress :many
SELECT p.course_id, p.status, p.score, p.completed_at, p.current_question, p.last_accessed_at,
       p.latest_round_passed,
       c.title AS course_title, c.status AS course_status,
       (SELECT COUNT(*) FROM questions q WHERE q.course_id = c.id)::int AS total_questions,
       (SELECT COUNT(DISTINCT a->>'questionId') FROM jsonb_array_elements(p.answers) a
        WHERE a->>'questionId' IN (SELECT q.id::text FROM questions q WHERE q.course_id = c.id))::int AS answered_count
FROM progress p
JOIN courses c ON c.id = p.course_id
WHERE p.user_id = $1
ORDER BY p.last_accessed_at DESC;

-- Category management
-- name: AdminCreateTool :one
INSERT INTO tools (name, icon, "order") VALUES ($1, $2, $3) RETURNING *;

-- name: AdminUpdateTool :one
UPDATE tools SET name = $1, icon = $2 WHERE id = $3 RETURNING *;

-- BR-33: archive instead of delete; courses keep the category.
-- name: AdminArchiveTool :exec
UPDATE tools SET archived_at = NOW() WHERE id = $1 AND archived_at IS NULL;

-- name: AdminListActiveTools :many
SELECT * FROM tools WHERE archived_at IS NULL ORDER BY "order";

-- name: AdminCreateSkill :one
INSERT INTO skills (name, icon, "order") VALUES ($1, $2, $3) RETURNING *;

-- name: AdminUpdateSkill :one
UPDATE skills SET name = $1, icon = $2 WHERE id = $3 RETURNING *;

-- name: AdminArchiveSkill :exec
UPDATE skills SET archived_at = NOW() WHERE id = $1 AND archived_at IS NULL;

-- name: AdminListActiveSkills :many
SELECT * FROM skills WHERE archived_at IS NULL ORDER BY "order";
