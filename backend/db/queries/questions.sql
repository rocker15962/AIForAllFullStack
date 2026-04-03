-- name: GetQuestionsByCourse :many
SELECT * FROM questions WHERE course_id = $1 ORDER BY "order";

-- name: GetQuestionByID :one
SELECT * FROM questions WHERE id = $1;
