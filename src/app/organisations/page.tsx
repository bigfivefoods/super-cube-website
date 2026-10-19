import type { Metadata } from "next";
import { META, OrganisationsView } from "@/components/pages/Organisations";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta(META);

export default function OrganisationsPage() {
  return <OrganisationsView />;
}
