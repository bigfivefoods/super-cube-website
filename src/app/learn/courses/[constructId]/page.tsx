"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { CourseVideo } from "@/components/learn/CourseVideo";
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
        <p className="learn-body">Course not found.</p>
        <Link
          href="/learn/courses"
          className="mt-3 inline-block text-[0.8125rem] font-semibold text-ink"
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
      {/* Module hero with intro video */}
      <div
        className="mb-4 overflow-hidden rounded-2xl border border-black/[0.07] sm:mb-5"
        style={{ background: construct.colorSoft }}
      >
        <div className="p-3 sm:p-4">
          <CourseVideo
            programmeId={programmeId}
            constructId={constructId}
            poster={course.coverPath}
            title={construct.name}
            color={construct.color}
            variant="hero"
          />
        </div>

        <div className="border-t border-black/[0.05] px-4 pb-4 pt-3.5 sm:px-5 sm:pb-5 sm:pt-4">
          <p
            className="learn-eyebrow"
            style={{ color: construct.color }}
          >
            Super-Cube® · {construct.shortName}
          </p>
          <p className="mt-1 text-[0.875rem] font-medium text-ink sm:text-[0.9375rem]">
            {construct.tagline}
          </p>
          <p className="learn-body mt-1.5 max-w-2xl">{course.promise}</p>
          <p className="learn-body-sm mt-1.5 max-w-2xl line-clamp-2">
            {construct.description}
          </p>
          <div className="mt-3.5 flex flex-col gap-2.5 sm:flex-row sm:items-center">
            <Link
              href={`/learn/courses/${constructId}/${firstIncomplete.id}`}
              className="learn-btn text-white shadow-sm transition hover:opacity-95"
              style={{ background: construct.color }}
            >
              {doneCount === 0 ? "Start module" : "Continue"}
            </Link>
            <Link
              href="/learn/courses"
              className="text-center text-[0.8125rem] font-semibold text-ink underline-offset-2 hover:underline sm:text-left"
            >
              ← All courses
            </Link>
          </div>
          <div className="mt-3.5 max-w-md">
            <div className="learn-progress">
              <div
                style={{ width: `${pct}%`, background: construct.color }}
              />
            </div>
            <p className="learn-meta mt-1">
              {doneCount}/{course.lessons.length} complete · {pct}%
            </p>
          </div>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-1.5">
        {construct.elements.map((el) => (
          <span
            key={el}
            className="rounded-full border px-2.5 py-0.5 text-[0.7rem] font-medium text-ink"
            style={{
              borderColor: `${construct.color}33`,
              background: construct.colorSoft,
            }}
          >
            {el}
          </span>
        ))}
      </div>

      <ol className="space-y-1.5">
        {course.lessons.map((lesson, i) => {
          const done = state?.lessonProgress[lesson.id] === "completed";
          return (
            <li key={lesson.id}>
              <Link
                href={`/learn/courses/${constructId}/${lesson.id}`}
                className="flex items-center justify-between gap-3 rounded-xl border border-black/[0.07] bg-white px-3.5 py-3 transition hover:border-black/18"
                style={
                  done
                    ? { boxShadow: `inset 3px 0 0 ${construct.color}` }
                    : undefined
                }
              >
                <div className="min-w-0">
                  <p
                    className="learn-eyebrow"
                    style={{ color: construct.color }}
                  >
                    {String(i + 1).padStart(2, "0")} ·{" "}
                    {TYPE_LABEL[lesson.lessonType] ?? lesson.lessonType}
                  </p>
                  <p className="mt-0.5 truncate text-[0.875rem] font-semibold tracking-tight text-ink">
                    {lesson.title}
                  </p>
                  <p className="learn-meta mt-0.5 truncate">{lesson.outcome}</p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[0.7rem] font-semibold ${
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
