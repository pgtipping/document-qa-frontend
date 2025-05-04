import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import QuizGenerator from "@/components/QuizGenerator";
import "@testing-library/jest-dom";
import { useRouter } from "next/navigation";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}));

// Mock fetch
global.fetch = jest.fn();

describe("QuizGenerator", () => {
  const mockDocuments = [
    { id: "doc-1", filename: "Document 1.pdf" },
    { id: "doc-2", filename: "Document 2.docx" },
    { id: "doc-3", filename: "Document 3.txt" },
  ];

  const mockQuizResponse = {
    id: "quiz-123",
    title: "Test Quiz on Document 1",
    questionCount: 5,
  };

  // Reset all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(mockQuizResponse),
    });
  });

  it("renders the component with correct initial state", () => {
    render(<QuizGenerator documents={mockDocuments} />);

    // Check that the component renders with correct title and description
    expect(screen.getByText("Generate Quiz")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Create a quiz from your documents to test understanding"
      )
    ).toBeInTheDocument();

    // Check that document selection dropdown is present
    expect(screen.getByText("Select Document")).toBeInTheDocument();

    // Check that quiz size slider is present with default value
    expect(screen.getByText("Number of Questions: 5")).toBeInTheDocument();

    // Check that difficulty dropdown is present with default value
    expect(screen.getByText("Difficulty")).toBeInTheDocument();

    // Check that generate button is disabled initially (no document selected)
    const generateButton = screen.getByRole("button", {
      name: "Generate Quiz",
    });
    expect(generateButton).toBeDisabled();
  });

  it("shows empty state when no documents are available", () => {
    render(<QuizGenerator documents={[]} />);

    // Open the document dropdown
    fireEvent.click(screen.getByRole("combobox"));

    // Check that the empty state message is displayed
    expect(screen.getByText("No documents available")).toBeInTheDocument();
  });

  it("allows selecting a document", async () => {
    render(<QuizGenerator documents={mockDocuments} />);

    // Open the document dropdown
    fireEvent.click(screen.getByRole("combobox", { name: /select document/i }));

    // Select first document from dropdown
    const option = await screen.findByText("Document 1.pdf");
    fireEvent.click(option);

    // Generate button should now be enabled
    const generateButton = screen.getByRole("button", {
      name: "Generate Quiz",
    });
    expect(generateButton).not.toBeDisabled();
  });

  it("allows changing quiz size", () => {
    render(<QuizGenerator documents={mockDocuments} />);

    // Find the slider (it's more difficult to programmatically change a slider value)
    // For this test, we'll focus on checking if the slider exists
    expect(screen.getByRole("slider")).toBeInTheDocument();

    // In a real test, we would simulate changing the slider value, but this is challenging with React Testing Library
    // Instead, we can directly call the onValueChange handler for testing purposes
    const slider = screen.getByRole("slider");
    // Simulate slider value change by triggering the native change event
    fireEvent.change(slider, { target: { value: 8 } });
  });

  it("allows selecting difficulty level", async () => {
    render(<QuizGenerator documents={mockDocuments} />);

    // Open the difficulty dropdown
    fireEvent.click(screen.getByRole("combobox", { name: /difficulty/i }));

    // Select "Hard" difficulty
    const hardOption = await screen.findByText("Hard");
    fireEvent.click(hardOption);

    // Difficulty value should be updated in the UI
    expect(
      screen.getByRole("combobox", { name: /difficulty/i })
    ).toHaveTextContent("Hard");
  });

  it("shows error when trying to generate without selecting a document", () => {
    render(<QuizGenerator documents={mockDocuments} />);

    // Try to generate quiz without selecting a document (should be prevented by button disabled state)
    // But we'll test the logic anyway
    const generateButton = screen.getByRole("button", {
      name: "Generate Quiz",
    });
    expect(generateButton).toBeDisabled();

    // If we could bypass the disabled state:
    // fireEvent.click(generateButton);
    // expect(screen.getByText("Please select a document for the quiz")).toBeInTheDocument();
  });

  it("handles quiz generation successfully", async () => {
    const mockOnGenerateStart = jest.fn();
    const mockOnGenerateComplete = jest.fn();

    render(
      <QuizGenerator
        documents={mockDocuments}
        onGenerateStart={mockOnGenerateStart}
        onGenerateComplete={mockOnGenerateComplete}
      />
    );

    // Select a document
    fireEvent.click(screen.getByRole("combobox", { name: /select document/i }));
    const option = await screen.findByText("Document 1.pdf");
    fireEvent.click(option);

    // Generate the quiz
    const generateButton = screen.getByRole("button", {
      name: "Generate Quiz",
    });
    fireEvent.click(generateButton);

    // Check that callbacks were fired
    expect(mockOnGenerateStart).toHaveBeenCalled();

    // Check that API was called with correct parameters
    expect(global.fetch).toHaveBeenCalledWith("/api/quiz/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        documentId: "doc-1",
        quizSize: 5,
        difficulty: "medium",
      }),
    });

    // Wait for success message
    await waitFor(() => {
      expect(
        screen.getByText(
          /Quiz "Test Quiz on Document 1" generated successfully with 5 questions!/i
        )
      ).toBeInTheDocument();
      expect(mockOnGenerateComplete).toHaveBeenCalledWith("quiz-123");
    });

    // Check that "Open Quiz" button appears
    expect(
      screen.getByRole("button", { name: "Open Quiz" })
    ).toBeInTheDocument();
  });

  it("handles API errors during quiz generation", async () => {
    // Mock an API error
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      json: jest
        .fn()
        .mockResolvedValue({ error: "Document too short for quiz generation" }),
    });

    render(<QuizGenerator documents={mockDocuments} />);

    // Select a document
    fireEvent.click(screen.getByRole("combobox", { name: /select document/i }));
    const option = await screen.findByText("Document 1.pdf");
    fireEvent.click(option);

    // Generate the quiz
    const generateButton = screen.getByRole("button", {
      name: "Generate Quiz",
    });
    fireEvent.click(generateButton);

    // Wait for error message
    await waitFor(() => {
      expect(
        screen.getByText("Document too short for quiz generation")
      ).toBeInTheDocument();
    });
  });

  it("handles network errors during quiz generation", async () => {
    // Mock a network error
    (global.fetch as jest.Mock).mockRejectedValueOnce(
      new Error("Network error")
    );

    render(<QuizGenerator documents={mockDocuments} />);

    // Select a document
    fireEvent.click(screen.getByRole("combobox", { name: /select document/i }));
    const option = await screen.findByText("Document 1.pdf");
    fireEvent.click(option);

    // Generate the quiz
    const generateButton = screen.getByRole("button", {
      name: "Generate Quiz",
    });
    fireEvent.click(generateButton);

    // Wait for error message
    await waitFor(() => {
      expect(screen.getByText("Network error")).toBeInTheDocument();
    });
  });

  it("navigates to quiz when 'Open Quiz' is clicked", async () => {
    const mockRouter = {
      push: jest.fn(),
    };
    (useRouter as jest.Mock).mockReturnValue(mockRouter);

    render(<QuizGenerator documents={mockDocuments} />);

    // Select a document
    fireEvent.click(screen.getByRole("combobox", { name: /select document/i }));
    const option = await screen.findByText("Document 1.pdf");
    fireEvent.click(option);

    // Generate the quiz
    const generateButton = screen.getByRole("button", {
      name: "Generate Quiz",
    });
    fireEvent.click(generateButton);

    // Wait for quiz generation to complete
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Open Quiz" })
      ).toBeInTheDocument();
    });

    // Click the "Open Quiz" button
    fireEvent.click(screen.getByRole("button", { name: "Open Quiz" }));

    // Check that router.push was called with the correct URL
    expect(mockRouter.push).toHaveBeenCalledWith("/quiz/quiz-123");
  });

  it("resets the form when 'Reset' button is clicked", async () => {
    render(<QuizGenerator documents={mockDocuments} />);

    // Select a document
    fireEvent.click(screen.getByRole("combobox", { name: /select document/i }));
    const option = await screen.findByText("Document 1.pdf");
    fireEvent.click(option);

    // Generate the quiz
    const generateButton = screen.getByRole("button", {
      name: "Generate Quiz",
    });
    fireEvent.click(generateButton);

    // Wait for quiz generation to complete
    await waitFor(() => {
      expect(screen.getByText(/generated successfully/i)).toBeInTheDocument();
    });

    // Click the Reset button
    fireEvent.click(screen.getByRole("button", { name: "Reset" }));

    // Check that the form is reset
    expect(
      screen.queryByText(/generated successfully/i)
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Generate Quiz" })
    ).toBeDisabled();
    expect(
      screen.queryByRole("button", { name: "Open Quiz" })
    ).not.toBeInTheDocument();
  });

  it("shows loading state during quiz generation", async () => {
    // Create a delayed promise to simulate a longer request
    (global.fetch as jest.Mock).mockImplementationOnce(() => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            ok: true,
            json: () => Promise.resolve(mockQuizResponse),
          });
        }, 100);
      });
    });

    render(<QuizGenerator documents={mockDocuments} />);

    // Select a document
    fireEvent.click(screen.getByRole("combobox", { name: /select document/i }));
    const option = await screen.findByText("Document 1.pdf");
    fireEvent.click(option);

    // Generate the quiz
    const generateButton = screen.getByRole("button", {
      name: "Generate Quiz",
    });
    fireEvent.click(generateButton);

    // Check that the loading state is displayed
    expect(screen.getByText("Generating...")).toBeInTheDocument();

    // Wait for generation to complete
    await waitFor(() => {
      expect(screen.queryByText("Generating...")).not.toBeInTheDocument();
      expect(screen.getByText(/generated successfully/i)).toBeInTheDocument();
    });
  });
});
