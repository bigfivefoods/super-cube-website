import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { META, VerifySearch } from "@/components/pages/Verify";
import { isPrefixedLocale, localizedPath } from "@/lib/i18n";
import { isCertId, normaliseCertId } from "@/lib/lms/verify";
import { localePageMeta } from "@/lib/seo";

type Props = { params: Promise<{ locale: string }>; searchParams: Promise<{ id?: string | string[] }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isPrefixedLocale(locale)) return {};
  return localePageMeta(locale, META);
}

export default async function LocaleVerifySearchPage({ params, searchParams }: Props) {
  const { locale } = await params;
  if (!isPrefixedLocale(locale)) notFound();
  const raw = (await searchParams).id;
  const submitted = Array.isArray(raw) ? raw[0] : raw;
  const id = submitted != null ? normaliseCertId(submitted) : "";
  if (id && isCertId(id)) redirect(localizedPath(locale, `/verify/${encodeURIComponent(id)}`));
  const error =
    submitted != null
      ? id
        ? "That is not a Super-Cube® certificate ID. Check it was typed exactly as printed."
        : "Enter the certificate ID."
      : null;
  return <VerifySearch locale={locale} submitted={submitted} error={error} />;
}
