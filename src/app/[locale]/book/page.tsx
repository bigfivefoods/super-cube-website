import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BookView, META, SHARE_IMAGE_ALT } from "@/components/pages/Book";
import { BOOK } from "@/lib/book";
import { isPrefixedLocale } from "@/lib/i18n";
import { translateText } from "@/lib/i18n/pages/t";
import { localePageMeta } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isPrefixedLocale(locale)) return {};
  const [base, alt] = await Promise.all([localePageMeta(locale, META), translateText(locale, SHARE_IMAGE_ALT)]);
  const shareImage = { ...BOOK.share, alt };
  return {
    ...base,
    openGraph: { ...base.openGraph, type: "book", images: [shareImage] },
    twitter: { ...base.twitter, images: [shareImage.url] },
  };
}

export default async function LocaleBookPage({ params }: Props) {
  const { locale } = await params;
  if (!isPrefixedLocale(locale)) notFound();
  return <BookView locale={locale} />;
}
