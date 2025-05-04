describe("UI Visual Regression Tests", () => {
  beforeEach(() => {
    // Clear any previous session state
    cy.clearLocalStorage();
    cy.clearCookies();

    // Login as test user
    cy.login("test@example.com", "password123");

    // Mock document list
    cy.mockDocumentList();
  });

  it("should maintain proper layout across screen sizes for quiz creation", () => {
    // Mock quiz generation response
    cy.mockQuizGeneration("doc-1", "quiz-visual-test");

    // Go to quiz creation page
    cy.visit("/quiz/new");

    // Test desktop view first (default)
    cy.get("#document-select").should("be.visible");
    cy.get("#quiz-title").should("be.visible");
    cy.get('[data-testid="template-selector"]').should("be.visible");

    // Select a document
    cy.get("#document-select").click();
    cy.contains("Sample Document 1").click();

    // Set quiz title
    cy.get("#quiz-title").type("Visual Regression Test Quiz");

    // Take snapshot for desktop view
    cy.screenshot("quiz-creation-desktop");

    // Test tablet view
    cy.viewport(768, 1024);
    cy.get("#document-select").should("be.visible");
    cy.get("#quiz-title").should("be.visible");
    cy.get('[data-testid="template-selector"]').should("be.visible");
    cy.screenshot("quiz-creation-tablet");

    // Test mobile view
    cy.viewport(375, 667);
    cy.get("#document-select").should("be.visible");
    cy.get("#quiz-title").should("be.visible");
    cy.get('[data-testid="template-selector"]').should("be.visible");
    cy.screenshot("quiz-creation-mobile");
  });

  it("should correctly display quiz results across screen sizes", () => {
    // Mock quiz with different difficulty levels
    cy.fixture("quizzes-with-difficulty.json").then((quizData) => {
      cy.intercept("GET", "/api/quiz/quiz-difficulty-test", {
        statusCode: 200,
        body: quizData[0],
      }).as("getQuizWithDifficulty");
    });

    // Mock quiz results
    cy.mockQuizResults("quiz-difficulty-test");

    // Navigate to quiz results
    cy.visit("/quiz/quiz-difficulty-test/results");
    cy.wait("@getQuizWithDifficulty");

    // Test desktop view
    cy.get("[data-testid='results-summary']").should("be.visible");
    cy.get("[data-testid='question-breakdown']").should("be.visible");
    cy.screenshot("quiz-results-desktop");

    // Test tablet view
    cy.viewport(768, 1024);
    cy.get("[data-testid='results-summary']").should("be.visible");
    cy.get("[data-testid='question-breakdown']").should("be.visible");
    cy.screenshot("quiz-results-tablet");

    // Test mobile view
    cy.viewport(375, 667);
    cy.get("[data-testid='results-summary']").should("be.visible");
    cy.get("[data-testid='question-breakdown']").should("be.visible");
    cy.screenshot("quiz-results-mobile");
  });

  it("should maintain visual consistency of difficulty badges across the application", () => {
    // Visit quiz creation page first
    cy.visit("/quiz/new");

    // Check difficulty badges on quiz creation
    cy.contains("Easy").click();
    cy.get('button[data-difficulty="easy"]').should("have.class", "selected");
    cy.screenshot("difficulty-badge-quiz-creation");

    // Now check difficulty badges on quiz display
    cy.fixture("quizzes-with-difficulty.json").then((quizData) => {
      cy.intercept("GET", "/api/quiz/quiz-difficulty-test", {
        statusCode: 200,
        body: quizData[0],
      }).as("getQuizWithDifficulty");
    });

    cy.visit("/quiz/quiz-difficulty-test");
    cy.wait("@getQuizWithDifficulty");

    // Verify difficulty badges styling is consistent
    cy.get('[data-difficulty="easy"]').should("be.visible");
    cy.get('[data-difficulty="medium"]').should("be.visible");
    cy.get('[data-difficulty="hard"]').should("be.visible");
    cy.screenshot("difficulty-badge-quiz-display");

    // Now check in results view
    cy.mockQuizResults("quiz-difficulty-test");
    cy.visit("/quiz/quiz-difficulty-test/results");

    cy.get('[data-difficulty="easy"]').should("be.visible");
    cy.get('[data-difficulty="medium"]').should("be.visible");
    cy.get('[data-difficulty="hard"]').should("be.visible");
    cy.screenshot("difficulty-badge-quiz-results");
  });

  it("should display loading states and transitions appropriately", () => {
    // Go to quiz creation page
    cy.visit("/quiz/new");

    // Select a document
    cy.get("#document-select").click();
    cy.contains("Sample Document 1").click();

    // Set quiz title
    cy.get("#quiz-title").type("Loading States Test");

    // Create delayed mock to test loading states
    cy.intercept("POST", "/api/quiz/generate", (req) => {
      // Delay the response by 2 seconds to show loading state
      req.reply((res) => {
        res.delay = 2000;
        res.statusCode = 200;
        res.body = {
          quiz: {
            id: "loading-test-quiz",
            title: "Loading States Test",
            questions: [
              {
                id: "q1",
                type: "multiple_choice",
                question: "Test question?",
                options: ["Option 1", "Option 2", "Option 3", "Option 4"],
                correctAnswerIndex: 0,
                difficulty: "medium",
              },
            ],
          },
        };
      });
    }).as("generateQuizDelayed");

    // Submit form and capture loading state
    cy.get("form").submit();

    // Verify loading indicator appears
    cy.get("[data-testid='loading-indicator']").should("be.visible");
    cy.screenshot("quiz-generation-loading");

    // Wait for response and verify loading indicator disappears
    cy.wait("@generateQuizDelayed");
    cy.get("[data-testid='loading-indicator']").should("not.exist");

    // Should redirect to the quiz page
    cy.url().should("include", "/quiz/loading-test-quiz");
  });

  it("should display template preview with consistent styling", () => {
    // Go to quiz creation page
    cy.visit("/quiz/new");

    // Open template selection
    cy.get('[data-testid="template-selector"]').click();

    // Check styling of template cards
    cy.contains("Academic Template").should("be.visible");
    cy.contains("Technical Template").should("be.visible");
    cy.screenshot("template-selection-view");

    // Select Technical Template
    cy.contains("Technical Template").click();

    // Template preview should be visible with consistent styling
    cy.get('[data-testid="template-preview"]').should("be.visible");
    cy.screenshot("template-preview-view");

    // Test responsive behavior
    cy.viewport(768, 1024);
    cy.get('[data-testid="template-preview"]').should("be.visible");
    cy.screenshot("template-preview-tablet");

    cy.viewport(375, 667);
    cy.get('[data-testid="template-preview"]').should("be.visible");
    cy.screenshot("template-preview-mobile");
  });
});
