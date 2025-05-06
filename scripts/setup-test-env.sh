#!/bin/bash

# setup-test-env.sh - Script for setting up and running E2E tests
# Updated: $(date +"%Y-%m-%d %H:%M:%S %Z")
# Usage: ./scripts/setup-test-env.sh [test_spec]
# Example: ./scripts/setup-test-env.sh cypress/e2e/auth-flows.cy.ts

# Check if a specific test is specified
if [ $# -eq 1 ]; then
  TEST_SPEC="--spec $1"
else
  TEST_SPEC=""
fi

# Colors for better output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}===== Setting Up E2E Testing Environment =====${NC}"

# Ensure we're using .env.test
echo -e "${YELLOW}Checking environment settings...${NC}"
if [ ! -f ".env.test" ]; then
  echo -e "${RED}Error: .env.test file not found.${NC}"
  echo -e "Please create an .env.test file with test environment variables."
  exit 1
fi

# Run Prisma migrations if needed
echo -e "${YELLOW}Running database migrations...${NC}"
npx prisma migrate deploy

# Seed the database with test data
echo -e "${YELLOW}Seeding test database...${NC}"
# Use ts-node with the esm flag to run the TypeScript seed script
npx ts-node --esm scripts/seed-test-db.ts || {
  echo -e "${RED}Warning: Database seeding completed with errors.${NC}"
  echo -e "Some test data may already exist. Continuing..."
}

# Check if server is running
echo -e "${YELLOW}Checking if server is already running...${NC}"
if curl -s http://localhost:3004 > /dev/null; then
  echo -e "${GREEN}Server already running on port 3004.${NC}"
else
  echo -e "${YELLOW}Starting server on port 3004...${NC}"
  # Start the Next.js server in the background
  npm run dev -- -p 3004 &
  # Store the process ID
  SERVER_PID=$!
  # Wait for the server to start
  echo -e "${YELLOW}Waiting for server to start...${NC}"
  until curl -s http://localhost:3004 > /dev/null; do
    sleep 1
  done
  echo -e "${GREEN}Server started on port 3004 (PID: ${SERVER_PID})${NC}"
fi

# Run the Cypress tests
echo -e "${YELLOW}Running Cypress tests...${NC}"
if [ -z "$TEST_SPEC" ]; then
  echo -e "${YELLOW}Running all E2E tests...${NC}"
else
  echo -e "${YELLOW}Running test: ${TEST_SPEC}${NC}"
fi

# Run the tests with the CYPRESS_BASE_URL set to localhost:3004
CYPRESS_BASE_URL=http://localhost:3004 npx cypress run $TEST_SPEC

# Check if we should clean up when done
if [ -n "$SERVER_PID" ]; then
  echo -e "${YELLOW}Tests completed. Cleaning up...${NC}"
  # Kill the server if we started it
  kill $SERVER_PID
  echo -e "${GREEN}Server stopped.${NC}"
fi

echo -e "${YELLOW}===== E2E Testing Complete =====${NC}" 