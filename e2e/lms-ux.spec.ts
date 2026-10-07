import { test, expect, type Page } from "@playwright/test";

/**
 * UX / mobile pass (Phase 1 · Stage 4). Signed out with a profile seeded in localStorage,
 * so it needs no Supabase stack and creates no accounts.
 */
const MOBILE = { width: 390, height: 844 };
const SESSION = "/learn/courses/choices/adults-choices-overview";

const profile = {
  displayName: "Thandi Mokoena",
  ageBand: "25-34",
  role: "professional",
  context: "work",
  programmeId: "adults",
  profileCompletedAt: "2026-10-01T08:00:00.000Z",
};

async function seed(page: Page, extra: Record<string, unknown> = {}) {
  await page.addInitScript(
    ({ p, x }) => {
      if (localStorage.getItem("supercube_lms_v1")) return;
      localStorage.setItem(
        "supercube_lms_v1",
        JSON.stringify({ profile: p, lessonProgress: {}, attempts: [], reflections: {}, ...x }),
      );
    },
    { p: profile, x: extra },
  );
}

test.describe("learner UX at 390x844", () => {
  test.use({ viewport: MOBILE });

  test("Today shows one next action that follows the pathway", async ({ page }) => {
    await seed(page);
    await page.goto("/learn");
    const card = page.getByTestId("next-action");
    await expect(card).toHaveCount(1);
    await expect(card).toContainText("Step 2 of 6");
    await expect(card.getByRole("heading")).toHaveText("Orient your leadership frame");
    await expect(card.getByRole("link")).toHaveAttribute("href", "/learn/assessment/orientation");
    // The pathway pill doesn't compete with the card, and no sticky CTA floats over content
    await expect(page.getByTestId("mobile-pathway").getByRole("link", { name: "Continue" })).toHaveCount(0);
    await expect(page.getByRole("link", { name: /Journal · Check in/ })).toHaveCount(0);
    // en-ZA date such as "7 Oct 2026"
    await expect(page.getByText(/^Today · \d{1,2} [A-Z][a-z]{2} \d{4}$/)).toBeVisible();
    const box = await card.boundingBox();
    expect(box && box.y + box.height).toBeLessThan(MOBILE.height);
  });

  test("after orientation the next action is the baseline", async ({ page }) => {
    await seed(page, {
      orientation: { responses: {}, result: { label: "Integrative thinker" }, completedAt: "2026-10-02T08:00:00.000Z" },
    });
    await page.goto("/learn");
    const card = page.getByTestId("next-action");
    await expect(card).toContainText("Step 3 of 6");
    await expect(card.getByRole("link")).toHaveAttribute("href", "/learn/assessment/pre");
  });

  test("a session page leads with the lesson, not navigation", async ({ page }) => {
    await seed(page);
    await page.goto(SESSION);
    await expect(page.getByTestId("mobile-pathway")).toBeHidden();
    const h1 = page.getByRole("heading", { level: 1 });
    await expect(h1).toHaveText(/Overview/);
    const read = page.getByText(/Read · understand the idea/i).first();
    await expect(read).toBeVisible();
    const box = await read.boundingBox();
    expect(box && box.y).toBeLessThan(MOBILE.height * 0.6);
  });

  test("Learn pages show the pathway pill with a step counter", async ({ page }) => {
    await seed(page);
    await page.goto("/learn/courses");
    const pill = page.getByTestId("mobile-pathway");
    await expect(pill).toContainText("Step 2 of 6");
    await expect(pill.getByRole("link", { name: "Continue" })).toHaveAttribute("href", "/learn/assessment/orientation");
  });
});

test.describe("bad lesson links", () => {
  for (const path of ["/learn/courses/choices/not-a-session", "/learn/courses/not-a-face", "/learn/courses/not-a-face/x"]) {
    test(`${path} is a real 404`, async ({ page }) => {
      await seed(page);
      const res = await page.goto(path);
      expect(res?.status()).toBe(404);
      await expect(page.getByTestId("lesson-not-found")).toBeVisible();
      await expect(page.getByRole("link", { name: "All courses" })).toHaveAttribute("href", "/learn/courses");
    });
  }
});
