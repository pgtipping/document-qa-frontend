describe("Quiz Templates and Difficulty Levels", () => {
  beforeEach(() => {
    // Clear any previous session state
    cy.clearLocalStorage();
    cy.clearCookies();

    // Login as test user
    cy.login("test@example.com", "password123");

    // Mock document list
    cy.mockDocumentList();
  });

  it("should allow selecting different difficulty levels when creating a quiz", () => {
    // Mock quiz generation response
    cy.mockQuizGeneration("doc-1", "quiz-difficulty-test");

    // Go to quiz creation page
    cy.visit("/quiz/new");

    // Select a document
    cy.get("#document-select").click();
    cy.contains("Sample Document 1").click();

    // Set quiz title
    cy.get("#quiz-title").type("Difficulty Test Quiz");
    cy.get("#num-questions").clear().type("5");

    // Test selecting each difficulty level
    cy.contains("Easy").click();
    cy.get('button[data-difficulty="easy"]').should("have.class", "selected");

    cy.contains("Medium").click();
    cy.get('button[data-difficulty="medium"]').should("have.class", "selected");

    cy.contains("Hard").click();
    cy.get('button[data-difficulty="hard"]').should("have.class", "selected");

    // Submit form with Hard difficulty
    cy.get("form").submit();

    // Verify quiz generation API was called with correct parameters
    cy.wait("@generateQuiz").its("request.body").should("include", {
      difficulty: "hard",
    });

    // Should redirect to the quiz page
    cy.url().should("include", "/quiz/");
    cy.contains("Difficulty Test Quiz");
  });

  it("should display difficulty badges on quiz questions", () => {
    // Mock quiz with different difficulty levels
    cy.fixture("quizzes-with-difficulty.json").then((quizData) => {
      cy.intercept("GET", "/api/quiz/quiz-difficulty-test", {
        statusCode: 200,
        body: quizData[0],
      }).as("getQuizWithDifficulty");
    });

    // Navigate to quiz with difficulty levels
    cy.visit("/quiz/quiz-difficulty-test");
    cy.wait("@getQuizWithDifficulty");

    // Verify difficulty badges are displayed
    cy.get('[data-difficulty="easy"]').should("be.visible");
    cy.get('[data-difficulty="medium"]').should("be.visible");
    cy.get('[data-difficulty="hard"]').should("be.visible");
  });

  it("should allow selecting different quiz templates", () => {
    // Mock quiz generation response
    cy.mockQuizGeneration("doc-1", "quiz-template-test");

    // Go to quiz creation page
    cy.visit("/quiz/new");

    // Select a document
    cy.get("#document-select").click();
    cy.contains("Sample Document 1").click();

    // Set quiz title
    cy.get("#quiz-title").type("Template Test Quiz");

    // Open template selection
    cy.get('[data-testid="template-selector"]').click();

    // Should show template options
    cy.contains("Academic Template").should("be.visible");
    cy.contains("Technical Template").should("be.visible");
    cy.contains("Business Template").should("be.visible");
    cy.contains("Narrative Template").should("be.visible");

    // Select Technical Template
    cy.contains("Technical Template").click();

    // Template preview should update
    cy.get('[data-testid="template-preview"]').should(
      "contain",
      "Technical concepts"
    );

    // Submit form with technical template
    cy.get("form").submit();

    // Verify quiz generation API was called with correct template
    cy.wait("@generateQuiz").its("request.body").should("include", {
      templateId: "technical",
    });

    // Should redirect to the quiz page
    cy.url().should("include", "/quiz/");
    cy.contains("Template Test Quiz");
  });

  it("should recommend appropriate templates based on document type", () => {
    // Mock quiz generation response
    cy.mockQuizGeneration("technical-doc", "quiz-template-recommendation");

    // Go to quiz creation page with technical document ID in URL
    cy.visit("/quiz/new?documentId=technical-doc");

    // Wait for template recommendation to load
    cy.get('[data-testid="template-recommendations"]').should("be.visible");

    // Should recommend technical template first for technical document
    cy.get('[data-testid="recommended-template"]')
      .first()
      .should("contain", "Technical Template");

    // Should indicate it's recommended based on document type
    cy.contains("Recommended for technical documents").should("be.visible");
  });
});
