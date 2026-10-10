"use client";

import Link from "next/link";
import { track } from "@/lib/analytics";
import type { ConstructId } from "@/lib/content";
import type { Lesson } from "@/lib/lms/curriculum";
import { sessionCount } from "@/lib/lms/curriculum-meta";
import { ARC_STEPS } from "@/lib/lms/sessions";
import { courseId, formatCoursePrice, type ProgrammeId } from "@/lib/programmes";

function teaser(text: string, max = 180): string {
  const t = text.replace(/\*\*/g, "").trim();
  return t.length > max ? `${t.slice(0, max).replace(/\s+\S*$/, "")}…` : t;
}

/**
 * A paid session the learner can't open yet: what it teaches, its outline,
 * the honest price and the count of sessions it unlocks.
 */
export function LockedSessionCard({
  lesson,
  programmeId,
  constructId,
  color,
  colorSoft,
}: {
  lesson: Lesson;
  programmeId: ProgrammeId;
  constructId: ConstructId;
  color: string;
  colorSoft: string;
}) {
  const n = sessionCount(programmeId);
  const price = formatCoursePrice("ZAR");
  const sampleHref = `/learn/courses/choices/${courseId(programmeId, "choices")}-overview`;
  const outline: { label: string; detail?: string }[] = lesson.arc
    ? ARC_STEPS.map((s) => ({
        label: s.label,
        detail:
          s.id === "hook"
            ? teaser(lesson.arc!.hook)
            : s.id === "example"
              ? lesson.arc!.example.title
              : s.id === "check"
                ? `${lesson.arc!.check.length} quick questions with explanations`
                : undefined,
      }))
    : lesson.lab
      ? [
          { label: "The challenge", detail: teaser(lesson.lab.challenge) },
          { label: "WOOP plan", detail: "Wish, outcome, obstacle, plan" },
          { label: "Success checklist", detail: `${lesson.lab.checklist.length} checks` },
          { label: "Reflect" },
        ]
      : lesson.faceCheck
        ? [
            { label: "Recall every skill", detail: `${lesson.faceCheck.length} questions from memory` },
            { label: "Teach it back" },
            { label: "Lock one habit" },
          ]
        : [];

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-elevated" data-testid="lesson-paywall">
      <div className="px-4 py-4 sm:px-5" style={{ background: colorSoft }}>
        <p className="learn-eyebrow" style={{ color: "var(--color-ink, #111)" }}>Full pathway · {lesson.durationMinutes} min session</p>
        <p className="mt-1 text-[1.0625rem] font-semibold tracking-tight text-ink">{lesson.title}</p>
        <p className="mt-1 text-[0.9375rem] leading-snug text-ink">
          <span className="font-semibold">What you’ll learn: </span>
          {lesson.outcome}
        </p>
      </div>

      {outline.length > 0 && (
        <div className="px-4 pt-4 sm:px-5">
          <h2 className="learn-eyebrow text-slate">Session outline</h2>
          <ol className="mt-2 grid gap-1.5 sm:grid-cols-2" data-testid="locked-outline">
            {outline.map((o, i) => (
              <li key={o.label} className="flex gap-2 text-[0.8125rem] leading-snug">
                <span
                  aria-hidden
                  className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[0.625rem] font-bold text-white"
                  style={{ background: color }}
                >
                  {i + 1}
                </span>
                <span>
                  <span className="font-semibold text-ink">{o.label}</span>
                  {o.detail && <span className="text-slate"> · {o.detail}</span>}
                </span>
              </li>
            ))}
          </ol>
        </div>
      )}

      <div className="px-4 py-4 sm:px-5">
        <p className="text-[0.9375rem] font-semibold text-ink" data-testid="locked-price">
          Unlock all {n} sessions · {price} once, lifetime access
        </p>
        <p className="learn-meta mt-1">
          Every session on all six faces of the Super-Cube®, the after-test, your growth report and a verifiable
          certificate. No subscription.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            href="/pricing"
            className="learn-btn learn-btn-primary"
            onClick={() => track("paywall_click", { surface: "locked_session", lessonId: lesson.id, constructId })}
          >
            Unlock all {n} for {price}
          </Link>
          <Link href="/learn/org" className="learn-btn learn-btn-secondary">
            I have a cohort code
          </Link>
          <Link href={sampleHref} className="learn-btn learn-btn-ghost">
            Try the free sample
          </Link>
        </div>
        <p className="learn-meta mt-3">
          Already paid?{" "}
          <Link href={`/login?next=${encodeURIComponent(`/learn/courses/${constructId}/${lesson.id}`)}`} className="underline">
            Sign in
          </Link>{" "}
          to open your sessions on this device.
        </p>
      </div>
    </div>
  );
}
