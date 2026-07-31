import { test, expect } from "@playwright/test";

/**
 * Production smoke tests for Super-Cube®.
 * Run: npx playwright test
 * BASE_URL=https://www.super-cube.me npx playwright test
 */
const base = process.env.BASE_URL || "http://127.0.0.1:3000";

test.describe("Super-Cube smoke", () => {
  test("home loads", async ({ page }) => {
    await page.goto(base + "/");
    await expect(page.locator("h1").first()).toBeVisible();
    await expect(page.getByRole("link", { name: /explore the model/i })).toBeVisible();
  });

  test("sample report page", async ({ page }) => {
    await page.goto(base + "/sample-report");
    await expect(page.getByText(/illustrative/i).first()).toBeVisible();
  });

  test("impact / case stories", async ({ page }) => {
    await page.goto(base + "/impact");
    await expect(page.getByText(/FMCG/i).first()).toBeVisible();
  });

  test("learn demo unlock path", async ({ page }) => {
    await page.goto(base + "/learn/demo");
    await expect(page.getByText(/try super-cube/i)).toBeVisible();
    await page.getByRole("button", { name: /start free demo/i }).first().click();
    await page.waitForURL(/\/learn\/(onboarding|assessment)/);
  });

  test("pricing page", async ({ page }) => {
    await page.goto(base + "/pricing");
    await expect(page.getByText(/\$6/i).first()).toBeVisible();
  });

  test("the model cube section", async ({ page }) => {
    await page.goto(base + "/the-model");
    await expect(page.getByText(/multidimensional framework/i).first()).toBeVisible();
  });
});
