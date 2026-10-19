import type { Metadata } from "next";
import { META, LeadershipChallengesView } from "@/components/pages/LeadershipChallenges";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta(META);

export default function LeadershipChallengesPage() {
  return <LeadershipChallengesView />;
}
