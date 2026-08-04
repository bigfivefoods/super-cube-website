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
import { getNextBestAction } from "@/lib/lms/next-action";
import { loadLmsState, type LocalLmsState } from "@/lib/lms/store";

/**
 * Today — neat stacked pages next to the LMS sidebar.
 * Scroll down for the next page of content.
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
  const nextAction = getNextBestAction(lms);
  const cont = getContinueTarget(
    lms,
    journey.current.href,
    journey.current.title
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

  const checkInUnlocked = journey.preDone || journey.orientationDone;

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
                ? `${journey.programmeName}${journey.programmeAge ? ` · ${journey.programmeAge}` : ""}. Sidebar stays for navigation — scroll for the next page.`
                : "Use the sidebar to move around. Scroll down for the next page on this screen."
            }
          />

          <div className="mt-5 grid flex-1 gap-5 sm:grid-cols-[1.1fr_0.9fr] sm:items-center">
            <div className="rounded-2xl bg-ink p-5 text-white sm:p-6">
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
                  {pulseToday ? "Checked in" : "No check-in yet"}
                </span>
              </div>
            </div>
            <div className="mx-auto w-[10rem] sm:w-[12rem]">
              <div className="rounded-2xl border border-black/[0.06] bg-[#fafafa] p-3">
                <SuperCube
                  size="sm"
                  showSkills={false}
                  scores={
                    Object.keys(preScores).length ? preScores : undefined
                  }
                />
              </div>
            </div>
          </div>

          <LearnScreenFooter>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <a
                href="#today-next"
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-ink px-5 text-sm font-semibold text-white hover:bg-ink-soft"
              >
                Next page · do this next ↓
              </a>
              <p className="text-center text-[0.75rem] text-muted sm:text-right">
                Scroll down or use the sidebar
              </p>
            </div>
          </LearnScreenFooter>
        </LearnScreen>

        {/* ── Screen 2: Next action ── */}
        <LearnScreen id="today-next" pageLabel="2 / 3">
          <LearnPageHeader
            kicker="Do this next"
            title={nextAction.title}
            description={nextAction.detail}
          />
          <div className="mt-6 flex flex-1 flex-col justify-center">
            <LearnPageActions
              primary={{ href: nextAction.href, label: nextAction.cta }}
              secondary={
                checkInUnlocked
                  ? {
                      href: "/learn/pulse",
                      label: pulseToday
                        ? "Review check-in"
                        : "Open daily check-in",
                    }
                  : undefined
              }
            />
          </div>
          <LearnScreenFooter>
            <a
              href="#today-pages"
              className="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-black/[0.12] bg-[#fafafa] px-5 text-sm font-semibold text-ink hover:bg-black/[0.04]"
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
            description="Open a destination. The sidebar always stays available."
          />
          <div className="mt-5 grid flex-1 content-start gap-2.5 sm:grid-cols-2">
            <LearnNavTile
              href={journey.current.href}
              kicker="Journey"
              title={journey.current.short}
              detail={journey.current.detail || journey.current.description}
              status={`${journey.current.n}/${journey.total}`}
            />
            <LearnNavTile
              href={checkInUnlocked ? "/learn/pulse" : nextAction.href}
              kicker="Check-in"
              title={pulseToday ? "Pulse logged" : "Daily check-in"}
              detail="Calendar · 3 sliders per face · journal"
              status={pulseToday ? "Done" : "Open"}
              accent={constructs[0].color}
            />
            <LearnNavTile
              href={
                cont.kind === "resume" || cont.kind === "next_lesson"
                  ? cont.href
                  : "/learn/courses"
              }
              kicker="Learn"
              title={
                cont.kind === "resume" || cont.kind === "next_lesson"
                  ? cont.title
                  : "Six faces · courses"
              }
              detail={
                cont.detail || "Sessions across all Super-Cube® faces"
              }
              accent={constructs[2].color}
            />
            <LearnNavTile
              href="/learn/report"
              kicker="Progress"
              title="Growth report"
              detail="Scores, patterns, certificate"
              accent={constructs[3].color}
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
