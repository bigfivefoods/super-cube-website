import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getInsight, insightPosts } from "@/lib/insights";
import { Button } from "@/components/ui";

export function generateStaticParams() {
  return insightPosts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getInsight(slug);
  if (!post) return { title: "Insight" };
  return {
    title: post.title,
    description: post.excerpt,
  };
}

export default async function InsightPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getInsight(slug);
  if (!post) notFound();

  return (
    <article>
      <header className="border-b border-black/[0.06] bg-white">
        <div className="container-site max-w-3xl py-12 sm:py-16">
          <p className="eyebrow">Insights</p>
          <h1 className="heading-lg mt-3 text-ink">{post.title}</h1>
          <p className="mt-3 text-sm text-muted">
            {post.date} · {post.readingMinutes} min read ·{" "}
            {post.tags.join(" · ")}
          </p>
          <p className="mt-4 text-lg leading-relaxed text-slate">{post.excerpt}</p>
        </div>
      </header>
      <div className="section-pad bg-[#fafafa]">
        <div className="container-site prose-site max-w-3xl space-y-5">
          {post.body.map((para) => (
            <p key={para.slice(0, 40)}>{para}</p>
          ))}
          <div className="flex flex-wrap gap-2 pt-4">
            <Button href="/learn/start" variant="primary">
              Start free baseline
            </Button>
            <Button href="/insights" variant="ghost">
              All insights
            </Button>
          </div>
          <p className="text-sm text-muted">
            <Link href="/research" className="font-semibold text-ink">
              Research
            </Link>{" "}
            ·{" "}
            <Link href="/practices" className="font-semibold text-ink">
              Practice library
            </Link>
          </p>
        </div>
      </div>
    </article>
  );
}
