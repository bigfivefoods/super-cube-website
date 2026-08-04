"use client";

import Link from "next/link";
import { constructs, type ConstructId } from "@/lib/content";
import { FaceSparkline } from "@/components/learn/FaceSparkline";
import {
  deriveFacePattern,
  pulseSeries,
} from "@/lib/lms/face-tracking";
import type { LocalLmsState } from "@/lib/lms/store";

export function LongitudinalPanel({ state }: { state: LocalLmsState }) {
  const series = pulseSeries(state, 28);
  const overall = series.map((s) => s.overall);
  const pattern = deriveFacePattern(state, 28);
  const hasData = overall.some((v) => v != null);

  return (
    <section className="learn-card mb-4 sm:mb-5 print:break-inside-avoid">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="learn-card-title">Longitudinal trajectory</h2>
          <p className="learn-meta mt-0.5">
            28-day face pulses · consistency {pattern.consistency}% ·{" "}
            {pattern.pulseCount} check-ins
          </p>
        </div>
        <Link
          href="/learn/pulse"
          className="text-[0.75rem] font-semibold text-ink underline-offset-2 hover:underline print:hidden"
        >
          Open pulse →
        </Link>
      </div>

      {!hasData ? (
        <div className="mt-3">
          <p className="learn-body">
            Log daily or weekly face pulses to unlock your trajectory chart.
          </p>
          <Link
            href="/learn/pulse"
            className="learn-btn learn-btn-primary mt-3 inline-flex print:hidden"
          >
            Start tracking →
          </Link>
        </div>
      ) : (
        <>
          <div className="mt-3">
            <p className="learn-eyebrow mb-1">Overall capacity</p>
            <FaceSparkline values={overall} width={320} height={56} />
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {constructs.map((c) => {
              const vals = series.map(
                (s) => s.faces[c.id as ConstructId] ?? null
              );
              const avg = pattern.averages[c.id as ConstructId];
              return (
                <div
                  key={c.id}
                  className="rounded-xl border border-black/[0.05] bg-[#fafafa] p-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 text-[0.75rem] font-semibold text-ink">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ background: c.color }}
                      />
                      {c.shortName}
                    </span>
                    <span className="text-[0.75rem] font-semibold tabular-nums text-ink">
                      {avg != null ? Math.round(avg) : "—"}
                    </span>
                  </div>
                  <div className="mt-1.5">
                    <FaceSparkline
                      values={vals}
                      width={140}
                      height={36}
                      stroke={c.color}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <p className="learn-meta mt-3">{pattern.insight}</p>
        </>
      )}
    </section>
  );
}
