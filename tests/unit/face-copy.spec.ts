import { test, expect } from "@playwright/test";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { constructs, type ConstructId } from "@/lib/content";
import { COURSE_COPY } from "@/lib/lms/course-content";
import { FACE_CONTENT } from "@/lib/lms/sessions";
import { pick } from "@/lib/lms/sessions/types";
import { getCoursesForProgramme } from "@/lib/lms/curriculum";
import {
  ADOLESCENT_FACE_COPY,
  KIDS_FACE_COPY,
  faceChecklist,
  faceDescription,
  faceSkills,
  faceSummary,
  type FaceCopy,
} from "@/lib/lms/face-copy";

const youth = { kids: KIDS_FACE_COPY, adolescents: ADOLESCENT_FACE_COPY } as const;
const allText = (c: FaceCopy) => [c.summary, c.description, ...c.checklist].join(" ");

/** Session copy a programme already sees for a face: hooks, core ideas, practices, plans, journals, lab challenge. */
function sessionSource(id: ConstructId, p: "kids" | "adolescents"): string {
  const f = FACE_CONTENT[id];
  const parts: string[] = [f.overview.core, f.overview.coreKids ?? "", COURSE_COPY[id].practiceLab.challenge[p]];
  for (const a of [f.overview, ...f.slots]) {
    for (const field of [a.hook, a.reflect, a.practice, a.ifThen, a.journal]) parts.push(pick(field, p) ?? "");
    if (p === "kids") parts.push(a.coreKids ?? "");
    parts.push(a.core);
  }
  return parts.join(" ");
}
const norm = (s: string) => s.toLowerCase().replace(/[’]/g, "'").replace(/[*_`\\]/g, "");
const words = (s: string) => norm(s).match(/[a-z][a-z'-]{3,}/g) ?? [];
/** Checklists are written in the past tense ("I said…") while sessions use the present ("Say…"). */
const IRREGULAR: Record<string, string> = {
  said: "say", thought: "think", drew: "draw", wrote: "write", told: "tell", found: "find", broke: "break",
  went: "go", drank: "drink", took: "take", kept: "keep", made: "make", chose: "choose", built: "build",
  sent: "send", tried: "try",
};
function forms(w: string): string[] {
  const out = [w];
  if (IRREGULAR[w]) out.push(IRREGULAR[w]);
  if (/([b-df-hj-np-tv-z])\1ed$/.test(w)) out.push(w.slice(0, -3));
  if (w.endsWith("ed")) out.push(w.slice(0, -2), w.slice(0, -1));
  if (w.endsWith("ing")) out.push(w.slice(0, -3));
  if (w.endsWith("s")) out.push(w.slice(0, -1));
  return out;
}
const inSource = (source: string, w: string) => forms(w).some((f) => new RegExp(`\\b${f}`).test(source));

function syllables(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, "");
  if (!w) return 0;
  if (w.length <= 3) return 1;
  const groups = w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "").replace(/^y/, "").match(/[aeiouy]{1,2}/g);
  return Math.max(1, groups?.length ?? 1);
}
/** Flesch–Kincaid grade level */
function fkGrade(text: string): number {
  const sentences = Math.max(1, (text.match(/[.!?…]+/g) ?? []).length);
  const ws = text.match(/[A-Za-z][A-Za-z'’-]*/g) ?? [];
  const syl = ws.reduce((n, w) => n + syllables(w), 0);
  return 0.39 * (ws.length / sentences) + 11.8 * (syl / ws.length) - 15.59;
}

test.describe("age-appropriate face copy on course pages", () => {
  test("Adults keep the existing site and course copy", () => {
    for (const c of constructs) {
      expect(faceSummary(c.id, "adults")).toBe(COURSE_COPY[c.id].promise);
      expect(faceDescription(c.id, "adults")).toBe(c.description);
      expect(faceChecklist(c.id, "adults")).toEqual(COURSE_COPY[c.id].practiceLab.checklist);
      expect(faceSkills(c.id, "adults")).toEqual(c.elements);
    }
  });

  test("Kids and Teens get their own summary, description, checklist and skill chips", () => {
    for (const c of constructs) {
      for (const p of ["kids", "adolescents"] as const) {
        expect(faceSummary(c.id, p), `${p}/${c.id}`).not.toBe(COURSE_COPY[c.id].promise);
        expect(faceDescription(c.id, p), `${p}/${c.id}`).not.toBe(c.description);
        expect(faceChecklist(c.id, p).length, `${p}/${c.id}`).toBeGreaterThanOrEqual(4);
        expect(faceSkills(c.id, p), `${p}/${c.id}`).not.toEqual(c.elements);
      }
    }
  });

  test("Kids and Teens copy reuses their session copy (no new wording or claims)", () => {
    for (const p of ["kids", "adolescents"] as const) {
      for (const c of constructs) {
        const source = norm(sessionSource(c.id, p));
        const missing = words(allText(youth[p][c.id])).filter((w) => !inSource(source, w));
        expect(missing, `${p}/${c.id}`).toEqual([]);
      }
    }
  });

  test("no statistics: no percentages, and no digits in Kids copy", () => {
    for (const p of ["kids", "adolescents"] as const) {
      for (const c of constructs) {
        const t = allText(youth[p][c.id]);
        expect(t, `${p}/${c.id}`).not.toMatch(/%|per cent|percent/i);
        if (p === "kids") expect(t, `kids/${c.id}`).not.toMatch(/\d/);
      }
    }
  });

  test("reading level: Kids about grade 3–4, Teens about grade 7–8", () => {
    const grades = { kids: [] as number[], adolescents: [] as number[] };
    for (const p of ["kids", "adolescents"] as const) {
      for (const c of constructs) {
        const g = fkGrade(allText(youth[p][c.id]));
        grades[p].push(g);
        expect(g, `${p}/${c.id} grade ${g.toFixed(1)}`).toBeLessThanOrEqual(p === "kids" ? 5 : 9);
      }
    }
    const avg = (a: number[]) => a.reduce((x, y) => x + y, 0) / a.length;
    expect(avg(grades.kids)).toBeLessThanOrEqual(4.5);
    expect(avg(grades.adolescents)).toBeLessThanOrEqual(8.5);
    expect(avg(grades.adolescents)).toBeGreaterThan(avg(grades.kids));
  });

  test("curriculum uses the programme's copy for course promise and practice-lab checklist", () => {
    for (const p of ["kids", "adolescents", "adults"] as const) {
      for (const course of getCoursesForProgramme(p)) {
        expect(course.promise).toBe(faceSummary(course.constructId as ConstructId, p));
        const lab = course.lessons.find((l) => l.lessonType === "practice")?.lab;
        expect(lab?.checklist).toEqual(faceChecklist(course.constructId as ConstructId, p));
      }
    }
  });

  test("learner pages don't render adult face description or skill labels directly", () => {
    const roots = ["src/app/learn", "src/components/learn"];
    const files: string[] = [];
    const walk = (d: string) => {
      for (const f of readdirSync(d)) {
        const p = join(d, f);
        if (statSync(p).isDirectory()) walk(p);
        else if (/\.tsx?$/.test(f) && !/layout\.tsx$/.test(f)) files.push(p);
      }
    };
    roots.forEach(walk);
    const offenders = files.filter((f) =>
      /\b(construct|constructMeta|face|c)\??\.(description|summary|elements)\b/.test(readFileSync(f, "utf8")),
    );
    expect(offenders).toEqual([]);
  });
});
