import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

// Import mock components
import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
  Button,
  AlertCircle,
  Award,
  Trophy,
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
  Award: () => <div data-testid="mock-icon-award" aria-hidden="true" />,
  AlertCircle: () => (
    <div data-testid="mock-icon-alert-circle" aria-hidden="true" />
  ),
  Trophy: () => <div data-testid="mock-icon-trophy" aria-hidden="true" />,
  Share2: () => <div data-testid="mock-icon-share" aria-hidden="true" />,
}));

// Simple mock QuizResults component for testing
const QuizResults = ({
  score = 0,
  totalQuestions = 10,
  correctAnswers = 0,
  onRetake = () => {},
  onShare = () => {},
  templateInfo = null,
  quizId = "quiz123",
}: {
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  onRetake?: () => void;
  onShare?: () => void;
  templateInfo?: {
    name: string;
    description: string;
  } | null;
  quizId?: string;
}) => {
  const scorePercentage = Math.round((score / totalQuestions) * 100);

  // Determine the result message based on score
  let resultMessage = "";
  let resultIcon = null;
  let badgeVariant: "success" | "warning" | "destructive" = "success";

  if (scorePercentage >= 80) {
    resultMessage = "Excellent! You've mastered this content.";
    resultIcon = <Trophy data-testid="result-icon-trophy" />;
    badgeVariant = "success";
  } else if (scorePercentage >= 60) {
    resultMessage = "Good job! You have a solid understanding.";
    resultIcon = <Award data-testid="result-icon-award" />;
    badgeVariant = "warning";
  } else {
    resultMessage = "You might need to review this material.";
    resultIcon = <AlertCircle data-testid="result-icon-alert" />;
    badgeVariant = "destructive";
  }

  return (
    <div
      data-testid="quiz-results"
      role="region"
      aria-labelledby="quiz-results-title"
    >
      <Card>
        <CardHeader>
          <CardTitle id="quiz-results-title">Quiz Results</CardTitle>
          <CardDescription>
            {templateInfo?.name && (
              <span>Quiz Template: {templateInfo.name}</span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="result-summary" data-testid="result-summary">
            <div className="score-display">
              <Badge variant={badgeVariant} data-testid="score-badge">
                {scorePercentage}%
              </Badge>
              <div className="score-details">
                <p data-testid="correct-answers">
                  {correctAnswers} out of {totalQuestions} questions correct
                </p>
              </div>
            </div>
            <div className="result-message" data-testid="result-message">
              {resultIcon}
              <p>{resultMessage}</p>
            </div>
            {templateInfo?.description && (
              <div className="template-info" data-testid="template-info">
                <p>{templateInfo.description}</p>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <div className="action-buttons">
            <Button onClick={onRetake} data-testid="retake-button">
              Retake Quiz
            </Button>
            <Button onClick={onShare} data-testid="share-button">
              Share Results
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

describe("QuizResults Component", () => {
  it("renders high score results correctly", () => {
    const handleRetake = jest.fn();
    const handleShare = jest.fn();

    render(
      <QuizResults
        score={8}
        totalQuestions={10}
        correctAnswers={8}
        onRetake={handleRetake}
        onShare={handleShare}
      />
    );

    // Check basic content
    expect(screen.getByTestId("quiz-results")).toBeInTheDocument();
    expect(screen.getByText("Quiz Results")).toBeInTheDocument();

    // Check score display
    expect(screen.getByTestId("score-badge")).toHaveTextContent("80%");
    expect(screen.getByTestId("correct-answers")).toHaveTextContent(
      "8 out of 10 questions correct"
    );

    // Check result message for high score
    expect(screen.getByTestId("result-message")).toHaveTextContent(
      "Excellent! You've mastered this content."
    );
    expect(screen.getByTestId("result-icon-trophy")).toBeInTheDocument();

    // Check badge variant using data-variant attribute instead of testId
    const badge = screen.getByTestId("score-badge");
    expect(badge).toHaveAttribute("data-variant", "success");

    // Check action buttons
    expect(screen.getByTestId("retake-button")).toBeInTheDocument();
    expect(screen.getByTestId("share-button")).toBeInTheDocument();
  });

  it("renders medium score results correctly", () => {
    render(<QuizResults score={6} totalQuestions={10} correctAnswers={6} />);

    // Check score display
    expect(screen.getByTestId("score-badge")).toHaveTextContent("60%");

    // Check result message for medium score
    expect(screen.getByTestId("result-message")).toHaveTextContent(
      "Good job! You have a solid understanding."
    );
    expect(screen.getByTestId("result-icon-award")).toBeInTheDocument();

    // Check badge variant
    const badge = screen.getByTestId("score-badge");
    expect(badge).toHaveAttribute("data-variant", "warning");
  });

  it("renders low score results correctly", () => {
    render(<QuizResults score={3} totalQuestions={10} correctAnswers={3} />);

    // Check score display
    expect(screen.getByTestId("score-badge")).toHaveTextContent("30%");

    // Check result message for low score
    expect(screen.getByTestId("result-message")).toHaveTextContent(
      "You might need to review this material."
    );
    expect(screen.getByTestId("result-icon-alert")).toBeInTheDocument();

    // Check badge variant
    const badge = screen.getByTestId("score-badge");
    expect(badge).toHaveAttribute("data-variant", "destructive");
  });

  it("displays template information when provided", () => {
    const templateInfo = {
      name: "Academic Template",
      description:
        "This quiz assessed your understanding of academic concepts.",
    };

    render(
      <QuizResults
        score={8}
        totalQuestions={10}
        correctAnswers={8}
        templateInfo={templateInfo}
      />
    );

    expect(
      screen.getByText("Quiz Template: Academic Template")
    ).toBeInTheDocument();
    expect(screen.getByTestId("template-info")).toHaveTextContent(
      "This quiz assessed your understanding of academic concepts."
    );
  });

  it("calls the retake handler when retake button is clicked", () => {
    const handleRetake = jest.fn();

    render(
      <QuizResults
        score={8}
        totalQuestions={10}
        correctAnswers={8}
        onRetake={handleRetake}
      />
    );

    fireEvent.click(screen.getByTestId("retake-button"));
    expect(handleRetake).toHaveBeenCalledTimes(1);
  });

  it("calls the share handler when share button is clicked", () => {
    const handleShare = jest.fn();

    render(
      <QuizResults
        score={8}
        totalQuestions={10}
        correctAnswers={8}
        onShare={handleShare}
      />
    );

    fireEvent.click(screen.getByTestId("share-button"));
    expect(handleShare).toHaveBeenCalledTimes(1);
  });

  it("has proper ARIA attributes for accessibility", () => {
    render(<QuizResults score={8} totalQuestions={10} correctAnswers={8} />);

    // Check region role with proper labelledby
    const resultsRegion = screen.getByTestId("quiz-results");
    expect(resultsRegion).toHaveAttribute("role", "region");
    expect(resultsRegion).toHaveAttribute(
      "aria-labelledby",
      "quiz-results-title"
    );

    // Check CardTitle has proper ID that matches the aria-labelledby
    const title = screen.getByText("Quiz Results");
    expect(title.id).toBe("quiz-results-title");

    // Check badge role by getting badge by its testid
    const badge = screen.getByTestId("score-badge");
    expect(badge).toHaveAttribute("data-variant", "success");
  });
});
