import "@testing-library/jest-dom";
import "@testing-library/jest-dom/extend-expect";

// Import other testing utilities
import { configure } from "@testing-library/react";

// Configure testing-library
configure({
  // Set a testID attribute that doesn't conflict with React props
  testIdAttribute: "data-testid",
  // Increase timeout for async rendering
  asyncUtilTimeout: 5000,
});

// Set up global mocks
// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
interface MockIntersectionObserver {
  observe: jest.Mock;
  unobserve: jest.Mock;
  disconnect: jest.Mock;
  root: Element | Document | null;
  rootMargin: string;
  thresholds: number | number[];
  takeRecords: jest.Mock;
}

const mockIntersectionObserver = jest
  .fn()
  .mockImplementation(function (
    this: MockIntersectionObserver,
    callback: IntersectionObserverCallback,
    options?: IntersectionObserverInit
  ) {
    this.observe = jest.fn();
    this.unobserve = jest.fn();
    this.disconnect = jest.fn();
    this.root = options?.root || null;
    this.rootMargin = options?.rootMargin || "";
    this.thresholds = options?.threshold || 1.0;
    this.takeRecords = jest.fn();
    return this;
  });

Object.defineProperty(window, "IntersectionObserver", {
  writable: true,
  configurable: true,
  value: mockIntersectionObserver,
});

// Mock APIs that might be used by components
Object.defineProperty(window, "ResizeObserver", {
  writable: true,
  configurable: true,
  value: jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  })),
});

// Mock next/navigation functions
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    route: "/test-route",
    pathname: "/test-path",
  })),
  useSearchParams: jest.fn(() => new URLSearchParams()),
  usePathname: jest.fn(() => "/test-path"),
}));

// Add any global test setup here
beforeAll(() => {
  // Setup global test behavior
  jest.setTimeout(10000); // Increase timeout for all tests
});

// Clean up mocks between tests
afterEach(() => {
  jest.clearAllMocks();
});

// This file is automatically imported by Jest before each test file
// See reference: https://github.com/testing-library/jest-dom#usage
