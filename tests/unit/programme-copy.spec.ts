import { test, expect } from "@playwright/test";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { getJourney } from "@/lib/lms/journey";
import { getLearningAction } from "@/lib/lms/next-action";
import { programmes } from "@/lib/programmes";
import {
  PROGRAMME_COPY_ADOLESCENTS,
  PROGRAMME_COPY_ADULTS,
  PROGRAMME_COPY_KIDS,
  programmeCopy,
  type ProgrammeCopyKey,
} from "@/lib/lms/programme-copy";

const KEYS = Object.keys(PROGRAMME_COPY_ADULTS) as ProgrammeCopyKey[];
const youth = { kids: PROGRAMME_COPY_KIDS, adolescents: PROGRAMME_COPY_ADOLESCENTS } as const;
const norm = (s: string) => s.toLowerCase().replace(/[’]/g, "'").replace(/[*_`\\]/g, "");
const words = (s: string) => norm(s).match(/[a-z][a-z'-]{3,}/g) ?? [];
const placeholders = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort();

function listFiles(roots: string[]): string[] {
  const out: string[] = [];
  const walk = (d: string) => {
    for (const f of readdirSync(d)) {
      const p = join(d, f);
      if (statSync(p).isDirectory()) walk(p);
      else if (/\.tsx?$/.test(f)) out.push(p);
    }
  };
  for (const r of roots) (statSync(r).isDirectory() ? walk(r) : out.push(r));
  return out;
}

function syllables(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, "");
  if (!w) return 0;
  if (w.length <= 3) return 1;
  const g = w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "").replace(/^y/, "").match(/[aeiouy]{1,2}/g);
  return Math.max(1, g?.length ?? 1);
}
function fkGrade(text: string): number {
  const sentences = Math.max(1, (text.match(/[.!?…]+/g) ?? []).length);
  const ws = text.match(/[A-Za-z][A-Za-z'’-]*/g) ?? [];
  const syl = ws.reduce((n, w) => n + syllables(w), 0);
  return 0.39 * (ws.length / sentences) + 11.8 * (syl / ws.length) - 15.59;
}

const seeded = (programmeId?: "kids" | "adolescents" | "adults", extra: Record<string, unknown> = {}) =>
  ({
    user: programmeId ? { email: "a@b.c", programmeId } : undefined,
    profile: programmeId ? { displayName: "T", ageBand: "35-44", role: "x", context: "y", programmeId, profileCompletedAt: "2026-10-01T00:00:00Z" } : undefined,
    lessonProgress: {},
    attempts: [],
    ...extra,
  }) as never;

test.describe("programme-level /learn copy", () => {
  test("Adults (and no programme yet) keep the original wording", () => {
    for (const k of KEYS) {
      expect(programmeCopy(k, "adults")).toBe(PROGRAMME_COPY_ADULTS[k]);
      expect(programmeCopy(k, undefined)).toBe(PROGRAMME_COPY_ADULTS[k]);
    }
  });

  test("Kids and Teens have their own line for every key, with the same placeholders", () => {
    for (const [p, table] of Object.entries(youth)) {
      for (const k of KEYS) {
        expect(table[k], `${p}/${k}`).toBeTruthy();
        expect(table[k], `${p}/${k}`).not.toBe(PROGRAMME_COPY_ADULTS[k]);
        expect(placeholders(table[k]), `${p}/${k}`).toEqual(placeholders(PROGRAMME_COPY_ADULTS[k]));
      }
    }
  });

  test("placeholders are filled", () => {
    expect(programmeCopy("course.subtitle", "kids", { programme: "Super-Cube® Kids", n: 7 })).toBe("Super-Cube® Kids · 7 short sessions");
  });

  test("Kids and Teens lines only reuse wording already in the learner app (no new claims)", () => {
    const corpus = norm(
      listFiles(["src/app/learn", "src/components/learn", "src/lib/lms", "src/lib/programmes.ts"])
        .filter((f) => !f.endsWith("programme-copy.ts"))
        .map((f) => readFileSync(f, "utf8"))
        .join(" "),
    );
    for (const [p, table] of Object.entries(youth)) {
      for (const k of KEYS) {
        const source = `${corpus} ${norm(PROGRAMME_COPY_ADULTS[k])}`;
        const missing = words(table[k]).filter((w) => !new RegExp(`\\b${w}`).test(source));
        expect(missing, `${p}/${k}`).toEqual([]);
      }
    }
  });

  test("no statistics: no percentages, and numbers only where the adult line or programme already has them", () => {
    for (const [p, table] of Object.entries(youth)) {
      const age = programmes.find((x) => x.id === p)!.ageLabel;
      for (const k of KEYS) {
        expect(table[k], `${p}/${k}`).not.toMatch(/%|per cent|percent/i);
        for (const d of table[k].match(/\d+(?:–\d+)?/g) ?? []) {
          expect(`${PROGRAMME_COPY_ADULTS[k]} ${age}`, `${p}/${k}: ${d}`).toContain(d);
        }
      }
    }
  });

  test("reading level: Kids about grade 3–4, Teens about grade 7–8 or easier", () => {
    const strip = (s: string) => s.replace(/\{\w+\}/g, "").replace(/Super-Cube®/g, "Cube");
    const kids = fkGrade(KEYS.map((k) => strip(PROGRAMME_COPY_KIDS[k])).join(" "));
    const teens = fkGrade(KEYS.map((k) => strip(PROGRAMME_COPY_ADOLESCENTS[k])).join(" "));
    const adults = fkGrade(KEYS.map((k) => strip(PROGRAMME_COPY_ADULTS[k])).join(" "));
    expect(kids).toBeLessThanOrEqual(4.5);
    expect(teens).toBeLessThanOrEqual(8.5);
    expect(kids).toBeLessThan(teens);
    expect(teens).toBeLessThan(adults);
  });

  test("journey and next action use the learner's programme", () => {
    for (const p of ["kids", "adolescents", "adults"] as const) {
      const j = getJourney(seeded(p));
      const learn = j.steps.find((s) => s.id === "learn")!;
      expect(learn.promise).toBe(programmeCopy("journey.learn.promise", p));
      expect(learn.description).toBe(programmeCopy("journey.learn.description", p));
      const a = getLearningAction(seeded(p));
      expect(a?.kind).toBe("orient");
      expect(a?.detail).toBe(programmeCopy("next.orient.detail", p));
    }
  });

  test("the old adult literals now live only in programme-copy.ts", () => {
    const samples = [
      "Small sessions that compound into real",
      "Developmental profile (not a clinical diagnosis)",
      "Guided by your face patterns and baseline",
      "one place to know yourself",
      "eight-step learning arc",
      "unlock narrative feedback",
    ];
    const offenders = listFiles(["src/app/learn", "src/components/learn", "src/lib/lms/journey.ts", "src/lib/lms/next-action.ts"])
      .filter((f) => samples.some((s) => readFileSync(f, "utf8").includes(s)));
    expect(offenders).toEqual([]);
  });
});
