import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

// Simple card component for quiz items
const SimpleQuizCard = ({
  title,
  description,
  onSelect,
  isSelected = false,
}: {
  title: string;
  description: string;
  onSelect: () => void;
  isSelected?: boolean;
}) => {
  return (
    <div
      className={`quiz-card ${isSelected ? "selected" : ""}`}
      data-testid="quiz-card"
      onClick={onSelect}
    >
      <h3 data-testid="quiz-title">{title}</h3>
      <p data-testid="quiz-description">{description}</p>
      <div className="selection-indicator">
        {isSelected ? <span data-testid="selected-icon">✓</span> : null}
      </div>
    </div>
  );
};

describe("SimpleQuizCard", () => {
  it("renders the title and description", () => {
    const mockSelect = jest.fn();
    render(
      <SimpleQuizCard
        title="Test Quiz"
        description="A test quiz description"
        onSelect={mockSelect}
      />
    );

    expect(screen.getByTestId("quiz-title")).toHaveTextContent("Test Quiz");
    expect(screen.getByTestId("quiz-description")).toHaveTextContent(
      "A test quiz description"
    );
  });

  it("shows the selection indicator when selected", () => {
    const mockSelect = jest.fn();
    render(
      <SimpleQuizCard
        title="Test Quiz"
        description="A test quiz description"
        onSelect={mockSelect}
        isSelected={true}
      />
    );

    expect(screen.getByTestId("selected-icon")).toBeInTheDocument();
    expect(screen.getByTestId("quiz-card")).toHaveClass("selected");
  });

  it("does not show the selection indicator when not selected", () => {
    const mockSelect = jest.fn();
    render(
      <SimpleQuizCard
        title="Test Quiz"
        description="A test quiz description"
        onSelect={mockSelect}
        isSelected={false}
      />
    );

    expect(screen.queryByTestId("selected-icon")).not.toBeInTheDocument();
    expect(screen.getByTestId("quiz-card")).not.toHaveClass("selected");
  });

  it("calls onSelect when clicked", () => {
    const mockSelect = jest.fn();
    render(
      <SimpleQuizCard
        title="Test Quiz"
        description="A test quiz description"
        onSelect={mockSelect}
      />
    );

    fireEvent.click(screen.getByTestId("quiz-card"));
    expect(mockSelect).toHaveBeenCalledTimes(1);
  });
});
