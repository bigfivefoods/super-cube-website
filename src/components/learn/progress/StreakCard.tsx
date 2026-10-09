"use client";

import { liveStreak } from "@/lib/lms/badges";
import { FREEZE_EVERY_DAYS, localDayKey, MAX_STREAK_FREEZES } from "@/lib/lms/day";
import { formatDateZA } from "@/lib/datetime";
import type { LocalLmsState } from "@/lib/lms/store";

/** Streak with earned freezes: one per 7 days in a row, hold up to 2. */
export function StreakCard({ state }: { state: LocalLmsState }) {
  const freezes = Math.min(MAX_STREAK_FREEZES, state.streakFreezes ?? 0);
  const current = state.practiceStreak?.current ?? 0;
  const streak = liveStreak(
    { current, best: state.practiceStreak?.best ?? 0, freezes, lastDay: state.practiceStreak?.lastDate ?? null },
    localDayKey(),
  );
  const best = Math.max(state.practiceStreak?.best ?? 0, streak);
  const toNext = FREEZE_EVERY_DAYS - (streak % FREEZE_EVERY_DAYS || (streak > 0 ? FREEZE_EVERY_DAYS : 0));
  const usedOn = state.streakFreezeUsedOn;
  return (
    <section className="rounded-2xl border border-line bg-elevated p-4 sm:p-5" aria-labelledby="streak-h" data-testid="streak-card">
      <h2 id="streak-h" className="text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-slate">
        Streak
      </h2>
      <div className="mt-1 flex items-end justify-between gap-3">
        <p className="text-[1.75rem] font-semibold leading-none tabular-nums text-ink">
          {streak}
          <span className="ml-1 text-[0.9375rem] font-medium text-slate">{streak === 1 ? "day" : "days"}</span>
        </p>
        <p className="text-[0.75rem] text-slate">Best {best}</p>
      </div>
      <div className="mt-3 flex items-center gap-2" aria-label={`${freezes} of ${MAX_STREAK_FREEZES} streak freezes`} role="img">
        {Array.from({ length: MAX_STREAK_FREEZES }, (_, i) => (
          <span
            key={i}
            className={`flex h-8 w-8 items-center justify-center rounded-full border text-[0.9375rem] ${
              i < freezes ? "border-sky-300 bg-sky-50 text-sky-700 dark:border-sky-700 dark:bg-sky-950/40 dark:text-sky-200" : "border-dashed border-line text-slate"
            }`}
            aria-hidden
          >
            ❄
          </span>
        ))}
        <p className="text-[0.8125rem] font-semibold text-ink">
          {freezes} streak freeze{freezes === 1 ? "" : "s"}
        </p>
      </div>
      <p className="mt-2 text-[0.75rem] leading-snug text-slate" data-testid="freeze-explainer">
        A freeze covers one missed day automatically. You earn one for every {FREEZE_EVERY_DAYS} days in a row and can hold {MAX_STREAK_FREEZES}.
        {freezes < MAX_STREAK_FREEZES && streak > 0 ? ` Next one in ${toNext} day${toNext === 1 ? "" : "s"}.` : ""}
      </p>
      {usedOn && (
        <p className="mt-2 rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-[0.8125rem] text-sky-950 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-100" role="status" data-testid="freeze-used">
          ❄ A streak freeze covered a missed day, so your streak carried on ({formatDateZA(new Date(`${usedOn}T12:00:00`))}).
        </p>
      )}
    </section>
  );
}
