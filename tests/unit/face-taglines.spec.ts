import { test, expect } from "@playwright/test";
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
});
