import type { MetadataRoute } from "next";
import { insightPosts } from "@/lib/insights";
import { site } from "@/lib/content";
import { PREFIXED_LOCALES, hreflangAlternates, isTranslatedPath, localizedPath } from "@/lib/i18n/config";

export default function sitemap(): MetadataRoute.Sitemap {
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
