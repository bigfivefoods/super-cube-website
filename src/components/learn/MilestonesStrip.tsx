"use client";

import { getMilestones } from "@/lib/lms/milestones";
import type { LocalLmsState } from "@/lib/lms/store";

export function MilestonesStrip({ state }: { state: LocalLmsState }) {
  const items = getMilestones(state);
  const earned = items.filter((m) => m.earned).length;

  return (
    <section className="learn-card mb-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="learn-card-title">Wins & milestones</h2>
        <p className="text-[0.75rem] font-semibold tabular-nums text-muted">
          {earned}/{items.length}
        </p>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.map((m) => (
          <span
            key={m.id}
            title={m.detail || m.label}
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.7rem] font-semibold ${
              m.earned
                ? "border-emerald-600/30 bg-emerald-50 text-emerald-800"
                : "border-black/[0.08] bg-[#fafafa] text-muted"
            }`}
          >
            <span aria-hidden>{m.earned ? "✓" : "○"}</span>
            {m.label}
          </span>
        ))}
      </div>
    </section>
  );
}
