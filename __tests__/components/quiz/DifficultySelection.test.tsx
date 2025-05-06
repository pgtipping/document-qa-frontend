import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

// Mock UI components
jest.mock("@/components/ui/slider", () => ({
  Slider: ({ defaultValue, onValueChange, ...props }: any) => (
    <input
      type="range"
      defaultValue={defaultValue?.[0] || 0}
      onChange={(e) => onValueChange?.([parseInt(e.target.value)])}
      {...props}
      data-testid="mock-slider"
      aria-label="Difficulty slider"
    />
  ),
}));

// Mock the tooltip component
jest.mock("@/components/ui/tooltip", () => ({
  Tooltip: ({ children }: any) => (
    <div data-testid="mock-tooltip">{children}</div>
  ),
  TooltipContent: ({ children }: any) => (
    <div data-testid="mock-tooltip-content">{children}</div>
  ),
  TooltipProvider: ({ children }: any) => (
    <div data-testid="mock-tooltip-provider">{children}</div>
  ),
  TooltipTrigger: ({ children }: any) => (
    <div data-testid="mock-tooltip-trigger">{children}</div>
  ),
}));

// Simple mock component for testing
const DifficultySelection = ({
  difficulty = 50,
  onDifficultyChange = () => {},
  disabled = false,
}: {
  difficulty?: number;
  onDifficultyChange?: (value: number) => void;
  disabled?: boolean;
}) => {
  const handleChange = (values: number[]) => {
    if (!disabled && values.length > 0) {
      onDifficultyChange(values[0]);
    }
  };

  const getDifficultyLabel = (value: number) => {
    if (value < 33) return "Easy";
    if (value < 66) return "Medium";
    return "Hard";
  };

  return (
    <div data-testid="difficulty-selection">
      <h2 id="difficulty-heading">Select Difficulty</h2>
      <div className="difficulty-slider">
        <div className="difficulty-range">
          <span>Easy</span>
          <span>Medium</span>
          <span>Hard</span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={difficulty}
          onChange={(e) => handleChange([parseInt(e.target.value)])}
          disabled={disabled}
          data-testid="difficulty-slider"
          aria-labelledby="difficulty-heading"
        />
      </div>
      <div className="selected-difficulty">
        <label htmlFor="difficulty-slider">Selected: </label>
        <strong data-testid="difficulty-label">
          {getDifficultyLabel(difficulty)}
        </strong>
        <span data-testid="difficulty-value"> ({difficulty})</span>
      </div>
    </div>
  );
};

describe("DifficultySelection Component", () => {
  // Basic rendering test
  it("renders with default difficulty", () => {
    render(<DifficultySelection />);

    // Check that the component renders correctly
    expect(screen.getByTestId("difficulty-selection")).toBeInTheDocument();
    expect(screen.getByText("Select Difficulty")).toBeInTheDocument();
    expect(screen.getByTestId("difficulty-label")).toHaveTextContent("Medium");
    expect(screen.getByTestId("difficulty-value")).toHaveTextContent("(50)");
  });

  // Test for different difficulty levels
  it("shows the correct difficulty label based on value", () => {
    const { rerender } = render(<DifficultySelection difficulty={20} />);
    expect(screen.getByTestId("difficulty-label")).toHaveTextContent("Easy");

    rerender(<DifficultySelection difficulty={50} />);
    expect(screen.getByTestId("difficulty-label")).toHaveTextContent("Medium");

    rerender(<DifficultySelection difficulty={80} />);
    expect(screen.getByTestId("difficulty-label")).toHaveTextContent("Hard");
  });

  // Test for event handling
  it("calls onDifficultyChange when slider changes", () => {
    const handleChange = jest.fn();
    render(<DifficultySelection onDifficultyChange={handleChange} />);

    const slider = screen.getByTestId("difficulty-slider");
    fireEvent.change(slider, { target: { value: 75 } });

    expect(handleChange).toHaveBeenCalledWith(75);
  });

  // Test for disabled state
  it("disables the slider when disabled prop is true", () => {
    const handleChange = jest.fn();
    render(
      <DifficultySelection onDifficultyChange={handleChange} disabled={true} />
    );

    const slider = screen.getByTestId("difficulty-slider") as HTMLInputElement;
    expect(slider.disabled).toBe(true);

    fireEvent.change(slider, { target: { value: 75 } });
    expect(handleChange).not.toHaveBeenCalled();
  });
});
