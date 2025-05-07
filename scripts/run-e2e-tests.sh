#!/bin/bash

# Run E2E tests with improved quiz testing
# This script sets up the proper environment and runs the Cypress tests

# Ensure we're in the frontend directory
cd "$(dirname "$0")/.." || { echo "Error: Could not navigate to frontend directory"; exit 1; }

# Create logs directory if it doesn't exist
LOGS_DIR="./performance_logs/cypress_logs"
mkdir -p "$LOGS_DIR"

# Setup log files
TIMESTAMP=$(date +"%Y%m%d%H%M%S")
LOG_FILE="$LOGS_DIR/test_run_$TIMESTAMP.log"
FAILURE_FILE="$LOGS_DIR/failures_$TIMESTAMP.json"
STATS_FILE="$LOGS_DIR/stats.json"

# Display script header
echo "=========================================="
echo "InQDoc E2E Test Runner"
echo "=========================================="
echo "Running with enhanced quiz testing commands"
echo "Current directory: $(pwd)"
echo "Log file: $LOG_FILE"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed or not in PATH"
    exit 1
fi

# Check for Cypress installation
if [ ! -d "./node_modules/cypress" ]; then
    echo "Cypress not found, installing dependencies..."
    npm install
fi

# Configuration
export NEXTAUTH_URL="http://localhost:3004"
export NEXTAUTH_DEBUG=true
export NODE_ENV="test"

# Verify next.js is built
if [ ! -d "./.next" ]; then
    echo "Building Next.js application..."
    npm run build
fi

# Function to record test failures
record_failures() {
    local test_file=$1
    local exit_code=$2
    local duration=$3
    
    # Create stats file if it doesn't exist
    if [ ! -f "$STATS_FILE" ]; then
        echo "{\"tests\": {}}" > "$STATS_FILE"
    fi
    
    # Update stats file with test results
    node -e "
        const fs = require('fs');
        const stats = JSON.parse(fs.readFileSync('$STATS_FILE', 'utf8'));
        if (!stats.tests['$test_file']) {
            stats.tests['$test_file'] = {
                runs: 0,
                failures: 0,
                last_run: null,
                last_status: null,
                average_duration: 0
            };
        }
        
        const test = stats.tests['$test_file'];
        test.runs++;
        test.last_run = new Date().toISOString();
        test.last_status = $exit_code === 0 ? 'passed' : 'failed';
        if ($exit_code !== 0) {
            test.failures++;
        }
        
        // Update average duration
        test.average_duration = ((test.average_duration * (test.runs - 1)) + $duration) / test.runs;
        
        // Add failure rate
        test.failure_rate = (test.failures / test.runs * 100).toFixed(2) + '%';
        
        fs.writeFileSync('$STATS_FILE', JSON.stringify(stats, null, 2));
    "
    
    # If test failed, record detailed failure information
    if [ $exit_code -ne 0 ]; then
        # Extract failure information from the latest screenshots
        local screenshots_dir="./cypress/screenshots/$test_file"
        if [ -d "$screenshots_dir" ]; then
            echo "Recording failure information from screenshots in $screenshots_dir"
            
            # Create a JSON record of failures
            node -e "
                const fs = require('fs');
                const path = require('path');
                
                const screenshotsDir = '$screenshots_dir';
                const files = fs.readdirSync(screenshotsDir).filter(f => f.includes('failed'));
                
                const failures = {
                    timestamp: new Date().toISOString(),
                    test_file: '$test_file',
                    failures: files.map(file => {
                        const match = file.match(/(.*) -- (.*) \(failed\)/);
                        return match ? {
                            test_suite: match[1],
                            test_name: match[2],
                            screenshot: path.join(screenshotsDir, file)
                        } : { 
                            unknown_failure: file,
                            screenshot: path.join(screenshotsDir, file)
                        };
                    })
                };
                
                fs.writeFileSync('$FAILURE_FILE', JSON.stringify(failures, null, 2));
            "
        else
            echo "No screenshots found for failed tests"
        fi
    fi
}

