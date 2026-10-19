import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { VerifyResult } from "@/components/pages/Verify";
import { lookupCertificate } from "@/lib/lms/server/certificate-lookup";
import { normaliseCertId } from "@/lib/lms/verify";
import { pageMeta } from "@/lib/seo";

export const dynamic = "force-dynamic";

const lookup = cache((id: string) => lookupCertificate(id));

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const id = normaliseCertId((await params).id);
  return pageMeta({
    title: `Certificate check ${id}`,
    description: "Check that a Super-Cube® leadership certificate is genuine and still valid.",
    path: `/verify/${encodeURIComponent(id)}`,
    // Holder names stay out of search results; the link still works for anyone who has it.
    noIndex: true,
  });
}

export default async function VerifyCertificatePage({ params }: Props) {
  const id = normaliseCertId((await params).id);
  const result = await lookup(id);
  if (result.status === "invalid" || result.status === "not_found") notFound();
  return (
    <VerifyResult
      id={id}
      status={result.status}
      certificate={result.status === "unavailable" ? undefined : result.certificate}
    />
  );
}
