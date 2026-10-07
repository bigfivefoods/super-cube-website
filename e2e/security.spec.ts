import { test, expect, type Page } from "@playwright/test";

/**
 * Security headers, CSP, access rules and rate limits (Phase 1 · Stage 8).
 * Safe against production: read-only requests, except the rate-limit test,
 * which only runs against a local server.
 */
const base = process.env.BASE_URL || "http://127.0.0.1:3000";
const local = /localhost|127\.0\.0\.1/.test(base);
const authGate = process.env.EXPECT_AUTH_GATE === "1" || process.env.LMS_STACK === "1";

async function collectCsp(page: Page) {
  await page.addInitScript(() => {
    (window as unknown as { __csp: string[] }).__csp = [];
    document.addEventListener("securitypolicyviolation", (e) => {
      (window as unknown as { __csp: string[] }).__csp.push(`${e.effectiveDirective} ${e.blockedURI}`);
    });
  });
}

test.describe("security headers", () => {
  test("every page sends a CSP with the hardening directives", async ({ request }) => {
    for (const path of ["/", "/learn", "/pricing"]) {
      const res = await request.get(path);
      const h = res.headers();
      const csp = h["content-security-policy"] ?? h["content-security-policy-report-only"];
      expect(csp, path).toBeTruthy();
      for (const d of ["default-src 'self'", "object-src 'none'", "base-uri 'self'", "frame-ancestors 'self'", "form-action 'self' https://checkout.paystack.com"]) {
        expect(csp, `${path}: ${d}`).toContain(d);
      }
      expect(h["x-content-type-options"]).toBe("nosniff");
    }
  });

  test("main pages raise no CSP violations", async ({ page }) => {
    await collectCsp(page);
    const seen: string[] = [];
    for (const path of ["/", "/pricing", "/login", "/learn", "/learn/courses", "/learn/assessment/orientation", "/how"]) {
      await page.goto(path);
      await page.waitForLoadState("networkidle");
      const v = await page.evaluate(() => (window as unknown as { __csp: string[] }).__csp);
      seen.push(...v.map((x) => `${path}: ${x}`));
    }
    expect(seen).toEqual([]);
  });

  test("CSP reports are accepted", async ({ request }) => {
    const res = await request.post("/api/csp-report", {
      headers: { "content-type": "application/csp-report" },
      data: JSON.stringify({ "csp-report": { "document-uri": `${base}/e2e?t=secret`, "violated-directive": "script-src", "blocked-uri": "https://evil.example/x.js" } }),
    });
    expect(res.status()).toBe(204);
  });
});

test.describe("access rules (signed out)", () => {
  test("private Learn pages send visitors to sign in", async ({ page }) => {
    test.skip(!authGate, "needs Supabase configured (EXPECT_AUTH_GATE=1)");
    for (const path of ["/learn/coach", "/learn/report", "/learn/assessment/post", "/learn/org"]) {
      await page.goto(path);
      await expect(page, path).toHaveURL(/\/login\?next=/);
    }
  });

  test("learner APIs refuse visitors", async ({ request }) => {
    const calls = [
      request.post("/api/lms/attempts", { data: {} }),
      request.post("/api/lms/progress", { data: {} }),
      request.get("/api/lms/engagement"),
      request.get("/api/lms/shares"),
      request.post("/api/org/join", { data: { code: "NOPE" } }),
      request.post("/api/consent/guardian", { data: {} }),
      request.post("/api/account/delete", { data: {} }),
    ];
    for (const res of await Promise.all(calls)) {
      expect([401, 403, 503], res.url()).toContain(res.status());
    }
  });

  test("the auth callback only redirects to this site", async ({ request }) => {
    for (const next of ["@evil.example", "//evil.example", "/\\evil.example", "https://evil.example"]) {
      const res = await request.get(`/auth/callback?next=${encodeURIComponent(next)}`, { maxRedirects: 0 });
      expect(res.status()).toBeGreaterThanOrEqual(300);
      const loc = new URL(res.headers()["location"] ?? "", base);
      // Same server (it may name itself localhost or 127.0.0.1), never evil.example.
      expect(loc.hostname, next).not.toContain("evil");
      expect(loc.username + loc.password, next).toBe("");
      expect(loc.pathname, next).toBe("/learn");
    }
  });
});

test.describe("rate limits", () => {
  test("checkout initialise is limited per IP with Retry-After", async ({ request }) => {
    test.skip(!local, "local server only");
    // A made-up client IP keeps this test's window apart from other tests.
    const ip = `198.51.100.${Math.floor(Math.random() * 250) + 1}`;
    const statuses: number[] = [];
    for (let i = 0; i < 22; i++) {
      const res = await request.post("/api/paystack/initialize", {
        headers: { "x-forwarded-for": ip },
        data: { programmeId: "adults", email: "" },
      });
      statuses.push(res.status());
      if (res.status() === 429) {
        expect(Number(res.headers()["retry-after"])).toBeGreaterThan(0);
        break;
      }
    }
    expect(statuses.slice(0, 20).every((s) => s === 400)).toBe(true);
    expect(statuses.at(-1)).toBe(429);
  });
});

test.describe("self-service email routes", () => {
  // Safe against production: signed-out requests never send anything.
  for (const path of ["/api/email/welcome", "/api/email/weekly"]) {
    test(`${path} refuses signed-out callers and ignores any body address`, async ({ request }) => {
      const res = await request.post(path, {
        data: { email: "someone-else@example.com", name: "<b>x</b>", programmeId: "adults", mode: "purchase", force: true },
      });
      expect(res.status()).toBe(401);
      const body = await res.text();
      expect(JSON.parse(body)).toEqual({ error: "Sign in required" });
      expect(body).not.toMatch(/resend|webhook|provider|someone-else/i);
    });
  }

  test("welcome email is rate limited per IP", async ({ request }) => {
    test.skip(!local, "local server only");
    const ip = `203.0.113.${Math.floor(Math.random() * 250) + 1}`;
    const statuses: number[] = [];
    for (let i = 0; i < 22; i++) {
      const res = await request.post("/api/email/welcome", {
        headers: { "x-forwarded-for": ip },
        data: { programmeId: "adults" },
      });
      statuses.push(res.status());
      if (res.status() === 429) break;
    }
    expect(statuses.slice(0, 20).every((s) => s === 401)).toBe(true);
    expect(statuses.at(-1)).toBe(429);
  });
});
