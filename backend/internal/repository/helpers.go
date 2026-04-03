package repository

// DB returns the underlying database connection so callers can execute
// raw queries that are not covered by sqlc-generated code (e.g., batch
// reorder operations using array unnesting).
func (q *Queries) DB() DBTX {
	return q.db
}
