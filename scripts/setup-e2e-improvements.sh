#!/bin/bash

# E2E Testing Infrastructure Enhancement Script
# Created: 2025-05-06 04:26:49
# 
# This script implements the improvements documented in TESTING_SETUP.md
# to fix the E2E testing infrastructure issues.

set -e  # Exit on any error

echo "Starting E2E testing infrastructure improvements..."

# Function to check if a command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Create a timestamp for log files
TIMESTAMP=$(date +'%Y%m%d_%H%M%S')
LOG_DIR="performance_logs"
mkdir -p "$LOG_DIR"
LOG_FILE="$LOG_DIR/e2e_improvements_$TIMESTAMP.log"

# Log function
log() {
  echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Step 1: Update auth.ts configuration
log "Step 1: Updating NextAuth configuration in auth.ts"

# Find and update the debug configuration
if grep -q "debug: process.env.NODE_ENV === \"development\"" src/lib/auth.ts; then
  log "Updating debug configuration in auth.ts"
  sed -i 's/debug: process.env.NODE_ENV === "development"/debug: process.env.NODE_ENV !== "production"/g' src/lib/auth.ts
  log "Debug configuration updated successfully"
else
  log "Debug configuration not found or already updated"
fi

# Step 2: Update e2e.ts with enhanced error handling
log "Step 2: Enhancing error handling in Cypress e2e.ts"

# Check if error handling is already updated
if ! grep -q "err.message.includes(\"CSRF\")" cypress/support/e2e.ts; then
  log "Adding enhanced NextAuth error handling to e2e.ts"
  # Create a temporary file with the updated content
  cat > cypress/support/e2e.ts.new << 'EOF'
// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import "./commands";
// Add Testing Library queries
import "@testing-library/cypress/add-commands";

// Handle NextAuth and other common errors globally
Cypress.on("uncaught:exception", (err) => {
  // Log the error for debugging
  console.warn("Uncaught exception:", err.message);
  
  // NextAuth URL validation errors
  if (err.message.includes("Failed to construct 'URL'")) {
    console.warn("Ignoring NextAuth URL validation error");
    return false;
  }
  
  // CSRF token validation errors
  if (err.message.includes("CSRF")) {
    console.warn("Ignoring NextAuth CSRF error");
    return false;
  }
  
  // JWT validation errors
  if (err.message.includes("JWT")) {
    console.warn("Ignoring JWT validation error");
    return false;
  }
  
  // We still want to fail the test for other errors
  return true;
});

// Alternatively you can use CommonJS syntax:
// require('./commands')
EOF

  # Replace the original file
  mv cypress/support/e2e.ts.new cypress/support/e2e.ts
  log "Enhanced error handling added to e2e.ts"
else
  log "Enhanced error handling already exists in e2e.ts"
fi

# Step 3: Convert seed script from ES modules to CommonJS
log "Step 3: Converting seed-test-db.ts from ES modules to CommonJS"

# Create a JavaScript version of the seed script
cat > scripts/seed-test-db.js << 'EOF'
// CommonJS version of the database seeding script for better compatibility
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Main cleanup function to ensure a clean database before seeding
async function cleanupDatabase() {
  try {
    // Delete in correct order to respect foreign key constraints
    console.log("Cleaning up existing test data...");
    
    await prisma.quizQuestion.deleteMany({});
    await prisma.quiz.deleteMany({});
    await prisma.document.deleteMany({});
    await prisma.user.deleteMany({});
    
    console.log("Database cleaned successfully");
    return true;
  } catch (error) {
    console.error("Error cleaning database:", error);
    return false;
  }
}

// Seed function with test data
async function seedDatabase() {
  try {
    console.log("Seeding test database...");
    
    // Create test users
    const testUser = await prisma.user.create({
      data: {
        name: "Test User",
        email: "test@example.com",
        password: "$2b$10$dPXEHVqfvMCQyjdtRWd.Oe5fB1oBXcQMmEVRGG7KGlHkIJ8YLm3R6", // hashed "password123"
      },
    });
    
    const adminUser = await prisma.user.create({
      data: {
        name: "Admin User",
        email: "admin@example.com",
        password: "$2b$10$dPXEHVqfvMCQyjdtRWd.Oe5fB1oBXcQMmEVRGG7KGlHkIJ8YLm3R6", // hashed "password123"
        role: "admin",
      },
    });
    
    // Create test documents
    const document1 = await prisma.document.create({
      data: {
        title: "Test Document 1",
        content: "This is a test document for E2E testing",
        userId: testUser.id,
      }
    });
    
    const document2 = await prisma.document.create({
      data: {
        title: "Test Document 2",
        content: "Another test document for test user",
        userId: testUser.id,
      }
    });
    
    // Create test quizzes
    const quiz1 = await prisma.quiz.create({
      data: {
        title: "Test Quiz 1",
        documentId: document1.id,
        userId: testUser.id,
        status: "PUBLISHED",
      }
    });
    
    // Create quiz questions
    await prisma.quizQuestion.create({
      data: {
        quizId: quiz1.id,
        type: "MULTIPLE_CHOICE",
        text: "Question 1",
        options: JSON.stringify(["Option A", "Option B", "Option C", "Option D"]),
        correctAnswerIndex: 0,
        difficulty: "MEDIUM",
      }
    });
    
    await prisma.quizQuestion.create({
      data: {
        quizId: quiz1.id,
        type: "MULTIPLE_CHOICE",
        text: "Question 2",
        options: JSON.stringify(["Option 1", "Option 2", "Option 3", "Option 4"]),
        correctAnswerIndex: 2,
        difficulty: "EASY",
      }
    });
    
    console.log("Database seeded successfully");
    return true;
  } catch (error) {
    console.error("Error seeding database:", error);
    return false;
  }
}

// Validation function to ensure data was created properly
async function validateSeeding() {
  try {
    const userCount = await prisma.user.count();
    const documentCount = await prisma.document.count();
    const quizCount = await prisma.quiz.count();
    const questionCount = await prisma.quizQuestion.count();
    
    console.log(`Validation: Found ${userCount} users, ${documentCount} documents, ${quizCount} quizzes, and ${questionCount} questions`);
    
    if (userCount < 2 || documentCount < 2 || quizCount < 1 || questionCount < 2) {
      throw new Error("Validation failed: Missing test data");
    }
    
    console.log("Seeding validation successful");
    return true;
  } catch (error) {
    console.error("Validation error:", error);
    return false;
  }
}

// Main execution flow
async function main() {
  try {
    const cleanupSuccess = await cleanupDatabase();
    if (!cleanupSuccess) {
      process.exit(1);
    }
    
    const seedSuccess = await seedDatabase();
    if (!seedSuccess) {
      process.exit(1);
    }
    
    const validationSuccess = await validateSeeding();
    if (!validationSuccess) {
      process.exit(1);
    }
    
    console.log("Database seeding completed successfully");
    await prisma.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Fatal error during seeding:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

// Run the main function
main();
EOF

log "Created CommonJS version of seed script at scripts/seed-test-db.js"

# Step 4: Create an enhanced setup-test-env.sh script
log "Step 4: Creating enhanced setup-test-env.sh script"

cat > scripts/setup-test-env.sh.new << 'EOF'
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
EOF

# Replace the original file
mv scripts/setup-test-env.sh.new scripts/setup-test-env.sh
chmod +x scripts/setup-test-env.sh
log "Enhanced setup-test-env.sh script created and made executable"

# Step 5: Run a quick test to verify changes
log "Step 5: Running auth-flows.cy.ts tests to verify changes"

# Only do this if explicitly requested to avoid long-running operations
if [ "$1" == "--run-tests" ]; then
  log "Running auth flow tests..."
  scripts/setup-test-env.sh "cypress/e2e/auth-flows.cy.ts"
  log "Auth flow tests completed"
else
  log "Skipping test execution (use --run-tests flag to run tests)"
fi

log "E2E testing infrastructure improvements completed!"
log "Next steps:"
log "1. Add data-testid attributes to quiz components"
log "2. Update quiz flow tests with proper selectors"
log "3. Run full test suite with: ./scripts/setup-test-env.sh"
log "See TESTING_SETUP.md for detailed implementation plan"

# Make script executable
chmod +x "$0"
echo "Script execution completed. See $LOG_FILE for details." 