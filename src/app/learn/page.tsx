"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { DailyCheckInPanel } from "@/components/learn/DailyCheckInPanel";
import { LearnJourneyStrip } from "@/components/learn/LearnJourneyStrip";
import { LearnSectionNav } from "@/components/learn/LearnSectionNav";
import { LearnShell } from "@/components/learn/LearnShell";
import {
  JourneyTimeline,
  useJourney,
} from "@/components/learn/JourneyProgress";
import { SuperCube } from "@/components/SuperCube";
import { constructs, type ConstructId } from "@/lib/content";
import { getCoursesForProgramme } from "@/lib/lms/curriculum";
import { track } from "@/lib/analytics";
import { getContinueTarget } from "@/lib/lms/continue";
import {
  deriveFacePattern,
  getTodayPulse,
  pulseSeries,
} from "@/lib/lms/face-tracking";
import { getNextBestAction } from "@/lib/lms/next-action";
import { buildWeeklyPlan } from "@/lib/lms/weekly-plan";
import { FaceSparkline } from "@/components/learn/FaceSparkline";
import {
  loadLmsState,
  type LocalLmsState,
} from "@/lib/lms/store";
import { COURSE_PRICE_USD } from "@/lib/programmes";

const constructIcons: Record<ConstructId, string> = {
  choices: "/images/constructs/choices-icon.png",
  principles: "/images/constructs/principles-icon.png",
  mental: "/images/constructs/mental-icon.png",
  emotional: "/images/constructs/emotional-icon.png",
  physical: "/images/constructs/physical-icon.png",
  spiritual: "/images/constructs/spiritual-icon.png",
};

