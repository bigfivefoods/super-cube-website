import { expect, test } from "@playwright/test";

/**
 * Super-Cube® News: listing, post pages, share buttons, hero size, feed, sitemap and the
 * homepage "Latest" strip.
 */
const POST = "/news/super-cube-lms-accelerating-leadership-development";

test("News lists posts with square covers and links each one", async ({ page }) => {
  await page.goto("/news");
  await expect(page.getByRole("heading", { level: 1, name: "News and updates" })).toBeVisible();
  const featured = page.locator("[data-news-featured]");
  await expect(featured).toHaveCount(1);
  await expect(page.locator("[data-news-card]").first()).toBeVisible();
  const cover = page.locator("[data-news-card] .aspect-square").first();
  const box = await cover.boundingBox();
  expect(box && Math.abs(box.width - box.height)).toBeLessThan(2);
  await expect(page.locator('link[rel="alternate"][type="application/rss+xml"]')).toHaveAttribute("href", /\/news\/feed\.xml$/);
});

for (const vp of [
  { width: 1280, height: 800 },
  { width: 390, height: 844 },
]) {
  test(`post hero is the landing hero's size at ${vp.width}px`, async ({ page }) => {
    await page.setViewportSize(vp);
    await page.goto("/");
    const home = await page.locator(".page-hero").first().boundingBox();
    await page.goto(POST);
    const post = await page.locator("header.page-hero").first().boundingBox();
    expect(home && post).toBeTruthy();
    expect(Math.abs(home!.height - post!.height)).toBeLessThanOrEqual(1);
    expect(Math.abs(home!.width - post!.width)).toBeLessThanOrEqual(1);
  });
}

test("post page: title, breadcrumbs, article JSON-LD, Open Graph card and share links", async ({ page }) => {
  await page.goto(POST);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(/Super-Cube® LMS/);
  const crumbs = page.getByRole("navigation", { name: /breadcrumb/i });
  await expect(crumbs.getByRole("link", { name: "News" })).toHaveAttribute("href", "/news");
  await expect(crumbs.locator('[aria-current="page"]')).toContainText("Super-Cube® LMS");
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", /\/images\/og\/news\/super-cube-lms\.jpg$/);
  await expect(page.locator('meta[property="og:image:width"]')).toHaveAttribute("content", "1200");
  await expect(page.locator('meta[property="og:type"]')).toHaveAttribute("content", "article");
  const ld = await page.locator('script[type="application/ld+json"]').allTextContents();
  expect(ld.some((t) => t.includes('"NewsArticle"'))).toBe(true);

  for (const position of ["top", "bottom"]) {
    const row = page.locator(`[data-share="${position}"]`);
    for (const network of ["linkedin", "whatsapp", "x", "facebook"]) {
      const a = row.locator(`[data-share-network="${network}"]`);
      await expect(a).toHaveAttribute("target", "_blank");
      await expect(a).toHaveAttribute("rel", /noopener/);
      const href = decodeURIComponent((await a.getAttribute("href")) || "");
      expect(href).toContain(`https://www.super-cube.me${POST}?utm_source=${network}&utm_medium=social&utm_campaign=news`);
    }
    await expect(row.locator('[data-share-network="email"]')).toHaveAttribute("href", /^mailto:\?subject=/);
    await expect(row.getByRole("button", { name: "Copy link" })).toBeVisible();
  }
});

test("copy link copies the tracked URL and announces it", async ({ page, context, browserName }) => {
  test.skip(browserName !== "chromium", "clipboard permissions are Chromium-only here");
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto(POST);
  const row = page.locator('[data-share="bottom"]');
  await row.getByRole("button", { name: "Copy link" }).click();
  await expect(row.getByRole("status")).toHaveText("Link copied");
  const text = await page.evaluate(() => navigator.clipboard.readText());
  expect(text).toContain("utm_source=copy");
});

test("unknown post is a 404 with a way back", async ({ page }) => {
  const res = await page.goto("/news/not-a-real-post");
  expect(res?.status()).toBe(404);
  await expect(page.getByRole("link", { name: "All news" })).toBeVisible();
});

test("RSS feed and sitemap list the posts", async ({ request }) => {
  const feed = await request.get("/news/feed.xml");
  expect(feed.ok()).toBe(true);
  expect(feed.headers()["content-type"]).toContain("application/rss+xml");
  const xml = await feed.text();
  expect(xml).toContain("<rss version=\"2.0\"");
  expect(xml).toContain(`https://www.super-cube.me${POST}`);
  const sitemap = await (await request.get("/sitemap.xml")).text();
  expect(sitemap).toContain("https://www.super-cube.me/news</loc>");
  expect(sitemap).toContain(`https://www.super-cube.me${POST}</loc>`);
});

test("homepage shows the Latest strip and the footer links News", async ({ page }) => {
  await page.goto("/");
  const strip = page.getByTestId("latest-news");
  await expect(strip.locator("[data-news-card]").first()).toBeVisible();
  await expect(strip.getByRole("link", { name: /All news/ })).toHaveAttribute("href", "/news");
  await expect(page.locator("footer").getByRole("link", { name: "News", exact: true })).toHaveAttribute("href", "/news");
});
