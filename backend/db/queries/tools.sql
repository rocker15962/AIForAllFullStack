-- name: ListTools :many
SELECT * FROM tools ORDER BY "order";

-- name: GetToolByID :one
SELECT * FROM tools WHERE id = $1;
