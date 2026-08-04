"use client";

import Link from "next/link";
import type { NextBestAction as Action } from "@/lib/lms/next-action";

export function NextBestActionCard({ action }: { action: Action }) {
  const border =
    action.urgency === "high"
      ? "border-ink bg-ink text-white"
      : "border-black/[0.08] bg-white text-ink";
  const muted =
    action.urgency === "high" ? "text-white/65" : "text-muted";
  const btn =
    action.urgency === "high"
      ? "bg-white text-ink"
      : "bg-ink text-white";

  return (
    <section className={`mb-4 overflow-hidden rounded-2xl border ${border}`}>
      <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:p-5">
        <div className="min-w-0 flex-1">
          <p
            className={`text-[0.65rem] font-semibold uppercase tracking-[0.12em] ${
              action.urgency === "high" ? "text-white/45" : "text-muted"
            }`}
          >
            Next best action
            {action.urgency === "high" ? " · priority" : ""}
          </p>
          <div className="mt-1 flex items-center gap-2">
            {action.color && (
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ background: action.color }}
                aria-hidden
              />
            )}
            <h2 className="text-base font-semibold tracking-tight sm:text-lg">
              {action.title}
            </h2>
          </div>
          <p className={`mt-1 text-[0.8125rem] ${muted}`}>{action.detail}</p>
        </div>
        <Link
          href={action.href}
          className={`inline-flex min-h-10 shrink-0 items-center justify-center rounded-full px-4 text-sm font-semibold ${btn}`}
        >
          {action.cta}
        </Link>
      </div>
    </section>
  );
}
