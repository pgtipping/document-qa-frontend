import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QuestionInput } from "@/components/QuestionInput";
import "@testing-library/jest-dom";

describe("QuestionInput", () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  it("renders input field and submit button", () => {
    render(<QuestionInput onSubmit={mockOnSubmit} isLoading={false} />);
    expect(screen.getByPlaceholderText(/ask a question/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /submit/i })).toBeInTheDocument();
  });

  it("handles question submission", async () => {
    render(<QuestionInput onSubmit={mockOnSubmit} isLoading={false} />);

    const input = screen.getByPlaceholderText(/ask a question/i);
    const submitButton = screen.getByRole("button", { name: /submit/i });

    fireEvent.change(input, {
      target: { value: "What is this document about?" },
    });
    fireEvent.click(submitButton);

    expect(mockOnSubmit).toHaveBeenCalledWith("What is this document about?");
  });

  it("disables input and button while loading", () => {
    render(<QuestionInput onSubmit={mockOnSubmit} isLoading={true} />);

    const input = screen.getByPlaceholderText(/ask a question/i);
    const submitButton = screen.getByRole("button", { name: /submit/i });

    expect(input).toBeDisabled();
    expect(submitButton).toBeDisabled();
  });

  it("shows loading state", () => {
    render(<QuestionInput onSubmit={mockOnSubmit} isLoading={true} />);
    expect(screen.getByText(/processing/i)).toBeInTheDocument();
  });

  it("validates minimum question length", () => {
    render(<QuestionInput onSubmit={mockOnSubmit} isLoading={false} />);

    const input = screen.getByPlaceholderText(/ask a question/i);
    const submitButton = screen.getByRole("button", { name: /submit/i });

    fireEvent.change(input, { target: { value: "Hi" } });
    fireEvent.click(submitButton);

    expect(mockOnSubmit).not.toHaveBeenCalled();
    expect(screen.getByText(/question too short/i)).toBeInTheDocument();
  });
});
