import { codeNewsPosts } from "./posts";
import type { NewsPost } from "./types";

const byNewest = (a: NewsPost, b: NewsPost) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt);

/** Published posts, newest first. */
export async function listPublishedNews(): Promise<NewsPost[]> {
  return codeNewsPosts.filter((p) => p.status === "published").sort(byNewest);
}

/** One published post by slug, or null. */
export async function getPublishedNews(slug: string): Promise<NewsPost | null> {
  const posts = await listPublishedNews();
  return posts.find((p) => p.slug === slug) ?? null;
}
