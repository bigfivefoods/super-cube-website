"use client";

import Link from "next/link";
import { FaceSparkline } from "@/components/learn/FaceSparkline";
import {
  deriveFacePattern,
  pulseSeries,
} from "@/lib/lms/face-tracking";
import type { LocalLmsState } from "@/lib/lms/store";

/** Empty-state / progress theatre for continuous face tracking on the dashboard */
export function CubeTheatre({ lms }: { lms: LocalLmsState }) {
  const pattern = deriveFacePattern(lms);
  const series = pulseSeries(lms, 14).map((d) => d.overall);
  const hasPulses = pattern.pulseCount > 0;

  return (
    <section className="mb-4 overflow-hidden rounded-2xl border border-black/[0.07] bg-white">
      <div className="flex items-start justify-between gap-3 border-b border-black/[0.05] px-4 py-3.5 sm:px-5">
        <div className="min-w-0">
          <p className="learn-eyebrow">
            {hasPulses ? "Face tracking" : "Your cube is forming"}
          </p>
          <p className="mt-0.5 text-[0.9375rem] font-semibold text-ink">
            {hasPulses
              ? pattern.insight
              : "Log a 60-second pulse so patterns can emerge."}
          </p>
          <p className="learn-meta mt-0.5">
            {hasPulses
              ? `${pattern.pulseCount} pulse${pattern.pulseCount === 1 ? "" : "s"} · ${pattern.consistency}% consistency (28 days)`
              : "Daily or weekly ratings across the six faces guide practice."}
          </p>
        </div>
        <Link
          href="/learn/pulse"
          className="shrink-0 rounded-full bg-ink px-3 py-1.5 text-[0.75rem] font-semibold text-white"
        >
          {hasPulses ? "Track →" : "First pulse →"}
        </Link>
      </div>
      <div className="px-4 py-3 sm:px-5">
        {hasPulses ? (
          <FaceSparkline values={series} />
        ) : (
          <div className="flex h-10 items-end gap-1">
            {Array.from({ length: 14 }).map((_, i) => (
              <span
                key={i}
                className="flex-1 rounded-sm bg-black/[0.06]"
                style={{ height: `${20 + ((i * 7) % 40)}%` }}
              />
            ))}
          </div>
        )}
        {!hasPulses && (
          <p className="learn-meta mt-2">
            Placeholder trend — your sparkline appears after the first save.
          </p>
        )}
      </div>
    </section>
  );
}
