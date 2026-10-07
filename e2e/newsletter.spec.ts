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
