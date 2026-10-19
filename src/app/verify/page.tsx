import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { VerifySearch } from "@/components/pages/Verify";
import { isCertId, normaliseCertId } from "@/lib/lms/verify";
import { pageMeta } from "@/lib/seo";
import { META } from "@/components/pages/Verify";

export const metadata: Metadata = pageMeta(META);

type Props = { searchParams: Promise<{ id?: string | string[] }> };

export default async function VerifySearchPage({ searchParams }: Props) {
  const raw = (await searchParams).id;
  const submitted = Array.isArray(raw) ? raw[0] : raw;
  const id = submitted != null ? normaliseCertId(submitted) : "";
  if (id && isCertId(id)) redirect(`/verify/${encodeURIComponent(id)}`);
  const error =
    submitted != null
      ? id
        ? "That is not a Super-Cube® certificate ID. Check it was typed exactly as printed."
        : "Enter the certificate ID."
      : null;
  return <VerifySearch submitted={submitted} error={error} />;
}
