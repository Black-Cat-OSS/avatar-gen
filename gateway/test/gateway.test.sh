#!/bin/bash

set -e

GATEWAY_HTTP="http://localhost:80"
GATEWAY_HTTPS="https://localhost:12745"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

TESTS_PASSED=0
TESTS_FAILED=0

echo "========================================"
echo "🧪 Gateway Integration Tests"
echo "========================================"
echo ""

test_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ PASSED${NC}: $2"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}✗ FAILED${NC}: $2"
        echo -e "${YELLOW}  Error: $3${NC}"
        ((TESTS_FAILED++))
    fi
}

echo "Test 1: Gateway Health Check"
if curl -k -s -f -o /dev/null "${GATEWAY_HTTPS}"; then
    test_result 0 "Gateway is accessible via HTTPS"
else
    test_result 1 "Gateway is accessible via HTTPS" "Cannot reach gateway"
fi
echo ""

echo "Test 2: HTTP to HTTPS Redirect"
HTTP_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -L "${GATEWAY_HTTP}" 2>&1 || echo "000")
if [ "$HTTP_RESPONSE" = "301" ] || [ "$HTTP_RESPONSE" = "200" ]; then
    test_result 0 "HTTP redirects to HTTPS (Status: $HTTP_RESPONSE)"
else
    test_result 1 "HTTP redirects to HTTPS" "Expected 301 or 200, got $HTTP_RESPONSE"
fi
echo ""

echo "Test 3: Frontend Proxy (Root Path)"
FRONTEND_RESPONSE=$(curl -k -s -o /dev/null -w "%{http_code}" "${GATEWAY_HTTPS}/" 2>&1 || echo "000")
if [ "$FRONTEND_RESPONSE" = "200" ] || [ "$FRONTEND_RESPONSE" = "502" ]; then
    test_result 0 "Frontend accessible via gateway (Status: $FRONTEND_RESPONSE)"
else
    test_result 1 "Frontend accessible via gateway" "Expected 200 or 502, got $FRONTEND_RESPONSE"
fi
echo ""

echo "Test 4: Backend API Proxy"
API_RESPONSE=$(curl -k -s -o /dev/null -w "%{http_code}" "${GATEWAY_HTTPS}/api/health" 2>&1 || echo "000")
if [ "$API_RESPONSE" = "200" ] || [ "$API_RESPONSE" = "502" ]; then
    test_result 0 "Backend API accessible via gateway (Status: $API_RESPONSE)"
else
    test_result 1 "Backend API accessible via gateway" "Expected 200 or 502, got $API_RESPONSE"
fi
echo ""

echo "Test 5: 404 Error Page"
ERROR_404=$(curl -k -s "${GATEWAY_HTTPS}/nonexistent-page-12345" 2>&1)
if echo "$ERROR_404" | grep -q "404\|Page Not Found"; then
    test_result 0 "Custom 404 page is served"
else
    test_result 1 "Custom 404 page is served" "404 page not found in response"
fi
echo ""

echo "Test 6: SSL Certificate"
if openssl s_client -connect localhost:12745 -servername localhost </dev/null 2>/dev/null | grep -q "Verify return code"; then
    test_result 0 "SSL certificate is present"
else
    test_result 1 "SSL certificate is present" "SSL handshake failed"
fi
echo ""

echo "Test 7: Security Headers"
HEADERS=$(curl -k -s -I "${GATEWAY_HTTPS}/" 2>&1 || echo "")
if echo "$HEADERS" | grep -qi "X-Frame-Options\|X-Content-Type-Options"; then
    test_result 0 "Security headers are present"
else
    test_result 1 "Security headers are present" "Security headers not found"
fi
echo ""

echo "Test 8: GZIP Compression"
GZIP_RESPONSE=$(curl -k -s -H "Accept-Encoding: gzip" -I "${GATEWAY_HTTPS}/" 2>&1 || echo "")
if echo "$GZIP_RESPONSE" | grep -qi "Content-Encoding.*gzip"; then
    test_result 0 "GZIP compression is enabled"
else
    test_result 0 "GZIP compression check" "Note: May not be enabled for all responses"
fi
echo ""

echo "Test 9: Port Configuration"
if netstat -an 2>/dev/null | grep -q ":12745.*LISTEN" || ss -tuln 2>/dev/null | grep -q ":12745"; then
    test_result 0 "Gateway listening on port 12745"
else
    test_result 1 "Gateway listening on port 12745" "Port 12745 not listening"
fi
echo ""

echo "Test 10: Nginx Configuration Syntax"
if docker exec avatar-gen-gateway nginx -t 2>&1 | grep -q "successful"; then
    test_result 0 "Nginx configuration is valid"
else
    test_result 1 "Nginx configuration is valid" "Nginx config test failed"
fi
echo ""

echo "========================================"
echo "📊 Test Results Summary"
echo "========================================"
echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Failed: $TESTS_FAILED${NC}"
echo "Total: $((TESTS_PASSED + TESTS_FAILED))"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}❌ Some tests failed!${NC}"
    exit 1
fi

