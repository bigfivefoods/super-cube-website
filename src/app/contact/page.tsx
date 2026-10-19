import type { Metadata } from "next";
import { META, ContactView } from "@/components/pages/Contact";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta(META);

export default function ContactPage() {
  return <ContactView />;
}
