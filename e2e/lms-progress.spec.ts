import { test, expect, type Page } from "@playwright/test";
import { getLesson } from "@/lib/lms/curriculum";

/**
 * Mastery, spaced reviews, the lit Super-Cube®, levels, weekly goal, streak freezes and badges.
 * Signed out with state seeded in localStorage: no Supabase stack, no accounts.
 */
const MOBILE = { width: 390, height: 844 };
const profile = {
  displayName: "Thandi Mokoena",
  ageBand: "25-34",
  role: "professional",
  context: "work",
  programmeId: "adults",
  profileCompletedAt: "2026-10-01T08:00:00.000Z",
};

function daysAgo(n: number): string {
  return new Date(Date.now() - n * 86_400_000).toISOString();
}
function dayKey(n: number): string {
  const d = new Date(Date.now() - n * 86_400_000);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

async function seed(page: Page, extra: Record<string, unknown> = {}) {
  await page.addInitScript(
    ({ p, x }) => {
      if (localStorage.getItem("supercube_lms_v1")) return;
      localStorage.setItem(
        "supercube_lms_v1",
        JSON.stringify({ profile: p, user: { email: "", fullName: p.displayName, programmeId: "adults" }, lessonProgress: {}, attempts: [], reflections: {}, ...x }),
      );
    },
    { p: profile, x: extra },
  );
}

const firstTry = { attempts: 1, firstCorrect: 3, bestCorrect: 3, total: 3, needed: 2, firstTry: true, retried: false, passedAt: "2026-10-01T08:00:00.000Z" };

test.describe("progress", () => {
  test("signed out: the cube, level, goal, streak freeze and badges show, with a prompt to save", async ({ page }) => {
    await seed(page, {
      lessonProgress: { "adults-choices-overview": "completed", "adults-choices-skill-1": "completed", "adults-choices-quiz": "completed" },
      sessionCompletedAt: { "adults-choices-overview": daysAgo(4), "adults-choices-skill-1": daysAgo(1), "adults-choices-quiz": daysAgo(1) },
      mastery: { "adults-choices-overview": firstTry, "adults-choices-skill-1": firstTry },
      practiceStreak: { current: 8, best: 8, lastDate: dayKey(1) },
      streakFreezes: 1,
      streakFreezeUsedOn: dayKey(3),
    });
    await page.goto("/learn/progress");
    await expect(page.getByTestId("progress-cube")).toBeVisible();
    await expect(page.locator('[data-testid="progress-cube"] li[data-face="choices"]')).toHaveAttribute("data-tier", "2");
    await expect(page.locator('[data-testid="progress-cube"] li[data-face="physical"]')).toHaveAttribute("data-tier", "0");
    await expect(page.getByTestId("level-card")).toContainText("Edge");
    await expect(page.getByTestId("streak-card")).toContainText("1 streak freeze");
    await expect(page.getByTestId("freeze-used")).toBeVisible();
    await expect(page.locator('[data-testid="badge-wall"] [data-earned="true"]').filter({ hasText: "First mastery" })).toHaveCount(1);
    await expect(page.getByTestId("save-prompt")).toBeVisible();
    await expect(page.getByTestId("full-report-teaser")).toContainText("Full growth report");
    // A review of the 4-day-old session is due (Day 3)
    await expect(page.getByTestId("next-review")).toContainText("Day 3");
  });

  test("a weekly goal fills its ring", async ({ page }) => {
    await seed(page, { microPracticeLog: { [dayKey(0)]: ["ch-1"] } });
    await page.goto("/learn/progress");
    const goal = page.getByTestId("weekly-goal");
    await goal.getByRole("button", { name: /^3/ }).click();
    await expect(goal.getByTestId("goal-ring")).toBeVisible();
    await expect(goal).toContainText("2 to go");
  });

  test("Progress is the active tab on the Progress page; orientation sits under Today", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await seed(page);
    await page.goto("/learn/assessment/orientation");
    const nav = page.getByRole("navigation", { name: "Learn navigation" });
    await expect(nav.getByRole("link", { name: /Today/ })).toHaveAttribute("aria-current", "page");
    await expect(nav.getByRole("link", { name: /Progress/ })).not.toHaveAttribute("aria-current", "page");
  });
});

