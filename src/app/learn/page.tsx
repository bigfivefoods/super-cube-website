"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { LearnShell } from "@/components/learn/LearnShell";
import {
  JourneyTimeline,
  useJourney,
} from "@/components/learn/JourneyProgress";
import { constructs, type ConstructId } from "@/lib/content";
import { getCoursesForProgramme } from "@/lib/lms/curriculum";
import { track } from "@/lib/analytics";
import { getContinueTarget, reflectionCount } from "@/lib/lms/continue";
import { buildWeeklyPlan } from "@/lib/lms/weekly-plan";
import { useLocale } from "@/components/LocaleProvider";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import {
  loadLmsState,
  setLmsLocale,
  setNotifyPractice,
  setShareProgressConsent,
  type LocalLmsState,
} from "@/lib/lms/store";
import { pushCoachProgressIfConsented } from "@/lib/lms/push-coach-progress";
import { COURSE_PRICE_USD } from "@/lib/programmes";
import { CubeTheatre } from "@/components/learn/CubeTheatre";

const rainbow = constructs.map((c) => c.color).join(", ");

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
  const { t, locale, setLocale } = useLocale();
  const [state, setState] = useState<LocalLmsState | null>(null);

  useEffect(() => {
    setState(loadLmsState());
  }, [journey?.doneCount, journey?.coursePct]);

  useEffect(() => {
    setLmsLocale(locale);
    setState(loadLmsState());
  }, [locale]);

  if (!journey) {
    return (
      <LearnShell title="Dashboard" hideJourneyRail>
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
  const streak = lms.practiceStreak?.current ?? 0;
  const streakBest = lms.practiceStreak?.best ?? 0;
  const reflections = reflectionCount(lms);
  const weekly = buildWeeklyPlan(lms);

  const hero = (
    <section className="page-hero page-hero--full border-b border-black/[0.06] bg-white">
      <div className="container-site page-hero__inner relative z-[1] w-full">
        <div className="page-hero__copy min-w-0">
          <p className="eyebrow animate-fade-up">Super-Cube® learning</p>
          <h1 className="page-hero__title heading-xl mt-3 animate-fade-up delay-1 text-ink sm:mt-4">
            {journey.doneCount === journey.total
              ? "You’ve completed the pathway."
              : "Your leadership journey, one clear step at a time."}
          </h1>
          <p className="page-hero__lede mt-4 animate-fade-up delay-2 text-sm leading-relaxed tracking-tight text-slate sm:mt-5 sm:text-base md:text-lg lg:text-xl">
            {journey.doneCount === journey.total
              ? "Return to your report anytime—or deepen a face with more practice."
              : "Six simple steps—including a post-assessment after the full programme so you can see how you’ve grown."}
          </p>

          {journey.programmeName && (
            <p className="mt-3 text-sm font-medium text-muted sm:mt-4">
              {journey.programmeName}
              {journey.programmeAge ? ` · ${journey.programmeAge}` : ""}
            </p>
          )}

          <div className="mt-6 flex w-full animate-fade-up delay-3 flex-col gap-2.5 sm:mt-8 sm:flex-row sm:flex-wrap sm:gap-3">
            <Link
              href={cont.href}
              onClick={() =>
                track("continue_click", {
                  kind: cont.kind,
                  href: cont.href,
                })
              }
              className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-ink px-6 py-3 text-sm font-semibold tracking-tight text-white transition hover:bg-ink-soft sm:w-auto sm:min-h-11 sm:py-2.5"
            >
              {cont.kind === "resume"
                ? "Continue where you left off"
                : cont.kind === "next_lesson"
                  ? "Continue next session"
                  : next.cta}{" "}
              →
            </Link>
            <a
              href="#your-path"
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-black/[0.12] bg-white px-5 py-2.5 text-sm font-semibold tracking-tight text-ink transition hover:border-black/25 hover:bg-black/[0.02] sm:px-6"
            >
              See full pathway
            </a>
          </div>
          {(cont.kind === "resume" || cont.kind === "next_lesson") && (
            <p className="mt-3 max-w-xl text-sm text-slate">
              <span className="font-semibold text-ink">{cont.title}</span>
              {cont.detail ? ` · ${cont.detail}` : ""}
            </p>
          )}
        </div>
      </div>
    </section>
  );

  return (
    <LearnShell hero={hero} hideJourneyRail>
      <div id="your-path" className="mx-auto max-w-2xl scroll-mt-6">
        <div className="mb-4 grid gap-2 sm:grid-cols-3">
          <div className="learn-card !p-3.5">
            <p className="learn-eyebrow">Practice streak</p>
            <p className="mt-1 text-xl font-semibold tabular-nums text-ink">
              {streak}
              <span className="ml-1 text-sm font-medium text-muted">days</span>
            </p>
            <p className="learn-meta mt-0.5">Best {streakBest}</p>
            <button
              type="button"
              className="mt-2 text-[0.7rem] font-semibold text-ink underline-offset-2 hover:underline"
              onClick={async () => {
                if (!("Notification" in window)) return;
                if (Notification.permission === "granted") {
                  setNotifyPractice(true);
                  setState(loadLmsState());
                  track("notify_opt_in");
                  try {
                    new Notification(t("learn.reminderTitle"), {
                      body: t("learn.reminderBody"),
                      icon: "/icons/icon-192.png",
                      tag: "sc-practice-daily",
                    });
                  } catch {
                    /* ignore */
                  }
                  return;
                }
                const perm = await Notification.requestPermission();
                if (perm === "granted") {
                  setNotifyPractice(true);
                  setState(loadLmsState());
                  track("notify_opt_in");
                  try {
                    new Notification(t("learn.reminderTitle"), {
                      body: t("learn.reminderBody"),
                      icon: "/icons/icon-192.png",
                      tag: "sc-practice-daily",
                    });
                  } catch {
                    /* ignore */
                  }
                }
              }}
            >
              {lms.notifyPractice
                ? t("learn.remindersOn")
                : t("learn.remindersEnable")}
            </button>
          </div>
          <div className="learn-card !p-3.5">
            <p className="learn-eyebrow">Journal entries</p>
            <p className="mt-1 text-xl font-semibold tabular-nums text-ink">
              {reflections}
            </p>
            <p className="learn-meta mt-0.5">Reflections saved</p>
          </div>
          <div className="learn-card !p-3.5">
            <p className="learn-eyebrow">Pathway</p>
            <p className="mt-1 text-xl font-semibold tabular-nums text-ink">
              {journey.pct}%
            </p>
            <p className="learn-meta mt-0.5">
              {journey.doneCount}/{journey.total} steps
            </p>
          </div>
        </div>

        <CubeTheatre lms={lms} />

        {(cont.kind === "resume" || cont.kind === "next_lesson") && (
          <Link
            href={cont.href}
            onClick={() => track("continue_click", { kind: cont.kind })}
            className="mb-4 flex items-center gap-3 rounded-2xl border border-black/[0.07] bg-white p-4 transition hover:border-black/15"
            style={
              cont.constructColor
                ? { boxShadow: `inset 3px 0 0 ${cont.constructColor}` }
                : undefined
            }
          >
            <div className="min-w-0 flex-1">
              <p className="learn-eyebrow">
                {cont.kind === "resume" ? "Pick up where you left off" : "Your next session"}
              </p>
              <p className="mt-0.5 truncate text-[0.9375rem] font-semibold text-ink">
                {cont.title}
              </p>
              <p className="learn-meta mt-0.5">{cont.detail}</p>
            </div>
            <span className="shrink-0 text-sm font-semibold text-ink">Open →</span>
          </Link>
        )}

        {journey.preDone && (
          <div className="mb-4 grid gap-2 sm:grid-cols-2">
            <Link
              href="/learn/practice"
              className="rounded-2xl border border-black/[0.07] bg-white p-4 transition hover:border-black/15"
            >
              <p className="learn-eyebrow">3–5 min</p>
              <p className="mt-0.5 font-semibold text-ink">
                Today’s micro-practice
              </p>
              <p className="learn-meta mt-0.5">Weakest-face first · streak</p>
            </Link>
            <Link
              href="/learn/feedback"
              className="rounded-2xl border border-black/[0.07] bg-white p-4 transition hover:border-black/15"
            >
              <p className="learn-eyebrow">Baseline</p>
              <p className="mt-0.5 font-semibold text-ink">
                Narrative + lit cube
              </p>
              <p className="learn-meta mt-0.5">Strengths · stretch · practices</p>
            </Link>
            <Link
              href="/learn/assessment/mid"
              className="rounded-2xl border border-black/[0.07] bg-white p-4 transition hover:border-black/15"
            >
              <p className="learn-eyebrow">Mid-pathway</p>
              <p className="mt-0.5 font-semibold text-ink">
                Check-in re-measure
              </p>
              <p className="learn-meta mt-0.5">
                Refresh scores so your weekly plan adapts
              </p>
            </Link>
            <Link
              href="/learn/pulse"
              className="rounded-2xl border border-black/[0.07] bg-white p-4 transition hover:border-black/15"
            >
              <p className="learn-eyebrow">Continuous</p>
              <p className="mt-0.5 font-semibold text-ink">
                Face tracking + peer pulse
              </p>
              <p className="learn-meta mt-0.5">
                Daily patterns · optional 5-item observation
              </p>
            </Link>
          </div>
        )}

        {weekly && weekly.items.length > 0 && (
          <section className="mb-5 rounded-2xl border border-black/[0.07] bg-white p-4 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="learn-eyebrow">This week’s plan</p>
                <h2 className="mt-0.5 text-[1rem] font-semibold tracking-tight text-ink">
                  {weekly.weekLabel}
                </h2>
                <p className="learn-meta mt-0.5">{weekly.summary}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Link
                  href="/learn/practice"
                  className="text-[0.75rem] font-semibold text-ink underline-offset-2 hover:underline"
                >
                  Micro-practice →
                </Link>
                <Link
                  href="/learn/assessment/mid"
                  className="text-[0.7rem] font-medium text-muted underline-offset-2 hover:underline"
                >
                  Mid check-in
                </Link>
              </div>
            </div>
            <ul className="mt-3 space-y-2">
              {weekly.items.map((item, i) => (
                <li key={item.constructId}>
                  <Link
                    href={item.href}
                    className="flex items-start gap-3 rounded-xl border border-black/[0.06] bg-[#fafafa] px-3 py-2.5 transition hover:border-black/15"
                  >
                    <span
                      className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[0.65rem] font-bold text-white"
                      style={{ background: item.color }}
                    >
                      {i + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[0.875rem] font-semibold text-ink">
                        {item.constructName}
                        {item.status === "done" ? " · done" : ""}
                      </span>
                      <span className="mt-0.5 block truncate text-[0.75rem] text-slate">
                        {item.lessonTitle}
                      </span>
                      <span className="mt-0.5 block text-[0.7rem] text-muted">
                        {item.reason}
                      </span>
                    </span>
                    <span className="shrink-0 text-xs font-semibold text-ink">
                      Go →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        <div className="mb-4 flex items-start gap-3 rounded-xl border border-black/[0.06] bg-white px-3 py-3">
          <input
            id="share-coach"
            type="checkbox"
            className="mt-1"
            checked={Boolean(lms.shareProgressWithCoach)}
            onChange={(e) => {
              setShareProgressConsent(e.target.checked);
              const next = loadLmsState();
              setState(next);
              if (e.target.checked && next.orgCode) {
                void pushCoachProgressIfConsented(next);
              }
            }}
          />
          <label htmlFor="share-coach" className="text-[0.8125rem] text-slate">
            <span className="font-semibold text-ink">
              {t("learn.shareCoach")}
            </span>
            <span className="mt-0.5 block text-[0.75rem] text-muted">
              Scores & completion only—never journal text. Requires a cohort
              code on{" "}
              <Link href="/learn/org" className="font-semibold text-ink">
                /learn/org
              </Link>
              .
            </span>
          </label>
        </div>

        <div className="mb-4 flex flex-col gap-3 rounded-xl border border-black/[0.06] bg-white px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2 text-[0.8125rem]">
            <span className="font-semibold text-ink">{t("learn.language")}</span>
            <LanguageSwitcher variant="footer" />
            <span className="sr-only" aria-live="polite">
              {locale}
            </span>
          </div>
          {lms.user?.email && weekly && (
            <button
              type="button"
              className="text-[0.75rem] font-semibold text-ink underline-offset-2 hover:underline"
              onClick={() => {
                void fetch("/api/email/weekly", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    email: lms.user?.email,
                    name: lms.user?.fullName,
                    weekLabel: weekly.weekLabel,
                    summary: weekly.summary,
                    weakest: weekly.items
                      .map((i) => i.constructName)
                      .slice(0, 2)
                      .join(" & "),
                  }),
                }).then(() => track("weekly_email_request", {}));
              }}
            >
              Email me this week’s plan →
            </button>
          )}
        </div>

        <div className="mb-6 overflow-hidden rounded-2xl border border-ink bg-white shadow-[0_12px_40px_-20px_rgba(10,10,10,0.35)]">
          <div
            className="h-1 w-full"
            style={{ background: `linear-gradient(90deg, ${rainbow})` }}
          />
          <div className="p-5 sm:p-6">
            <p className="learn-eyebrow">
              Pathway step · {next.n} of {journey.total}
            </p>
            <h2 className="mt-1.5 text-xl font-semibold tracking-tight text-ink sm:text-2xl">
              {next.title}
            </h2>
            <p className="learn-body mt-2 max-w-lg">{next.description}</p>
            <p className="mt-3 text-sm font-medium leading-snug text-ink">
              {next.promise}
            </p>

            <div className="mt-5 flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
              <Link
                href={next.href}
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-ink-soft"
              >
                {next.cta} →
              </Link>
              <p className="text-[0.75rem] text-muted">
                {journey.doneCount === 0
                  ? "About 15–20 minutes to complete the first three steps."
                  : `${journey.doneCount} of ${journey.total} steps complete · ${journey.pct}%`}
              </p>
            </div>

            <div className="mt-5">
              <div className="mb-1.5 flex justify-between text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-muted">
                <span>Pathway progress</span>
                <span className="tabular-nums">{journey.pct}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-black/[0.06]">
                <div
                  className="h-full rounded-full bg-ink transition-all duration-500"
                  style={{ width: `${Math.max(journey.pct, 3)}%` }}
                />
              </div>
              <div className="mt-2 flex justify-between gap-1">
                {journey.steps.map((s) => (
                  <span
                    key={s.id}
                    className={`h-1 flex-1 rounded-full ${
                      s.status === "done"
                        ? "bg-ink"
                        : s.status === "current"
                          ? "bg-ink/40"
                          : "bg-black/[0.06]"
                    }`}
                    title={s.short}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

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

        <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="learn-eyebrow">The process</p>
            <h2 className="mt-1 text-base font-semibold tracking-tight text-ink sm:text-lg">
              Six steps. One clear order.
            </h2>
          </div>
          <p className="learn-meta">
            Choose → Orient → Baseline → Learn → Re-measure → Report
          </p>
        </div>

        <JourneyTimeline journey={journey} />

        {showFaces && (
          <section className="mt-8 overflow-hidden rounded-2xl border border-black/[0.07] bg-white">
            <div className="flex items-center justify-between border-b border-black/[0.05] px-4 py-3.5 sm:px-5">
              <div>
                <p className="learn-eyebrow">Step 4 · Develop</p>
                <h3 className="mt-0.5 text-sm font-semibold tracking-tight text-ink">
                  Your six faces
                </h3>
              </div>
              <Link
                href="/learn/courses"
                className="text-[0.75rem] font-semibold text-ink underline-offset-2 hover:underline"
              >
                All courses →
              </Link>
            </div>
            <ul className="divide-y divide-black/[0.05]">
              {(programmeId
                ? courses
                : constructs.map((c) => ({
                    id: c.id,
                    constructId: c.id,
                    lessons: [] as { id: string }[],
                  }))
              ).map((course) => {
                const c = constructs.find((x) => x.id === course.constructId)!;
                const lessonState = state?.lessonProgress ?? {};
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
                      className="flex items-center gap-3 px-4 py-3 transition hover:bg-[#fafafa] sm:px-5"
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
                          <span className="truncate text-[0.875rem] font-semibold text-ink">
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
            <div className="border-t border-black/[0.05] bg-[#fafafa] px-4 py-3 sm:px-5">
              <p className="learn-meta">
                {journey.completedLessons}/{journey.totalLessons} sessions
                complete · {journey.coursePct}% of learning pathway
              </p>
            </div>
          </section>
        )}

        <p className="mt-8 text-center text-[0.8125rem] leading-relaxed text-slate">
          {journey.doneCount === journey.total
            ? "Leadership is a practice—not a finish line. Revisit any face whenever life asks more of you."
            : "Stay linear. Finish the step you’re on. The outcome is a clearer profile of who you are as a leader—and how you grow."}
        </p>
      </div>
    </LearnShell>
  );
}
