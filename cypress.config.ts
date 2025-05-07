import { defineConfig } from "cypress";
import { loadEnvConfig } from "@next/env";
import * as path from "path";
import * as fs from "fs";

// Load environment variables from .env.test
loadEnvConfig(process.cwd(), true, { info: () => null, error: console.error });

// Test monitoring interfaces
interface FailureRecord {
  testId: string;
  failureMessage?: string;
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

export default defineConfig({
  projectId: process.env.CYPRESS_PROJECT_ID || "inqdoc-tests",

  env: {
    // Define environment variables to use in tests
    mockAuth: true,
    testUser: "test@example.com",
    testPassword: "testpassword123",
    adminUser: "admin@example.com",
    adminPassword: "adminpassword123",
    apiUrl: "http://localhost:3004/api",
  },

  e2e: {
    baseUrl: "http://localhost:3004",
    specPattern: "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
    setupNodeEvents(on, config) {
      // Setup any Node event listeners here
      on("task", {
        log(message) {
          console.log(message);
          return null;
        },
        // Check if a file exists
        fileExists(filePath) {
          if (typeof filePath !== "string") {
            throw new Error("filePath must be a string");
          }

          // Resolve the path relative to the working directory
          const resolvedPath = path.resolve(process.cwd(), filePath);
          return fs.existsSync(resolvedPath);
        },
        // Task for database operations in tests
        async seedDatabase() {
          try {
            // Import the CommonJS module
            // @ts-ignore
            const seedScript = require("./scripts/seed-test-db.js");
            await seedScript.main();
            return true;
          } catch (error) {
            console.error("Failed to seed database:", error);
            return false;
          }
        },
        // Task for recording test runs for monitoring
        recordTestRun({ testId, passed, failureMessage, selector, timestamp }) {
          try {
            console.log(
              `[Test Monitoring] Recording test run: ${testId}, passed: ${passed}`
            );

            const LOG_DIR = path.join(
              process.cwd(),
              "performance_logs",
              "test_monitoring"
            );
            const STATS_FILE = path.join(LOG_DIR, "test_statistics.json");

            // Create directory if it doesn't exist
            if (!fs.existsSync(LOG_DIR)) {
              fs.mkdirSync(LOG_DIR, { recursive: true });
            }

            // Initialize or read statistics
            let stats: TestStatistics;

            if (!fs.existsSync(STATS_FILE)) {
              stats = {
                failures: [],
                testRuns: {},
              };
            } else {
              stats = JSON.parse(fs.readFileSync(STATS_FILE, "utf8"));
            }

            // Initialize test stats if needed
            if (!stats.testRuns[testId]) {
              stats.testRuns[testId] = {
                runs: 0,
                failures: 0,
                lastRun: timestamp,
                failureRate: 0,
                mostCommonFailures: [],
              };
            }

            // Update test run count
            stats.testRuns[testId].runs++;
            stats.testRuns[testId].lastRun = timestamp;

            // Record failure if test failed
            if (!passed && failureMessage) {
              stats.testRuns[testId].failures++;

              // Create failure record
              const failure: FailureRecord = {
                testId,
                failureMessage,
                selector,
                timestamp,
              };

              stats.failures.push(failure);

              // Update most common failures
              const existingFailure = stats.testRuns[
                testId
              ].mostCommonFailures.find((f) => f.message === failureMessage);

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

            // Save updated statistics
            fs.writeFileSync(STATS_FILE, JSON.stringify(stats, null, 2));

            return { success: true, testId };
          } catch (error) {
            console.error("Error recording test run:", error);
            return { success: false, error: String(error) };
          }
        },
      });

      // Return the updated config
      return config;
    },
  },

  component: {
    devServer: {
      framework: "next",
      bundler: "webpack",
    },
    specPattern: "cypress/component/**/*.cy.{js,jsx,ts,tsx}",
  },

  // Configure screenshots and videos
  screenshotsFolder: "cypress/screenshots",
  videosFolder: "cypress/videos",
  video: true,

  // Configure retries and timeouts
  retries: {
    runMode: 2,
    openMode: 0,
  },
  defaultCommandTimeout: 10000,
  pageLoadTimeout: 60000,

  // Configure viewport
  viewportWidth: 1280,
  viewportHeight: 720,

  // Use the @testing-library/cypress commands
  experimentalWebKitSupport: true,
});
