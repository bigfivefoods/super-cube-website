import type { Metadata } from "next";
import { META, SampleReportView } from "@/components/pages/SampleReport";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta(META);

export default function SampleReportPage() {
  return <SampleReportView />;
}
