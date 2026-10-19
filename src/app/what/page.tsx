import type { Metadata } from "next";
import { META, WhatView } from "@/components/pages/What";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta(META);

export default function WhatPage() {
  return <WhatView />;
}
