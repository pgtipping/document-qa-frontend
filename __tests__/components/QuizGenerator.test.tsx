import { render, screen } from "@testing-library/react";
import QuizGenerator from "@/components/QuizGenerator";
import "@testing-library/jest-dom";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}));

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () =>
      Promise.resolve({
        id: "quiz-123",
        title: "Test Quiz",
        questionCount: 5,
      }),
  })
) as jest.Mock;

// Mock child components to avoid complexity
jest.mock("@/components/quiz/TemplateSelector", () => ({
  __esModule: true,
  default: () => (
    <div data-testid="mock-template-selector">TemplateSelector Mock</div>
  ),
}));

jest.mock("@/components/quiz/TemplatePreview", () => ({
  __esModule: true,
  default: () => (
    <div data-testid="mock-template-preview">TemplatePreview Mock</div>
  ),
}));

describe("QuizGenerator Component", () => {
  const mockDocuments = [
    { id: "doc-1", filename: "Document 1.pdf" },
    { id: "doc-2", filename: "Document 2.docx" },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // A basic test that just verifies the component renders without crashing
  it("should render without crashing", () => {
    render(<QuizGenerator documents={mockDocuments} />);
    // Check that the component renders by looking for the card title
    expect(screen.getByTestId("mock-card-title")).toBeInTheDocument();
  });

  // A simple test to verify document list is rendered
  it("should display document options", () => {
    render(<QuizGenerator documents={mockDocuments} />);
    // Check for the select trigger
    expect(screen.getByTestId("mock-select-trigger")).toBeInTheDocument();
    // Check that document options are present in the select content
    expect(screen.getByTestId("mock-select-item-doc-1")).toBeInTheDocument();
    expect(screen.getByTestId("mock-select-item-doc-2")).toBeInTheDocument();
  });

  // A test that just verifies basic structure
  it("should have generate and reset buttons", () => {
    render(<QuizGenerator documents={mockDocuments} />);
    // Check for buttons using the mock-button data-testid
    const buttons = screen.getAllByTestId("mock-button");
    // Expect at least 2 buttons (Reset and Generate Quiz)
    expect(buttons.length).toBeGreaterThanOrEqual(2);
  });
});
