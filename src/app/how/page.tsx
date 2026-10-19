import type { Metadata } from "next";
import { META, HowView } from "@/components/pages/How";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta(META);

export default function HowPage() {
  return <HowView />;
}
