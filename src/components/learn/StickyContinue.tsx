"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLocale } from "@/components/LocaleProvider";
import { track } from "@/lib/analytics";
import { getContinueTarget } from "@/lib/lms/continue";
import { loadLmsState, markDoneForToday } from "@/lib/lms/store";
import { useJourney } from "@/components/learn/JourneyProgress";

/**
 * Mobile-friendly sticky continue bar for Learn.
 * Sits above LearnBottomNav (nav ≈ 3.25rem + safe-area).
 */
export function StickyContinue() {
  const journey = useJourney();
  const { t } = useLocale();
  const [ready, setReady] = useState(false);
  const [doneToday, setDoneToday] = useState(false);

  useEffect(() => {
    const s = loadLmsState();
    setReady(true);
    const day = new Date().toISOString().slice(0, 10);
    setDoneToday(Boolean(s.doneForTodayAt?.startsWith(day)));
  }, [journey?.doneCount]);

  if (!ready || !journey) return null;
  const lms = loadLmsState();
  const cont = getContinueTarget(
    lms,
    journey.current.href,
    journey.current.title
  );

  return (
    <div
      className="pointer-events-none fixed inset-x-0 z-40 lg:hidden"
      style={{
        bottom: "calc(3.5rem + env(safe-area-inset-bottom, 0px))",
      }}
    >
      <div className="container-site pointer-events-auto pb-2">
        <div className="flex items-center gap-2 rounded-2xl border border-black/[0.08] bg-white/95 p-2 shadow-lg backdrop-blur-md">
          <Link
            href={cont.href}
            onClick={() =>
              track("continue_click", { kind: cont.kind, sticky: true })
            }
            className="flex min-h-11 flex-1 items-center justify-center rounded-xl bg-ink px-3 text-sm font-semibold text-white"
          >
            {cont.kind === "resume"
              ? t("learn.continueSession")
              : cont.kind === "next_lesson"
                ? t("learn.nextSession")
                : journey.current.cta}
          </Link>
          <button
            type="button"
            disabled={doneToday}
            onClick={() => {
              markDoneForToday();
              setDoneToday(true);
              track("session_done_today", {});
            }}
            className="min-h-11 shrink-0 rounded-xl border border-black/[0.1] px-3 text-xs font-semibold text-ink disabled:opacity-50"
          >
            {doneToday
              ? `${t("learn.doneTodayShort")} ✓`
              : t("learn.doneTodayShort")}
          </button>
        </div>
      </div>
    </div>
  );
}
