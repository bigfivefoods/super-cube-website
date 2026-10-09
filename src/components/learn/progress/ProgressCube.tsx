"use client";

import { useEffect, useState } from "react";
import { SuperCube } from "@/components/SuperCube";
import { constructs, type ConstructId } from "@/lib/content";
import type { ProgressionView } from "@/lib/lms/progression";
import { FACE_TIERS } from "@/lib/lms/progression";

export const CELEBRATE_EVENT = "sc-celebrate-face";

/** The learner's own Super-Cube®: each face lights up as they earn points on it. */
export function ProgressCube({
  view,
  celebrate: initial = null,
  size = "md",
}: {
  view: ProgressionView;
  celebrate?: ConstructId | null;
  size?: "sm" | "md" | "lg";
}) {
  const [celebrate, setCelebrate] = useState<ConstructId | null>(initial);
  useEffect(() => {
    const on = (e: Event) => setCelebrate((e as CustomEvent<ConstructId>).detail);
    window.addEventListener(CELEBRATE_EVENT, on);
    return () => window.removeEventListener(CELEBRATE_EVENT, on);
  }, []);
  useEffect(() => {
    if (!celebrate) return;
    const t = setTimeout(() => setCelebrate(null), 3200);
    return () => clearTimeout(t);
  }, [celebrate]);

  return (
    <section className="rounded-2xl border border-line bg-elevated p-4 sm:p-5" aria-labelledby="cube-h" data-testid="progress-cube">
      <h2 id="cube-h" className="text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-slate">
        Your Super-Cube®
      </h2>
      <p className="mt-1 text-[0.8125rem] leading-snug text-slate">
        Each face lights up as you learn, practise and review it: four steps from dark to fully lit.
      </p>
      <div className="mt-2 flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-6">
        <SuperCube size={size} light={view.tiers} celebrate={celebrate} showSkills={false} autoSpin={false} hideControls className="py-6" />
        <ul className="grid w-full grid-cols-2 gap-1.5 sm:grid-cols-1 sm:gap-1" aria-label="Points per face">
          {constructs.map((c) => {
            const pts = view.faces[c.id];
            const tier = view.tiers[c.id];
            const nextAt = FACE_TIERS[tier];
            return (
              <li key={c.id} className="flex items-center gap-2 text-[0.75rem]" data-face={c.id} data-tier={tier}>
                <span aria-hidden className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: c.color, opacity: tier ? 1 : 0.35 }} />
                <span className="min-w-0 flex-1 truncate font-semibold text-ink">{c.name}</span>
                <span className="tabular-nums text-slate">
                  {pts}
                  {nextAt ? <span className="sr-only"> points; next light at {nextAt}</span> : <span className="sr-only"> points; fully lit</span>}
                </span>
                <span className="flex gap-0.5" aria-hidden>
                  {[1, 2, 3, 4].map((t) => (
                    <i key={t} className="h-1.5 w-2.5 rounded-sm" style={{ background: t <= tier ? c.color : "rgba(127,127,127,0.25)" }} />
                  ))}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
