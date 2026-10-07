import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HomeLanding } from "@/components/home/HomeLanding";
import { courseJsonLd, JsonLd, organizationJsonLd } from "@/components/JsonLd";
import { site } from "@/lib/content";
import { isPrefixedLocale } from "@/lib/i18n";
import { homeStrings } from "@/lib/i18n/pages/home";
import { localeMeta } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isPrefixedLocale(locale)) return {};
  const s = homeStrings(locale);
  return localeMeta({ locale, path: "/", title: s.metaTitle, description: s.metaDescription, absoluteTitle: true });
}

export default async function LocaleHomePage({ params }: Props) {
  const { locale } = await params;
  if (!isPrefixedLocale(locale)) notFound();
  return (
    <>
      <JsonLd data={organizationJsonLd(site.url)} />
      <JsonLd data={courseJsonLd(site.url)} />
      <HomeLanding locale={locale} />
    </>
  );
}
