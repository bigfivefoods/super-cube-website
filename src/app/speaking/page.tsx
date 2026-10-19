import type { Metadata } from "next";
import { META, SpeakingView } from "@/components/pages/Speaking";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta(META);

export default function SpeakingPage() {
  return <SpeakingView />;
}
