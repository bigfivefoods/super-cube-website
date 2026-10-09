import { writeFileSync } from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";
import { curriculum } from "@/lib/lms/curriculum";
import { curriculumMeta, sessionCount, type CourseMeta } from "@/lib/lms/curriculum-meta";

function derive(): CourseMeta[] {
  return curriculum.map((c) => ({
    id: c.id,
    programmeId: c.programmeId,
    constructId: c.constructId,
    title: c.title,
    summary: c.summary,
    promise: c.promise,
    coverPath: c.coverPath,
    sortOrder: c.sortOrder,
    lessons: c.lessons.map((l) => ({
      id: l.id,
      courseId: l.courseId,
      title: l.title,
      lessonType: l.lessonType,
      sortOrder: l.sortOrder,
      durationMinutes: l.durationMinutes,
      outcome: l.outcome,
      checkCount: l.arc?.check.length ?? l.faceCheck?.length ?? 0,
    })),
  }));
}

test("curriculum index matches the full curriculum", () => {
  const derived = derive();
  if (process.env.UPDATE_CURRICULUM_META) {
    const file = path.join(process.cwd(), "src/lib/lms/curriculum-meta.generated.ts");
    writeFileSync(
      file,
      `/* Generated from curriculum.ts by tests/unit/curriculum-meta.spec.ts. Do not edit by hand. */\nexport const CURRICULUM_META: unknown[] = ${JSON.stringify(derived, null, 1)};\n`
    );
    return;
  }
  expect(curriculumMeta).toEqual(derived);
});

test("session counts per programme", () => {
  expect(sessionCount("adults")).toBe(46);
  for (const p of ["adults", "adolescents", "kids"] as const) expect(sessionCount(p)).toBeGreaterThan(30);
});
