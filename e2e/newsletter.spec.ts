import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.describe("newsletter double opt-in", () => {
  test("confirm page without a valid token explains what to do, and is not indexed", async ({ page }) => {
    for (const path of ["/newsletter/confirm", "/newsletter/confirm?t=not-a-token"]) {
      await page.goto(path);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText("Confirm your subscription");
      await expect(page.getByRole("alert").filter({ hasText: "confirmation link" })).toContainText("isn’t valid");
      await expect(page.getByRole("link", { name: "sign up again" })).toHaveAttribute("href", "/news#subscribe");
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
      await expect(page.getByRole("button", { name: "Confirm my subscription" })).toHaveCount(0);
    }
    const axe = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"]).analyze();
    expect(axe.violations).toEqual([]);
  });

  test("signup API validates input and never reveals subscription state", async ({ request }) => {
    const bad = await request.post("/api/newsletter", { data: { email: "nope", consent: true } });
    expect(bad.status()).toBe(400);
    const noConsent = await request.post("/api/newsletter", { data: { email: "someone@example.com" } });
    expect(noConsent.status()).toBe(400);
    expect((await noConsent.json()).error).toMatch(/consent/i);
    // Honeypot submissions get the same answer as real ones but nothing is stored or sent.
    const bot = await request.post("/api/newsletter", {
      data: { email: "bot@example.com", consent: true, website: "http://spam.example" },
    });
    expect(bot.status()).toBe(200);
    expect(await bot.json()).toEqual({ ok: true, pending: true });
  });

  test("signup form promises a confirmation email", async ({ page }) => {
    await page.goto("/news");
    const form = page.locator("#subscribe");
    await expect(form.getByText(/confirm by email/i)).toBeVisible();
  });
});

test.describe("news admin is private", () => {
  test("the news tab and post previews ask for an admin sign-in", async ({ page }) => {
    await page.goto("/newsletter/admin?tab=news&edit=new");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Super-Cube® admin");
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(page.locator("#post-title")).toHaveCount(0);
    await page.goto("/newsletter/admin/preview/0b7c2a52-6a0e-4a43-9f3e-1d2c3b4a5f60");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Sign in to preview");
    await expect(page.locator("article")).toHaveCount(0);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  });

  test("share cards exist only for published admin posts", async ({ request }) => {
    expect((await request.get("/news/not-a-post/share-image")).status()).toBe(404);
    // Code posts ship static 1200×630 cards instead.
    expect((await request.get("/news/super-cube-lms-accelerating-leadership-development/share-image")).status()).toBe(404);
  });
});

test.describe("campaigns are private", () => {
  test("the campaigns tab asks for a sign-in and email previews are hidden", async ({ page, request }) => {
    await page.goto("/newsletter/admin?tab=campaigns");
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(page.getByText("Start from a post")).toHaveCount(0);
    const preview = await request.get("/api/newsletter/admin/campaign-preview?post=super-cube-lms-accelerating-leadership-development");
    expect(preview.status()).toBe(404);
  });
});
