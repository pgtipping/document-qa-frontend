#!/usr/bin/env node

/**
 * Test Failure Analysis Tool
 *
 * This script analyzes test failures collected during Cypress test runs
 * and provides recommendations for fixing flaky tests.
 *
 * Usage: node analyze-test-failures.js
 *
 * PRIVATE TOOL - For developer use only
 */

const fs = require("fs");
const path = require("path");
const chalk = require("chalk");

// Configuration
const STATS_DIR = path.join(
  __dirname,
  "..",
  "performance_logs",
  "test_monitoring"
);
const STATS_FILE = path.join(STATS_DIR, "test_statistics.json");
const CYPRESS_DIR = path.join(__dirname, "..", "cypress");
const MIN_RUNS = 3;
const FLAKY_THRESHOLD = 0.2; // 20% failure rate is considered flaky

// Helper functions
function getStatistics() {
  if (!fs.existsSync(STATS_FILE)) {
    console.error(chalk.red("No test statistics found. Run some tests first."));
    process.exit(1);
  }

  try {
    return JSON.parse(fs.readFileSync(STATS_FILE, "utf8"));
  } catch (error) {
    console.error(chalk.red("Failed to parse statistics file:"), error);
    process.exit(1);
  }
}

function findFlakyTests(stats) {
  return Object.entries(stats.testRuns)
    .filter(
      ([_, data]) =>
        data.runs >= MIN_RUNS && data.failureRate >= FLAKY_THRESHOLD
    )
    .sort((a, b) => b[1].failureRate - a[1].failureRate);
}

function findSelectors(failures) {
  // Extract selectors from failure messages
  const selectors = new Set();

  failures.forEach((failure) => {
    const selectorMatches = [
      failure.failureMessage?.match(
        /Timed out retrying after .* to find element: \[(.+?)\]/
      ),
      failure.failureMessage?.match(/Expected to find element: \[(.+?)\]/),
      failure.failureMessage?.match(
        /Syntax error, unrecognized expression: (.+?)$/
      ),
    ];

    selectorMatches.forEach((match) => {
      if (match && match[1]) {
        selectors.add(match[1]);
      }
    });

    // Also add explicit selectors
    if (failure.selector) {
      selectors.add(failure.selector);
    }
  });

  return Array.from(selectors);
}

function analyzeSelectorUsage(selectors) {
  const selectorStats = {};

  // Find all Cypress test files
  const testFiles = findCypressTestFiles();

  // Check each selector's usage
  selectors.forEach((selector) => {
    selectorStats[selector] = {
      occurrences: 0,
      files: [],
    };

    testFiles.forEach((file) => {
      const content = fs.readFileSync(file, "utf8");
      const regex = new RegExp(escapeRegExp(selector), "g");
      const matches = content.match(regex);

      if (matches) {
        selectorStats[selector].occurrences += matches.length;
        selectorStats[selector].files.push(file);
      }
    });
  });

  return selectorStats;
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function findCypressTestFiles() {
  const files = [];

  function traverseDir(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    entries.forEach((entry) => {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        traverseDir(fullPath);
      } else if (
        entry.isFile() &&
        (fullPath.endsWith(".cy.ts") ||
          fullPath.endsWith(".cy.js") ||
          fullPath.endsWith(".spec.ts") ||
          fullPath.endsWith(".spec.js"))
      ) {
        files.push(fullPath);
      }
    });
  }

  traverseDir(CYPRESS_DIR);
  return files;
}

function checkComponentSelectors(selectors) {
  const componentDir = path.join(__dirname, "..", "src", "components");
  const results = {};

  // Find all component files
  const componentFiles = [];

  function traverseDir(dir) {
    if (!fs.existsSync(dir)) return;

    const entries = fs.readdirSync(dir, { withFileTypes: true });

    entries.forEach((entry) => {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        traverseDir(fullPath);
      } else if (
        entry.isFile() &&
        (fullPath.endsWith(".tsx") || fullPath.endsWith(".jsx"))
      ) {
        componentFiles.push(fullPath);
      }
    });
  }

  traverseDir(componentDir);

  // Check if data-testid selectors exist in components
  selectors.forEach((selector) => {
    // Skip selectors that aren't data-testid selectors
    if (!selector.includes("data-testid")) return;

    const testId =
      selector.match(/data-testid=['"]([^'"]+)['"]/)?.[1] ||
      selector.match(/data-testid=([^\s>]+)/)?.[1];

    if (!testId) return;

    results[testId] = {
      found: false,
      files: [],
    };

    componentFiles.forEach((file) => {
      const content = fs.readFileSync(file, "utf8");

      if (
        content.includes(`data-testid="${testId}"`) ||
        content.includes(`data-testid='${testId}'`)
      ) {
        results[testId].found = true;
        results[testId].files.push(file);
      }
    });
  });

  return results;
}

