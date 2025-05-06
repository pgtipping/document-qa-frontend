import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import QuizGenerator from "@/components/QuizGenerator";

// Mock the fetch function for document data
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ id: "generated-quiz-id" }),
  })
) as jest.Mock;

// Mock router
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe("Difficulty Selection Component in QuizGenerator", () => {
  const mockDocuments = [
    { id: "doc-1", filename: "Sample Document 1.pdf" },
    { id: "doc-2", filename: "Sample Document 2.docx" },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders difficulty selection buttons with correct styling", () => {
    render(<QuizGenerator documents={mockDocuments} />);

    // Find difficulty selection label
    expect(screen.getByText("Difficulty")).toBeInTheDocument();

    // Find difficulty buttons
    const easyButton = screen.getByText("Easy");
    const mediumButton = screen.getByText("Medium");
    const hardButton = screen.getByText("Hard");

    expect(easyButton).toBeInTheDocument();
    expect(mediumButton).toBeInTheDocument();
    expect(hardButton).toBeInTheDocument();

    // Medium should be selected by default (have special border)
    expect(mediumButton.closest("button")).toHaveClass("border-2");
    expect(mediumButton.closest("button")).toHaveClass("border-amber-500");

    // Easy and Hard should not have selection styling
    expect(easyButton.closest("button")).not.toHaveClass("border-2");
    expect(hardButton.closest("button")).not.toHaveClass("border-2");
  });

  it("updates selected difficulty when clicking on difficulty buttons", () => {
    render(<QuizGenerator documents={mockDocuments} />);

    // Get the difficulty buttons
    const easyButton = screen.getByText("Easy");
    const mediumButton = screen.getByText("Medium");
    const hardButton = screen.getByText("Hard");

    // Initially medium should be selected
    expect(mediumButton.closest("button")).toHaveClass("border-2");

    // Click on Easy
    fireEvent.click(easyButton);

    // Now Easy should be selected
    expect(easyButton.closest("button")).toHaveClass("border-2");
    expect(easyButton.closest("button")).toHaveClass("border-green-500");
    expect(mediumButton.closest("button")).not.toHaveClass("border-2");

    // Click on Hard
    fireEvent.click(hardButton);

    // Now Hard should be selected
    expect(hardButton.closest("button")).toHaveClass("border-2");
    expect(hardButton.closest("button")).toHaveClass("border-red-500");
    expect(easyButton.closest("button")).not.toHaveClass("border-2");
  });

  it("displays difficulty descriptions in hover cards", () => {
    render(<QuizGenerator documents={mockDocuments} />);

    // Hover over Easy button to show description
    fireEvent.mouseOver(screen.getByText("Easy"));

    // Check if hover card content is displayed
    expect(screen.getByText("Easy Difficulty")).toBeInTheDocument();
    expect(
      screen.getByText(/Basic recall and comprehension questions/)
    ).toBeInTheDocument();

    // Hover over Medium button to show description
    fireEvent.mouseOver(screen.getByText("Medium"));

    // Check if hover card content is displayed
    expect(screen.getByText("Medium Difficulty")).toBeInTheDocument();
    expect(
      screen.getByText(/Application and analysis questions/)
    ).toBeInTheDocument();

    // Hover over Hard button to show description
    fireEvent.mouseOver(screen.getByText("Hard"));

    // Check if hover card content is displayed
    expect(screen.getByText("Hard Difficulty")).toBeInTheDocument();
    expect(
      screen.getByText(/Evaluation and synthesis questions/)
    ).toBeInTheDocument();
  });

  it("submits the selected difficulty when generating a quiz", async () => {
    render(<QuizGenerator documents={mockDocuments} />);

    // Select a document first
    const documentSelect = screen.getByText("Select a document");
    fireEvent.click(documentSelect);
    fireEvent.click(screen.getByText("Sample Document 1.pdf"));

    // Select Hard difficulty
    fireEvent.click(screen.getByText("Hard"));

    // Click Generate Quiz button
    fireEvent.click(screen.getByText("Generate Quiz"));

    // Check that fetch was called with the correct difficulty
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/quiz/generate",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining('"difficulty":"hard"'),
      })
    );
  });

  it("resets difficulty to medium when clicking reset button", () => {
    render(<QuizGenerator documents={mockDocuments} />);

    // First select Hard difficulty
    fireEvent.click(screen.getByText("Hard"));

    // Hard should be selected
    expect(screen.getByText("Hard").closest("button")).toHaveClass("border-2");

    // Click Reset button
    fireEvent.click(screen.getByText("Reset"));

    // Medium should be selected again
    expect(screen.getByText("Medium").closest("button")).toHaveClass(
      "border-2"
    );
    expect(screen.getByText("Hard").closest("button")).not.toHaveClass(
      "border-2"
    );
  });
});
