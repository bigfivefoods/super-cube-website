import { expect, test } from "@playwright/test";

/* The free Super-Cube® book post (8 Oct 2026, before the Leadership Is Learnable launch): landing-size hero,
 * share card with the Super-Cube® mark, a "Download free" link to the same PDF as /book, and only a teaser for the
 * comprehensive edition (since the launch, one line linking the paperback and Kindle on Amazon and the launch post). */
test("free book post: hero size, share card, Download free link, paperback and Kindle links", async ({ page, request }) => {
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
  for (const t of ["32.2 percentage points", "Principles +45.1", "Emotional +39.5", "Spiritual +24.6", "132 people", "Now out: the comprehensive edition", "$17.99", "R299 in South Africa", "$8.99"]) {
    await expect(body).toContainText(t);
  }
  const amazon = await body.locator('a[href*="amazon."]').evaluateAll((as) => as.map((a) => a.getAttribute("href")));
  expect(amazon.sort()).toEqual(["https://www.amazon.com/dp/1048361616", "https://www.amazon.com/dp/B0HMLR6QRP"]);
  await expect(body.locator('a[href="/news/leadership-is-learnable-new-book"]')).toHaveCount(1);
  // Prices only in the one "Now out" line (no e-book rand price, no stale "coming soon" wording)
  await expect(body).not.toContainText(/R149|coming soon on Amazon|share the news here/i);
  await expect(page.locator("main")).not.toContainText(/kwaden|®®|24\.7|empirically validated/i);
  const pdf = await request.get("/super-cube-leadership-book.pdf");
  expect(pdf.status()).toBe(200);
  expect(pdf.headers()["content-type"]).toContain("pdf");
});
