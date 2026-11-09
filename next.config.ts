import type { NextConfig } from "next";
import { cspHeaders, LTI_API_SOURCE, LTI_PAGE_SOURCE, SITE_SECURITY_SOURCE } from "./src/lib/csp";
import { PREFIXED_LOCALES, TRANSLATED_PATHS } from "./src/lib/i18n/config";

/** First path segments of the translated pages ("/faq" → "faq"; the home page needs none). */
const TRANSLATED_SEGMENTS = TRANSLATED_PATHS.map((p) => p.slice(1)).filter(Boolean);

const sharedSecurityHeaders = [
  { key: "X-DNS-Prefetch-Control", value: "on" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
];

const securityHeaders = [
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  ...sharedSecurityHeaders,
  ...cspHeaders(),
];

/** Launch and deep-link screens may be framed. The return form may post to the LMS. */
const ltiApiHeaders = [...sharedSecurityHeaders, ...cspHeaders(process.env, "lti")];
const ltiPageHeaders = [...sharedSecurityHeaders, ...cspHeaders(process.env, "embed")];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  compress: true,
  experimental: {
    // News cover uploads in the admin (covers ≤ 4 MB; Vercel caps request bodies at 4.5 MB).
    serverActions: { bodySizeLimit: "4.5mb" },
  },
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    qualities: [60, 75],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  async redirects() {
    return [
      // Short Why URL, with or without a language prefix, goes straight to the canonical page.
      // Listed before the language-prefix strip so /fr/why keeps French.
      { source: `/:locale(${PREFIXED_LOCALES.join("|")})/why`, destination: "/:locale/why-leadership", permanent: true },
      { source: "/why", destination: "/why-leadership", permanent: true },
      {
        // Languages (src/lib/i18n/config.ts): TRANSLATED_PATHS and the Learn app (/learn/…) have
        // /fr, /ar, /pt, /sw, /zu and /af versions. Any other page under a language prefix goes to
        // its English page. Account outside Learn, admin and API routes stay unprefixed.
        source: `/:locale(${PREFIXED_LOCALES.join("|")})/:path((?!(?:${TRANSLATED_SEGMENTS.join("|")}|learn)(?:/|$)).+)`,
        destination: "/:path",
        permanent: false,
      },
      // While the home page is English-only, a bare /fr, /ar … goes to it.
      ...((TRANSLATED_PATHS as readonly string[]).includes("/")
        ? []
        : [{ source: `/:locale(${PREFIXED_LOCALES.join("|")})`, destination: "/", permanent: false }]),
      // The JCM paper's file was renamed (no case-company name in the URL); old links keep working.
      {
        source: "/research/jcm-2022-kwaden-leadership-skills-model.pdf",
        destination: "/research/jcm-2022-leadership-skills-model.pdf",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: SITE_SECURITY_SOURCE,
        headers: securityHeaders,
      },
      {
        source: LTI_API_SOURCE,
        headers: ltiApiHeaders,
      },
      {
        source: LTI_PAGE_SOURCE,
        headers: ltiPageHeaders,
      },
      {
        // Private growth-report links: never index, cache or leak the token in a Referer
        source: "/share/:path*",
        headers: [
          { key: "Referrer-Policy", value: "no-referrer" },
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          { key: "Cache-Control", value: "private, no-store" },
        ],
      },
      {
        source: "/icons/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/brand/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/images/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=2592000, stale-while-revalidate=86400",
          },
        ],
      },
      {
        // Apple Pay / Paystack domain verification (must be text/plain, no extension)
        source:
          "/.well-known/apple-developer-merchantid-domain-association",
        headers: [
          { key: "Content-Type", value: "text/plain" },
          {
            key: "Cache-Control",
            value: "public, max-age=86400",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
