"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { track } from "@/lib/analytics";

type Props = { children: ReactNode; fallback?: ReactNode };
type State = { error: Error | null };

/**
 * Catches render errors in client trees; logs to analytics + optional Sentry.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    try {
      track("client_error", {
        message: error.message.slice(0, 200),
        component: info.componentStack?.slice(0, 120) ?? "",
      });
    } catch {
      /* ignore */
    }
    const w = window as Window & {
      Sentry?: { captureException: (e: Error) => void };
    };
    try {
      w.Sentry?.captureException(error);
    } catch {
      /* optional */
    }
  }

  render() {
    if (this.state.error) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="mx-auto max-w-lg px-4 py-16 text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-muted">
            Something went wrong
          </p>
          <h1 className="mt-2 text-xl font-semibold text-ink">
            We hit an unexpected error
          </h1>
          <p className="mt-3 text-sm text-slate">
            Try refreshing the page. Your Learn progress is saved on this device.
          </p>
          <button
            type="button"
            className="mt-6 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white"
            onClick={() => {
              this.setState({ error: null });
              window.location.reload();
            }}
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
