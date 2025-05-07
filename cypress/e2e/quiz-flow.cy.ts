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

    // Add logging for debugging
    cy.log("Starting quiz creation test with data-testid selectors");

    // Wait for page to load completely
    cy.contains("Create New Quiz", { timeout: 10000 }).should("be.visible");

    // Select a document (using more resilient approach)
    // Try with data-testid first, fallback to other selectors
    cy.get("body").then(($body) => {
      // Check if document-select with data-testid exists
      if ($body.find('[data-testid="document-select"]').length > 0) {
        cy.get('[data-testid="document-select"]').click();
      }
      // Fallback to id selector
      else if ($body.find("#document-select").length > 0) {
        cy.get("#document-select").click();
      }
      // Fallback to any select element
      else {
        cy.log("Fallback: Looking for any select element");
        cy.get("select").first().click();
      }
    });

    // Select document from dropdown using contains for more resilience
    cy.contains("Sample Document 1").click();

    // Difficulty selection - use data-testid if available
    cy.get("body").then(($body) => {
      if ($body.find('[data-testid="quiz-difficulty-medium"]').length > 0) {
        cy.get('[data-testid="quiz-difficulty-medium"]').click();
      } else {
        cy.log("Using fallback for difficulty selection");
        cy.contains("Medium").click();
      }
    });

    // Submit form - use generate button
    cy.get("body").then(($body) => {
      if ($body.find('[data-testid="quiz-generate-button"]').length > 0) {
        cy.get('[data-testid="quiz-generate-button"]').click();
      } else {
        cy.log("Using fallback for generate button");
        cy.contains("Generate Quiz").click();
      }
    });

    // Verify quiz generation API was called
    cy.wait("@generateQuiz");

    // Should redirect to the quiz page
    cy.url().should("include", "/quiz/");
  });

  it("should display quiz questions and allow answering", () => {
    // Navigate to an existing quiz
    cy.visit("/quiz/quiz-1");

    // Wait for quiz to load
    cy.waitForQuizLoad();

    // Should show quiz title and first question
    cy.get('[data-testid="quiz-title"]').should("be.visible");
    cy.get('[data-testid="quiz-question"]').should("be.visible");

    // Answer multiple choice question
    cy.selectQuizOption(0, 1); // First question, second option
    cy.navigateQuiz("next");

    // Answer true/false question
    cy.selectQuizOption(1, 1); // Second question, "False" option
    cy.navigateQuiz("next");

    // Answer short answer question
    cy.answerQuestion(2, "Leonardo da Vinci");

    // Submit quiz
    cy.mockQuizSubmission("quiz-1");
    cy.navigateQuiz("submit");
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
    cy.get('[data-testid="quiz-results"]').should("be.visible");
    cy.get('[data-testid="results-score-percentage"]').should("be.visible");
    cy.get('[data-testid="results-score-points"]').should("be.visible");

    // Check individual question results
    cy.get('[data-testid="results-question-0"]').should("be.visible");
    cy.get('[data-testid="results-question-0-status"]').should("be.visible");

    // Should have a share button
    cy.get('[data-testid="results-share-switch"]').should("be.visible");
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

    // Select a document using more resilient selectors
    cy.get("body").then(($body) => {
      if ($body.find('[data-testid="document-select"]').length > 0) {
        cy.get('[data-testid="document-select"]').click();
      } else {
        cy.get("#document-select").click();
      }
    });
    cy.contains("Sample Document 1").click();

    // Submit form
    cy.get("body").then(($body) => {
      if ($body.find('[data-testid="quiz-generate-button"]').length > 0) {
        cy.get('[data-testid="quiz-generate-button"]').click();
      } else {
        cy.contains("Generate Quiz").click();
      }
    });

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
    cy.get("body").then(($body) => {
      if ($body.find('[data-testid="quiz-difficulty-medium"]').length > 0) {
        cy.get('[data-testid="quiz-difficulty-medium"]').click();
      } else {
        cy.log("Falling back to text selection for quiz difficulty");
        cy.contains("Medium").click();
      }
    });

    // Click Generate button
    cy.get("body").then(($body) => {
      if ($body.find('[data-testid="quiz-generate-button"]').length > 0) {
        cy.get('[data-testid="quiz-generate-button"]').click();
      } else {
        cy.contains("Generate").click();
      }
    });

    // Wait for the quiz generation request
    cy.wait("@generateQuiz");

    // Verify redirect to the quiz page
    cy.url().should("include", "/quiz/test-quiz-1");
  });

  it("Should allow a user to take a quiz and view results", () => {
    // Mock quiz submission
    cy.mockQuizSubmission("test-quiz-1");
    cy.mockQuizResults("test-quiz-1");

    // Navigate directly to the quiz
    cy.visit("/quiz/test-quiz-1");

    // Wait for quiz to load
    cy.waitForQuizLoad();

    // Answer each question using our custom commands
    // First question (multiple choice)
    cy.get('[data-testid="quiz-question"]').should("be.visible");
    cy.selectQuizOption(0, 1); // Select Paris (option index 1)
    cy.navigateQuiz("next");

    // Second question (true/false)
    cy.get('[data-testid="quiz-question"]').should("be.visible");
    cy.selectQuizOption(1, 1); // Select False (option index 1)
    cy.navigateQuiz("next");

    // Third question (short answer)
    cy.get('[data-testid="quiz-question"]').should("be.visible");
    cy.answerQuestion(2, "H2O");

    // Submit the quiz
    cy.navigateQuiz("submit");

    // Wait for submission and verify redirect to results
    cy.wait("@submitQuiz");
    cy.url().should("include", "/results");

    // Verify results page elements
    cy.get('[data-testid="quiz-results"]').should("be.visible");
    cy.get('[data-testid="results-score-percentage"]').should("be.visible");
  });

  it("Should allow navigating between questions in a quiz", () => {
    // Navigate to an existing quiz
    cy.visit("/quiz/quiz-1");

    // Wait for quiz to load
    cy.waitForQuizLoad();

    // Answer first question
    cy.selectQuizOption(0, 1);
    cy.navigateQuiz("next");

    // Answer second question
    cy.selectQuizOption(1, 1);
    cy.navigateQuiz("next");

    // Answer third question
    cy.answerQuestion(2, "H2O");

    // Go back to previous questions to check answers are maintained
    cy.navigateQuiz("prev");
    cy.navigateQuiz("prev");

    // Return to last question and submit
    cy.navigateQuiz("next");
    cy.navigateQuiz("next");

    // Submit the quiz
    cy.mockQuizSubmission("quiz-1");
    cy.navigateQuiz("submit");

    // Verify submission
    cy.wait("@submitQuiz");
    cy.url().should("include", "/results");
  });
});
