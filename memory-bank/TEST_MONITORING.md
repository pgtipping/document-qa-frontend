# Test Monitoring System - Internal Documentation

**PRIVATE: For Developer Reference Only**

This document describes the private test monitoring system implemented to track and analyze E2E test failures without sharing failure information with external systems or teams.

## Overview

The test monitoring system collects failure information during Cypress test runs, analyzes patterns, and provides recommendations for fixing flaky tests. All data is stored locally in the project's performance_logs directory.

## Features

### 1. Automated Failure Tracking

- Records test failures with detailed information:
  - Test ID and timestamp
  - Failure message and stack trace
  - Problematic selectors
  - URL at failure time
  - Viewport size and environment details

### 2. Pattern Analysis

- Identifies flaky tests based on failure rates
- Detects common failure patterns:
  - Missing or incorrect selectors
  - Timing issues and race conditions
  - Navigation problems
  - Loading state issues
  - Test interaction conflicts

### 3. Recommendation Generation

- Provides specific recommendations for fixing flaky tests
- Suggests component changes when selectors are missing
- Identifies areas where additional waiting is needed
- Recommends test isolation for problematic tests

## Usage

### Running Tests with Monitoring

```bash
# Run quiz tests with monitoring
npm run test:quiz

# View current test statistics
npm run test:monitor

# Run analysis on collected data
npm run test:analyze

# Simulate test runs (for development only)
npm run test:simulate
```

### Enhanced Test Runner Options

```bash
# Retry a specific failing test
npm run test:retry <test-name>

# Run tests with visual debugging
npm run cy:open
```

## Implementation Details

### Core Components

1. **Test Monitoring Module** (`cypress/support/test-monitoring.ts`)

   - Hooks into Cypress test lifecycle
   - Records test passes and failures
   - Provides custom commands for test tracking

2. **Analysis Tool** (`scripts/analyze-test-failures.js`)

   - Analyzes collected data for patterns
   - Generates recommendations for fixing issues
   - Provides summaries and visualizations of failure data

3. **Enhanced Test Runner** (`scripts/run-e2e-tests.sh`)

   - Adds auto-retry capabilities
   - Records test statistics
   - Provides logs and summaries of test runs

4. **Cypress Task Integration** (`cypress.config.ts`)
   - Provides Node.js file system access
   - Enables persistent storage of test data
   - Allows cross-test and cross-run analysis

## Key Files

- `/performance_logs/test_monitoring/test_statistics.json` - Main test statistics file
- `/performance_logs/cypress_logs/` - Raw test run logs
- `/performance_logs/TEST_MONITORING_README.md` - User documentation

## Best Practices for Fixing Flaky Tests

Based on analysis of our test failures, here are recommendations for fixing the most common issues:

### 1. Selector Problems

- Add missing `data-testid` attributes to components
- Use consistent naming conventions for test IDs
- Create fallback selectors in custom commands
- Verify selector existence before trying to interact

### 2. Timing Issues

- Add explicit waits with `waitForQuizLoad()` or `cy.wait()`
- Increase timeouts for problematic tests
- Check for loading states and wait for them to resolve
- Use custom commands that handle waiting automatically

### 3. Navigation Problems

- Verify navigation completes before assertions
- Add explicit wait for route changes
- Use `cy.location()` to verify URL changes

### 4. Test Isolation

- Clear state between tests
- Mock dependencies consistently
- Avoid shared state between tests
- Use distinct test data for each test
