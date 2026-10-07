import { test, expect, type Browser, type Page } from "@playwright/test";

/**
 * Server-backed share links (Phase 1 · Stage 3). Local Supabase stack only (LMS_STACK=1).
 */
const stack = process.env.LMS_STACK === "1";
const SB_URL = process.env.LMS_SUPABASE_URL || "http://127.0.0.1:54321";
const SERVICE = process.env.LMS_SERVICE_KEY || "";
const PASSWORD = "Local-test-pass-1";
const svc = { apikey: SERVICE, Authorization: `Bearer ${SERVICE}`, "Content-Type": "application/json" };

const profile = {
  displayName: "Learner Two",
  ageBand: "25-34",
  role: "professional",
  context: "work",
  programmeId: "adults",
  profileCompletedAt: new Date().toISOString(),
};

async function signIn(page: Page, email: string, who = profile, next = "/learn/report") {
  await page.addInitScript((p) => {
    if (!localStorage.getItem("supercube_lms_v1")) {
      localStorage.setItem("supercube_lms_v1", JSON.stringify({ profile: p, user: { email: "", fullName: p.displayName, programmeId: "adults" } }));
    }
  }, who);
  await page.goto(`/login?next=${next}`);
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(PASSWORD);
  await page.getByRole("button", { name: /sign in/i }).first().click();
  await page.waitForURL((u) => u.pathname.startsWith(next));
  // The session cookie is written by the browser client; wait until the API sees it
  await expect.poll(async () => (await page.request.get("/api/lms/shares")).status(), { timeout: 15_000 }).toBe(200);
}

async function visit(browser: Browser, url: string) {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  const res = await page.goto(url);
  return { ctx, page, res };
}

