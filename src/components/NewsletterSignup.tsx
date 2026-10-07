"use client";

import Link from "next/link";
import { useId, useState, type FormEvent } from "react";
import { track } from "@/lib/analytics";

/**
 * Email capture with an explicit POPIA opt-in and double opt-in (a confirmation
 * link by email). Posts to /api/newsletter.
 * Drop-in for the end of the free baseline: <NewsletterSignup source="baseline" />
 */
export function NewsletterSignup({
  source,
  variant = "card",
  title = "Get one practical leadership idea a month",
  description = "Short, useful emails on growing the six faces of leadership. No spam. Unsubscribe any time.",
  className = "",
}: {
  source: string;
  variant?: "card" | "footer";
  title?: string;
  description?: string;
  className?: string;
}) {
  const id = useId();
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState<string | null>(null);
  const footer = variant === "footer";

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const data = new FormData(form);
    const consent = data.get("consent") === "on";
    if (!consent) {
      setError("Please tick the consent box so we may email you.");
      return;
    }
    setState("sending");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: String(data.get("email") || "").trim(),
          consent,
          source,
          website: String(data.get("website") || ""),
        }),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(j.error || "Could not sign you up. Please try again.");
      }
      setState("done");
      track("notify_opt_in", { source, kind: "newsletter" });
      form.reset();
    } catch (err) {
      setState("idle");
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  const wrap = footer
    ? `min-w-0 ${className}`
    : `sc-card p-5 sm:p-6 ${className}`;

  if (state === "done") {
    return (
      <div className={wrap} role="status">
        <p className="text-base font-semibold tracking-tight text-ink">
          Almost done: check your inbox.
        </p>
        <p className="mt-1.5 text-sm text-slate">
          If this address isn’t subscribed yet, we’ve sent it a link to confirm.
          Nothing is sent until you press it. Can’t see it? Check your spam folder.
        </p>
      </div>
    );
  }

  if (footer) {
    // Compact footer form: same layout as the bigfivegroup.africa footer newsletter
    // (mail-icon input, full-width Subscribe button, one-line consent, Unsubscribe link).
    return (
      <form onSubmit={onSubmit} className={`relative space-y-3 ${wrap}`} noValidate>
        <div className="flex flex-col gap-2">
          <label htmlFor={`${id}-email`} className="sr-only">
            Email address
          </label>
          <div className="relative">
            <svg
              viewBox="0 0 24 24"
              aria-hidden
              className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#737373] dark:text-muted"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
            <input
              id={`${id}-email`}
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@organisation.com"
              className="w-full rounded-full border border-black/10 bg-white py-3 pl-10 pr-4 text-sm text-black placeholder:text-[#737373] focus:outline-none focus:ring-2 focus:ring-black/25 dark:border-line-strong dark:bg-surface dark:text-ink dark:placeholder:text-muted dark:focus:ring-white/25"
            />
          </div>
          <button
            type="submit"
            disabled={state === "sending"}
            className="sc-btn-primary inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold disabled:opacity-60"
          >
            {state === "sending" ? "Subscribing…" : "Subscribe"}
            <svg viewBox="0 0 24 24" aria-hidden className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        {/* Honeypot */}
        <div aria-hidden="true" className="hidden">
          <label>
            Website
            <input name="website" tabIndex={-1} autoComplete="off" />
          </label>
        </div>
        <div className="flex items-start gap-2.5">
          <input
            id={`${id}-consent`}
            name="consent"
            type="checkbox"
            required
            className="mt-0.5 h-4 w-4 shrink-0 rounded accent-[var(--ink)]"
          />
          <label htmlFor={`${id}-consent`} className="text-xs leading-snug text-[#525252] dark:text-slate">
            I agree that Super-Cube® may email me. I can unsubscribe at any time.{" "}
            <Link href="/privacy" className="inline-flex min-h-6 items-center text-black underline underline-offset-2 dark:text-ink">
              Privacy
            </Link>
          </label>
        </div>
        {error && (
          <p className="text-sm font-medium text-red-700 dark:text-red-400" role="alert">
            {error}
          </p>
        )}
        <p className="text-xs leading-relaxed text-[#737373] dark:text-muted">
          <Link href="/newsletter/unsubscribe" className="inline-flex min-h-6 items-center text-[#404040] underline underline-offset-2 dark:text-slate">
            Unsubscribe
          </Link>
        </p>
      </form>
    );
  }

  return (
    <form onSubmit={onSubmit} className={wrap} noValidate>
      <h2
        className={
          footer
            ? "text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted"
            : "text-lg font-semibold tracking-tight text-ink"
        }
      >
        {title}
      </h2>
      <p className={`text-sm leading-relaxed text-slate ${footer ? "mt-3" : "mt-1.5"}`}>
        {description}
      </p>
      <div className="mt-4 flex flex-col gap-2.5 sm:flex-row">
        <label htmlFor={`${id}-email`} className="sr-only">
          Email address
        </label>
        <input
          id={`${id}-email`}
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          className="min-h-11 w-full min-w-0 rounded-full border border-line-strong bg-surface px-4 text-sm text-ink outline-none transition focus:border-ink focus:ring-1 focus:ring-ink sm:flex-1"
        />
        <button
          type="submit"
          disabled={state === "sending"}
          className="sc-btn-primary inline-flex min-h-11 shrink-0 items-center justify-center rounded-full px-5 text-sm font-semibold tracking-tight disabled:opacity-60"
        >
          {state === "sending" ? "Signing up…" : "Sign up"}
        </button>
      </div>
      {/* Honeypot */}
      <div aria-hidden="true" className="hidden">
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <div className="mt-3 flex items-start gap-2.5">
        <input
          id={`${id}-consent`}
          name="consent"
          type="checkbox"
          required
          className="h-6 w-6 shrink-0 accent-[var(--ink)]"
        />
        <label htmlFor={`${id}-consent`} className="text-xs leading-relaxed text-slate">
          I agree that Super-Cube® may email me leadership tips and programme
          updates. I’ll confirm by email and can unsubscribe at any time. See our{" "}
          <Link href="/privacy" className="font-semibold text-ink underline underline-offset-2">
            privacy notice
          </Link>
          .
        </label>
      </div>
      {error && (
        <p className="mt-2 text-sm font-medium text-red-700" role="alert">
          {error}
        </p>
      )}
    </form>
  );
}
