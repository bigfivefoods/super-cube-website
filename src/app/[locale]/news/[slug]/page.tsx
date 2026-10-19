import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NewsPostView } from "@/components/pages/NewsPost";
import { isPrefixedLocale, PREFIXED_LOCALES } from "@/lib/i18n";
import { translateText } from "@/lib/i18n/pages/t";
import { site } from "@/lib/content";
import {
  NEWS_FEED_PATH,
  clampDescription,
  newsShareImage,
  stripMarks,
} from "@/lib/news/seo";
import { getPublishedNews, listPublishedNews } from "@/lib/news/store";
import { absoluteUrl, localeMeta } from "@/lib/seo";
import { localizedPath } from "@/lib/i18n/config";

export const revalidate = 300;
export const dynamicParams = true;

export async function generateStaticParams() {
  const posts = await listPublishedNews();
  return PREFIXED_LOCALES.flatMap((locale) => posts.map((p) => ({ locale, slug: p.slug })));
}

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isPrefixedLocale(locale)) return {};
  const post = await getPublishedNews(slug);
  if (!post) return { title: "Post not found", robots: { index: false, follow: true } };
  const title = stripMarks(translateText(locale, post.title));
  const description = clampDescription(translateText(locale, post.excerpt));
  const path = `/news/${post.slug}`;
  const share = newsShareImage(post);
  const meta = localeMeta({
    locale,
    path,
    title,
    description,
    absoluteTitle: false,
    image: share.url,
    imageAlt: translateText(locale, share.alt),
  });
  return {
    ...meta,
    alternates: {
      canonical: absoluteUrl(localizedPath(locale, path)),
      languages: meta.alternates?.languages,
      types: { "application/rss+xml": [{ url: NEWS_FEED_PATH, title: "Super-Cube® News" }] },
    },
    openGraph: {
      ...meta.openGraph,
      type: "article",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt || post.publishedAt,
      authors: post.author ? [post.author] : undefined,
      siteName: site.name,
    },
  };
}

export default async function LocaleNewsPostPage({ params }: Props) {
  const { locale, slug } = await params;
  if (!isPrefixedLocale(locale)) notFound();
  return <NewsPostView slug={slug} locale={locale} />;
}
