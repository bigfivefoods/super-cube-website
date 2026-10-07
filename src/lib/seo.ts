import type { Metadata } from "next";
import { site } from "@/lib/content";
import {
  LOCALE_OG,
  hreflangAlternates,
  isTranslatedPath,
  localizedPath,
  stripLocale,
  type PrefixedLocale,
  type TranslatedPath,
} from "@/lib/i18n/config";

const base = site.url.replace(/\/$/, "");

/** Optimised social share card (1200×630, ~40 KB): cube logo, not the hero photo. */
export const SHARE_IMAGE = {
  url: "/images/og/super-cube-share.jpg",
  width: 1200,
  height: 630,
  alt: "Super-Cube® leadership model logo: human-centric leadership development",
} as const;

/**
 * hreflang (the bigfivegroup.africa pattern): a translated page lists every language's URL plus
 * x-default (English), on the English and the translated URLs alike. Pages that exist in English
 * only declare just themselves.
 */
export function pageLanguages(url: string): Record<string, string> {
  const path = stripLocale(url.startsWith(base) ? url.slice(base.length) || "/" : "/");
  if (!isTranslatedPath(path)) return { en: url, "x-default": url };
  const out: Record<string, string> = {};
  for (const [lang, p] of Object.entries(hreflangAlternates(path))) out[lang] = absoluteUrl(p);
  return out;
}

/**
 * Metadata for a translated page: localised title and description, canonical on its own URL,
 * the full hreflang cluster and the Open Graph locale. Super-Cube® keeps its ® in every language.
 */
export function localeMeta(opts: {
  locale: PrefixedLocale;
  path: TranslatedPath;
  title: string;
  description: string;
  absoluteTitle?: boolean;
}): Metadata {
  const url = absoluteUrl(localizedPath(opts.locale, opts.path));
  const title = opts.absoluteTitle ? opts.title : `${opts.title} | Super-Cube®`;
  return {
    title: { absolute: title },
    description: opts.description,
    alternates: { canonical: url, languages: pageLanguages(url) },
    openGraph: {
      title,
      description: opts.description,
      url,
      siteName: site.name,
      type: "website",
      locale: LOCALE_OG[opts.locale],
      images: [{ ...SHARE_IMAGE }],
    },
    twitter: { card: "summary_large_image", title, description: opts.description, images: [SHARE_IMAGE.url] },
  };
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
