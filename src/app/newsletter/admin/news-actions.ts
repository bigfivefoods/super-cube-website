"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getNewsletterAdmin } from "@/lib/newsletter/admin-auth";
import { newsletterDb } from "@/lib/newsletter/db";
import { uploadCover, validatePostInput } from "@/lib/news/admin";
import { NEWS_TABLE, getDbPostById, type NewsRow } from "@/lib/news/db";

export type PostFormState =
  | { ok?: boolean; message?: string; errors?: Record<string, string> }
  | undefined;

/** Every public surface that lists posts: refreshed on publish, edit and unpublish. */
function revalidateNews(slug: string) {
  revalidatePath("/news");
  revalidatePath(`/news/${slug}`);
  revalidatePath(`/news/${slug}/share-image`);
  revalidatePath("/news/feed.xml");
  revalidatePath("/sitemap.xml");
  // Homepage "Latest" strip, in every language.
  revalidatePath("/", "layout");
}

/**
 * Create or update a post. intent: "save" keeps the current status (new posts start as drafts),
 * "publish" makes it public now, "unpublish" takes it off the site (nothing is deleted).
 * The web address is fixed once a post has been published, so shared links keep working.
 */
export async function savePostAction(_prev: PostFormState, form: FormData): Promise<PostFormState> {
  const admin = await getNewsletterAdmin();
  if (!admin.ok) return { message: "Your admin session has ended. Sign in again." };
  const id = String(form.get("id") ?? "");
  const intent = String(form.get("intent") ?? "save");
  const existing = id ? await getDbPostById(id) : null;
  if (id && !existing) return { message: "That post no longer exists." };

  const file = form.get("cover");
  const cover = file instanceof File && file.size > 0 ? file : null;
  const publish = intent === "publish" || (intent === "save" && existing?.status === "published");
  const lockedSlug = existing?.published_at ? existing.slug : null;
  const checked = validatePostInput(form, { publish, hasCover: Boolean(cover || existing?.cover_image), lockedSlug });
  if (!checked.ok) return { errors: checked.errors, message: "Please fix the highlighted fields." };
  const v = checked.value;
  const db = newsletterDb();
  if (!db) return { message: "The store isn’t configured." };

  if (!lockedSlug) {
    const { data: clash } = await db.from(NEWS_TABLE).select("id").eq("slug", v.slug).maybeSingle();
    if (clash && clash.id !== id) return { errors: { slug: "That web address is already used. Choose another." } };
  }

  let coverUrls: { square: string; wide: string } | null = null;
  if (cover) {
    const up = await uploadCover(cover, v.slug);
    if (!up.ok) return { errors: { cover: up.error }, message: "Please fix the highlighted fields." };
    coverUrls = up.urls;
  }

  const now = new Date().toISOString();
  const status = intent === "unpublish" ? "draft" : v.status;
  const row: Partial<NewsRow> = {
    slug: v.slug,
    title: v.title,
    excerpt: v.excerpt,
    body: v.body,
    tag: v.tag,
    cover_alt: v.coverAlt,
    author: v.author,
    status,
    updated_at: now,
    updated_by: admin.email,
    ...(coverUrls ? { cover_image: coverUrls.square, cover_wide: coverUrls.wide } : {}),
    ...(status === "published" && !existing?.published_at ? { published_at: now } : {}),
  };

  let savedId = id;
  if (existing) {
    const { error } = await db.from(NEWS_TABLE).update(row).eq("id", id);
    if (error) return { message: `Couldn’t save: ${error.message}` };
  } else {
    const { data, error } = await db
      .from(NEWS_TABLE)
      .insert({ ...row, created_by: admin.email })
      .select("id")
      .single();
    if (error || !data) return { message: `Couldn’t save: ${error?.message ?? "unknown error"}` };
    savedId = (data as { id: string }).id;
  }

  if (status === "published" || existing?.status === "published") revalidateNews(v.slug);
  revalidatePath("/newsletter/admin");
  const done = intent === "publish" ? "published" : intent === "unpublish" ? "unpublished" : "saved";
  redirect(`/newsletter/admin?tab=news&edit=${savedId}&done=${done}`);
}
