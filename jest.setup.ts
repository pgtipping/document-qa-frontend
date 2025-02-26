import "@testing-library/jest-dom";

// Mock Next.js environment
const mockHeaders = new Map();
const mockRequest = {
  headers: {
    get: (name: string) => mockHeaders.get(name),
    set: (name: string, value: string) => mockHeaders.set(name, value),
  },
};

// Mock Next.js Request and Response
global.Request = jest.fn().mockImplementation(() => mockRequest) as any;
global.Response = jest.fn().mockImplementation((body, init) => ({
  json: () => Promise.resolve(body ? JSON.parse(body) : {}),
  status: init?.status || 200,
  headers: new Map(),
})) as any;
global.Headers = jest.fn().mockImplementation(() => mockHeaders) as any;

// Mock Sentry
jest.mock("@sentry/nextjs", () => ({
  init: jest.fn(),
  setContext: jest.fn(),
  addBreadcrumb: jest.fn(),
  captureException: jest.fn(),
  startSpan: jest.fn((operation, callback) => {
    const mockSpan = { finish: jest.fn() };
    if (callback) {
      callback(mockSpan);
    }
    return mockSpan;
  }),
}));

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
  })),
  usePathname: jest.fn(() => "/"),
  useSearchParams: jest.fn(() => new URLSearchParams()),
}));

// Mock lucide-react icons
jest.mock("lucide-react", () => ({
  Upload: jest.fn(() => null),
  File: jest.fn(() => null),
  X: jest.fn(() => null),
  type: {
    LucideIcon: jest.fn(),
  },
}));