test.describe("share links", () => {
  test.skip(!stack || !SERVICE, "needs the local Supabase stack (LMS_STACK=1, LMS_SERVICE_KEY)");
  test.describe.configure({ mode: "serial" });

  // Start each run with no links for the test learners (the hourly limit would trip on re-runs)
  test.beforeAll(async () => {
    if (!SERVICE) return;
    await fetch(`${SB_URL}/rest/v1/report_share_links?user_id=not.is.null`, { method: "DELETE", headers: svc });
  });

  test("learner creates an expiring link, a viewer sees scores only, and turning it off works", async ({ page, browser }) => {
    await signIn(page, "learner2@local.test");
    const panel = page.getByTestId("share-links");
    await expect(panel.getByRole("button", { name: "Create link" })).toBeVisible({ timeout: 20_000 });
    await panel.getByLabel(/Who is it for/).fill("E2E coach");
    await panel.getByLabel("Link works for").selectOption("7");
    await panel.getByRole("button", { name: "Create link" }).click();
    const url = await panel.getByTestId("share-fresh").getByLabel("Share link").inputValue();

    // No scores or names in the URL: just a random token
    const token = url.split("/share/report/")[1];
    expect(token).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(url).not.toMatch(/62|71|Learner/);

    const v = await visit(browser, url);
    expect(v.res?.headers()["referrer-policy"]).toBe("no-referrer");
    expect(v.res?.headers()["x-robots-tag"]).toContain("noindex");
    await expect(v.page.getByTestId("share-ok")).toBeVisible();
    await expect(v.page.getByTestId("share-ok")).toContainText("62");
    await expect(v.page.getByTestId("share-ok")).toContainText("71");
    await expect(v.page.getByTestId("share-ok")).toContainText(/stops working on \d{1,2} [A-Z][a-z]{2} \d{4}/);
    await expect(v.page.locator("body")).not.toContainText("PRIVATE JOURNAL");
    await v.ctx.close();

    // The learner sees the view and can turn the link off
    await page.reload();
    const row = panel.getByTestId("share-link-row").filter({ hasText: "E2E coach" });
    await expect(row).toContainText("1 view");
    await row.getByRole("button", { name: /Turn off/ }).click();
    await row.getByRole("button", { name: "Turn off", exact: true }).click();
    await expect(panel.getByTestId("share-link-row").filter({ hasText: "E2E coach" })).toHaveCount(0);

    const after = await visit(browser, url);
    await expect(after.page.getByTestId("share-revoked")).toBeVisible();
    await expect(after.page.locator("body")).not.toContainText("71");
    await after.ctx.close();
  });

  test("expired, unknown and old-format links degrade gracefully", async ({ page, browser }) => {
    await signIn(page, "learner2@local.test");
    const res = await page.request.post("/api/lms/shares", { data: { programmeId: "adults", days: 30 } });
    expect(res.status()).toBe(201);
    const { path, link } = (await res.json()) as { path: string; link: { id: string } };
    // Age the link past its expiry
    const past = new Date(Date.now() - 40 * 86_400_000).toISOString();
    const old = new Date(Date.now() - 86_400_000).toISOString();
    const patch = await fetch(`${SB_URL}/rest/v1/report_share_links?id=eq.${link.id}`, {
      method: "PATCH",
      headers: svc,
      body: JSON.stringify({ created_at: past, expires_at: old }),
    });
    expect(patch.ok).toBe(true);
    const exp = await visit(browser, path.startsWith("http") ? path : new URL(path, page.url()).toString());
    await expect(exp.page.getByTestId("share-expired")).toBeVisible();
    await exp.ctx.close();

    const unknown = await visit(browser, new URL(`/share/report/${"A".repeat(43)}`, page.url()).toString());
    await expect(unknown.page.getByTestId("share-not_found")).toBeVisible();
    await unknown.ctx.close();

    const legacyToken = Buffer.from(
      JSON.stringify({ v: 1, name: "Legacy Person", programmeName: "Adults", preOverall: 48, postOverall: 77, growth: 29, constructs: [], completedAt: "2026-01-01" }),
      "utf8",
    ).toString("base64url");
    const legacy = await visit(browser, new URL(`/share/report/${legacyToken}`, page.url()).toString());
    expect(legacy.res?.status()).toBeLessThan(500);
    await expect(legacy.page.getByTestId("share-legacy")).toBeVisible();
    await expect(legacy.page.locator("body")).not.toContainText("Legacy Person");
    await expect(legacy.page.locator("body")).not.toContainText("77");
    await legacy.ctx.close();
  });

  test("access rules: no anonymous creation, no turning off someone else's link, minors need consent", async ({ browser, request }) => {
    const anon = await request.post("/api/lms/shares", { data: { programmeId: "adults" } });
    expect(anon.status()).toBe(401);
    const anonList = await request.get("/api/lms/shares");
    expect(anonList.status()).toBe(401);

    // learner2 makes a link; learner1 can't turn it off (separate browsers per person)
    let ctx = await browser.newContext();
    let page = await ctx.newPage();
    await signIn(page, "learner2@local.test");
    const made = await page.request.post("/api/lms/shares", { data: { programmeId: "adults", days: 7 } });
    const { link } = (await made.json()) as { link: { id: string } };
    await ctx.close();
    ctx = await browser.newContext();
    page = await ctx.newPage();
    await signIn(page, "learner1@local.test");
    const steal = await page.request.delete(`/api/lms/shares/${link.id}`);
    expect(steal.status()).toBe(404);
    const mine = (await (await page.request.get("/api/lms/shares")).json()) as { links: { id: string }[] };
    expect(mine.links.map((l) => l.id)).not.toContain(link.id);

    // Tokens are stored hashed: the table never holds a usable token
    const rows = (await (await fetch(`${SB_URL}/rest/v1/report_share_links?id=eq.${link.id}&select=token_hash`, { headers: svc })).json()) as { token_hash: string }[];
    expect(rows[0].token_hash).toMatch(/^[0-9a-f]{64}$/);

    // Under-18 without guardian consent can't share
    await ctx.close();
    ctx = await browser.newContext();
    page = await ctx.newPage();
    const teenProfile = { ...profile, displayName: "Teen One", ageBand: "13-17", role: "student", context: "school", programmeId: "adolescents" };
    const teenUser = (await (await fetch(`${SB_URL}/rest/v1/profiles?email=eq.teen1@local.test&select=id`, { headers: svc })).json()) as { id: string }[];
    if (teenUser[0]) {
      await fetch(`${SB_URL}/rest/v1/learner_state?user_id=eq.${teenUser[0].id}`, {
        method: "PATCH",
        headers: svc,
        body: JSON.stringify({ payload: { profile: teenProfile } }),
      });
    }
    await signIn(page, "teen1@local.test", teenProfile, "/learn/account");
    const teen = await page.request.post("/api/lms/shares", { data: { programmeId: "adolescents" } });
    expect(teen.status()).toBe(403);
    expect(((await teen.json()) as { error: string }).error).toBe("consent_required");
    await ctx.close();
  });
});
