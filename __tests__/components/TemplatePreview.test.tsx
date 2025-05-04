import { render, screen } from "@testing-library/react";
import TemplatePreview from "@/components/quiz/TemplatePreview";
import * as templates from "@/lib/quiz-templates";

// Mock the quiz-templates module
jest.mock("@/lib/quiz-templates", () => ({
  getTemplateById: jest.fn(),
  QuizTemplate: {},
}));

describe("TemplatePreview Component", () => {
  const mockTemplate = {
    id: "technical",
    name: "Technical Template",
    description: "For technical documents and code documentation",
    icon: "Code",
    focusAreas: ["Implementation", "Architecture", "Best Practices"],
    exampleQuestions: [
      "What design pattern is used in this code?",
      "Is this code optimized for performance?",
      "What is the main purpose of this function?",
    ],
    questionTypes: {
      multipleChoice: 50,
      trueFalse: 30,
      shortAnswer: 20,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (templates.getTemplateById as jest.Mock).mockReturnValue(mockTemplate);
  });

  it("should render the template preview with the correct template name", () => {
    render(<TemplatePreview templateId="technical" />);

    // Should show the template name in the header
    expect(
      screen.getByText("Template Preview: Technical Template")
    ).toBeInTheDocument();
  });

  it("should display question type distribution bars", () => {
    render(<TemplatePreview templateId="technical" />);

    // Check if question type distribution section is rendered
    expect(screen.getByText("Question Type Distribution")).toBeInTheDocument();

    // Check if percentages are displayed correctly
    expect(screen.getByText("Multiple Choice: 50%")).toBeInTheDocument();
    expect(screen.getByText("True/False: 30%")).toBeInTheDocument();
    expect(screen.getByText("Short Answer: 20%")).toBeInTheDocument();
  });

  it("should display focus areas as badges", () => {
    render(<TemplatePreview templateId="technical" />);

    // Check if focus areas section is rendered
    expect(screen.getByText("Focus Areas")).toBeInTheDocument();

    // Check if focus area badges are displayed
    expect(screen.getByText("Implementation")).toBeInTheDocument();
    expect(screen.getByText("Architecture")).toBeInTheDocument();
    expect(screen.getByText("Best Practices")).toBeInTheDocument();
  });

  it("should display example questions with appropriate icons and difficulty levels", () => {
    render(<TemplatePreview templateId="technical" />);

    // Check if example questions section is rendered
    expect(screen.getByText("Example Questions")).toBeInTheDocument();

    // Check if all example questions are displayed
    expect(
      screen.getByText("What design pattern is used in this code?")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Is this code optimized for performance?")
    ).toBeInTheDocument();
    expect(
      screen.getByText("What is the main purpose of this function?")
    ).toBeInTheDocument();

    // Check for question type indicators (this is more challenging due to SVG icons)
    // Using text-based checks for the types instead
    expect(screen.getByText("multiple choice")).toBeInTheDocument();
    expect(screen.getByText("true false")).toBeInTheDocument();
    expect(screen.getByText("short answer")).toBeInTheDocument();

    // Check for difficulty indicators
    expect(screen.getByText("easy")).toBeInTheDocument();
    expect(screen.getByText("medium")).toBeInTheDocument();
    expect(screen.getByText("hard")).toBeInTheDocument();
  });

  it("should not render anything if template is not found", () => {
    // Mock the template not being found
    (templates.getTemplateById as jest.Mock).mockReturnValue(null);

    const { container } = render(<TemplatePreview templateId="nonexistent" />);

    // Container should be empty
    expect(container.firstChild).toBeNull();
  });

  it("should update when templateId changes", () => {
    const { rerender } = render(<TemplatePreview templateId="technical" />);

    // Check initial render
    expect(
      screen.getByText("Template Preview: Technical Template")
    ).toBeInTheDocument();

    // Mock a different template for the next render
    const newTemplate = {
      ...mockTemplate,
      id: "academic",
      name: "Academic Template",
      focusAreas: ["Research Methods", "Findings", "Analysis"],
    };

    (templates.getTemplateById as jest.Mock).mockReturnValue(newTemplate);

    // Re-render with new templateId
    rerender(<TemplatePreview templateId="academic" />);

    // Should display the new template name
    expect(
      screen.getByText("Template Preview: Academic Template")
    ).toBeInTheDocument();

    // Should display new focus areas
    expect(screen.getByText("Research Methods")).toBeInTheDocument();
    expect(screen.getByText("Findings")).toBeInTheDocument();
    expect(screen.getByText("Analysis")).toBeInTheDocument();
  });
});
