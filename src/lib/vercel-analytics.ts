/**
 * Vercel Web Analytics: what super-cube.me sends (page views only, cookieless, no personal data).
 *
 * Every page view passes through `redactAnalyticsUrl` first:
 * - private areas (admin, auth callbacks, newsletter admin) are not sent at all;
 * - share, feedback and certificate links lose their token / id (e.g. /share/report/:token);
 * - any other long token-like path segment becomes ":token";
 * - query strings are dropped except utm_* campaign tags, and the #fragment is dropped.
 *
 * The daily totals feed the Investors Website Insights on bigfivegroup.africa.
 */

import { PREFIXED_LOCALES } from "@/lib/i18n/config";

const SKIP = [/^\/admin(\/|$)/, /^\/auth(\/|$)/, /^\/newsletter\/admin(\/|$)/, /^\/api(\/|$)/];

const TOKEN_ROUTES: [RegExp, string][] = [
  [/^\/share\/report\/[^/]+/, "/share/report/:token"],
  [/^\/feedback\/360\/[^/]+/, "/feedback/360/:token"],
  [/^\/verify\/[^/]+/, "/verify/:id"],
];

// uuid · 20+ letters/digits with a digit and no hyphen · mixed-case base64url of 24+ (lower-case
// hyphenated slugs such as /news/leadership-is-learnable-2026-edition are kept)
const TOKENISH = [
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
  /^(?=.*\d)[A-Za-z0-9_]{20,}$/,
  /^(?=.*\d)(?=.*[A-Z])(?=.*[a-z])[A-Za-z0-9_-]{24,}$/,
];

/** Returns the URL to record, or null to record nothing. */
export function redactAnalyticsUrl(raw: string): string | null {
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    return null;
  }
  // locale prefix (/fr/…) is kept; rules apply to the rest of the path
  const m = u.pathname.match(/^\/([a-z]{2})(\/.*|$)/);
  const prefix = m && (PREFIXED_LOCALES as readonly string[]).includes(m[1]!) ? `/${m[1]}` : "";
  let path = prefix ? m![2] || "/" : u.pathname;
  if (SKIP.some((re) => re.test(path))) return null;
  for (const [re, to] of TOKEN_ROUTES) {
    if (re.test(path)) {
      path = path.replace(re, to);
      break;
    }
  }
  path = path
    .split("/")
    .map((seg) => (TOKENISH.some((re) => re.test(seg)) ? ":token" : seg))
    .join("/");
  const keep = new URLSearchParams();
  u.searchParams.forEach((v, k) => {
    if (/^utm_(source|medium|campaign|content|term)$/.test(k)) keep.set(k, v.slice(0, 100));
  });
  const qs = keep.toString();
  return `${u.origin}${prefix}${path}${qs ? `?${qs}` : ""}`;
}
