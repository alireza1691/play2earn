"use client"
import React, { ErrorInfo } from 'react';


interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class GlobalErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // You can log the error or perform other actions here
    console.error('Global error caught:', error, errorInfo);
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return <div>Network connection error!</div>;
    }

    return this.props.children;
  }
}

export default GlobalErrorBoundary;

