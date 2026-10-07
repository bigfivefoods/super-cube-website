"use client";

import { formatDateZA } from "@/lib/datetime";
import { useEffect, useState } from "react";
import { constructs } from "@/lib/content";

type Results = {
  available: boolean;
  updatedAt?: string;
  cohorts?: number;
  learners?: number;
  overallDelta?: number;
  byFace?: Record<string, number>;
};

/**
 * Live, aggregate cohort results from /api/impact/results. Shows a clear
 * "not yet available" state until consented post-assessment data exists.
 */
export function LiveCohortResults() {
  const [data, setData] = useState<Results | null>(null);

  useEffect(() => {
    let alive = true;
    fetch("/api/impact/results")
      .then((r) => (r.ok ? r.json() : { available: false }))
      .then((d: Results) => alive && setData(d))
      .catch(() => alive && setData({ available: false }));
    return () => {
      alive = false;
    };
  }, []);

  const signed = (n: number) => `${n > 0 ? "+" : ""}${Math.round(n * 10) / 10}`;

  return (
    <div className="sc-card p-6 sm:p-8" aria-live="polite">
      <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted">
        Live programme results
      </p>
      {data === null ? (
        <p className="mt-3 text-sm text-slate">Loading live results…</p>
      ) : !data.available ? (
        <>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-ink">
            Live cohort results will appear here.
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate sm:text-base">
            Once consented cohorts finish their post-assessment, this panel will
            show their combined, anonymised before-and-after change by face. We
            only publish groups of 10 or more learners, and never individual
            scores or journal text. Until then, the figures below are research
            results, not live data.
          </p>
        </>
      ) : (
        <>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-ink">
            {typeof data.overallDelta === "number"
              ? `${signed(data.overallDelta)} points average growth`
              : "Average growth by face"}
          </h2>
          <p className="mt-1 text-sm text-slate">
            {data.learners} learners
            {data.cohorts ? ` across ${data.cohorts} cohorts` : ""} · pre → post,
            0–100 scale
            {data.updatedAt
              ? ` · updated ${formatDateZA(data.updatedAt)}`
              : ""}
          </p>
          <ul className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {constructs.map((c) => {
              const v = data.byFace?.[c.id];
              if (typeof v !== "number") return null;
              return (
                <li key={c.id} className="rounded-xl bg-surface px-3 py-3">
                  <p className="text-sm font-medium text-ink">{c.name}</p>
                  <p className="text-lg font-semibold tabular-nums text-ink">
                    {signed(v)}
                  </p>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}
