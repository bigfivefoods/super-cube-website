import { test, expect } from "@playwright/test";
import {
  atRiskLearners,
  ci95,
  effectLabel,
  funnel,
  pairedSummary,
  roiCsv,
  sd,
  tCritical95,
  type CohortLearner,
} from "@/lib/lms/cohort-stats";

test("t critical values and CI by hand", () => {
  expect(tCritical95(4)).toBe(2.776);
  expect(tCritical95(200)).toBe(1.96);
  // xs = 10, 20, 30, 40, 50: mean 30, sd 15.811, se 7.071, half 19.63
  const c = ci95([10, 20, 30, 40, 50]);
  expect(sd([10, 20, 30, 40, 50])).toBeCloseTo(15.8114, 3);
  expect(c.mean).toBe(30);
  expect(c.low).toBeCloseTo(30 - 19.6296, 3);
  expect(c.high).toBeCloseTo(30 + 19.6296, 3);
});

test("paired summary and Cohen's d_av", () => {
  expect(pairedSummary([{ pre: 50, post: 60 }, { pre: 55, post: 65 }])).toBeNull(); // under 3: suppressed
  const r = pairedSummary([
    { pre: 50, post: 60 },
    { pre: 60, post: 64 },
    { pre: 70, post: 82 },
    { pre: 40, post: 50 },
  ])!;
  expect(r.n).toBe(4);
  expect(r.change.mean).toBe(9);
  // sd(pre)=12.9099, sd(post)=13.3666 → s_av=13.1383 → d=0.6850 (checked with Python statistics.stdev)
  expect(r.d!).toBeCloseTo(0.685, 3);
  expect(r.label).toBe("medium");
  expect(effectLabel(-0.9)).toBe("large");
});

const now = new Date("2026-10-07T08:00:00Z");
const days = (n: number) => new Date(now.getTime() - n * 86_400_000).toISOString();
const rows: CohortLearner[] = [
  { userId: "c", displayName: "Coach", role: "coach", joinedAt: days(40), progress: null },
  { userId: "a", displayName: "Amahle", role: "learner", joinedAt: days(30), progress: { pre_overall: 50, post_overall: 62, growth: 12, lessons_completed: 30, pathway_pct: 70, certificate_id: "SC-1", client_updated_at: days(1) } },
  { userId: "b", displayName: "Ben", role: "learner", joinedAt: days(25), progress: { pre_overall: null, lessons_completed: 0, pathway_pct: 0, client_updated_at: days(20) } },
  { userId: "d", displayName: "Dineo", role: "learner", joinedAt: days(10), progress: { pre_overall: 60, post_overall: 52, growth: -8, lessons_completed: 3, pathway_pct: 10, client_updated_at: days(2) } },
  { userId: "e", displayName: "Eli", role: "learner", joinedAt: days(3), progress: null },
];

test("funnel counts learners only", () => {
  const f = funnel(rows);
  expect(f.map((s) => s.count)).toEqual([4, 3, 2, 2, 1, 2, 1]);
  expect(f[0].pct).toBe(100);
});

test("at-risk flags are specific and only for learners who share progress", () => {
  const r = atRiskLearners(rows, now);
  expect(r.map((x) => x.userId)).toEqual(["b", "d"]);
  expect(r[0].reasons).toEqual(["No baseline 25 days after joining", "Quiet for 20 days", "0% of sessions after 3 weeks"]);
  expect(r[1].reasons).toEqual(["Overall score down 8 points since baseline"]);
});

test("ROI CSV is aggregate-only and formula-safe", () => {
  const csv = roiCsv({ cohortName: "=HYPERLINK(\"x\")", generatedAt: "7 Oct 2026", faces: [{ id: "choices", name: "Choices", result: null }], overall: null, funnel: funnel(rows) });
  expect(csv).toContain(`"'=HYPERLINK(""x"")"`);
  expect(csv).toContain("Choices,fewer than 3");
  expect(csv).not.toContain("Amahle");
});
