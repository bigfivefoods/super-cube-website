"use client";

import Link from "next/link";
import { constructs } from "@/lib/content";
import { deriveFacePattern } from "@/lib/lms/face-tracking";
import type { LocalLmsState } from "@/lib/lms/store";

export function WeeklyReviewCard({ state }: { state: LocalLmsState }) {
  const isSunday = new Date().getDay() === 0;
  const pattern = deriveFacePattern(state);
  const focus = pattern.weakest[0]
    ? constructs.find((c) => c.id === pattern.weakest[0])
    : null;

  if (!isSunday && pattern.pulseCount < 3) return null;

  return (
    <section className="mb-4 rounded-2xl border border-black/[0.07] bg-gradient-to-br from-[#f8f9fb] to-white p-4 sm:p-5">
      <p className="learn-eyebrow">
        {isSunday ? "Sunday ritual" : "Weekly focus"}
      </p>
      <h2 className="mt-1 text-base font-semibold text-ink">
        {focus
          ? `This week’s stretch face · ${focus.name}`
          : "Review your week"}
      </h2>
      <p className="mt-1 text-[0.8125rem] text-slate">{pattern.insight}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Link href="/learn/pulse" className="learn-btn learn-btn-primary">
          Log weekly pulse →
        </Link>
        <Link href="/learn/practice" className="learn-btn learn-btn-ghost">
          3 micro-practices
        </Link>
        {focus && (
          <Link
            href={`/learn/courses/${focus.id}`}
            className="learn-btn learn-btn-ghost"
          >
            {focus.shortName} sessions
          </Link>
        )}
      </div>
    </section>
  );
}
