"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
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
      title="Courses"
      subtitle={`${programme?.name ?? "Programme"} · Six construct modules — Read · Engage · Apply in every session.`}
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {courses.map((course) => {
          const construct = constructs.find((c) => c.id === course.constructId);
          const done = course.lessons.filter(
            (l) => state?.lessonProgress[l.id] === "completed"
          ).length;
          const pct = Math.round((done / course.lessons.length) * 100);
          const color = construct?.color ?? "#111";
          const soft = construct?.colorSoft ?? "#f4f4f4";
          return (
            <Link
              key={course.id}
              href={`/learn/courses/${course.constructId}`}
              className="card-lift group flex gap-3 overflow-hidden rounded-2xl border border-black/[0.08] bg-white p-3 sm:p-4"
              style={{
                boxShadow: `inset 3px 0 0 ${color}`,
              }}
            >
              {/* Compact cover */}
              <div
                className="relative h-20 w-16 shrink-0 overflow-hidden rounded-lg border border-black/[0.06] sm:h-24 sm:w-20"
                style={{ background: soft }}
              >
                <Image
                  src={course.coverPath}
                  alt={course.title}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-[1.04]"
                  sizes="72px"
                />
              </div>

              <div className="min-w-0 flex-1 py-0.5">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ background: color }}
                  />
                  <h2 className="truncate font-semibold tracking-tight text-ink">
                    {construct?.name}
                  </h2>
                </div>
                <p className="mt-1 text-xs font-medium" style={{ color }}>
                  {construct?.tagline}
                </p>
                <p className="mt-1.5 line-clamp-2 text-sm text-slate">
                  {course.promise}
                </p>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-black/[0.06]">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${pct}%`, background: color }}
                  />
                </div>
                <p className="mt-1.5 text-[0.7rem] text-muted">
                  {done}/{course.lessons.length} sessions · {pct}%
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </LearnShell>
  );
}
