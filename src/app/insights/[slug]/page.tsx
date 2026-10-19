import type { Metadata } from "next";
import { InsightArticle } from "@/components/pages/Insights";
import { getInsight, insightPosts } from "@/lib/insights";
import { pageMeta } from "@/lib/seo";

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
  return pageMeta({
    title: post.title,
    description: post.excerpt,
    path: `/insights/${post.slug}`,
  });
}

export default async function InsightPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <InsightArticle slug={slug} />;
}
