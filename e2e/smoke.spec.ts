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

  test("pricing: each programme card has its own colour band", async ({ page }) => {
    await page.goto(base + "/pricing");
    const bgs: string[] = [];
    for (const id of ["kids", "adolescents", "adults"]) {
      const band = page.getByTestId(`programme-band-${id}`);
      await expect(band).toBeVisible();
      await expect(band.getByRole("heading", { level: 2 })).toBeVisible();
      bgs.push(await band.evaluate((el) => getComputedStyle(el).backgroundImage));
    }
    expect(new Set(bgs).size).toBe(3);
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

  test("The Model mega-menu: six faces, keyboard and Esc", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(base + "/research");
    const button = page.locator("#model-menu-button");
    await expect(button).toHaveText(/The Model/);
    await expect(button).toHaveAttribute("aria-expanded", "false");
    await button.focus();
    await page.keyboard.press("Enter");
    await expect(button).toHaveAttribute("aria-expanded", "true");
    const panel = page.locator("#model-menu");
    for (const face of ["Choices", "Principles", "Mental", "Emotional", "Physical", "Spiritual"]) {
      await expect(panel.getByRole("link", { name: new RegExp(`^${face}`) })).toHaveAttribute(
        "href",
        `/constructs#${face.toLowerCase()}`
      );
    }
    await expect(panel.getByText("Decision-making intelligence · Moral values · Judgement · Risk-taking")).toBeVisible();
    await expect(panel.getByRole("link", { name: /model overview/i })).toHaveAttribute("href", "/the-model");
    await expect(panel.getByRole("link", { name: /research & evidence/i })).toHaveAttribute("href", "/research");
    await expect(panel.getByRole("link", { name: /free baseline assessment/i })).toHaveAttribute("href", "/learn/start");
    await page.keyboard.press("Escape");
    await expect(button).toHaveAttribute("aria-expanded", "false");
    await expect(button).toBeFocused();
  });

  test("mobile menu: The Model expands to the six faces", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(base + "/");
    await page.locator('button[aria-controls="mobile-nav"]').click();
    const toggle = page.locator('button[aria-controls="mobile-model"]');
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await expect(page.locator("#mobile-model").getByRole("link", { name: /^Spiritual/ })).toBeVisible();
  });

  test("breadcrumbs: labelled trail with JSON-LD, none on home", async ({ page }) => {
    await page.goto(base + "/constructs");
    const crumbs = page.getByRole("navigation", { name: "Breadcrumb" });
    await expect(crumbs.locator("ol > li")).toHaveCount(3);
    await expect(crumbs.getByRole("link", { name: "Home" })).toHaveAttribute("href", "/");
    await expect(crumbs.getByRole("link", { name: "The Model" })).toHaveAttribute("href", "/the-model");
    await expect(crumbs.locator('[aria-current="page"]')).toHaveText("Six faces");
    const ld = await page.locator('script[type="application/ld+json"]').allTextContents();
    expect(ld.some((j) => j.includes('"BreadcrumbList"') && j.includes("https://www.super-cube.me/constructs"))).toBe(true);
    await page.goto(base + "/");
    await expect(page.getByRole("navigation", { name: "Breadcrumb" })).toHaveCount(0);
  });
});
