#!/bin/bash

set -e

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo -e "${BLUE}========================================"
echo "🧪 Running All Gateway Tests"
echo -e "========================================${NC}"
echo ""

TESTS_PASSED=0
TESTS_FAILED=0

echo -e "${YELLOW}Waiting for services to be ready...${NC}"
sleep 5
echo ""

echo -e "${BLUE}[1/2] Running Integration Tests...${NC}"
echo ""
if bash gateway.test.sh; then
    echo ""
    echo -e "${GREEN}✅ Integration tests passed${NC}"
    ((TESTS_PASSED++))
else
    echo ""
    echo -e "${RED}❌ Integration tests failed${NC}"
    ((TESTS_FAILED++))
fi
echo ""

echo -e "${BLUE}[2/2] Running Load Tests...${NC}"
echo ""
if bash gateway-load.test.sh; then
    echo ""
    echo -e "${GREEN}✅ Load tests passed${NC}"
    ((TESTS_PASSED++))
else
    echo ""
    echo -e "${RED}❌ Load tests failed${NC}"
    ((TESTS_FAILED++))
fi
echo ""

echo -e "${BLUE}========================================"
echo "📊 Final Results"
echo -e "========================================${NC}"
echo -e "${GREEN}Test suites passed: $TESTS_PASSED${NC}"
echo -e "${RED}Test suites failed: $TESTS_FAILED${NC}"
echo "Total test suites: $((TESTS_PASSED + TESTS_FAILED))"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All test suites passed!${NC}"
    exit 0
else
    echo -e "${RED}❌ Some test suites failed!${NC}"
    exit 1
fi

