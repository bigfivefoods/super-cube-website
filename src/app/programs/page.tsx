import type { Metadata } from "next";
import { META, ProgramsView } from "@/components/pages/Programs";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta(META);

export default function ProgramsPage() {
  return <ProgramsView />;
}
