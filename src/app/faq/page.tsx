import type { Metadata } from "next";
import { FaqContent } from "@/components/FaqContent";
import { JsonLd } from "@/components/JsonLd";
import { site } from "@/lib/content";
import { t } from "@/lib/i18n";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "FAQ",
  description:
    "Frequently asked questions about Super-Cube®: free baseline, privacy, languages (English, isiZulu, Afrikaans), school pilots, research, and certificates.",
  path: "/faq",
  keywords: [
    "Super-Cube FAQ",
    "leadership programme questions",
    "isiZulu leadership training",
    "school leadership pilot FAQ",
  ],
});

const faqPairs = [
  ["faq.q1", "faq.a1"],
  ["faq.q2", "faq.a2"],
  ["faq.q3", "faq.a3"],
  ["faq.q4", "faq.a4"],
  ["faq.q5", "faq.a5"],
  ["faq.q6", "faq.a6"],
  ["faq.q7", "faq.a7"],
  ["faq.q8", "faq.a8"],
] as const;

function faqJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqPairs.map(([q, a]) => ({
      "@type": "Question",
      name: t(q, "en"),
      acceptedAnswer: {
        "@type": "Answer",
        text: t(a, "en"),
      },
    })),
    url: `${site.url.replace(/\/$/, "")}/faq`,
  };
}

export default function FaqPage() {
  return (
    <>
      <JsonLd data={faqJsonLd()} />
      <FaqContent />
    </>
  );
}
