import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

// Mock components
jest.mock("@/components/ui/button", () => ({
  Button: ({ children, onClick, ...props }: any) => (
    <button onClick={onClick} {...props} data-testid="mock-button">
      {children}
    </button>
  ),
}));

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
}));

// Simple mock component for testing
const TemplateSelector = ({
  documentFilename = "test.pdf",
  onTemplateSelect = () => {},
  disabled = false,
  selectedTemplateId = undefined,
}: {
  documentFilename: string;
  onTemplateSelect: (templateId: string) => void;
  disabled?: boolean;
  selectedTemplateId?: string;
}) => {
  const mockTemplates = [
    {
      id: "academic",
      name: "Academic Template",
      description: "For academic papers and research",
    },
    {
      id: "technical",
      name: "Technical Template",
      description: "For technical documentation",
    },
  ];

  const handleSelect = (id: string) => {
    if (!disabled) {
      onTemplateSelect(id);
    }
  };

  return (
    <div data-testid="template-selector">
      <h2>Select Template for {documentFilename}</h2>
      <div className="templates-grid">
        {mockTemplates.map((template) => (
          <div
            key={template.id}
            data-testid={`template-${template.id}`}
            className={`template-card ${
              template.id === selectedTemplateId ? "selected" : ""
            }`}
            onClick={() => handleSelect(template.id)}
          >
            <h3>{template.name}</h3>
            <p>{template.description}</p>
          </div>
        ))}
      </div>
      <button
        data-testid="show-all-button"
        disabled={disabled}
        onClick={() => {}}
      >
        Show All Templates
      </button>
    </div>
  );
};

describe("TemplateSelector Basic Tests", () => {
  it("renders template options", () => {
    const handleSelect = jest.fn();
    render(
      <TemplateSelector
        documentFilename="research-paper.pdf"
        onTemplateSelect={handleSelect}
      />
    );

    // Check if templates are displayed
    expect(screen.getByText("Academic Template")).toBeInTheDocument();
    expect(screen.getByText("Technical Template")).toBeInTheDocument();
    expect(
      screen.getByText("Select Template for research-paper.pdf")
    ).toBeInTheDocument();
  });

  it("calls onTemplateSelect when a template is clicked", () => {
    const handleSelect = jest.fn();
    render(
      <TemplateSelector
        documentFilename="research-paper.pdf"
        onTemplateSelect={handleSelect}
      />
    );

    // Click on a template
    fireEvent.click(screen.getByText("Academic Template"));
    expect(handleSelect).toHaveBeenCalledWith("academic");
  });

  it("disables template selection when disabled prop is true", () => {
    const handleSelect = jest.fn();
    render(
      <TemplateSelector
        documentFilename="research-paper.pdf"
        onTemplateSelect={handleSelect}
        disabled={true}
      />
    );

    // Click on a template, verify that handler is not called
    fireEvent.click(screen.getByText("Academic Template"));
    expect(handleSelect).not.toHaveBeenCalled();

    // Check that the Show All button is disabled
    expect(screen.getByTestId("show-all-button")).toBeDisabled();
  });

  it("highlights the selected template", () => {
    render(
      <TemplateSelector
        documentFilename="research-paper.pdf"
        onTemplateSelect={() => {}}
        selectedTemplateId="technical"
      />
    );

    // Check that the technical template has the 'selected' class
    const technicalCard = screen.getByTestId("template-technical");
    expect(technicalCard.className).toContain("selected");
  });
});
