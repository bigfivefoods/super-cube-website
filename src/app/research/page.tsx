import type { Metadata } from "next";
import { META, ResearchView } from "@/components/pages/Research";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta(META);

export default function ResearchPage() {
  return <ResearchView />;
}
