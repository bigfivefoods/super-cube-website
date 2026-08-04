"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  LearnCard,
  LearnCardBody,
  LearnNavTile,
  LearnPage,
  LearnPageActions,
  LearnPageHeader,
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
 * Today — page 1 of the LMS.
 * Clear overview + page-by-page links (not infinite scroll).
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
  const cont = getContinueTarget(lms, journey.current.href, journey.current.title);
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
      <LearnPage>
        <LearnPageHeader
          kicker="Learn · Today"
          title={
            journey.doneCount === journey.total
              ? "Pathway complete"
              : "Your day on Super-Cube®"
          }
          description={
            journey.programmeName
              ? `${journey.programmeName}${journey.programmeAge ? ` · ${journey.programmeAge}` : ""}. One clear next step, then move page by page.`
              : "One clear next step. Open the next page when you are ready."
          }
        />

        {/* Status + cube */}
        <LearnCard tone="ink">
          <LearnCardBody className="!p-5 sm:!p-6">
            <div className="grid gap-6 sm:grid-cols-[1fr_auto] sm:items-center">
              <div>
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-white/45">
                  Pathway · step {journey.current.n} of {journey.total}
                </p>
                <h2 className="mt-1.5 text-lg font-semibold tracking-tight text-white sm:text-xl">
                  {journey.current.title}
                </h2>
                <p className="mt-1.5 text-sm leading-relaxed text-white/65">
                  {journey.current.promise}
                </p>
                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/15">
                  <div
                    className="h-full rounded-full bg-white transition-all"
                    style={{ width: `${Math.max(journey.pct, 4)}%` }}
                  />
                </div>
                <div className="mt-3 flex flex-wrap gap-2 text-[0.7rem] font-medium text-white/75">
                  <span className="rounded-full bg-white/10 px-2.5 py-1">
                    {journey.pct}% complete
                  </span>
                  <span className="rounded-full bg-white/10 px-2.5 py-1">
                    Streak {streak}d
                  </span>
                  <span className="rounded-full bg-white/10 px-2.5 py-1">
                    {pulseToday ? "Checked in" : "No check-in yet"}
                  </span>
                </div>
              </div>
              <div className="mx-auto w-[9.5rem] sm:w-[11rem]">
                <div className="rounded-2xl bg-white/5 p-2 ring-1 ring-white/10">
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
          </LearnCardBody>
        </LearnCard>

        {/* Primary next action */}
        <LearnCard>
          <LearnCardBody>
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted">
              Do this next
            </p>
            <h2 className="mt-1 text-base font-semibold tracking-tight text-ink sm:text-lg">
              {nextAction.title}
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-slate">
              {nextAction.detail}
            </p>
            <div className="mt-4">
              <LearnPageActions
                primary={{ href: nextAction.href, label: nextAction.cta }}
              />
            </div>
          </LearnCardBody>
        </LearnCard>

        {/* Page map — clear cut destinations */}
        <div>
          <p className="mb-2.5 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted">
            Pages
          </p>
          <div className="grid gap-2.5 sm:grid-cols-2">
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
              title={pulseToday ? "Today’s pulse logged" : "Daily check-in"}
              detail={
                checkInUnlocked
                  ? "Calendar · 3 sliders per face · journal note"
                  : "Unlocks after orientation & baseline"
              }
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
                cont.detail ||
                "Deliberate sessions across Choices to Spiritual"
              }
              accent={constructs[2].color}
            />
            <LearnNavTile
              href="/learn/report"
              kicker="Progress"
              title="Growth report"
              detail="Scores, patterns, certificate when ready"
              accent={constructs[3].color}
            />
          </div>
        </div>

        <LearnPageActions
          secondary={{
            href: checkInUnlocked ? "/learn/pulse" : nextAction.href,
            label: pulseToday ? "Open check-in page" : "Go to check-in page →",
          }}
          tertiary={{ href: "/learn/account", label: "You · profile & tools" }}
        />

        <p className="pb-2 text-center text-[0.75rem] leading-relaxed text-muted">
          Use the bottom tabs for page-by-page navigation: Today · Learn ·
          Check-in · Progress · You
        </p>
      </LearnPage>
    </LearnShell>
  );
}
