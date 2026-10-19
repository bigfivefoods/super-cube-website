import type { Metadata } from "next";
import { META, CertifyView } from "@/components/pages/Certify";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta(META);

export default function CertifyPage() {
  return <CertifyView />;
}
