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

  it("Should generate a quiz from a document", () => {
    // Set up mocks for quiz generation
    cy.mockQuizGeneration("test-doc-1", "test-quiz-1");

    // Navigate to documents page
    cy.visit("/docs");

    // Click on the document
    cy.contains("Test Document 1.pdf").click();

    // Click the "Generate Quiz" button
    cy.contains("Generate Quiz").click();

    // Expect the quiz generation modal to appear
    cy.contains("Quiz Options").should("be.visible");

    // Select quiz options and submit
    cy.get("[data-testid='quiz-difficulty']").click();
    cy.contains("Medium").click();

    cy.get("[data-testid='quiz-num-questions']").clear().type("3");

    cy.contains("Generate").click();

    // Wait for the quiz generation request
    cy.wait("@generateQuiz");

    // Verify redirect to the quiz page
    cy.url().should("include", "/quiz/test-quiz-1");

    // Verify quiz title is displayed
    cy.contains("Test Quiz 1").should("be.visible");
  });

  it("Should allow a user to take a quiz and view results", () => {
    // Mock quiz submission
    cy.mockQuizSubmission("test-quiz-1");
    cy.mockQuizResults("test-quiz-1");

    // Navigate directly to the quiz
    cy.visit("/quiz/test-quiz-1");

    // Answer each question
    cy.get("[data-testid='question-test-question-1']").within(() => {
      // Select the correct answer (Paris)
      cy.contains("Paris").click();
      cy.contains("Next").click();
    });

    cy.get("[data-testid='question-test-question-2']").within(() => {
      // Select the correct answer (False)
      cy.contains("False").click();
      cy.contains("Next").click();
    });

    cy.get("[data-testid='question-test-question-3']").within(() => {
      // Enter the correct answer (H2O)
      cy.get("input").type("H2O");
      cy.contains("Submit Quiz").click();
    });

    // Wait for the quiz submission
    cy.wait("@submitQuiz");

    // Should redirect to results page
    cy.url().should("include", "/quiz/test-quiz-1/results");

    // Verify results are displayed
    cy.contains("Quiz Results").should("be.visible");
    cy.contains("Score: 80%").should("be.visible");

    // Verify individual question results
    cy.contains("What is the capital of France?").should("be.visible");
    cy.contains("The Earth is flat.").should("be.visible");
    cy.contains("What is the chemical symbol for water?").should("be.visible");
  });

  it("Should allow sharing a quiz with others", () => {
    // Navigate to a completed quiz results
    cy.visit("/quiz/test-quiz-1/results");

    // Mock the share API
    cy.window().then((win) => {
      cy.stub(win.navigator.clipboard, "writeText").resolves();
    });

    // Click the share button
    cy.contains("Share Quiz").click();

    // Verify the share dialog is displayed
    cy.contains("Share this quiz with others").should("be.visible");

    // Click the copy link button
    cy.contains("Copy Link").click();

    // Verify success message
    cy.contains("Link copied to clipboard").should("be.visible");
  });
});
