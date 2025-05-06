import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

// Create a test component that uses UI components
const TestComponent = () => {
  return (
    <div>
      <h1>Test UI Component Mocks</h1>
      <div id="button-test">
        <button>Regular Button</button>
      </div>
    </div>
  );
};

// Test the component
describe("UI Component Mocks", () => {
  it("renders the test component correctly", () => {
    render(<TestComponent />);

    // Check that the component renders
    expect(screen.getByText("Test UI Component Mocks")).toBeInTheDocument();
    expect(screen.getByText("Regular Button")).toBeInTheDocument();
  });
});
