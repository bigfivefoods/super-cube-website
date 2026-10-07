import Link from "next/link";
import { codeNewsPosts } from "@/lib/news/posts";
import { getDbPostById, listAllDbPosts, type NewsRow } from "@/lib/news/db";
import { PostForm, type PostFormValues } from "./PostForm";

function fmt(iso: string | null | undefined) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-ZA", { timeZone: "Africa/Johannesburg", dateStyle: "medium", timeStyle: "short" });
}

const DONE: Record<string, string> = {
  published: "Published. It’s live on /news, the homepage, the RSS feed and the sitemap.",
  unpublished: "Unpublished. The post is off the site and kept as a draft.",
  saved: "Saved.",
};

const pill = (on: boolean) =>
  `inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${on ? "bg-emerald-100 text-emerald-900" : "bg-surface text-slate border border-line"}`;
const linkCls = "font-semibold text-ink underline underline-offset-2";

function toValues(r: NewsRow | null): PostFormValues {
  return {
    id: r?.id,
    title: r?.title ?? "",
    slug: r?.slug ?? "",
    tag: r?.tag ?? "News",
    excerpt: r?.excerpt ?? "",
    body: r?.body ?? "",
    coverAlt: r?.cover_alt ?? "",
    author: r?.author ?? "",
    status: r?.status ?? "draft",
    coverImage: r?.cover_image,
    slugLocked: Boolean(r?.published_at),
  };
}

/** Admin › News: write, preview, publish and unpublish posts for /news. */
export async function NewsTab({ edit, done }: { edit?: string; done?: string }) {
  if (edit) {
    const row = edit === "new" ? null : await getDbPostById(edit);
    if (edit !== "new" && !row) {
      return (
        <p className="mt-8 text-slate" role="alert">
          That post wasn’t found. <Link href="/newsletter/admin?tab=news" className={linkCls}>Back to news</Link>
        </p>
      );
    }
    return (
      <div className="mt-8">
        <p className="text-sm">
          <Link href="/newsletter/admin?tab=news" className={linkCls}>← All posts</Link>
        </p>
        <h2 className="mt-3 text-xl font-semibold tracking-tight text-ink">{row ? "Edit post" : "New post"}</h2>
        {done && DONE[done] && (
          <p className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900" role="status">
            {DONE[done]}
          </p>
        )}
        {row && (
          <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
            <Link href={`/newsletter/admin/preview/${row.id}`} className={linkCls} target="_blank">Preview</Link>
            {row.status === "published" && (
              <Link href={`/news/${row.slug}`} className={linkCls} target="_blank">View live</Link>
            )}
            <span className="text-muted">Last saved {fmt(row.updated_at)}{row.updated_by ? ` by ${row.updated_by}` : ""}</span>
          </p>
        )}
        <PostForm key={row?.updated_at ?? "new"} values={toValues(row)} />
      </div>
    );
  }

  const { rows, error } = await listAllDbPosts();
  return (
    <div className="mt-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold tracking-tight text-ink">News posts</h2>
        <Link href="/newsletter/admin?tab=news&edit=new" className="sc-btn-primary inline-flex min-h-11 items-center rounded-full px-5 text-sm font-semibold">
          New post
        </Link>
      </div>
      <p className="mt-2 max-w-3xl text-sm text-slate">
        Write a post, preview it, then publish it to <Link href="/news" className={linkCls}>/news</Link>. Publishing never emails anyone.
      </p>
      {error && (
        <p className="mt-4 rounded-xl border border-line bg-elevated p-4 text-sm text-ink" role="alert">{error}</p>
      )}
      <div className="mt-6 overflow-x-auto rounded-xl border border-line">
        <table className="w-full min-w-[44rem] text-left text-sm">
          <thead className="bg-surface text-xs uppercase tracking-wide text-muted">
            <tr>
              <th scope="col" className="px-3 py-2">Title</th>
              <th scope="col" className="px-3 py-2">Status</th>
              <th scope="col" className="px-3 py-2">Published</th>
              <th scope="col" className="px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-line">
                <td className="px-3 py-2 text-ink">{r.title}</td>
                <td className="px-3 py-2"><span className={pill(r.status === "published")}>{r.status === "published" ? "Published" : "Draft"}</span></td>
                <td className="px-3 py-2 text-slate">{r.status === "published" ? fmt(r.published_at) : "—"}</td>
                <td className="px-3 py-2">
                  <span className="flex flex-wrap gap-x-3">
                    <Link href={`/newsletter/admin?tab=news&edit=${r.id}`} className={linkCls}>Edit</Link>
                    <Link href={`/newsletter/admin/preview/${r.id}`} className={linkCls} target="_blank">Preview</Link>
                    {r.status === "published" && <Link href={`/news/${r.slug}`} className={linkCls} target="_blank">View</Link>}
                  </span>
                </td>
              </tr>
            ))}
            {codeNewsPosts.map((p) => (
              <tr key={p.slug} className="border-t border-line">
                <td className="px-3 py-2 text-ink">
                  {p.title}
                  <span className="mt-0.5 block text-xs text-muted">Launch post, kept in the site code (edit via a code change)</span>
                </td>
                <td className="px-3 py-2"><span className={pill(p.status === "published")}>{p.status === "published" ? "Published" : "Draft"}</span></td>
                <td className="px-3 py-2 text-slate">{fmt(p.publishedAt)}</td>
                <td className="px-3 py-2">
                  <Link href={`/news/${p.slug}`} className={linkCls} target="_blank">View</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
