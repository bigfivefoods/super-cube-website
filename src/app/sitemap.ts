import type { MetadataRoute } from "next";
import { insightPosts } from "@/lib/insights";
import { listPublishedNews } from "@/lib/news/store";
import { site } from "@/lib/content";
import { PREFIXED_LOCALES, hreflangAlternates, isTranslatedPath, localizedPath } from "@/lib/i18n/config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = site.url.replace(/\/$/, "");
  const now = new Date();

  const staticPaths = [
    "",
    "/the-model",
    "/constructs",
    "/what",
    "/how",
    "/why-leadership",
    "/why",
    "/leadership-challenges",
    "/research",
    "/about",
    "/pricing",
    "/organisations",
    "/schools",
    "/speaking",
    "/learn/start",
    "/sample-report",
    "/impact",
    "/practices",
    "/facilitator",
    "/insights",
    "/media",
    "/book",
    "/contact",
    "/certify",
    "/community",
    "/team",
    "/pilot-pack",
    "/faq",
    "/privacy",
    "/terms",
  ];

  const entries: MetadataRoute.Sitemap = staticPaths.map((path) => ({
    url: `${base}${path || "/"}`,
    lastModified: now,
    changeFrequency: path === "" || path === "/learn/start" ? "weekly" : "monthly",
    priority:
      path === ""
        ? 1
        : path === "/learn/start" || path === "/the-model" || path === "/constructs"
          ? 0.9
          : 0.7,
  }));

  // Translated pages: hreflang alternates on the English entry, plus one entry per language.
  for (const entry of [...entries]) {
    const path = entry.url.slice(base.length) || "/";
    if (!isTranslatedPath(path)) continue;
    const languages = Object.fromEntries(
      Object.entries(hreflangAlternates(path)).map(([lang, p]) => [lang, `${base}${p === "/" ? "/" : p}`]),
    );
    entry.alternates = { languages };
    for (const locale of PREFIXED_LOCALES) {
      entries.push({ ...entry, url: `${base}${localizedPath(locale, path)}`, priority: 0.6 });
    }
  }

  const news = await listPublishedNews();
  entries.push({
    url: `${base}/news`,
    lastModified: news[0] ? new Date(news[0].updatedAt || news[0].publishedAt) : now,
    changeFrequency: "weekly",
    priority: 0.8,
  });
  for (const post of news) {
    entries.push({
      url: `${base}/news/${post.slug}`,
      lastModified: new Date(post.updatedAt || post.publishedAt),
      changeFrequency: "monthly",
      priority: 0.7,
    });
  }

  for (const post of insightPosts) {
    entries.push({
      url: `${base}/insights/${post.slug}`,
      lastModified: new Date(post.date),
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }

  return entries;
}
