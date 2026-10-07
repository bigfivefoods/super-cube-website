import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * Languages (the bigfivegroup.africa approach): English unprefixed; French, Arabic (RTL),
 * Portuguese, Kiswahili, isiZulu and Afrikaans under /fr … /af for the translated pages only
 * (home, pricing and FAQ).
 */
const TRANSLATED = ["/pricing", "/faq"];
const LOCALES = ["fr", "ar", "pt", "sw", "zu", "af"] as const;

test.describe("languages", () => {
  for (const l of LOCALES) {
    test(`/${l}/faq: html lang/dir, canonical and hreflang`, async ({ page }) => {
      await page.goto(`/${l}/faq`);
      await expect(page.locator("html")).toHaveAttribute("lang", l);
      await expect(page.locator("html")).toHaveAttribute("dir", l === "ar" ? "rtl" : "ltr");
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", new RegExp(`/${l}/faq$`));
      await expect(page.locator('link[rel="alternate"][hreflang]')).toHaveCount(8);
      // The brand is never translated and always carries ®.
      await expect(page.locator("main")).toContainText("Super-Cube®");
    });
  }

  for (const l of LOCALES) {
    test(`/${l} home and /${l}/pricing: translated, canonical and hreflang`, async ({ page }) => {
      await page.goto(`/${l}`);
      await expect(page.locator("html")).toHaveAttribute("lang", l);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", new RegExp(`/${l}$`));
      await expect(page.locator('link[rel="alternate"][hreflang]')).toHaveCount(8);
      await expect(page.locator("h1")).not.toHaveText("Leadership is learnable—and we prove it.");
      await expect(page.locator("main")).toContainText("Super-Cube®");
      // Testimonials stay in the original English, marked as such.
      await expect(page.locator("[data-english-only] [lang=en]").first()).toBeAttached();
      await page.goto(`/${l}/pricing`);
      await expect(page.locator("html")).toHaveAttribute("lang", l);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", new RegExp(`/${l}/pricing$`));
      await expect(page.locator("h1")).not.toHaveText("Start free. Unlock the full pathway once.");
      // R99, once, lifetime access: the price meaning is the same in every language.
      await expect(page.getByTestId("programme-price").first()).toContainText("R99");
      await expect(page.locator("main")).toContainText("Super-Cube®");
    });
  }

  test("French pricing: lifetime access wording and a translated checkout form", async ({ page }) => {
    await page.goto("/fr/pricing");
    await expect(page.getByTestId("programme-price").first()).toContainText("R99 · accès à vie");
    await page.getByTestId("programme-card-adults").getByRole("button", { name: /Acheter avec Paystack/ }).click();
    const dialog = page.getByTestId("checkout-dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText("E-mail (obligatoire pour le reçu)");
    await expect(dialog.getByRole("heading")).toHaveText("Super-Cube® Adultes");
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
  });

  test("English pages keep lang=en and unprefixed URLs", async ({ page }) => {
    await page.goto("/faq");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
  });

  test("an English-only page under a language prefix redirects to English", async ({ request }) => {
    const res = await request.get("/fr/the-model", { maxRedirects: 0 });
    expect([307, 308]).toContain(res.status());
    expect(res.headers()["location"]).toMatch(/\/the-model$/);
  });

  test("switcher: native names, links to the same page in each language", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/fr/faq");
    const button = page.locator('[data-language-switcher="menu"] button').filter({ visible: true }).first();
    await expect(button).toHaveAttribute("aria-expanded", "false");
    await button.click();
    await expect(button).toHaveAttribute("aria-expanded", "true");
    const list = page.locator('[data-language-switcher="menu"]').filter({ visible: true }).first();
    for (const name of ["English", "Français", "العربية", "Português", "Kiswahili", "isiZulu", "Afrikaans"]) {
      await expect(list.getByText(name, { exact: true })).toBeVisible();
    }
    await expect(list.locator('[data-locale="fr"]')).toHaveAttribute("aria-current", "true");
    await list.locator('[data-locale="sw"]').click();
    await expect(page).toHaveURL(/\/sw\/faq$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "sw");
    await expect(page.locator("h1")).toHaveText("Maswali yanayoulizwa mara kwa mara");
    // Escape closes and returns focus
    await button.click();
    await page.keyboard.press("Escape");
    await expect(button).toBeFocused();
  });

  test("switcher on the home page goes to the translated home", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/");
    await page.locator('[data-language-switcher="menu"] button').filter({ visible: true }).first().click();
    await page.locator('[data-language-switcher="menu"] [data-locale="fr"]').filter({ visible: true }).first().click();
    await expect(page).toHaveURL(/\/fr$/);
    await expect(page.locator("h1")).toHaveText("Le leadership s’apprend, et nous le prouvons.");
  });

  test("choosing a language on an English-only page shows the English-only note", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/the-model");
    await page.locator('[data-language-switcher="menu"] button').filter({ visible: true }).first().click();
    await page.locator('[data-language-switcher="menu"] [data-locale="pt"]').filter({ visible: true }).first().click();
    await expect(page).toHaveURL(/\/the-model$/);
    await expect(page.locator('[data-locale-notice="englishOnly"]')).toContainText("disponível apenas em inglês");
  });

  for (const [tag, viewport] of [
    ["desktop", { width: 1280, height: 900 }],
    ["phone", { width: 390, height: 844 }],
  ] as const) {
    for (const path of ["/fr/faq", "/ar/faq", "/zu/faq", "/ar", "/sw", "/fr/pricing", "/ar/pricing"]) {
      test(`axe WCAG 2.2 AA · ${tag} · ${path}`, async ({ page }) => {
        await page.setViewportSize(viewport);
        await page.goto(path);
        await page.waitForLoadState("networkidle");
        const results = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
          .exclude(".cube-face")
          .analyze();
        const summary = results.violations.map((v) => ({ id: v.id, nodes: v.nodes.slice(0, 4).map((n) => n.target.join(" ")) }));
        expect(summary, JSON.stringify(summary, null, 2)).toEqual([]);
      });
    }
  }

  test("the translated pages list is the one the sitemap advertises", async ({ request }) => {
    const xml = await (await request.get("/sitemap.xml")).text();
    for (const l of LOCALES) {
      expect(xml).toContain(`/${l}<`);
      for (const p of TRANSLATED) expect(xml).toContain(`/${l}${p}<`);
    }
  });
});
