# InQDoc Cypress E2E Testing - 2025-05-04 15:46:05 EDT

This directory contains end-to-end tests for the InQDoc frontend application using Cypress. The tests simulate real user interactions to verify the application's behavior in a realistic environment.

## Directory Structure - 2025-05-04 15:46:05 EDT

```
cypress/
├── e2e/                 # Test specifications
├── fixtures/            # Test data
├── support/             # Support files (commands, utilities)
├── screenshots/         # Captured screenshots (gitignored)
├── videos/              # Recorded videos (gitignored)
├── downloads/           # Downloaded files during tests (gitignored)
├── cypress.config.js    # Cypress configuration
└── tsconfig.json        # TypeScript configuration for Cypress
```

## Current Test Coverage - 2025-05-04 15:46:05 EDT

### Authentication Flows

- `auth-flows.cy.ts` - Tests user registration, login, and logout processes
- `admin-auth.cy.ts` - Tests admin-specific authentication flows

### Document Management

- `document-management.cy.ts` - Tests document upload, listing, and deletion
- `document-selection.cy.ts` - Tests multi-document selection for chat context

### Chat Interface

- `chat-basic.cy.ts` - Tests basic question answering functionality
- `chat-history.cy.ts` - Tests chat history persistence and navigation

### Quiz Functionality

- `quiz-flow.cy.ts` - Tests the end-to-end quiz generation and taking process
- `quiz-sharing.cy.ts` - Tests quiz result sharing functionality
- `quiz-templates-difficulty.cy.ts` - Tests template selection and difficulty levels
- `quiz-templates-advanced.cy.ts` - Advanced tests for template-difficulty integration
- `quiz-visual-regression.cy.ts` - Visual regression tests for quiz UI components

### Visual Regression

- `ui-visual-regression.cy.ts` - General UI visual regression tests

## Recent Additions - 2025-05-04 15:46:05 EDT

- **Quiz Templates Advanced Testing**

  - Integration between templates and difficulty levels
  - Template-specific question distribution verification
  - Difficulty level distribution testing
  - Template recommendation algorithm verification

- **Visual Regression Testing**
  - Consistent visual appearance for difficulty badges
  - Responsive layout testing across device sizes
  - Template selection UI consistency

## Custom Commands - 2025-05-04 15:46:05 EDT

This project extends Cypress with custom commands for common operations:

- `cy.login(email, password)` - Authenticate a user
- `cy.logout()` - Log out the current user
- `cy.mockDocumentList()` - Mock the document list API response
- `cy.mockQuizGeneration(documentId, quizId)` - Mock quiz generation API
- `cy.selectDocuments(documentIds)` - Select documents in the document list

## Test Fixtures - 2025-05-04 15:46:05 EDT

The `fixtures/` directory contains test data used in the tests:

- `users.json` - Test user credentials
- `documents.json` - Sample document metadata
- `quizzes.json` - Sample quiz data
- `quiz-questions.json` - Sample quiz questions
- `quizzes-with-difficulty.json` - Quiz data including difficulty levels
- `quizzes-advanced.json` - Advanced quiz data with templates and difficulty

## Running Tests - 2025-05-04 15:46:05 EDT

### Local Testing

```bash
# Install dependencies
npm install

# Open Cypress Test Runner (interactive mode)
npm run cy:open

# Run all Cypress tests headlessly
npm run cy:run

# Run a specific test file
npx cypress run --spec "cypress/e2e/quiz-templates-advanced.cy.ts"

# Run tests and serve the app in a single command
npm run test:e2e
```

### CI/CD Testing

```bash
# Run E2E tests in CI environment
npm run test:e2e:ci
```

## Best Practices - 2025-05-04 15:46:05 EDT

When writing Cypress tests, follow these guidelines:

1. **Test Organization**

   - One test file per user flow or feature
   - Use descriptive `describe` and `it` blocks
   - Group related tests in nested `describe` blocks

2. **Test Independence**

   - Each test should be independent of others
   - Reset state between tests using `beforeEach`
   - Don't rely on the state from previous tests

3. **Mocking & Fixtures**

   - Use fixtures for test data
   - Mock API responses for controlled testing
   - Intercept network requests with `cy.intercept()`

4. **Selectors & Commands**

   - Use data attributes for test selectors (`data-testid`)
   - Create custom commands for repeated actions
   - Avoid hardcoding timeouts, use `cy.wait()` with aliases

5. **Assertions**
   - Use explicit assertions to verify expected behavior
   - Check both UI state and application state
   - Verify critical elements before interacting with them

## Next Steps - 2025-05-04 15:46:05 EDT

1. **Cypress Cloud Integration**

   - Configure Cypress Cloud for test recording
   - Set up CI integration with GitHub Actions
   - Implement parallel test execution

2. **Test Coverage Expansion**

   - Add accessibility testing with axe-core
   - Implement mobile viewport testing
   - Enhance error path coverage
   - Add performance testing with Lighthouse CI

3. **Test Optimization**
   - Improve test execution speed
   - Implement better test isolation
   - Enhance test fixture management

## Resources - 2025-05-04 15:46:05 EDT

- [Cypress Documentation](https://docs.cypress.io/)
- [Cypress Best Practices](https://docs.cypress.io/guides/references/best-practices)
- [Cypress GitHub Actions Integration](https://docs.cypress.io/guides/continuous-integration/github-actions)
- [Cypress Cloud](https://www.cypress.io/cloud/)
