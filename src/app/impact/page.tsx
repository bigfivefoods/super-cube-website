import type { Metadata } from "next";
import { META, ImpactView } from "@/components/pages/Impact";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta(META);

export default function ImpactPage() {
  return <ImpactView />;
}
