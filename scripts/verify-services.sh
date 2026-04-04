#!/bin/bash
# Verify all 6 services are running and can interact with each other
# Usage: bash scripts/verify-services.sh

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

pass=0
fail=0

check() {
  local name="$1"
  local cmd="$2"
  local expected="$3"

  result=$(eval "$cmd" 2>&1) || true
  if echo "$result" | grep -q "$expected"; then
    echo -e "  ${GREEN}✓${NC} $name"
    pass=$((pass + 1))
  else
    echo -e "  ${RED}✗${NC} $name"
    echo -e "    Expected: $expected"
    echo -e "    Got: $(echo "$result" | head -1)"
    fail=$((fail + 1))
  fi
}

echo ""
echo "=== Service Health Checks ==="
echo ""

echo "1. Backend (Go API - :8080)"
check "Health endpoint" \
  "curl -s http://localhost:8080/api/v1/health" \
  '"status"'

echo ""
echo "2. Frontend (Next.js - :3000)"
check "Homepage loads" \
  "curl -s -o /dev/null -w '%{http_code}' http://localhost:3000" \
  "200"

echo ""
echo "3. PostgreSQL (:5432)"
check "Backend connects to DB (via health)" \
  "curl -s http://localhost:8080/api/v1/health" \
  '"database":"connected"'

echo ""
echo "4. Redis (:6379)"
check "Backend connects to Redis (via health)" \
  "curl -s http://localhost:8080/api/v1/health" \
  '"redis":"connected"'

echo ""
echo "5. Prometheus (:9090)"
check "Prometheus UI" \
  "curl -s -o /dev/null -w '%{http_code}' http://localhost:9090/-/ready" \
  "200"
check "Prometheus scrapes backend" \
  "curl -s 'http://localhost:9090/api/v1/targets'" \
  '"health":"up"'

echo ""
echo "6. Grafana (:3001)"
check "Grafana UI" \
  "curl -s -o /dev/null -w '%{http_code}' http://localhost:3001/api/health" \
  "200"
check "Grafana datasource provisioned" \
  "curl -s http://localhost:3001/api/datasources" \
  "Prometheus"

echo ""
echo "=== API Endpoints ==="
echo ""

echo "7. Prometheus Metrics"
check "/metrics returns data" \
  "curl -s http://localhost:8080/metrics" \
  "http_requests_total"

echo ""
echo "8. Swagger UI"
check "/swagger/index.html loads" \
  "curl -s -o /dev/null -w '%{http_code}' http://localhost:8080/swagger/index.html" \
  "200"

echo ""
echo "9. Course API (backend → PostgreSQL)"
check "GET /courses returns data" \
  "curl -s http://localhost:8080/api/v1/courses" \
  "courses"

echo ""
echo "10. Category API"
check "GET /tools returns data" \
  "curl -s http://localhost:8080/api/v1/tools" \
  "tools"

echo ""
echo "=== Cross-Service Integration ==="
echo ""

echo "11. Frontend → Backend"
check "Frontend can reach API (courses page)" \
  "curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/courses" \
  "200"

echo ""
echo "================================================"
echo -e "  Results: ${GREEN}${pass} passed${NC}, ${RED}${fail} failed${NC}"
echo "================================================"
echo ""

if [ "$fail" -gt 0 ]; then
  exit 1
fi
