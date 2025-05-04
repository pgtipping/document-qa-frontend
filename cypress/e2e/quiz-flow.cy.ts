describe("Quiz Flow", () => {
  beforeEach(() => {
    // Clear any previous session state
    cy.clearLocalStorage();
    cy.clearCookies();

    // Login as test user
    cy.login("test@example.com", "password123");

    // Mock document list
    cy.mockDocumentList();
  });

  it("should allow creating a new quiz", () => {
    // Mock quiz generation response
    cy.mockQuizGeneration("doc-1", "quiz-1");

    // Go to quiz creation page
    cy.visit("/quiz/new");

    // Select a document
    cy.get("#document-select").click();
    cy.contains("Sample Document 1").click();

    // Set quiz options
    cy.get("#quiz-title").type("Test Quiz");
    cy.get("#num-questions").clear().type("5");
    cy.get('input[name="difficulty"][value="medium"]').check();
    cy.get("#time-limit").clear().type("10");

    // Submit form
    cy.get("form").submit();

    // Verify quiz generation API was called
    cy.wait("@generateQuiz");

    // Should redirect to the quiz page
    cy.url().should("include", "/quiz/");
    cy.contains("Test Quiz");
  });

  it("should display quiz questions and allow answering", () => {
    // Navigate to an existing quiz
    cy.visit("/quiz/quiz-1");

    // Should show quiz title and first question
    cy.contains("Sample Quiz 1");
    cy.contains("What is the capital of France?");

    // Answer multiple choice question
    cy.contains("Paris").click();
    cy.contains("Next").click();

    // Answer true/false question
    cy.contains("True").click();
    cy.contains("Next").click();

    // Answer short answer question
    cy.get("textarea").type("Leonardo da Vinci");

    // Submit quiz
    cy.mockQuizSubmission("quiz-1");
    cy.contains("Submit Quiz").click();
    cy.wait("@submitQuiz");

    // Should redirect to results page
    cy.url().should("include", "/results");
  });

  it("should display quiz results", () => {
    // Mock quiz results
    cy.mockQuizResults("quiz-1");

    // Navigate to results page
    cy.visit("/quiz/quiz-1/results");

    // Verify results page content
    cy.contains("Quiz Results");
    cy.contains("Score: 80%");
    cy.contains("Correct Answers: ");
    cy.contains("Time Spent: ");

    // Check individual question results
    cy.contains("What is the capital of France?");
    cy.contains("Correct");

    // Should have a share button
    cy.contains("Share Results");
  });

  it("should handle quiz generation errors", () => {
    // Mock error response for quiz generation
    cy.intercept("POST", "/api/quiz/generate", {
      statusCode: 500,
      body: {
        error: "Failed to generate quiz",
      },
    }).as("generateQuizError");

    // Go to quiz creation page
    cy.visit("/quiz/new");

    // Select a document
    cy.get("#document-select").click();
    cy.contains("Sample Document 1").click();

    // Set quiz options
    cy.get("#quiz-title").type("Test Quiz");
    cy.get("#num-questions").clear().type("5");

    // Submit form
    cy.get("form").submit();

    // Verify error is displayed
    cy.wait("@generateQuizError");
    cy.contains("Failed to generate quiz");
  });
});
