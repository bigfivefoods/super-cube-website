import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FaqContent } from "@/components/FaqContent";
import { FaqJsonLd } from "@/components/FaqJsonLd";
import { isPrefixedLocale, translate } from "@/lib/i18n";
import { DICTS } from "@/lib/i18n/dictionaries";
import { localeMeta } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isPrefixedLocale(locale)) return {};
  const d = DICTS[locale];
  return localeMeta({ locale, path: "/faq", title: translate(d, "faq.title"), description: translate(d, "faq.lede") });
}

export default async function LocaleFaqPage({ params }: Props) {
  const { locale } = await params;
  if (!isPrefixedLocale(locale)) notFound();
  return (
    <>
      <FaqJsonLd locale={locale} />
      <FaqContent />
    </>
  );
}
