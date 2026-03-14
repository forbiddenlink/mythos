"use client";

import { Component, type ReactNode, type ErrorInfo } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary - Catches JavaScript errors anywhere in the child component tree
 *
 * Usage:
 * <ErrorBoundary fallback={<CustomFallback />}>
 *   <ComponentThatMightError />
 * </ErrorBoundary>
 *
 * Note: Next.js also provides error.tsx and global-error.tsx for page-level
 * error handling. This component is useful for catching errors in specific
 * component subtrees without affecting the entire page.
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to error tracking service
    console.error("ErrorBoundary caught an error:", error, errorInfo);

    // If Sentry is configured, it will automatically capture this
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <div className="mb-4 rounded-full border border-gold/30 bg-midnight-light/80 p-4">
            <AlertTriangle className="h-8 w-8 text-gold" />
          </div>
          <h2 className="mb-2 font-display text-xl font-semibold text-foreground">
            Something went wrong
          </h2>
          <p className="mb-4 text-sm text-muted-foreground">
            An error occurred while rendering this component.
          </p>
          {process.env.NODE_ENV === "development" && this.state.error && (
            <pre className="mb-4 max-w-md overflow-auto rounded bg-muted p-3 text-left text-xs text-muted-foreground">
              {this.state.error.message}
            </pre>
          )}
          <Button onClick={this.handleReset} variant="outline" size="sm">
            <RotateCcw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
