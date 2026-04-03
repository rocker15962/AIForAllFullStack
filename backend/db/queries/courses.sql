-- name: ListCourses :many
SELECT c.id, c.title, c.description, c.youtube_url, c.youtube_id, c.thumbnail_url,
       c.tool_id, c.skill_id, c.creator_id, c.difficulty, c.duration, c.status,
       c.created_at, c.updated_at,
       COUNT(q.id)::int AS question_count
FROM courses c
LEFT JOIN questions q ON q.course_id = c.id
WHERE c.status = 'published'
  AND (sqlc.narg('search')::text IS NULL OR c.title ILIKE '%' || sqlc.narg('search') || '%' OR c.description ILIKE '%' || sqlc.narg('search') || '%')
  AND (sqlc.narg('tool_id')::uuid IS NULL OR c.tool_id = sqlc.narg('tool_id'))
  AND (sqlc.narg('skill_id')::uuid IS NULL OR c.skill_id = sqlc.narg('skill_id'))
  AND (sqlc.narg('difficulty')::text IS NULL OR c.difficulty::text = sqlc.narg('difficulty'))
GROUP BY c.id
ORDER BY c.created_at DESC
LIMIT sqlc.arg('limit_val') OFFSET sqlc.arg('offset_val');

-- name: CountCourses :one
SELECT COUNT(DISTINCT c.id)
FROM courses c
WHERE c.status = 'published'
  AND (sqlc.narg('search')::text IS NULL OR c.title ILIKE '%' || sqlc.narg('search') || '%' OR c.description ILIKE '%' || sqlc.narg('search') || '%')
  AND (sqlc.narg('tool_id')::uuid IS NULL OR c.tool_id = sqlc.narg('tool_id'))
  AND (sqlc.narg('skill_id')::uuid IS NULL OR c.skill_id = sqlc.narg('skill_id'))
  AND (sqlc.narg('difficulty')::text IS NULL OR c.difficulty::text = sqlc.narg('difficulty'));

-- name: GetCourseByID :one
SELECT * FROM courses WHERE id = $1;

-- name: GetRecommendedCourses :many
SELECT * FROM courses
WHERE status = 'published'
  AND id != $1
  AND (tool_id = $2 OR skill_id = $3)
ORDER BY created_at DESC
LIMIT 4;
