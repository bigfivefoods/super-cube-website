import { RESERVED_SLUGS, slugify } from "./db";
import type { NewsStatus } from "./types";

export type PostInput = {
  title: string;
  slug: string;
  tag: string;
  excerpt: string;
  body: string;
  coverAlt: string;
  author: string | null;
  status: NewsStatus;
};

export type PostInputResult = { ok: true; value: PostInput } | { ok: false; errors: Partial<Record<keyof PostInput | "cover", string>> };

const clean = (v: FormDataEntryValue | null, max: number) =>
  String(v ?? "")
    .replace(/\r\n/g, "\n")
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "")
    .trim()
    .slice(0, max);

/** Normalise and check the post form. Publishing needs a cover, an excerpt and a body. */
export function validatePostInput(
  form: FormData,
  opts: { publish: boolean; hasCover: boolean; lockedSlug?: string | null },
): PostInputResult {
  const title = clean(form.get("title"), 200).replace(/\s+/g, " ");
  const excerpt = clean(form.get("excerpt"), 400).replace(/\s+/g, " ");
  const body = clean(form.get("body"), 60000);
  const tag = clean(form.get("tag"), 80).replace(/\s+/g, " ") || "News";
  const coverAlt = clean(form.get("coverAlt"), 400).replace(/\s+/g, " ");
  const author = clean(form.get("author"), 100).replace(/\s+/g, " ") || null;
  const slug = opts.lockedSlug || slugify(clean(form.get("slug"), 120) || title);
  const errors: Partial<Record<keyof PostInput | "cover", string>> = {};

  if (title.length < 3) errors.title = "Add a title (at least 3 characters).";
  else if (title.length > 160) errors.title = "Keep the title to 160 characters.";
  if (!opts.lockedSlug) {
    if (slug.length < 3) errors.slug = "The web address needs at least 3 letters or numbers.";
    else if (RESERVED_SLUGS.has(slug)) errors.slug = "That web address is already used. Choose another.";
  }
  if (excerpt.length > 320) errors.excerpt = "Keep the summary to 320 characters.";
  if (tag.length > 60) errors.tag = "Keep the label to 60 characters.";
  if (coverAlt.length > 300) errors.coverAlt = "Keep the image description to 300 characters.";
  if (author && author.length > 80) errors.author = "Keep the byline to 80 characters.";
  if (opts.publish) {
    if (excerpt.length < 20) errors.excerpt = "Add a one- or two-sentence summary before publishing.";
    if (body.length < 40) errors.body = "Write the post before publishing.";
    if (!opts.hasCover) errors.cover = "Add a cover image before publishing.";
  }
  if (Object.keys(errors).length) return { ok: false, errors };
  return {
    ok: true,
    value: { title, slug, tag, excerpt, body, coverAlt, author, status: opts.publish ? "published" : "draft" },
  };
}
