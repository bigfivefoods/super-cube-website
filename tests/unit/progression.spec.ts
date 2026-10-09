import { expect, test } from "@playwright/test";
import {
  badgeWall,
  earnedProgressBadges,
  facePoints,
  faceTier,
  levelFor,
  LEVELS,
  progression,
  sessionReviewQueue,
  weeklyGoal,
} from "@/lib/lms/progression";
import { masteryVerdict, recordAttempt } from "@/lib/lms/mastery";
import type { LocalLmsState } from "@/lib/lms/store";
import { mergeLmsStates } from "@/lib/lms/sync";

process.env.TZ = "Africa/Johannesburg";

function blank(): LocalLmsState {
  return { lessonProgress: {}, attempts: [], reflections: {}, practiceStreak: { current: 0, best: 0, lastDate: null }, facePulses: [] };
}

const pass = (n = 3) => recordAttempt(undefined, masteryVerdict(n, 3, "adults"), { retried: false, completed: true });

test("points light up the face the learner worked on", () => {
  const s = blank();
  s.lessonProgress = { "adults-choices-overview": "completed", "adults-choices-skill-1": "completed", "adults-choices-quiz": "completed", "adults-mental-practice": "completed" };
  s.mastery = { "adults-choices-overview": pass(), "adults-choices-quiz": pass() };
  s.microPracticeLog = { "2026-10-08": ["ch-1", "me-1"] };
  const p = facePoints(s);
  expect(p.choices).toBe(10 + 5 + 10 + 15 + 5 + 3);
  expect(p.mental).toBe(15 + 3);
  expect(p.spiritual).toBe(0);
  const v = progression(s);
  expect(v.tiers.choices).toBe(2);
  expect(v.tiers.mental).toBe(1);
  expect(v.tiers.spiritual).toBe(0);
});

test("tiers and Super-Cube® levels", () => {
  expect([0, 9, 10, 35, 70, 105, 500].map(faceTier)).toEqual([0, 0, 1, 2, 3, 4, 4]);
  expect(levelFor(0).level.name).toBe("Point");
  expect(levelFor(39).next?.name).toBe("Edge");
  expect(levelFor(40).level.name).toBe("Edge");
  expect(levelFor(80)).toMatchObject({ pct: 50, toNext: 40 });
  expect(levelFor(9999).level.name).toBe("Super-Cube®");
  expect(levelFor(9999).next).toBeNull();
  expect(LEVELS.map((l) => l.min)).toEqual([...LEVELS.map((l) => l.min)].sort((a, b) => a - b));
});

test("weekly goal counts sessions, practices and reviews in the local Monday–Sunday week", () => {
  const s = blank();
  s.weeklyGoal = { target: 3, setAt: "2026-09-28T08:00:00.000Z" };
  // 00:30 SAST on Monday 5 Oct is still Sunday 4 Oct in UTC: it belongs to the new week.
  s.sessionCompletedAt = { "adults-choices-overview": "2026-10-04T22:30:00.000Z" };
  s.microPracticeLog = { "2026-10-06": ["ch-1"], "2026-10-02": ["ch-2"] };
  s.sessionReviews = { "adults-choices-overview": { "3": { at: "2026-10-08T07:00:00.000Z", correct: 2, total: 3 } } };
  const g = weeklyGoal(s, "2026-10-09");
  expect(g).toMatchObject({ target: 3, done: 3, reached: true, weekStart: "2026-10-05", daysLeft: 2 });
  expect(g.weeksHit).toEqual(["2026-10-05"]);
  expect(weeklyGoal({ ...s, weeklyGoal: undefined }, "2026-10-09").target).toBeNull();
});

