import type { MetadataRoute } from "next";
import { insightPosts } from "@/lib/insights";
import { site } from "@/lib/content";

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
    "/research",
    "/about",
    "/pricing",
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
