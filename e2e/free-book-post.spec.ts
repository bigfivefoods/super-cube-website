import { expect, test } from "@playwright/test";

/* The free Super-Cube® book post (8 Oct 2026, before the Leadership Is Learnable launch): landing-size hero,
 * share card with the Super-Cube® mark, a "Download free" link to the same PDF as /book, and only a teaser for the
 * comprehensive edition (no Amazon link, price or buy button). */
test("free book post: hero size, share card, Download free link, no Amazon link", async ({ page, request }) => {
  const path = "/news/free-super-cube-leadership-book";
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/");
  const home = await page.locator(".page-hero").first().boundingBox();
  await page.goto(path);
  const hero = await page.locator("header.page-hero").first().boundingBox();
  expect(Math.abs(home!.height - hero!.height)).toBeLessThanOrEqual(1);
  expect(Math.abs(home!.width - hero!.width)).toBeLessThanOrEqual(1);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(/Super-Cube® Leadership Model/);
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", /\/images\/og\/news\/free-super-cube-leadership-book\.jpg$/);
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", /Super-Cube®/);
  // The hero CTA saves the same PDF as /book
  const cta = page.locator("[data-news-cta]").getByRole("link", { name: /^Download free/ });
  await expect(cta).toHaveAttribute("href", "/super-cube-leadership-book.pdf");
  await expect(cta).toHaveAttribute("download", "");
  const body = page.locator(".news-body");
  const download = body.getByRole("link", { name: /^Download free/ }).first();
  await expect(download).toHaveAttribute("href", "/super-cube-leadership-book.pdf");
  for (const t of ["32.2 percentage points", "Principles +45.1", "Emotional +39.5", "Spiritual +24.6", "132 people", "Coming soon"]) {
    await expect(body).toContainText(t);
  }
  await expect(body.locator('a[href*="amazon."]')).toHaveCount(0);
  await expect(body).not.toContainText(/R299|R149|\$17\.99|\$8\.99|Buy /);
  await expect(page.locator("main")).not.toContainText(/kwaden|®®|24\.7|empirically validated/i);
  const pdf = await request.get("/super-cube-leadership-book.pdf");
  expect(pdf.status()).toBe(200);
  expect(pdf.headers()["content-type"]).toContain("pdf");
});