function generateRecommendations(flakyTests, stats) {
  const recommendations = [];

  if (flakyTests.length === 0) {
    console.log(chalk.green("No flaky tests detected. Great job!"));
    return [];
  }

  // Get all failure records for flaky tests
  const relevantFailures = stats.failures.filter((failure) =>
    flakyTests.some(([testId, _]) => failure.testId === testId)
  );

  // Find problematic selectors
  const selectors = findSelectors(relevantFailures);
  const selectorStats = analyzeSelectorUsage(selectors);
  const componentSelectors = checkComponentSelectors(selectors);

  // Generate recommendations
  flakyTests.forEach(([testId, data]) => {
    const testFailures = relevantFailures.filter(
      (failure) => failure.testId === testId
    );
    const testSelectors = findSelectors(testFailures);

    let recommendation = {
      testId,
      failureRate: data.failureRate,
      runs: data.runs,
      failures: data.failures,
      issues: [],
      fixes: [],
    };

    // Analyze failure patterns
    const selectorIssues = testSelectors.filter(
      (selector) =>
        componentSelectors[
          selector.match(/data-testid=['"]([^'"]+)['"]/)?.[1]
        ] &&
        !componentSelectors[selector.match(/data-testid=['"]([^'"]+)['"]/)?.[1]]
          .found
    );

    const timeoutIssues = testFailures.some(
      (failure) =>
        failure.failureMessage?.includes("timeout") ||
        failure.failureMessage?.includes("timed out")
    );

    const navigationIssues = testFailures.some(
      (failure) =>
        failure.failureMessage?.includes("navigation") ||
        failure.failureMessage?.includes("route") ||
        failure.failureMessage?.includes("visit")
    );

    // Add identified issues
    if (selectorIssues.length > 0) {
      recommendation.issues.push({
        type: "selector",
        description: "Missing or incorrect selectors",
        details: `Test uses selectors that don't exist in components: ${selectorIssues.join(
          ", "
        )}`,
      });

      recommendation.fixes.push(
        "Add missing data-testid attributes to components",
        "Update selectors in tests to match component attributes",
        "Consider using more resilient selector strategies with fallbacks"
      );
    }

    if (timeoutIssues) {
      recommendation.issues.push({
        type: "timeout",
        description: "Test timing issues",
        details:
          "Test fails with timeout errors, suggesting race conditions or slow loading",
      });

      recommendation.fixes.push(
        "Add explicit waits with cy.waitForQuizLoad() or cy.wait()",
        "Increase command timeout for problematic tests",
        "Check for loading states and wait for them to resolve"
      );
    }

    if (navigationIssues) {
      recommendation.issues.push({
        type: "navigation",
        description: "Navigation-related failures",
        details: "Test fails during navigation between pages or components",
      });

      recommendation.fixes.push(
        "Ensure navigation completes before running assertions",
        "Add explicit wait for route changes",
        "Use cy.location() to verify URL changes before proceeding"
      );
    }

    // If no specific issues found, add general recommendations
    if (recommendation.issues.length === 0) {
      recommendation.issues.push({
        type: "general",
        description: "General flakiness",
        details: "Test fails inconsistently without clear pattern",
      });

      recommendation.fixes.push(
        "Add more explicit waits and retry logic",
        "Simplify test to focus on one functionality",
        "Check for interfering state between tests"
      );
    }

    recommendations.push(recommendation);
  });

  return recommendations;
}

function printRecommendations(recommendations) {
  console.log(chalk.bold("\nTest Failure Analysis Results"));
  console.log(chalk.bold("==============================\n"));

  if (recommendations.length === 0) {
    console.log(
      chalk.green("All tests are stable. No recommendations needed.")
    );
    return;
  }

  console.log(chalk.yellow(`Found ${recommendations.length} flaky tests:`));

  recommendations.forEach((rec, index) => {
    console.log(chalk.bold(`\n${index + 1}. ${rec.testId}`));
    console.log(
      chalk.red(
        `   Failure Rate: ${(rec.failureRate * 100).toFixed(1)}% (${
          rec.failures
        }/${rec.runs} runs)`
      )
    );

    console.log(chalk.bold("\n   Issues:"));
    rec.issues.forEach((issue) => {
      console.log(`   • ${chalk.yellow(issue.description)}`);
      console.log(`     ${issue.details}`);
    });

    console.log(chalk.bold("\n   Recommended Fixes:"));
    rec.fixes.forEach((fix) => {
      console.log(`   • ${chalk.green(fix)}`);
    });

    console.log(chalk.gray("\n   ------------------------------"));
  });

  console.log(chalk.bold("\nSummary:"));
  console.log(
    `Total Tests Analyzed: ${recommendations.reduce(
      (sum, rec) => sum + rec.runs,
      0
    )}`
  );
  console.log(
    `Total Failures: ${recommendations.reduce(
      (sum, rec) => sum + rec.failures,
      0
    )}`
  );

  const issueTypes = new Set(
    recommendations.flatMap((rec) => rec.issues.map((i) => i.type))
  );
  console.log(`\nCommon Issue Types: ${Array.from(issueTypes).join(", ")}`);

  console.log(chalk.bold("\nGeneral Recommendations:"));
  console.log(
    chalk.green(
      "• Add data-testid attributes consistently to all interactive elements"
    )
  );
  console.log(
    chalk.green("• Use waitForQuizLoad or explicit waits for async operations")
  );
  console.log(chalk.green("• Consider running problematic tests in isolation"));
}

// Main function
function main() {
  try {
    console.log(chalk.bold("Analyzing test failures..."));

    const stats = getStatistics();
    const flakyTests = findFlakyTests(stats);
    const recommendations = generateRecommendations(flakyTests, stats);

    printRecommendations(recommendations);
  } catch (error) {
    console.error(chalk.red("Error analyzing test failures:"), error);
    process.exit(1);
  }
}

// Run the script
main();
