import type { Metadata } from "next";
import { FaqContent } from "@/components/FaqContent";
import { FaqJsonLd } from "@/components/FaqJsonLd";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "FAQ",
  description:
    "Frequently asked questions about Super-Cube®: free baseline, privacy, languages (English, French, Arabic, Portuguese, Kiswahili, isiZulu, Afrikaans), school pilots, research, and certificates.",
  path: "/faq",
  keywords: [
    "Super-Cube® FAQ",
    "leadership programme questions",
    "isiZulu leadership training",
    "school leadership pilot FAQ",
  ],
});

export default function FaqPage() {
  return (
    <>
      <FaqJsonLd locale="en" />
      <FaqContent />
    </>
  );
}
