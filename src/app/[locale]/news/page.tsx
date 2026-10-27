import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { META, NewsIndex } from "@/components/pages/NewsIndex";
import { isPrefixedLocale } from "@/lib/i18n";
import { NEWS_FEED_PATH } from "@/lib/news/seo";
import { localePageMeta } from "@/lib/seo";

export const revalidate = 300;

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isPrefixedLocale(locale)) return {};
  const meta = await localePageMeta(locale, META);
  return {
    ...meta,
    alternates: {
      ...meta.alternates,
      types: { "application/rss+xml": [{ url: NEWS_FEED_PATH, title: "Super-Cube® News" }] },
    },
  };
}

export default async function LocaleNewsPage({ params }: Props) {
  const { locale } = await params;
  if (!isPrefixedLocale(locale)) notFound();
  return <NewsIndex locale={locale} />;
}
