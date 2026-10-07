import { listPublishedDbPosts } from "./db";
import { codeNewsPosts } from "./posts";
import type { NewsPost } from "./types";

const byNewest = (a: NewsPost, b: NewsPost) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt);

/**
 * Published posts, newest first: the seeded code posts plus posts published in the admin.
 * A code post wins if a slug ever collides (the admin blocks code slugs anyway).
 */
export async function listPublishedNews(): Promise<NewsPost[]> {
  const code = codeNewsPosts.filter((p) => p.status === "published");
  const taken = new Set(code.map((p) => p.slug));
  const db = (await listPublishedDbPosts()).filter((p) => !taken.has(p.slug));
  return [...code, ...db].sort(byNewest);
}

/** One published post by slug, or null. */
export async function getPublishedNews(slug: string): Promise<NewsPost | null> {
  const posts = await listPublishedNews();
  return posts.find((p) => p.slug === slug) ?? null;
}
