import { expect, test } from "@playwright/test";
import { redactAnalyticsUrl } from "@/lib/vercel-analytics";

/** Vercel Web Analytics must never receive private codes, query strings or admin pages. */
const O = "https://www.super-cube.me";

test("public pages pass through unchanged (no query, no fragment)", () => {
  expect(redactAnalyticsUrl(`${O}/`)).toBe(`${O}/`);
  expect(redactAnalyticsUrl(`${O}/pricing?plan=pro#top`)).toBe(`${O}/pricing`);
  expect(redactAnalyticsUrl(`${O}/fr/how`)).toBe(`${O}/fr/how`);
  expect(redactAnalyticsUrl(`${O}/news/free-book`)).toBe(`${O}/news/free-book`);
  expect(redactAnalyticsUrl(`${O}/news/leadership-is-learnable-2026-edition`)).toBe(`${O}/news/leadership-is-learnable-2026-edition`);
});

test("utm tags are kept, everything else in the query is dropped", () => {
  expect(redactAnalyticsUrl(`${O}/?utm_source=linkedin&utm_campaign=book&email=a%40b.c`)).toBe(`${O}/?utm_source=linkedin&utm_campaign=book`);
});

test("share, feedback and certificate links lose their codes", () => {
  expect(redactAnalyticsUrl(`${O}/share/report/abc123`)).toBe(`${O}/share/report/:token`);
  expect(redactAnalyticsUrl(`${O}/feedback/360/xyz?x=1`)).toBe(`${O}/feedback/360/:token`);
  expect(redactAnalyticsUrl(`${O}/verify/SC-2026-0001`)).toBe(`${O}/verify/:id`);
  expect(redactAnalyticsUrl(`${O}/learn/x/9f1c2b3a4d5e6f7a8b9c0d1e2f3a`)).toBe(`${O}/learn/x/:token`);
  expect(redactAnalyticsUrl(`${O}/x/eyJhbGciOiJIUzI1NiJ9-AbC_12345xyz`)).toBe(`${O}/x/:token`);
  expect(redactAnalyticsUrl(`${O}/sw/learn/courses/3f2504e0-4f89-11d3-9a0c-0305e82c3301`)).toBe(`${O}/sw/learn/courses/:token`);
});

test("admin, auth and API URLs are not sent at all", () => {
  expect(redactAnalyticsUrl(`${O}/admin/instrument-v2`)).toBeNull();
  expect(redactAnalyticsUrl(`${O}/auth/callback?code=secret`)).toBeNull();
  expect(redactAnalyticsUrl(`${O}/newsletter/admin/preview/12`)).toBeNull();
  expect(redactAnalyticsUrl(`${O}/fr/admin`)).toBeNull();
  expect(redactAnalyticsUrl("not a url")).toBeNull();
});
