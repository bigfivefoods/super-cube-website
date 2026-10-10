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

/* Case studies: the FMCG case study (named) and the school field snapshot (anonymised). */
const CASE_STUDIES = [
  {
    path: "/news/twelve-weeks-six-faces-fmcg-leadership",
    og: /\/images\/og\/news\/fmcg-leadership-case-study\.jpg$/,
    figures: ["+32.2 pts", "+45.1 pts", "+39.5 pts", "percentage points"],
    chart: "/news/fmcg-leadership-results-chart.png",
    landing: { path: "/organisations", testId: "case-study-fmcg" },
  },
  {
    path: "/news/grade-12-boarders-leadership-field-snapshot",
    og: /\/images\/og\/news\/grade-12-leadership-snapshot\.jpg$/,
    figures: ["0%", "88%", "94%"],
    chart: "/news/grade-12-leadership-snapshot-chart.png",
    landing: { path: "/schools", testId: "case-study-school" },
  },
];

for (const cs of CASE_STUDIES) {
  test(`case study ${cs.path}: share card, chart alt text, hero size and landing block`, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/");
    const home = await page.locator(".page-hero").first().boundingBox();
    await page.goto(cs.path);
    const hero = await page.locator("header.page-hero").first().boundingBox();
    expect(Math.abs(home!.height - hero!.height)).toBeLessThanOrEqual(1);
    // Calm hero background behind the headline; the chart cover is kept for the body and share card.
    const heroImg = page.locator("header.page-hero picture img").first();
    await expect(heroImg).toHaveAttribute("src", /news%2Fhero%2Fnews-hero/);
    await expect(heroImg).toHaveAttribute("alt", "");
    await expect(page.locator("header.page-hero picture source").first()).toHaveAttribute("srcset", /news%2Fhero%2Fnews-hero-wide/);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", cs.og);
    const chart = page.locator(".news-body figure img").first();
    await expect(chart).toHaveAttribute("src", new RegExp(encodeURIComponent(cs.chart).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    expect(((await chart.getAttribute("alt")) || "").length).toBeGreaterThan(60);

    await page.goto(cs.landing.path);
    const block = page.getByTestId(cs.landing.testId);
    for (const f of cs.figures) await expect(block).toContainText(f);
    await expect(block).not.toContainText("coming soon");
    await expect(block.getByRole("link", { name: /Read the/ })).toHaveAttribute("href", cs.path);
  });
}

test("the school field snapshot never names the school", async ({ page }) => {
  await page.goto("/news/grade-12-boarders-leadership-field-snapshot");
  await expect(page.locator("main")).not.toContainText(/maritzburg|pietermaritzburg|old collegian/i);
  await expect(page.getByText("Field snapshot · School leadership").first()).toBeVisible();
});

test("RSS feed includes both case studies", async ({ request }) => {
  const xml = await (await request.get("/news/feed.xml")).text();
  for (const cs of CASE_STUDIES) expect(xml).toContain(`https://www.super-cube.me${cs.path}</link>`);
});

test("News index and post heroes use the calm background on phones", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/news/super-cube-lms-accelerating-leadership-development");
  await expect(page.locator("header.page-hero picture img").first()).toHaveAttribute("src", /news%2Fhero%2Fnews-hero/);
  await page.goto("/news");
  await expect(page.locator(".page-hero img").first()).toHaveAttribute("src", /news%2Fhero%2Fnews-hero-wide/);
});

/* +32.2 percentage points is overall growth across all six faces from the 12-week interventions (company profile). */
test("home results card credits +32.2 points to the 12-week interventions and links the case study", async ({ page }) => {
  await page.goto("/");
  const overall = page.getByTestId("home-results-overall");
  await expect(overall).toContainText("+32.2 pts");
  await expect(overall.getByText("+32.2 pts")).toHaveAttribute("aria-label", "plus 32.2 percentage points");
  await expect(overall).toContainText("Overall growth across all six faces");
  await expect(page.getByTestId("home-results-emotional")).toContainText("+39.5 pts");
  const card = overall.locator("xpath=ancestor::div[contains(@class,'sc-card')][1]");
  await expect(card).toContainText("12-week Super-Cube® leadership intervention");
  await expect(card).toContainText("Source: Leadership Is Learnable (2026), Chapter 18");
  await expect(card).not.toContainText("UKZN");
  await expect(page.getByTestId("home-case-study-link")).toHaveAttribute("href", "/news/twelve-weeks-six-faces-fmcg-leadership");
  await page.goto("/fr");
  await expect(page.getByTestId("home-results-overall")).toContainText("Croissance globale sur les six faces");
  await expect(page.getByTestId("home-case-study-link")).toContainText("Lire l’étude de cas FMCG");
});

