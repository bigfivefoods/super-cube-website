import type { Metadata } from "next";
import { site } from "@/lib/content";

const base = site.url.replace(/\/$/, "");

export function pageMeta(opts: {
  title: string;
  description: string;
  path: string;
  image?: string;
  keywords?: string[];
}): Metadata {
  const url = `${base}${opts.path.startsWith("/") ? opts.path : `/${opts.path}`}`;
  const image = opts.image || "/images/hero/leadership-hero.jpg";
  const keywords = [
    "Super-Cube leadership",
    "leadership development South Africa",
    "human-centric leadership",
    "leadership skills programme",
    "UKZN leadership research",
    ...(opts.keywords || []),
  ];

  return {
    title: opts.title,
    description: opts.description,
    keywords,
    alternates: { canonical: url },
    openGraph: {
      title: `${opts.title} | Super-Cube®`,
      description: opts.description,
      url,
      siteName: site.name,
      type: "website",
      locale: "en_ZA",
      images: [
        {
          url: image,
          width: 1280,
          height: 720,
          alt: opts.title,
        },
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
