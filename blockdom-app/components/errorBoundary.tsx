"use client"
import FailedIcon from '@/svg/failedIcon';
import React, { ErrorInfo } from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * The last line before a blank page.
 *
 * It used to render the error message on black and stop there — no way back
 * except a manual reload, and because it wraps the whole tree, one component
 * throwing took the navbar, the map and everything else with it. Switching
 * wallet accounts did exactly that.
 *
 * Two things changed. There is a way out: Try again re-mounts the subtree, which
 * is enough for anything transient — a dropped RPC call, a wallet mid-reconnect
 * — and Reload is there for anything that is not. And the message is presented
 * as one, rather than as raw text floating beside an icon.
 *
 * `resetKey` remounts children when it changes, so navigating away from a
 * broken screen clears the error instead of carrying it to the next page.
 */
class GlobalErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Global error caught:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  retry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render(): React.ReactNode {
    if (!this.state.hasError) return this.props.children;

    const message = this.state.error?.message ?? 'Unknown error';

    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
        <div className="tokenActionBg flex w-full max-w-[26rem] flex-col gap-4 p-6">
          <div className="flex flex-row items-center gap-3">
            <span className="w-8 shrink-0">
              <FailedIcon />
            </span>
            <h2 className="text-[16px] font-semibold">Something broke</h2>
          </div>

          <p className="text-[12px] leading-relaxed text-white/50">
            The screen stopped rendering. If it was a dropped network call or a
            wallet reconnecting, trying again is usually enough.
          </p>

          {/* The message is the only clue anyone reporting this can give, so it
              stays visible — but as detail, not as the whole page. */}
          <pre className="max-h-[8rem] overflow-auto rounded-[4px] bg-black/50 p-3 text-[11px] leading-relaxed text-white/40 whitespace-pre-wrap break-words">
            {message}
          </pre>

          <div className="flex flex-row gap-2">
            <button
              onClick={this.retry}
              className="greenButton !w-1/2 !rounded-[4px] py-2"
            >
              Try again
            </button>
            <button
              onClick={() => window.location.reload()}
              className="!w-1/2 rounded-[4px] bg-white/10 py-2 text-[13px] transition-colors hover:bg-white/20"
            >
              Reload
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default GlobalErrorBoundary;
