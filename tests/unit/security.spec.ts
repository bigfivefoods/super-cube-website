import { expect, test } from "@playwright/test";
import { buildCsp, cspHeaders, cspMode } from "../../src/lib/csp";
import { clientIp, hashKey, memoryHit } from "../../src/lib/server/rate-limit";

test("CSP defaults to report-only and switches to enforce", () => {
  expect(cspMode({})).toBe("report-only");
  expect(cspHeaders({})[0].key).toBe("Content-Security-Policy-Report-Only");
  expect(cspHeaders({ CSP_MODE: "enforce" })[0].key).toBe("Content-Security-Policy");
});

test("CSP lists the Supabase project and optional video hosts, nothing else", () => {
  const csp = buildCsp({
    NEXT_PUBLIC_SUPABASE_URL: "https://abc.supabase.co",
    NEXT_PUBLIC_VIDEO_CDN: "https://cdn.example.org/super-cube",
    NEXT_PUBLIC_FOUNDER_VIDEO_URL: "javascript:alert(1)",
  });
  expect(csp).toContain("connect-src 'self' https://abc.supabase.co wss://abc.supabase.co");
  expect(csp).toContain("media-src 'self' blob: data: https://cdn.example.org");
  expect(csp).not.toContain("javascript:");
  expect(csp).not.toContain("'unsafe-eval'");
  expect(csp).toContain("object-src 'none'");
  expect(csp).toContain("upgrade-insecure-requests");
});

test("rate-limit window counts per key and resets", () => {
  const rule = { limit: 3, windowSec: 60 };
  const t = 1_800_000_000_000;
  const k = hashKey("t", "ip:1.2.3.4");
  expect([1, 2, 3, 4].map((i) => memoryHit("t", k, rule, t + i).allowed)).toEqual([true, true, true, false]);
  expect(memoryHit("t", hashKey("t", "ip:5.6.7.8"), rule, t).allowed).toBe(true);
  expect(memoryHit("t", k, rule, t + 61_000).allowed).toBe(true);
  expect(memoryHit("t", k, rule, t + 61_001).retryAfter).toBeGreaterThan(0);
});

test("keys are hashed and the client IP is the first forwarded hop", () => {
  expect(hashKey("a", "ip:1.2.3.4")).toMatch(/^[0-9a-f]{64}$/);
  expect(hashKey("a", "ip:1.2.3.4")).not.toBe(hashKey("b", "ip:1.2.3.4"));
  expect(clientIp(new Headers({ "x-forwarded-for": "203.0.113.9, 10.0.0.1" }))).toBe("203.0.113.9");
  expect(clientIp(new Headers())).toBe("unknown");
});

test("a local http Supabase stack is allowed without upgrading requests", () => {
  const csp = buildCsp({ NEXT_PUBLIC_SUPABASE_URL: "http://localhost:54321" });
  expect(csp).toContain("http://localhost:54321 ws://localhost:54321");
  expect(csp).not.toContain("upgrade-insecure-requests");
  expect(buildCsp({ NEXT_PUBLIC_SUPABASE_URL: "http://evil.example" })).not.toContain("http://evil.example");
});
