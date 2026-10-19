import { expect, test } from "@playwright/test";

test.describe("public certificate check", () => {
  test("/verify shows the search form and rejects a malformed ID inline", async ({ page }) => {
    const res = await page.goto("/verify");
    expect(res?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Check a Super-Cube® certificate");
    await page.getByLabel("Certificate ID").fill("not-an-id");
    await page.getByRole("button", { name: "Check certificate" }).click();
    await expect(page.getByRole("alert")).toContainText("not a Super-Cube® certificate ID");
  });

  test("a well-formed ID is sent to its own page", async ({ page }) => {
    await page.goto("/verify");
    await page.getByLabel("Certificate ID").fill(" sc-20990101-abcdef0123 ");
    await page.getByRole("button", { name: "Check certificate" }).click();
    await expect(page).toHaveURL(/\/verify\/SC-20990101-ABCDEF0123$/);
  });

  test("unknown and malformed IDs are real 404s", async ({ request, page }) => {
    for (const id of ["SC-20990101-ABCDEF0123", "garbage", "SC-1"]) {
      const r = await request.get(`/verify/${id}`);
      expect(r.status(), id).toBe(404);
    }
    await page.goto("/verify/SC-20990101-ABCDEF0123");
    await expect(page.getByTestId("verify-status")).toHaveAttribute("data-status", /not_found|unavailable/);
  });
});
