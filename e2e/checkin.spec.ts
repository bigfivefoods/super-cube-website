import { expect, test } from "@playwright/test";

test("a manager can rate the six Super-Cube® faces from an email link", async ({ page }) => {
  await page.route("**/api/checkin/**", async (route) => {
    if (route.request().method() === "POST") {
      const body = route.request().postDataJSON() as { responses?: Record<string, number> };
      expect(body.responses?.choices).toBe(5);
      await route.fulfill({ json: { ok: true } });
      return;
    }
    await route.fulfill({
      json: {
        ok: true,
        firstName: "Ada",
        relationship: "manager",
        locale: "en",
        faces: [
          {
            id: "choices",
            name: "Choices",
            color: "#B32026",
            tagline: "Decision-making intelligence under complexity",
          },
        ],
      },
    });
  });
  await page.goto("/feedback/checkin/testtokenvalue123456789012");
  const form = page.getByTestId("checkin-rater");
  await expect(form).toContainText("Decision-making intelligence under complexity");
  await expect(form).toContainText("Super-Cube® by Big Five Group");
  await page.getByRole("button", { name: "Strongly agree" }).click();
  await page.getByRole("button", { name: "Submit ratings" }).click();
  await expect(page.getByRole("heading", { name: "Thank you" })).toBeVisible();
});
