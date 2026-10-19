import type { Metadata } from "next";
import { META, CommunityView } from "@/components/pages/Community";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta(META);

export default function CommunityPage() {
  return <CommunityView />;
}
