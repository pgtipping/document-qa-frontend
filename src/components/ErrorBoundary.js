import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from "react";
import * as Sentry from "@sentry/nextjs";
export class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error, errorInfo) {
        // Track the error in Sentry with detailed context
        Sentry.withScope((scope) => {
            scope.setTag("errorType", "React Error Boundary");
            scope.setExtra("componentStack", errorInfo.componentStack);
            scope.setExtra("errorInfo", errorInfo);
            // Add breadcrumb for debugging
            Sentry.addBreadcrumb({
                category: "error-boundary",
                message: "Error caught by React Error Boundary",
                level: "error",
                data: {
                    error: error.message,
                    stack: error.stack,
                },
            });
            Sentry.captureException(error);
        });
    }
    render() {
        if (this.state.hasError) {
            // Fallback UI
            return (this.props.fallback || (_jsxs("div", { className: "flex flex-col items-center justify-center min-h-[400px] p-8 bg-red-50 rounded-lg", children: [_jsx("h2", { className: "text-2xl font-bold text-red-700 mb-4", children: "Something went wrong" }), _jsx("p", { className: "text-red-600 mb-4", children: "We've been notified and are looking into the issue." }), _jsx("button", { onClick: () => {
                            this.setState({ hasError: false, error: null });
                            window.location.reload();
                        }, className: "px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors", children: "Try again" })] })));
        }
        return this.props.children;
    }
}
