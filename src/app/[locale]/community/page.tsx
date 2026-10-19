import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { META, CommunityView } from "@/components/pages/Community";
import { isPrefixedLocale } from "@/lib/i18n";
import { localePageMeta } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isPrefixedLocale(locale)) return {};
  return localePageMeta(locale, META);
}

export default async function LocaleCommunityPage({ params }: Props) {
  const { locale } = await params;
  if (!isPrefixedLocale(locale)) notFound();
  return <CommunityView locale={locale} />;
}
