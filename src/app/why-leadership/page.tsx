import type { Metadata } from "next";
import { META, WhyLeadershipView } from "@/components/pages/WhyLeadership";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta(META);

export default function WhyLeadershipPage() {
  return <WhyLeadershipView />;
}
