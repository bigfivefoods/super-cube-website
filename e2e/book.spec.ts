import { expect, test } from "@playwright/test";

/** The free book: /book, the home "Free book" section, the footer link and the PDF itself. */

const PDF = "/super-cube-leadership-book.pdf";

for (const vp of [
  { width: 1280, height: 800 },
  { width: 390, height: 844 },
]) {
  test(`/book hero is the landing hero's size at ${vp.width}px, with no sideways scroll`, async ({ page }) => {
    await page.setViewportSize(vp);
    await page.goto("/");
    const home = await page.locator(".page-hero").first().boundingBox();
    await page.goto("/book");
    const hero = await page.locator(".page-hero").first().boundingBox();
    expect(home && hero).toBeTruthy();
    expect(Math.abs(home!.height - hero!.height)).toBeLessThanOrEqual(1);
    expect(Math.abs(home!.width - hero!.width)).toBeLessThanOrEqual(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });
}

test("/book: title, download links, chapters, breadcrumbs, share card and Book JSON-LD", async ({ page }) => {
  await page.goto("/book");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("The Super-Cube® Leadership Model");
  const hero = page.locator(".page-hero").first();
  const download = hero.getByRole("link", { name: /^Download the free book/ });
  await expect(download).toHaveAttribute("href", PDF);
  await expect(download).toHaveAttribute("download", "");
  await expect(download).toHaveAccessibleName(/^Download the free book \(PDF, \d+ pages, [\d.]+ MB\)$/);
  await expect(page.getByTestId("book-chapters").locator("li")).toHaveCount(15);
  await expect(page.getByTestId("book-chapters")).toContainText("Your Super-Cube® Action Plan");
  const crumbs = page.getByRole("navigation", { name: /breadcrumb/i });
  await expect(crumbs.locator('[aria-current="page"]')).toContainText("Free book");
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", /\/images\/og\/super-cube-leadership-book\.jpg$/);
  await expect(page.locator('meta[property="og:image:width"]')).toHaveAttribute("content", "1200");
  await expect(page.locator('meta[property="og:image:height"]')).toHaveAttribute("content", "630");
  const ld = await page.locator('script[type="application/ld+json"]').allTextContents();
  expect(ld.some((t) => t.includes('"@type":"Book"') && t.includes('"isAccessibleForFree":true'))).toBe(true);
  const res = await page.request.get(PDF);
  expect(res.status()).toBe(200);
  expect(res.headers()["content-type"]).toContain("application/pdf");
});

test("home: Free book section below the hero; hero unchanged", async ({ page }) => {
  await page.goto("/");
  const hero = page.locator(".page-hero").first();
  await expect(hero.getByRole("link", { name: /free book/i })).toHaveCount(0);
  const section = page.getByTestId("home-book");
  await expect(section.getByRole("heading", { level: 2 })).toHaveText("Read the book behind the model");
  const dl = section.getByRole("link", { name: /^Download the free book/ });
  await expect(dl).toHaveAttribute("href", PDF);
  await expect(dl).toHaveAttribute("download", "");
  await expect(dl).not.toHaveAttribute("hreflang", /.+/);
  await expect(section.getByRole("link", { name: /About the book/ })).toHaveAttribute("href", "/book");
  const footerBook = page.locator("footer.site-footer").getByRole("link", { name: "Free book", exact: true });
  await expect(footerBook).toHaveAttribute("href", "/book");
});

test("translated home: book strings translated, links marked English", async ({ page }) => {
  await page.goto("/fr");
  const section = page.getByTestId("home-book");
  const dl = section.getByRole("link", { name: /^Télécharger le livre gratuit/ });
  await expect(dl).toHaveAttribute("href", PDF);
  await expect(dl).toHaveAttribute("hreflang", "en");
  await expect(dl).toHaveAttribute("download", "");
  await expect(section.getByRole("link", { name: /À propos du livre/ })).toHaveAttribute("hreflang", "en");
  const footerBook = page.locator("footer.site-footer").getByRole("link", { name: "Livre gratuit", exact: true });
  await expect(footerBook).toHaveAttribute("href", "/book");
  await expect(footerBook).toHaveAttribute("hreflang", "en");
});

test("sitemap lists /book", async ({ request }) => {
  const xml = await (await request.get("/sitemap.xml")).text();
  expect(xml).toMatch(/<loc>https:\/\/www\.super-cube\.me\/book<\/loc>/);
});
