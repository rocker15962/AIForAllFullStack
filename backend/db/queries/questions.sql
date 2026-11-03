-- name: GetQuestionsByCourse :many
SELECT * FROM questions WHERE course_id = $1 ORDER BY "order";

-- name: GetQuestionByID :one
SELECT * FROM questions WHERE id = $1;

-- Admin: questions are saved together with their course (BR-29)
-- name: AdminInsertQuestion :one
INSERT INTO questions (course_id, type, question, options, correct_answer, sample_answer, explanation, "order")
VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
RETURNING *;

-- name: AdminUpdateQuestion :one
UPDATE questions
SET type = $1, question = $2, options = $3, correct_answer = $4, sample_answer = $5,
    explanation = $6, "order" = $7
WHERE id = $8 AND course_id = $9
RETURNING *;

-- name: AdminDeleteQuestionsNotIn :exec
DELETE FROM questions
WHERE course_id = sqlc.arg('course_id') AND NOT (id = ANY(sqlc.arg('keep_ids')::uuid[]));
