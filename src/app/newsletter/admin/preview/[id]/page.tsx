import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { NewsArticle } from "@/components/news/NewsArticle";
import { getNewsletterAdmin } from "@/lib/newsletter/admin-auth";
import { getDbPostById, rowToPost } from "@/lib/news/db";
import { SignInForm } from "../../SignInForm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: { absolute: "Preview | Super-Cube® admin" },
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

/** Admin-only preview of a post (drafts included), exactly as it will look on /news. */
export default async function PreviewPage({ params }: { params: Promise<{ id: string }> }) {
  const admin = await getNewsletterAdmin();
  if (!admin.ok) {
    return (
      <section className="section-pad">
        <div className="container-site max-w-md">
          <h1 className="text-2xl font-semibold tracking-tight text-ink">Sign in to preview</h1>
          <SignInForm next="/newsletter/admin" />
        </div>
      </section>
    );
  }
  const { id } = await params;
  const row = await getDbPostById(id);
  if (!row) notFound();
  const post = rowToPost(row);
  return (
    <>
      <div className="sticky top-0 z-50 border-b border-amber-300 bg-amber-50 text-amber-950">
        <div className="container-site flex min-h-11 flex-wrap items-center justify-between gap-x-4 gap-y-1 py-2 text-sm">
          <p>
            <strong>Preview</strong> · {row.status === "published" ? "Published" : "Draft, not on the site yet"}
          </p>
          <Link href={`/newsletter/admin?tab=news&edit=${row.id}`} className="font-semibold underline underline-offset-2">
            Back to editing
          </Link>
        </div>
      </div>
      <NewsArticle post={post} />
    </>
  );
}
