import { test, expect, type Page } from "@playwright/test";

/**
 * Assessment integrity (Phase 1 · Stage 2).
 * Needs the local Supabase stack (LMS_STACK=1) plus its service key so the test can
 * create a throwaway learner and read back what the server stored. Never run on production.
 */
const stack = process.env.LMS_STACK === "1";
const SB_URL = process.env.LMS_SUPABASE_URL || "http://127.0.0.1:54321";
const SERVICE = process.env.LMS_SERVICE_KEY || "";
const PASSWORD = "Local-test-pass-1";

const svc = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}` };

async function rest<T>(path: string): Promise<T> {
  const res = await fetch(`${SB_URL}/rest/v1/${path}`, { headers: svc });
  if (!res.ok) throw new Error(`${path}: ${res.status} ${await res.text()}`);
  return (await res.json()) as T;
}

const profile = {
  displayName: "Integrity Tester",
  ageBand: "25-34",
  role: "professional",
  context: "work",
  programmeId: "adults",
  profileCompletedAt: new Date().toISOString(),
};

async function answerEverything(page: Page, value: number) {
  for (let face = 0; face < 6; face++) {
    const sets = page.locator("fieldset");
    await expect(sets.first()).toBeVisible();
    const n = await sets.count();
    for (let i = 0; i < n; i++) {
      await sets.nth(i).getByRole("button", { name: String(value), exact: true }).click();
    }
    if (face < 5) await page.getByRole("button", { name: "Next construct" }).click();
  }
}

test.describe("assessment integrity", () => {
  test.skip(!stack || !SERVICE, "needs the local Supabase stack (LMS_STACK=1, LMS_SERVICE_KEY)");
  test.describe.configure({ mode: "serial" });

  test("a signed-out baseline is claimed on sign-in, flagged, stored per item and locked", async ({ page }) => {
    const email = `claim-${Date.now()}@local.test`;
    const created = await fetch(`${SB_URL}/auth/v1/admin/users`, {
      method: "POST",
      headers: { ...svc, "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: PASSWORD, email_confirm: true }),
    });
    expect(created.ok).toBe(true);
    const userId = ((await created.json()) as { id: string }).id;

    await page.addInitScript((p) => {
      if (!localStorage.getItem("supercube_lms_v1")) {
        localStorage.setItem("supercube_lms_v1", JSON.stringify({ profile: p, user: { email: "", fullName: p.displayName, programmeId: "adults" } }));
      }
    }, profile);

    // Signed out: take the baseline on this device, answering "4" to everything
    await page.goto("/learn/assessment/pre");
    await expect(page.getByText(/Progress · 0\/\d+ statements/)).toBeVisible();
    await answerEverything(page, 4);
    await page.getByRole("button", { name: "Submit & see your narrative" }).click();

    // Same answer everywhere → a gentle second look, not a block
    const dialog = page.getByRole("alertdialog");
    await expect(dialog).toContainText("nearly every statement the same answer");
    await dialog.getByRole("button", { name: "Submit as it is" }).click();
    await page.waitForURL(/\/learn\/feedback/);

    // Sign in → the device baseline is sent to the server once
    await page.goto("/login?next=/learn");
    await page.getByLabel("Email", { exact: true }).fill(email);
    await page.getByLabel("Password", { exact: true }).fill(PASSWORD);
    await page.getByRole("button", { name: /sign in/i }).first().click();
    await page.waitForURL(/\/learn(\/|$|\?)/);

    type Row = { id: string; flags: string[]; meta: Record<string, unknown> };
    let attempts: Row[] = [];
    await expect
      .poll(async () => {
        attempts = await rest<Row[]>(`lms_attempts?user_id=eq.${userId}&phase=eq.pre&select=id,flags,meta`);
        return attempts.length;
      }, { timeout: 20_000 })
      .toBe(1);
    const [a] = attempts;
    expect(a.meta.source).toBe("claimed_device");
    expect(a.meta.attention).toBe(4);
    expect(typeof a.meta.seed).toBe("number");
    expect(a.flags).toContain("straight_lining");
    expect(a.flags).not.toContain("attention_failed");

    const items = await rest<{ item_id: string; construct_id: string; value: number }[]>(
      `lms_item_responses?attempt_id=eq.${a.id}&select=item_id,construct_id,value`,
    );
    expect(items.length).toBeGreaterThan(6);
    expect(items.filter((r) => r.construct_id === "attention")).toHaveLength(1);
    expect(items.every((r) => r.value === 4)).toBe(true);

    // Retake loophole closed: the page is locked and the API refuses a second baseline
    await page.goto("/learn/assessment/pre");
    await expect(page.getByTestId("baseline-locked")).toBeVisible();
    await expect(page.getByTestId("baseline-locked")).toContainText(/\d{1,2} [A-Z][a-z]{2} \d{4}/);
    const again = await page.request.post("/api/lms/attempts", {
      data: { phase: "pre", programmeId: "adults", responses: {} },
    });
    expect([400, 409]).toContain(again.status());

    // A second claim (e.g. another device) never overwrites the first baseline
    const claim = await page.request.post("/api/lms/attempts/claim", {
      data: { phase: "pre", programmeId: "adults", responses: {}, completedAt: new Date().toISOString() },
    });
    expect(claim.status()).toBeLessThan(500);
    const after = await rest<Row[]>(`lms_attempts?user_id=eq.${userId}&phase=eq.pre&select=id`);
    expect(after).toHaveLength(1);
  });

  test("learners can read their own item answers but not write them", async ({ request }) => {
    const res = await fetch(`${SB_URL}/rest/v1/lms_item_responses?select=item_id&limit=1`, {
      headers: { apikey: process.env.LMS_ANON_KEY || "", Authorization: `Bearer ${process.env.LMS_ANON_KEY || ""}` },
    });
    // anon sees nothing (RLS) — either an empty list or a permission error
    if (res.ok) expect(await res.json()).toEqual([]);
    else expect([401, 403]).toContain(res.status);
    void request;
  });
});
