/**
 * Content-Security-Policy for every page (wired in next.config.ts).
 *
 * Enforced by default (since stage 8b: report-only on production raised no
 * violations). Build with CSP_MODE=report-only to fall back to report-only
 * without a code change. Violations go to /api/csp-report, which logs them
 * for Vercel runtime logs.
 *
 * Scripts keep 'unsafe-inline' because Next.js inlines its bootstrap and the
 * theme script on statically rendered pages (nonces would force every page to
 * render per request). The policy still blocks scripts, frames and
 * connections to hosts not listed here, plugins, <base> hijacking, form posts
 * to other sites and framing by other sites.
 */

function originOf(url: string | undefined): string | null {
  if (!url) return null;
  try {
    const u = new URL(url.trim());
    if (u.protocol === "https:") return u.origin;
    // Local development stack only (http://localhost:54321).
    if (u.protocol === "http:" && ["localhost", "127.0.0.1"].includes(u.hostname)) return u.origin;
    return null;
  } catch {
    return null;
  }
}

export type CspMode = "report-only" | "enforce";

export function cspMode(env: Record<string, string | undefined> = process.env): CspMode {
  return env.CSP_MODE === "report-only" ? "report-only" : "enforce";
}

export function buildCsp(env: Record<string, string | undefined> = process.env): string {
  const dev = env.NODE_ENV === "development";
  const supabase = originOf(env.NEXT_PUBLIC_SUPABASE_URL);
  const videoCdn = originOf(env.NEXT_PUBLIC_VIDEO_CDN);
  const founderVideo = originOf(env.NEXT_PUBLIC_FOUNDER_VIDEO_URL);
  const supabaseWs = supabase ? supabase.replace(/^http(s?):/, "ws$1:") : null;
  const localStack = Boolean(supabase?.startsWith("http:"));
  const list = (...xs: (string | null | false | undefined)[]) =>
    Array.from(new Set(xs.filter(Boolean) as string[])).join(" ");

  const directives: Record<string, string> = {
    "default-src": "'self'",
    "script-src": list(
      "'self'",
      "'unsafe-inline'",
      dev && "'unsafe-eval'",
      "https://*.googletagmanager.com",
      "https://browser.sentry-cdn.com",
      "https://vercel.live",
    ),
    "style-src": "'self' 'unsafe-inline'",
    "img-src": "'self' data: blob: https:",
    "font-src": "'self' data:",
    "connect-src": list(
      "'self'",
      supabase ?? "https://*.supabase.co",
      supabaseWs ?? "wss://*.supabase.co",
      "https://*.google-analytics.com",
      "https://*.analytics.google.com",
      "https://*.googletagmanager.com",
      "https://*.sentry.io",
      "https://vercel.live",
      "wss://ws-us3.pusher.com",
      videoCdn,
      dev && "ws:",
    ),
    "media-src": list("'self'", "blob:", "data:", videoCdn),
    "frame-src": list(
      "'self'",
      "https://www.youtube.com",
      "https://www.youtube-nocookie.com",
      "https://player.vimeo.com",
      "https://vercel.live",
      founderVideo,
    ),
    "worker-src": "'self' blob:",
    "manifest-src": "'self'",
    "object-src": "'none'",
    "base-uri": "'self'",
    "form-action": "'self' https://checkout.paystack.com",
    "frame-ancestors": "'self'",
    "report-uri": "/api/csp-report",
    "report-to": "csp",
  };
  if (!dev && !localStack) directives["upgrade-insecure-requests"] = "";
  return Object.entries(directives)
    .map(([k, v]) => (v ? `${k} ${v}` : k))
    .join("; ");
}

export function cspHeaders(env: Record<string, string | undefined> = process.env) {
  return [
    {
      key: cspMode(env) === "enforce" ? "Content-Security-Policy" : "Content-Security-Policy-Report-Only",
      value: buildCsp(env),
    },
    { key: "Reporting-Endpoints", value: 'csp="/api/csp-report"' },
  ];
}
