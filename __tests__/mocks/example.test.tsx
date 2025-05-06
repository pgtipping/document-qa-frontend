import React from "react";
import { render, screen, fireEvent } from "../mocks/test-utils";

// Import mockAllUIComponents function
import { mockAllUIComponents } from "../mocks/test-utils";

// Apply all UI mocks
beforeAll(() => {
  // This will mock all UI components for this test file
  mockAllUIComponents();
});

// Create a test component using the mocked UI components
const ExampleComponent = () => {
  const [selectedOption, setSelectedOption] = React.useState("");
  const [sliderValue, setSliderValue] = React.useState(50);

  return (
    <div data-testid="example-component">
      <h1>Example Component</h1>

      {/* Using mocked Button */}
      <button
        data-testid="primary-button"
        onClick={() => console.log("Button clicked")}
      >
        Click Me
      </button>

      {/* Using mocked RadioGroup */}
      <div role="radiogroup" aria-label="Options">
        <div className="space-y-2">
          <div className="flex items-center">
            <input
              type="radio"
              id="option1"
              value="option1"
              checked={selectedOption === "option1"}
              onChange={() => setSelectedOption("option1")}
            />
            <label htmlFor="option1">Option 1</label>
          </div>
          <div className="flex items-center">
            <input
              type="radio"
              id="option2"
              value="option2"
              checked={selectedOption === "option2"}
              onChange={() => setSelectedOption("option2")}
            />
            <label htmlFor="option2">Option 2</label>
          </div>
        </div>
      </div>

      {/* Using mocked Slider */}
      <div className="mt-4">
        <label htmlFor="slider">Slider Value: {sliderValue}</label>
        <input
          type="range"
          id="slider"
          min={0}
          max={100}
          value={sliderValue}
          onChange={(e) => setSliderValue(parseInt(e.target.value))}
          aria-label="Example slider"
        />
      </div>
    </div>
  );
};

// Tests using the example component with mocked UI components
describe("Mock Utilities Example", () => {
  it("renders the example component", () => {
    render(<ExampleComponent />);

    // Basic component rendering
    expect(screen.getByText("Example Component")).toBeInTheDocument();
    expect(screen.getByText("Click Me")).toBeInTheDocument();
    expect(screen.getByText("Option 1")).toBeInTheDocument();
    expect(screen.getByText("Option 2")).toBeInTheDocument();
  });

  it("handles radio button selection", () => {
    render(<ExampleComponent />);

    // Test radio button interaction
    const option1 = screen.getByLabelText("Option 1");
    const option2 = screen.getByLabelText("Option 2");

    expect(option1).not.toBeChecked();
    expect(option2).not.toBeChecked();

    fireEvent.click(option1);
    expect(option1).toBeChecked();
    expect(option2).not.toBeChecked();

    fireEvent.click(option2);
    expect(option1).not.toBeChecked();
    expect(option2).toBeChecked();
  });

  it("handles slider interaction", () => {
    render(<ExampleComponent />);

    // Test slider interaction
    const slider = screen.getByLabelText("Example slider");
    expect(slider).toBeInTheDocument();

    // Change slider value
    fireEvent.change(slider, { target: { value: 75 } });
    expect(screen.getByText("Slider Value: 75")).toBeInTheDocument();
  });
});
