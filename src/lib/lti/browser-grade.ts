"use client";

import { getCoursesForProgramme, getCourseMeta } from "@/lib/lms/curriculum-meta";
import { loadLmsState } from "@/lib/lms/store";
import type { ProgrammeId } from "@/lib/programmes";
import type { ConstructId } from "@/lib/content";

/** Tell the LTI session about lesson completion. No-op unless this browser was launched from an LMS. */
export function reportLtiProgress(programmeId: ProgrammeId, constructId: ConstructId): void {
  if (typeof document === "undefined") return;
  if (!/(?:^|; )sc_lti_active=/.test(document.cookie)) return;
  const state = loadLmsState();
  const access = state.ltiAccess;
  if (!access || access.programmeId !== programmeId) return;
  const courses =
    access.courseId === programmeId
      ? getCoursesForProgramme(programmeId)
      : [getCourseMeta(access.courseId)].filter((course) => course != null);
  const lessons = courses.flatMap((course) => course.lessons);
  if (lessons.length === 0) return;
  const done = lessons.filter((lesson) => state.lessonProgress[lesson.id] === "completed").length;
  const finished = done >= lessons.length;
  const scoreGiven = Math.round((done / lessons.length) * 100) / 100;
  void fetch("/api/lti/grade", {
    method: "POST",
    credentials: "same-origin",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      scoreGiven,
      scoreMaximum: 1,
      activityProgress: finished ? "Completed" : "InProgress",
      gradingProgress: finished ? "FullyGraded" : "Pending",
      constructId,
    }),
  }).catch(() => undefined);
}
