/**
 * Test Monitoring Utilities
 *
 * This module provides utilities for tracking test failures, identifying patterns,
 * and automatically generating recommendations for fixing flaky tests.
 *
 * NOTE: This is a private internal utility and not meant to be shared with the team.
 */

import { writeFileSync, readFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

// Types
interface FailureRecord {
  testId: string;
  failureMessage: string;
  selector?: string;
  timestamp: string;
  element?: string;
  viewportSize?: {
    width: number;
    height: number;
  };
  urlAtFailure?: string;
}

interface TestStatistics {
  failures: FailureRecord[];
  testRuns: {
    [testId: string]: {
      runs: number;
      failures: number;
      lastRun: string;
      failureRate: number;
      mostCommonFailures: {
        message: string;
        count: number;
      }[];
    };
  };
}

// Constants
const LOG_DIR = join(
  Cypress.config("projectRoot") as string,
  "performance_logs",
  "test_monitoring"
);
const STATS_FILE = join(LOG_DIR, "test_statistics.json");

// Debug log function
function debugLog(message: string, ...args: any[]) {
  console.log(`[Test Monitoring] ${message}`, ...args);
}

// Ensure log directory exists
function ensureLogDirExists() {
  debugLog(`Ensuring log directory exists: ${LOG_DIR}`);
  try {
    if (typeof window === "undefined") {
      if (!existsSync(LOG_DIR)) {
        debugLog("Creating log directory");
        mkdirSync(LOG_DIR, { recursive: true });
      }
    }
  } catch (error) {
    console.error("Failed to create log directory:", error);
  }
}

// Get or initialize statistics object
function getStatistics(): TestStatistics {
  ensureLogDirExists();

  debugLog(`Getting statistics from: ${STATS_FILE}`);

  try {
    if (typeof window === "undefined") {
      if (!existsSync(STATS_FILE)) {
        debugLog("Statistics file not found, creating new one");
        const initialStats: TestStatistics = {
          failures: [],
          testRuns: {},
        };
        writeFileSync(STATS_FILE, JSON.stringify(initialStats, null, 2));
        return initialStats;
      }

      return JSON.parse(readFileSync(STATS_FILE, "utf8"));
    }
  } catch (error) {
    console.error("Failed to parse statistics file:", error);
  }

  // Return empty stats object if we can't read from file
  return { failures: [], testRuns: {} };
}

// Record a test run (pass or fail)
function recordTestRun(
  testId: string,
  passed: boolean,
  failureMessage?: string,
  selector?: string
): void {
  debugLog(`Recording test run: ${testId}, passed: ${passed}`);

  // Use Cypress.task for file operations
  cy.task("recordTestRun", {
    testId,
    passed,
    failureMessage,
    selector,
    timestamp: new Date().toISOString(),
  }).then((result) => {
    debugLog("Test run recorded:", result);
  });
}

// Generate recommendations for fixing flaky tests
function generateRecommendations(): string[] {
  const stats = getStatistics();
  const recommendations: string[] = [];

  // Find tests with high failure rates
  const flakyTests = Object.entries(stats.testRuns)
    .filter(([_, data]) => data.runs >= 3 && data.failureRate > 0.2)
    .sort((a, b) => b[1].failureRate - a[1].failureRate);

  if (flakyTests.length === 0) {
    recommendations.push("No flaky tests detected.");
    return recommendations;
  }

  recommendations.push(`Found ${flakyTests.length} potentially flaky tests:`);

  flakyTests.forEach(([testId, data]) => {
    recommendations.push(
      `- ${testId}: ${(data.failureRate * 100).toFixed(1)}% failure rate (${
        data.failures
      }/${data.runs} runs)`
    );

    if (data.mostCommonFailures.length > 0) {
      recommendations.push("  Common failures:");

      data.mostCommonFailures.slice(0, 3).forEach((failure) => {
        recommendations.push(
          `  - ${failure.message} (${failure.count} occurrences)`
        );
      });

      // Analyze failure patterns
      const selectorRelated = data.mostCommonFailures.some(
        (f) =>
          f.message.includes("find") ||
          f.message.includes("selector") ||
          f.message.includes("element")
      );

      const timeoutRelated = data.mostCommonFailures.some(
        (f) => f.message.includes("timeout") || f.message.includes("timed out")
      );

      const navigationRelated = data.mostCommonFailures.some(
        (f) =>
          f.message.includes("navigation") ||
          f.message.includes("route") ||
          f.message.includes("visit")
      );

      // Add specific recommendations
      recommendations.push("  Recommendations:");

      if (selectorRelated) {
        recommendations.push(
          "  - Check selectors: Ensure data-testid attributes are consistent and present"
        );
        recommendations.push(
          "  - Use cy.contains() with text as a fallback to data-testid"
        );
      }

      if (timeoutRelated) {
        recommendations.push(
          "  - Add explicit waits: Use waitForQuizLoad or cy.wait() for async operations"
        );
        recommendations.push(
          "  - Increase default command timeout in the test"
        );
      }

      if (navigationRelated) {
        recommendations.push(
          "  - Verify navigation completes before running assertions"
        );
        recommendations.push("  - Check for race conditions in route changes");
      }
    }
  });

  return recommendations;
}

// Export functions
export const TestMonitoring = {
  recordTestRun,
  generateRecommendations,
  getStatistics,
};

// Add to Cypress namespace for global access
declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Record a test run for monitoring
       * @param testId Identifier for the test
       * @param passed Whether the test passed
       * @param failureMessage Optional failure message if test failed
       * @param selector Optional selector that failed
       */
      recordTestRun(
        testId: string,
        passed: boolean,
        failureMessage?: string,
        selector?: string
      ): void;
    }
  }
}

// Register custom command
Cypress.Commands.add(
  "recordTestRun",
  (
    testId: string,
    passed: boolean,
    failureMessage?: string,
    selector?: string
  ) => {
    try {
      recordTestRun(testId, passed, failureMessage, selector);
    } catch (error) {
      console.error("Failed to record test run:", error);
    }
  }
);

// Auto-record test results by hooking into Mocha events
// Keep track of test passes/failures
afterEach(function () {
  const test = this.currentTest;
  if (test) {
    const testId = `${test.parent?.title || "unknown"} - ${test.title}`;
    const passed = test.state === "passed";
    const failureMessage = test.err?.message;

    cy.recordTestRun(testId, passed, failureMessage);
  }
});

export default TestMonitoring;
