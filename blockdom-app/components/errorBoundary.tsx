"use client"
import FailedIcon from '@/svg/failedIcon';
import React, { ErrorInfo } from 'react';


interface ErrorBoundaryProps {
  children: React.ReactNode;
}

// interface ErrorBoundaryState {
//   hasError: boolean;
// }
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

// class GlobalErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
//   constructor(props: ErrorBoundaryProps) {
//     super(props);
//     this.state = { hasError: false };
//   }
class GlobalErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  // static getDerivedStateFromError(error: Error): ErrorBoundaryState {
  //   return { hasError: true };
  // }
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // You can log the error or perform other actions here
    console.error('Global error caught:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return(
         
      <div className="flex flex-grow">
      {" "}
      <div className="flex ml-auto mr-auto w-12 h-auto  mt-auto mb-auto ">
        <FailedIcon />
        {this.state.error && (
        <p>Error: {this.state.error.message}</p>
        )}
      </div>
    </div>
      )
    }

    return this.props.children;
  }
}

export default GlobalErrorBoundary;

{/* <div>Network connection error!</div>; */}