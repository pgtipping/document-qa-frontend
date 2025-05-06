# InQDoc Testing Guide

_Created: 2025-05-05 20:11:10 EDT_

This guide provides comprehensive instructions for setting up and running tests in the InQDoc frontend application. It covers both component tests and end-to-end (E2E) tests.

## Table of Contents

1. [Component Testing](#component-testing)
2. [E2E Testing](#e2e-testing)
3. [Test Environment Setup](#test-environment-setup)
4. [Continuous Integration](#continuous-integration)
5. [Common Issues](#common-issues)
6. [Best Practices](#best-practices)

## Component Testing

Component tests are implemented using Jest and React Testing Library. They focus on testing individual components in isolation.

### Running Component Tests

```bash
# Run all component tests
npm test

# Run a specific component test
npm test -- __tests__/components/QuizGenerator.test.tsx

# Run tests with coverage
npm test -- --coverage
```

### Component Test Structure

Component tests are located in the `__tests__/components` directory and are organized to mirror the component structure in `src/components`.

### Mock Components

To isolate components during testing, we've created mocks for various UI and utility components. These mocks are defined in:

- `__tests__/mocks/ui-components.tsx` - For UI component mocks
- `__tests__/jestSetup.js` - For global mocks and setup

## E2E Testing

E2E tests are implemented using Cypress. They test full user flows through the application.

### Prerequisites

1. Database must be properly migrated and seeded with test data
2. Server must be running on port 3004

### Running E2E Tests

```bash
# Start the development server on port 3004
npx next dev -p 3004

# In a separate terminal, run all E2E tests
npm run cy:run

# Run a specific E2E test
npm run cy:run -- --spec "cypress/e2e/auth-flows.cy.ts"

# Open Cypress Test Runner for interactive testing
npm run cy:open
```

### E2E Test Structure

E2E tests are located in the `cypress/e2e` directory and are organized by feature or user flow.

## Test Environment Setup

### Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed test database
node scripts/seed-test-db.js
```

### Environment Variables

The following environment variables are required for testing:

- `DATABASE_URL` - Connection string for the test database
- `NEXTAUTH_SECRET` - Secret for NextAuth authentication
- `AWS_S3_BUCKET` - S3 bucket for document storage
- Additional API keys for third-party services

## Continuous Integration

GitHub Actions workflows are configured to run tests automatically on push and pull requests.

### CI Workflow

1. Setup Node.js environment
2. Install dependencies
3. Setup test database
4. Run component tests
5. Run E2E tests
6. Report test results

## Common Issues

### Component Test Issues

- **Jest DOM Type Errors:** Ensure proper type definitions are imported
- **UI Component Mocks:** Check that all required UI components are properly mocked
- **Authentication in Tests:** Use the SessionProvider mock for authenticated components

### E2E Test Issues

- **Server Port Mismatch:** Ensure the server is running on port 3004 as expected by Cypress
- **Database Not Seeded:** Run the seed script before starting tests
- **Auth Failures:** Check that the test users exist in the database
- **Selector Issues:** Verify that elements have correct data attributes or name attributes

## Best Practices

- Use data-testid attributes for reliable element selection
- Keep tests focused on behavior, not implementation details
- Avoid testing third-party libraries
- Use centralized mock components for consistency
- Ensure proper test isolation and cleanup

---

_This documentation is a work in progress and will be expanded with more details and examples in future updates._

# InQDoc Testing Strategy - 2025-05-04 15:46:05 EDT

This directory contains tests for the InQDoc frontend application. The testing strategy follows a comprehensive approach combining component testing, integration testing, and end-to-end testing to ensure the application meets functional requirements and maintains a high level of quality.

## Testing Architecture - 2025-05-04 15:46:05 EDT

The testing architecture consists of:

1. **Component Tests** - Using Jest and React Testing Library

   - Located in `__tests__/components/`
   - Test individual React components in isolation
   - Mock dependencies and external services
   - Verify component behavior and rendering

2. **End-to-End Tests** - Using Cypress

   - Located in `cypress/e2e/`
   - Test complete user flows from start to finish
   - Simulate real user interactions
   - Verify application behavior in a realistic environment

3. **Visual Regression Tests** - Using Cypress and Percy
   - Located in `cypress/e2e/` with visual testing commands
   - Ensure UI appearance remains consistent across changes
   - Capture and compare screenshots of key UI elements
   - Detect unintended visual changes

## Current Test Coverage - 2025-05-04 15:46:05 EDT

### Component Tests

- **Quiz Component Tests**
  - ✅ Template selector component
  - ✅ Template preview component
  - ✅ Difficulty selection controls
  - ⏳ Quiz generation form (in progress)
  - ⏳ Quiz results display (in progress)

### End-to-End Tests

- **Authentication**

  - ✅ User registration
  - ✅ User login
  - ✅ Password reset
  - ✅ Authentication persistence

- **Document Management**

  - ✅ Document upload
  - ✅ Document listing
  - ✅ Document deletion
  - ✅ Document selection

- **Chat Interface**

  - ✅ Basic question answering
  - ✅ Chat history
  - ⏳ Error handling (in progress)

- **Quiz Features**
  - ✅ Basic quiz generation
  - ✅ Quiz taking flow
  - ✅ Quiz results viewing
  - ✅ Template selection
  - ✅ Difficulty selection
  - ⏳ Advanced template testing (in progress)
  - ⏳ Difficulty distribution testing (in progress)

## Next Test Implementation - 2025-05-04 15:46:05 EDT

1. **Component Tests**

   - Add accessibility testing using axe-core
   - Create more comprehensive snapshot tests
   - Implement error state testing
   - Add tests for loading states

2. **End-to-End Tests**

   - Add performance testing using Lighthouse CI
   - Implement visual regression testing for all key flows
   - Add mobile viewport testing
   - Enhance error path coverage

3. **Infrastructure Improvements**
   - Set up Cypress Cloud for dashboard reporting
   - Integrate with GitHub Actions for CI/CD
   - Configure automated test reporting
   - Implement code coverage tracking

## Getting Started - 2025-05-04 15:46:05 EDT

To run the tests locally:

```bash
# Install dependencies
npm install

# Run component tests
npm run test:component

# Run all tests with coverage
npm run test:coverage

# Run end-to-end tests
npm run test:e2e

# Open Cypress Test Runner
npm run cy:open
```

## Test Structure Best Practices - 2025-05-04 15:46:05 EDT

When adding new tests, follow these guidelines:

1. **Component Tests**

   - One test file per component
   - Use descriptive test names following the pattern: "should [expected behavior] when [condition]"
   - Mock external dependencies
   - Focus on component behavior, not implementation details
   - Test both success and error states

2. **End-to-End Tests**
   - Organize by user flow or feature
   - Use custom Cypress commands for common operations
   - Implement proper test isolation
   - Use realistic test data
   - Handle asynchronous operations properly

## Contributing to Tests - 2025-05-04 15:46:05 EDT

When adding new tests:

1. Ensure they follow the structure and naming conventions of existing tests
2. Add appropriate mocks for external dependencies
3. Include both happy path and error path testing
4. Verify tests run successfully locally before committing
5. Update this README with new test coverage information

## Resources - 2025-05-04 15:46:05 EDT

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Cypress Documentation](https://docs.cypress.io/)
- [Testing Library Best Practices](https://testing-library.com/docs/dom-testing-library/api-queries/)

## Testing Strategy Analysis - 2025-05-04 23:16:59

This section explains our testing strategy and the relationship between different testing tools in our ecosystem.

### Testing Pyramid

We follow the industry-standard testing pyramid with:

1. **Many Unit/Component Tests** (Jest)

   - Fast, focused tests for individual components
   - Quick feedback during development
   - Pinpoint exact component failures
   - Living documentation of component behavior

2. **Some Integration Tests** (Jest)

   - Test multiple components working together
   - Verify component interactions
   - Identify integration issues

3. **Fewer E2E Tests** (Cypress/Playwright)

   - Test complete user flows
   - Verify application behavior in a real browser
   - Simulate real user interactions

4. **Performance/Accessibility Tests** (Lighthouse)
   - Measure performance metrics
   - Ensure accessibility compliance
   - Verify SEO and best practices

### Tool Synergy and Distinct Purposes

Each testing tool serves a specific purpose in our comprehensive testing strategy:

#### Jest Tests (Unit/Component/Integration)

- **Purpose:** Verify component rendering and behavior in isolation
- **Strengths:**
  - Fast execution (milliseconds)
  - Precise failure identification
  - Easy mocking of dependencies
  - Excellent for regression testing
- **Limitations:**
  - Cannot test browser-specific behavior
  - Mock-heavy approach may miss integration issues

#### Cypress Tests (E2E)

- **Purpose:** Verify complete user flows and browser integration
- **Strengths:**
  - Real browser testing
  - Visual test execution and recording
  - Network request interception
  - Time travel debugging
- **Limitations:**
  - Slower execution (seconds)
  - Higher maintenance cost
  - Limited cross-browser testing

#### Playwright Tests (Cross-browser E2E)

- **Purpose:** Ensure cross-browser compatibility
- **Strengths:**
  - Excellent cross-browser support (Chromium, Firefox, WebKit)
  - Modern browser API testing
  - Mobile emulation capabilities
- **Limitations:**
  - Overlap with Cypress functionality
  - Additional tool to maintain

#### Lighthouse Tests (Quality Metrics)

- **Purpose:** Measure performance, accessibility, SEO, and best practices
- **Strengths:**
  - Standardized quality metrics
  - Actionable improvement suggestions
  - Integration with CI/CD pipelines
- **Limitations:**
  - Only measures specific quality aspects
  - Doesn't test application functionality

### Balancing Test Types

While there is some overlap between these testing approaches, each serves a distinct purpose in our comprehensive quality strategy:

1. **Development Speed vs. Coverage:**

   - Component tests provide quick feedback during development
   - E2E tests ensure complete user flows work in a real environment

2. **Isolation vs. Integration:**

   - Component tests verify isolated functionality
   - E2E tests verify the application as a whole

3. **Implementation vs. Behavior:**
   - Component tests focus on implementation details
   - E2E tests focus on user-facing behavior

### Recommendations for Test Coverage

For optimal test coverage with minimal duplication:

1. **Component Tests:**

   - Focus on complex business logic
   - Test edge cases and error states
   - Cover reusable components thoroughly

2. **E2E Tests:**

   - Focus on critical user journeys
   - Test authentication and core features
   - Cover happy paths and basic error scenarios

3. **Performance/Accessibility:**
   - Test key landing pages
   - Verify critical user flows meet performance targets
   - Ensure accessibility compliance

This balanced approach ensures comprehensive coverage while minimizing test duplication and maintenance costs.

# Component Testing Guide

## Overview

This directory contains tests for the document-qa-frontend components. The tests use Jest and React Testing Library to verify component behavior and ensure proper rendering.

## Test Setup

The test environment is configured with:

- **Jest**: Testing framework
- **React Testing Library**: DOM testing utilities
- **Jest DOM**: Custom DOM matchers for assertions

## Key Files

- `jestSetup.js`: Main setup file that configures Jest, mocks, and global setup
- `template-test-example.test.jsx`: Example test showing the correct testing patterns
- `mocks/`: Directory containing mock implementations for UI components

## Running Tests

```bash
# Run all tests
npm test

# Run tests for a specific file
npm test -- __tests__/components/quiz/QuizDisplay.test.tsx

# Run tests with coverage
npm test -- --coverage
```

## Best Practices

### Component Testing

1. **Use data-testid attributes** for element selection:

   ```tsx
   <button data-testid="submit-button">Submit</button>
   ```

2. **Test user interactions** as they would happen in the browser:

   ```tsx
   fireEvent.click(screen.getByTestId("submit-button"));
   ```

3. **Use appropriate assertions** based on what the user would see:

   ```tsx
   expect(screen.getByText("Success")).toBeInTheDocument();
   ```

4. **Mock dependencies** to isolate component testing:
   ```tsx
   jest.mock("@/components/ui/button", () => ({
     Button: ({ children, ...props }) => (
       <button data-testid="mock-button" {...props}>
         {children}
       </button>
     ),
   }));
   ```

### Accessibility Testing

1. **Test ARIA attributes** for proper values:

   ```tsx
   expect(element).toHaveAttribute("aria-labelledby", "heading-id");
   ```

2. **Use proper ARIA roles** in mocked components:

   ```tsx
   <div role="tablist">
     <button role="tab" aria-selected="true">
       Tab 1
     </button>
   </div>
   ```

3. **Test keyboard interaction** for interactive elements:
   ```tsx
   fireEvent.keyDown(element, { key: "Enter" });
   ```

## Common Issues and Solutions

### ARIA Role Warnings

ARIA roles have strict parent-child relationships. When mocking components:

1. TabsList must contain at least one TabsTrigger component
2. TabsTrigger must be within a TabsList component
3. Use string literals for aria-\* attributes (not expressions):

   ```tsx
   // Correct
   aria-selected="true"

   // Incorrect (causes warnings)
   aria-selected={isSelected ? "true" : "false"}
   ```

### TypeScript Errors with Custom Matchers

If you encounter TypeScript errors with Jest DOM matchers:

1. Ensure `jestSetup.js` is in your Jest configuration
2. Import `@testing-library/jest-dom` in your test file
3. Use JavaScript (.jsx/.js) for test files if TypeScript issues persist

## Example Test Pattern

```tsx
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";

describe("ComponentName", () => {
  // Setup mocks before tests
  beforeEach(() => {
    // Mock dependencies
  });

  it("renders correctly", () => {
    render(<ComponentName />);
    expect(screen.getByText("Expected Text")).toBeInTheDocument();
  });

  it("handles user interaction", () => {
    const handleAction = jest.fn();
    render(<ComponentName onAction={handleAction} />);

    fireEvent.click(screen.getByTestId("action-button"));
    expect(handleAction).toHaveBeenCalled();
  });
});
```

## Additional Resources

- [React Testing Library Docs](https://testing-library.com/docs/react-testing-library/intro/)
- [Jest DOM Matchers](https://github.com/testing-library/jest-dom)
- [Accessibility Testing with Jest](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Roles)

# Test Suite Documentation

## Overview

This directory contains test files for the document-qa-frontend application. Tests are organized by component type and feature area, with a focus on proper component mocking and comprehensive test coverage.

## Test Structure

- `__tests__/api/` - API endpoint and data fetching tests
- `__tests__/components/` - React component tests
  - `__tests__/components/quiz/` - Quiz feature components
- `__tests__/helpers/` - Test helper functions
- `__tests__/lib/` - Library function tests
- `__tests__/mocks/` - Mock implementations used across tests
- `__tests__/utils/` - Utility function tests

## Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test -- __tests__/components/quiz/QuizResults.test.tsx

# Run tests with a specific pattern
npm test -- --testPathPattern="__tests__/components/quiz"

# Run tests with coverage
npm test -- --coverage
```

## Key Testing Patterns

### Component Mocking

We use a standardized approach to mock UI components:

1. Create mock implementations in the `__tests__/mocks/` directory
2. Import these mocks in your test files
3. Mock the actual component imports using Jest's `jest.mock()`
4. Ensure all mocks have proper ARIA attributes and data-testid values

Example:

```tsx
// Import mock components
import { Button, Card, CardContent } from "../../mocks/ui-components";

// Mock the actual components
jest.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button
      onClick={onClick}
      {...props}
      data-testid="mock-button"
      type={props.type || "button"}
    >
      {children}
    </button>
  ),
}));
```

### Testing UI Components

When testing UI components:

1. Use data-testid attributes for stable element selection
2. Test different component states (loading, error, success)
3. Test user interactions using fireEvent
4. Verify accessibility attributes
5. Test component props and their effects

Example:

```tsx
it("renders high score results correctly", () => {
  render(<QuizResults score={8} totalQuestions={10} correctAnswers={8} />);

  // Check score display
  expect(screen.getByTestId("score-badge")).toHaveTextContent("80%");

  // Check accessibility attributes
  const resultsRegion = screen.getByTestId("quiz-results");
  expect(resultsRegion).toHaveAttribute("role", "region");
  expect(resultsRegion).toHaveAttribute(
    "aria-labelledby",
    "quiz-results-title"
  );
});
```

### Handling Asynchronous Tests

For tests with asynchronous operations:

1. Use `async/await` with the test function
2. Utilize `waitFor` to wait for elements to appear
3. Mock API responses with `jest.mock` and `mockResolvedValue`

Example:

```tsx
it("loads data asynchronously", async () => {
  render(<AsyncComponent />);

  // Check loading state
  expect(screen.getByTestId("loading-indicator")).toBeInTheDocument();

  // Wait for data to load
  await waitFor(() => {
    expect(screen.getByText("Data Loaded")).toBeInTheDocument();
  });
});
```

## TypeScript Support

Our tests use TypeScript with proper type definitions. If you encounter type issues with Jest matchers:

1. Ensure you're importing `@testing-library/jest-dom` in your test file
2. TypeScript definitions for Jest DOM matchers are available in `src/types/jest-dom.d.ts`
3. The tsconfig.json includes these type definitions

## Testing Best Practices

1. **Keep tests focused**: Each test should verify a single aspect of behavior
2. **Use descriptive test names**: Clearly describe what's being tested
3. **Follow AAA pattern**: Arrange, Act, Assert
4. **Use data-testid attributes**: Avoid relying on text content or CSS classes
5. **Mock external dependencies**: Don't rely on external services in unit tests
6. **Test error states**: Ensure components handle errors gracefully
7. **Check accessibility**: Verify ARIA attributes and keyboard navigation
8. **Organize tests logically**: Group related tests together

## Common Issues and Solutions

### TypeScript Linter Errors with Jest Matchers

If you see errors like `Property 'toBeInTheDocument' does not exist on type 'Assertion'`:

1. Ensure you're importing `@testing-library/jest-dom`
2. Check that `src/types/jest-dom.d.ts` is included in tsconfig.json
3. Try running the test despite the linter error, as it may work at runtime

### Component Import Errors

If you see errors like `Element type is invalid: expected a string (for built-in components) or a class/function (for composite components) but got: undefined`:

1. Check your mocks to ensure all required components are properly mocked
2. Verify that you're mocking the correct import path
3. Make sure there are no circular dependencies in your component imports

### Test Environment Setup

If you need to modify the test environment:

1. Check and update `jest.config.js` for global configuration
2. Use `jest.setTimeout()` if tests need more time to run
3. Add necessary setup code to `__tests__/jestSetup.js`
