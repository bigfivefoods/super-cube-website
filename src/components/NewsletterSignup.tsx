"use client";

import Link from "next/link";
import { useId, useState, type FormEvent } from "react";
import { track } from "@/lib/analytics";

/**
 * Email capture with an explicit POPIA opt-in. Posts to /api/newsletter.
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
          You’re on the list. Thank you.
        </p>
        <p className="mt-1.5 text-sm text-slate">
          We’ll only email you about leadership growth and Super-Cube®. You can
          unsubscribe from any email.
        </p>
      </div>
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
          updates. I can unsubscribe at any time. See our{" "}
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
