import React from "react";
import { render, RenderOptions } from "@testing-library/react";

// Mock UI components that are commonly used across the application
// This makes it easier to test components that rely on these UI components

// Mock for shadcn/ui components
jest.mock("@/components/ui/badge", () => ({
  Badge: ({
    children,
    ...props
  }: {
    children: React.ReactNode;
    [key: string]: any;
  }) => (
    <div data-testid="badge" {...props}>
      {children}
    </div>
  ),
}));

jest.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    ...props
  }: {
    children: React.ReactNode;
    [key: string]: any;
  }) => (
    <button data-testid="button" {...props}>
      {children}
    </button>
  ),
}));

jest.mock("@/components/ui/card", () => ({
  Card: ({
    children,
    ...props
  }: {
    children: React.ReactNode;
    [key: string]: any;
  }) => (
    <div data-testid="card" {...props}>
      {children}
    </div>
  ),
  CardHeader: ({
    children,
    ...props
  }: {
    children: React.ReactNode;
    [key: string]: any;
  }) => (
    <div data-testid="card-header" {...props}>
      {children}
    </div>
  ),
  CardContent: ({
    children,
    ...props
  }: {
    children: React.ReactNode;
    [key: string]: any;
  }) => (
    <div data-testid="card-content" {...props}>
      {children}
    </div>
  ),
  CardTitle: ({
    children,
    ...props
  }: {
    children: React.ReactNode;
    [key: string]: any;
  }) => (
    <div data-testid="card-title" {...props}>
      {children}
    </div>
  ),
  CardDescription: ({
    children,
    ...props
  }: {
    children: React.ReactNode;
    [key: string]: any;
  }) => (
    <div data-testid="card-description" {...props}>
      {children}
    </div>
  ),
  CardFooter: ({
    children,
    ...props
  }: {
    children: React.ReactNode;
    [key: string]: any;
  }) => (
    <div data-testid="card-footer" {...props}>
      {children}
    </div>
  ),
}));

jest.mock("@/components/ui/tooltip", () => ({
  Tooltip: ({
    children,
    ...props
  }: {
    children: React.ReactNode;
    [key: string]: any;
  }) => (
    <div data-testid="tooltip" {...props}>
      {children}
    </div>
  ),
  TooltipContent: ({
    children,
    ...props
  }: {
    children: React.ReactNode;
    [key: string]: any;
  }) => (
    <div data-testid="tooltip-content" {...props}>
      {children}
    </div>
  ),
  TooltipProvider: ({
    children,
    ...props
  }: {
    children: React.ReactNode;
    [key: string]: any;
  }) => (
    <div data-testid="tooltip-provider" {...props}>
      {children}
    </div>
  ),
  TooltipTrigger: ({
    children,
    ...props
  }: {
    children: React.ReactNode;
    [key: string]: any;
  }) => (
    <div data-testid="tooltip-trigger" {...props}>
      {children}
    </div>
  ),
}));

jest.mock("@/components/ui/badge-help", () => ({
  BadgeHelp: ({
    children,
    ...props
  }: {
    children: React.ReactNode;
    [key: string]: any;
  }) => (
    <div data-testid="badge-help" {...props}>
      {children}
    </div>
  ),
}));

// Mock for lucide-react icons
jest.mock("lucide-react", () => ({
  __esModule: true,
  CheckIcon: () => <span data-testid="icon-check">check</span>,
  XIcon: () => <span data-testid="icon-x">x</span>,
  AlertCircle: () => <span data-testid="icon-alert-circle">alert</span>,
  ChevronRight: () => (
    <span data-testid="icon-chevron-right">chevron-right</span>
  ),
  CircleCheck: () => <span data-testid="icon-circle-check">circle-check</span>,
  CircleX: () => <span data-testid="icon-circle-x">circle-x</span>,
  Code: () => <span data-testid="icon-code">code</span>,
  GraduationCap: () => (
    <span data-testid="icon-graduation-cap">graduation-cap</span>
  ),
  BarChart: () => <span data-testid="icon-bar-chart">bar-chart</span>,
  Book: () => <span data-testid="icon-book">book</span>,
  Trophy: () => <span data-testid="icon-trophy">trophy</span>,
  Zap: () => <span data-testid="icon-zap">zap</span>,
  Target: () => <span data-testid="icon-target">target</span>,
  Verified: () => <span data-testid="icon-verified">verified</span>,
  Shield: () => <span data-testid="icon-shield">shield</span>,
  CheckCheck: () => <span data-testid="icon-check-check">check-check</span>,
  Check: () => <span data-testid="icon-check">check</span>,
  X: () => <span data-testid="icon-x">x</span>,
  Loader2: () => <span data-testid="icon-loader">loader</span>,
  Search: () => <span data-testid="icon-search">search</span>,
  InfoIcon: () => <span data-testid="icon-info">info</span>,
}));

// A custom render method that includes providers if needed
const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) => render(ui, { ...options });

// re-export everything from testing-library
export * from "@testing-library/react";

// override the render method
export { customRender as render };

// Helper to create mock props for components
export const mockProps = {
  // Add common mock props here as needed
};

// Helper for testing async functionality
export const waitForAsync = () =>
  new Promise((resolve) => setTimeout(resolve, 0));
