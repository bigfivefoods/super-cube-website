import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TeamCubeView } from "@/components/pages/TeamCube";
import { TEAM_META, TEAM_STRINGS } from "@/components/pages/team-strings";
import { isPrefixedLocale, localizedPath } from "@/lib/i18n";
import { translateDeep } from "@/lib/i18n/pages/t";
import { localePageMeta } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isPrefixedLocale(locale)) return {};
  return localePageMeta(locale, TEAM_META);
}

export default async function LocaleTeamPage({ params }: Props) {
  const { locale } = await params;
  if (!isPrefixedLocale(locale)) notFound();
  return <TeamCubeView s={translateDeep(locale, TEAM_STRINGS)} impactHref={localizedPath(locale, "/impact")} />;
}
