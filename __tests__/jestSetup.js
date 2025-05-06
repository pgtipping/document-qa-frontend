// Import Jest DOM to extend Jest with DOM testing capabilities
require("@testing-library/jest-dom");

// Mock the necessary browser APIs
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
window.IntersectionObserver = jest.fn().mockImplementation(function () {
  return {
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
    root: null,
    rootMargin: "",
    thresholds: [0],
    takeRecords: jest.fn(),
  };
});

// Mock ResizeObserver
window.ResizeObserver = jest.fn().mockImplementation(function () {
  return {
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  };
});

// Mock router functions
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

// Mock UI components to avoid ESM issues
jest.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }) => (
    <button data-testid="mock-button" {...props}>
      {children}
    </button>
  ),
}));

jest.mock("@/components/ui/badge", () => ({
  Badge: ({ children, variant, ...props }) => (
    <span data-testid={`mock-badge-${variant || "default"}`} {...props}>
      {children}
    </span>
  ),
}));

jest.mock("@/components/ui/card", () => ({
  Card: ({ children, ...props }) => (
    <div data-testid="mock-card" {...props}>
      {children}
    </div>
  ),
  CardContent: ({ children, ...props }) => (
    <div data-testid="mock-card-content" {...props}>
      {children}
    </div>
  ),
  CardHeader: ({ children, ...props }) => (
    <div data-testid="mock-card-header" {...props}>
      {children}
    </div>
  ),
  CardFooter: ({ children, ...props }) => (
    <div data-testid="mock-card-footer" {...props}>
      {children}
    </div>
  ),
  CardTitle: ({ children, ...props }) => (
    <div data-testid="mock-card-title" {...props}>
      {children}
    </div>
  ),
  CardDescription: ({ children, ...props }) => (
    <div data-testid="mock-card-description" {...props}>
      {children}
    </div>
  ),
}));

// Mock Radix UI Select components
jest.mock("@/components/ui/select", () => ({
  Select: ({ children, ...props }) => (
    <div data-testid="mock-select" {...props}>
      {children}
    </div>
  ),
  SelectTrigger: ({ children, ...props }) => (
    <button data-testid="mock-select-trigger" role="combobox" {...props}>
      {children}
    </button>
  ),
  SelectValue: ({ children, ...props }) => (
    <span data-testid="mock-select-value" {...props}>
      {children}
    </span>
  ),
  SelectContent: ({ children, ...props }) => (
    <div data-testid="mock-select-content" {...props}>
      {children}
    </div>
  ),
  SelectItem: ({ children, value, ...props }) => (
    <div
      data-testid={`mock-select-item-${value}`}
      role="option"
      data-value={value}
      {...props}
    >
      {children}
    </div>
  ),
  SelectGroup: ({ children, ...props }) => (
    <div data-testid="mock-select-group" {...props}>
      {children}
    </div>
  ),
  SelectLabel: ({ children, ...props }) => (
    <div data-testid="mock-select-label" {...props}>
      {children}
    </div>
  ),
  SelectSeparator: ({ ...props }) => (
    <hr data-testid="mock-select-separator" {...props} />
  ),
}));

// Mock icons
jest.mock("lucide-react", () => ({
  __esModule: true,
  Check: () => <div data-testid="mock-icon-check" />,
  X: () => <div data-testid="mock-icon-x" />,
  Clock: () => <div data-testid="mock-icon-clock" />,
  Award: () => <div data-testid="mock-icon-award" />,
  Trophy: () => <div data-testid="mock-icon-trophy" />,
  Zap: () => <div data-testid="mock-icon-zap" />,
  Target: () => <div data-testid="mock-icon-target" />,
  AlertCircle: () => <div data-testid="mock-icon-alert-circle" />,
  CheckCircle: () => <div data-testid="mock-icon-check-circle" />,
  CircleCheck: () => <div data-testid="mock-icon-circle-check" />,
  CircleX: () => <div data-testid="mock-icon-circle-x" />,
  ChevronDown: () => <div data-testid="mock-icon-chevron-down" />,
  ChevronUp: () => <div data-testid="mock-icon-chevron-up" />,
  ArrowRight: () => <div data-testid="mock-icon-arrow-right" />,
  ArrowLeft: () => <div data-testid="mock-icon-arrow-left" />,
  Flag: () => <div data-testid="mock-icon-flag" />,
}));

// Mock the Radix UI Slot component to fix the SelectPrimitive.ItemIndicator issue
jest.mock("@radix-ui/react-slot", () => ({
  Slot: ({ children }) => children,
  SlotClone: ({ children }) => children,
  createSlot:
    () =>
    ({ children }) =>
      children,
  createSlottable:
    () =>
    ({ children }) =>
      children,
}));

// Mock Radix UI Slider component
jest.mock("@/components/ui/slider", () => ({
  Slider: ({ value, onValueChange, ...props }) => (
    <input
      type="range"
      role="slider"
      value={Array.isArray(value) ? value[0] : value}
      onChange={(e) =>
        onValueChange && onValueChange([parseInt(e.target.value, 10)])
      }
      data-testid="mock-slider"
      {...props}
    />
  ),
}));

// Mock more Radix UI components
jest.mock("@radix-ui/react-primitive", () => ({
  Primitive: {
    div: ({ children, ...props }) => <div {...props}>{children}</div>,
    span: ({ children, ...props }) => <span {...props}>{children}</span>,
    button: ({ children, ...props }) => <button {...props}>{children}</button>,
    input: ({ children, ...props }) => <input {...props}>{children}</input>,
    label: ({ children, ...props }) => <label {...props}>{children}</label>,
  },
}));

// Mock Label component
jest.mock("@/components/ui/label", () => ({
  Label: ({ children, ...props }) => (
    <label data-testid="mock-label" {...props}>
      {children}
    </label>
  ),
}));

// Mock Radix UI Tooltip component
jest.mock("@/components/ui/tooltip", () => ({
  Tooltip: ({ children }) => <div data-testid="mock-tooltip">{children}</div>,
  TooltipTrigger: ({ children }) => (
    <div data-testid="mock-tooltip-trigger">{children}</div>
  ),
  TooltipContent: ({ children }) => (
    <div data-testid="mock-tooltip-content">{children}</div>
  ),
  TooltipProvider: ({ children }) => (
    <div data-testid="mock-tooltip-provider">{children}</div>
  ),
}));

// Global test setup
beforeAll(() => {
  // Increase timeout for all tests
  jest.setTimeout(10000);
});

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});
