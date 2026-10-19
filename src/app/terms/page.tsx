import type { Metadata } from "next";
import { META, TermsView } from "@/components/pages/Terms";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta(META);

export default function TermsPage() {
  return <TermsView />;
}
