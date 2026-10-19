import type { Metadata } from "next";
import { META, MediaView } from "@/components/pages/Media";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta(META);

export default function MediaPage() {
  return <MediaView />;
}
