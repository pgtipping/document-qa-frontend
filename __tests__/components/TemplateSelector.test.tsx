import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TemplateSelector from "@/components/quiz/TemplateSelector";
import * as templates from "@/lib/quiz-templates";

// Mock the quiz-templates module
jest.mock("@/lib/quiz-templates", () => ({
  getRecommendedTemplates: jest.fn(),
  getAllTemplates: jest.fn(),
  QuizTemplate: {},
}));

describe("TemplateSelector Component", () => {
  const mockRecommendedTemplates = [
    {
      id: "technical",
      name: "Technical Template",
      description: "For technical documents and code documentation",
      icon: "Code",
      focusAreas: ["Implementation", "Architecture", "Best Practices"],
      exampleQuestions: ["What design pattern is used in this code?"],
      questionTypes: {
        multipleChoice: 50,
        trueFalse: 30,
        shortAnswer: 20,
      },
    },
    {
      id: "academic",
      name: "Academic Template",
      description: "For academic papers and research",
      icon: "GraduationCap",
      focusAreas: ["Research Methods", "Findings", "Analysis"],
      exampleQuestions: ["What research method was used in this study?"],
      questionTypes: {
        multipleChoice: 40,
        trueFalse: 20,
        shortAnswer: 40,
      },
    },
  ];

  const mockOtherTemplates = [
    {
      id: "business",
      name: "Business Template",
      description: "For business reports and case studies",
      icon: "BarChart",
      focusAreas: ["Strategy", "Market Analysis", "Recommendations"],
      exampleQuestions: ["What is the main business strategy described?"],
      questionTypes: {
        multipleChoice: 60,
        trueFalse: 20,
        shortAnswer: 20,
      },
    },
    {
      id: "general",
      name: "General Knowledge",
      description: "For any type of document",
      icon: "Book",
      focusAreas: ["Comprehension", "Key Points", "Summary"],
      exampleQuestions: ["What is the main point of this document?"],
      questionTypes: {
        multipleChoice: 40,
        trueFalse: 30,
        shortAnswer: 30,
      },
    },
  ];

  const mockAllTemplates = [...mockRecommendedTemplates, ...mockOtherTemplates];

  beforeEach(() => {
    jest.clearAllMocks();
    (templates.getRecommendedTemplates as jest.Mock).mockReturnValue(
      mockRecommendedTemplates
    );
    (templates.getAllTemplates as jest.Mock).mockReturnValue(mockAllTemplates);
  });

  it("should render recommended templates for a document", async () => {
    const mockOnSelect = jest.fn();
    render(
      <TemplateSelector
        documentFilename="technical-document.pdf"
        onTemplateSelect={mockOnSelect}
        selectedTemplateId="technical"
      />
    );

    // Should show the recommended label
    expect(screen.getByText(/Recommended for/)).toBeInTheDocument();

    // Should render the recommended templates
    expect(screen.getByText("Technical Template")).toBeInTheDocument();
    expect(screen.getByText("Academic Template")).toBeInTheDocument();

    // Should not show other templates yet
    expect(screen.queryByText("Business Template")).not.toBeInTheDocument();

    // Should show the "Show All Templates" button
    expect(screen.getByText("Show All Templates")).toBeInTheDocument();
  });

  it("should allow toggling between recommended and all templates", async () => {
    const mockOnSelect = jest.fn();
    render(
      <TemplateSelector
        documentFilename="technical-document.pdf"
        onTemplateSelect={mockOnSelect}
        selectedTemplateId="technical"
      />
    );

    // Initially only recommended templates are shown
    expect(screen.getByText("Technical Template")).toBeInTheDocument();
    expect(screen.queryByText("Business Template")).not.toBeInTheDocument();

    // Click the "Show All Templates" button
    fireEvent.click(screen.getByText("Show All Templates"));

    // Now all templates should be visible
    expect(screen.getByText("Technical Template")).toBeInTheDocument();
    expect(screen.getByText("Business Template")).toBeInTheDocument();
    expect(screen.getByText("General Knowledge")).toBeInTheDocument();

    // Button text should change
    expect(screen.getByText("Show Recommended")).toBeInTheDocument();

    // Click again to show only recommended
    fireEvent.click(screen.getByText("Show Recommended"));

    // Should go back to only showing recommended templates
    expect(screen.getByText("Technical Template")).toBeInTheDocument();
    expect(screen.queryByText("Business Template")).not.toBeInTheDocument();
  });

  it("should call onTemplateSelect when a template is clicked", async () => {
    const mockOnSelect = jest.fn();
    render(
      <TemplateSelector
        documentFilename="technical-document.pdf"
        onTemplateSelect={mockOnSelect}
        selectedTemplateId="technical"
      />
    );

    // Find the Academic Template card and click it
    const academicTemplateCard = screen
      .getByText("Academic Template")
      .closest(".cursor-pointer");
    fireEvent.click(academicTemplateCard!);

    // Check if onTemplateSelect was called with the right ID
    expect(mockOnSelect).toHaveBeenCalledWith("academic");
  });

  it("should highlight the selected template", () => {
    const mockOnSelect = jest.fn();
    render(
      <TemplateSelector
        documentFilename="technical-document.pdf"
        onTemplateSelect={mockOnSelect}
        selectedTemplateId="technical"
      />
    );

    // Find the radio input for the technical template and check if it's checked
    const technicalTemplateRadio = screen.getByDisplayValue("technical");
    expect(technicalTemplateRadio).toBeChecked();

    // Academic template should not be checked
    const academicTemplateRadio = screen.getByDisplayValue("academic");
    expect(academicTemplateRadio).not.toBeChecked();
  });

  it("should be disabled when disabled prop is true", () => {
    const mockOnSelect = jest.fn();
    render(
      <TemplateSelector
        documentFilename="technical-document.pdf"
        onTemplateSelect={mockOnSelect}
        selectedTemplateId="technical"
        disabled={true}
      />
    );

    // Check if the radio inputs are disabled
    const radio = screen.getByDisplayValue("technical");
    expect(radio).toBeDisabled();

    // The "Show All Templates" button should be disabled
    expect(screen.getByText("Show All Templates")).toBeDisabled();

    // Click the template - the callback should not be called
    const technicalTemplateCard = screen
      .getByText("Technical Template")
      .closest(".cursor-pointer");
    fireEvent.click(technicalTemplateCard!);
    expect(mockOnSelect).not.toHaveBeenCalled();
  });

  it("should show badges for focus areas", () => {
    const mockOnSelect = jest.fn();
    render(
      <TemplateSelector
        documentFilename="technical-document.pdf"
        onTemplateSelect={mockOnSelect}
        selectedTemplateId="technical"
      />
    );

    // Check if focus area badges are displayed
    expect(screen.getByText("Implementation")).toBeInTheDocument();
    expect(screen.getByText("Architecture")).toBeInTheDocument();
    expect(screen.getByText("Best Practices")).toBeInTheDocument();
  });
});
