import { expect, test } from "@playwright/test";

/** UI checks with the API mocked; access control is enforced by org_results() in Postgres. */
const results = {
  org: { id: "00000000-0000-4000-8000-000000000001", name: "Acme Holdings", code: "ACME26", kind: "company" },
  min_group: 3,
  generated_at: "2026-10-19T08:00:00Z",
  members: { learners: 8, staff: 2 },
  funnel: { joined: 8, consented: 7, baseline: 6, started: 6, halfway: 4, completed: 1, remeasured: 5, certified: 3 },
  engagement: { active_7d: 4, active_30d: 6, sessions_completed: 155, avg_session_share: 0.48, median_streak: 5, minutes_30d: 120, weekly_active: [{ week: "2026-10-12", active: 4 }] },
  overall: { n: 5, pre_mean: 48.3, pre_sd: 3.57, post_mean: 56.1, post_sd: 3.67, diff_mean: 7.8, diff_sd: 1.15 },
  faces: [{ face: "principles", n: 5, pre_mean: 49.2, pre_sd: 7.92, post_mean: 62, post_sd: 8.09, diff_mean: 12.8, diff_sd: 3.96 }],
};

test.describe("organisation results", () => {
  test("admins see faces, funnel, engagement and can download the CSV", async ({ page }) => {
    await page.route("**/api/org/results**", (r) => r.fulfill({ json: { orgs: [results.org], results } }));
    await page.goto("/learn/org/results");
    test.skip(page.url().includes("/login"), "Supabase-gated build: covered by the signed-in stack run");
    await expect(page.getByTestId("org-results")).toBeVisible();
    await expect(page.getByText("Acme Holdings")).toBeVisible();
    await expect(page.locator('[data-face="principles"]')).toContainText("+12.8");
    await expect(page.locator('[data-face="emotional"]')).toContainText("shown once 3+");
    await expect(page.getByTestId("org-results-funnel")).toContainText("Certified");
    const dl = page.waitForEvent("download");
    await page.getByTestId("org-results-csv").click();
    expect((await dl).suggestedFilename()).toBe("super-cube-results-ACME26.csv");
  });

  test("non-admins get a plain refusal", async ({ page }) => {
    await page.route("**/api/org/results**", (r) => r.fulfill({ status: 403, json: { error: "not_admin", orgs: [] } }));
    await page.goto("/learn/org/results");
    test.skip(page.url().includes("/login"), "Supabase-gated build: covered by the signed-in stack run");
    await expect(page.getByTestId("org-results-notice")).toContainText("Organisation admins only");
  });
});
