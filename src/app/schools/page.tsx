import type { Metadata } from "next";
import { META, SchoolsView } from "@/components/pages/Schools";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta(META);

export default function SchoolsPage() {
  return <SchoolsView />;
}