export default function LearnDashboardPage() {
  const journey = useJourney();
  const [state, setState] = useState<LocalLmsState | null>(null);

  useEffect(() => {
    setState(loadLmsState());
    track("page_view", { path: "/learn", surface: "today_hub" });
  }, [journey?.doneCount, journey?.coursePct]);

  if (!journey) {
    return (
      <LearnShell title="Today" wide hideJourneyRail>
        <p className="learn-meta">Loading your pathway…</p>
      </LearnShell>
    );
  }

  const next = journey.current;
  const programmeId = journey.programmeId;
  const courses = programmeId ? getCoursesForProgramme(programmeId) : [];
  const showFaces = journey.preDone;
  const lms = state ?? loadLmsState();
  const cont = getContinueTarget(lms, next.href, next.title);
  const nextAction = getNextBestAction(lms);
  const weekly = buildWeeklyPlan(lms);
  const pulseToday = Boolean(getTodayPulse(lms));
  const pattern = deriveFacePattern(lms);
  const series = pulseSeries(lms, 14).map((d) => d.overall);
  const streak = lms.practiceStreak?.current ?? 0;

  const preScores: Partial<Record<ConstructId, number>> = {};
  const pre = lms.attempts.find((a) => a.phase === "pre");
  if (pre) {
    for (const s of pre.result.constructScores) {
      preScores[s.constructId] = s.score;
    }
  }

  return (
    <LearnShell wide hideJourneyRail>
      <LearnSectionNav />

      {/* ── Section 1: Hero ── */}
      <section
        id="hero"
        className="scroll-mt-28 relative mb-8 overflow-hidden rounded-3xl border border-black/[0.07] bg-ink text-white"
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background: `radial-gradient(ellipse 80% 60% at 90% 20%, ${constructs[0].color}55, transparent 50%),
              radial-gradient(ellipse 60% 50% at 10% 80%, ${constructs[3].color}44, transparent 45%)`,
          }}
          aria-hidden
        />
        <div className="relative grid gap-8 p-6 sm:p-8 md:grid-cols-[1.15fr_0.85fr] md:items-center md:gap-10 md:p-10">
          <div>
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-white/50">
              Super-Cube® Learn · Today
            </p>
            <h1 className="mt-3 text-[1.75rem] font-semibold leading-[1.12] tracking-tight sm:text-3xl md:text-4xl">
              {journey.doneCount === journey.total
                ? "Pathway complete."
                : "Lead with clarity—one day at a time."}
            </h1>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-white/70 sm:text-base">
              {journey.programmeName
                ? `${journey.programmeName}${journey.programmeAge ? ` · ${journey.programmeAge}` : ""}. `
                : ""}
              {journey.doneCount === journey.total
                ? "Keep the daily check-in and practice alive—growth compounds after the certificate."
                : `You’re on step ${journey.current.n}: ${journey.current.short}. Scroll for journey, daily check-in, and learn.`}
            </p>

            <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
              <Link
                href={nextAction.href}
                onClick={() =>
                  track("continue_click", {
                    kind: nextAction.kind,
                    source: "today_hero",
                  })
                }
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-ink hover:bg-white/90"
              >
                {nextAction.cta}
              </Link>
              <a
                href="#check-in"
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/25 bg-white/5 px-5 text-sm font-semibold text-white hover:bg-white/10"
              >
                {pulseToday ? "Review check-in ✓" : "Daily check-in"}
              </a>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              <span className="rounded-full bg-white/10 px-3 py-1 text-[0.7rem] font-medium text-white/80">
                Pathway {journey.pct}%
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1 text-[0.7rem] font-medium text-white/80">
                Streak {streak}d
              </span>
              <span className="rounded-full bg-white/10 px-3 py-1 text-[0.7rem] font-medium text-white/80">
                {pulseToday ? "Checked in today" : "Check-in pending"}
              </span>
            </div>
          </div>

          <div className="mx-auto w-full max-w-[15rem] sm:max-w-[17rem]">
            <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10 backdrop-blur-sm">
              <SuperCube
                size="md"
                showSkills
                scores={
                  Object.keys(preScores).length ? preScores : undefined
                }
                showScores={Boolean(Object.keys(preScores).length)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 2: Journey ── */}
      <div className="mb-8">
        <LearnJourneyStrip journey={journey} />
      </div>

      {/* ── Section 3: Daily check-in ── */}
      <div className="mb-8">
        {journey.preDone || journey.orientationDone ? (
          <DailyCheckInPanel
            state={lms}
            onSaved={(nextState) => setState(nextState)}
          />
        ) : (
          <section
            id="check-in"
            className="scroll-mt-28 rounded-3xl border border-dashed border-black/[0.12] bg-white p-6 text-center sm:p-8"
          >
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-muted">
              Daily check-in unlocks next
            </p>
            <h2 className="mt-2 text-lg font-semibold text-ink">
              Finish orientation & baseline first
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-slate">
              Once you have a baseline, daily 3-question sliders per face will
              track how you actually lead—day by day.
            </p>
            <Link
              href={nextAction.href}
              className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full bg-ink px-5 text-sm font-semibold text-white"
            >
              {nextAction.cta}
            </Link>
          </section>
        )}
      </div>

      {/* ── Section 4: Learn now ── */}
      <section
        id="learn-now"
        className="scroll-mt-28 mb-8 overflow-hidden rounded-3xl border border-black/[0.07] bg-white"
      >
        <div className="border-b border-black/[0.05] px-5 py-5 sm:px-6">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-muted">
            Learn
          </p>
          <h2 className="mt-1 text-lg font-semibold tracking-tight text-ink sm:text-xl">
            {cont.kind === "resume" || cont.kind === "next_lesson"
              ? "Continue your session"
              : "Develop the six faces"}
          </h2>
          <p className="mt-1 text-sm text-slate">
            Courses live under Learn. Today surfaces only what matters next.
          </p>
        </div>

        {(cont.kind === "resume" || cont.kind === "next_lesson") && (
          <Link
            href={cont.href}
            onClick={() => track("continue_click", { kind: cont.kind })}
            className="flex items-center gap-3 border-b border-black/[0.05] px-5 py-4 transition hover:bg-[#fafafa] sm:px-6"
            style={
              cont.constructColor
                ? { boxShadow: `inset 4px 0 0 ${cont.constructColor}` }
                : undefined
            }
          >
            <div className="min-w-0 flex-1">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted">
                {cont.kind === "resume" ? "Resume" : "Next session"}
              </p>
              <p className="mt-0.5 truncate text-[0.975rem] font-semibold text-ink">
                {cont.title}
              </p>
              {cont.detail && (
                <p className="learn-meta mt-0.5">{cont.detail}</p>
              )}
            </div>
            <span className="shrink-0 text-sm font-semibold text-ink">
              Open →
            </span>
          </Link>
        )}

        {weekly && weekly.items.length > 0 && (
          <div className="border-b border-black/[0.05] px-5 py-4 sm:px-6">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted">
                  This week
                </p>
                <p className="mt-0.5 text-sm font-semibold text-ink">
                  {weekly.weekLabel}
                </p>
                <p className="learn-meta mt-0.5">{weekly.summary}</p>
              </div>
              <Link
                href="/learn/practice"
                className="shrink-0 text-[0.75rem] font-semibold text-ink underline-offset-2 hover:underline"
              >
                Practice →
              </Link>
            </div>
            <ul className="mt-3 space-y-2">
              {weekly.items.slice(0, 3).map((item, i) => (
                <li key={item.constructId}>
                  <Link
                    href={item.href}
                    className="flex items-center gap-3 rounded-xl bg-[#fafafa] px-3 py-2.5 transition hover:bg-black/[0.04]"
                  >
                    <span
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[0.65rem] font-bold text-white"
                      style={{ background: item.color }}
                    >
                      {i + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-semibold text-ink">
                        {item.constructName}
                      </span>
                      <span className="block truncate text-[0.7rem] text-muted">
                        {item.lessonTitle}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {showFaces && (
          <ul className="divide-y divide-black/[0.05]">
            {(programmeId
              ? courses
              : constructs.map((c) => ({
                  id: c.id,
                  constructId: c.id,
                  lessons: [] as { id: string }[],
                }))
            )
              .slice(0, 6)
              .map((course) => {
                const c = constructs.find((x) => x.id === course.constructId)!;
                const lessonState = lms.lessonProgress ?? {};
                const done = course.lessons.filter(
                  (l) => lessonState[l.id] === "completed"
                ).length;
                const total = course.lessons.length;
                const pct =
                  programmeId && total > 0
                    ? Math.round((done / total) * 100)
                    : 0;
                return (
                  <li key={course.id}>
                    <Link
                      href={
                        programmeId
                          ? `/learn/courses/${c.id}`
                          : "/learn/programmes"
                      }
                      className="flex items-center gap-3 px-5 py-3.5 transition hover:bg-[#fafafa] sm:px-6"
                    >
                      <span
                        className="relative flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border"
                        style={{
                          background: c.colorSoft,
                          borderColor: `${c.color}33`,
                        }}
                      >
                        <Image
                          src={constructIcons[c.id]}
                          alt=""
                          width={26}
                          height={26}
                          className="object-contain"
                        />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate text-sm font-semibold text-ink">
                            {c.name}
                          </span>
                          <span
                            className="shrink-0 text-[0.75rem] font-semibold tabular-nums"
                            style={{ color: c.color }}
                          >
                            {pct}%
                          </span>
                        </div>
                        <div className="learn-progress mt-1.5">
                          <div
                            style={{ width: `${pct}%`, background: c.color }}
                          />
                        </div>
                      </div>
                    </Link>
                  </li>
                );
              })}
          </ul>
        )}

        <div className="flex flex-wrap gap-2 border-t border-black/[0.05] bg-[#fafafa] px-5 py-3.5 sm:px-6">
          <Link
            href="/learn/courses"
            className="inline-flex min-h-9 items-center rounded-full bg-ink px-4 text-[0.75rem] font-semibold text-white"
          >
            All courses
          </Link>
          <Link
            href="/learn/practice"
            className="inline-flex min-h-9 items-center rounded-full border border-black/[0.1] bg-white px-4 text-[0.75rem] font-semibold text-ink"
          >
            Micro-practice
          </Link>
        </div>
      </section>

      {/* ── Section 5: Progress ── */}
      <section
        id="progress"
        className="scroll-mt-28 mb-8 overflow-hidden rounded-3xl border border-black/[0.07] bg-white"
      >
        <div className="border-b border-black/[0.05] px-5 py-5 sm:px-6">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-muted">
            Progress
          </p>
          <h2 className="mt-1 text-lg font-semibold tracking-tight text-ink sm:text-xl">
            Patterns & report
          </h2>
          <p className="mt-1 text-sm text-slate">
            {pattern.insight}
          </p>
        </div>
        <div className="px-5 py-4 sm:px-6">
          {pattern.pulseCount > 0 ? (
            <FaceSparkline values={series} />
          ) : (
            <div className="flex h-12 items-end gap-1">
              {Array.from({ length: 14 }).map((_, i) => (
                <span
                  key={i}
                  className="flex-1 rounded-sm bg-black/[0.06]"
                  style={{ height: `${25 + ((i * 9) % 55)}%` }}
                />
              ))}
            </div>
          )}
          <p className="learn-meta mt-2">
            {pattern.pulseCount > 0
              ? `${pattern.pulseCount} check-in${pattern.pulseCount === 1 ? "" : "s"} · ${pattern.consistency}% consistency`
              : "Your sparkline appears after the first daily check-in."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 border-t border-black/[0.05] bg-[#fafafa] px-5 py-3.5 sm:px-6">
          <Link
            href="/learn/report"
            className="inline-flex min-h-9 items-center rounded-full bg-ink px-4 text-[0.75rem] font-semibold text-white"
          >
            Full report
          </Link>
          <Link
            href="/learn/feedback"
            className="inline-flex min-h-9 items-center rounded-full border border-black/[0.1] bg-white px-4 text-[0.75rem] font-semibold text-ink"
          >
            Narrative + cube
          </Link>
          <Link
            href="/learn/account"
            className="inline-flex min-h-9 items-center rounded-full border border-black/[0.1] bg-white px-4 text-[0.75rem] font-semibold text-ink"
          >
            You / profile
          </Link>
        </div>
      </section>

      {/* Pathway detail (collapsed density) */}
      <details className="mb-8 rounded-3xl border border-black/[0.07] bg-white">
        <summary className="cursor-pointer list-none px-5 py-4 text-sm font-semibold text-ink marker:content-none sm:px-6 [&::-webkit-details-marker]:hidden">
          Full pathway timeline
          <span className="ml-2 font-normal text-muted">
            Choose → Orient → Baseline → Learn → Re-measure → Report
          </span>
        </summary>
        <div className="border-t border-black/[0.05] px-4 py-4 sm:px-5">
          <JourneyTimeline journey={journey} />
        </div>
      </details>

      {!journey.access && (
        <div className="mb-6 flex flex-col gap-2.5 rounded-2xl border border-black/[0.07] bg-white px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <p className="learn-body">
            <span className="font-semibold text-ink">Unlock full access</span>
            {" · "}${COURSE_PRICE_USD} once for your complete pathway
          </p>
          <Link
            href="/pricing"
            className="learn-btn learn-btn-primary !min-h-9 shrink-0"
          >
            View pricing
          </Link>
        </div>
      )}

      <p className="pb-4 text-center text-[0.8125rem] leading-relaxed text-slate">
        {journey.doneCount === journey.total
          ? "Leadership is a practice—not a finish line."
          : "Scroll section by section. Check in daily. Learn deliberately. Watch growth on Progress."}
      </p>
    </LearnShell>
  );
}
