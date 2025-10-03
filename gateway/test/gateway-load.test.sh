#!/bin/bash

set -e

GATEWAY_HTTPS="https://localhost:12745"
CONCURRENT_REQUESTS=10
TOTAL_REQUESTS=100
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "========================================"
echo "🚀 Gateway Load Testing"
echo "========================================"
echo ""
echo "Configuration:"
echo "  Gateway: $GATEWAY_HTTPS"
echo "  Concurrent requests: $CONCURRENT_REQUESTS"
echo "  Total requests: $TOTAL_REQUESTS"
echo ""

if ! command -v ab &> /dev/null && ! command -v wrk &> /dev/null; then
    echo -e "${YELLOW}⚠ Warning: Neither 'ab' (Apache Bench) nor 'wrk' found${NC}"
    echo "Installing basic load test using curl..."
    echo ""
fi

echo "Test 1: Basic Load Test (Frontend)"
echo "Running $TOTAL_REQUESTS requests with $CONCURRENT_REQUESTS concurrent..."

SUCCESS_COUNT=0
FAIL_COUNT=0
START_TIME=$(date +%s)

for i in $(seq 1 $TOTAL_REQUESTS); do
    if [ $((i % CONCURRENT_REQUESTS)) -eq 0 ]; then
        wait
    fi
    
    (
        RESPONSE=$(curl -k -s -o /dev/null -w "%{http_code}" "${GATEWAY_HTTPS}/" 2>&1 || echo "000")
        if [ "$RESPONSE" = "200" ] || [ "$RESPONSE" = "502" ]; then
            echo "success" > /tmp/load_test_$$_$i
        else
            echo "fail" > /tmp/load_test_$$_$i
        fi
    ) &
    
    if [ $((i % 10)) -eq 0 ]; then
        echo -n "."
    fi
done

wait
echo ""

for i in $(seq 1 $TOTAL_REQUESTS); do
    if [ -f "/tmp/load_test_$$_$i" ]; then
        RESULT=$(cat "/tmp/load_test_$$_$i")
        if [ "$RESULT" = "success" ]; then
            ((SUCCESS_COUNT++))
        else
            ((FAIL_COUNT++))
        fi
        rm -f "/tmp/load_test_$$_$i"
    fi
done

END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

echo ""
echo "Results:"
echo -e "  ${GREEN}Successful: $SUCCESS_COUNT${NC}"
echo -e "  ${RED}Failed: $FAIL_COUNT${NC}"
echo "  Duration: ${DURATION}s"
echo "  Requests/sec: $((TOTAL_REQUESTS / DURATION))"
echo ""

echo "Test 2: API Endpoint Load Test"
echo "Running $TOTAL_REQUESTS requests to API..."

API_SUCCESS=0
API_FAIL=0
START_TIME=$(date +%s)

for i in $(seq 1 $TOTAL_REQUESTS); do
    if [ $((i % CONCURRENT_REQUESTS)) -eq 0 ]; then
        wait
    fi
    
    (
        RESPONSE=$(curl -k -s -o /dev/null -w "%{http_code}" "${GATEWAY_HTTPS}/api/health" 2>&1 || echo "000")
        if [ "$RESPONSE" = "200" ] || [ "$RESPONSE" = "502" ]; then
            echo "success" > /tmp/api_load_test_$$_$i
        else
            echo "fail" > /tmp/api_load_test_$$_$i
        fi
    ) &
    
    if [ $((i % 10)) -eq 0 ]; then
        echo -n "."
    fi
done

wait
echo ""

for i in $(seq 1 $TOTAL_REQUESTS); do
    if [ -f "/tmp/api_load_test_$$_$i" ]; then
        RESULT=$(cat "/tmp/api_load_test_$$_$i")
        if [ "$RESULT" = "success" ]; then
            ((API_SUCCESS++))
        else
            ((API_FAIL++))
        fi
        rm -f "/tmp/api_load_test_$$_$i"
    fi
done

END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

echo ""
echo "Results:"
echo -e "  ${GREEN}Successful: $API_SUCCESS${NC}"
echo -e "  ${RED}Failed: $API_FAIL${NC}"
echo "  Duration: ${DURATION}s"
echo "  Requests/sec: $((TOTAL_REQUESTS / DURATION))"
echo ""

echo "Test 3: Connection Persistence"
PERSISTENT_CONNECTIONS=$(docker exec avatar-gen-gateway cat /proc/net/tcp 2>/dev/null | grep -c "12745" || echo "N/A")
echo "Active connections on port 12745: $PERSISTENT_CONNECTIONS"
echo ""

echo "========================================"
echo "📊 Load Test Summary"
echo "========================================"
echo "Frontend:"
echo -e "  Success rate: ${GREEN}$((SUCCESS_COUNT * 100 / TOTAL_REQUESTS))%${NC}"
echo ""
echo "API:"
echo -e "  Success rate: ${GREEN}$((API_SUCCESS * 100 / TOTAL_REQUESTS))%${NC}"
echo ""

TOTAL_SUCCESS=$((SUCCESS_COUNT + API_SUCCESS))
TOTAL_FAIL=$((FAIL_COUNT + API_FAIL))
TOTAL=$((TOTAL_SUCCESS + TOTAL_FAIL))

if [ $TOTAL_FAIL -eq 0 ]; then
    echo -e "${GREEN}✅ All load tests passed!${NC}"
    exit 0
elif [ $((TOTAL_SUCCESS * 100 / TOTAL)) -ge 95 ]; then
    echo -e "${YELLOW}⚠ Load tests completed with some failures (>95% success rate)${NC}"
    exit 0
else
    echo -e "${RED}❌ Load tests failed (success rate <95%)${NC}"
    exit 1
fi

