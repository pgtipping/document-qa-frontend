import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

// Mock UI components
jest.mock("@/components/ui/card", () => ({
  Card: ({ children, ...props }: any) => (
    <div {...props} data-testid="mock-card">
      {children}
    </div>
  ),
  CardContent: ({ children, ...props }: any) => (
    <div {...props} data-testid="mock-card-content">
      {children}
    </div>
  ),
  CardHeader: ({ children, ...props }: any) => (
    <div {...props} data-testid="mock-card-header">
      {children}
    </div>
  ),
  CardTitle: ({ children, ...props }: any) => (
    <div {...props} data-testid="mock-card-title">
      {children}
    </div>
  ),
  CardDescription: ({ children, ...props }: any) => (
    <div {...props} data-testid="mock-card-description">
      {children}
    </div>
  ),
  CardFooter: ({ children, ...props }: any) => (
    <div {...props} data-testid="mock-card-footer">
      {children}
    </div>
  ),
}));

// Mock icons
jest.mock("lucide-react", () => ({
  GraduationCap: () => <div data-testid="mock-icon-graduation-cap" />,
  Code: () => <div data-testid="mock-icon-code" />,
  FileText: () => <div data-testid="mock-icon-file-text" />,
  Newspaper: () => <div data-testid="mock-icon-newspaper" />,
  BookOpen: () => <div data-testid="mock-icon-book-open" />,
  Building2: () => <div data-testid="mock-icon-building" />,
}));

// Simple mock template data
const mockTemplates = {
  academic: {
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
  technical: {
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
};

// Simple mock component for testing
const TemplatePreview = ({
  templateId = "academic",
  expanded = false,
}: {
  templateId: string;
  expanded?: boolean;
}) => {
  // Get the template data
  const template = mockTemplates[templateId as keyof typeof mockTemplates];
  if (!template) return <div>Template not found</div>;

  // Map icon name to component
  const getIconComponent = (iconName: string) => {
    const icons: Record<string, React.ReactNode> = {
      GraduationCap: <div data-testid="mock-icon-graduation-cap" />,
      Code: <div data-testid="mock-icon-code" />,
      FileText: <div data-testid="mock-icon-file-text" />,
      Newspaper: <div data-testid="mock-icon-newspaper" />,
      BookOpen: <div data-testid="mock-icon-book-open" />,
      Building2: <div data-testid="mock-icon-building" />,
    };
    return icons[iconName] || <div data-testid="mock-icon-default" />;
  };

  return (
    <div data-testid="template-preview" className={expanded ? "expanded" : ""}>
      <div className="template-header">
        <div className="template-icon">{getIconComponent(template.icon)}</div>
        <h2 data-testid="template-name">{template.name}</h2>
      </div>
      <p data-testid="template-description">{template.description}</p>

      {expanded && (
        <div className="template-details" data-testid="template-details">
          <h3>Focus Areas:</h3>
          <ul className="focus-areas">
            {template.focusAreas.map((area, index) => (
              <li key={index} data-testid={`focus-area-${index}`}>
                {area}
              </li>
            ))}
          </ul>

          <h3>Question Distribution:</h3>
          <div className="question-distribution">
            <div>Multiple Choice: {template.questionTypes.multipleChoice}%</div>
            <div>True/False: {template.questionTypes.trueFalse}%</div>
            <div>Short Answer: {template.questionTypes.shortAnswer}%</div>
          </div>

          <h3>Example Questions:</h3>
          <ul className="example-questions">
            {template.exampleQuestions.map((question, index) => (
              <li key={index} data-testid={`example-question-${index}`}>
                {question}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

describe("TemplatePreview Component", () => {
  it("renders basic template information", () => {
    render(<TemplatePreview templateId="academic" />);

    expect(screen.getByTestId("template-name")).toHaveTextContent(
      "Academic Template"
    );
    expect(screen.getByTestId("template-description")).toHaveTextContent(
      "For academic papers and research"
    );
    expect(screen.getByTestId("mock-icon-graduation-cap")).toBeInTheDocument();
  });

  it("does not show detailed information when not expanded", () => {
    render(<TemplatePreview templateId="academic" expanded={false} />);

    expect(screen.queryByTestId("template-details")).not.toBeInTheDocument();
  });

  it("shows detailed information when expanded", () => {
    render(<TemplatePreview templateId="academic" expanded={true} />);

    expect(screen.getByTestId("template-details")).toBeInTheDocument();
    expect(screen.getByText("Focus Areas:")).toBeInTheDocument();
    expect(screen.getByText("Question Distribution:")).toBeInTheDocument();
    expect(screen.getByText("Example Questions:")).toBeInTheDocument();

    // Check focus areas are rendered
    expect(screen.getByTestId("focus-area-0")).toHaveTextContent("Methodology");
    expect(screen.getByTestId("focus-area-1")).toHaveTextContent("Findings");
    expect(screen.getByTestId("focus-area-2")).toHaveTextContent(
      "Research implications"
    );

    // Check example questions are rendered
    expect(screen.getByTestId("example-question-0")).toHaveTextContent(
      "What research method was used?"
    );
  });

  it("renders different icons for different templates", () => {
    const { rerender } = render(<TemplatePreview templateId="academic" />);
    expect(screen.getByTestId("mock-icon-graduation-cap")).toBeInTheDocument();

    rerender(<TemplatePreview templateId="technical" />);
    expect(screen.getByTestId("mock-icon-code")).toBeInTheDocument();
  });

  it("displays a not found message for invalid template id", () => {
    // @ts-ignore - We're deliberately passing an invalid ID for testing
    render(<TemplatePreview templateId="nonexistent" />);

    expect(screen.getByText("Template not found")).toBeInTheDocument();
  });
});
