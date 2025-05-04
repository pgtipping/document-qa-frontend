describe("Quiz Sharing", () => {
  beforeEach(() => {
    // Clear any previous session state
    cy.clearLocalStorage();
    cy.clearCookies();

    // Login as test user
    cy.login("test@example.com", "password123");

    // Mock quiz results
    cy.mockQuizResults("quiz-1");
  });

  it("should allow sharing quiz results via link", () => {
    // Mock share API response
    cy.intercept("POST", "/api/quiz/quiz-1/share", {
      statusCode: 200,
      body: {
        shareUrl: "http://localhost:3000/shared/quiz/abc123",
        shareId: "abc123",
      },
    }).as("shareQuiz");

    // Navigate to results page
    cy.visit("/quiz/quiz-1/results");

    // Click share button
    cy.contains("Share Results").click();

    // Modal should open
    cy.contains("Share Quiz Results");

    // Click the share link button
    cy.contains("Create Shareable Link").click();

    // Verify share API was called
    cy.wait("@shareQuiz");

    // Link should be displayed
    cy.contains("http://localhost:3000/shared/quiz/abc123");

    // Copy button should be available
    cy.contains("Copy Link");
  });

  it("should allow viewing shared quiz results", () => {
    // Mock shared quiz data
    cy.intercept("GET", "/api/shared/quiz/abc123", {
      statusCode: 200,
      body: {
        quizId: "quiz-1",
        score: 80,
        totalQuestions: 5,
        correctAnswers: 4,
        timeSpent: 240,
        completedAt: new Date().toISOString(),
        quizTitle: "Sample Quiz 1",
        userName: "Test User",
      },
    }).as("getSharedQuiz");

    // Visit shared quiz page
    cy.visit("/shared/quiz/abc123");

    // Verify shared quiz data is displayed
    cy.wait("@getSharedQuiz");
    cy.contains("Sample Quiz 1");
    cy.contains("Score: 80%");
    cy.contains("Test User");
  });

  it("should handle invalid share links", () => {
    // Mock error for invalid share ID
    cy.intercept("GET", "/api/shared/quiz/invalid", {
      statusCode: 404,
      body: {
        error: "Shared quiz not found",
      },
    }).as("getInvalidShare");

    // Visit invalid shared quiz page
    cy.visit("/shared/quiz/invalid");

    // Verify error is displayed
    cy.wait("@getInvalidShare");
    cy.contains("Quiz Not Found");
    cy.contains("The shared quiz you're looking for doesn't exist");
    cy.contains("Return Home");
  });

  it("should handle quiz results email sharing", () => {
    // Mock email share API
    cy.intercept("POST", "/api/quiz/quiz-1/share-email", {
      statusCode: 200,
      body: {
        message: "Email sent successfully",
      },
    }).as("shareQuizEmail");

    // Navigate to results page
    cy.visit("/quiz/quiz-1/results");

    // Click share button
    cy.contains("Share Results").click();

    // Modal should open
    cy.contains("Share Quiz Results");

    // Click the email tab
    cy.contains("Email").click();

    // Fill in email form
    cy.get('input[name="recipientEmail"]').type("recipient@example.com");
    cy.get('textarea[name="message"]').type("Check out my quiz results!");

    // Submit form
    cy.contains("Send Email").click();

    // Verify email API was called
    cy.wait("@shareQuizEmail");

    // Success message should be displayed
    cy.contains("Email sent successfully");
  });
});
