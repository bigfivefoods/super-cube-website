"use client";

import { useLmsT } from "@/lib/i18n/lms/use-lms-t";

import Link from "next/link";
import { constructs } from "@/lib/content";
import { deriveFacePattern } from "@/lib/lms/face-tracking";
import type { LocalLmsState } from "@/lib/lms/store";

export function WeeklyReviewCard({ state }: { state: LocalLmsState }) {
  const { t } = useLmsT();

  const isSunday = new Date().getDay() === 0;
  const pattern = deriveFacePattern(state);
  const focus = pattern.weakest[0]
    ? constructs.find((c) => c.id === pattern.weakest[0])
    : null;

  if (!isSunday && pattern.pulseCount < 3) return null;

  return (
    <section className="mb-4 rounded-2xl border border-line bg-gradient-to-br from-surface to-elevated p-4 sm:p-5">
      <p className="learn-eyebrow">
        {isSunday ? t("Sunday ritual") : t("Weekly focus")}
      </p>
      <h2 className="mt-1 text-base font-semibold text-ink">
        {focus
          ? `This week’s stretch face · ${focus.name}`
          : t("Review your week")}
      </h2>
      <p className="mt-1 text-[0.8125rem] text-slate">{pattern.insight}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Link href="/learn/pulse" className="learn-btn learn-btn-primary">{t("Log weekly pulse →")}</Link>
        <Link href="/learn/practice" className="learn-btn learn-btn-ghost">{t("3 micro-practices")}</Link>
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
