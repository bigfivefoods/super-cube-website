import { site } from "@/lib/content";
import { SHARE_IMAGE } from "@/lib/seo";
import type { NewsPost } from "./types";

export const NEWS_PATH = "/news";
export const NEWS_FEED_PATH = "/news/feed.xml";
const base = site.url.replace(/\/$/, "");

export function newsUrl(slug?: string): string {
  return `${base}${NEWS_PATH}${slug ? `/${slug}` : ""}`;
}

export function absolute(url: string): string {
  return url.startsWith("http") ? url : `${base}${url.startsWith("/") ? url : `/${url}`}`;
}

/** Plain text for <title>, share text and feeds: drops the ® / ™ marks. */
export function stripMarks(s: string): string {
  return s.replace(/[®™]/g, "");
}

/** Keep a meta description within 160 characters, cutting at a word and adding an ellipsis. */
export function clampDescription(text: string, max = 158): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  return `${cut.slice(0, Math.max(cut.lastIndexOf(" "), 80)).replace(/[\s,;:·—–-]+$/, "")}…`;
}

/** "7 October 2026" in South African time. */
export function formatNewsDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-ZA", {
    timeZone: "Africa/Johannesburg",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Reading time at ~220 words a minute. */
export function readingMinutes(body: string): number {
  const words = body.replace(/!\[[^\]]*\]\([^)]*\)/g, "").split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

/** 1200×630 share card for a post: its own card, else the generated one, else the site card. */
export function newsShareImage(post: Pick<NewsPost, "slug" | "title" | "shareImage" | "source">) {
  const alt = stripMarks(post.title);
  if (post.shareImage) return { url: post.shareImage, width: 1200, height: 630, alt, type: "image/jpeg" };
  if (post.source === "db") return { url: `${NEWS_PATH}/${post.slug}/share-image`, width: 1200, height: 630, alt, type: "image/png" };
  return { ...SHARE_IMAGE, alt };
}

const org = {
  "@type": "Organization",
  name: site.name,
  url: base,
  logo: { "@type": "ImageObject", url: `${base}/icons/icon-512.png` },
};

/** schema.org NewsArticle for a published post. */
export function newsArticleJsonLd(post: NewsPost) {
  const share = newsShareImage(post);
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: stripMarks(post.title).slice(0, 110),
    description: stripMarks(post.excerpt),
    image: Array.from(new Set([share.url, post.coverImage].map(absolute))),
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt,
    author: post.author ? { "@type": "Person", name: post.author, url: `${base}/about` } : org,
    publisher: org,
    mainEntityOfPage: { "@type": "WebPage", "@id": newsUrl(post.slug) },
    url: newsUrl(post.slug),
    inLanguage: "en-ZA",
  };
}
