"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { LearnShell } from "@/components/learn/LearnShell";
import { RadarChart } from "@/components/learn/RadarChart";
import { useLmsState } from "@/components/learn/useLearnState";
import { BadgeWall } from "@/components/learn/progress/BadgeWall";
import { LevelCard } from "@/components/learn/progress/LevelCard";
import { ProgressCube } from "@/components/learn/progress/ProgressCube";
import { SessionReviewCard } from "@/components/learn/progress/SessionReviewCard";
import { StreakCard } from "@/components/learn/progress/StreakCard";
import { WeeklyGoalCard } from "@/components/learn/progress/WeeklyGoalCard";
import { track } from "@/lib/analytics";
import { constructs, type ConstructId } from "@/lib/content";
import { fetchEngagement } from "@/lib/lms/cloud";
import { learnerProgrammeId } from "@/lib/lms/programme-copy";
import { badgeWall, progression } from "@/lib/lms/progression";
import { clearFreezeNotice } from "@/lib/lms/store";

type Auth = "pending" | "in" | "out";

const REPORT_PARTS = [
  "Before-and-after radar across all six faces",
  "Which changes are bigger than measurement noise",
  "Your growth story and next steps per face",
  "PDF download and a verifiable certificate",
];

/**
 * Progress: the learner's Super-Cube® lighting up, level, weekly goal, streak
 * and freezes, reviews and badges. Works signed out (saved on this device),
 * with a gentle prompt to sign in and a preview of the full report.
 */
export default function ProgressPage() {
  const state = useLmsState();
  const [mounted, setMounted] = useState(false);
  const [auth, setAuth] = useState<Auth>("pending");
  const [serverBadges, setServerBadges] = useState<string[]>([]);
  const [lit, setLit] = useState<ConstructId | null>(null);

  useEffect(() => {
    setMounted(true);
    track("page_view", { path: "/learn/progress" });
    const q = new URLSearchParams(window.location.search).get("lit");
    if (q && constructs.some((c) => c.id === q)) setLit(q as ConstructId);
    void fetchEngagement().then((r) => {
      if (r.kind === "ok") {
        setAuth("in");
        setServerBadges(r.data.badges.map((b) => b.badgeId));
      } else setAuth("out"); // signed out, or the server can't confirm: progress is on this device
    });
  }, []);

  const view = useMemo(() => progression(state), [state]);
  const programmeId = learnerProgrammeId(state) ?? "adults";
  const badges = useMemo(() => badgeWall(state, programmeId, serverBadges), [state, programmeId, serverBadges]);
  const pre = state.attempts.find((a) => a.phase === "pre");

  // The freeze notice is shown once, here, then cleared.
  useEffect(() => {
    if (!mounted || !state.streakFreezeUsedOn) return;
    const t = setTimeout(clearFreezeNotice, 15000);
    return () => clearTimeout(t);
  }, [mounted, state.streakFreezeUsedOn]);

  if (!mounted) {
    return (
      <LearnShell title="Progress" subtitle="Your Super-Cube® lighting up, face by face.">
        <div className="h-96 animate-pulse rounded-2xl border border-line bg-elevated motion-reduce:animate-none" aria-busy="true" aria-label="Loading your progress" />
      </LearnShell>
    );
  }

  return (
    <LearnShell title="Progress" subtitle="Your Super-Cube® lighting up, face by face: every session, practice and review adds light.">
      {auth === "out" && (
        <div className="mb-4 flex flex-col gap-2 rounded-2xl border border-line bg-elevated p-4 sm:flex-row sm:items-center sm:justify-between" data-testid="save-prompt">
          <p className="text-[0.875rem] leading-snug text-ink">
            <span className="font-semibold">Saved on this device.</span>{" "}
            <span className="text-slate">Sign in to keep your progress on every device and count it towards your certificate.</span>
          </p>
          <Link href="/login?next=/learn/progress" className="learn-btn learn-btn-secondary shrink-0">
            Sign in to save
          </Link>
        </div>
      )}

      <div className="grid gap-3 lg:grid-cols-2 lg:gap-4">
        <div className="lg:col-span-2">
          <ProgressCube view={view} celebrate={lit} />
        </div>
        <LevelCard view={view} />
        <WeeklyGoalCard state={state} />
        <StreakCard state={state} />
        <SessionReviewCard state={state} />
        <div className="lg:col-span-2">
          <BadgeWall badges={badges} />
        </div>
      </div>

      <section className="mt-4 rounded-2xl border border-line bg-elevated p-4 sm:p-5" aria-labelledby="baseline-h" data-testid="baseline-preview">
        <h2 id="baseline-h" className="text-[0.6875rem] font-semibold uppercase tracking-[0.1em] text-slate">
          Your baseline profile
        </h2>
        {pre ? (
          <div className="mt-2 flex flex-col items-center gap-3 sm:flex-row sm:items-start">
            <RadarChart scores={pre.result.constructScores} size={260} table="toggle" />
            <p className="text-[0.875rem] leading-relaxed text-slate">
              Overall {Math.round(pre.result.overall)} out of 100 at the start. Your after-test, at the end of the pathway, shows how each face has grown.
            </p>
          </div>
        ) : (
          <p className="mt-1 text-[0.875rem] leading-snug text-slate">
            Take the free baseline (28 statements plus one quick check, about 5 minutes) to see your starting Super-Cube® profile.{" "}
            <Link href="/learn/assessment/pre" className="font-semibold text-ink underline underline-offset-2">
              Start the baseline
            </Link>
          </p>
        )}
      </section>

      <section
        id="full-report"
        className="mt-4 scroll-mt-24 overflow-hidden rounded-2xl border border-line bg-elevated"
        aria-labelledby="full-report-h"
        data-testid="full-report-teaser"
      >
        <div className="p-4 sm:p-5">
          <h2 id="full-report-h" className="text-[1rem] font-semibold tracking-tight text-ink">
            Full growth report
          </h2>
          <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
            {REPORT_PARTS.map((p) => (
              <li key={p} className="flex gap-2 text-[0.8125rem] leading-snug text-ink">
                <span aria-hidden className="text-slate">✓</span>
                {p}
              </li>
            ))}
          </ul>
          <div className="relative mt-3 h-24 overflow-hidden rounded-xl border border-line bg-surface" aria-hidden>
            <div className="absolute inset-0 flex items-end gap-2 px-4 pb-3 blur-[3px]">
              {constructs.map((c, i) => (
                <div key={c.id} className="flex-1 rounded-t-md" style={{ background: c.color, height: `${35 + ((i * 37) % 50)}%`, opacity: 0.7 }} />
              ))}
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="rounded-full bg-elevated px-3 py-1 text-[0.75rem] font-semibold text-ink shadow">Preview</span>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {auth === "in" ? (
              <Link href="/learn/report" className="learn-btn learn-btn-primary">
                Open your full report
              </Link>
            ) : (
              <>
                <Link href="/login?next=/learn/report" className="learn-btn learn-btn-primary">
                  Sign in to open it
                </Link>
                <span className="learn-meta">Free to view your baseline report once you’re signed in.</span>
              </>
            )}
          </div>
        </div>
      </section>
    </LearnShell>
  );
}
