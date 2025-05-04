import { defineConfig } from "cypress";
import { loadEnvConfig } from "@next/env";
import * as path from "path";

// Load environment variables from .env.test
loadEnvConfig(process.cwd(), true, { info: () => null, error: console.error });

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
        // Task for database operations in tests
        async seedDatabase() {
          try {
            // Import the seed function dynamically
            const { default: seedTestDatabase } = await import(
              "./scripts/seed-test-db"
            );
            await seedTestDatabase();
            return true;
          } catch (error) {
            console.error("Failed to seed database:", error);
            return false;
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
