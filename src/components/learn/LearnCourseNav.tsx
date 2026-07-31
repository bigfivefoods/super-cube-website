"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { constructs, type ConstructId } from "@/lib/content";
import { getCoursesForProgramme, type Course } from "@/lib/lms/curriculum";
import { loadLmsState, type LocalLmsState } from "@/lib/lms/store";
import { courseId, type ProgrammeId } from "@/lib/programmes";

const TYPE_SHORT: Record<string, string> = {
  content: "Session",
  practice: "Lab",
  quiz: "Check",
};

/**
 * Expandable course → session tree for the Learn journey step.
 * Shows under “Learn” so learners can see and jump to what they’re studying.
 */
export function LearnCourseNav({
  expanded,
  onToggle,
  nested = false,
}: {
  /** Controlled expand of the course list under Learn */
  expanded: boolean;
  onToggle?: () => void;
  /** Indent as nested under a journey step row */
  nested?: boolean;
}) {
  const pathname = usePathname();
  const [state, setState] = useState<LocalLmsState | null>(null);

  useEffect(() => {
    setState(loadLmsState());
  }, [pathname]);

  const programmeId = (state?.subscription?.programmeId ||
    state?.user?.programmeId ||
    "adults") as ProgrammeId;

  const courses = useMemo(
    () => getCoursesForProgramme(programmeId),
    [programmeId]
  );

  const pathConstruct = useMemo(() => {
    const m = pathname.match(/^\/learn\/courses\/([^/]+)/);
    return (m?.[1] as ConstructId | undefined) ?? null;
  }, [pathname]);

  const pathLesson = useMemo(() => {
    const m = pathname.match(/^\/learn\/courses\/[^/]+\/([^/]+)/);
    return m?.[1] ?? null;
  }, [pathname]);

  // Which course modules are open (auto-open current construct)
  const [openConstructs, setOpenConstructs] = useState<Record<string, boolean>>(
    {}
  );

  useEffect(() => {
    if (pathConstruct) {
      setOpenConstructs((prev) => ({ ...prev, [pathConstruct]: true }));
    }
  }, [pathConstruct]);

  function toggleConstruct(id: string) {
    setOpenConstructs((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function courseDoneCount(course: Course) {
    if (!state) return 0;
    return course.lessons.filter(
      (l) => state.lessonProgress[l.id] === "completed"
    ).length;
  }

  if (!expanded) return null;

  return (
    <div
      className={`${
        nested
          ? "ml-2 border-l border-black/[0.08] pl-2 lg:ml-3 lg:pl-2.5"
          : ""
      } mt-0.5 space-y-0.5 pb-1`}
      role="group"
      aria-label="Courses and sessions"
    >
      <div className="flex items-center justify-between gap-2 px-1 pb-1 lg:px-0">
        <p className="text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-muted">
          Courses
        </p>
        {onToggle && (
          <button
            type="button"
            onClick={onToggle}
            className="text-[0.65rem] font-medium text-muted hover:text-ink lg:hidden"
          >
            Hide
          </button>
        )}
      </div>

      <ul className="space-y-0.5">
        {courses.map((course) => {
          const construct = constructs.find((c) => c.id === course.constructId);
          if (!construct) return null;

          const isCourseActive = pathConstruct === course.constructId;
          const isOpen =
            openConstructs[course.constructId] ?? isCourseActive;
          const done = courseDoneCount(course);
          const total = course.lessons.length;
          const allDone = done === total && total > 0;
          const color = construct.color;

          return (
            <li key={course.id}>
              <div className="flex items-stretch gap-0.5">
                <button
                  type="button"
                  onClick={() => toggleConstruct(course.constructId)}
                  className={`flex h-8 w-7 shrink-0 items-center justify-center rounded-lg text-[0.65rem] text-muted transition hover:bg-black/[0.04] hover:text-ink ${
                    isCourseActive ? "text-ink" : ""
                  }`}
                  aria-expanded={isOpen}
                  aria-label={
                    isOpen
                      ? `Collapse ${construct.name} sessions`
                      : `Expand ${construct.name} sessions`
                  }
                >
                  <span
                    className={`inline-block transition-transform ${
                      isOpen ? "rotate-90" : ""
                    }`}
                    aria-hidden
                  >
                    ▸
                  </span>
                </button>

                <Link
                  href={`/learn/courses/${course.constructId}`}
                  className={`flex min-w-0 flex-1 items-center gap-2 rounded-lg px-2 py-1.5 text-left text-[0.75rem] font-medium tracking-tight transition ${
                    isCourseActive && !pathLesson
                      ? "bg-ink text-white"
                      : isCourseActive
                        ? "bg-black/[0.05] text-ink"
                        : "text-slate hover:bg-black/[0.04] hover:text-ink"
                  }`}
                >
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{
                      background:
                        isCourseActive && !pathLesson ? "#fff" : color,
                    }}
                    aria-hidden
                  />
                  <span className="min-w-0 flex-1 truncate">
                    {construct.shortName}
                  </span>
                  <span
                    className={`shrink-0 text-[0.625rem] tabular-nums ${
                      isCourseActive && !pathLesson
                        ? "text-white/70"
                        : "text-muted"
                    }`}
                  >
                    {allDone ? "✓" : `${done}/${total}`}
                  </span>
                </Link>
              </div>

              {isOpen && (
                <ul className="ml-7 mt-0.5 space-y-0.5 border-l border-black/[0.06] pl-2">
                  {course.lessons.map((lesson, idx) => {
                    const href = `/learn/courses/${course.constructId}/${lesson.id}`;
                    const active = pathLesson === lesson.id;
                    const completed =
                      state?.lessonProgress[lesson.id] === "completed";
                    const type =
                      TYPE_SHORT[lesson.lessonType] ?? "Session";

                    return (
                      <li key={lesson.id}>
                        <Link
                          href={href}
                          className={`flex items-start gap-1.5 rounded-md px-2 py-1.5 text-left transition ${
                            active
                              ? "bg-ink text-white"
                              : "text-slate hover:bg-black/[0.04] hover:text-ink"
                          }`}
                          title={lesson.title}
                        >
                          <span
                            className={`mt-0.5 flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full text-[0.55rem] font-bold ${
                              active
                                ? "bg-white/20 text-white"
                                : completed
                                  ? "bg-ink text-white"
                                  : "border border-black/[0.12] text-muted"
                            }`}
                          >
                            {completed && !active ? "✓" : idx + 1}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span
                              className={`block truncate text-[0.7rem] font-medium leading-snug ${
                                active ? "text-white" : "text-ink"
                              }`}
                            >
                              {lesson.title.replace(/^Overview:\s*/i, "Overview · ")}
                            </span>
                            <span
                              className={`mt-0.5 block text-[0.6rem] ${
                                active ? "text-white/65" : "text-muted"
                              }`}
                            >
                              {type} · ~{lesson.durationMinutes}m
                            </span>
                          </span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
          );
        })}
      </ul>

      <Link
        href="/learn/courses"
        className="mt-1 block rounded-lg px-2 py-1.5 text-[0.7rem] font-medium text-muted transition hover:bg-black/[0.04] hover:text-ink"
      >
        All courses →
      </Link>
    </div>
  );
}

/** Parse current course context from path for breadcrumb-style labels */
export function useLearnCourseContext() {
  const pathname = usePathname();
  const [state, setState] = useState<LocalLmsState | null>(null);

  useEffect(() => {
    setState(loadLmsState());
  }, [pathname]);

  const programmeId = (state?.subscription?.programmeId ||
    state?.user?.programmeId ||
    "adults") as ProgrammeId;

  const pathConstruct = useMemo(() => {
    const m = pathname.match(/^\/learn\/courses\/([^/]+)/);
    return (m?.[1] as ConstructId | undefined) ?? null;
  }, [pathname]);

  const pathLesson = useMemo(() => {
    const m = pathname.match(/^\/learn\/courses\/[^/]+\/([^/]+)/);
    return m?.[1] ?? null;
  }, [pathname]);

  const construct = constructs.find((c) => c.id === pathConstruct);
  const course = pathConstruct
    ? getCoursesForProgramme(programmeId).find(
        (c) => c.constructId === pathConstruct
      )
    : undefined;
  const lesson = course?.lessons.find((l) => l.id === pathLesson);

  return {
    programmeId,
    construct,
    course,
    lesson,
    courseId: pathConstruct
      ? courseId(programmeId, pathConstruct)
      : null,
  };
}
