import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InsightsIndex, META } from "@/components/pages/Insights";
import { isPrefixedLocale } from "@/lib/i18n";
import { localePageMeta } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isPrefixedLocale(locale)) return {};
  return localePageMeta(locale, META);
}

export default async function LocaleInsightsPage({ params }: Props) {
  const { locale } = await params;
  if (!isPrefixedLocale(locale)) notFound();
  return <InsightsIndex locale={locale} />;
}
