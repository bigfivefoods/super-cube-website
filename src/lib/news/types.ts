/**
 * Super-Cube® News: public posts on /news (the bigfivegroup.africa /updates pattern).
 * Posts come from code (seeded launch posts) and, once an admin publishes one, from Supabase.
 */
export type NewsStatus = "draft" | "published";

export type NewsPost = {
  id: string;
  slug: string;
  title: string;
  /** Standfirst: one or two sentences under the headline, on cards and in the feed. */
  excerpt: string;
  /** Simple markdown: ## headings, paragraphs, - lists, **bold**, *italic*, [links](/x), ![alt](/img.jpg). */
  body: string;
  /** Short label above the title, e.g. "Learn · Super-Cube® LMS". */
  tag: string;
  status: NewsStatus;
  /** Square cover (cards, homepage strip, email). Path under /public or an https URL. */
  coverImage: string;
  /** Optional landscape version for the full-width post hero (falls back to coverImage). */
  coverWide?: string;
  /**
   * Optional hero background for the post page (square, phones; falls back to the calm News hero).
   * Must be quiet artwork that never competes with the headline: no charts, text or busy screenshots.
   */
  heroImage?: string;
  /** Optional landscape hero background (from 640px). */
  heroWide?: string;
  /** Alt text for the cover ("" when decorative). */
  coverAlt: string;
  /** 1200×630 share card (Open Graph / X). Falls back to the generated share image. */
  shareImage?: string;
  /** Byline shown at the top of the article. */
  author?: string;
  /** ISO timestamps (UTC). */
  publishedAt: string;
  updatedAt: string;
  /** Where the post lives: code (read-only seed) or the database (admin-authored). */
  source: "code" | "db";
};
