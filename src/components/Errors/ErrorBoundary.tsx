import { ErrorMessage } from "./ErrorMessage";
import { Component, type ErrorInfo, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error(
      `[CineList]: React render error - Error: ${error} - ErrorInfo: ${errorInfo}`,
    );
  }

  handleReload = (): void => {
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <ErrorMessage
          error={{
            title: "Something went wrong",
            message: "Reload the page and try again",
            code: "RENDER_ERROR",
          }}
          action={{
            label: "Reload page",
            onClick: this.handleReload,
          }}
        />
      );
    }

    return this.props.children;
  }
}
