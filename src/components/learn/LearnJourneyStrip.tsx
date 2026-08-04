"use client";

import Link from "next/link";
import type { JourneySnapshot } from "@/lib/lms/journey";

/** Beautiful integrated pathway strip — where you are, not a second nav. */
export function LearnJourneyStrip({ journey }: { journey: JourneySnapshot }) {
  return (
    <section
      id="journey"
      className="scroll-mt-28 overflow-hidden rounded-3xl border border-black/[0.07] bg-white"
    >
      <div className="flex flex-col gap-4 border-b border-black/[0.05] px-5 py-5 sm:flex-row sm:items-end sm:justify-between sm:px-6">
        <div>
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-muted">
            Your journey
          </p>
          <h2 className="mt-1 text-lg font-semibold tracking-tight text-ink sm:text-xl">
            Step {journey.current.n} of {journey.total} · {journey.current.title}
          </h2>
          <p className="mt-1 max-w-md text-sm leading-relaxed text-slate">
            {journey.current.promise}
          </p>
        </div>
        <div className="flex flex-col items-start gap-1 sm:items-end">
          <p className="text-2xl font-semibold tabular-nums tracking-tight text-ink">
            {journey.pct}%
          </p>
          <p className="text-[0.7rem] text-muted">
            {journey.doneCount} complete · {journey.total - journey.doneCount}{" "}
            remaining
          </p>
        </div>
      </div>

      <div className="px-4 py-5 sm:px-6">
        <div className="relative">
          <div
            className="absolute left-0 right-0 top-[1.05rem] h-0.5 bg-black/[0.06]"
            aria-hidden
          />
          <div
            className="absolute left-0 top-[1.05rem] h-0.5 bg-ink transition-all"
            style={{
              width: `${Math.max(
                4,
                ((journey.doneCount + (journey.current.status === "current" ? 0.35 : 0)) /
                  journey.total) *
                  100
              )}%`,
            }}
            aria-hidden
          />
          <ol className="relative grid grid-cols-3 gap-3 sm:grid-cols-6 sm:gap-2">
            {journey.steps.map((step) => {
              const done = step.status === "done";
              const current = step.status === "current";
              const locked = step.status === "locked";
              return (
                <li key={step.id} className="flex flex-col items-center text-center">
                  {locked ? (
                    <span
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-black/[0.1] bg-white text-[0.7rem] font-bold text-muted"
                      title="Complete previous steps first"
                    >
                      {step.n}
                    </span>
                  ) : (
                    <Link
                      href={step.href}
                      className={`flex h-9 w-9 items-center justify-center rounded-full text-[0.7rem] font-bold transition ${
                        current
                          ? "bg-ink text-white ring-4 ring-ink/15"
                          : done
                            ? "bg-ink text-white"
                            : "border border-black/[0.12] bg-white text-slate hover:border-ink/40"
                      }`}
                      title={step.title}
                    >
                      {done && !current ? "✓" : step.n}
                    </Link>
                  )}
                  <span
                    className={`mt-2 text-[0.65rem] font-semibold leading-tight ${
                      current ? "text-ink" : "text-muted"
                    }`}
                  >
                    {step.short}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>

        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center">
          <Link
            href={journey.current.href}
            className="inline-flex min-h-11 flex-1 items-center justify-center rounded-full bg-ink px-5 text-sm font-semibold text-white hover:bg-ink-soft sm:flex-none"
          >
            {journey.current.cta} →
          </Link>
          <p className="text-center text-[0.75rem] text-muted sm:text-left">
            {journey.current.detail}
          </p>
        </div>
      </div>
    </section>
  );
}
