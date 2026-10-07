"use client";

import { useActionState, useState } from "react";
import { savePostAction, type PostFormState } from "./news-actions";

const inputCls =
  "mt-1 block min-h-11 w-full rounded-xl border border-line-strong bg-elevated px-3 text-sm text-ink aria-[invalid=true]:border-red-600";
const labelCls = "text-sm font-medium text-ink";
const hintCls = "mt-1 text-xs text-muted";

export type PostFormValues = {
  id?: string;
  title: string;
  slug: string;
  tag: string;
  excerpt: string;
  body: string;
  coverAlt: string;
  author: string;
  status: "draft" | "published";
  coverImage?: string | null;
  slugLocked: boolean;
};

function slugPreview(s: string) {
  return s
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/®|™/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

/** Write or edit a news post. Covers are cropped to square + landscape on upload. */
export function PostForm({ values }: { values: PostFormValues }) {
  const [state, action, pending] = useActionState<PostFormState, FormData>(savePostAction, undefined);
  const [title, setTitle] = useState(values.title);
  const [slug, setSlug] = useState(values.slug);
  const [excerpt, setExcerpt] = useState(values.excerpt);
  // Controlled fields: React resets uncontrolled ones after a form action, which would lose work on an error.
  const [body, setBody] = useState(values.body);
  const [coverAlt, setCoverAlt] = useState(values.coverAlt);
  const [tag, setTag] = useState(values.tag);
  const [author, setAuthor] = useState(values.author);
  const errors = state?.errors ?? {};
  const shownSlug = values.slugLocked ? values.slug : slugPreview(slug || title);
  const field = (name: string, hint?: string) => ({
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": [hint, errors[name] ? `post-${name}-err` : ""].filter(Boolean).join(" ") || undefined,
  });
  const err = (name: string) =>
    errors[name] ? (
      <p id={`post-${name}-err`} className="mt-1 text-sm font-medium text-red-700">
        {errors[name]}
      </p>
    ) : null;

  return (
    <form action={action} className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1fr)_20rem]" noValidate>
      {values.id && <input type="hidden" name="id" value={values.id} />}
      <div className="space-y-5">
        <div>
          <label htmlFor="post-title" className={labelCls}>Title</label>
          <input id="post-title" name="title" value={title} onChange={(e) => setTitle(e.target.value)} required maxLength={160} className={inputCls} {...field("title")} />
          {err("title")}
        </div>
        <div>
          <label htmlFor="post-slug" className={labelCls}>Web address</label>
          {values.slugLocked ? (
            <>
              <input type="hidden" name="slug" value={values.slug} />
              <p id="post-slug" className="mt-1 text-sm text-slate">super-cube.me/news/<strong className="text-ink">{values.slug}</strong></p>
              <p className={hintCls}>Fixed after publishing, so shared links keep working.</p>
            </>
          ) : (
            <>
              <input id="post-slug" name="slug" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="Made from the title if left empty" maxLength={90} className={inputCls} {...field("slug", "post-slug-hint")} />
              <p id="post-slug-hint" className={hintCls}>super-cube.me/news/{shownSlug || "…"}</p>
              {err("slug")}
            </>
          )}
        </div>
        <div>
          <label htmlFor="post-excerpt" className={labelCls}>Summary</label>
          <textarea id="post-excerpt" name="excerpt" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={3} maxLength={320} className={`${inputCls} py-2`} {...field("excerpt", "post-excerpt-hint")} />
          <p id="post-excerpt-hint" className={hintCls}>One or two sentences under the headline, on cards, in the feed and in share previews. {excerpt.length}/320</p>
          {err("excerpt")}
        </div>
        <div>
          <label htmlFor="post-body" className={labelCls}>Post</label>
          <textarea id="post-body" name="body" value={body} onChange={(e) => setBody(e.target.value)} rows={22} className={`${inputCls} py-2 font-mono text-[0.8125rem] leading-relaxed`} {...field("body", "post-body-hint")} />
          <p id="post-body-hint" className={hintCls}>
            Blank line between paragraphs. <code>## Heading</code>, <code>- list item</code>, <code>**bold**</code>, <code>*italic*</code>, <code>[link text](/pricing)</code>, <code>&gt; quote</code>, and an image on its own line: <code>![description](https://…)</code>. Write the brand as Super-Cube®.
          </p>
          {err("body")}
        </div>
      </div>

      <div className="space-y-5">
        <div className="rounded-2xl border border-line bg-elevated p-4">
          <p className="text-sm font-semibold text-ink">
            Status: {values.status === "published" ? "Published" : values.id ? "Draft" : "New draft"}
          </p>
          <div className="mt-3 flex flex-col gap-2">
            {values.status === "published" ? (
              <>
                <button type="submit" name="intent" value="save" disabled={pending} className="sc-btn-primary inline-flex min-h-11 items-center justify-center rounded-full px-5 text-sm font-semibold">
                  {pending ? "Saving…" : "Save changes"}
                </button>
                <button type="submit" name="intent" value="unpublish" disabled={pending} className="inline-flex min-h-11 items-center justify-center rounded-full border border-line-strong px-5 text-sm font-semibold text-ink">
                  Unpublish
                </button>
              </>
            ) : (
              <>
                <button type="submit" name="intent" value="publish" disabled={pending} className="sc-btn-primary inline-flex min-h-11 items-center justify-center rounded-full px-5 text-sm font-semibold">
                  {pending ? "Saving…" : "Publish now"}
                </button>
                <button type="submit" name="intent" value="save" disabled={pending} className="inline-flex min-h-11 items-center justify-center rounded-full border border-line-strong px-5 text-sm font-semibold text-ink">
                  Save draft
                </button>
              </>
            )}
          </div>
          <p className={hintCls}>Publishing puts the post on /news, the homepage, the RSS feed and the sitemap. It does not email anyone.</p>
          {state?.message && (
            <p className="mt-3 text-sm font-medium text-red-700" role="alert">{state.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="post-cover" className={labelCls}>Cover image</label>
          {values.coverImage && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={values.coverImage} alt="" width={160} height={160} className="mt-2 aspect-square w-40 rounded-xl object-cover" />
          )}
          <input id="post-cover" name="cover" type="file" accept="image/jpeg,image/png,image/webp" className="mt-2 block w-full text-sm text-slate file:mr-3 file:min-h-11 file:rounded-full file:border file:border-line-strong file:bg-paper file:px-4 file:text-sm file:font-semibold file:text-ink" {...field("cover", "post-cover-hint")} />
          <p id="post-cover-hint" className={hintCls}>JPEG, PNG or WebP up to 4 MB, at least 1200 px wide. We crop a square (cards, phones, email) and a landscape version (desktop hero).{values.coverImage ? " Choose a file only to replace the current cover." : ""}</p>
          {err("cover")}
        </div>
        <div>
          <label htmlFor="post-coverAlt" className={labelCls}>Image description</label>
          <input id="post-coverAlt" name="coverAlt" value={coverAlt} onChange={(e) => setCoverAlt(e.target.value)} maxLength={300} className={inputCls} {...field("coverAlt", "post-coverAlt-hint")} />
          <p id="post-coverAlt-hint" className={hintCls}>What the image shows, for screen readers. Leave empty if it’s decorative.</p>
          {err("coverAlt")}
        </div>
        <div>
          <label htmlFor="post-tag" className={labelCls}>Label</label>
          <input id="post-tag" name="tag" value={tag} onChange={(e) => setTag(e.target.value)} maxLength={60} className={inputCls} {...field("tag", "post-tag-hint")} />
          <p id="post-tag-hint" className={hintCls}>Short line above the title, e.g. “Learn · Super-Cube® LMS”.</p>
          {err("tag")}
        </div>
        <div>
          <label htmlFor="post-author" className={labelCls}>Byline (optional)</label>
          <input id="post-author" name="author" value={author} onChange={(e) => setAuthor(e.target.value)} maxLength={80} className={inputCls} {...field("author")} />
          {err("author")}
        </div>
      </div>
    </form>
  );
}
