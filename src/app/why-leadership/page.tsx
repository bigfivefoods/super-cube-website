import type { Metadata } from "next";
import { META, WhyLeadershipView } from "@/components/pages/WhyLeadership";
import { pageMeta } from "@/lib/seo";

/** No request data: serve the prerendered file, same as the locale versions. */
export const dynamic = "force-static";

export const metadata: Metadata = pageMeta(META);

export default function WhyLeadershipPage() {
  return <WhyLeadershipView />;
}
