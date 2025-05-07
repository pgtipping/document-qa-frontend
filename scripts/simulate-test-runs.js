#!/usr/bin/env node

/**
 * Test Run Simulator
 *
 * This script simulates test runs with various failure patterns to
 * demonstrate the test monitoring system.
 *
 * PRIVATE TOOL - For internal use only
 */

const fs = require("fs");
const path = require("path");
const chalk = require("chalk");

// Configuration
const LOG_DIR = path.join(
  __dirname,
  "..",
  "performance_logs",
  "test_monitoring"
);
const STATS_FILE = path.join(LOG_DIR, "test_statistics.json");

// Test scenarios to simulate
const TEST_SCENARIOS = [
  {
    testId: "Quiz Flow - should allow creating a new quiz",
    failureRate: 0.35, // 35% failure rate
    runs: 20,
    failurePatterns: [
      'Timed out retrying after 10000ms: Expected to find element: `[data-testid="quiz-option-0"]`, but never found it.',
      "Expected to find element: `#document-select`, but never found it.",
      "Timed out retrying after 10000ms: Expected to find element: `select`, but never found it.",
    ],
  },
  {
    testId: "Quiz Flow - should display quiz questions and allow answering",
    failureRate: 0.25, // 25% failure rate
    runs: 16,
    failurePatterns: [
      'Timed out retrying after 10000ms: Expected to find element: `[data-testid="quiz-question"]`, but never found it.',
      "Timed out retrying after 10000ms: Expected to be able to select an option, but never found any.",
    ],
  },
  {
    testId: "Quiz Flow - should display quiz results",
    failureRate: 0.2, // 20% failure rate
    runs: 15,
    failurePatterns: [
      'Timed out retrying after 10000ms: Expected to find element: `[data-testid="quiz-results"]`, but never found it.',
      "Navigation timed out waiting for page to load.",
    ],
  },
  {
    testId: "User Authentication - should allow user to log in",
    failureRate: 0.05, // 5% failure rate (more stable)
    runs: 20,
    failurePatterns: [
      "Expected to be redirected to dashboard, but URL remained at /login",
      "Failed to submit form: button was not clickable",
    ],
  },
  {
    testId: "Document Upload - should upload PDF document",
    failureRate: 0.4, // 40% failure rate (very flaky)
    runs: 10,
    failurePatterns: [
      "Network error: Failed to upload file",
      "Timeout waiting for upload confirmation",
      "Expected document to appear in list, but it was not found",
    ],
  },
];

// Helper functions
function ensureLogDirExists() {
  if (!fs.existsSync(LOG_DIR)) {
    console.log(chalk.blue(`Creating log directory: ${LOG_DIR}`));
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}

function getOrCreateStats() {
  if (!fs.existsSync(STATS_FILE)) {
    const initialStats = {
      failures: [],
      testRuns: {},
    };
    fs.writeFileSync(STATS_FILE, JSON.stringify(initialStats, null, 2));
    return initialStats;
  }

  try {
    return JSON.parse(fs.readFileSync(STATS_FILE, "utf8"));
  } catch (error) {
    console.error(chalk.red("Failed to parse statistics file:"), error);
    process.exit(1);
  }
}

function simulateTestRun(stats, scenario) {
  const testId = scenario.testId;

  // Initialize test stats if needed
  if (!stats.testRuns[testId]) {
    stats.testRuns[testId] = {
      runs: 0,
      failures: 0,
      lastRun: new Date().toISOString(),
      failureRate: 0,
      mostCommonFailures: [],
    };
  }

  // Generate timestamps over the past week
  const getRandomTimestamp = () => {
    const now = new Date();
    const daysAgo = Math.floor(Math.random() * 7); // 0-7 days ago
    const hoursAgo = Math.floor(Math.random() * 24); // 0-24 hours ago
    const timestamp = new Date(now);
    timestamp.setDate(timestamp.getDate() - daysAgo);
    timestamp.setHours(timestamp.getHours() - hoursAgo);
    return timestamp.toISOString();
  };

  // Simulate multiple test runs
  for (let i = 0; i < scenario.runs; i++) {
    const timestamp = getRandomTimestamp();
    const failThisRun = Math.random() < scenario.failureRate;

    // Update test stats
    stats.testRuns[testId].runs++;
    stats.testRuns[testId].lastRun = timestamp;

    // Record failure if test fails
    if (failThisRun) {
      stats.testRuns[testId].failures++;

      // Pick a random failure pattern
      const failureIndex = Math.floor(
        Math.random() * scenario.failurePatterns.length
      );
      const failureMessage = scenario.failurePatterns[failureIndex];

      // Extract selector from failure message
      const selectorMatch =
        failureMessage.match(/Expected to find element: \`([^`]+)\`/) ||
        failureMessage.match(/find element: \`([^`]+)\`/);
      const selector = selectorMatch ? selectorMatch[1] : undefined;

      // Create failure record
      const failure = {
        testId,
        failureMessage,
        selector,
        timestamp,
        urlAtFailure: selector
          ? "http://localhost:3004/quiz/take?id=mock-quiz-id"
          : undefined,
      };

      stats.failures.push(failure);

      // Update most common failures
      const existingFailure = stats.testRuns[testId].mostCommonFailures.find(
        (f) => f.message === failureMessage
      );

      if (existingFailure) {
        existingFailure.count++;
      } else {
        stats.testRuns[testId].mostCommonFailures.push({
          message: failureMessage,
          count: 1,
        });
      }

      // Sort by frequency
      stats.testRuns[testId].mostCommonFailures.sort(
        (a, b) => b.count - a.count
      );
    }

    // Update failure rate
    stats.testRuns[testId].failureRate =
      stats.testRuns[testId].failures / stats.testRuns[testId].runs;
  }

  return stats;
}

// Main execution
function main() {
  console.log(chalk.bold("Simulating E2E test runs with failure patterns..."));

  ensureLogDirExists();
  let stats = getOrCreateStats();

  // Simulate test runs for each scenario
  TEST_SCENARIOS.forEach((scenario) => {
    console.log(
      chalk.yellow(`Simulating ${scenario.runs} runs for: ${scenario.testId}`)
    );
    console.log(
      `Expected failure rate: ${(scenario.failureRate * 100).toFixed(1)}%`
    );

    stats = simulateTestRun(stats, scenario);

    const actualRate = stats.testRuns[scenario.testId].failureRate;
    console.log(`Actual failure rate: ${(actualRate * 100).toFixed(1)}%`);
    console.log(
      `Failures: ${stats.testRuns[scenario.testId].failures} / ${
        stats.testRuns[scenario.testId].runs
      }`
    );
    console.log("");
  });

  // Save updated stats
  fs.writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2));

  // Summary
  console.log(chalk.green("Simulated test runs successfully saved to:"));
  console.log(STATS_FILE);
  console.log(chalk.green("\nRun the analysis tool to see results:"));
  console.log("npm run test:analyze");
}

main();
