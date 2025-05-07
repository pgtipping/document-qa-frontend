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
// Import test monitoring for automatic failure tracking
import "./test-monitoring";

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

// Add custom error tracking for flaky test detection
Cypress.on("fail", (error, runnable) => {
  // Record detailed error information for analysis
  const testId = `${runnable.parent?.title || "unknown"} - ${runnable.title}`;
  const selector =
    error.message.match(
      /Timed out retrying after .* to find element: \[(.+?)\]/
    )?.[1] || error.message.match(/Expected to find element: \[(.+?)\]/)?.[1];

  cy.recordTestRun(testId, false, error.message, selector);

  // Re-throw the error to fail the test normally
  throw error;
});

// Automatically track successful tests as well
Cypress.Commands.overwrite("should", function (originalFn, subject, ...args) {
  // Call the original function
  return originalFn(subject, ...args);
});

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Document fixtures are created in individual tests as needed