test("each session comes back on Day 3, 7 and 21 with its own questions", () => {
  const s = blank();
  s.sessionCompletedAt = {
    "adults-choices-skill-1": "2026-10-01T09:00:00.000Z",
    "adults-mental-practice": "2026-10-01T09:00:00.000Z", // labs have no check: no review
    "adults-physical-overview": "2026-10-08T09:00:00.000Z",
  };
  let q = sessionReviewQueue(s, "2026-10-09");
  expect(q.due.map((d) => [d.lessonId, d.days])).toEqual([["adults-choices-skill-1", [3, 7]]]);
  expect(q.next).toMatchObject({ lessonId: "adults-physical-overview", days: [3], dueKey: "2026-10-11" });
  s.sessionReviews = { "adults-choices-skill-1": { "3": { at: "x", correct: 1, total: 3 }, "7": { at: "x", correct: 0, total: 3 } } };
  q = sessionReviewQueue(s, "2026-10-09");
  expect(q.due).toHaveLength(0);
  expect(q.next?.lessonId).toBe("adults-physical-overview");
  expect(sessionReviewQueue(s, "2026-10-22").due.map((d) => d.days)).toEqual([[3, 7], [21]]); // oldest due first
});

test("mastery and goal badges", () => {
  const s = blank();
  expect(earnedProgressBadges(s, "adults")).toEqual([]);
  const ids = ["adults-choices-overview", "adults-choices-skill-1", "adults-choices-skill-2", "adults-choices-skill-3", "adults-choices-skill-4", "adults-choices-skill-5", "adults-choices-quiz"];
  s.mastery = Object.fromEntries(ids.map((id) => [id, pass()]));
  expect(earnedProgressBadges(s, "adults")).toEqual(["first-mastery", "mastery-5", "face-mastered"]);
  const wall = badgeWall(s, "adults");
  expect(wall.filter((b) => b.kind === "progress")).toHaveLength(6);
  expect(wall.find((b) => b.id === "face-mastered")?.earned).toBe(true);
  expect(wall.find((b) => b.id === "first-session")?.earned).toBe(false);
  for (const b of wall) expect(b.name).not.toMatch(/Super-Cube(?!®)/);
});

test("sync keeps mastery, reviews and practices from both devices", () => {
  const a = { ...blank(), lastActivityAt: "2026-10-09T08:00:00.000Z" };
  const b = { ...blank(), lastActivityAt: "2026-10-08T08:00:00.000Z" };
  a.microPracticeLog = { "2026-10-08": ["ch-1"] };
  b.microPracticeLog = { "2026-10-08": ["me-1"] };
  a.sessionCompletedAt = { x: "2026-10-05T08:00:00.000Z" };
  b.sessionCompletedAt = { x: "2026-10-03T08:00:00.000Z", y: "2026-10-04T08:00:00.000Z" };
  a.mastery = { x: pass(3) };
  b.mastery = { x: recordAttempt(recordAttempt(undefined, masteryVerdict(1, 3, "adults"), { retried: false, completed: false }), masteryVerdict(2, 3, "adults"), { retried: true, completed: true }) };
  b.sessionReviews = { x: { "3": { at: "2026-10-06T08:00:00.000Z", correct: 2, total: 3 } } };
  a.weeklyGoal = { target: 5, setAt: "2026-10-01T00:00:00.000Z" };
  b.weeklyGoal = { target: 7, setAt: "2026-10-02T00:00:00.000Z" };
  a.celebratedLevel = 2;
  const m = mergeLmsStates(a, b);
  expect(m.microPracticeLog?.["2026-10-08"]?.sort()).toEqual(["ch-1", "me-1"]);
  expect(m.sessionCompletedAt).toEqual({ x: "2026-10-03T08:00:00.000Z", y: "2026-10-04T08:00:00.000Z" });
  expect(m.mastery?.x.attempts).toBe(2);
  expect(m.mastery?.x.bestCorrect).toBe(3);
  expect(m.sessionReviews?.x?.["3"]?.correct).toBe(2);
  expect(m.weeklyGoal?.target).toBe(7);
  expect(m.celebratedLevel).toBe(2);
});

test("malformed synced review data never turns points into NaN", () => {
  const p = facePoints({
    lessonProgress: { "adults-choices-overview": "completed" },
    mastery: {},
    microPracticeLog: {},
    // e.g. an older client that stored only a timestamp
    sessionReviews: { "adults-choices-overview": { "3": "2026-10-01T08:00:00.000Z" } } as never,
  });
  expect(Number.isFinite(p.choices)).toBe(true);
  expect(p.choices).toBe(10);
});
