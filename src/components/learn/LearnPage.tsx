"use client";

import Link from "next/link";
import type { ReactNode } from "react";

/**
 * LMS content column — sits next to the sidebar.
 * Use LearnScreen for each neat “page” you scroll through.
 */
export function LearnPage({
  children,
  className = "",
  /** Stack full-viewport screens that snap on scroll */
  snap = false,
}: {
  children: ReactNode;
  className?: string;
  snap?: boolean;
}) {
  if (snap) {
    return (
      <div
        className={`learn-snap-root flex w-full max-w-2xl flex-col gap-4 sm:gap-5 ${className}`}
      >
        {children}
      </div>
    );
  }
  return (
    <div
      className={`mx-auto w-full max-w-2xl space-y-5 sm:space-y-6 ${className}`}
    >
      {children}
    </div>
  );
}

/**
 * One neat screenful of content. Scroll down to the next LearnScreen.
 * min-height keeps primary content in the first viewport; overflow scrolls inside if needed.
 */
export function LearnScreen({
  children,
  id,
  className = "",
  pageLabel,
}: {
  children: ReactNode;
  id?: string;
  className?: string;
  /** e.g. "1 / 3" shown top-right */
  pageLabel?: string;
}) {
  return (
    <section
      id={id}
      className={`learn-screen relative flex min-h-[min(70svh,36rem)] flex-col justify-between rounded-2xl border border-black/[0.07] bg-white p-5 shadow-[0_1px_0_rgba(0,0,0,0.02)] sm:min-h-[min(72svh,40rem)] sm:p-6 lg:min-h-[min(68svh,38rem)] ${className}`}
    >
      {pageLabel && (
        <p className="absolute right-4 top-4 text-[0.65rem] font-semibold tabular-nums text-muted sm:right-5 sm:top-5">
          {pageLabel}
        </p>
      )}
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
    </section>
  );
}

export function LearnScreenFooter({ children }: { children: ReactNode }) {
  return (
    <div className="mt-5 shrink-0 border-t border-black/[0.06] pt-4">
      {children}
    </div>
  );
}

export function LearnPageHeader({
  kicker,
  title,
  description,
  step,
  stepTotal,
}: {
  kicker?: string;
  title: string;
  description?: string;
  /** Optional multi-page step indicator */
  step?: number;
  stepTotal?: number;
}) {
  return (
    <header className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        {kicker && (
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-muted">
            {kicker}
          </p>
        )}
        {step != null && stepTotal != null && (
          <p className="text-[0.7rem] font-semibold tabular-nums text-muted">
            Page {step} of {stepTotal}
          </p>
        )}
      </div>
      {step != null && stepTotal != null && (
        <div className="flex gap-1" aria-hidden>
          {Array.from({ length: stepTotal }).map((_, i) => (
            <span
              key={i}
              className={`h-1 flex-1 rounded-full ${
                i < step ? "bg-ink" : "bg-black/[0.08]"
              }`}
            />
          ))}
        </div>
      )}
      <h1 className="text-[1.5rem] font-semibold leading-tight tracking-tight text-ink sm:text-[1.75rem]">
        {title}
      </h1>
      {description && (
        <p className="text-[0.9375rem] leading-relaxed text-slate">{description}</p>
      )}
    </header>
  );
}

export function LearnCard({
  children,
  className = "",
  tone = "default",
}: {
  children: ReactNode;
  className?: string;
  tone?: "default" | "ink" | "soft";
}) {
  const tones = {
    default: "border-black/[0.07] bg-white",
    ink: "border-transparent bg-ink text-white",
    soft: "border-black/[0.06] bg-[#f6f6f6]",
  };
  return (
    <section
      className={`overflow-hidden rounded-2xl border ${tones[tone]} ${className}`}
    >
      {children}
    </section>
  );
}

export function LearnCardBody({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`p-5 sm:p-6 ${className}`}>{children}</div>;
}

/** Primary page-to-page actions — always at the bottom of a Learn page */
export function LearnPageActions({
  primary,
  secondary,
  tertiary,
}: {
  primary?: { href?: string; label: string; onClick?: () => void; disabled?: boolean };
  secondary?: { href?: string; label: string; onClick?: () => void };
  tertiary?: { href?: string; label: string };
}) {
  return (
    <div className="flex flex-col gap-2.5 pt-1">
      {primary &&
        (primary.href && !primary.onClick ? (
          <Link
            href={primary.href}
            className={`inline-flex min-h-12 items-center justify-center rounded-full px-6 text-sm font-semibold transition ${
              primary.disabled
                ? "pointer-events-none bg-black/20 text-white/70"
                : "bg-ink text-white hover:bg-ink-soft"
            }`}
          >
            {primary.label}
          </Link>
        ) : (
          <button
            type="button"
            disabled={primary.disabled}
            onClick={primary.onClick}
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-ink px-6 text-sm font-semibold text-white transition hover:bg-ink-soft disabled:cursor-not-allowed disabled:opacity-40"
          >
            {primary.label}
          </button>
        ))}
      {secondary &&
        (secondary.href && !secondary.onClick ? (
          <Link
            href={secondary.href}
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-black/[0.12] bg-white px-5 text-sm font-semibold text-ink transition hover:border-black/25"
          >
            {secondary.label}
          </Link>
        ) : (
          <button
            type="button"
            onClick={secondary.onClick}
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-black/[0.12] bg-white px-5 text-sm font-semibold text-ink transition hover:border-black/25"
          >
            {secondary.label}
          </button>
        ))}
      {tertiary?.href && (
        <Link
          href={tertiary.href}
          className="inline-flex min-h-10 items-center justify-center text-[0.8125rem] font-semibold text-muted underline-offset-2 hover:text-ink hover:underline"
        >
          {tertiary.label}
        </Link>
      )}
    </div>
  );
}

/** Destination tile — navigates to another Learn “page” */
export function LearnNavTile({
  href,
  kicker,
  title,
  detail,
  status,
  accent,
}: {
  href: string;
  kicker: string;
  title: string;
  detail: string;
  status?: string;
  accent?: string;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col rounded-2xl border border-black/[0.07] bg-white p-4 transition hover:border-black/15 hover:shadow-[0_12px_32px_-20px_rgba(10,10,10,0.35)]"
      style={accent ? { boxShadow: `inset 3px 0 0 ${accent}` } : undefined}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted">
          {kicker}
        </p>
        {status && (
          <span className="rounded-full bg-[#f4f4f4] px-2 py-0.5 text-[0.65rem] font-semibold text-ink">
            {status}
          </span>
        )}
      </div>
      <p className="mt-1.5 text-[0.975rem] font-semibold tracking-tight text-ink">
        {title}
      </p>
      <p className="mt-1 flex-1 text-[0.75rem] leading-relaxed text-slate">
        {detail}
      </p>
      <p className="mt-3 text-[0.75rem] font-semibold text-ink opacity-70 transition group-hover:opacity-100">
        Open →
      </p>
    </Link>
  );
}
