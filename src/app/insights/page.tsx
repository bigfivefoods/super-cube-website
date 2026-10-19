import type { Metadata } from "next";
import { InsightsIndex, META } from "@/components/pages/Insights";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta(META);

export default function InsightsIndexPage() {
  return <InsightsIndex />;
}