for (const path of ["/impact", "/research"]) {
  test(`${path} credits +32.2 points to the 12-week interventions`, async ({ page }) => {
    await page.goto(path);
    const source = page.getByTestId("impact-results-source");
    await expect(source).toContainText("+32.2 percentage points of overall growth across all six faces");
    await expect(source).not.toContainText("%)");
    await expect(source).toContainText("Leadership Is Learnable (2026), Chapter 18");
    await expect(page.getByText("Research results · UKZN doctoral study")).toHaveCount(0);
    await expect(page.getByRole("link", { name: /Read the FMCG case study/ }).first()).toHaveAttribute(
      "href",
      "/news/twelve-weeks-six-faces-fmcg-leadership",
    );
  });
}

/* Leadership Is Learnable, now in paperback on Amazon (10 Oct 2026): landing-size hero with the white-paperback art,
 * the hero "Buy the paperback on Amazon" button (cta-amazon), the book card with Kindle coming soon, the share card with
 * the Super-Cube® mark, every Amazon link from AMAZON_URL_TBD (src/lib/book.ts) and the free book as the start. */
test("Leadership Is Learnable post: feature-image hero, Amazon paperback, Kindle soon, share card, free-book link", async ({ page }) => {
  const path = "/news/leadership-is-learnable-new-book";
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto(path);
  // Feature-image hero (10 Oct 2026, Craig): the LinkedIn launch design shows whole and full-bleed, the copy underneath.
  const header = page.locator("header[data-feature-hero]");
  const img = header.locator("img[data-feature-hero-image]");
  await expect(img).toBeVisible();
  await img.evaluate((i: HTMLImageElement) => (i.complete ? null : new Promise((r) => i.addEventListener("load", r, { once: true }))));
  const m = await img.evaluate((i: HTMLImageElement) => {
    const r = i.getBoundingClientRect();
    return { w: r.width, h: r.height, nw: i.naturalWidth, nh: i.naturalHeight, bottom: r.bottom, src: i.currentSrc };
  });
  expect(m.w).toBeGreaterThanOrEqual(1279);
  expect(m.w / m.h).toBeCloseTo(m.nw / m.nh, 1);
  expect(m.src).toContain("leadership-is-learnable-paperback-hero");
  expect((await header.locator("h1").boundingBox())!.y).toBeGreaterThanOrEqual(m.bottom - 1);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(/^Leadership Is Learnable: the Super-Cube® book is now available in paperback on Amazon$/);
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", /\/images\/og\/news\/leadership-is-learnable-paperback\.jpg$/);
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", /Super-Cube®/);
  const cta = page.getByTestId("news-cta");
  await expect(cta).toHaveText(/Buy the paperback on Amazon/);
  await expect(cta).toHaveAttribute("href", "https://www.amazon.com/dp/1048361616");
  await expect(cta).toHaveAttribute("target", "_blank");
  await expect(cta).toHaveAttribute("data-insights", "cta-amazon");
  await expect(page.locator("header[data-feature-hero]")).toContainText("Kindle edition coming soon");
  const body = page.locator(".news-body");
  for (const t of ["now available in paperback on Amazon", "32.2 percentage points", "+45.1 points", "+39.5 points", "+24.6 points", "132 people", "thesis 2020, degree conferred 2021", "Sustainable Development Goals", "R299 in South Africa"]) {
    await expect(body).toContainText(t);
  }
  await expect(body).not.toContainText(/\+32\.2%|24\.7/);
  const amazon = await page.locator('main a[href*="amazon."]').evaluateAll((as) => as.map((a) => a.getAttribute("href")));
  expect(amazon.length).toBeGreaterThanOrEqual(3);
  expect(new Set(amazon)).toEqual(new Set(["https://www.amazon.com/dp/1048361616"]));
  await expect(body.getByRole("link", { name: "Download the free edition" })).toHaveAttribute("href", "/book");
  const card = page.getByTestId("news-paid-book");
  await expect(card.getByTestId("paid-book-amazon")).toHaveText("Buy the paperback on Amazon");
  await expect(card.getByTestId("paid-book-kindle-soon")).toHaveText("Kindle edition coming soon");
  await expect(page.locator("main")).not.toContainText(/kwaden|®®/i);
});

test("Leadership Is Learnable post on phones: the square feature image, whole, above the copy", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/news/leadership-is-learnable-new-book");
  const img = page.locator("header[data-feature-hero] img[data-feature-hero-image]");
  await expect(img).toBeVisible();
  await img.evaluate((i: HTMLImageElement) => (i.complete ? null : new Promise((r) => i.addEventListener("load", r, { once: true }))));
  const m = await img.evaluate((i: HTMLImageElement) => ({ w: i.getBoundingClientRect().width, h: i.getBoundingClientRect().height, src: i.currentSrc }));
  expect(m.w).toBeGreaterThanOrEqual(389);
  expect(Math.abs(m.w - m.h)).toBeLessThan(2);
  expect(m.src).toContain("leadership-is-learnable-paperback-square");
  await expect(page.getByTestId("news-cta")).toHaveAttribute("href", "https://www.amazon.com/dp/1048361616");
});
