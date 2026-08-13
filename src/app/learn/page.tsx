"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  LearnNavTile,
  LearnPage,
  LearnPageActions,
  LearnPageHeader,
  LearnScreen,
  LearnScreenFooter,
} from "@/components/learn/LearnPage";
import { LearnShell } from "@/components/learn/LearnShell";
import { SuperCube } from "@/components/SuperCube";
import { useJourney } from "@/components/learn/JourneyProgress";
import { constructs, type ConstructId } from "@/lib/content";
import { track } from "@/lib/analytics";
import { getContinueTarget } from "@/lib/lms/continue";
import { getTodayPulse } from "@/lib/lms/face-tracking";
import {
  getJournalAction,
  getLearningAction,
  getNextBestAction,
  processLabel,
} from "@/lib/lms/next-action";
import { LEARN_PROCESS_ACCENT } from "@/lib/lms/nav";
import { loadLmsState, type LocalLmsState } from "@/lib/lms/store";

/**
 * Today — dual-process hub: Learning pathway + Journaling loop side by side.
 */
export default function LearnDashboardPage() {
  const journey = useJourney();
  const [state, setState] = useState<LocalLmsState | null>(null);

  useEffect(() => {
    setState(loadLmsState());
    track("page_view", { path: "/learn", surface: "today_page" });
  }, [journey?.doneCount]);

  if (!journey) {
    return (
      <LearnShell>
        <LearnPage>
          <p className="text-sm text-muted">Loading…</p>
        </LearnPage>
      </LearnShell>
    );
  }

  const lms = state ?? loadLmsState();
  const learningAction = getLearningAction(lms);
  const journalAction = getJournalAction(lms);
  const suggested = getNextBestAction(lms);
  const cont = getContinueTarget(
    lms,
    journey.current.href,
    journey.current.title,
  );
  const pulseToday = Boolean(getTodayPulse(lms));
  const streak = lms.practiceStreak?.current ?? 0;

  const preScores: Partial<Record<ConstructId, number>> = {};
  const pre = lms.attempts.find((a) => a.phase === "pre");
  if (pre) {
    for (const s of pre.result.constructScores) {
      preScores[s.constructId] = s.score;
    }
  }

  const journalUnlocked = journey.preDone || journey.orientationDone;

  // Learning CTA: pathway/continue only — never pulse
  const learningHref =
    learningAction?.href ??
    (cont.kind === "resume" || cont.kind === "next_lesson"
      ? cont.href
      : journey.current.href);
  const learningTitle =
    learningAction?.title ?? journey.current.title;
  const learningDetail =
    learningAction?.detail ?? journey.current.promise;
  const learningCta =
    learningAction?.cta ?? "Continue pathway →";

  const journalHref = journalAction?.href ?? "/learn/pulse";
  const journalTitle =
    journalAction?.title ??
    (pulseToday ? "Pulse logged today" : "Daily face pulse");
  const journalDetail =
    journalAction?.detail ??
    (pulseToday
      ? `Streak ${streak}d · open practice or review faces`
      : "Rate faces, then micro-practice");
  const journalCta =
    journalAction?.cta ?? (pulseToday ? "Open practice →" : "Log pulse →");

  return (
    <LearnShell>
      <LearnPage snap>
        {/* ── Screen 1: Where you are ── */}
        <LearnScreen id="today-status" pageLabel="1 / 3">
          <LearnPageHeader
            kicker="Today"
            title={
              journey.doneCount === journey.total
                ? "Pathway complete"
                : "Your day on Super-Cube®"
            }
            description={
              journey.programmeName
                ? `${journey.programmeName}${journey.programmeAge ? ` · ${journey.programmeAge}` : ""}. Two processes: Learning (course pathway) and Journaling (daily pulse).`
                : "Two processes side by side — Learning (courses) and Journaling (daily check-in)."
            }
          />

          <div className="mt-5 grid flex-1 gap-5 sm:grid-cols-[1.1fr_0.9fr] sm:items-center">
            <div className="rounded-2xl bg-void p-5 text-void-fg sm:p-6">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-white/45">
                Pathway · step {journey.current.n} of {journey.total}
              </p>
              <h2 className="mt-1.5 text-lg font-semibold tracking-tight sm:text-xl">
                {journey.current.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-white/65">
                {journey.current.promise}
              </p>
              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/15">
                <div
                  className="h-full rounded-full bg-white"
                  style={{ width: `${Math.max(journey.pct, 4)}%` }}
                />
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-[0.7rem] font-medium text-white/75">
                <span className="rounded-full bg-white/10 px-2.5 py-1">
                  {journey.pct}%
                </span>
                <span className="rounded-full bg-white/10 px-2.5 py-1">
                  Streak {streak}d
                </span>
                <span className="rounded-full bg-white/10 px-2.5 py-1">
                  {pulseToday ? "Journal done" : "Journal open"}
                </span>
              </div>
            </div>
            <div className="mx-auto w-[10rem] sm:w-[12rem]">
              <div className="rounded-2xl border border-line bg-surface p-3">
                <SuperCube
                  size="sm"
                  showSkills={false}
                  scores={Object.keys(preScores).length ? preScores : undefined}
                />
              </div>
            </div>
          </div>

          {suggested && (
            <p className="mt-4 text-center text-[0.8125rem] text-muted">
              <span className="font-semibold text-ink">
                Suggested · {processLabel(suggested.process)}:
              </span>{" "}
              {suggested.title}
            </p>
          )}

          <LearnScreenFooter>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <a
                href="#today-processes"
                className="inline-flex min-h-11 items-center justify-center rounded-full sc-btn-primary px-5 text-sm font-semibold hover:opacity-90"
              >
                Next page · two processes ↓
              </a>
              <p className="text-center text-[0.75rem] text-muted sm:text-right">
                Scroll down or use the sidebar
              </p>
            </div>
          </LearnScreenFooter>
        </LearnScreen>

        {/* ── Screen 2: Dual process cards ── */}
        <LearnScreen id="today-processes" pageLabel="2 / 3">
          <LearnPageHeader
            kicker="Do this next"
            title="Learning and Journaling"
            description="Two equal tracks — pick one. Labels never mix them into a single ambiguous list."
          />

          <div className="mt-5 grid flex-1 content-start gap-3 md:grid-cols-2 md:gap-4">
            {/* Learning process card */}
            <section
              className="flex flex-col rounded-2xl border border-line bg-elevated p-4 sm:p-5"
              style={{
                borderTopWidth: 3,
                borderTopColor: LEARN_PROCESS_ACCENT.learning.color,
              }}
            >
              <p
                className="text-[0.65rem] font-semibold uppercase tracking-[0.14em]"
                style={{ color: LEARN_PROCESS_ACCENT.learning.color }}
              >
                Learning
              </p>
              <h3 className="mt-1.5 text-base font-semibold tracking-tight text-ink sm:text-lg">
                {learningTitle}
              </h3>
              <p className="mt-1.5 flex-1 text-[0.8125rem] leading-relaxed text-muted">
                {learningDetail}
              </p>
              <p className="mt-2 text-[0.7rem] text-muted">
                Step {journey.current.n}/{journey.total} · {journey.current.short}
              </p>
              <Link
                href={learningHref}
                onClick={() =>
                  track("continue_click", {
                    kind: learningAction?.kind ?? "lesson",
                    process: "learning",
                    surface: "today_card",
                  })
                }
                className="mt-4 inline-flex min-h-11 items-center justify-center rounded-full sc-btn-primary px-4 text-sm font-semibold"
              >
                {learningCta}
              </Link>
            </section>

            {/* Journaling process card */}
            <section
              className="flex flex-col rounded-2xl border border-line bg-elevated p-4 sm:p-5"
              style={{
                borderTopWidth: 3,
                borderTopColor: LEARN_PROCESS_ACCENT.journaling.color,
              }}
            >
              <p
                className="text-[0.65rem] font-semibold uppercase tracking-[0.14em]"
                style={{ color: LEARN_PROCESS_ACCENT.journaling.color }}
              >
                Journaling
              </p>
              <h3 className="mt-1.5 text-base font-semibold tracking-tight text-ink sm:text-lg">
                {journalUnlocked
                  ? journalTitle
                  : "Unlock after orientation"}
              </h3>
              <p className="mt-1.5 flex-1 text-[0.8125rem] leading-relaxed text-muted">
                {journalUnlocked
                  ? journalDetail
                  : "Finish orientation or baseline, then daily face pulse starts here."}
              </p>
              <p className="mt-2 text-[0.7rem] text-muted">
                {pulseToday ? "Checked in today" : "No pulse yet today"}
                {streak > 0 ? ` · streak ${streak}d` : ""}
              </p>
              <Link
                href={
                  journalUnlocked
                    ? journalHref
                    : learningAction?.href ?? journey.current.href
                }
                onClick={() =>
                  track("continue_click", {
                    kind: journalAction?.kind ?? "pulse_today",
                    process: "journaling",
                    surface: "today_card",
                  })
                }
                className="mt-4 inline-flex min-h-11 items-center justify-center rounded-full border border-line-strong bg-surface px-4 text-sm font-semibold text-ink hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
              >
                {journalUnlocked ? journalCta : "Continue setup →"}
              </Link>
            </section>
          </div>

          <LearnScreenFooter>
            <a
              href="#today-pages"
              className="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-line-strong bg-surface px-5 text-sm font-semibold text-ink hover:bg-black/[0.04] dark:hover:bg-white/[0.06]"
            >
              Next page · all destinations ↓
            </a>
          </LearnScreenFooter>
        </LearnScreen>

        {/* ── Screen 3: Page map ── */}
        <LearnScreen id="today-pages" pageLabel="3 / 3">
          <LearnPageHeader
            kicker="Pages"
            title="Where do you want to go?"
            description="Destinations grouped by process. Sidebar always stays available."
          />
          <div className="mt-5 grid flex-1 content-start gap-2.5 sm:grid-cols-2">
            <LearnNavTile
              href={learningHref}
              kicker="Learning"
              title={
                cont.kind === "resume" || cont.kind === "next_lesson"
                  ? cont.title
                  : journey.current.short
              }
              detail={
                cont.detail ||
                journey.current.detail ||
                journey.current.description
              }
              status={`${journey.current.n}/${journey.total}`}
              accent={LEARN_PROCESS_ACCENT.learning.color}
            />
            <LearnNavTile
              href={journalUnlocked ? "/learn/pulse" : learningHref}
              kicker="Journaling"
              title={pulseToday ? "Pulse logged" : "Daily check-in"}
              detail="Calendar · faces · journal · practice"
              status={pulseToday ? "Done" : "Open"}
              accent={LEARN_PROCESS_ACCENT.journaling.color}
            />
            <LearnNavTile
              href="/learn/courses"
              kicker="Learning"
              title="Six faces · courses"
              detail="Sessions across all Super-Cube® faces"
              accent={constructs[2].color}
            />
            <LearnNavTile
              href="/learn/report"
              kicker="Learning"
              title="Growth report"
              detail="Scores, patterns, certificate"
              accent={constructs[5].color}
            />
          </div>
          <LearnScreenFooter>
            <LearnPageActions
              secondary={{ href: "/learn/account", label: "You · profile" }}
              tertiary={{ href: "#today-status", label: "Back to top" }}
            />
          </LearnScreenFooter>
        </LearnScreen>
      </LearnPage>
    </LearnShell>
  );
}
