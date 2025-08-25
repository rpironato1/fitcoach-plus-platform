#!/bin/bash

# FitCoach Platform - Comprehensive Test Suite Runner
# This script runs all tests systematically to identify and fix issues

echo "🚀 Starting FitCoach Platform Comprehensive Test Suite"
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test results tracking
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

function run_test() {
  local test_name="$1"
  local test_command="$2"
  
  echo -e "\n${YELLOW}📋 Running: $test_name${NC}"
  echo "Command: $test_command"
  echo "----------------------------------------"
  
  TOTAL_TESTS=$((TOTAL_TESTS + 1))
  
  if eval "$test_command"; then
    echo -e "${GREEN}✅ PASSED: $test_name${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
    return 0
  else
    echo -e "${RED}❌ FAILED: $test_name${NC}"
    FAILED_TESTS=$((FAILED_TESTS + 1))
    return 1
  fi
}

# Install dependencies if needed
echo "📦 Installing dependencies..."
npm install

# 1. TypeScript Type Checking
run_test "TypeScript Type Check" "npm run typecheck"

# 2. ESLint Code Quality
run_test "ESLint Code Quality Check" "npm run lint"

# 3. Unit Tests
run_test "Unit Tests" "npm run test"

# 4. Build Test
run_test "Production Build" "npm run build"

# 5. Storybook Build
run_test "Storybook Build" "npm run build-storybook"

# 6. Lighthouse Performance Test
if command -v google-chrome &> /dev/null || command -v chromium &> /dev/null; then
  echo "Starting dev server for Lighthouse tests..."
  npm run dev &
  DEV_PID=$!
  sleep 10
  echo "Running Lighthouse accessibility test..."
  if npx lighthouse http://localhost:8030 --output=html --output-path=./lighthouse-accessibility.html --chrome-flags="--headless --no-sandbox" --only-categories=accessibility; then
    echo -e "${GREEN}✅ PASSED: Lighthouse Accessibility Test${NC}"
    PASSED_TESTS=$((PASSED_TESTS + 1))
  else
    echo -e "${RED}❌ FAILED: Lighthouse Accessibility Test${NC}"
    FAILED_TESTS=$((FAILED_TESTS + 1))
  fi
  TOTAL_TESTS=$((TOTAL_TESTS + 1))
  kill $DEV_PID 2>/dev/null || true
  sleep 2
else
  echo -e "${YELLOW}⚠️  SKIPPED: Lighthouse tests (Chrome not available)${NC}"
fi

# 7. E2E Smoke Tests (only if Playwright browsers are available)
if npx playwright list &> /dev/null; then
  run_test "E2E Smoke Tests" "npm run test:e2e:smoke"
else
  echo -e "${YELLOW}⚠️  SKIPPED: E2E tests (Playwright browsers not installed)${NC}"
fi

# 8. Audit Security Issues (only fail on high or critical)
run_test "NPM Security Audit" "npm audit --audit-level high"

# Results Summary
echo -e "\n=================================================="
echo -e "🎯 ${GREEN}Test Results Summary${NC}"
echo -e "=================================================="
echo -e "Total Tests: $TOTAL_TESTS"
echo -e "${GREEN}Passed: $PASSED_TESTS${NC}"
echo -e "${RED}Failed: $FAILED_TESTS${NC}"

if [ $FAILED_TESTS -eq 0 ]; then
  echo -e "\n${GREEN}🎉 ALL TESTS PASSED! Project is ready for deployment.${NC}"
  exit 0
else
  echo -e "\n${RED}❌ Some tests failed. Please review and fix the issues above.${NC}"
  echo -e "\n📝 Detailed failure analysis:"
  echo "- Check console output above for specific error messages"
  echo "- Run individual test commands to get more details"
  echo "- Use 'npm run lint --fix' to auto-fix ESLint issues"
  echo "- Use 'npm run test:watch' to debug unit tests interactively"
  exit 1
fi