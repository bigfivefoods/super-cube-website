"use client";

import { useEffect } from "react";

/**
 * Optional Sentry browser SDK.
 * Set NEXT_PUBLIC_SENTRY_DSN to enable. Loads from CDN to avoid hard dependency.
 */
export function SentryInit() {
  useEffect(() => {
    const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
    if (!dsn || (window as Window & { Sentry?: unknown }).Sentry) return;

    const s = document.createElement("script");
    s.src = "https://browser.sentry-cdn.com/7.120.0/bundle.min.js";
    s.crossOrigin = "anonymous";
    s.onload = () => {
      try {
        const Sentry = (
          window as Window & {
            Sentry?: {
              init: (o: Record<string, unknown>) => void;
            };
          }
        ).Sentry;
        Sentry?.init({
          dsn,
          environment: process.env.NODE_ENV,
          tracesSampleRate: 0.1,
          release: process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA,
        });
      } catch {
        /* ignore */
      }
    };
    document.head.appendChild(s);
  }, []);

  return null;
}
