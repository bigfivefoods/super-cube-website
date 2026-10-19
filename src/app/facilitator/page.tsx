import type { Metadata } from "next";
import { META, FacilitatorView } from "@/components/pages/Facilitator";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta(META);

export default function FacilitatorPage() {
  return <FacilitatorView />;
}
