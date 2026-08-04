"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useLocale } from "@/components/LocaleProvider";
import { track } from "@/lib/analytics";
import { getNextBestAction } from "@/lib/lms/next-action";
import { getTodayPulse } from "@/lib/lms/face-tracking";
import { loadLmsState, markDoneForToday } from "@/lib/lms/store";
import { useJourney } from "@/components/learn/JourneyProgress";

/**
 * Mobile sticky bar: one clear next action + done-for-today.
 * Hidden on Check-in (user is already doing the habit).
 */
export function StickyContinue() {
  const journey = useJourney();
  const pathname = usePathname();
  const { t } = useLocale();
  const [ready, setReady] = useState(false);
  const [doneToday, setDoneToday] = useState(false);
  const [pulseDone, setPulseDone] = useState(false);

  useEffect(() => {
    const s = loadLmsState();
    setReady(true);
    const day = new Date().toISOString().slice(0, 10);
    setDoneToday(Boolean(s.doneForTodayAt?.startsWith(day)));
    setPulseDone(Boolean(getTodayPulse(s)));
  }, [journey?.doneCount, pathname]);

  // Don't compete with the check-in form or welcome gate
  if (
    pathname.startsWith("/learn/pulse") ||
    pathname.startsWith("/learn/welcome") ||
    pathname.startsWith("/learn/assessment/")
  ) {
    return null;
  }

  if (!ready || !journey) return null;

  const lms = loadLmsState();
  const action = getNextBestAction(lms);
  const ctaLabel =
    action.kind === "pulse_today" || action.kind === "first_pulse"
      ? "Check in"
      : action.kind === "practice" || action.kind === "streak_recover"
        ? "Practice"
        : action.kind === "lesson"
          ? t("learn.continueSession")
          : action.cta.replace(/\s*→\s*$/, "") || t("learn.continue");

  return (
    <div
      className="pointer-events-none fixed inset-x-0 z-40 lg:hidden"
      style={{
        bottom: "calc(3.5rem + env(safe-area-inset-bottom, 0px))",
      }}
    >
      <div className="container-site pointer-events-auto pb-2">
        <div className="flex items-center gap-2 rounded-2xl border border-black/[0.08] bg-white/95 p-2 shadow-lg backdrop-blur-md">
          <div className="min-w-0 flex-1 pl-1">
            <p className="truncate text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-muted">
              {pulseDone ? "Next" : "Today"}
            </p>
            <p className="truncate text-[0.8125rem] font-semibold text-ink">
              {action.title}
            </p>
          </div>
          <Link
            href={action.href}
            onClick={() =>
              track("continue_click", {
                kind: action.kind,
                sticky: true,
              })
            }
            className="flex min-h-11 shrink-0 items-center justify-center rounded-xl bg-ink px-3.5 text-sm font-semibold text-white"
          >
            {ctaLabel}
          </Link>
          <button
            type="button"
            disabled={doneToday}
            onClick={() => {
              markDoneForToday();
              setDoneToday(true);
              track("session_done_today", {});
            }}
            className="min-h-11 shrink-0 rounded-xl border border-black/[0.1] px-2.5 text-[0.7rem] font-semibold text-ink disabled:opacity-50"
            title={t("learn.doneToday")}
          >
            {doneToday ? "✓" : t("learn.doneTodayShort")}
          </button>
        </div>
      </div>
    </div>
  );
}
