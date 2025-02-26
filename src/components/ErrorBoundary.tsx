import React from "react";
import * as Sentry from "@sentry/nextjs";

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
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
      return (
        this.props.fallback || (
          <div className="flex flex-col items-center justify-center min-h-[400px] p-8 bg-red-50 rounded-lg">
            <h2 className="text-2xl font-bold text-red-700 mb-4">
              Something went wrong
            </h2>
            <p className="text-red-600 mb-4">
              We've been notified and are looking into the issue.
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
            >
              Try again
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
