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
  templateId?: string;
  templateInfo?: {
    name: string;
    description: string;
    questionDistribution?: Record<string, number>;
  };
  questions: {
    id: string;
    type: string;
    correctAnswer?: string;
    correctAnswerIndex?: number;
    difficulty?: "easy" | "medium" | "hard";
    category?: string;
  }[];
}

// Define interfaces for consistent typing
interface User {
  email: string;
  name: string;
  id: string;
  role: "admin" | "user";
}

// Interface for template recommendation
interface TemplateRecommendation {
  id: string;
  name: string;
  score: number;
}

// Document type keys for recommendations
type DocTypeKey =
  | "technical-doc"
  | "academic-doc"
  | "business-doc"
  | "narrative-doc";

declare global {
  namespace Cypress {
    interface Chainable {
      login(
        email: string,
        password: string,
        useRealAuth?: boolean
      ): Chainable<void>;
      loginByApi(email: string, password: string): Chainable<void>;
      mockQuizGeneration(
        documentId: string,
        responseQuizId: string,
        templateId?: string,
        difficulty?: string
      ): Chainable<void>;
      mockDocumentList(): Chainable<void>;
      mockQuizSubmission(quizId: string): Chainable<void>;
      mockQuizResults(quizId: string): Chainable<void>;
      checkLoggedIn(): Chainable<void>;
      mockTemplateRecommendations(documentId: string): Chainable<void>;
    }
  }
}

// Login command - can use either real or mocked authentication
Cypress.Commands.add("login", (email, password, useRealAuth = false) => {
  if (useRealAuth) {
    return cy.loginByApi(email, password);
  }

  // Mock user data based on email
  const user: User = {
    email,
    name: email === "admin@example.com" ? "Admin User" : "Test User",
    id: email === "admin@example.com" ? "user-2" : "user-1",
    role: email === "admin@example.com" ? "admin" : "user",
  };

  // Intercept authentication API request
  cy.intercept("POST", "/api/auth/callback/credentials", {
    statusCode: 200,
    body: {
      user,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    },
  }).as("loginRequest");

  // Also intercept the session fetch that happens after login
  cy.intercept("GET", "/api/auth/session", {
    statusCode: 200,
    body: {
      user,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    },
  }).as("sessionRequest");

  // Visit the login page and submit credentials
  cy.visit("/auth/signin");
  cy.get('input[name="email"]').type(email);
  cy.get('input[name="password"]').type(password);
  cy.get("form").submit();

  // Wait for login
  cy.wait("@loginRequest");

  // In the test environment, we might stay on the login page
  // Since we're intercepting the session and creating a mock user anyway,
  // we can directly navigate to the docs page
  cy.visit("/docs");
});

// Login using real API authentication
Cypress.Commands.add("loginByApi", (email, password) => {
  // Actual API-based login
  cy.session([email, password], () => {
    cy.visit("/auth/signin");
    cy.get('input[name="email"]').type(email);
    cy.get('input[name="password"]').type(password);
    cy.get("form").submit();

    // In the test environment, we might not get redirected correctly
    // Navigate directly to docs path since we are logging in regardless
    cy.visit("/docs");
  });
});

