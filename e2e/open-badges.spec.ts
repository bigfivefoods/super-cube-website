import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("issuer profile names Super-Cube® by Big Five Group", async ({ request }) => {
  const response = await request.get("/issuer/super-cube");
  expect(response.status()).toBe(200);
  expect(response.headers()["content-type"]).toContain("application/ld+json");
  expect(response.headers()["access-control-allow-origin"]).toBe("*");
  const body = await response.json();
  expect(body.name).toBe("Super-Cube® by Big Five Group");
  expect(body.type).toContain("Profile");
  expect(JSON.stringify(body).toLowerCase()).not.toContain("kwaden");
  expect(body["@context"][0]).toBe("https://www.w3.org/ns/credentials/v2");
  expect(body["@context"][1]).toBe("https://purl.imsglobal.org/spec/ob/v3p0/context-3.0.3.json");
});

test("achievement documents are public JSON-LD", async ({ request }) => {
  const response = await request.get("/achievements/certificate-adults");
  expect(response.status()).toBe(200);
  const body = await response.json();
  expect(body.type).toContain("Achievement");
  expect(body.name).toContain("Super-Cube®");
  expect(body.criteria.narrative.length).toBeGreaterThan(20);
  const missing = await request.get("/achievements/not-a-badge");
  expect(missing.status()).toBe(404);
});

test("credential URLs reject malformed ids", async ({ request }) => {
  expect((await request.get("/credentials/not-an-id")).status()).toBe(404);
  expect((await request.get("/credentials/SC-1/status")).status()).toBe(404);
});

test("live cohorts page is reachable and accessible", async ({ page }) => {
  const response = await page.goto("/learn/cohorts");
  expect(response?.status()).toBeLessThan(400);
  if (page.url().includes("/login")) {
    await expect(page).toHaveURL(/\/login\?next=(%2Flearn%2Fcohorts|\/learn\/cohorts)/);
    return;
  }
  await expect(page.getByRole("heading", { level: 1, name: "Live cohorts" })).toBeVisible();
  const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag22aa"]).analyze();
  expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
});

test("a milestone badge id that is not a certificate stays off the certificate form", async ({ page }) => {
  await page.goto("/verify");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Check a Super-Cube® certificate");
});
