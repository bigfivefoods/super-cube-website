"use client";

import Link from "next/link";
import { constructs, type ConstructId } from "@/lib/content";
import {
  deriveFacePattern,
  pulseSeries,
  type FaceTrend,
} from "@/lib/lms/face-tracking";
import type { LocalLmsState } from "@/lib/lms/store";
import { FaceSparkline } from "@/components/learn/FaceSparkline";

function trendGlyph(t?: FaceTrend): string {
  if (t === "up") return "↑";
  if (t === "down") return "↓";
  if (t === "flat") return "→";
  return "·";
}

export function FaceMomentum({ state }: { state: LocalLmsState }) {
  const pattern = deriveFacePattern(state);
  const series = pulseSeries(state, 14);
  const overall = series.map((s) => s.overall);

  return (
    <section className="learn-card mb-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="learn-card-title">Face momentum</h2>
          <p className="learn-meta mt-0.5">{pattern.insight}</p>
        </div>
        <Link
          href="/learn/pulse"
          className="text-[0.75rem] font-semibold text-ink underline-offset-2 hover:underline"
        >
          Pulse →
        </Link>
      </div>

      <div className="mt-3">
        <FaceSparkline values={overall} stroke="#0a0a0a" />
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {constructs.map((c) => {
          const avg = pattern.averages[c.id as ConstructId];
          const trend = pattern.trend[c.id as ConstructId];
          return (
            <div
              key={c.id}
              className="rounded-xl border border-black/[0.05] bg-[#fafafa] px-3 py-2.5"
            >
              <div className="flex items-center gap-1.5">
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ background: c.color }}
                />
                <p className="truncate text-[0.75rem] font-semibold text-ink">
                  {c.shortName}
                </p>
                <span className="ml-auto text-[0.7rem] text-muted">
                  {trendGlyph(trend)}
                </span>
              </div>
              <p className="mt-1 text-lg font-semibold tabular-nums text-ink">
                {avg != null ? Math.round(avg) : "—"}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
