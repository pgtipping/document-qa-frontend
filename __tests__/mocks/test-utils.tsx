import React from "react";
import { render, RenderOptions } from "@testing-library/react";
import { mockTabsComponents } from "./tabs-components";

// Mock router hooks - import these first before mocking next/navigation
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
    back: jest.fn(),
    prefetch: jest.fn(),
    pathname: "/",
  })),
  useSearchParams: jest.fn(() => new URLSearchParams()),
  usePathname: jest.fn(() => "/"),
}));

// Helper to mock all UI components
export const mockAllUIComponents = () => {
  // Mock button component
  jest.mock("@/components/ui/button", () => ({
    Button: ({ children, onClick, variant, ...props }: any) => (
      <button
        onClick={onClick}
        data-variant={variant || "default"}
        {...props}
        data-testid={`mock-button-${variant || "default"}`}
      >
        {children}
      </button>
    ),
  }));

  // Mock card components
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

  // Mock badge component
  jest.mock("@/components/ui/badge", () => ({
    Badge: ({ children, variant, ...props }: any) => (
      <span
        data-testid={`mock-badge-${variant || "default"}`}
        data-variant={variant || "default"}
        {...props}
      >
        {children}
      </span>
    ),
  }));

  // Mock radio group components
  jest.mock("@/components/ui/radio-group", () => ({
    RadioGroup: ({ children, value, onValueChange, ...props }: any) => (
      <div
        role="radiogroup"
        aria-labelledby={props["aria-labelledby"]}
        data-testid="mock-radio-group"
        data-value={value}
        {...props}
      >
        {children}
      </div>
    ),
    RadioGroupItem: ({ value, checked, id, ...props }: any) => {
      // Create two different component versions based on checked state
      if (checked) {
        return (
          <input
            type="radio"
            value={value}
            id={id}
            checked={true}
            data-testid={`mock-radio-item-${value}`}
            onChange={() => {}}
            aria-checked="true"
            role="radio"
            {...props}
          />
        );
      } else {
        return (
          <input
            type="radio"
            value={value}
            id={id}
            checked={false}
            data-testid={`mock-radio-item-${value}`}
            onChange={() => {}}
            aria-checked="false"
            role="radio"
            {...props}
          />
        );
      }
    },
  }));

  // Mock label component
  jest.mock("@/components/ui/label", () => ({
    Label: ({ children, htmlFor, ...props }: any) => (
      <label htmlFor={htmlFor} {...props} data-testid={`mock-label-${htmlFor}`}>
        {children}
      </label>
    ),
  }));

  // Mock textarea component
  jest.mock("@/components/ui/textarea", () => ({
    Textarea: ({ value, onChange, placeholder, ...props }: any) => (
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        data-testid="mock-textarea"
        {...props}
      />
    ),
  }));

  // Mock slider component
  jest.mock("@/components/ui/slider", () => ({
    Slider: ({ defaultValue, onValueChange, ...props }: any) => (
      <input
        type="range"
        defaultValue={defaultValue?.[0] || 0}
        onChange={(e) => onValueChange?.([parseInt(e.target.value)])}
        {...props}
        data-testid="mock-slider"
        aria-label={props["aria-label"] || "Slider"}
      />
    ),
  }));

  // Mock icons
  jest.mock("lucide-react", () => ({
    ArrowLeft: (props: any) => (
      <span data-testid="mock-icon-arrow-left" {...props} />
    ),
    ArrowRight: (props: any) => (
      <span data-testid="mock-icon-arrow-right" {...props} />
    ),
    Flag: (props: any) => <span data-testid="mock-icon-flag" {...props} />,
    CheckCircle: (props: any) => (
      <span data-testid="mock-icon-check-circle" {...props} />
    ),
    XCircle: (props: any) => (
      <span data-testid="mock-icon-x-circle" {...props} />
    ),
    Clock: (props: any) => <span data-testid="mock-icon-clock" {...props} />,
    AlertCircle: (props: any) => (
      <span data-testid="mock-icon-alert-circle" {...props} />
    ),
    ChevronRight: (props: any) => (
      <span data-testid="mock-icon-chevron-right" {...props} />
    ),
    Plus: (props: any) => <span data-testid="mock-icon-plus" {...props} />,
    Minus: (props: any) => <span data-testid="mock-icon-minus" {...props} />,
    Info: (props: any) => <span data-testid="mock-icon-info" {...props} />,
  }));

  // Mock tabs components
  mockTabsComponents();
};

// Custom render for tests with providers
interface CustomRenderOptions extends Omit<RenderOptions, "queries"> {
  route?: string;
}

export function customRender(
  ui: React.ReactElement,
  options?: CustomRenderOptions
) {
  const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
    return <>{children}</>;
  };

  return render(ui, { wrapper: AllTheProviders, ...options });
}

// Re-export testing-library
export * from "@testing-library/react";
export { customRender as render };
