import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import QuizResults from "@/components/QuizResults";
import "@testing-library/jest-dom";
import { useRouter } from "next/navigation";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    back: jest.fn(),
  })),
}));

// Mock clipboard API
Object.defineProperty(navigator, "clipboard", {
  value: {
    writeText: jest.fn(),
  },
});

// Mock fetch API
global.fetch = jest.fn();

describe("QuizResults", () => {
  const mockQuizId = "quiz-123";
  const mockResultId = "result-456";

  const mockResult = {
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
        correctAnswer:
          "The water cycle involves evaporation, condensation, precipitation, and collection.",
        userAnswer: "Water goes up and then falls down as rain.",
        isCorrect: false,
        explanation:
          "The water cycle is more complex and involves specific processes like evaporation, condensation, precipitation, and collection.",
      },
    ],
    isShared: false,
    shareUrl: null,
  };

  const mockSharedResult = {
    ...mockResult,
    isShared: true,
    shareUrl: "abc123xyz",
  };

  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();

    // Default successful fetch response
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(mockResult),
    });
  });

  it("renders loading state initially", () => {
    render(<QuizResults quizId={mockQuizId} resultId={mockResultId} />);
    expect(screen.getByText("Loading Results...")).toBeInTheDocument();
  });

  it("renders quiz result data after loading", async () => {
    render(<QuizResults quizId={mockQuizId} resultId={mockResultId} />);

    await waitFor(() => {
      expect(screen.getByText("Test Quiz - Results")).toBeInTheDocument();
      expect(
        screen.getByText("From document: test-document.pdf")
      ).toBeInTheDocument();
      expect(screen.getByText("66.7%")).toBeInTheDocument();
      expect(screen.getByText("20 / 30 points")).toBeInTheDocument();
    });
  });

  it("displays correct score statistics", async () => {
    render(<QuizResults quizId={mockQuizId} resultId={mockResultId} />);

    await waitFor(() => {
      expect(screen.getByText("2 Correct")).toBeInTheDocument(); // 2 of 3 responses are correct
      expect(screen.getByText("67% of answers")).toBeInTheDocument(); // rounded from 66.7%
      expect(screen.getByText("1 Incorrect")).toBeInTheDocument();
      expect(screen.getByText("33% of answers")).toBeInTheDocument(); // rounded from 33.3%
    });
  });

  it("formats time taken correctly", async () => {
    render(<QuizResults quizId={mockQuizId} resultId={mockResultId} />);

    await waitFor(() => {
      expect(screen.getByText("3 mins 0 secs")).toBeInTheDocument();
      expect(screen.getByText("~60s per question")).toBeInTheDocument(); // 180 seconds / 3 questions
    });
  });

  it("displays feedback message", async () => {
    render(<QuizResults quizId={mockQuizId} resultId={mockResultId} />);

    await waitFor(() => {
      expect(
        screen.getByText(
          "Good job! You have a solid understanding of the material."
        )
      ).toBeInTheDocument();
    });
  });

  it("displays answers tab with question responses", async () => {
    render(<QuizResults quizId={mockQuizId} resultId={mockResultId} />);

    await waitFor(() => {
      expect(screen.getByRole("tab", { name: "Answers" })).toBeInTheDocument();
      expect(
        screen.getByText("What is the capital of France?")
      ).toBeInTheDocument();
    });

    // Check that correct/incorrect badges are displayed
    expect(screen.getAllByText("Correct").length).toBe(2); // 2 correct answers
    expect(screen.getByText("Incorrect")).toBeInTheDocument(); // 1 incorrect answer
  });

  it("expands answer details when clicking on an accordion item", async () => {
    render(<QuizResults quizId={mockQuizId} resultId={mockResultId} />);

    await waitFor(() => {
      expect(
        screen.getByText("What is the capital of France?")
      ).toBeInTheDocument();
    });

    // Click to expand the first question
    fireEvent.click(screen.getByText("What is the capital of France?"));

    // Check that detailed content is now visible
    expect(screen.getByText("Correct Answer:")).toBeInTheDocument();
    expect(screen.getByText("Your Answer:")).toBeInTheDocument();
    expect(
      screen.getByText("Paris is the capital city of France.")
    ).toBeInTheDocument();
  });

  it("switches to summary tab", async () => {
    render(<QuizResults quizId={mockQuizId} resultId={mockResultId} />);

    await waitFor(() => {
      expect(screen.getByRole("tab", { name: "Summary" })).toBeInTheDocument();
    });

    // Click on Summary tab
    fireEvent.click(screen.getByRole("tab", { name: "Summary" }));

    // Check summary content is displayed
    expect(screen.getByText("Score Breakdown")).toBeInTheDocument();
    expect(screen.getByText("Completion Time")).toBeInTheDocument();
    expect(screen.getByText("3 mins 0 secs")).toBeInTheDocument();
    expect(screen.getByText("Completed At")).toBeInTheDocument();

    // Check that the date is properly formatted (actual format depends on locale)
    expect(screen.getByText(/2025/)).toBeInTheDocument(); // Just check for year presence
  });

  it("handles sharing settings toggle", async () => {
    // Mock the API response for toggling sharing
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResult),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({
          ...mockResult,
          isShared: true,
          shareUrl: "abc123xyz",
        }),
      });

    // Setup a mock for window.location.origin
    Object.defineProperty(window, "location", {
      value: {
        origin: "https://example.com",
      },
      writable: true,
    });

    render(<QuizResults quizId={mockQuizId} resultId={mockResultId} />);

    await waitFor(() => {
      expect(screen.getByText("Share Results")).toBeInTheDocument();
    });

    // Toggle sharing on
    fireEvent.click(screen.getByRole("switch", { name: "Share Results" }));

    // Check that the API was called with correct parameters
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        `/api/quiz/${mockQuizId}/results`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            resultId: mockResult.id,
            isShared: true,
          }),
        }
      );

      // Check that the "Updated" confirmation appears
      expect(screen.getByText("✓ Updated")).toBeInTheDocument();
    });
  });

  it("displays share URL when results are shared", async () => {
    // Mock result that is already shared
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue(mockSharedResult),
    });

    // Setup a mock for window.location.origin
    Object.defineProperty(window, "location", {
      value: {
        origin: "https://example.com",
      },
      writable: true,
    });

    render(<QuizResults quizId={mockQuizId} resultId={mockResultId} />);

    await waitFor(() => {
      expect(
        screen.getByRole("switch", { name: "Share Results" })
      ).toBeChecked();

      // Look for the share URL
      expect(
        screen.getByText(
          /https:\/\/example.com\/quiz\/quiz-123\/results\?resultId=result-456&shareCode=abc123xyz/
        )
      ).toBeInTheDocument();
    });
  });

  it("copies share URL to clipboard when copy button is clicked", async () => {
    // Mock result that is already shared
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue(mockSharedResult),
    });

    // Setup a mock for window.location.origin
    Object.defineProperty(window, "location", {
      value: {
        origin: "https://example.com",
      },
      writable: true,
    });

    render(<QuizResults quizId={mockQuizId} resultId={mockResultId} />);

    await waitFor(() => {
      expect(
        screen.getByText(
          /https:\/\/example.com\/quiz\/quiz-123\/results\?resultId=result-456&shareCode=abc123xyz/
        )
      ).toBeInTheDocument();
    });

    // Find and click the copy button (by getting the parent of the ClipboardCopy icon)
    const copyButton = screen.getAllByRole("button")[2]; // This might be brittle
    fireEvent.click(copyButton);

    // Check that the clipboard API was called with the correct URL
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      "https://example.com/quiz/quiz-123/results?resultId=result-456&shareCode=abc123xyz"
    );
  });

  it("opens share dialog when share button is clicked", async () => {
    render(<QuizResults quizId={mockQuizId} resultId={mockResultId} />);

    await waitFor(() => {
      expect(screen.getByText("Test Quiz - Results")).toBeInTheDocument();
    });

    // Click the Share button
    fireEvent.click(screen.getByRole("button", { name: "Share" }));

    // Check that the dialog is displayed
    expect(screen.getByText("Share Your Quiz Results")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Your quiz results are currently private. Enable sharing to get a link."
      )
    ).toBeInTheDocument();
  });

  it("navigates to create new quiz with correct document ID", async () => {
    const mockRouter = {
      push: jest.fn(),
      back: jest.fn(),
    };
    (useRouter as jest.Mock).mockReturnValue(mockRouter);

    render(<QuizResults quizId={mockQuizId} resultId={mockResultId} />);

    await waitFor(() => {
      expect(screen.getByText("Test Quiz - Results")).toBeInTheDocument();
    });

    // Click the Create New Quiz button
    fireEvent.click(screen.getByRole("button", { name: "Create New Quiz" }));

    // Check that router.push was called with the correct URL
    expect(mockRouter.push).toHaveBeenCalledWith(
      "/quiz/new?documentId=doc-123"
    );
  });

  it("handles API errors during result fetching", async () => {
    // Mock fetch failure
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: "Not Found",
    });

    render(<QuizResults quizId={mockQuizId} resultId="invalid-result" />);

    await waitFor(() => {
      expect(screen.getByText("Error")).toBeInTheDocument();
      expect(
        screen.getByText("There was a problem loading the quiz results")
      ).toBeInTheDocument();
      expect(screen.getByText("Failed to load result")).toBeInTheDocument();
    });
  });

  it("handles API errors during sharing toggle", async () => {
    // First fetch succeeds (initial load)
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResult),
      })
      // Second fetch fails (sharing toggle)
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
      });

    render(<QuizResults quizId={mockQuizId} resultId={mockResultId} />);

    await waitFor(() => {
      expect(screen.getByText("Share Results")).toBeInTheDocument();
    });

    // Toggle sharing on
    fireEvent.click(screen.getByRole("switch", { name: "Share Results" }));

    // Check for error message
    await waitFor(() => {
      expect(
        screen.getByText("Failed to update sharing settings")
      ).toBeInTheDocument();
    });
  });
});
