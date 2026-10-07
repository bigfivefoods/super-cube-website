import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * WCAG 2.2 AA (Phase 1 · stage 7): axe-core on the learner journey and public pages,
 * at desktop and phone sizes, plus keyboard and screen-reader checks.
 */
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
    if (!localStorage.getItem("supercube_lms_v1")) {
      localStorage.setItem(
        "supercube_lms_v1",
        JSON.stringify({
          profile: p,
          lessonProgress: {},
          reflections: {},
          orientation: { responses: {}, result: { label: "Integrative thinker" }, completedAt: "2026-10-02T08:00:00.000Z" },
          attempts: [
            {
              phase: "pre",
              programmeId: "adults",
              responses: {},
              result: {
                overall: 62,
                constructScores: ["choices", "principles", "mental", "emotional", "physical", "spiritual"].map((c, i) => ({
                  constructId: c,
                  name: c[0].toUpperCase() + c.slice(1),
                  color: "#111111",
                  score: 50 + i * 4,
                  rawMean: 3,
                  itemCount: 4,
                })),
              },
              completedAt: "2026-10-06T08:00:00.000Z",
            },
          ],
        }),
      );
    }
  }, profile);
}

const PAGES = [
  "/",
  "/pricing",
  "/login",
  "/learn",
  "/learn/courses",
  "/learn/courses/choices",
  "/learn/courses/choices/adults-choices-overview",
  "/learn/assessment",
  "/learn/assessment/post",
  "/learn/pulse",
  "/learn/practice",
  "/learn/account",
  "/learn/report",
  "/learn/courses/choices/not-a-session",
  "/share/report/not-a-real-token",
];

for (const [tag, viewport] of [
  ["desktop", { width: 1280, height: 900 }],
  ["phone", { width: 390, height: 844 }],
] as const) {
  test.describe(`axe WCAG 2.2 AA · ${tag}`, () => {
    test.use({ viewport });
    for (const path of PAGES) {
      test(path, async ({ page }) => {
        await seed(page);
        await page.goto(path);
        await page.waitForLoadState("networkidle");
        await page.waitForTimeout(400);
        const results = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
          // The 3D cube faces are a picture (role="img") with white text by
          // design (Craig's rule, PR 11). Their skills/scores are repeated as
          // sr-only text, which axe still checks. See docs/lms-accessibility.md.
          .exclude(".cube-face")
          .analyze();
        const summary = results.violations.map((v) => ({
          id: v.id,
          impact: v.impact,
          nodes: v.nodes.slice(0, 6).map((n) => `${n.target.join(" ")} :: ${n.failureSummary?.split("\n").slice(1, 2).join("")}`),
        }));
        if (process.env.AXE_DUMP) {
          const fs = await import("node:fs");
          for (const v of results.violations)
            for (const n of v.nodes)
              fs.appendFileSync(process.env.AXE_DUMP, JSON.stringify({ tag, path, id: v.id, target: n.target.join(" "), html: n.html.slice(0, 160), msg: n.failureSummary?.split("\n")[1] }) + "\n");
        }
        expect(summary, JSON.stringify(summary, null, 2)).toEqual([]);
      });
    }
  });
}

test.describe("keyboard and screen reader", () => {
  test("skip link is the first stop and jumps to the main content", async ({ page }) => {
    await seed(page);
    await page.goto("/learn");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: /skip to (main )?content/i });
    await expect(skip).toBeFocused();
    await expect(skip).toBeVisible();
    await page.keyboard.press("Enter");
    await expect(page.locator("#main-content")).toBeFocused();
    // Inside Learn, a second skip link jumps past the sidebar to the page content.
    await page.goto("/learn");
    const skip2 = page.getByRole("link", { name: /skip to page content/i });
    // It comes straight after the site header, before the Learn sidebar.
    let reached = false;
    for (let i = 0; i < 20 && !reached; i++) {
      await page.keyboard.press("Tab");
      reached = await skip2.evaluate((el) => el === document.activeElement);
    }
    expect(reached).toBe(true);
    await expect(skip2).toBeVisible();
    await page.keyboard.press("Enter");
    await expect(page.locator("#learn-content")).toBeFocused();
  });

  test("Likert answers have visible labels, number keys answer, and focus is visible", async ({ page }) => {
    await seed(page);
    await page.addInitScript(() => {
      const raw = localStorage.getItem("supercube_lms_v1");
      if (raw && raw.includes('"phase":"pre"')) {
        const s = JSON.parse(raw);
        s.attempts = [];
        localStorage.setItem("supercube_lms_v1", JSON.stringify(s));
      }
    });
    await page.goto("/learn/assessment/pre");
    const first = page.locator("fieldset").first();
    await expect(first.getByText("Strongly disagree")).toBeVisible();
    await expect(first.getByText("Strongly agree")).toBeVisible();
    const btn = first.getByRole("button", { name: /^3\b/ });
    await btn.focus();
    const outline = await btn.evaluate((el) => getComputedStyle(el).outlineStyle + " " + getComputedStyle(el).boxShadow);
    expect(outline).not.toBe("none none");
    await page.keyboard.press("4");
    await expect(first.getByRole("button", { name: /^4\b/ })).toHaveAttribute("aria-pressed", "true");
  });

  test("the cube respects reduced motion and has a text alternative", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    const anim = await page.evaluate(() =>
      [...document.querySelectorAll("*")].filter((el) => {
        const s = getComputedStyle(el);
        return s.animationName !== "none" && s.animationPlayState === "running" && parseFloat(s.animationDuration) > 0.01;
      }).length,
    );
    expect(anim).toBe(0);
    await expect(page.locator(".cube-scene[role=img]").first()).toHaveAttribute("aria-label", /Super-Cube/);
  });
});
