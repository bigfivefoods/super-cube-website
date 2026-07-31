import { getCoursesForProgramme } from "@/lib/lms/curriculum";
import type { LocalLmsState } from "@/lib/lms/store";
import type { ConstructId } from "@/lib/content";
import type { ProgrammeId } from "@/lib/programmes";
import { constructs } from "@/lib/content";

export type ContinueTarget = {
  href: string;
  title: string;
  detail: string;
  constructId?: ConstructId;
  constructColor?: string;
  kind: "resume" | "next_lesson" | "journey";
};

/**
 * Smart “Continue” target: resume last open session, else first incomplete lesson, else journey step.
 */
export function getContinueTarget(
  state: LocalLmsState,
  journeyHref: string,
  journeyTitle: string
): ContinueTarget {
  const programmeId = (state.subscription?.programmeId ||
    state.user?.programmeId) as ProgrammeId | undefined;

  if (!programmeId) {
    return {
      href: journeyHref,
      title: journeyTitle,
      detail: "Choose your pathway to begin",
      kind: "journey",
    };
  }

  const courses = getCoursesForProgramme(programmeId);
  const progress = state.lessonProgress;

  // Prefer last in-progress or last visited incomplete
  if (state.lastLessonId && state.lastConstructId) {
    const course = courses.find((c) => c.constructId === state.lastConstructId);
    const lesson = course?.lessons.find((l) => l.id === state.lastLessonId);
    if (lesson && progress[lesson.id] !== "completed") {
      const c = constructs.find((x) => x.id === state.lastConstructId);
      return {
        href: `/learn/courses/${state.lastConstructId}/${lesson.id}`,
        title: lesson.title,
        detail: `Resume · ${c?.name ?? "Module"}`,
        constructId: state.lastConstructId,
        constructColor: c?.color,
        kind: "resume",
      };
    }
  }

  // First incomplete lesson in curriculum order
  for (const course of courses) {
    for (const lesson of course.lessons) {
      if (progress[lesson.id] !== "completed") {
        const c = constructs.find((x) => x.id === course.constructId);
        return {
          href: `/learn/courses/${course.constructId}/${lesson.id}`,
          title: lesson.title,
          detail: `Next session · ${c?.name ?? "Module"}`,
          constructId: course.constructId,
          constructColor: c?.color,
          kind: "next_lesson",
        };
      }
    }
  }

  return {
    href: journeyHref,
    title: journeyTitle,
    detail: "Continue your pathway",
    kind: "journey",
  };
}

export function reflectionCount(state: LocalLmsState): number {
  return Object.values(state.reflections ?? {}).filter((r) => r.text.trim())
    .length;
}
