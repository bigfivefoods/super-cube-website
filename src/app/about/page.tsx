import type { Metadata } from "next";
import { META, AboutView } from "@/components/pages/About";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta(META);

export default function AboutPage() {
  return <AboutView />;
}
