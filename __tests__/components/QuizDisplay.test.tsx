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

// Mock the UI components
jest.mock("@/components/ui/card", () => ({
  Card: ({ children, ...props }: any) => (
    <div data-testid="mock-card" role="region" {...props}>
      {children}
    </div>
  ),
  CardContent: ({ children, ...props }: any) => (
    <div data-testid="mock-card-content" {...props}>
      {children}
    </div>
  ),
  CardHeader: ({ children, ...props }: any) => (
    <div data-testid="mock-card-header" {...props}>
      {children}
    </div>
  ),
  CardFooter: ({ children, ...props }: any) => (
    <div data-testid="mock-card-footer" {...props}>
      {children}
    </div>
  ),
  CardTitle: ({ children, ...props }: any) => (
    <div data-testid="mock-card-title" role="heading" aria-level="2" {...props}>
      {children}
    </div>
  ),
  CardDescription: ({ children, ...props }: any) => (
    <div data-testid="mock-card-description" {...props}>
      {children}
    </div>
  ),
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button
      onClick={onClick}
      data-testid="mock-button"
      type={props.type || "button"}
      {...props}
    >
      {children}
    </button>
  ),
}));

jest.mock("@/components/ui/badge", () => ({
  Badge: ({ children, variant, ...props }: any) => (
    <span
      data-testid={`mock-badge-${variant || "default"}`}
      data-variant={variant || "default"}
      role="status"
      {...props}
    >
      {children}
    </span>
  ),
}));

jest.mock("@/components/ui/radio-group", () => ({
  RadioGroup: ({ children, ...props }: any) => (
    <div data-testid="mock-radio-group" {...props}>
      {children}
    </div>
  ),
  RadioGroupItem: ({ value, id, ...props }: any) => (
    <input
      type="radio"
      id={id}
      value={value}
      data-testid={`mock-radio-item-${value}`}
      {...props}
    />
  ),
}));

jest.mock("@/components/ui/textarea", () => ({
  Textarea: (props: any) => <textarea data-testid="mock-textarea" {...props} />,
}));

jest.mock("@/components/ui/label", () => ({
  Label: ({ children, htmlFor, ...props }: any) => (
    <label htmlFor={htmlFor} data-testid="mock-label" {...props}>
      {children}
    </label>
  ),
}));

jest.mock("@/components/ui/progress", () => ({
  Progress: (props: any) => (
    <div
      data-testid="mock-progress"
      role="progressbar"
      aria-valuenow={String(props.value)}
      {...props}
    />
  ),
}));

jest.mock("@/components/ui/alert", () => ({
  Alert: ({ children, ...props }: any) => (
    <div data-testid="mock-alert" {...props}>
      {children}
    </div>
  ),
  AlertTitle: ({ children, ...props }: any) => (
    <div data-testid="mock-alert-title" {...props}>
      {children}
    </div>
  ),
  AlertDescription: ({ children, ...props }: any) => (
    <div data-testid="mock-alert-description" {...props}>
      {children}
    </div>
  ),
}));

// Use an absolute mock for CountdownTimer since path resolution seems to be an issue
jest.mock("../../src/ui/CountdownTimer", () => ({
  CountdownTimer: ({ timeRemaining, ...props }: any) => {
    // Ensure timeRemaining is a number to prevent NaN display
    const seconds = typeof timeRemaining === "number" ? timeRemaining : 600;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    const formattedTime = `${minutes}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;

    return (
      <div data-testid="mock-timer" {...props}>
        {formattedTime}
      </div>
    );
  },
}));

jest.mock("lucide-react", () => ({
  ArrowLeft: () => (
    <div data-testid="mock-icon-arrow-left" aria-hidden="true" />
  ),
  ArrowRight: () => (
    <div data-testid="mock-icon-arrow-right" aria-hidden="true" />
  ),
  Flag: () => <div data-testid="mock-icon-flag" aria-hidden="true" />,
  AlertCircle: () => (
    <div data-testid="mock-icon-alert-circle" aria-hidden="true" />
  ),
  Zap: () => <div data-testid="mock-icon-zap" aria-hidden="true" />,
  Trophy: () => <div data-testid="mock-icon-trophy" aria-hidden="true" />,
  Badge: () => <div data-testid="mock-icon-badge" aria-hidden="true" />,
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
    (global.fetch as jest.Mock).mockImplementation((url, options) => {
      // For GET requests to fetch the quiz
      if (
        url === `/api/quiz/${mockQuizId}` &&
        (!options || options.method !== "POST")
      ) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockQuizData),
        });
      }

      // For POST requests to submit the quiz - ensure this returns the correct result
      if (
        url === `/api/quiz/${mockQuizId}` &&
        options &&
        options.method === "POST"
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
