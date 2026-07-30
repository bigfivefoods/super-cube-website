"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { LearnShell } from "@/components/learn/LearnShell";
import { Button } from "@/components/ui";
import { getCoursesForProgramme } from "@/lib/lms/curriculum";
import {
  hasLocalAccess,
  loadLmsState,
  type LocalLmsState,
} from "@/lib/lms/store";
import { getProgramme, programmes } from "@/lib/programmes";

export default function LearnDashboardPage() {
  const [state, setState] = useState<LocalLmsState | null>(null);

  useEffect(() => {
    setState(loadLmsState());
  }, []);

  if (!state) {
    return (
      <LearnShell title="Dashboard">
        <p className="text-muted">Loading…</p>
      </LearnShell>
    );
  }

  const access = hasLocalAccess(state);
  const programmeId = state.subscription?.programmeId || state.user?.programmeId;
  const programme = programmeId ? getProgramme(programmeId) : undefined;
  const courses = programmeId ? getCoursesForProgramme(programmeId) : [];
  const completedLessons = Object.values(state.lessonProgress).filter(
    (s) => s === "completed"
  ).length;
  const totalLessons = courses.reduce((n, c) => n + c.lessons.length, 0);
  const progressPct =
    totalLessons === 0
      ? 0
      : Math.round((completedLessons / totalLessons) * 100);
  const orientation = state.orientation;
  const pre = state.attempts.find((a) => a.phase === "pre");
  const post = state.attempts.find((a) => a.phase === "post");

  return (
    <LearnShell
      title="Your Super-Cube® journey"
      subtitle="Orient (philosophy · theory · model) → pre-assess → learn → practise → re-assess → report."
    >
      {!access && (
        <div className="mb-6 rounded-2xl border border-black/[0.08] bg-white p-5 sm:p-6">
          <h2 className="text-lg font-semibold tracking-tight text-ink">
            Activate your subscription
          </h2>
          <p className="mt-2 text-sm text-slate">
            Select a programme (Kids, Adolescents, or Adults) and subscribe to
            unlock assessment, courses, and your personal report.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Button href="/pricing" variant="primary">
              View programmes & pricing
            </Button>
            <Button href="/learn/programmes" variant="ghost">
              Explore programmes
            </Button>
          </div>
          <p className="mt-3 text-xs text-muted">
            Local demo: open Pricing and click “Start demo access” to unlock
            without Paystack.
          </p>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "Programme",
            value: programme?.name ?? "Not selected",
            detail: programme?.ageLabel ?? "Kids · Adolescents · Adults",
          },
          {
            label: "Access",
            value: access ? "Active" : "Locked",
            detail: state.subscription?.planId ?? "Subscribe to begin",
          },
          {
            label: "Course progress",
            value: `${progressPct}%`,
            detail: `${completedLessons} / ${totalLessons || "—"} lessons`,
          },
          {
            label: "Assessments",
            value: pre
              ? post
                ? "Pre + Post"
                : orientation
                  ? "Orient + Pre"
                  : "Pre done"
              : orientation
                ? "Orient done"
                : "Not started",
            detail: pre
              ? `Baseline overall ${pre.result.overall}`
              : orientation
                ? orientation.result.label
                : "Start pre-pre orientation",
          },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-black/[0.08] bg-white p-4 sm:p-5"
          >
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-muted">
              {card.label}
            </p>
            <p className="mt-2 text-lg font-semibold tracking-tight text-ink">
              {card.value}
            </p>
            <p className="mt-1 text-sm text-slate">{card.detail}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-black/[0.08] bg-white p-5 sm:p-6">
          <h2 className="text-lg font-semibold tracking-tight text-ink">
            Next steps
          </h2>
          <ol className="mt-4 space-y-3 text-sm text-slate">
            <li className="flex gap-2">
              <span className="font-semibold text-ink">1.</span>
              <span>
                {programme
                  ? `Programme selected: ${programme.name}.`
                  : "Choose your age programme."}{" "}
                <Link href="/learn/programmes" className="font-semibold text-ink underline-offset-2 hover:underline">
                  Programmes
                </Link>
              </span>
            </li>
            <li className="flex gap-2">
              <span className="font-semibold text-ink">2.</span>
              <span>
                Pre-pre assessment: philosophy → theory → model.{" "}
                {orientation ? (
                  <span className="font-semibold text-ink">
                    Done ({orientation.result.label}).
                  </span>
                ) : null}{" "}
                <Link
                  href="/learn/assessment/orientation"
                  className="font-semibold text-ink underline-offset-2 hover:underline"
                >
                  {orientation ? "Review orientation" : "Start orientation"}
                </Link>
              </span>
            </li>
            <li className="flex gap-2">
              <span className="font-semibold text-ink">3.</span>
              <span>
                Complete the construct pre-assessment baseline.{" "}
                <Link href="/learn/assessment/pre" className="font-semibold text-ink underline-offset-2 hover:underline">
                  Start pre-assessment
                </Link>
              </span>
            </li>
            <li className="flex gap-2">
              <span className="font-semibold text-ink">4.</span>
              <span>
                Work through all six construct courses.{" "}
                <Link href="/learn/courses" className="font-semibold text-ink underline-offset-2 hover:underline">
                  Open courses
                </Link>
              </span>
            </li>
            <li className="flex gap-2">
              <span className="font-semibold text-ink">5.</span>
              <span>
                Take the post-assessment and view your report.{" "}
                <Link href="/learn/report" className="font-semibold text-ink underline-offset-2 hover:underline">
                  Report
                </Link>
              </span>
            </li>
          </ol>
        </section>

        <section className="rounded-2xl border border-black/[0.08] bg-white p-5 sm:p-6">
          <h2 className="text-lg font-semibold tracking-tight text-ink">
            Three programmes
          </h2>
          <ul className="mt-4 space-y-3">
            {programmes.map((p) => (
              <li
                key={p.id}
                className={`rounded-xl border px-4 py-3 ${
                  programmeId === p.id
                    ? "border-ink bg-ink text-white"
                    : "border-black/[0.08] bg-[#fafafa]"
                }`}
              >
                <p className="font-semibold tracking-tight">{p.name}</p>
                <p
                  className={`text-sm ${
                    programmeId === p.id ? "text-white/70" : "text-muted"
                  }`}
                >
                  {p.ageLabel} · {p.tagline}
                </p>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </LearnShell>
  );
}
