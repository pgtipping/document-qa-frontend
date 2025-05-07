#!/bin/bash

# Enhanced E2E test setup script
# Created: 2025-05-06 04:26:49

set -e  # Exit on any error

# Set up environment
export NODE_ENV=test
export NEXTAUTH_URL=http://localhost:3004
export NEXTAUTH_SECRET=e2etestsecretkey

# Function to check if a port is in use
port_in_use() {
  nc -z localhost $1 > /dev/null 2>&1
}

# Create a timestamp for log files
TIMESTAMP=$(date +'%Y%m%d_%H%M%S')
LOG_DIR="performance_logs"
mkdir -p "$LOG_DIR"
LOG_FILE="$LOG_DIR/e2e_test_$TIMESTAMP.log"

# Log function
log() {
  echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log "Starting E2E test setup"

# Check if server is already running
if ! port_in_use 3004; then
  log "Starting test server on port 3004..."
  npm run dev -- -p 3004 &
  SERVER_PID=$!
  
  # Wait for server to start
  log "Waiting for server to start..."
  attempt=0
  max_attempts=30
  
  until port_in_use 3004 || [ $attempt -ge $max_attempts ]; do
    attempt=$((attempt+1))
    log "Waiting for server (attempt $attempt/$max_attempts)..."
    sleep 1
  done
  
  if port_in_use 3004; then
    log "Server started successfully."
  else
    log "Server failed to start after $max_attempts attempts."
    exit 1
  fi
else
  log "Server already running on port 3004."
fi

# Set up database
log "Setting up test database..."
npx prisma migrate deploy
node scripts/seed-test-db.js

# Run specified tests or all tests
if [ -z "$1" ]; then
  log "Running all tests..."
  npm run cy:run
else
  log "Running tests for $1..."
  npm run cy:run -- --spec "$1"
fi

# Cleanup
if [ ! -z "$SERVER_PID" ]; then
  log "Shutting down test server..."
  kill $SERVER_PID
  
  # Wait for server to shut down
  attempt=0
  max_attempts=10
  
  until ! port_in_use 3004 || [ $attempt -ge $max_attempts ]; do
    attempt=$((attempt+1))
    log "Waiting for server to shut down (attempt $attempt/$max_attempts)..."
    sleep 1
  done
  
  if ! port_in_use 3004; then
    log "Server shut down successfully."
  else
    log "Warning: Server did not shut down cleanly."
    # Force kill if needed
    kill -9 $SERVER_PID 2>/dev/null || true
  fi
fi

log "Test run completed."
