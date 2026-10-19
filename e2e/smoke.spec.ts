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

  test("home hero: company profile PDF download next to the primary CTA", async ({ page }) => {
    await page.goto(base + "/");
    const hero = page.locator("main section").first();
    const primary = hero.getByRole("link", { name: /start free baseline/i });
    const pdf = hero.getByRole("link", { name: /^download company profile/i });
    await expect(pdf).toBeVisible();
    await expect(pdf).toHaveAttribute("href", "/super-cube-company-profile.pdf");
    await expect(pdf).toHaveAttribute("download", "");
    await expect(pdf).toHaveAccessibleName(/^Download company profile \(PDF, 16 pages, [\d.]+ MB\)$/);
    await expect(pdf).toContainText("16 pages · PDF");
    // Secondary sits straight after the primary CTA.
    const order = await hero.locator("a").evaluateAll((els) => els.map((e) => e.getAttribute("href")));
    expect(order.indexOf("/super-cube-company-profile.pdf")).toBe(order.indexOf("/learn/start") + 1);
    for (const width of [1280, 1024, 768, 390]) {
      await page.setViewportSize({ width, height: width < 640 ? 844 : 900 });
      const box = await pdf.boundingBox();
      const primaryBox = await primary.boundingBox();
      // 44px target, one line of text (no wrapping inside the button), inside the viewport.
      expect(box!.height, `${width}px`).toBeGreaterThanOrEqual(44);
      expect(box!.height, `${width}px`).toBeLessThanOrEqual(primaryBox!.height + 1);
      expect(box!.x + box!.width, `${width}px`).toBeLessThanOrEqual(width);
    }
    const res = await page.request.get(base + "/super-cube-company-profile.pdf");
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toContain("application/pdf");
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
    // /learn/start needs a finished profile. Seed one so the test waits for the real
    // guided path, not the loading title that shows before the client redirects.
    await page.addInitScript(() => {
      localStorage.setItem(
        "supercube_lms_v1",
        JSON.stringify({
          profile: {
            displayName: "Thandi Smoke",
            ageBand: "35-44",
            role: "manager",
            context: "company",
            programmeId: "adults",
            profileCompletedAt: "2026-10-01T08:00:00.000Z",
          },
        }),
      );
    });
    await page.goto(base + "/learn/start");
    await expect(page.getByText("Recommended next")).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(/^Thandi, your first \d+ minutes$/);
    await expect(page.getByRole("link", { name: "Continue →" })).toBeVisible();
  });

  test("guided start sends a visitor without a profile to the welcome step", async ({ page }) => {
    await page.goto(base + "/learn/start");
    await expect(page).toHaveURL(/\/learn\/welcome/, { timeout: 15000 });
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(/tell us about you/i);
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
      const card = page.getByTestId(`programme-card-${id}`);
      await expect(card.getByText("· Lifetime access", { exact: true })).toBeVisible();
      await expect(card.getByText(/R99\s*· lifetime access/)).toBeVisible();
      bgs.push(await band.evaluate((el) => getComputedStyle(el).backgroundImage));
    }
    expect(new Set(bgs).size).toBe(3);
    await expect(page.locator("#pilot")).toContainText("Each seat is lifetime access");
    // Checkout is closed until a Buy button is pressed
    await expect(page.locator("dialog[open]")).toHaveCount(0);
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
    // Big Five Group column, legal links and contact match bigfivegroup.africa (#69)
    for (const [name, href] of [
      [/^Big Five Group™/, "https://bigfivegroup.africa"],
      [/^Big Five Learn/, "https://bigfivegroup.africa/leadership"],
      [/^SupplierAdvisor®/, "https://www.supplieradvisor.com"],
      [/^PAIA/, "https://bigfivegroup.africa/paia"],
      [/^Accessibility/, "https://bigfivegroup.africa/accessibility"],
      [/^WhatsApp/, /^https:\/\/wa\.me\/27825814215/],
    ] as const) {
      await expect(footer.getByRole("link", { name }).first(), String(name)).toHaveAttribute("href", href);
    }
    await expect(footer.getByRole("link", { name: /\+27 \(0\) 82 581 4215/ })).toHaveAttribute("href", "tel:+27825814215");
    await expect(footer.getByText(/Big Five Foods \(Pty\) Ltd · Reg\. 2025\/108507\/07 · VAT 4280321847/)).toBeVisible();
    const profile = footer.getByRole("link", { name: "Company profile (PDF)", exact: true });
    await expect(profile).toHaveAttribute("href", "/super-cube-company-profile.pdf");
    await expect(profile).toHaveAttribute("download", "");
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
