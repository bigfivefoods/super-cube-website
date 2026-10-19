import type { Metadata } from "next";
import { META, PracticesView } from "@/components/pages/Practices";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta(META);

export default function PracticesPage() {
  return <PracticesView />;
}
