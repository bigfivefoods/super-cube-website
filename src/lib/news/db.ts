import { newsletterDb } from "@/lib/newsletter/db";
import { codeNewsPosts } from "./posts";
import type { NewsPost, NewsStatus } from "./types";

/**
 * Admin-authored posts in public.news_posts (service role; RLS on, no public policies).
 * Public pages read them through store.ts, which merges them with the code posts.
 */
export const NEWS_TABLE = "news_posts";
export const NEWS_BUCKET = "news-media";

export type NewsRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  tag: string;
  status: NewsStatus;
  cover_image: string | null;
  cover_wide: string | null;
  cover_alt: string;
  author: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  created_by?: string | null;
  updated_by?: string | null;
};

const COLUMNS =
  "id,slug,title,excerpt,body,tag,status,cover_image,cover_wide,cover_alt,author,published_at,created_at,updated_at,created_by,updated_by";

/** Shown only while a draft has no cover yet (publishing needs a cover). */
export const FALLBACK_COVER = "/images/og/super-cube-share.jpg";

export function rowToPost(r: NewsRow): NewsPost {
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    excerpt: r.excerpt,
    body: r.body,
    tag: r.tag || "News",
    status: r.status,
    coverImage: r.cover_image || FALLBACK_COVER,
    coverWide: r.cover_wide || undefined,
    coverAlt: r.cover_alt ?? "",
    author: r.author || undefined,
    publishedAt: r.published_at || r.created_at,
    updatedAt: r.updated_at,
    source: "db",
  };
}

/** Slugs the admin can't use: code posts and paths under /news. */
export const RESERVED_SLUGS = new Set<string>([
  ...codeNewsPosts.map((p) => p.slug),
  "feed",
  "feed-xml",
  "rss",
  "preview",
  "share-image",
]);

export function slugify(s: string): string {
  return s
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/®|™/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90)
    .replace(/-+$/g, "");
}

const TIMEOUT_MS = 4000;

/** Published DB posts (published_at in the past), newest first. [] when the store is unavailable. */
export async function listPublishedDbPosts(): Promise<NewsPost[]> {
  const db = newsletterDb();
  if (!db) return [];
  try {
    const { data, error } = await db
      .from(NEWS_TABLE)
      .select(COLUMNS)
      .eq("status", "published")
      .lte("published_at", new Date().toISOString())
      .order("published_at", { ascending: false })
      .limit(500)
      .abortSignal(AbortSignal.timeout(TIMEOUT_MS));
    if (error) {
      console.error("[news] list failed", error.message);
      return [];
    }
    return ((data ?? []) as NewsRow[]).map(rowToPost);
  } catch (e) {
    console.error("[news] list failed", e instanceof Error ? e.message : e);
    return [];
  }
}

/** Every DB post for the admin (drafts included), newest first. */
export async function listAllDbPosts(): Promise<{ rows: NewsRow[]; error: string | null }> {
  const db = newsletterDb();
  if (!db) return { rows: [], error: "The store isn’t configured (Supabase URL / service role key)." };
  const { data, error } = await db
    .from(NEWS_TABLE)
    .select(COLUMNS)
    .order("updated_at", { ascending: false })
    .limit(500);
  return { rows: (data ?? []) as NewsRow[], error: error?.message ?? null };
}

export async function getDbPostById(id: string): Promise<NewsRow | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const db = newsletterDb();
  if (!db) return null;
  const { data } = await db.from(NEWS_TABLE).select(COLUMNS).eq("id", id).maybeSingle();
  return (data as NewsRow | null) ?? null;
}
