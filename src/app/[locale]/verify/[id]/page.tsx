import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { VerifyResult } from "@/components/pages/Verify";
import { isPrefixedLocale } from "@/lib/i18n";
import { fill } from "@/lib/i18n/pages/format";
import { translateText } from "@/lib/i18n/pages/t";
import { lookupCertificate } from "@/lib/lms/server/certificate-lookup";
import { lookupOpenBadge } from "@/lib/lms/server/open-badges";
import { createAdminClient } from "@/lib/supabase/admin";
import { normaliseCertId } from "@/lib/lms/verify";
import { localeMeta } from "@/lib/seo";

export const dynamic = "force-dynamic";

const lookup = cache((id: string) => lookupCertificate(id));

type Props = { params: Promise<{ locale: string; id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, id: raw } = await params;
  if (!isPrefixedLocale(locale)) return {};
  const id = normaliseCertId(raw);
  return localeMeta({
    locale,
    path: `/verify/${encodeURIComponent(id)}`,
    title: fill(await translateText(locale, "Certificate check {id}"), { id }),
    description: await translateText(
      locale,
      "Check that a Super-Cube® leadership certificate is genuine and still valid.",
    ),
    noIndex: true,
  });
}

export default async function LocaleVerifyCertificatePage({ params }: Props) {
  const { locale, id: raw } = await params;
  if (!isPrefixedLocale(locale)) notFound();
  const id = normaliseCertId(raw);
  const result = await lookup(id);
  if (result.status === "invalid" || result.status === "not_found") notFound();
  const openBadge = result.status === "unavailable" ? "unavailable" : (await lookupOpenBadge(createAdminClient(), id)).check.state;
  return (
    <VerifyResult
      locale={locale}
      id={id}
      status={result.status}
      certificate={result.status === "unavailable" ? undefined : result.certificate}
      openBadge={result.status === "revoked" ? "revoked" : openBadge}
    />
  );
}
