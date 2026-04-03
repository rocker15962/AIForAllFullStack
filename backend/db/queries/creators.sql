-- name: GetCreatorByID :one
SELECT * FROM creators WHERE id = $1;
