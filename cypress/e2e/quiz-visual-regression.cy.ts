describe("Quiz Templates and Difficulty Visual Regression", () => {
  beforeEach(() => {
    // Clear any previous session state
    cy.clearLocalStorage();
    cy.clearCookies();

    // Login as test user
    cy.login("test@example.com", "password123");

    // Mock document list
    cy.mockDocumentList();
  });

  it("should maintain consistent visual styles for difficulty badges across different views", () => {
    // Mock quiz with different difficulty levels
    cy.fixture("quizzes-advanced.json").then((quizData) => {
      cy.intercept("GET", "/api/quiz/quiz-template-difficulty-integration", {
        statusCode: 200,
        body: quizData[0],
      }).as("getAdvancedQuiz");
    });

    // First check in quiz creation UI
    cy.visit("/quiz/new");

    // Capture the difficulty selection buttons in creation UI
    cy.get("button").contains("Easy").should("be.visible");
    cy.get("button").contains("Medium").should("be.visible");
    cy.get("button").contains("Hard").should("be.visible");
    cy.screenshot("difficulty-buttons-creation-ui");

    // Check Easy button styling
    cy.contains("Easy").click();
    cy.screenshot("easy-difficulty-selected");

    // Check Medium button styling
    cy.contains("Medium").click();
    cy.screenshot("medium-difficulty-selected");

    // Check Hard button styling
    cy.contains("Hard").click();
    cy.screenshot("hard-difficulty-selected");

    // Now check in quiz taking UI
    cy.visit("/quiz/quiz-template-difficulty-integration");
    cy.wait("@getAdvancedQuiz");

    // Capture the difficulty badges in quiz taking UI
    cy.get('[data-difficulty="easy"]').should("be.visible");
    cy.get('[data-difficulty="medium"]').should("be.visible");
    cy.get('[data-difficulty="hard"]').should("be.visible");
    cy.screenshot("difficulty-badges-quiz-ui");

    // Mock quiz results with different difficulty levels
    cy.mockQuizResults("quiz-template-difficulty-integration");

    // Now check in results UI
    cy.visit("/quiz/quiz-template-difficulty-integration/results");

    // Capture the difficulty badges in results UI
    cy.get('[data-difficulty="easy"]').should("be.visible");
    cy.get('[data-difficulty="medium"]').should("be.visible");
    cy.get('[data-difficulty="hard"]').should("be.visible");
    cy.screenshot("difficulty-badges-results-ui");
  });

  it("should maintain consistent template card styles across selection and preview", () => {
    // Mock quiz generation response
    cy.mockQuizGeneration("doc-1", "quiz-template-visual");

    // Go to quiz creation page
    cy.visit("/quiz/new");

    // Open template selection
    cy.get('[data-testid="template-selector"]').click();

    // Capture template cards in selection UI
    cy.contains("Academic Template").should("be.visible");
    cy.contains("Technical Template").should("be.visible");
    cy.screenshot("template-cards-selection");

    // Select Technical Template to see highlight styles
    cy.contains("Technical Template").click();
    cy.screenshot("technical-template-selected");

    // Select Academic Template to see highlight styles
    cy.contains("Academic Template").click();
    cy.screenshot("academic-template-selected");

    // Check template preview UI
    cy.get('[data-testid="template-preview"]').should("be.visible");
    cy.screenshot("template-preview-ui");

    // Check question distribution visualization
    cy.contains("Question Type Distribution").should("be.visible");
    cy.screenshot("question-distribution-visualization");

    // Check focus areas display
    cy.contains("Focus Areas").should("be.visible");
    cy.screenshot("focus-areas-display");

    // Check example questions display
    cy.contains("Example Questions").should("be.visible");
    cy.screenshot("example-questions-display");
  });

  it("should show consistency between difficulty selection and distribution controls", () => {
    // Mock quiz generation response
    cy.mockQuizGeneration("doc-1", "quiz-distribution-visual");

    // Go to quiz creation page
    cy.visit("/quiz/new");

    // Select a document
    cy.get("#document-select").click();
    cy.contains("Sample Document 1").click();

    // Select Academic Template
    cy.get('[data-testid="template-selector"]').click();
    cy.contains("Academic Template").click();

    // Check difficulty distribution UI
    cy.get('[data-testid="difficulty-distribution"]').should("be.visible");
    cy.screenshot("difficulty-distribution-ui");

    // Set specific difficulty distribution
    cy.get('[data-testid="easy-questions"]').clear().type("3");
    cy.get('[data-testid="medium-questions"]').clear().type("4");
    cy.get('[data-testid="hard-questions"]').clear().type("3");
    cy.screenshot("custom-difficulty-distribution");

    // Verify consistency with summary view
    cy.get('[data-testid="distribution-summary"]').should("be.visible");
    cy.screenshot("distribution-summary-view");
  });

  it("should maintain consistent styling at various screen sizes", () => {
    // Mock quiz with templates and difficulty levels
    cy.fixture("quizzes-advanced.json").then((quizData) => {
      cy.intercept("GET", "/api/quiz/quiz-template-difficulty-integration", {
        statusCode: 200,
        body: quizData[0],
      }).as("getAdvancedQuiz");
    });

    // Test quiz creation view
    cy.visit("/quiz/new");

    // Desktop view
    cy.viewport(1920, 1080);
    cy.screenshot("desktop-quiz-creation");

    // Tablet view
    cy.viewport(768, 1024);
    cy.screenshot("tablet-quiz-creation");

    // Mobile view
    cy.viewport(375, 667);
    cy.screenshot("mobile-quiz-creation");

    // Test quiz taking view with templates and difficulty
    cy.visit("/quiz/quiz-template-difficulty-integration");
    cy.wait("@getAdvancedQuiz");

    // Desktop view
    cy.viewport(1920, 1080);
    cy.screenshot("desktop-quiz-taking");

    // Tablet view
    cy.viewport(768, 1024);
    cy.screenshot("tablet-quiz-taking");

    // Mobile view
    cy.viewport(375, 667);
    cy.screenshot("mobile-quiz-taking");
  });
});
