// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Define a Quiz interface to ensure proper typing
interface Quiz {
  id: string;
  title?: string;
  questions: {
    id: string;
    type: string;
    correctAnswer?: string;
    correctAnswerIndex?: number;
  }[];
}

declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>;
      mockQuizGeneration(
        documentId: string,
        responseQuizId: string
      ): Chainable<void>;
      mockDocumentList(): Chainable<void>;
      mockQuizSubmission(quizId: string): Chainable<void>;
      mockQuizResults(quizId: string): Chainable<void>;
    }
  }
}

// Login command - simulates user login
Cypress.Commands.add("login", (email, password) => {
  // Intercept authentication API request
  cy.intercept("POST", "/api/auth/signin", {
    statusCode: 200,
    body: {
      user: {
        email,
        name: email === "admin@example.com" ? "Admin User" : "Test User",
        id: email === "admin@example.com" ? "user-2" : "user-1",
        role: email === "admin@example.com" ? "admin" : "user",
      },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    },
  }).as("loginRequest");

  // Also intercept the session fetch that happens after login
  cy.intercept("GET", "/api/auth/session", {
    statusCode: 200,
    body: {
      user: {
        email,
        name: email === "admin@example.com" ? "Admin User" : "Test User",
        id: email === "admin@example.com" ? "user-2" : "user-1",
        role: email === "admin@example.com" ? "admin" : "user",
      },
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    },
  }).as("sessionRequest");

  // Visit the login page and submit credentials
  cy.visit("/auth/signin");
  cy.get('input[name="email"]').type(email);
  cy.get('input[name="password"]').type(password);
  cy.get("form").submit();
  cy.wait("@loginRequest");
});

// Mock document list
Cypress.Commands.add("mockDocumentList", () => {
  cy.fixture("documents.json").then((documents) => {
    cy.intercept("GET", "/api/documents", {
      statusCode: 200,
      body: { documents },
    }).as("getDocuments");
  });
});

// Mock quiz generation
Cypress.Commands.add("mockQuizGeneration", (documentId, responseQuizId) => {
  cy.fixture("quizzes.json").then((quizzes: Quiz[]) => {
    const quiz = quizzes.find((q: Quiz) => q.id === responseQuizId);

    cy.intercept("POST", "/api/quiz/generate", {
      statusCode: 200,
      body: {
        quiz: {
          ...quiz,
          documentId,
        },
      },
    }).as("generateQuiz");
  });
});

// Mock quiz submission
Cypress.Commands.add("mockQuizSubmission", (quizId) => {
  cy.intercept("POST", `/api/quiz/${quizId}`, {
    statusCode: 200,
    body: {
      message: "Quiz submitted successfully",
      submissionId: "submission-1",
    },
  }).as("submitQuiz");
});

// Mock quiz results
Cypress.Commands.add("mockQuizResults", (quizId) => {
  cy.fixture("quizzes.json").then((quizzes: Quiz[]) => {
    const quiz = quizzes.find((q: Quiz) => q.id === quizId);
    if (!quiz) {
      throw new Error(`Quiz with ID ${quizId} not found in fixtures`);
    }

    // Create a mock results object
    const results = {
      quizId,
      score: 80,
      totalQuestions: quiz.questions.length,
      correctAnswers: quiz.questions.length - 1,
      submittedAnswers: quiz.questions.map((q, index) => ({
        questionId: q.id,
        submittedAnswer:
          index === 0
            ? "wrong answer"
            : q.type === "multiple_choice"
            ? q.correctAnswerIndex
            : q.correctAnswer,
        isCorrect: index !== 0,
      })),
      timeSpent: 240, // seconds
      completedAt: new Date().toISOString(),
      quiz,
    };

    cy.intercept("GET", `/api/quiz/${quizId}/results`, {
      statusCode: 200,
      body: { results },
    }).as("getQuizResults");
  });
});

export {};
