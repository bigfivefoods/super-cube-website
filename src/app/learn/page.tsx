"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LearnNavTile } from "@/components/learn/LearnPage";
import { LearnShell } from "@/components/learn/LearnShell";
import { JourneyRail, useJourney } from "@/components/learn/JourneyProgress";
import { useLmsState } from "@/components/learn/useLearnState";
import { constructs } from "@/lib/content";
import { track } from "@/lib/analytics";
import { formatDateZA, SA_TIME_ZONE } from "@/lib/datetime";
import { getTodayPulse } from "@/lib/lms/face-tracking";
import { liveStreak } from "@/lib/lms/badges";
import { getDashboardAction, processLabel } from "@/lib/lms/next-action";
import { LEARN_PROCESS_ACCENT } from "@/lib/lms/nav";
import { nextSpacedReview } from "@/lib/lms/review-schedule";
import { serverHasRecordedPractice } from "@/lib/lms/rewards";
import { localDayKey } from "@/lib/lms/store";
import { syncFromServer } from "@/lib/lms/cloud";
import { progression } from "@/lib/lms/progression";
import { GoalRing } from "@/components/learn/progress/GoalRing";
import { SessionReviewCard } from "@/components/learn/progress/SessionReviewCard";
import { weeklyGoal } from "@/lib/lms/progression";
import { useLmsT } from "@/lib/i18n/lms/use-lms-t";

function greeting(now = new Date()): string {
  const hour = Number(
    new Intl.DateTimeFormat("en-ZA", { hour: "numeric", hourCycle: "h23", timeZone: SA_TIME_ZONE }).format(now),
  );
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

/**
 * Today — one clear "next action" card (the single primary button on the page),
 * then streak / sessions / journal at a glance, the six-step pathway and shortcuts.
 */
function readReviewsDone(): Record<string, string> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem("sc-session-v2:reviews-done");
    return raw ? (JSON.parse(raw) as Record<string, string>) : {};
  } catch {
    return {};
  }
}

