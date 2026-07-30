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
        <Link href="/learn/courses" className="mt-4 inline-block font-semibold text-ink">
          ← All courses
        </Link>
      </LearnShell>
    );
  }

  return (
    <LearnShell
      title={construct.name}
      subtitle={`${programme?.name} · ${course.lessons.length} lessons`}
    >
      <div className="mb-6 grid gap-6 lg:grid-cols-[200px_1fr]">
        <div className="relative mx-auto aspect-[3/4] w-40 overflow-hidden rounded-xl border border-black/[0.08] bg-[#f4f4f4] lg:mx-0 lg:w-full">
          <Image
            src={course.coverPath}
            alt={construct.name}
            fill
            className="object-cover"
            sizes="200px"
          />
        </div>
        <div>
          <p className="text-sm text-slate">{construct.description}</p>
          <Link
            href="/learn/courses"
            className="mt-4 inline-block text-sm font-semibold text-ink underline-offset-2 hover:underline"
          >
            ← All courses
          </Link>
        </div>
      </div>

      <ol className="space-y-2">
        {course.lessons.map((lesson, i) => {
          const done = state?.lessonProgress[lesson.id] === "completed";
          return (
            <li key={lesson.id}>
              <Link
                href={`/learn/courses/${constructId}/${lesson.id}`}
                className="flex items-center justify-between gap-3 rounded-xl border border-black/[0.08] bg-white px-4 py-3 transition hover:border-ink/30"
              >
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                    {String(i + 1).padStart(2, "0")} · {lesson.lessonType}
                  </p>
                  <p className="truncate font-semibold tracking-tight text-ink">
                    {lesson.title}
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                    done
                      ? "bg-ink text-white"
                      : "bg-black/[0.04] text-muted"
                  }`}
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
