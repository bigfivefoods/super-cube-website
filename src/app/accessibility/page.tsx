import type { Metadata } from "next";
import { AccessibilityView, META } from "@/components/pages/Accessibility";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta(META);

export default function AccessibilityPage() {
  return <AccessibilityView />;
}
