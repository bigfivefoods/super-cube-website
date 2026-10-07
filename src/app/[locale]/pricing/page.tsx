import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PricingView } from "@/components/pricing/PricingView";
import { isPrefixedLocale } from "@/lib/i18n";
import { pricingStrings } from "@/lib/i18n/pages/pricing";
import { localeMeta } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isPrefixedLocale(locale)) return {};
  const s = pricingStrings(locale);
  return localeMeta({ locale, path: "/pricing", title: s.metaTitle, description: s.metaDescription });
}

export default async function LocalePricingPage({ params }: Props) {
  const { locale } = await params;
  if (!isPrefixedLocale(locale)) notFound();
  return <PricingView s={pricingStrings(locale)} locale={locale} />;
}
