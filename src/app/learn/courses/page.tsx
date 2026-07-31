"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CourseVideo } from "@/components/learn/CourseVideo";
import { LearnShell } from "@/components/learn/LearnShell";
import { constructs } from "@/lib/content";
import { getCoursesForProgramme } from "@/lib/lms/curriculum";
import { loadLmsState, type LocalLmsState } from "@/lib/lms/store";
import { getProgramme, type ProgrammeId } from "@/lib/programmes";

export default function CoursesPage() {
  const [state, setState] = useState<LocalLmsState | null>(null);
  useEffect(() => setState(loadLmsState()), []);

  const programmeId = (state?.subscription?.programmeId ||
    state?.user?.programmeId ||
    "adults") as ProgrammeId;
  const programme = getProgramme(programmeId);
  const courses = getCoursesForProgramme(programmeId);

  return (
    <LearnShell
      title="Step 4 · Develop the six faces"
      subtitle={`${programme?.name ?? "Programme"} · Work through each construct with Read · Engage · Apply. Small sessions that compound into real capacity.`}
    >
      <div className="grid gap-3 sm:grid-cols-2 sm:gap-3.5 xl:grid-cols-3">
        {courses.map((course) => {
          const construct = constructs.find((c) => c.id === course.constructId);
          const done = course.lessons.filter(
            (l) => state?.lessonProgress[l.id] === "completed"
          ).length;
          const pct = Math.round((done / course.lessons.length) * 100);
          const color = construct?.color ?? "#111";
          const soft = construct?.colorSoft ?? "#f4f4f4";
          return (
            <article
              key={course.id}
              className="card-lift group flex gap-3 overflow-hidden rounded-2xl border border-black/[0.07] bg-white p-3 shadow-[0_1px_0_rgba(0,0,0,0.02)] sm:p-3.5"
              style={{
                boxShadow: `inset 3px 0 0 ${color}`,
              }}
            >
              {/* Video thumb + play — not nested inside the text Link */}
              <div
                className="relative h-[4.5rem] w-14 shrink-0 sm:h-20 sm:w-16"
                style={{ background: soft }}
              >
                <CourseVideo
                  programmeId={programmeId}
                  constructId={course.constructId}
                  poster={course.coverPath}
                  title={construct?.name ?? course.title}
                  color={color}
                  variant="thumb"
                />
              </div>

              <Link
                href={`/learn/courses/${course.constructId}`}
                className="min-w-0 flex-1 py-0.5 outline-none"
              >
                <div className="flex items-center gap-1.5">
                  <span
                    className="h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{ background: color }}
                  />
                  <h2 className="truncate text-[0.875rem] font-semibold tracking-tight text-ink group-hover:underline">
                    {construct?.name}
                  </h2>
                </div>
                <p
                  className="mt-0.5 truncate text-[0.7rem] font-medium"
                  style={{ color }}
                >
                  {construct?.tagline}
                </p>
                <p className="mt-1.5 line-clamp-2 text-[0.75rem] leading-snug text-slate">
                  {course.promise}
                </p>
                <div className="learn-progress mt-2.5">
                  <div style={{ width: `${pct}%`, background: color }} />
                </div>
                <p className="learn-meta mt-1">
                  {done}/{course.lessons.length} sessions · {pct}%
                </p>
              </Link>
            </article>
          );
        })}
      </div>

      <div className="mt-6 rounded-2xl border border-black/[0.07] bg-white p-4 sm:p-5">
        <p className="learn-eyebrow">After the full programme</p>
        <p className="mt-1 text-sm font-semibold text-ink">
          Step 5 · Re-measure, then Step 6 · Report
        </p>
        <p className="learn-meta mt-0.5">
          Finish every construct session, take the post-assessment (same six
          faces as baseline), then open your growth report to see how you’ve
          developed.
        </p>
        <div className="mt-3 flex flex-wrap gap-3">
          <Link
            href="/learn/assessment/post"
            className="text-[0.8125rem] font-semibold text-ink underline-offset-2 hover:underline"
          >
            Post-assessment →
          </Link>
          <Link
            href="/learn/report"
            className="text-[0.8125rem] font-semibold text-muted underline-offset-2 hover:text-ink hover:underline"
          >
            View report
          </Link>
        </div>
      </div>
    </LearnShell>
  );
}
