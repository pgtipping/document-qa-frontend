import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";

// Create a simple component for testing
const TestComponent = ({ onSubmit = () => {} }) => {
  const [value, setValue] = React.useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(value);
  };

  return (
    <div data-testid="test-component">
      <h1>Template Test Component</h1>
      <form onSubmit={handleSubmit}>
        <label htmlFor="test-input">Enter value:</label>
        <input
          id="test-input"
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          data-testid="test-input"
          aria-label="Test input field"
        />
        <button type="submit" data-testid="submit-button">
          Submit
        </button>
      </form>
    </div>
  );
};

// Test suite for the component
describe("TestComponent", () => {
  it("renders correctly", () => {
    render(<TestComponent />);

    // Using toBeInTheDocument matcher
    expect(screen.getByText("Template Test Component")).toBeInTheDocument();
    expect(screen.getByLabelText("Enter value:")).toBeInTheDocument();
    expect(screen.getByTestId("submit-button")).toBeInTheDocument();
  });

  it("updates input value when typing", () => {
    render(<TestComponent />);

    const input = screen.getByTestId("test-input");
    fireEvent.change(input, { target: { value: "Hello World" } });

    // Using toHaveValue matcher
    expect(input).toHaveValue("Hello World");
  });

  it("calls onSubmit when form is submitted", () => {
    const handleSubmit = jest.fn();
    render(<TestComponent onSubmit={handleSubmit} />);

    const input = screen.getByTestId("test-input");
    fireEvent.change(input, { target: { value: "Test Value" } });

    const button = screen.getByTestId("submit-button");
    fireEvent.click(button);

    // Using toHaveBeenCalledWith matcher
    expect(handleSubmit).toHaveBeenCalledWith("Test Value");
  });

  it("button is enabled by default", () => {
    render(<TestComponent />);

    const button = screen.getByTestId("submit-button");

    // Using not.toBeDisabled matcher
    expect(button).not.toBeDisabled();
  });
});