test.describe("mastery and reviews", () => {
  test.use({ viewport: MOBILE });

  test("a session needs about two-thirds right, or one kind retry with explanations", async ({ page }) => {
    const id = "adults-choices-skill-1";
    const qs = getLesson("adults-choices", id)!.lesson.arc!.check;
    await seed(page, { demoUnlocked: true });
    await page.goto(`/learn/courses/choices/${id}`);
    const check = page.locator("#step-check");
    // All wrong first time
    for (let i = 0; i < qs.length; i++) {
      const wrong = (qs[i].answer + 1) % qs[i].options.length;
      await check.getByRole("radiogroup").nth(i).getByRole("radio").nth(wrong).check();
    }
    await page.getByRole("button", { name: /Mark complete/ }).click();
    const retry = page.getByTestId("mastery-retry");
    await expect(retry).toBeVisible();
    await expect(retry).toContainText(`0 of ${qs.length}`);
    await expect(retry).toContainText(qs[0].why);
    await retry.getByRole("button", { name: "Try the check again" }).click();
    await expect(check.getByTestId("retrieval-check")).toHaveAttribute("data-round", "1");
    for (let i = 0; i < qs.length; i++) await check.getByRole("radiogroup").nth(i).getByRole("radio").nth(qs[i].answer).check();
    await page.getByRole("button", { name: /Mark complete/ }).click();
    await expect(page.getByText("Win of the day", { exact: true })).toBeVisible();
  });

  test("answering first is a gentle nudge, not an error", async ({ page }) => {
    await seed(page, { demoUnlocked: true });
    await page.goto("/learn/courses/choices/adults-choices-overview");
    await page.getByRole("button", { name: /Mark complete/ }).click();
    await expect(page.getByTestId("mastery-answer-first")).toBeVisible();
  });

  test("a finished session comes back on Today as a Day 3 review with its own questions", async ({ page }) => {
    const id = "adults-choices-overview";
    const qs = getLesson("adults-choices", id)!.lesson.arc!.check;
    await seed(page, { lessonProgress: { [id]: "completed" }, sessionCompletedAt: { [id]: daysAgo(3) } });
    await page.goto("/learn");
    const card = page.getByTestId("next-review");
    await expect(card).toContainText("Day 3");
    await card.getByTestId("start-review").click();
    const quiz = page.getByTestId("review-quiz");
    await expect(quiz.getByRole("radiogroup")).toHaveCount(qs.length);
    for (let i = 0; i < qs.length; i++) await quiz.getByRole("radiogroup").nth(i).getByRole("radio").first().check();
    await expect(page.getByTestId("review-result")).toContainText("remembered");
  });

  test("the locked-session card shows the price, the count and the outline", async ({ page }) => {
    await seed(page);
    await page.goto("/learn/courses/mental/adults-mental-skill-1");
    const card = page.getByTestId("lesson-paywall");
    await expect(card.getByTestId("locked-price")).toContainText("Unlock all 46 sessions · R99 once, lifetime access");
    await expect(card).toContainText("What you’ll learn");
    await expect(card.getByTestId("locked-outline").getByRole("listitem")).toHaveCount(8);
  });

  test("the practice page hydrates without errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => {
      if (m.type() === "error" && /Minified React error|Hydration|did not match/i.test(m.text())) errors.push(m.text());
    });
    await seed(page, { facePulses: [{ date: dayKey(1), at: daysAgo(1), scores: { choices: 2, principles: 4, mental: 3, emotional: 2, physical: 4, spiritual: 3 }, source: "daily" }] });
    await page.goto("/learn/practice");
    await expect(page.getByRole("button", { name: /Mark practice complete|Done for today/ })).toBeVisible();
    expect(errors).toEqual([]);
  });
});
