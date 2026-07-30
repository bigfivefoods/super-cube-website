"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { LearnShell } from "@/components/learn/LearnShell";
import { constructs, type ConstructId } from "@/lib/content";
import { courseId, getProgramme, type ProgrammeId } from "@/lib/programmes";
import { getCourse } from "@/lib/lms/curriculum";
import { loadLmsState, type LocalLmsState } from "@/lib/lms/store";

const TYPE_LABEL: Record<string, string> = {
  content: "Session",
  practice: "Lab",
  quiz: "Check",
};

export default function CourseDetailPage() {
  const params = useParams();
  const constructId = params.constructId as ConstructId;
  const [state, setState] = useState<LocalLmsState | null>(null);
  useEffect(() => setState(loadLmsState()), []);

  const programmeId = (state?.subscription?.programmeId ||
    state?.user?.programmeId ||
    "adults") as ProgrammeId;
  const programme = getProgramme(programmeId);
  const course = getCourse(courseId(programmeId, constructId));
  const construct = constructs.find((c) => c.id === constructId);

  if (!course || !construct) {
    return (
      <LearnShell title="Course">
        <p className="text-slate">Course not found.</p>
        <Link
          href="/learn/courses"
          className="mt-4 inline-block font-semibold text-ink"
        >
          ← All courses
        </Link>
      </LearnShell>
    );
  }

  const doneCount = course.lessons.filter(
    (l) => state?.lessonProgress[l.id] === "completed"
  ).length;
  const pct = Math.round((doneCount / course.lessons.length) * 100);
  const firstIncomplete =
    course.lessons.find((l) => state?.lessonProgress[l.id] !== "completed") ??
    course.lessons[0];

  return (
    <LearnShell
      title={construct.name}
      subtitle={`${programme?.name} · ${course.lessons.length} sessions · Read · Engage · Apply`}
    >
      {/* Themed hero */}
      <div
        className="mb-6 overflow-hidden rounded-2xl border border-black/[0.08]"
        style={{ background: construct.colorSoft }}
      >
        <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:gap-6 sm:p-6">
          <div
            className="relative mx-auto h-28 w-20 shrink-0 overflow-hidden rounded-xl border border-black/[0.08] bg-white shadow-sm sm:mx-0 sm:h-32 sm:w-24"
          >
            <Image
              src={course.coverPath}
              alt={construct.name}
              fill
              className="object-cover"
              sizes="96px"
            />
          </div>
          <div className="min-w-0 flex-1 text-center sm:text-left">
            <p
              className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em]"
              style={{ color: construct.color }}
            >
              Super-Cube® · {construct.shortName}
            </p>
            <p className="mt-1 text-sm font-medium text-ink">
              {construct.tagline}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-slate">
              {course.promise}
            </p>
            <p className="mt-2 text-sm text-slate line-clamp-2">
              {construct.description}
            </p>
            <div className="mt-4 flex flex-col items-center gap-3 sm:flex-row">
              <Link
                href={`/learn/courses/${constructId}/${firstIncomplete.id}`}
                className="inline-flex rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-95"
                style={{ background: construct.color }}
              >
                {doneCount === 0 ? "Start module" : "Continue"}
              </Link>
              <Link
                href="/learn/courses"
                className="text-sm font-semibold text-ink underline-offset-2 hover:underline"
              >
                ← All courses
              </Link>
            </div>
            <div className="mt-4 max-w-md">
              <div className="h-1.5 overflow-hidden rounded-full bg-black/[0.08]">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${pct}%`, background: construct.color }}
                />
              </div>
              <p className="mt-1.5 text-xs text-muted">
                {doneCount}/{course.lessons.length} complete · {pct}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Skills strip */}
      <div className="mb-5 flex flex-wrap gap-2">
        {construct.elements.map((el) => (
          <span
            key={el}
            className="rounded-full border px-3 py-1 text-xs font-medium text-ink"
            style={{
              borderColor: `${construct.color}33`,
              background: construct.colorSoft,
            }}
          >
            {el}
          </span>
        ))}
      </div>

      <ol className="space-y-2">
        {course.lessons.map((lesson, i) => {
          const done = state?.lessonProgress[lesson.id] === "completed";
          return (
            <li key={lesson.id}>
              <Link
                href={`/learn/courses/${constructId}/${lesson.id}`}
                className="flex items-center justify-between gap-3 rounded-xl border border-black/[0.08] bg-white px-4 py-3.5 transition hover:border-black/20"
                style={
                  done
                    ? { boxShadow: `inset 3px 0 0 ${construct.color}` }
                    : undefined
                }
              >
                <div className="min-w-0">
                  <p
                    className="text-[0.65rem] font-semibold uppercase tracking-[0.12em]"
                    style={{ color: construct.color }}
                  >
                    {String(i + 1).padStart(2, "0")} ·{" "}
                    {TYPE_LABEL[lesson.lessonType] ?? lesson.lessonType}
                  </p>
                  <p className="truncate font-semibold tracking-tight text-ink">
                    {lesson.title}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-muted">
                    {lesson.outcome}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                    done ? "text-white" : "bg-black/[0.04] text-muted"
                  }`}
                  style={done ? { background: construct.color } : undefined}
                >
                  {done ? "Done" : `${lesson.durationMinutes}m`}
                </span>
              </Link>
            </li>
          );
        })}
      </ol>
    </LearnShell>
  );
}
