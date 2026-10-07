import { test, expect } from "@playwright/test";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { constructs } from "@/lib/content";
import { FACE_CONTENT } from "@/lib/lms/sessions";
import { ADOLESCENT_FACE_TAGLINES, KIDS_FACE_TAGLINES, faceTagline } from "@/lib/lms/face-taglines";

const plain = (s: string) => s.toLowerCase().replace(/[*_`"\\]/g, "");
const words = (s: string) => plain(s).match(/[a-z][a-z'-]{3,}/g) ?? [];

test.describe("face taglines per programme", () => {
  test("Adults keep the site taglines", () => {
    for (const c of constructs) expect(faceTagline(c.id, "adults")).toBe(c.tagline);
  });

  test("Kids and Teens get their own line for every face", () => {
    for (const c of constructs) {
      for (const p of ["kids", "adolescents"] as const) {
        const t = faceTagline(c.id, p);
        expect(t.length, `${p}/${c.id}`).toBeGreaterThan(10);
        expect(t, `${p}/${c.id}`).not.toBe(c.tagline);
      }
    }
  });

  test("Kids lines reuse the Kids session core copy (no new wording or claims)", () => {
    for (const c of constructs) {
      const source = plain(FACE_CONTENT[c.id].overview.coreKids ?? "");
      for (const w of words(KIDS_FACE_TAGLINES[c.id])) expect(source, `kids/${c.id}: "${w}"`).toContain(w);
    }
  });

  test("Teen lines reuse the session core copy (no new wording or claims)", () => {
    for (const c of constructs) {
      const source = plain(FACE_CONTENT[c.id].overview.core);
      for (const w of words(ADOLESCENT_FACE_TAGLINES[c.id])) expect(source, `teens/${c.id}: "${w}"`).toContain(w);
    }
  });

  test("Kids lines stay short and free of digits", () => {
    for (const t of Object.values(KIDS_FACE_TAGLINES)) {
      expect(t.split(/\s+/).length).toBeLessThanOrEqual(14);
      expect(t).not.toMatch(/\d/);
    }
  });

  test("learner pages show face taglines via faceTagline(), not the adult site line", () => {
    // Per-programme surfaces must not render construct.tagline directly. The course
    // layout's SEO metadata has no programme context, so it keeps the site line.
    const roots = ["src/app/learn", "src/components/learn", "src/app/admin/instrument-v2"];
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
      /\b(construct|constructMeta|face|c)\??\.tagline\b/.test(readFileSync(f, "utf8")),
    );
    expect(offenders).toEqual([]);
  });
});