# Function to recommend fixes based on failure patterns
analyze_failures() {
    echo "Analyzing test failure patterns..."
    
    # Analyze stats file for patterns
    node -e "
        const fs = require('fs');
        
        try {
            if (!fs.existsSync('$STATS_FILE')) {
                console.log('No test statistics available yet');
                return;
            }
            
            const stats = JSON.parse(fs.readFileSync('$STATS_FILE', 'utf8'));
            const tests = stats.tests;
            
            // Find tests with high failure rates
            const highFailureTests = Object.entries(tests)
                .filter(([_, test]) => test.runs > 3 && (test.failures / test.runs) > 0.3)
                .sort((a, b) => (b[1].failures / b[1].runs) - (a[1].failures / a[1].runs));
            
            if (highFailureTests.length > 0) {
                console.log('\nTests with high failure rates:');
                highFailureTests.forEach(([testName, test]) => {
                    console.log(\`  \${testName}: \${test.failure_rate} (\${test.failures}/\${test.runs})\`);
                });
                
                console.log('\nRecommendations:');
                console.log('1. Check for timing issues in tests with high failure rates');
                console.log('2. Verify that selectors are stable for these tests');
                console.log('3. Look for race conditions in component loading');
                console.log('4. Consider adding more waitFor conditions');
            } else {
                console.log('No high-failure tests identified');
            }
            
            // Find flaky tests (alternating pass/fail)
            if (fs.existsSync('$LOGS_DIR')) {
                const logFiles = fs.readdirSync('$LOGS_DIR').filter(f => f.startsWith('failures_')).sort();
                if (logFiles.length > 3) {
                    console.log('\nAnalyzing for flaky tests (tests that alternate between pass/fail)...');
                    
                    // This would need more implementation to track patterns across runs
                    // For now we'll just note the capability
                    console.log('Flaky test detection will be implemented in a future update');
                }
            }
            
        } catch (err) {
            console.error('Error analyzing failures:', err);
        }
    " | tee -a "$LOG_FILE"
}

# Helper functions
run_specific_test() {
    local test_file=$1
    local retries=${2:-0}
    echo "Running specific test: $test_file"
    
    # Start the development server in the background
    npm run dev &
    DEV_PID=$!
    
    # Wait for server to be ready
    echo "Waiting for development server to start..."
    sleep 5
    
    # Start timer
    local start_time=$(date +%s)
    
    # Run the specific test
    echo "Running Cypress test with baseUrl=http://localhost:3004" | tee -a "$LOG_FILE"
    npx cypress run --spec "cypress/e2e/$test_file.cy.ts" --config baseUrl=http://localhost:3004 | tee -a "$LOG_FILE"
    TEST_EXIT_CODE=$?
    
    # End timer and calculate duration
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    # Kill the development server
    if [ -n "$DEV_PID" ]; then
      kill $DEV_PID 2>/dev/null || true
    fi
    
    # Record test results
    record_failures "$test_file" "$TEST_EXIT_CODE" "$duration"
    
    # Auto-retry failed tests once if requested
    if [ $TEST_EXIT_CODE -ne 0 ] && [ $retries -gt 0 ]; then
        echo "Test failed. Retrying..." | tee -a "$LOG_FILE"
        local retry_count=$((retries - 1))
        run_specific_test "$test_file" "$retry_count"
        return $?
    fi
    
    return $TEST_EXIT_CODE
}

run_all_tests() {
    echo "Running all E2E tests..." | tee -a "$LOG_FILE"
    
    # Start the development server in the background
    npm run dev &
    DEV_PID=$!
    
    # Wait for server to be ready
    echo "Waiting for development server to start..."
    sleep 5
    
    # Start timer
    local start_time=$(date +%s)
    
    # Run all tests
    echo "Running all Cypress tests with baseUrl=http://localhost:3004" | tee -a "$LOG_FILE"
    npx cypress run --config baseUrl=http://localhost:3004 | tee -a "$LOG_FILE"
    TEST_EXIT_CODE=$?
    
    # End timer and calculate duration
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    # Kill the development server
    if [ -n "$DEV_PID" ]; then
      kill $DEV_PID 2>/dev/null || true
    fi
    
    # Record results for each spec file
    # Since we don't have easy access to individual file results here,
    # we'll just record the overall result
    node -e "
        const fs = require('fs');
        const path = require('path');
        
        // Get all spec files
        const specFiles = fs.readdirSync('./cypress/e2e')
            .filter(f => f.endsWith('.cy.ts'))
            .map(f => f.replace('.cy.ts', ''));
            
        // For each spec, check if it has screenshots (indicating failure)
        specFiles.forEach(spec => {
            const screenshotDir = path.join('./cypress/screenshots', spec + '.cy.ts');
            const hasFailure = fs.existsSync(screenshotDir) && 
                               fs.readdirSync(screenshotDir).some(f => f.includes('failed'));
                               
            // Record result for this spec
            const exitCode = hasFailure ? 1 : 0;
            const cmd = 'bash -c \"source ./scripts/run-e2e-tests.sh; record_failures \"' + spec + '\" ' + exitCode + ' ' + ($duration / specFiles.length) + '\"';
            require('child_process').execSync(cmd, {stdio: 'inherit'});
        });
    "
    
    return $TEST_EXIT_CODE
}

run_tests_visual() {
    echo "Opening Cypress test runner..." | tee -a "$LOG_FILE"
    
    # Start the development server in the background
    npm run dev &
    DEV_PID=$!
    
    # Wait for server to be ready
    echo "Waiting for development server to start..."
    sleep 5
    
    # Open Cypress UI
    npx cypress open --config baseUrl=http://localhost:3004
    
    # Kill the development server when Cypress is closed
    if [ -n "$DEV_PID" ]; then
      kill $DEV_PID 2>/dev/null || true
    fi
}

show_test_stats() {
    echo "Test Statistics:" | tee -a "$LOG_FILE"
    
    if [ ! -f "$STATS_FILE" ]; then
        echo "No test statistics available yet" | tee -a "$LOG_FILE"
        return
    fi
    
    node -e "
        const fs = require('fs');
        const stats = JSON.parse(fs.readFileSync('$STATS_FILE', 'utf8'));
        
        console.log('\nTest Run Statistics:\n');
        console.log('┌─────────────────────┬───────┬──────────┬─────────────┬────────────────┐');
        console.log('│ Test                │ Runs  │ Failures │ Failure Rate│ Avg Duration   │');
        console.log('├─────────────────────┼───────┼──────────┼─────────────┼────────────────┤');
        
        Object.entries(stats.tests).forEach(([testName, test]) => {
            const name = testName.padEnd(20).substring(0, 20);
            const runs = String(test.runs).padEnd(6);
            const failures = String(test.failures).padEnd(9);
            const failRate = String(test.failure_rate || '0%').padEnd(12);
            const duration = String(Math.round(test.average_duration) + 's').padEnd(15);
            
            console.log(\`│ \${name} │ \${runs} │ \${failures} │ \${failRate} │ \${duration} │\`);
        });
        
        console.log('└─────────────────────┴───────┴──────────┴─────────────┴────────────────┘');
    " | tee -a "$LOG_FILE"
    
    # Also run the failure analysis
    analyze_failures
}

# Process command-line arguments
case "$1" in
    "open")
        # Run visual mode
        run_tests_visual
        EXIT_CODE=0
        ;;
    "stats")
        # Show test statistics
        show_test_stats
        EXIT_CODE=0
        ;;
    "analyze")
        # Analyze failure patterns
        analyze_failures
        EXIT_CODE=0
        ;;
    "quiz")
        # Run only quiz tests
        run_specific_test "quiz-flow" 1  # With 1 retry
        EXIT_CODE=$?
        ;;
    "retry")
        # Run a specific test with retries
        if [ -z "$2" ]; then
            echo "Error: Please specify a test file to retry"
            exit 1
        fi
        run_specific_test "$2" 2  # With 2 retries
        EXIT_CODE=$?
        ;;
    "")
        # No arguments, run all tests
        run_all_tests
        EXIT_CODE=$?
        ;;
    *)
        # Run specific test file
        run_specific_test "$1" 0  # No retries
        EXIT_CODE=$?
        ;;
esac

echo ""
echo "=========================================="
if [ $EXIT_CODE -eq 0 ]; then
    echo "✅ Tests completed successfully"
else
    echo "❌ Tests failed with exit code $EXIT_CODE"
    echo "See $LOG_FILE for details"
    
    # Show recommendations
    if [ -f "$FAILURE_FILE" ]; then
        echo ""
        echo "Failure details recorded in $FAILURE_FILE"
        echo ""
        echo "Most recent test failures:"
        node -e "
            const fs = require('fs');
            const failures = JSON.parse(fs.readFileSync('$FAILURE_FILE', 'utf8'));
            
            failures.failures.forEach(failure => {
                console.log(\`  - \${failure.test_suite || 'Unknown'}: \${failure.test_name || 'Unknown test'}\`);
            });
            
            console.log('\nRecommended fixes:');
            console.log('1. Check data-testid attributes in components');
            console.log('2. Verify loading states are handled with waitForQuizLoad');
            console.log('3. Check for timing issues with navigation');
            console.log('4. Run with --open flag to debug visually');
        "
    fi
fi
echo "=========================================="

# Show test stats after each run (brief version)
if [ -f "$STATS_FILE" ]; then
    echo ""
    echo "Test Summary:"
    node -e "
        const fs = require('fs');
        const stats = JSON.parse(fs.readFileSync('$STATS_FILE', 'utf8'));
        
        const totalRuns = Object.values(stats.tests).reduce((sum, test) => sum + test.runs, 0);
        const totalFailures = Object.values(stats.tests).reduce((sum, test) => sum + test.failures, 0);
        const failureRate = totalRuns > 0 ? (totalFailures / totalRuns * 100).toFixed(2) + '%' : 'N/A';
        
        console.log(\`Total runs: \${totalRuns}, Total failures: \${totalFailures}, Overall failure rate: \${failureRate}\`);
        
        // Show most problematic tests
        const problemTests = Object.entries(stats.tests)
            .filter(([_, test]) => test.runs > 2 && (test.failures / test.runs) > 0.2)
            .sort((a, b) => (b[1].failures / b[1].runs) - (a[1].failures / a[1].runs))
            .slice(0, 3);
            
        if (problemTests.length > 0) {
            console.log('\nMost problematic tests:');
            problemTests.forEach(([name, test]) => {
                console.log(\`  \${name}: \${test.failure_rate} failure rate (\${test.failures}/\${test.runs} runs)\`);
            });
        }
    "
fi

exit $EXIT_CODE 