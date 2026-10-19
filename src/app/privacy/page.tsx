import type { Metadata } from "next";
import { META, PrivacyView } from "@/components/pages/Privacy";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta(META);

export default function PrivacyPage() {
  return <PrivacyView />;
}
