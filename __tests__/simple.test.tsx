import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

// A very simple component
const SimpleComponent = () => {
  return (
    <div data-testid="simple-component">
      <h1>Hello, World!</h1>
      <p>This is a simple test component</p>
    </div>
  );
};

describe("Simple Component Test", () => {
  it("renders and is visible", () => {
    render(<SimpleComponent />);

    const component = screen.getByTestId("simple-component");
    expect(component).toBeInTheDocument();
    expect(screen.getByText("Hello, World!")).toBeInTheDocument();
    expect(
      screen.getByText("This is a simple test component")
    ).toBeInTheDocument();
  });
});
