import { jsx as _jsx } from "react/jsx-runtime";
import { render, screen, fireEvent } from "@testing-library/react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import * as Sentry from "@sentry/nextjs";
// Mock Sentry
jest.mock("@sentry/nextjs", () => ({
    withScope: jest.fn((callback) => callback({ setTag: jest.fn(), setExtra: jest.fn() })),
    addBreadcrumb: jest.fn(),
    captureException: jest.fn(),
}));
// Component that throws an error
const ThrowError = () => {
    throw new Error("Test error");
};
describe("ErrorBoundary", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, "error").mockImplementation(() => { }); // Suppress console.error
    });
    afterEach(() => {
        jest.restoreAllMocks();
    });
    it("renders children when there is no error", () => {
        const { container } = render(_jsx(ErrorBoundary, { children: _jsx("div", { children: "Test content" }) }));
        expect(container).toHaveTextContent("Test content");
    });
    it("renders fallback UI when there is an error", () => {
        render(_jsx(ErrorBoundary, { children: _jsx(ThrowError, {}) }));
        expect(screen.getByText("Something went wrong")).toBeInTheDocument();
        expect(screen.getByText("We've been notified and are looking into the issue.")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument();
    });
    it("renders custom fallback when provided", () => {
        const customFallback = _jsx("div", { children: "Custom error message" });
        render(_jsx(ErrorBoundary, { fallback: customFallback, children: _jsx(ThrowError, {}) }));
        expect(screen.getByText("Custom error message")).toBeInTheDocument();
    });
    it("captures error in Sentry with correct context", () => {
        render(_jsx(ErrorBoundary, { children: _jsx(ThrowError, {}) }));
        expect(Sentry.withScope).toHaveBeenCalled();
        expect(Sentry.addBreadcrumb).toHaveBeenCalledWith({
            category: "error-boundary",
            message: "Error caught by React Error Boundary",
            level: "error",
            data: expect.objectContaining({
                error: "Test error",
                stack: expect.any(String),
            }),
        });
        expect(Sentry.captureException).toHaveBeenCalledWith(expect.any(Error));
    });
    it("resets error state when try again button is clicked", () => {
        const { rerender } = render(_jsx(ErrorBoundary, { children: _jsx(ThrowError, {}) }));
        const tryAgainButton = screen.getByRole("button", { name: /try again/i });
        // Mock window.location.reload
        const mockReload = jest.fn();
        Object.defineProperty(window, "location", {
            value: { reload: mockReload },
            writable: true,
        });
        fireEvent.click(tryAgainButton);
        expect(mockReload).toHaveBeenCalled();
        // Verify error state is reset
        rerender(_jsx(ErrorBoundary, { children: _jsx("div", { children: "Recovered content" }) }));
        expect(screen.queryByText("Something went wrong")).not.toBeInTheDocument();
    });
});
