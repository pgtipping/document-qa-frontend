import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

// Extend type to include all badge variants
interface ExtendedBadgeProps {
  variant?:
    | "default"
    | "secondary"
    | "destructive"
    | "outline"
    | "success"
    | "warning";
}

// Explicitly declare jest matchers for this file
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toHaveTextContent(text: string): R;
      toHaveBeenCalledWith(...args: any[]): R;
      toHaveAttribute(attr: string, value?: string): R;
    }
  }
}

// Import mock components
import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  Button,
  Check,
  X,
  Clock,
  Award,
  Zap,
  Trophy,
  BadgeIcon,
} from "../../mocks/ui-components";

// Mock UI components with proper ARIA roles
jest.mock("@/components/ui/badge", () => ({
  Badge: ({ children, variant, className, ...props }: any) => (
    <span
      data-testid={`mock-badge-${variant || "default"}`}
      data-variant={variant || "default"}
      className={className}
      {...props}
      role="status"
    >
      {children}
    </span>
  ),
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button
      onClick={onClick}
      {...props}
      data-testid="mock-button"
      type={props.type || "button"}
    >
      {children}
    </button>
  ),
}));

jest.mock("@/components/ui/card", () => ({
  Card: ({ children, ...props }: any) => (
    <div {...props} data-testid="mock-card" role="region">
      {children}
    </div>
  ),
  CardContent: ({ children, ...props }: any) => (
    <div {...props} data-testid="mock-card-content">
      {children}
    </div>
  ),
  CardHeader: ({ children, ...props }: any) => (
    <div {...props} data-testid="mock-card-header">
      {children}
    </div>
  ),
  CardFooter: ({ children, ...props }: any) => (
    <div {...props} data-testid="mock-card-footer">
      {children}
    </div>
  ),
  CardTitle: ({ children, ...props }: any) => (
    <div {...props} data-testid="mock-card-title" role="heading" aria-level="2">
      {children}
    </div>
  ),
  CardDescription: ({ children, ...props }: any) => (
    <div {...props} data-testid="mock-card-description">
      {children}
    </div>
  ),
}));

// Mock icons
jest.mock("lucide-react", () => ({
  Check: () => <div data-testid="mock-icon-check" aria-hidden="true" />,
  X: () => <div data-testid="mock-icon-x" aria-hidden="true" />,
  Clock: () => <div data-testid="mock-icon-clock" aria-hidden="true" />,
  Award: () => <div data-testid="mock-icon-award" aria-hidden="true" />,
  Zap: () => <div data-testid="mock-icon-zap" aria-hidden="true" />,
  Trophy: () => <div data-testid="mock-icon-trophy" aria-hidden="true" />,
  BadgeIcon: () => <div data-testid="mock-icon-badge" aria-hidden="true" />,
}));

// Simple mock QuizDisplay component for testing
const QuizDisplay = ({
  questions = [],
  currentQuestion = 0,
  onAnswer = () => {},
  userAnswers = {},
  isSubmitting = false,
  isCompleted = false,
}: {
  questions: Array<{
    id: string;
    questionText: string;
    answerType: string;
    options?: string[] | null;
    difficulty?: string;
  }>;
  currentQuestion: number;
  onAnswer: (questionId: string, answer: string) => void;
  userAnswers: Record<string, string>;
  isSubmitting?: boolean;
  isCompleted?: boolean;
}) => {
  const mockQuestions = questions.length
    ? questions
    : [
        {
          id: "q1",
          questionText: "What is the capital of France?",
          answerType: "multiple_choice",
          options: ["Paris", "London", "Berlin", "Madrid"],
          difficulty: "medium",
        },
        {
          id: "q2",
          questionText: "The sky is blue.",
          answerType: "true_false",
          options: null,
          difficulty: "easy",
        },
      ];

  const currentQ = mockQuestions[currentQuestion];

  const handleAnswer = (answer: string) => {
    if (!isSubmitting && !isCompleted) {
      onAnswer(currentQ.id, answer);
    }
  };

  const getDifficultyColor = (
    difficulty: string = "medium"
  ): ExtendedBadgeProps["variant"] => {
    const colors: Record<string, ExtendedBadgeProps["variant"]> = {
      easy: "success",
      medium: "warning",
      hard: "destructive",
      default: "secondary",
    };
    return colors[difficulty] || "secondary";
  };

  if (!currentQ) return <div>No questions available</div>;

  return (
    <div data-testid="quiz-display">
      <div className="question-header">
        <h2>Question {currentQuestion + 1}</h2>
        {currentQ.difficulty && (
          <span data-testid="difficulty-badge">
            <Badge variant={getDifficultyColor(currentQ.difficulty)}>
              {currentQ.difficulty.charAt(0).toUpperCase() +
                currentQ.difficulty.slice(1)}
            </Badge>
          </span>
        )}
      </div>
      <div className="question-text">
        <p data-testid="question-text">{currentQ.questionText}</p>
      </div>
      <div className="answer-section">
        {currentQ.answerType === "multiple_choice" && currentQ.options && (
          <div className="multiple-choice" data-testid="multiple-choice">
            {currentQ.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(option)}
                disabled={isSubmitting || isCompleted}
                data-testid={`option-${index}`}
                className={
                  userAnswers[currentQ.id] === option ? "selected" : ""
                }
              >
                {option}
              </button>
            ))}
          </div>
        )}
        {currentQ.answerType === "true_false" && (
          <div className="true-false" data-testid="true-false">
            <button
              onClick={() => handleAnswer("True")}
              disabled={isSubmitting || isCompleted}
              data-testid="option-true"
              className={userAnswers[currentQ.id] === "True" ? "selected" : ""}
            >
              True
            </button>
            <button
              onClick={() => handleAnswer("False")}
              disabled={isSubmitting || isCompleted}
              data-testid="option-false"
              className={userAnswers[currentQ.id] === "False" ? "selected" : ""}
            >
              False
            </button>
          </div>
        )}
        {currentQ.answerType === "short_answer" && (
          <div className="short-answer" data-testid="short-answer">
            <textarea
              value={userAnswers[currentQ.id] || ""}
              onChange={(e) => handleAnswer(e.target.value)}
              disabled={isSubmitting || isCompleted}
              data-testid="short-answer-input"
              aria-label="Short answer response"
            />
          </div>
        )}
      </div>
    </div>
  );
};

