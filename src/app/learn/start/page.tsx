"use client";

import Link from "next/link";
import { useEffect } from "react";
import { LearnShell } from "@/components/learn/LearnShell";
import { useLmsState } from "@/components/learn/useLearnState";
import { track } from "@/lib/analytics";
import { useLmsT } from "@/lib/i18n/lms/use-lms-t";
import { getProfile, profileComplete } from "@/lib/lms/profile";
import { loadLmsState, unlockDemo } from "@/lib/lms/store";
import { getProgramme, type ProgrammeId } from "@/lib/programmes";
import { fillCopy, programmeTemplate } from "@/lib/lms/programme-copy";
import { buildAssessmentItems } from "@/lib/lms/assessment-items";
import { getCoursesForProgramme } from "@/lib/lms/curriculum-meta";
import { questionnaireMinutes } from "@/lib/lms/duration";

/** Honest timings, worked out from the real questionnaire and the first session. */
function firstRunMinutes(programmeId: ProgrammeId) {
  const baselineMin = questionnaireMinutes(buildAssessmentItems(programmeId).length + 1, programmeId);
  const firstSessionMin = getCoursesForProgramme(programmeId)[0]?.lessons[0]?.durationMinutes ?? 8;
  const orientMin = 2;
  const winMin = 1;
  return { baselineMin, firstSessionMin, orientMin, winMin, totalMin: orientMin + baselineMin + firstSessionMin + winMin };
}

/**
 * Guided first run with honest timings (computed from the content); never dump users on the full dashboard.
 */
export default function GuidedStartPage() {
  const { t, L, fill } = useLmsT();
  const state = useLmsState();

  useEffect(() => {
    const p = getProfile();
    if (!profileComplete(p)) {
      // A full navigation, not a client transition: a soft move to welcome left
      // both pages' canonical links in the document (Lighthouse SEO).
      window.location.replace(L("/learn/welcome"));
      return;
    }
    const s = loadLmsState();
    if (!s.demoUnlocked && !s.subscription) {
      unlockDemo(
        (p?.programmeId || s.user?.programmeId || "adults") as ProgrammeId,
      );
    }
    track("page_view", { path: "/learn/start" });
    track("guided_start_open", {});
  }, [L]);

  const programmeId = (state?.subscription?.programmeId ||
    state?.user?.programmeId ||
    state?.profile?.programmeId ||
    "adults") as ProgrammeId;
  const programme = getProgramme(programmeId);
  const fr = state?.firstRun ?? {};
  const orientDone = Boolean(state?.orientation || fr.orient);
  const preDone = Boolean(
    state?.attempts?.some((a) => a.phase === "pre") || fr.pre,
  );
  const lessonDone =
    Boolean(fr.firstLesson) ||
    Object.values(state?.lessonProgress ?? {}).some((s) => s === "completed");

  const name = state?.profile?.displayName || state?.user?.fullName;

  const { baselineMin, firstSessionMin, orientMin, winMin, totalMin } = firstRunMinutes(programmeId);
  const subtitle = fillCopy(t(programmeTemplate("start.subtitle", programmeId)), {
    programme: t(programme?.name ?? "Super-Cube®"),
  });
  const minutes = (n: number) => fill("{n} min", { n });
  const title = name
    ? fill("{name}, your first {total} minutes", { name: name.split(" ")[0], total: totalMin })
    : fill("Your first {total} minutes", { total: totalMin });

  const steps = [
    {
      n: 1,
      min: minutes(orientMin),
      t: t("Orient"),
      d: t("How you see leadership levels—quick pre-pre check."),
      href: "/learn/assessment/orientation",
      done: orientDone,
    },
    {
      n: 2,
      min: minutes(baselineMin),
      t: t("Baseline (start)"),
      d: t("Six faces, honest ratings. You can save mid-way and resume."),
      href: "/learn/assessment/pre",
      done: preDone,
    },
    {
      n: 3,
      min: minutes(firstSessionMin),
      t: t("One session"),
      d: t("After baseline, open your weekly plan’s first face—or start any course."),
      href: preDone ? "/learn" : "/learn/courses",
      done: lessonDone,
    },
    {
      n: 4,
      min: minutes(winMin),
      t: t("First win"),
      d: t("Complete a session to unlock win-of-the-day and streak."),
      href: "/learn",
      done: lessonDone,
    },
  ];

  const next = steps.find((s) => !s.done) ?? steps[steps.length - 1]!;

  return (
    <LearnShell title={title} subtitle={subtitle} hideJourneyRail>
      <div className="mb-5 rounded-2xl border border-ink bg-void p-5 text-white sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/80">
          {t("Recommended next")}
        </p>
        <h2 className="mt-2 text-xl font-semibold tracking-tight">
          {next.t}
          <span className="ml-2 text-sm font-medium text-white/55">
            · {next.min}
          </span>
        </h2>
        <p className="mt-2 text-sm text-white/70">{next.d}</p>
        <Link
          href={L(next.href)}
          onClick={() => track("guided_start_cta", { step: next.n })}
          className="mt-4 inline-flex min-h-11 items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-ink"
        >
          {t("Continue →")}
        </Link>
      </div>

      <ol className="space-y-3">
        {steps.map((step) => (
          <li
            key={step.n}
            className={`flex gap-3 rounded-2xl border p-4 ${
              step.done
                ? "border-line bg-surface"
                : step.n === next.n
                  ? "border-ink bg-elevated"
                  : "border-line bg-elevated"
            }`}
          >
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                step.done ? "bg-emerald-600 text-white" : "bg-void text-void-fg"
              }`}
            >
              {step.done ? "✓" : step.n}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline gap-2">
                <p className="font-semibold text-ink">{step.t}</p>
                <span className="text-[0.7rem] font-medium text-muted">
                  {step.min}
                </span>
              </div>
              <p className="mt-0.5 text-[0.8125rem] text-slate">{step.d}</p>
              {!step.done && (
                <Link
                  href={L(step.href)}
                  className="mt-2 inline-block text-[0.8125rem] font-semibold text-ink underline-offset-2 hover:underline"
                >
                  {t("Open step →")}
                </Link>
              )}
            </div>
          </li>
        ))}
      </ol>

      <p className="mt-6 text-center text-sm text-muted">
        {t("Prefer the full dashboard?")}{" "}
        <Link
          href={L("/learn")}
          className="font-semibold text-ink underline-offset-2 hover:underline"
        >
          {t("Go to Learn")}
        </Link>
        {" · "}
        <Link
          href={L("/learn/account")}
          className="font-semibold text-ink underline-offset-2 hover:underline"
        >
          {t("You / profile")}
        </Link>
        {" · "}
        <Link
          href={L("/learn/welcome")}
          className="font-semibold text-ink underline-offset-2 hover:underline"
        >
          {t("Edit profile")}
        </Link>
      </p>
    </LearnShell>
  );
}
