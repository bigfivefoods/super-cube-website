import { expect, test } from "@playwright/test";

test.describe("public certificate check", () => {
  test("/verify shows the search form and rejects a malformed ID inline", async ({ page }) => {
    const res = await page.goto("/verify");
    expect(res?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Check a Super-Cube® certificate");
    await page.getByLabel("Certificate ID").fill("not-an-id");
    await page.getByRole("button", { name: "Check certificate" }).click();
    // Scope to the form: Next.js also renders an (empty) role="alert" route announcer.
    const error = page.locator("form").getByRole("alert");
    await expect(error).toHaveCount(1);
    await expect(error).toContainText("not a Super-Cube® certificate ID");
    await expect(page.getByLabel("Certificate ID")).toHaveAttribute("aria-describedby", /cert-id-error/);
  });

  test("a well-formed ID is sent to its own page", async ({ page }) => {
    await page.goto("/verify");
    await page.getByLabel("Certificate ID").fill(" sc-20990101-abcdef0123 ");
    await page.getByRole("button", { name: "Check certificate" }).click();
    await expect(page).toHaveURL(/\/verify\/SC-20990101-ABCDEF0123$/);
  });

  test("unknown and malformed IDs are real 404s", async ({ request, page }) => {
    for (const id of ["garbage", "SC-1"]) {
      const r = await request.get(`/verify/${id}`);
      expect(r.status(), id).toBe(404);
    }
    // A well-formed unknown ID is a real 404 wherever the registry can be read
    // (production). Vercel previews have no service-role key, so there the page
    // honestly says the registry is unavailable instead; accept only that.
    const res = await page.goto("/verify/SC-20990101-ABCDEF0123");
    const status = page.getByTestId("verify-status");
    if (res?.status() === 404) {
      await expect(status).toHaveAttribute("data-status", "not_found");
    } else {
      await expect(status).toHaveAttribute("data-status", "unavailable");
    }
  });
});
