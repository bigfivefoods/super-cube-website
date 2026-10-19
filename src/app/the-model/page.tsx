import type { Metadata } from "next";
import { META, TheModelView } from "@/components/pages/TheModel";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta(META);

export default function TheModelPage() {
  return <TheModelView />;
}
