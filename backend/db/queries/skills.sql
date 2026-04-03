-- name: ListSkills :many
SELECT * FROM skills ORDER BY "order";

-- name: GetSkillByID :one
SELECT * FROM skills WHERE id = $1;
