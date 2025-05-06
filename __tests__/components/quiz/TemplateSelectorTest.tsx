import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import TemplateSelector from "@/components/quiz/TemplateSelector";
import * as templateModule from "@/lib/quiz-templates";

// Mock the quiz templates module
jest.mock("@/lib/quiz-templates", () => ({
  getRecommendedTemplates: jest.fn(),
  getAllTemplates: jest.fn(),
  QuizTemplate: jest.requireActual("@/lib/quiz-templates").QuizTemplate,
}));

describe("TemplateSelector Component", () => {
  // Sample templates for testing
  const mockTemplates = [
    {
      id: "academic",
      name: "Academic Template",
      description: "For academic papers and research",
      documentTypes: ["research", "academic"],
      icon: "GraduationCap",
      promptModifier: "Focus on academic concepts",
      questionTypes: {
        multipleChoice: 50,
        trueFalse: 20,
        shortAnswer: 30,
      },
      focusAreas: ["Methodology", "Findings", "Research implications"],
      exampleQuestions: ["What research method was used?"],
    },
    {
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
      focusAreas: ["Technical specifications", "Procedures", "Implementation"],
      exampleQuestions: ["What is the correct sequence?"],
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (templateModule.getRecommendedTemplates as jest.Mock).mockReturnValue([
      mockTemplates[0],
    ]);
    (templateModule.getAllTemplates as jest.Mock).mockReturnValue(
      mockTemplates
    );
  });

  it("renders recommended templates", () => {
    const handleSelect = jest.fn();

    render(
      <TemplateSelector
        documentFilename="research-paper.pdf"
        onTemplateSelect={handleSelect}
      />
    );

    // Check if recommended template is rendered
    expect(screen.getByText("Academic Template")).toBeInTheDocument();

    // Verify recommended templates were fetched
    expect(templateModule.getRecommendedTemplates).toHaveBeenCalledWith(
      "research-paper.pdf"
    );
  });

  it("allows selecting a template", () => {
    const handleSelect = jest.fn();

    render(
      <TemplateSelector
        documentFilename="research-paper.pdf"
        onTemplateSelect={handleSelect}
      />
    );

    // Click on the academic template
    fireEvent.click(screen.getByText("Academic Template"));

    // Check if selection callback was called with correct template ID
    expect(handleSelect).toHaveBeenCalledWith("academic");
  });

  it("shows template details in hover card", async () => {
    render(
      <TemplateSelector
        documentFilename="research-paper.pdf"
        onTemplateSelect={jest.fn()}
      />
    );

    // Hover over template to show details
    fireEvent.mouseOver(screen.getByText("Academic Template"));

    // Check if hover card content is displayed
    expect(screen.getByText("Focus Areas:")).toBeInTheDocument();
    expect(screen.getByText("Methodology")).toBeInTheDocument();
    expect(screen.getByText("Findings")).toBeInTheDocument();
  });

  it("allows showing all templates", () => {
    render(
      <TemplateSelector
        documentFilename="research-paper.pdf"
        onTemplateSelect={jest.fn()}
      />
    );

    // Click to show all templates
    fireEvent.click(screen.getByText("Show All Templates"));

    // Check if both templates are displayed
    expect(screen.getByText("Academic Template")).toBeInTheDocument();
    expect(screen.getByText("Technical Template")).toBeInTheDocument();
  });

  it("disables selection when disabled prop is true", () => {
    const handleSelect = jest.fn();

    render(
      <TemplateSelector
        documentFilename="research-paper.pdf"
        onTemplateSelect={handleSelect}
        disabled={true}
      />
    );

    // Click on template should not trigger selection
    fireEvent.click(screen.getByText("Academic Template"));
    expect(handleSelect).not.toHaveBeenCalled();

    // Show all templates button should be disabled
    expect(screen.getByText("Show All Templates")).toBeDisabled();
  });

  it("selects initial template from recommended templates", () => {
    const handleSelect = jest.fn();

    render(
      <TemplateSelector
        documentFilename="research-paper.pdf"
        onTemplateSelect={handleSelect}
        selectedTemplateId={undefined}
      />
    );

    // Effect should select first recommended template
    expect(handleSelect).toHaveBeenCalledWith("academic");
  });
});
