// Mock for UI components to avoid ESM issues
jest.mock("@/components/ui/badge", () => ({
  Badge: ({ children, ...props }) => (
    <div data-testid="badge" {...props}>
      {children}
    </div>
  ),
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({ children, ...props }) => (
    <button data-testid="button" {...props}>
      {children}
    </button>
  ),
}));

jest.mock("@/components/ui/card", () => ({
  Card: ({ children, ...props }) => (
    <div data-testid="card" {...props}>
      {children}
    </div>
  ),
  CardHeader: ({ children, ...props }) => (
    <div data-testid="card-header" {...props}>
      {children}
    </div>
  ),
  CardContent: ({ children, ...props }) => (
    <div data-testid="card-content" {...props}>
      {children}
    </div>
  ),
  CardTitle: ({ children, ...props }) => (
    <div data-testid="card-title" {...props}>
      {children}
    </div>
  ),
  CardDescription: ({ children, ...props }) => (
    <div data-testid="card-description" {...props}>
      {children}
    </div>
  ),
}));

jest.mock("@/components/ui/hover-card", () => ({
  HoverCard: ({ children, ...props }) => (
    <div data-testid="hover-card" {...props}>
      {children}
    </div>
  ),
  HoverCardTrigger: ({ children, ...props }) => (
    <div data-testid="hover-card-trigger" {...props}>
      {children}
    </div>
  ),
  HoverCardContent: ({ children, ...props }) => (
    <div data-testid="hover-card-content" {...props}>
      {children}
    </div>
  ),
}));

jest.mock("@/components/ui/label", () => ({
  Label: ({ children, ...props }) => (
    <label data-testid="label" {...props}>
      {children}
    </label>
  ),
}));

jest.mock("@/components/ui/radio-group", () => ({
  RadioGroup: ({ children, ...props }) => (
    <div data-testid="radio-group" {...props}>
      {children}
    </div>
  ),
  RadioGroupItem: ({ children, ...props }) => (
    <input type="radio" data-testid="radio-group-item" {...props}>
      {children}
    </input>
  ),
}));

jest.mock("@/components/ui/tooltip", () => ({
  Tooltip: ({ children, ...props }) => (
    <div data-testid="tooltip" {...props}>
      {children}
    </div>
  ),
  TooltipProvider: ({ children, ...props }) => (
    <div data-testid="tooltip-provider" {...props}>
      {children}
    </div>
  ),
  TooltipTrigger: ({ children, ...props }) => (
    <div data-testid="tooltip-trigger" {...props}>
      {children}
    </div>
  ),
  TooltipContent: ({ children, ...props }) => (
    <div data-testid="tooltip-content" {...props}>
      {children}
    </div>
  ),
}));

// Mock for lucide-react icons
jest.mock("lucide-react", () => ({
  __esModule: true,
  AlertCircle: ({ ...props }) => (
    <div data-testid="icon-alert-circle" {...props} />
  ),
  ChevronRight: ({ ...props }) => (
    <div data-testid="icon-chevron-right" {...props} />
  ),
  CircleCheck: ({ ...props }) => (
    <div data-testid="icon-circle-check" {...props} />
  ),
  CircleX: ({ ...props }) => <div data-testid="icon-circle-x" {...props} />,
  Code: ({ ...props }) => <div data-testid="icon-code" {...props} />,
  GraduationCap: ({ ...props }) => (
    <div data-testid="icon-graduation-cap" {...props} />
  ),
  BarChart: ({ ...props }) => <div data-testid="icon-bar-chart" {...props} />,
  Book: ({ ...props }) => <div data-testid="icon-book" {...props} />,
  Trophy: ({ ...props }) => <div data-testid="icon-trophy" {...props} />,
  Zap: ({ ...props }) => <div data-testid="icon-zap" {...props} />,
  Target: ({ ...props }) => <div data-testid="icon-target" {...props} />,
  Verified: ({ ...props }) => <div data-testid="icon-verified" {...props} />,
  Shield: ({ ...props }) => <div data-testid="icon-shield" {...props} />,
  CheckCheck: ({ ...props }) => (
    <div data-testid="icon-check-check" {...props} />
  ),
  Check: ({ ...props }) => <div data-testid="icon-check" {...props} />,
  X: ({ ...props }) => <div data-testid="icon-x" {...props} />,
  Loader2: ({ ...props }) => <div data-testid="icon-loader2" {...props} />,
  Search: ({ ...props }) => <div data-testid="icon-search" {...props} />,
  Info: ({ ...props }) => <div data-testid="icon-info" {...props} />,
  CheckIcon: ({ ...props }) => <div data-testid="icon-check" {...props} />,
  XIcon: ({ ...props }) => <div data-testid="icon-x" {...props} />,
}));

// Import testing library extensions
import "@testing-library/jest-dom";

// Add any global test setup here
import "@testing-library/jest-dom";

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
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
  writable: true,
});

// Mock IntersectionObserver
class MockIntersectionObserver {
  constructor(callback) {
    this.callback = callback;
  }

  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
}

Object.defineProperty(window, "IntersectionObserver", {
  value: MockIntersectionObserver,
  writable: true,
});

// Mock ResizeObserver
class MockResizeObserver {
  constructor(callback) {
    this.callback = callback;
  }

  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
}

Object.defineProperty(window, "ResizeObserver", {
  value: MockResizeObserver,
  writable: true,
});

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  })),
  useSearchParams: jest.fn(() => new URLSearchParams()),
  usePathname: jest.fn(() => "/test-path"),
}));

// Mock clipboard API
Object.defineProperty(navigator, "clipboard", {
  value: {
    writeText: jest.fn(),
  },
});

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  })
);
