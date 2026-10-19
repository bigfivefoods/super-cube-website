import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InsightArticle } from "@/components/pages/Insights";
import { PREFIXED_LOCALES, isPrefixedLocale } from "@/lib/i18n";
import { translateText } from "@/lib/i18n/pages/t";
import { getInsight, insightPosts } from "@/lib/insights";
import { localePageMeta } from "@/lib/seo";

export const dynamicParams = false;

export function generateStaticParams() {
  return PREFIXED_LOCALES.flatMap((locale) => insightPosts.map((p) => ({ locale, slug: p.slug })));
}

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isPrefixedLocale(locale)) return {};
  const post = getInsight(slug);
  if (!post) return { title: "Insight" };
  return localePageMeta(locale, {
    title: translateText(locale, post.title),
    description: translateText(locale, post.excerpt),
    path: `/insights/${post.slug}`,
  });
}

export default async function LocaleInsightPostPage({ params }: Props) {
  const { locale, slug } = await params;
  if (!isPrefixedLocale(locale)) notFound();
  return <InsightArticle slug={slug} locale={locale} />;
}
