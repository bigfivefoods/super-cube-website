import { test, expect, type Page } from "@playwright/test";

const profile = {
  displayName: "Thandi Mokoena",
  ageBand: "25-34",
  role: "professional",
  context: "work",
  programmeId: "adults",
  profileCompletedAt: "2026-10-01T08:00:00.000Z",
};

async function seed(page: Page) {
  await page.addInitScript((p) => {
    localStorage.setItem(
      "supercube_lms_v1",
      JSON.stringify({ profile: p, lessonProgress: {}, attempts: [], reflections: {} }),
    );
  }, profile);
}

test.describe("Learn in every language", () => {
  for (const [locale, dir, scale] of [
    ["fr", "ltr", "Pas du tout"],
    ["ar", "rtl", "أعارض بشدة"],
    ["pt", "ltr", "Discordo totalmente"],
    ["sw", "ltr", "Sikubaliani kabisa"],
    ["zu", "ltr", "Angivumelani nhlobo"],
    ["af", "ltr", "Stem glad nie saam nie"],
  ] as const) {
    test(`/${locale}/learn keeps lang/dir and a translated questionnaire`, async ({ page }) => {
      await seed(page);
      const home = await page.goto(`/${locale}/learn`);
      expect(home?.status()).toBe(200);
      await expect(page.locator("html")).toHaveAttribute("lang", locale);
      await expect(page.locator("html")).toHaveAttribute("dir", dir);
      await page.goto(`/${locale}/learn/assessment/pre`);
      await expect(page.locator("html")).toHaveAttribute("lang", locale);
      await expect(page.locator("html")).toHaveAttribute("dir", dir);
      await expect(page.locator("main")).toContainText(scale);
      await expect(page.locator("main")).not.toContainText("Strongly disagree");
    });
  }

  test("English Learn stays unprefixed and in English", async ({ page }) => {
    await seed(page);
    await page.goto("/learn/assessment/pre");
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
    await expect(page.locator("main")).toContainText("Strongly disagree");
  });
});