export default function LearnDashboardPage() {
  const state = useLmsState();
  const journey = useJourney();
  const { t, L } = useLmsT();
  const [reviewsDone, setReviewsDone] = useState<Record<string, string>>({});

  useEffect(() => {
    setReviewsDone(readReviewsDone());
    track("page_view", { path: "/learn", surface: "today_page" });
  }, [journey.doneCount, state.lastActivityAt]);

  const programmeId = state.subscription?.programmeId || state.user?.programmeId || state.profile?.programmeId;
  useEffect(() => {
    if (!programmeId) return;
    void syncFromServer(programmeId);
  }, [programmeId]);

  const action = getDashboardAction(state, Boolean(journey.programmeId));
  const pulseToday = Boolean(getTodayPulse(state));
  const freezes = state.streakFreezes ?? 0;
  const streak = liveStreak(
    {
      current: state.practiceStreak?.current ?? 0,
      best: state.practiceStreak?.best ?? 0,
      freezes,
      lastDay: state.practiceStreak?.lastDate ?? null,
    },
    localDayKey(),
  );
  const best = state.practiceStreak?.best ?? 0;
  const firstName = (state.profile?.displayName || state.user?.fullName || "").trim().split(/\s+/)[0];
  const complete = journey.doneCount === journey.total;
  const journalUnlocked = journey.preDone || journey.orientationDone;
  const pre = state.attempts.find((a) => a.phase === "pre");
  const review = nextSpacedReview(pre?.completedAt, reviewsDone);
  const rewardsReady = serverHasRecordedPractice(state);
  const reviewWhen =
    review.status === "needs-baseline"
      ? "Starts after your baseline · days 3, 7 and 21"
      : review.status === "finished"
        ? "Day 3, 7 and 21 are done"
        : review.due
          ? review.status === "due"
            ? `Due since ${formatDateZA(review.due)}`
            : `Due ${formatDateZA(review.due)}`
          : "Days 3, 7 and 21";
  const step = t("Step {n} of {total}").replace("{n}", String(journey.current.n)).replace("{total}", String(journey.total));
  const eyebrow =
    action.process === "journaling"
      ? `${t(processLabel(action.process))} · ${t("today")}`
      : `${t(processLabel(action.process))} · ${step}`;

  return (
    <LearnShell>
      <header className="mb-4 sm:mb-5">
        <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-slate">
          {t("Today")} · {formatDateZA(new Date())}
        </p>
        <h1 className="mt-1 text-[1.5rem] font-semibold tracking-tight text-ink sm:text-[1.75rem]">
          {complete ? t("Pathway complete") : `${t(greeting())}${firstName ? `, ${firstName}` : ""}`}
        </h1>
        {journey.programmeName && (
          <p className="mt-1 text-[0.9375rem] text-slate">
            {journey.programmeName}
            {journey.programmeAge ? ` · ${journey.programmeAge}` : ""}
          </p>
        )}
      </header>

      {/* ── The one next action ── */}
      <section
        className="rounded-2xl bg-void p-5 text-void-fg sm:p-6"
        aria-labelledby="next-action-h"
        data-testid="next-action"
      >
        <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-white/70">{eyebrow}</p>
        <h2 id="next-action-h" className="mt-1.5 text-xl font-semibold tracking-tight sm:text-2xl">
          {t(action.title)}
        </h2>
        <p className="mt-2 max-w-prose text-[0.9375rem] leading-relaxed text-white/80">{t(action.detail)}</p>
        <Link
          href={L(action.href)}
          onClick={() => track("continue_click", { kind: action.kind, process: action.process, surface: "today_next_action" })}
          className="mt-5 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-white px-6 text-[0.9375rem] font-semibold text-ink transition hover:bg-white/90 sm:w-auto"
        >
          {t(action.cta).replace(/\s*→$/, "")} <span aria-hidden className="ml-1.5">→</span>
        </Link>
        <div className="mt-5">
          <div className="h-1.5 overflow-hidden rounded-full bg-white/15" aria-hidden>
            <div className="h-full rounded-full bg-white" style={{ width: `${Math.max(journey.pct, 4)}%` }} />
          </div>
          <p className="mt-2 text-[0.75rem] text-white/70">
            {t("{done} of {total} pathway steps done")
              .replace("{done}", String(journey.doneCount))
              .replace("{total}", String(journey.total))}
          </p>
        </div>
      </section>

      {/* ── At a glance ── */}
      <dl className="mt-3 grid grid-cols-3 gap-2 sm:mt-4 sm:gap-3">
        <div className="rounded-2xl border border-line bg-elevated p-3 sm:p-4">
          <dt className="text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-slate">{t("Streak")}</dt>
          <dd className="mt-1 text-lg font-semibold tabular-nums text-ink sm:text-xl">
            {streak} {streak === 1 ? t("day") : t("days")}
            {(best > streak || freezes > 0) && (
              <span className="mt-0.5 block text-[0.7rem] font-normal text-slate">
                {best > streak ? `${t("Best")} ${best}` : ""}
                {best > streak && freezes > 0 ? " · " : ""}
                {freezes > 0 ? `❄ ${freezes} freeze${freezes === 1 ? "" : "s"}` : ""}
              </span>
            )}
          </dd>
        </div>
        <div className="rounded-2xl border border-line bg-elevated p-3 sm:p-4">
          <dt className="text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-slate">{t("Sessions")}</dt>
          <dd className="mt-1 text-lg font-semibold tabular-nums text-ink sm:text-xl">
            {journey.totalLessons ? (
              <>
                {journey.completedLessons}
                <span className="text-sm font-medium text-slate">/{journey.totalLessons}</span>
              </>
            ) : (
              <span className="text-[0.9375rem] text-slate">{t("After step 1")}</span>
            )}
          </dd>
        </div>
        <div className="rounded-2xl border border-line bg-elevated p-3 sm:p-4">
          <dt className="text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-slate">{t("Journal")}</dt>
          <dd className="mt-1 text-[0.9375rem] font-semibold text-ink">
            {!journalUnlocked ? (
              <span className="text-slate">{t("After orientation")}</span>
            ) : pulseToday ? (
              t("Done today")
            ) : (
              <Link href={L("/learn/pulse")} className="underline underline-offset-2">
                {t("Check in")}
              </Link>
            )}
          </dd>
        </div>
      </dl>

      <div className="mt-3 grid gap-3 sm:mt-4 sm:grid-cols-2">
        <TodayProgress state={state} />
        <SessionReviewCard state={state} fallback={{ title: review.title, when: reviewWhen, href: review.href }} />
      </div>

      {/* ── Pathway ── */}
      <div className="mt-4 sm:mt-5">
        <JourneyRail journey={journey} hideCta />
      </div>

      {/* ── Shortcuts ── */}
      <h2 className="mt-6 text-[0.8125rem] font-semibold uppercase tracking-[0.12em] text-slate">{t("Go to")}</h2>
      <div className="mt-2 grid gap-2.5 sm:grid-cols-2">
        <LearnNavTile
          href="/learn/courses"
          kicker="Learning"
          title="Six faces · courses"
          detail={`${journey.coursePct}% of sessions done`}
          accent={LEARN_PROCESS_ACCENT.learning.color}
        />
        <LearnNavTile
          href={journalUnlocked ? "/learn/pulse" : journey.current.href}
          kicker="Journaling"
          title="Daily check-in"
          detail="Rate your faces, then a two-minute practice"
          status={pulseToday ? "Done" : undefined}
          accent={LEARN_PROCESS_ACCENT.journaling.color}
        />
        {rewardsReady ? (
          <LearnNavTile
            href="/learn/report"
            kicker="Earned"
            title="Growth report and certificate"
            detail="The server has recorded your practice"
            accent={constructs[5].color}
          />
        ) : (
          <div className="rounded-2xl border border-dashed border-line bg-elevated p-4" data-testid="rewards-locked">
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-slate">{t("Not yet earned")}</p>
            <p className="mt-1 text-[0.9375rem] font-semibold text-ink">{t("Growth report and certificate")}</p>
            <p className="mt-1 text-[0.8125rem] leading-snug text-slate">
              Offered when the server has recorded your sessions and after-test. A score kept only on this device does not unlock them.
            </p>
          </div>
        )}
        <LearnNavTile href="/learn/account" kicker="You" title="Profile and settings" detail="Your details, consent and data" />
      </div>
    </LearnShell>
  );
}

