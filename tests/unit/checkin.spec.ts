import { expect, test } from "@playwright/test";
import { constructs } from "@/lib/content";
import {
  checkinComparison,
  gapLabel,
  normalizeEmail,
  parseInvites,
  scoreFaces,
  validateFaceResponses,
} from "@/lib/lms/checkin";
import type { FaceRating } from "@/lib/lms/checkin";

const faces = (n: number): FaceRating[] => constructs.map((c) => ({ constructId: c.id, score: n }));

test("face ratings use the same 0–100 scale as the self-report", () => {
  const all = Object.fromEntries(constructs.map((c) => [c.id, 5]));
  expect(scoreFaces(all).every((s) => s.score === 100)).toBe(true);
  const low = Object.fromEntries(constructs.map((c) => [c.id, 1]));
  expect(scoreFaces(low).every((s) => s.score === 0)).toBe(true);
  expect(validateFaceResponses({ choices: 3 }).ok).toBe(false);
  const full = Object.fromEntries(constructs.map((c) => [c.id, 4]));
  const parsed = validateFaceResponses(full);
  expect(parsed.ok).toBe(true);
});

test("a manager can be shown alone, and one peer cannot be singled out", () => {
  const managerOnly = checkinComparison([{ relationship: "manager", scores: faces(80) }]);
  expect(managerOnly.manager.shown).toBe(true);
  expect(managerOnly.peer.shown).toBe(false);
  expect(managerOnly.others.shown).toBe(true);
  expect(managerOnly.others.scores?.[0].score).toBe(80);

  const leaks = checkinComparison([
    { relationship: "manager", scores: faces(80) },
    { relationship: "peer", scores: faces(20) },
  ]);
  expect(leaks.manager.shown).toBe(true);
  expect(leaks.peer.shown).toBe(false);
  expect(leaks.others.shown).toBe(false);

  const safe = checkinComparison([
    { relationship: "manager", scores: faces(80) },
    { relationship: "peer", scores: faces(40) },
    { relationship: "peer", scores: faces(50) },
    { relationship: "peer", scores: faces(60) },
  ]);
  expect(safe.peer.shown).toBe(true);
  expect(safe.others.shown).toBe(true);
  expect(safe.others.completed).toBe(4);
  expect(safe.peer.scores?.[0].score).toBe(50);
  expect(safe.others.scores?.[0].score).toBe(57.5);
  expect(gapLabel(12)).toBe("others rate higher");
  expect(gapLabel(-12)).toBe("you rate higher");
  expect(gapLabel(4)).toBeNull();
});

test("invite emails are normalised and not repeated", () => {
  expect(normalizeEmail("  Ada@Company.com ")).toBe("ada@company.com");
  expect(normalizeEmail("not an email")).toBeNull();
  expect(parseInvites([
    { email: "m@co.example", relationship: "manager" },
    { email: "p@co.example", relationship: "peer" },
  ])).toHaveLength(2);
  expect(parseInvites([
    { email: "m@co.example", relationship: "manager" },
    { email: "M@co.example", relationship: "peer" },
  ])).toBeNull();
  expect(parseInvites([{ email: "m@co.example", relationship: "direct_report" }])).toBeNull();
});
