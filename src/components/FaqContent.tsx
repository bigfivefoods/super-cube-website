"use client";

import { useLocale } from "@/components/LocaleProvider";
import { Button, PageHero } from "@/components/ui";
import type { I18nKey } from "@/lib/i18n";

const ITEMS: { q: I18nKey; a: I18nKey }[] = [
  { q: "faq.q1", a: "faq.a1" },
  { q: "faq.q2", a: "faq.a2" },
  { q: "faq.q3", a: "faq.a3" },
  { q: "faq.q4", a: "faq.a4" },
  { q: "faq.q5", a: "faq.a5" },
  { q: "faq.q6", a: "faq.a6" },
  { q: "faq.q7", a: "faq.a7" },
  { q: "faq.q8", a: "faq.a8" },
];

export function FaqContent() {
  const { t } = useLocale();

  return (
    <>
      <PageHero
        theme="none"
        full={false}
        eyebrow={t("faq.eyebrow")}
        title={t("faq.title")}
        description={t("faq.lede")}
      >
        <Button href="/learn/start" variant="primary">
          {t("faq.ctaStart")}
        </Button>
        <Button href="/contact" variant="ghost">
          {t("faq.ctaContact")}
        </Button>
      </PageHero>

      <section className="section-pad bg-white">
        <div className="container-site mx-auto max-w-3xl space-y-3">
          {ITEMS.map((item) => (
            <details
              key={item.q}
              className="group rounded-2xl border border-black/[0.08] bg-[#fafafa] px-5 py-4 open:bg-white open:shadow-sm"
            >
              <summary className="cursor-pointer list-none text-[0.975rem] font-semibold tracking-tight text-ink marker:content-none [&::-webkit-details-marker]:hidden">
                <span className="flex items-start justify-between gap-3">
                  {t(item.q)}
                  <span
                    className="mt-0.5 shrink-0 text-muted transition group-open:rotate-45"
                    aria-hidden
                  >
                    +
                  </span>
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-slate">
                {t(item.a)}
              </p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}
