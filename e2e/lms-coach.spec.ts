import { test, expect, type Page } from "@playwright/test";
import fs from "node:fs";

/**
 * Coach / cohort dashboard (Phase 1 · Stage 6). Local Supabase stack only (LMS_STACK=1).
 * Seeds a throwaway cohort through the service API: one coach, five learners (four sharing).
 */
const stack = process.env.LMS_STACK === "1";
const SB_URL = process.env.LMS_SUPABASE_URL || "http://127.0.0.1:54321";
const SERVICE = process.env.LMS_SERVICE_KEY || "";
const PASSWORD = "Local-test-pass-1";
const svc = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}`, "Content-Type": "application/json", Prefer: "return=representation" };

async function user(email: string): Promise<string> {
  const r = await fetch(`${SB_URL}/auth/v1/admin/users`, { method: "POST", headers: svc, body: JSON.stringify({ email, password: PASSWORD, email_confirm: true }) });
  expect(r.ok).toBe(true);
  return ((await r.json()) as { id: string }).id;
}
async function insert(table: string, rows: unknown) {
  const r = await fetch(`${SB_URL}/rest/v1/${table}`, { method: "POST", headers: svc, body: JSON.stringify(rows) });
  if (!r.ok) throw new Error(`${table}: ${r.status} ${await r.text()}`);
  return r.json();
}
const ago = (d: number) => new Date(Date.now() - d * 86_400_000).toISOString();
const faces = ["choices", "principles", "mental", "emotional", "physical", "spiritual"];
const faceScores = (pre: number, post: number | null) =>
  Object.fromEntries(faces.map((f, i) => [f, post == null ? { pre: pre + i } : { pre: pre + i, post: post + i }]));

async function signIn(page: Page, email: string, next: string) {
  await page.addInitScript(() => {
    if (!localStorage.getItem("supercube_lms_v1")) {
      localStorage.setItem(
        "supercube_lms_v1",
        JSON.stringify({ profile: { displayName: "Coach Nomsa", ageBand: "35-44", role: "educator", context: "school", programmeId: "adults", profileCompletedAt: new Date().toISOString() } }),
      );
    }
  });
  await page.goto(`/login?next=${encodeURIComponent(next)}`);
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(PASSWORD);
  await page.getByRole("button", { name: /sign in/i }).first().click();
  await page.waitForURL((u) => u.pathname.startsWith("/learn/coach"));
}

test.describe("coach cohort impact", () => {
  test.skip(!stack || !SERVICE, "needs the local Supabase stack (LMS_STACK=1, LMS_SERVICE_KEY)");

  test("before/after with CIs and d, funnel, at-risk learners, CSV and PDF packs", async ({ page }) => {
    const stamp = Date.now();
    const code = `E2E${String(stamp).slice(-6)}`;
    const coachEmail = `coach-${stamp}@local.test`;
    const coach = await user(coachEmail);
    const ids = await Promise.all([1, 2, 3, 4, 5].map((i) => user(`cohort${i}-${stamp}@local.test`)));
    const [org] = (await insert("organisations", { code, name: "E2E Pilot School", kind: "school", owner_user_id: coach })) as { id: string }[];
    await insert("org_members", [
      { org_id: org.id, user_id: coach, role: "coach", display_name: "Coach", joined_at: ago(45) },
      { org_id: org.id, user_id: ids[0], role: "learner", display_name: "Amahle", joined_at: ago(40) },
      { org_id: org.id, user_id: ids[1], role: "learner", display_name: "Ben", joined_at: ago(35) },
      { org_id: org.id, user_id: ids[2], role: "learner", display_name: "Chen", joined_at: ago(30) },
      { org_id: org.id, user_id: ids[3], role: "learner", display_name: "Dineo", joined_at: ago(25) },
      { org_id: org.id, user_id: ids[4], role: "learner", display_name: "Eli", joined_at: ago(2) },
    ]);
    const snap = (uid: string, pre: number | null, post: number | null, extra: Record<string, unknown>) => ({
      org_id: org.id,
      user_id: uid,
      programme_id: "adults",
      pre_overall: pre,
      post_overall: post,
      growth: pre != null && post != null ? post - pre : null,
      face_scores: pre == null ? {} : faceScores(pre, post),
      certificate_id: null,
      client_updated_at: ago(1),
      updated_at: new Date().toISOString(),
      ...extra,
    });
    await insert("org_progress_snapshots", [
      snap(ids[0], 50, 62, { lessons_completed: 40, pathway_pct: 90 }),
      snap(ids[1], 55, 61, { lessons_completed: 38, pathway_pct: 85 }),
      snap(ids[2], 60, 70, { lessons_completed: 30, pathway_pct: 70 }),
      snap(ids[3], null, null, { lessons_completed: 0, pathway_pct: 0, client_updated_at: ago(20) }),
    ]);

    await signIn(page, coachEmail, `/learn/coach?code=${code}`);
    const impact = page.getByTestId("cohort-impact");
    await expect(impact).toBeVisible({ timeout: 15_000 });
    await expect(impact).toContainText("5 learners");

    // Overall: pre 50/55/60 → post 62/61/70; change +9.3
    const overall = impact.getByTestId("impact-overall");
    await expect(overall).toContainText("3");
    await expect(overall).toContainText("+9.3");
    // d_av = 9.33 / mean(sd 5, sd 4.93) = 1.88 (checked with Python statistics)
    await expect(impact.getByTestId("impact-choices")).toContainText("1.88");
    await expect(impact.getByTestId("impact-choices")).toContainText("large");
    // Funnel: joined 5, sharing 4, baseline 3, started 3, halfway 3, re-measured 3, certified 0
    const funnel = impact.getByTestId("funnel");
    await expect(funnel.locator("li").nth(0)).toContainText("5 · 100%");
    await expect(funnel.locator("li").nth(1)).toContainText("4 · 80%");
    await expect(funnel.locator("li").nth(5)).toContainText("3 · 60%");
    // Dineo has no baseline after 25 days and has been quiet; Eli is new and not sharing
    const risk = impact.getByTestId("at-risk");
    await expect(risk).toContainText("Dineo");
    await expect(risk).toContainText("No baseline 25 days after joining");
    await expect(risk).not.toContainText("Eli");

    const [csv] = await Promise.all([page.waitForEvent("download"), impact.getByTestId("roi-csv").click()]);
    const text = fs.readFileSync((await csv.path())!, "utf8");
    expect(text).toContain("Overall,3,55.0");
    expect(text).not.toContain("Dineo");
    const [pdf] = await Promise.all([page.waitForEvent("download"), impact.getByTestId("roi-pdf").click()]);
    expect(pdf.suggestedFilename()).toBe(`super-cube-roi-${code}.pdf`);
    expect(fs.readFileSync((await pdf.path())!).subarray(0, 5).toString()).toBe("%PDF-");
  });
});
