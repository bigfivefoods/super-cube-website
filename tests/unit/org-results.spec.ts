import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import path from "node:path";
import { completionRate, faceRows, funnelRows, orgResultsCsv, overallRow, statsRow, type OrgResultsRaw } from "@/lib/lms/org-results";

const ROOT = path.resolve(__dirname, "../..");

const raw: OrgResultsRaw = {
  org: { id: "o1", name: "=HYPERLINK(\"x\")", code: "ACME", kind: "company" },
  min_group: 3,
  generated_at: "2026-10-19T08:00:00Z",
  members: { learners: 8, staff: 2 },
  funnel: { joined: 8, consented: 7, baseline: 6, started: 6, halfway: 4, completed: 1, remeasured: 5, certified: 3 },
  engagement: {
    active_7d: 4,
    active_30d: 6,
    sessions_completed: 155,
    avg_session_share: 0.48,
    median_streak: 5,
    minutes_30d: 120,
    weekly_active: [{ week: "2026-10-12", active: 4 }],
  },
  overall: { n: 5, pre_mean: 48.3, pre_sd: 3.57, post_mean: 56.1, post_sd: 3.67, diff_mean: 7.8, diff_sd: 1.15 },
  faces: [
    { face: "principles", n: 5, pre_mean: 49.2, pre_sd: 7.92, post_mean: 62, post_sd: 8.09, diff_mean: 12.8, diff_sd: 3.96 },
    { face: "emotional", n: 2, suppressed: true },
  ],
};

test("face rows keep model order, suppress small groups and compute CIs and d_av", () => {
  const rows = faceRows(raw);
  expect(rows.map((r) => r.id)).toEqual(["choices", "principles", "mental", "emotional", "physical", "spiritual"]);
  const p = rows[1];
  expect(p.suppressed).toBe(false);
  expect(p.change!.mean).toBeCloseTo(12.8, 5);
  // t(4) = 2.776; half-width = 2.776 * 3.96 / sqrt(5)
  expect(p.change!.high - p.change!.mean).toBeCloseTo((2.776 * 3.96) / Math.sqrt(5), 3);
  expect(p.d!).toBeCloseTo(12.8 / ((7.92 + 8.09) / 2), 5);
  expect(p.label).toBe("large");
  expect(rows[3]).toMatchObject({ id: "emotional", suppressed: true, n: 2 });
  expect(rows[0]).toMatchObject({ id: "choices", suppressed: true, n: 0 });
  expect(overallRow(raw).suppressed).toBe(false);
});

test("a row below the minimum group is suppressed even if stats are present", () => {
  expect(statsRow({ n: 2, pre_mean: 1, post_mean: 2, diff_mean: 1 }, { id: "x", name: "X", color: "#000" }).suppressed).toBe(true);
});

test("funnel percentages and completion rate", () => {
  const f = funnelRows(raw);
  expect(f[0]).toMatchObject({ key: "joined", count: 8, pct: 100 });
  expect(f.find((s) => s.key === "certified")).toMatchObject({ count: 3, pct: 38 });
  expect(completionRate(raw)).toBe(83);
  expect(completionRate({ ...raw, funnel: { ...raw.funnel, baseline: 0 } })).toBeNull();
});

test("CSV is aggregate-only, Super-Cube® branded and formula-safe", () => {
  const csv = orgResultsCsv(raw);
  expect(csv.startsWith("Super-Cube® organisation results")).toBe(true);
  expect(csv).toContain(`"'=HYPERLINK(""x"")"`);
  expect(csv).toContain("Emotional,fewer than 3");
  expect(csv).not.toMatch(/@|user_id|email/i);
});

test("org_results() checks org admin, revokes anon and returns no identifiers", () => {
  const sql = readFileSync(path.join(ROOT, "supabase/migrations/20261019110000_org_results.sql"), "utf8");
  expect(sql).toContain("private.is_org_admin(p_org)");
  expect(sql).toMatch(/revoke all on function public\.org_results\(uuid, jsonb\) from public, anon/);
  const body = sql.slice(sql.indexOf("select jsonb_build_object("));
  expect(body).not.toMatch(/'user_id'|display_name|email|learner_name/);
});

test("org_results() counts only learners who currently share, and staff RLS follows the same flag", () => {
  const sql = readFileSync(path.join(ROOT, "supabase/migrations/20261019110000_org_results.sql"), "utf8");
  expect(sql).toMatch(/s\.org_id = p_org and s\.user_id = l\.user_id and s\.sharing/);
  const consent = readFileSync(path.join(ROOT, "supabase/migrations/20261019105000_org_sharing_consent.sql"), "utf8");
  expect(consent).toMatch(/add column if not exists sharing boolean not null default true/);
  expect(consent).toMatch(/using \(user_id = auth\.uid\(\) or \(sharing and private\.is_org_staff\(org_id\)\)\)/);
  const api = readFileSync(path.join(ROOT, "src/app/api/org/progress/route.ts"), "utf8");
  expect(api).toContain("sharing: false");
  expect(api).not.toContain('reason: "no_consent"');
});

test("a later 'stop sharing' wins a cloud merge over an older 'share'", async () => {
  const { mergeShareConsent } = await import("@/lib/lms/sync");
  type S = Parameters<typeof mergeShareConsent>[0];
  const on = { shareProgressWithCoach: true, shareProgressChangedAt: "2026-10-01T08:00:00Z" } as S;
  const off = { shareProgressWithCoach: false, shareProgressChangedAt: "2026-10-18T08:00:00Z" } as S;
  expect(mergeShareConsent(on, off).shareProgressWithCoach).toBe(false);
  expect(mergeShareConsent(off, on).shareProgressWithCoach).toBe(false);
  expect(mergeShareConsent({ ...on, shareProgressChangedAt: "2026-10-19T08:00:00Z" } as S, off).shareProgressWithCoach).toBe(true);
  // legacy states without a timestamp keep the old rule
  expect(mergeShareConsent({ shareProgressWithCoach: true } as S, { shareProgressWithCoach: false } as S).shareProgressWithCoach).toBe(true);
  // an explicit, timestamped "off" beats a legacy "on"
  expect(mergeShareConsent({ shareProgressWithCoach: true } as S, off).shareProgressWithCoach).toBe(false);
});
