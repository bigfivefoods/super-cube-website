import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { META, LeadershipChallengesView } from "@/components/pages/LeadershipChallenges";
import { PREFIXED_LOCALES, isPrefixedLocale } from "@/lib/i18n";
import { localePageMeta } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };

/**
 * Prerender each locale at build time. These pages take nothing from the request; a dynamic
 * render would rebuild the whole translated page on a cache miss (the slow server response)
 * instead of sending the file. The layout lists the same locales; repeating them here keeps
 * this route static even if another page under /[locale] is dynamic.
 */
export const dynamic = "force-static";

export function generateStaticParams() {
  return PREFIXED_LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isPrefixedLocale(locale)) return {};
  return localePageMeta(locale, META);
}

export default async function LocaleLeadershipChallengesPage({ params }: Props) {
  const { locale } = await params;
  if (!isPrefixedLocale(locale)) notFound();
  return <LeadershipChallengesView locale={locale} />;
}
