import { test, expect } from "@playwright/test";

/**
 * Production smoke tests for Super-Cube®.
 * Run: npx playwright test
 * BASE_URL=https://www.super-cube.me npx playwright test
 */
const base = process.env.BASE_URL || "http://127.0.0.1:3000";

test.describe("Super-Cube smoke", () => {
  test("home loads outcome CTA", async ({ page }) => {
    await page.goto(base + "/");
    await expect(page.locator("h1").first()).toBeVisible();
    await expect(
      page.getByRole("link", { name: /start free baseline/i }).first()
    ).toBeVisible();
  });

  test("privacy and terms", async ({ page }) => {
    await page.goto(base + "/privacy");
    await expect(page.getByText(/journals stay private/i).first()).toBeVisible();
    await page.goto(base + "/terms");
    await expect(page.getByText(/not clinical/i).first()).toBeVisible();
  });

  test("sample report page", async ({ page }) => {
    await page.goto(base + "/sample-report");
    await expect(page.getByText(/anonymised composite/i).first()).toBeVisible();
  });

  test("impact / case stories", async ({ page }) => {
    await page.goto(base + "/impact");
    await expect(page.getByText(/FMCG/i).first()).toBeVisible();
  });

  test("guided start path", async ({ page }) => {
    await page.goto(base + "/learn/start");
    await expect(page.getByText(/first 10 minutes/i).first()).toBeVisible();
  });

  test("insights + practices + facilitator", async ({ page }) => {
    await page.goto(base + "/insights");
    await expect(page.getByText(/leadership is largely learnable/i).first()).toBeVisible();
    await page.goto(base + "/practices");
    await expect(page.getByText(/I–Thou/i).first()).toBeVisible();
    await page.goto(base + "/facilitator");
    await expect(page.getByText(/Week 1/i).first()).toBeVisible();
  });

  test("pricing pilot anchor", async ({ page }) => {
    await page.goto(base + "/pricing");
    await expect(page.getByText(/\$6/i).first()).toBeVisible();
    await expect(page.getByText(/Book a pilot/i).first()).toBeVisible();
  });

  test("the model cube section", async ({ page }) => {
    await page.goto(base + "/the-model");
    await expect(page.getByText(/multidimensional framework/i).first()).toBeVisible();
  });
  test("shared footer: Big Five Group design, real links, newsletter form", async ({ page }) => {
    await page.goto(base + "/");
    const footer = page.locator("footer.site-footer");
    await expect(footer).toHaveCount(1);
    await expect(footer.getByRole("link", { name: /part of big five learn/i })).toHaveAttribute(
      "href",
      "https://bigfivegroup.africa"
    );
    await expect(footer.getByRole("link", { name: /supplieradvisor/i })).toHaveAttribute(
      "href",
      "https://www.supplieradvisor.com"
    );
    await expect(footer.getByRole("link", { name: "Privacy", exact: true }).last()).toBeVisible();
    await expect(footer.getByRole("textbox", { name: /email address/i })).toBeVisible();
    await expect(footer.getByRole("button", { name: /subscribe/i })).toBeVisible();
    await expect(footer.getByText(new RegExp(`© ${new Date().getFullYear()}`))).toBeVisible();
  });
  test("photo heroes match the landing hero size", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    const heroHeight = async (path: string) => {
      await page.goto(base + path);
      return page.locator("main section").first().evaluate((el) => Math.round(el.getBoundingClientRect().height));
    };
    const home = await heroHeight("/");
    for (const path of ["/about", "/the-model", "/organisations", "/research"]) {
      expect(await heroHeight(path), path).toBe(home);
    }
  });

  test("home cube shows the skills on each face", async ({ page }) => {
    await page.goto(base + "/");
    const cube = page.locator(".cube-scene").first();
    await expect(cube.locator(".cube-face__skills")).toHaveCount(6);
    await expect(cube.getByText("Decision-making intelligence")).toHaveCount(1);
    await expect(page.getByRole("list", { name: /faces and the skills/i })).toContainText(
      "Emotional: Emotional intelligence, Empathy, Social relationships, Motivation, Inspiration"
    );
  });
});
