/**
 * Common test fixtures for quiz-related tests
 */
// Mock quiz data
export const mockQuiz = {
    id: "quiz-123",
    title: "Test Quiz",
    description: "A test quiz for unit testing",
    difficulty: "Medium",
    timeLimit: 10, // 10 minutes
    document: {
        id: "doc-123",
        filename: "test-document.pdf",
    },
    questions: [
        {
            id: "q1",
            questionText: "What is the capital of France?",
            answerType: "multiple_choice",
            options: ["Paris", "London", "Berlin", "Madrid"],
            points: 10,
        },
        {
            id: "q2",
            questionText: "The sky is blue.",
            answerType: "true_false",
            options: null,
            points: 5,
        },
        {
            id: "q3",
            questionText: "Explain the water cycle in your own words.",
            answerType: "short_answer",
            options: null,
            points: 15,
        },
    ],
};
// Mock quiz result data
export const mockQuizResult = {
    id: "result-456",
    score: 66.7,
    earnedPoints: 20,
    totalPoints: 30,
    feedback: "Good job! You have a solid understanding of the material.",
    timeTaken: 180, // 3 minutes
    completedAt: "2025-05-03T16:45:20.000Z",
    quiz: {
        id: "quiz-123",
        title: "Test Quiz",
        description: "A quiz about testing",
        document: {
            id: "doc-123",
            filename: "test-document.pdf",
        },
    },
    user: {
        name: "Test User",
        email: "test@example.com",
    },
    responses: [
        {
            id: "resp-1",
            questionText: "What is the capital of France?",
            answerType: "multiple_choice",
            options: ["Paris", "London", "Berlin", "Madrid"],
            correctAnswer: "Paris",
            userAnswer: "Paris",
            isCorrect: true,
            explanation: "Paris is the capital city of France.",
        },
        {
            id: "resp-2",
            questionText: "The sky is blue.",
            answerType: "true_false",
            options: null,
            correctAnswer: "True",
            userAnswer: "True",
            isCorrect: true,
            explanation: "The sky appears blue due to light scattering.",
        },
        {
            id: "resp-3",
            questionText: "Explain the water cycle in your own words.",
            answerType: "short_answer",
            options: null,
            correctAnswer: "The water cycle involves evaporation, condensation, precipitation, and collection.",
            userAnswer: "Water goes up and then falls down as rain.",
            isCorrect: false,
            explanation: "The water cycle is more complex and involves specific processes like evaporation, condensation, precipitation, and collection.",
        },
    ],
    isShared: false,
    shareUrl: null,
};
// Mock shared quiz result data
export const mockSharedQuizResult = {
    ...mockQuizResult,
    isShared: true,
    shareUrl: "abc123xyz",
};
// Mock documents for quiz generation
export const mockDocuments = [
    { id: "doc-1", filename: "Document 1.pdf" },
    { id: "doc-2", filename: "Document 2.docx" },
    { id: "doc-3", filename: "Document 3.txt" },
];
// Mock quiz generation response
export const mockQuizGenerationResponse = {
    id: "quiz-123",
    title: "Test Quiz on Document 1",
    questionCount: 5,
};
// Mock quiz submission response
export const mockQuizSubmissionResponse = {
    resultId: "result-123",
};
// Mock user responses for quiz submission
export const mockUserAnswers = [
    {
        questionId: "q1",
        userAnswer: "Paris",
    },
    {
        questionId: "q2",
        userAnswer: "True",
    },
    {
        questionId: "q3",
        userAnswer: "Water goes up and then falls down as rain.",
    },
];
// Mock user profiles for testing
export const mockUsers = {
    authenticated: {
        id: "user-123",
        name: "Test User",
        email: "test@example.com",
        isAuthenticated: true,
    },
    unauthenticated: {
        id: null,
        name: null,
        email: null,
        isAuthenticated: false,
    },
    premium: {
        id: "user-456",
        name: "Premium User",
        email: "premium@example.com",
        isAuthenticated: true,
        isPremium: true,
    },
};
