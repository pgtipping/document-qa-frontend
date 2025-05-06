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

// Handle NextAuth URL validation errors globally
Cypress.on("uncaught:exception", (err) => {
  // Return false to prevent Cypress from failing the test
  if (err.message.includes("Failed to construct 'URL'")) {
    return false;
  }
  // We still want to fail the test for other errors
  return true;
});

// Alternatively you can use CommonJS syntax:
// require('./commands')
