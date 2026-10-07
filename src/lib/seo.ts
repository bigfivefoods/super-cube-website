import type { Metadata } from "next";
import { site } from "@/lib/content";

const base = site.url.replace(/\/$/, "");

/** Optimised social share card (1200×630, ~40 KB): cube logo, not the hero photo. */
export const SHARE_IMAGE = {
  url: "/images/og/super-cube-share.jpg",
  width: 1200,
  height: 630,
  alt: "Super-Cube® leadership model logo: human-centric leadership development",
} as const;

/**
 * hreflang: isiZulu and Afrikaans are a client-side toggle on the same URL
 * (English is server-rendered), so there are no separate language URLs to
 * advertise. Declare only the English page + x-default, both self-referencing.
 */
export function pageLanguages(url: string) {
  return { "en-ZA": url, "x-default": url };
}

export function absoluteUrl(path: string) {
  return `${base}${path === "/" ? "" : path.startsWith("/") ? path : `/${path}`}`;
}

export function pageMeta(opts: {
  title: string;
  description: string;
  path: string;
  image?: string;
  keywords?: string[];
  /** Keep out of search results (private / tokenised pages). */
  noIndex?: boolean;
}): Metadata {
  const url = absoluteUrl(opts.path);
  const image = opts.image || SHARE_IMAGE.url;
  const keywords = [
    "Super-Cube® leadership",
    "leadership development South Africa",
    "human-centric leadership",
    "leadership skills programme",
    "UKZN leadership research",
    ...(opts.keywords || []),
  ];

  return {
    // Absolute so nested layouts with their own titles never drop the suffix.
    title: { absolute: `${opts.title} | Super-Cube®` },
    description: opts.description,
    keywords,
    alternates: {
      canonical: url,
      languages: pageLanguages(url),
    },
    ...(opts.noIndex
      ? { robots: { index: false, follow: false, googleBot: { index: false, follow: false } } }
      : {}),
    openGraph: {
      title: `${opts.title} | Super-Cube®`,
      description: opts.description,
      url,
      siteName: site.name,
      type: "website",
      locale: "en_ZA",
      images: [
        opts.image
          ? { url: image, alt: opts.title }
          : { ...SHARE_IMAGE },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${opts.title} | Super-Cube®`,
      description: opts.description,
      images: [image],
    },
  };
}

export function courseJsonLdExtra() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: site.name,
    url: base,
    description: site.description,
    potentialAction: {
      "@type": "SearchAction",
      target: `${base}/constructs`,
      "query-input": "required name=search_term_string",
    },
  };
}
