import React from "react";
import { render, screen } from "@testing-library/react";
import TemplatePreview from "@/components/quiz/TemplatePreview";
import * as templateModule from "@/lib/quiz-templates";

// Mock the quiz templates module
jest.mock("@/lib/quiz-templates", () => ({
  getTemplateById: jest.fn(),
}));

describe("TemplatePreview Component", () => {
  // Sample template for testing
  const mockTemplate = {
    id: "technical",
    name: "Technical Template",
    description: "For technical documentation",
    documentTypes: ["technical", "manual"],
    icon: "Code",
    promptModifier: "Focus on technical details",
    questionTypes: {
      multipleChoice: 70,
      trueFalse: 20,
      shortAnswer: 10,
    },
    focusAreas: [
      "Technical specifications",
      "Procedures",
      "Implementation details",
    ],
    exampleQuestions: [
      "What is the correct sequence for implementing this procedure?",
      "Which component is responsible for handling this function?",
      "What would happen if this step was omitted from the process?",
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (templateModule.getTemplateById as jest.Mock).mockReturnValue(mockTemplate);
  });

  it("renders template information correctly", () => {
    render(<TemplatePreview templateId="technical" />);

    // Check if the template name is displayed
    expect(
      screen.getByText("Template Preview: Technical Template")
    ).toBeInTheDocument();

    // Check if description is displayed
    expect(
      screen.getByText(
        "This is how questions will be generated based on your document"
      )
    ).toBeInTheDocument();
  });

  it("displays question type distribution", () => {
    render(<TemplatePreview templateId="technical" />);

    // Check if the distribution section is displayed
    expect(screen.getByText("Question Type Distribution")).toBeInTheDocument();

    // Check if percentages are displayed correctly
    expect(screen.getByText("Multiple Choice: 70%")).toBeInTheDocument();
    expect(screen.getByText("True/False: 20%")).toBeInTheDocument();
    expect(screen.getByText("Short Answer: 10%")).toBeInTheDocument();
  });

  it("displays focus areas", () => {
    render(<TemplatePreview templateId="technical" />);

    // Check if focus areas section is displayed
    expect(screen.getByText("Focus Areas")).toBeInTheDocument();

    // Check if all focus areas are shown
    expect(screen.getByText("Technical specifications")).toBeInTheDocument();
    expect(screen.getByText("Procedures")).toBeInTheDocument();
    expect(screen.getByText("Implementation details")).toBeInTheDocument();
  });

  it("displays example questions", () => {
    render(<TemplatePreview templateId="technical" />);

    // Check if example questions section is displayed
    expect(screen.getByText("Example Questions")).toBeInTheDocument();

    // Check if example questions are displayed
    expect(
      screen.getByText(
        "What is the correct sequence for implementing this procedure?"
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Which component is responsible for handling this function?"
      )
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "What would happen if this step was omitted from the process?"
      )
    ).toBeInTheDocument();
  });

  it("handles missing template gracefully", () => {
    // Mock no template returned
    (templateModule.getTemplateById as jest.Mock).mockReturnValue(null);

    const { container } = render(<TemplatePreview templateId="non-existent" />);

    // Component should render nothing
    expect(container.firstChild).toBeNull();
  });
});
