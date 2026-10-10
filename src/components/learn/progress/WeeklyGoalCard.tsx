"use client";

import { track } from "@/lib/analytics";
import { WEEKLY_GOAL_OPTIONS, weeklyGoal } from "@/lib/lms/progression";
import { setWeeklyGoal, type LocalLmsState } from "@/lib/lms/store";
import { GoalRing } from "./GoalRing";

const RING = "#16979A";

/** The learner's weekly goal: pick 3, 5 or 7, then watch the ring fill. */
export function WeeklyGoalCard({ state, compact = false }: { state: LocalLmsState; compact?: boolean }) {
  const g = weeklyGoal(state);
  const kids = (state.subscription?.programmeId || state.user?.programmeId || state.profile?.programmeId) === "kids";
  const choose = (n: number) => {
    setWeeklyGoal(n);
    track("weekly_goal_set", { target: String(n) });
  };
  return (
    <section className="rounded-2xl border border-line bg-elevated p-4 sm:p-5" aria-labelledby="goal-h" data-testid="weekly-goal">
      <h2 id="goal-h" className="text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-slate">
        Weekly goal
      </h2>
      {g.target ? (
        <div className="mt-2 flex items-center gap-4">
          <GoalRing done={g.done} target={g.target} color={RING} label={`Weekly goal: ${g.done} of ${g.target} this week`} />
          <div className="min-w-0">
            <p className="text-[1rem] font-semibold tracking-tight text-ink">
              {g.reached ? (kids ? "Goal reached! Amazing!" : "Goal reached this week") : `${g.target - g.done} to go`}
            </p>
            <p className="mt-0.5 text-[0.8125rem] leading-snug text-slate">
              Sessions, micro-practices and reviews all count.{" "}
              {g.reached ? "Anything more is a bonus." : g.daysLeft > 0 ? `${g.daysLeft} day${g.daysLeft === 1 ? "" : "s"} left this week.` : "Last day of the week."}
            </p>
            {g.weeksHit.length > 0 && (
              <p className="mt-1 text-[0.75rem] font-medium text-ink">
                Reached in {g.weeksHit.length} week{g.weeksHit.length === 1 ? "" : "s"}
              </p>
            )}
            {!compact && (
              <div className="mt-2 flex flex-wrap items-center gap-1.5" role="group" aria-label="Change weekly goal">
                {WEEKLY_GOAL_OPTIONS.map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => choose(n)}
                    aria-pressed={g.target === n}
                    className={`min-h-9 rounded-full border px-3 text-[0.75rem] font-semibold ${
                      g.target === n ? "border-transparent bg-void text-void-fg" : "border-line text-ink hover:border-ink/30"
                    }`}
                  >
                    {n} a week
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="mt-2">
          <p className="text-[0.9375rem] font-semibold text-ink">
            {kids ? "How many times this week?" : "Set a weekly goal you can keep"}
          </p>
          <p className="mt-0.5 text-[0.8125rem] leading-snug text-slate">
            Sessions, micro-practices and reviews all count. Small and steady beats big and rare.
          </p>
          <div className="mt-3 grid grid-cols-3 gap-2" role="group" aria-label="Choose a weekly goal">
            {WEEKLY_GOAL_OPTIONS.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => choose(n)}
                className="flex min-h-14 flex-col items-center justify-center rounded-xl border border-line bg-surface px-2 text-ink hover:border-ink/30"
              >
                <span className="text-lg font-semibold tabular-nums leading-none">{n}</span>
                <span className="mt-0.5 text-[0.6875rem] text-slate">{n === 3 ? "Steady" : n === 5 ? "Regular" : "Daily"}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
