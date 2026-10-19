import type { Metadata } from "next";
import { META, PilotPackView } from "@/components/pages/PilotPack";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta(META);

export default function PilotPackPage() {
  return <PilotPackView />;
}
