import { test, expect, type Page } from "@playwright/test";

/**
 * Engagement on the server (Phase 1 · Stage 5): streaks, streak freezes, badges, push opt-in
 * and the day-21 calendar invite. Local Supabase stack only (LMS_STACK=1); uses a throwaway learner.
 */
const stack = process.env.LMS_STACK === "1";
const SB_URL = process.env.LMS_SUPABASE_URL || "http://127.0.0.1:54321";
const SERVICE = process.env.LMS_SERVICE_KEY || "";
const PASSWORD = "Local-test-pass-1";
const svc = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}`, "Content-Type": "application/json" };

const profile = {
  displayName: "Habit Tester",
  ageBand: "25-34",
  role: "professional",
  context: "work",
  programmeId: "adults",
  profileCompletedAt: new Date().toISOString(),
};

async function rpc(fn: string, args: Record<string, unknown>) {
  const res = await fetch(`${SB_URL}/rest/v1/rpc/${fn}`, { method: "POST", headers: svc, body: JSON.stringify(args) });
  return { status: res.status, body: await res.json().catch(() => null) };
}

async function signIn(page: Page, email: string) {
  await page.addInitScript((p) => {
    if (!localStorage.getItem("supercube_lms_v1")) {
      localStorage.setItem("supercube_lms_v1", JSON.stringify({ profile: p, user: { email: "", fullName: p.displayName, programmeId: "adults" } }));
    }
  }, profile);
  await page.goto("/login?next=/learn/account");
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(PASSWORD);
  await page.getByRole("button", { name: /sign in/i }).first().click();
  await page.waitForURL((u) => u.pathname.startsWith("/learn/account"));
  await expect.poll(async () => (await page.request.get("/api/lms/engagement")).status(), { timeout: 15_000 }).toBe(200);
}

test.describe("engagement", () => {
  test("signed-out callers can't log activity or read engagement", async ({ request }) => {
    // 401 with Supabase; 503 on a build with no service key (CI)
    const refused = stack ? [401] : [401, 503];
    expect(refused).toContain((await request.post("/api/lms/events", { data: { kind: "pulse" } })).status());
    expect(refused).toContain((await request.get("/api/lms/engagement")).status());
    // Push is off until VAPID keys arrive through the env flow
    expect((await request.post("/api/lms/push", { data: {} })).status()).toBe(501);
  });

  test.describe("with the local stack", () => {
    test.skip(!stack || !SERVICE, "needs the local Supabase stack (LMS_STACK=1, LMS_SERVICE_KEY)");
    test.describe.configure({ mode: "serial" });

    test("streak freezes cover a missed day; the function is service-role only", async () => {
      const created = await fetch(`${SB_URL}/auth/v1/admin/users`, {
        method: "POST",
        headers: svc,
        body: JSON.stringify({ email: `freeze-${Date.now()}@local.test`, password: PASSWORD, email_confirm: true }),
      });
      const uid = ((await created.json()) as { id: string }).id;
      let last: Record<string, unknown> = {};
      for (let d = 1; d <= 7; d++) {
        const r = await rpc("lms_record_activity", { p_user: uid, p_kind: "pulse", p_ref: null, p_programme: "adults", p_minutes: null, p_local_day: `2026-09-0${d}` });
        expect(r.status).toBe(200);
        last = r.body;
      }
      expect(last).toMatchObject({ current: 7, freezes: 1, freezeEarned: true });
      const skip = await rpc("lms_record_activity", { p_user: uid, p_kind: "practice_complete", p_ref: "ch-1", p_programme: "adults", p_minutes: null, p_local_day: "2026-09-09" });
      expect(skip.body).toMatchObject({ current: 8, freezes: 0, freezesUsed: 1 });
      const reset = await rpc("lms_record_activity", { p_user: uid, p_kind: "pulse", p_ref: null, p_programme: "adults", p_minutes: null, p_local_day: "2026-09-12" });
      expect(reset.body).toMatchObject({ current: 1, best: 8 });
      const bad = await rpc("lms_record_activity", { p_user: uid, p_kind: "badge_awarded", p_ref: null, p_programme: null, p_minutes: null, p_local_day: "2026-09-13" });
      expect(bad.status).toBeGreaterThanOrEqual(400);

      // Anonymous key can't call it
      const anon = process.env.LMS_ANON_KEY || "";
      const res = await fetch(`${SB_URL}/rest/v1/rpc/lms_record_activity`, {
        method: "POST",
        headers: { apikey: anon, Authorization: `Bearer ${anon}`, "Content-Type": "application/json" },
        body: JSON.stringify({ p_user: uid, p_kind: "pulse", p_ref: null, p_programme: null, p_minutes: null, p_local_day: "2026-09-14" }),
      });
      expect([401, 403, 404]).toContain(res.status);
    });

    test("a learner's check-in and first session move the streak and award a badge on the server", async ({ page }) => {
      const email = `habit-${Date.now()}@local.test`;
      const created = await fetch(`${SB_URL}/auth/v1/admin/users`, {
        method: "POST",
        headers: svc,
        body: JSON.stringify({ email, password: PASSWORD, email_confirm: true }),
      });
      expect(created.ok).toBe(true);
      await signIn(page, email);

      const tick = await page.request.post("/api/lms/events", { data: { kind: "pulse" } });
      expect(tick.status()).toBe(200);
      expect((await tick.json()).streak).toMatchObject({ current: 1, counted: true });
      const again = await page.request.post("/api/lms/events", { data: { kind: "practice_complete", ref: "ch-1" } });
      expect((await again.json()).streak).toMatchObject({ current: 1, counted: false });
      expect((await page.request.post("/api/lms/events", { data: { kind: "session_complete" } })).status()).toBe(400);
      expect((await page.request.post("/api/lms/events", { data: { kind: "pulse", ref: "<script>" } })).status()).toBe(400);

      const done = await page.request.post("/api/lms/progress", {
        data: { programmeId: "adults", constructId: "choices", lessonId: "adults-choices-overview" },
      });
      expect(done.status()).toBe(200);
      const body = await done.json();
      expect(body.engagement.newBadges).toEqual([{ badgeId: "first-session", name: "First session" }]);
      // Completing the same session again doesn't log a second event or badge
      expect((await (await page.request.post("/api/lms/progress", {
        data: { programmeId: "adults", constructId: "choices", lessonId: "adults-choices-overview" },
      })).json()).engagement).toBeNull();

      // Fresh load (sign-in already landed on the account page)
      await page.goto("/learn");
      await page.goto("/learn/account#habits");
      const panel = page.getByTestId("engagement");
      await expect(panel.getByTestId("streak-current")).toHaveText("1 day");
      await expect(panel.getByTestId("badge-first-session")).toHaveAttribute("data-earned", "true");
      await expect(panel.getByTestId("badge-streak-7")).toHaveAttribute("data-earned", "false");
      await expect(panel.getByTestId("push-off")).toBeVisible();
    });
  });
});

test("day-21 calendar invite downloads as a valid .ics", async ({ page }) => {
  await page.addInitScript((p) => {
    localStorage.setItem(
      "supercube_lms_v1",
      JSON.stringify({
        profile: p,
        lessonProgress: {},
        reflections: {},
        attempts: [
          {
            phase: "pre",
            programmeId: "adults",
            responses: {},
            result: { overall: 3.2, constructScores: [] },
            completedAt: "2026-10-07T08:00:00.000Z",
          },
        ],
      }),
    );
  }, profile);
  await page.goto("/learn/account#habits");
  const button = page.getByTestId("add-to-calendar");
  await expect(button).toContainText("28 Oct 2026");
  const [download] = await Promise.all([page.waitForEvent("download"), button.click()]);
  expect(download.suggestedFilename()).toBe("super-cube-re-measure.ics");
  const path = await download.path();
  const fs = await import("node:fs");
  const ics = fs.readFileSync(path!, "utf8");
  expect(ics).toContain("DTSTART;TZID=Africa/Johannesburg:20261028T090000");
});
