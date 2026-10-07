import { JsonLd } from "@/components/JsonLd";
import { site } from "@/lib/content";
import { localizedPath, translate, type I18nKey, type Locale } from "@/lib/i18n";
import { DICTS } from "@/lib/i18n/dictionaries";

export const FAQ_PAIRS = [
  ["faq.q1", "faq.a1"],
  ["faq.q2", "faq.a2"],
  ["faq.q3", "faq.a3"],
  ["faq.q4", "faq.a4"],
  ["faq.q5", "faq.a5"],
  ["faq.q6", "faq.a6"],
  ["faq.q7", "faq.a7"],
  ["faq.q8", "faq.a8"],
] as const satisfies readonly (readonly [I18nKey, I18nKey])[];

/** FAQPage structured data in the page's language (the same questions and answers the page shows). */
export function FaqJsonLd({ locale }: { locale: Locale }) {
  const dict = DICTS[locale];
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "FAQPage",
        inLanguage: locale,
        mainEntity: FAQ_PAIRS.map(([q, a]) => ({
          "@type": "Question",
          name: translate(dict, q),
          acceptedAnswer: { "@type": "Answer", text: translate(dict, a) },
        })),
        url: `${site.url.replace(/\/$/, "")}${localizedPath(locale, "/faq")}`,
      }}
    />
  );
}