// Check if user is logged in, redirect to login if not
Cypress.Commands.add("checkLoggedIn", () => {
  cy.visit("/");
  cy.url().then((url) => {
    if (url.includes("/auth/signin")) {
      cy.login("test@example.com", "testpassword123");
    }
  });
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

// Mock quiz generation with optional template and difficulty
Cypress.Commands.add(
  "mockQuizGeneration",
  (documentId, responseQuizId, templateId, difficulty) => {
    // If templateId or difficulty are specified, use quizzes-with-difficulty fixture, otherwise use standard quizzes
    const fixtureToUse =
      templateId || difficulty
        ? "quizzes-with-difficulty.json"
        : "quizzes.json";

    cy.fixture(fixtureToUse).then((quizzes: Quiz[]) => {
      let quiz = quizzes.find((q: Quiz) => q.id === responseQuizId);

      // If quiz not found in fixture, use the first quiz as fallback
      if (!quiz && quizzes.length > 0) {
        quiz = quizzes[0];
      }

      // If still no quiz, throw an error
      if (!quiz) {
        throw new Error(`Quiz with ID ${responseQuizId} not found in fixtures`);
      }

      cy.intercept("POST", "/api/quiz/generate", {
        statusCode: 200,
        body: {
          quiz: {
            ...quiz,
            documentId,
            ...(templateId && { templateId }),
          },
        },
      }).as("generateQuiz");
    });
  }
);

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
  // First try quizzes-with-difficulty fixture, fall back to standard quizzes
  cy.fixture("quizzes-with-difficulty.json").then(
    (quizzesWithDifficulty: Quiz[]) => {
      const difficultQuiz = quizzesWithDifficulty.find(
        (q: Quiz) => q.id === quizId
      );

      if (difficultQuiz) {
        createMockResults(difficultQuiz, quizId);
      } else {
        // If not found in quizzes-with-difficulty, try standard quizzes
        cy.fixture("quizzes.json").then((standardQuizzes: Quiz[]) => {
          const standardQuiz = standardQuizzes.find(
            (q: Quiz) => q.id === quizId
          );

          if (!standardQuiz) {
            throw new Error(`Quiz with ID ${quizId} not found in any fixtures`);
          }

          createMockResults(standardQuiz, quizId);
        });
      }
    }
  );

  function createMockResults(quiz: Quiz, quizId: string) {
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
        difficulty: q.difficulty || "medium", // Default to medium if no difficulty specified
      })),
      timeSpent: 240, // seconds
      completedAt: new Date().toISOString(),
      quiz,
    };

    cy.intercept("GET", `/api/quiz/${quizId}/results`, {
      statusCode: 200,
      body: { results },
    }).as("getQuizResults");
  }
});

// Mock template recommendations based on document type
Cypress.Commands.add("mockTemplateRecommendations", (documentId) => {
  // Different document types get different recommendations
  const recommendationsByDocType: Record<DocTypeKey, TemplateRecommendation[]> =
    {
      "technical-doc": [
        { id: "technical", name: "Technical Template", score: 0.95 },
        { id: "general", name: "General Knowledge", score: 0.75 },
        { id: "academic", name: "Academic Template", score: 0.6 },
      ],
      "academic-doc": [
        { id: "academic", name: "Academic Template", score: 0.9 },
        { id: "general", name: "General Knowledge", score: 0.7 },
        { id: "technical", name: "Technical Template", score: 0.55 },
      ],
      "business-doc": [
        { id: "business", name: "Business Template", score: 0.9 },
        { id: "general", name: "General Knowledge", score: 0.65 },
        { id: "narrative", name: "Narrative Template", score: 0.5 },
      ],
      "narrative-doc": [
        { id: "narrative", name: "Narrative Template", score: 0.88 },
        { id: "general", name: "General Knowledge", score: 0.7 },
        { id: "academic", name: "Academic Template", score: 0.45 },
      ],
    };

  // Default recommendations for any other document type
  const defaultRecommendations: TemplateRecommendation[] = [
    { id: "general", name: "General Knowledge", score: 0.85 },
    { id: "academic", name: "Academic Template", score: 0.65 },
    { id: "technical", name: "Technical Template", score: 0.55 },
    { id: "business", name: "Business Template", score: 0.5 },
    { id: "narrative", name: "Narrative Template", score: 0.45 },
  ];

  // Determine which recommendations to use based on the document ID
  let recommendations: TemplateRecommendation[];
  if (documentId.includes("-")) {
    const docType = documentId.split("-")[0];
    const docTypeKey = `${docType}-doc` as DocTypeKey;
    recommendations =
      recommendationsByDocType[docTypeKey] || defaultRecommendations;
  } else {
    recommendations = defaultRecommendations;
  }

  cy.intercept(
    "GET",
    `/api/quiz/template-recommendations?documentId=${documentId}`,
    {
      statusCode: 200,
      body: { recommendations },
    }
  ).as("getTemplateRecommendations");
});

export {};
