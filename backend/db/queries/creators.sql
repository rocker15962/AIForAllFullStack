-- name: GetCreatorByID :one
SELECT * FROM creators WHERE id = $1;

-- name: ListCreators :many
SELECT * FROM creators ORDER BY name;
