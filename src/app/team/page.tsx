import type { Metadata } from "next";
import { TeamCubeView } from "@/components/pages/TeamCube";
import { TEAM_META } from "@/components/pages/team-strings";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta(TEAM_META);

export default function TeamPage() {
  return <TeamCubeView />;
}