/** Level, points and the weekly goal ring, linking to the full Progress page. */
function TodayProgress({ state }: { state: ReturnType<typeof useLmsState> }) {
  const v = progression(state);
  const g = weeklyGoal(state);
  const { t, L } = useLmsT();
  return (
    <Link
      href={L("/learn/progress")}
      className="flex items-center gap-4 rounded-2xl border border-line bg-elevated p-4 transition hover:border-black/15 sm:p-5"
      data-testid="today-progress"
    >
      {g.target ? (
        <GoalRing done={g.done} target={g.target} size={72} stroke={7} color="#16979A" label={`Weekly goal: ${g.done} of ${g.target}`} />
      ) : null}
      <span className="min-w-0">
        <span className="block text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-slate">
          Level {v.level.level.n} · {v.total} points
        </span>
        <span className="mt-0.5 block text-[1rem] font-semibold tracking-tight text-ink">{v.level.level.name}</span>
        <span className="mt-0.5 block text-[0.8125rem] leading-snug text-slate">
          {g.target
            ? g.reached
              ? "Weekly goal reached. "
              : `${g.target - g.done} more for your weekly goal. `
            : "Set a weekly goal on your Progress page. "}
          {v.level.next ? `${v.level.toNext} points to ${v.level.next.name}.` : ""}
        </span>
      </span>
    </Link>
  );
}
