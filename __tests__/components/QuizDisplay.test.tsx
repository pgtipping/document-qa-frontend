import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import QuizDisplay from "@/components/QuizDisplay";
import "@testing-library/jest-dom";
import { useRouter } from "next/navigation";

// Mock the useRouter hook
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    back: jest.fn(),
  })),
}));

// Mock fetch API
global.fetch = jest.fn();

describe("QuizDisplay", () => {
  const mockQuizId = "quiz-123";
  const mockQuizData = {
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

  const mockResultResponse = {
    resultId: "result-123",
  };

  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock successful quiz fetch
    (global.fetch as jest.Mock).mockImplementation((url) => {
      if (url === `/api/quiz/${mockQuizId}` && !url.includes("POST")) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockQuizData),
        });
      }

      // Mock successful quiz submission
      if (
        url === `/api/quiz/${mockQuizId}` &&
        (global.fetch as jest.Mock).mock.calls[0][1]?.method === "POST"
      ) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockResultResponse),
        });
      }

      return Promise.reject(new Error("Not found"));
    });
  });

  it("renders loading state initially", () => {
    render(<QuizDisplay quizId={mockQuizId} />);
    expect(screen.getByText("Loading Quiz...")).toBeInTheDocument();
  });

  it("renders quiz title and description after loading", async () => {
    render(<QuizDisplay quizId={mockQuizId} />);

    await waitFor(() => {
      expect(screen.getByText("Test Quiz")).toBeInTheDocument();
      expect(
        screen.getByText("A test quiz for unit testing")
      ).toBeInTheDocument();
    });
  });

  it("displays a timer when quiz has a time limit", async () => {
    render(<QuizDisplay quizId={mockQuizId} />);

    await waitFor(() => {
      // Look for a time format like "10:00"
      expect(screen.getByText(/\d+:\d+/)).toBeInTheDocument();
    });
  });

  it("renders multiple choice questions correctly", async () => {
    render(<QuizDisplay quizId={mockQuizId} />);

    await waitFor(() => {
      expect(
        screen.getByText("What is the capital of France?")
      ).toBeInTheDocument();
      expect(screen.getByText("Choose one option")).toBeInTheDocument();
      expect(screen.getByLabelText("Paris")).toBeInTheDocument();
      expect(screen.getByLabelText("London")).toBeInTheDocument();
      expect(screen.getByLabelText("Berlin")).toBeInTheDocument();
      expect(screen.getByLabelText("Madrid")).toBeInTheDocument();
    });
  });

  it("allows selection of multiple choice answers", async () => {
    render(<QuizDisplay quizId={mockQuizId} />);

    await waitFor(() => {
      expect(screen.getByLabelText("Paris")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByLabelText("Paris"));

    // Check that the radio button is selected
    expect(screen.getByLabelText("Paris")).toBeChecked();
  });

  it("navigates to the next question", async () => {
    render(<QuizDisplay quizId={mockQuizId} />);

    await waitFor(() => {
      expect(
        screen.getByText("What is the capital of France?")
      ).toBeInTheDocument();
    });

    // Click next button
    fireEvent.click(screen.getByText("Next"));

    // Check if second question is displayed
    expect(screen.getByText("The sky is blue.")).toBeInTheDocument();
    expect(screen.getByLabelText("True")).toBeInTheDocument();
    expect(screen.getByLabelText("False")).toBeInTheDocument();
  });

  it("renders true/false questions correctly", async () => {
    render(<QuizDisplay quizId={mockQuizId} />);

    await waitFor(() => {
      expect(
        screen.getByText("What is the capital of France?")
      ).toBeInTheDocument();
    });

    // Navigate to second question
    fireEvent.click(screen.getByText("Next"));

    // Check true/false question display
    expect(screen.getByText("The sky is blue.")).toBeInTheDocument();
    expect(screen.getByText("Select True or False")).toBeInTheDocument();
    expect(screen.getByLabelText("True")).toBeInTheDocument();
    expect(screen.getByLabelText("False")).toBeInTheDocument();
  });

  it("renders short answer questions correctly", async () => {
    render(<QuizDisplay quizId={mockQuizId} />);

    await waitFor(() => {
      expect(
        screen.getByText("What is the capital of France?")
      ).toBeInTheDocument();
    });

    // Navigate to third question (short answer)
    fireEvent.click(screen.getByText("Next"));
    fireEvent.click(screen.getByText("Next"));

    // Check short answer question display
    expect(
      screen.getByText("Explain the water cycle in your own words.")
    ).toBeInTheDocument();
    expect(screen.getByText("Enter your answer")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Enter your answer here...")
    ).toBeInTheDocument();
  });

  it("allows typing in short answer questions", async () => {
    render(<QuizDisplay quizId={mockQuizId} />);

    await waitFor(() => {
      expect(
        screen.getByText("What is the capital of France?")
      ).toBeInTheDocument();
    });

    // Navigate to third question (short answer)
    fireEvent.click(screen.getByText("Next"));
    fireEvent.click(screen.getByText("Next"));

    // Type in an answer
    const textArea = screen.getByPlaceholderText("Enter your answer here...");
    fireEvent.change(textArea, {
      target: {
        value: "Water evaporates, forms clouds, and then precipitates.",
      },
    });

    // Check that the text was entered
    expect(textArea).toHaveValue(
      "Water evaporates, forms clouds, and then precipitates."
    );
  });

  it("submits the quiz on final question", async () => {
    const mockOnComplete = jest.fn();
    render(<QuizDisplay quizId={mockQuizId} onComplete={mockOnComplete} />);

    await waitFor(() => {
      expect(
        screen.getByText("What is the capital of France?")
      ).toBeInTheDocument();
    });

    // Navigate to the last question
    fireEvent.click(screen.getByText("Next"));
    fireEvent.click(screen.getByText("Next"));

    // Submit the quiz
    const submitButton = screen.getByText("Submit Quiz");
    fireEvent.click(submitButton);

    // Wait for submission to complete
    await waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalledWith("result-123");
    });
  });

  it("shows error state when quiz fails to load", async () => {
    // Mock fetch failure
    (global.fetch as jest.Mock).mockImplementationOnce(() =>
      Promise.resolve({
        ok: false,
        status: 404,
        statusText: "Not Found",
      })
    );

    render(<QuizDisplay quizId="invalid-quiz" />);

    await waitFor(() => {
      expect(screen.getByText("Error")).toBeInTheDocument();
      expect(
        screen.getByText("There was a problem loading the quiz")
      ).toBeInTheDocument();
      expect(screen.getByText("Failed to load quiz")).toBeInTheDocument();
    });
  });

  it("properly tracks progress through the quiz", async () => {
    render(<QuizDisplay quizId={mockQuizId} />);

    await waitFor(() => {
      expect(screen.getByText("Question 1 of 3")).toBeInTheDocument();
      expect(screen.getByText("33%")).toBeInTheDocument();
    });

    // Go to next question
    fireEvent.click(screen.getByText("Next"));

    expect(screen.getByText("Question 2 of 3")).toBeInTheDocument();
    expect(screen.getByText("67%")).toBeInTheDocument();

    // Go to last question
    fireEvent.click(screen.getByText("Next"));

    expect(screen.getByText("Question 3 of 3")).toBeInTheDocument();
    expect(screen.getByText("100%")).toBeInTheDocument();
  });

  it("calls router.push when no onComplete is provided", async () => {
    const mockRouter = {
      push: jest.fn(),
      back: jest.fn(),
    };
    (useRouter as jest.Mock).mockReturnValue(mockRouter);

    render(<QuizDisplay quizId={mockQuizId} />);

    await waitFor(() => {
      expect(
        screen.getByText("What is the capital of France?")
      ).toBeInTheDocument();
    });

    // Navigate to the last question
    fireEvent.click(screen.getByText("Next"));
    fireEvent.click(screen.getByText("Next"));

    // Submit the quiz
    fireEvent.click(screen.getByText("Submit Quiz"));

    // Check that router.push was called with the correct URL
    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith(
        "/quiz/quiz-123/results?resultId=result-123"
      );
    });
  });
});