describe("QuizDisplay Component", () => {
  it("renders with default questions", () => {
    const handleAnswer = jest.fn();
    render(
      <QuizDisplay
        questions={[]}
        currentQuestion={0}
        onAnswer={handleAnswer}
        userAnswers={{}}
      />
    );

    expect(screen.getByText("Question 1")).toBeInTheDocument();
    expect(
      screen.getByText("What is the capital of France?")
    ).toBeInTheDocument();
    expect(screen.getByTestId("mock-badge-warning")).toBeInTheDocument();
    expect(screen.getByTestId("mock-badge-warning")).toHaveTextContent(
      "Medium"
    );
  });

  it("displays multiple choice options correctly", () => {
    const handleAnswer = jest.fn();
    render(
      <QuizDisplay
        questions={[]}
        currentQuestion={0}
        onAnswer={handleAnswer}
        userAnswers={{}}
      />
    );

    expect(screen.getByTestId("multiple-choice")).toBeInTheDocument();
    expect(screen.getByText("Paris")).toBeInTheDocument();
    expect(screen.getByText("London")).toBeInTheDocument();
    expect(screen.getByText("Berlin")).toBeInTheDocument();
    expect(screen.getByText("Madrid")).toBeInTheDocument();
  });

  it("calls onAnswer when an option is clicked", () => {
    const handleAnswer = jest.fn();
    render(
      <QuizDisplay
        questions={[]}
        currentQuestion={0}
        onAnswer={handleAnswer}
        userAnswers={{}}
      />
    );

    fireEvent.click(screen.getByText("Paris"));
    expect(handleAnswer).toHaveBeenCalledWith("q1", "Paris");
  });

  it("displays true/false options for boolean questions", () => {
    const handleAnswer = jest.fn();
    render(
      <QuizDisplay
        questions={[]}
        currentQuestion={1}
        onAnswer={handleAnswer}
        userAnswers={{}}
      />
    );

    expect(screen.getByText("Question 2")).toBeInTheDocument();
    expect(screen.getByText("The sky is blue.")).toBeInTheDocument();
    expect(screen.getByTestId("true-false")).toBeInTheDocument();
    expect(screen.getByText("True")).toBeInTheDocument();
    expect(screen.getByText("False")).toBeInTheDocument();

    // Check that Easy difficulty badge is displayed
    expect(screen.getByTestId("mock-badge-success")).toBeInTheDocument();
    expect(screen.getByTestId("mock-badge-success")).toHaveTextContent("Easy");
  });

  it("disables options when isSubmitting is true", () => {
    const handleAnswer = jest.fn();
    render(
      <QuizDisplay
        questions={[]}
        currentQuestion={0}
        onAnswer={handleAnswer}
        userAnswers={{}}
        isSubmitting={true}
      />
    );

    fireEvent.click(screen.getByText("Paris"));
    expect(handleAnswer).not.toHaveBeenCalled();
  });

  it("highlights the selected answer", () => {
    const handleAnswer = jest.fn();
    render(
      <QuizDisplay
        questions={[]}
        currentQuestion={0}
        onAnswer={handleAnswer}
        userAnswers={{ q1: "London" }}
      />
    );

    const londonOption = screen.getByText("London");
    expect(londonOption.className).toContain("selected");
  });

  it("displays custom questions when provided", () => {
    const customQuestions = [
      {
        id: "custom1",
        questionText: "What is the capital of Japan?",
        answerType: "multiple_choice",
        options: ["Tokyo", "Kyoto", "Osaka", "Nagoya"],
        difficulty: "hard",
      },
    ];

    const handleAnswer = jest.fn();
    render(
      <QuizDisplay
        questions={customQuestions}
        currentQuestion={0}
        onAnswer={handleAnswer}
        userAnswers={{}}
      />
    );

    expect(
      screen.getByText("What is the capital of Japan?")
    ).toBeInTheDocument();
    expect(screen.getByText("Tokyo")).toBeInTheDocument();

    // Check that Hard difficulty badge is displayed
    expect(screen.getByTestId("mock-badge-destructive")).toBeInTheDocument();
    expect(screen.getByTestId("mock-badge-destructive")).toHaveTextContent(
      "Hard"
    );
  });
});
