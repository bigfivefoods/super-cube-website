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
      subtitle={`${programme?.name ?? "Programme"} · Six construct modules with lessons, practice, and checks.`}
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => {
          const construct = constructs.find((c) => c.id === course.constructId);
          const done = course.lessons.filter(
            (l) => state?.lessonProgress[l.id] === "completed"
          ).length;
          const pct = Math.round((done / course.lessons.length) * 100);
          return (
            <Link
              key={course.id}
              href={`/learn/courses/${course.constructId}`}
              className="card-lift group overflow-hidden rounded-2xl border border-black/[0.08] bg-white"
            >
              <div className="relative aspect-[3/4] max-h-56 w-full bg-[#f4f4f4] sm:max-h-none">
                <Image
                  src={course.coverPath}
                  alt={course.title}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-[1.02]"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div className="p-4 sm:p-5">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: construct?.color }}
                  />
                  <h2 className="font-semibold tracking-tight text-ink">
                    {construct?.name}
                  </h2>
                </div>
                <p className="mt-2 text-sm text-slate line-clamp-2">
                  {course.summary}
                </p>
                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-black/[0.06]">
                  <div
                    className="h-full rounded-full bg-ink transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-muted">
                  {done}/{course.lessons.length} lessons · {pct}%
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </LearnShell>
  );
}
