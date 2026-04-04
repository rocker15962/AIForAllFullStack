//go:build integration

package integration

import (
	"context"
	"testing"
)

func TestHealthCheck_DBConnected(t *testing.T) {
	ctx := context.Background()
	if err := testPool.Ping(ctx); err != nil {
		t.Fatalf("DB ping failed: %v", err)
	}
}
