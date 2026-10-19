import type { Metadata } from "next";
import { META, ConstructsView } from "@/components/pages/Constructs";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta(META);

export default function ConstructsPage() {
  return <ConstructsView />;
}
