import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  errorMsg: string;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    errorMsg: ''
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, errorMsg: error.message };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // In a production app, log this to Sentry/Datadog
    console.error('Uncaught error in UI:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-xl border-l-4 border-error bg-error-container text-on-error-container">
          <h2 className="font-h3 text-h3 mb-xs">Something went wrong</h2>
          <p className="font-body-md">An unexpected error occurred: {this.state.errorMsg}</p>
          <button 
            onClick={() => this.setState({ hasError: false })}
            className="mt-sm px-sm py-xs bg-primary text-on-primary font-button uppercase"
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
