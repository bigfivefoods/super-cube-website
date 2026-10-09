/**
 * Lightweight curriculum index: ids, titles, outcomes and durations only.
 *
 * Pages that list or count sessions (Today, Progress, the sidebar, gates)
 * import this instead of `curriculum.ts`, so they don't ship the full
 * session text to the browser. The data is generated from `curriculum.ts`;
 * `tests/unit/curriculum-meta.spec.ts` fails if it drifts
 * (regenerate with `UPDATE_CURRICULUM_META=1 npm run test:unit -- curriculum-meta`).
 */
import type { ConstructId } from "@/lib/content";
import type { ProgrammeId } from "@/lib/programmes";
import { CURRICULUM_META } from "@/lib/lms/curriculum-meta.generated";

export type LessonType = "content" | "practice" | "quiz";

export interface LessonMeta {
  id: string;
  courseId: string;
  title: string;
  lessonType: LessonType;
  sortOrder: number;
  durationMinutes: number;
  outcome: string;
  /** Knowledge-check questions in the session (0 for practice labs) */
  checkCount: number;
}

export interface CourseMeta {
  id: string;
  programmeId: ProgrammeId;
  constructId: ConstructId;
  title: string;
  summary: string;
  promise: string;
  coverPath: string;
  sortOrder: number;
  lessons: LessonMeta[];
}

export const curriculumMeta: CourseMeta[] = CURRICULUM_META as CourseMeta[];

export function getCoursesForProgramme(programmeId: ProgrammeId): CourseMeta[] {
  return curriculumMeta.filter((c) => c.programmeId === programmeId);
}

export function getCourseMeta(id: string): CourseMeta | undefined {
  return curriculumMeta.find((c) => c.id === id);
}

export function getLessonMeta(courseId: string, lessonId: string): { course: CourseMeta; lesson: LessonMeta } | undefined {
  const course = getCourseMeta(courseId);
  const lesson = course?.lessons.find((l) => l.id === lessonId);
  return course && lesson ? { course, lesson } : undefined;
}

/** Find a lesson anywhere in the curriculum by its id. */
export function findLessonMeta(lessonId: string): { course: CourseMeta; lesson: LessonMeta } | undefined {
  for (const course of curriculumMeta) {
    const lesson = course.lessons.find((l) => l.id === lessonId);
    if (lesson) return { course, lesson };
  }
  return undefined;
}

/** Number of sessions in a programme (the "Unlock all N sessions" count). */
export function sessionCount(programmeId: ProgrammeId): number {
  return getCoursesForProgramme(programmeId).reduce((n, c) => n + c.lessons.length, 0);
}
