describe("Advanced Quiz Templates Testing", () => {
  beforeEach(() => {
    // Clear any previous session state
    cy.clearLocalStorage();
    cy.clearCookies();

    // Login as test user
    cy.login("test@example.com", "password123");

    // Mock document list
    cy.mockDocumentList();
  });

  it("should create a quiz with template and specific difficulty distribution", () => {
    // Mock quiz generation response
    cy.mockQuizGeneration("doc-1", "quiz-template-difficulty-integration");

    // Go to quiz creation page
    cy.visit("/quiz/new");

    // Select a document
    cy.get("#document-select").click();
    cy.contains("Sample Document 1").click();

    // Set quiz title
    cy.get("#quiz-title").type("Template with Difficulty Distribution Test");
    cy.get("#num-questions").clear().type("9"); // 9 questions to test distribution

    // Select Academic Template
    cy.get('[data-testid="template-selector"]').click();
    cy.contains("Academic Template").click();

    // Configure difficulty distribution
    cy.get('[data-testid="difficulty-distribution"]').should("be.visible");

    // Set 3 easy, 3 medium, 3 hard questions
    cy.get('[data-testid="easy-questions"]').clear().type("3");
    cy.get('[data-testid="medium-questions"]').clear().type("3");
    cy.get('[data-testid="hard-questions"]').clear().type("3");

    // Submit form
    cy.get("form").submit();

    // Verify quiz generation API was called with correct parameters
    cy.wait("@generateQuiz")
      .its("request.body")
      .should("deep.include", {
        templateId: "academic",
        difficultyDistribution: {
          easy: 3,
          medium: 3,
          hard: 3,
        },
      });

    // Should redirect to the quiz page
    cy.url().should("include", "/quiz/");
  });

  it("should adjust point values based on question difficulty", () => {
    // Mock quiz with different difficulty levels and point values
    cy.fixture("quizzes-with-difficulty.json").then((quizData) => {
      cy.intercept("GET", "/api/quiz/quiz-difficulty-test", {
        statusCode: 200,
        body: quizData[0],
      }).as("getQuizWithDifficulty");
    });

    // Navigate to quiz with difficulty levels
    cy.visit("/quiz/quiz-difficulty-test");
    cy.wait("@getQuizWithDifficulty");

    // Verify point values correspond to difficulty levels
    cy.get('[data-difficulty="easy"]').parent().should("contain", "1 point");
    cy.get('[data-difficulty="medium"]').parent().should("contain", "2 points");
    cy.get('[data-difficulty="hard"]').parent().should("contain", "3 points");
  });

  it("should show template-specific question categories", () => {
    // Mock quiz with template-specific categories
    cy.fixture("quizzes-with-difficulty.json").then((quizData) => {
      cy.intercept("GET", "/api/quiz/quiz-template-test", {
        statusCode: 200,
        body: quizData[1],
      }).as("getQuizWithTemplate");
    });

    // Navigate to quiz with template categories
    cy.visit("/quiz/quiz-template-test");
    cy.wait("@getQuizWithTemplate");

    // Verify template info is displayed
    cy.get('[data-testid="template-info"]').should(
      "contain",
      "Technical Template"
    );

    // Verify template-specific categories are displayed
    cy.get('[data-category="concept"]').should("be.visible");
    cy.get('[data-category="implementation"]').should("be.visible");
    cy.get('[data-category="application"]').should("be.visible");
  });

  it("should allow template switching with maintained difficulty settings", () => {
    // Mock quiz generation response
    cy.mockQuizGeneration("doc-1", "quiz-template-switch");

    // Go to quiz creation page
    cy.visit("/quiz/new");

    // Select a document
    cy.get("#document-select").click();
    cy.contains("Sample Document 1").click();

    // Set quiz title
    cy.get("#quiz-title").type("Template Switching Test");

    // Select Hard difficulty
    cy.contains("Hard").click();
    cy.get('button[data-difficulty="hard"]').should("have.class", "selected");

    // Select Academic Template
    cy.get('[data-testid="template-selector"]').click();
    cy.contains("Academic Template").click();

    // Switch to Technical Template
    cy.get('[data-testid="template-selector"]').click();
    cy.contains("Technical Template").click();

    // Verify difficulty selection is maintained
    cy.get('button[data-difficulty="hard"]').should("have.class", "selected");

    // Submit form
    cy.get("form").submit();

    // Verify quiz generation API was called with correct parameters
    cy.wait("@generateQuiz").its("request.body").should("include", {
      templateId: "technical",
      difficulty: "hard",
    });

    // Should redirect to the quiz page
    cy.url().should("include", "/quiz/");
  });

  it("should analyze results by template and difficulty in results page", () => {
    // Mock quiz results with template and difficulty data
    cy.intercept("GET", "/api/quiz/quiz-template-difficulty-results/results", {
      statusCode: 200,
      body: {
        score: 70,
        totalQuestions: 9,
        correctAnswers: 6,
        timeSpent: "00:05:30",
        detailedResults: {
          byDifficulty: {
            easy: { correct: 3, total: 3, percentage: 100 },
            medium: { correct: 2, total: 3, percentage: 67 },
            hard: { correct: 1, total: 3, percentage: 33 },
          },
          byCategory: {
            concept: { correct: 2, total: 3, percentage: 67 },
            analysis: { correct: 2, total: 3, percentage: 67 },
            application: { correct: 2, total: 3, percentage: 67 },
          },
        },
      },
    }).as("getQuizResults");

    // Navigate to results page
    cy.visit("/quiz/quiz-template-difficulty-results/results");
    cy.wait("@getQuizResults");

    // Verify detailed analysis sections exist
    cy.get('[data-testid="difficulty-analysis"]').should("be.visible");
    cy.get('[data-testid="category-analysis"]').should("be.visible");

    // Check difficulty breakdown content
    cy.get('[data-testid="difficulty-analysis"]').within(() => {
      cy.contains("Easy: 100%").should("be.visible");
      cy.contains("Medium: 67%").should("be.visible");
      cy.contains("Hard: 33%").should("be.visible");
    });

    // Check category breakdown content
    cy.get('[data-testid="category-analysis"]').within(() => {
      cy.contains("Concept: 67%").should("be.visible");
      cy.contains("Analysis: 67%").should("be.visible");
      cy.contains("Application: 67%").should("be.visible");
    });
  });
});
