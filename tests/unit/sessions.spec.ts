import { test, expect } from "@playwright/test";
import { constructs } from "@/lib/content";
import { programmes, skillsForProgramme } from "@/lib/programmes";
import { FACE_CONTENT, faceCheck, overviewArc, skillArc, sessionNotes, slotFor, arcToMarkdown } from "@/lib/lms/sessions";
import { buildCurriculum } from "@/lib/lms/curriculum";
import { buildReview, capstoneCheck, reviewSchedule, reviewPool } from "@/lib/lms/review";
import { CAPSTONE } from "@/lib/lms/sessions/capstone";

const all = () => {
  const out: { label: string; arc: ReturnType<typeof overviewArc>; kids: boolean }[] = [];
  for (const p of programmes) {
    for (const c of constructs) {
      out.push({ label: `${p.id}/${c.id}/overview`, arc: overviewArc(p.id, c.id), kids: p.id === "kids" });
      for (const s of skillsForProgramme(p.id, c.id)) {
        out.push({ label: `${p.id}/${c.id}/${s}`, arc: skillArc(p.id, c.id, s), kids: p.id === "kids" });
      }
    }
  }
  return out;
};

test("every programme skill has exactly one session slot", () => {
  for (const p of programmes) {
    for (const c of constructs) {
      const skills = skillsForProgramme(p.id, c.id);
      for (const s of skills) expect(slotFor(p.id, c.id, s), `${p.id}/${c.id}/${s}`).toBeTruthy();
      const slotted = FACE_CONTENT[c.id].slots.map((sl) => sl.skills?.[p.id]).filter(Boolean);
      expect(slotted.sort()).toEqual([...skills].sort());
    }
  }
  // Adult slot order matches the model's elements
  for (const c of constructs) {
    expect(FACE_CONTENT[c.id].slots.map((s) => s.skills?.adults)).toEqual(c.elements);
  }
});

test("every resolved arc has all eight steps and a facilitator guide", () => {
  for (const { label, arc, kids } of all()) {
    for (const k of ["hook", "core", "reflect", "practice", "ifThen", "journal"] as const) {
      expect(arc[k].trim().length, `${label} ${k}`).toBeGreaterThan(10);
    }
    expect(arc.example.title.length, label).toBeGreaterThan(3);
    expect(arc.ifThen, `${label} if-then`).toMatch(/^If .+, then I will /);
    expect(arc.check.length, `${label} check`).toBeGreaterThanOrEqual(kids ? 2 : 3);
    expect(arc.check.length).toBeLessThanOrEqual(3);
    for (const q of arc.check) {
      expect(q.answer, `${label}: ${q.q}`).toBeGreaterThanOrEqual(0);
      expect(q.answer).toBeLessThan(q.options.length);
      expect(q.options.length).toBeGreaterThanOrEqual(3);
      expect(new Set(q.options).size).toBe(q.options.length);
      expect(q.why.length).toBeGreaterThan(10);
    }
    expect(arc.guide.discussion.length, label).toBeGreaterThanOrEqual(2);
    expect(arc.guide.minutes).toBeGreaterThan(0);
  }
});

test("no invented statistics: the only percentage is the UKZN Emotional result", () => {
  const text = JSON.stringify(FACE_CONTENT);
  const pct = text.match(/[0-9.]+\s?%/g) ?? [];
  expect(pct.every((m) => m.replace(/\s/g, "") === "39.5%")).toBe(true);
  expect(text).toContain("UKZN");
});

test("kids sessions use short, kid-specific content (never the adult core)", () => {
  for (const p of ["kids"] as const) {
    for (const c of constructs) {
      const o = overviewArc(p, c.id);
      expect(o.core).not.toBe(FACE_CONTENT[c.id].overview.core);
      for (const s of skillsForProgramme(p, c.id)) {
        const a = skillArc(p, c.id, s);
        const words = a.core.split(/\s+/).length;
        expect(words, `${c.id}/${s}`).toBeLessThan(90);
      }
    }
  }
});

test("physical sessions carry a professional-advice note; spiritual is faith-inclusive", () => {
  for (const p of programmes) {
    expect(sessionNotes(p.id, "physical").some((n) => n.tone === "safety" && /doctor|professional/i.test(n.text))).toBe(true);
    expect(sessionNotes(p.id, "spiritual").some((n) => n.tone === "inclusive")).toBe(true);
  }
});

test("face check draws one question per skill", () => {
  for (const p of programmes) for (const c of constructs) {
    expect(faceCheck(p.id, c.id).length).toBe(skillsForProgramme(p.id, c.id).length);
  }
});

test("lesson ids and counts are unchanged (after-test gate)", () => {
  const courses = buildCurriculum();
  expect(courses.length).toBe(18);
  for (const course of courses) {
    const skills = skillsForProgramme(course.programmeId, course.constructId);
    const ids = course.lessons.map((l) => l.id);
    expect(ids).toEqual([
      `${course.id}-overview`,
      ...skills.map((_, i) => `${course.id}-skill-${i + 1}`),
      `${course.id}-practice`,
      `${course.id}-quiz`,
    ]);
  }
});

test("markdown fallback contains every step", () => {
  const md = arcToMarkdown(overviewArc("adults", "choices"));
  expect(md.read).toContain("### Hook");
  expect(md.engage).toContain("### Check your understanding");
  expect(md.apply).toContain("### If–then plan");
});


test("spaced reviews: Day 3/7/14, interleaved across faces, misses first", () => {
  const s = reviewSchedule("2026-10-01T08:00:00.000Z");
  expect(s.map((x) => x.day)).toEqual([3, 7, 14]);
  expect(s[0].due?.toISOString()).toBe("2026-10-04T08:00:00.000Z");
  expect(reviewSchedule(null)[0].due).toBeNull();
  for (const p of programmes) {
    for (const day of [3, 7, 14]) {
      const r = buildReview(p.id, day);
      expect(r.length).toBe(p.id === "kids" ? 4 : 6);
      expect(new Set(r.map((q) => q.constructId)).size).toBe(r.length); // one per face
      expect(new Set(r.map((q) => q.q)).size).toBe(r.length);
    }
    expect(buildReview(p.id, 3).map((q) => q.q)).not.toEqual(buildReview(p.id, 7).map((q) => q.q));
  }
  const missed = reviewPool("adults")[5].q;
  expect(buildReview("adults", 7, [missed])[0].q).toBe(missed);
});

test("capstone covers all six faces for every programme", () => {
  for (const p of programmes) {
    expect(capstoneCheck(p.id).length).toBe(6);
    expect(Object.keys(CAPSTONE[p.id].prompts).sort()).toEqual(constructs.map((c) => c.id).sort());
  }
});
