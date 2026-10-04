"use client";

import Link from "next/link";
import { useLocale } from "@/components/LocaleProvider";
import { Button, SectionHeading } from "@/components/ui";
import { theories } from "@/lib/content";

/**
 * Philosophy, theory and model overview. Moved from the homepage to /research
 * so the homepage can stay short and plain.
 */
export function TheoryOverview() {
  const { t } = useLocale();
  return (
    <>
      {/* Philosophy → theory → model (moved from the homepage) */}
      <section className="section-pad bg-paper">
        <div className="container-site">
          <SectionHeading
            eyebrow={t("home.ptmEyebrow")}
            title={t("home.ptmTitle")}
            description={t("home.ptmDesc")}
          />

          <div className="mt-8 grid gap-3 sm:mt-10 sm:grid-cols-3 sm:gap-4">
            {(
              [
                {
                  titleKey: "home.philosophyTitle" as const,
                  bodyKey: "home.philosophyBody" as const,
                },
                {
                  titleKey: "home.theoryTitle" as const,
                  bodyKey: "home.theoryBody" as const,
                },
                {
                  titleKey: "home.modelTitle" as const,
                  bodyKey: "home.modelBody" as const,
                },
              ] as const
            ).map((card) => (
              <div
                key={card.titleKey}
                className="rounded-2xl border border-line bg-surface p-5 sm:p-6"
              >
                <h3 className="text-base font-semibold tracking-tight text-ink sm:text-lg">
                  {t(card.titleKey)}
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-slate">
                  {t(card.bodyKey)}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-0 overflow-hidden rounded-xl border border-line sm:mt-8 sm:rounded-2xl md:grid-cols-2">
            <div className="bg-void p-6 text-void-fg sm:p-8 md:p-10">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-void-fg/50">
                {t("home.coreBeliefEyebrow")}
              </p>
              <h3 className="heading-lg mt-3 text-void-fg">
                {t("home.coreBelief")}
              </h3>
              <p className="mt-4 text-base leading-relaxed text-void-fg/65">
                {t("home.coreBeliefBody")}
              </p>
            </div>
            <div className="flex flex-col justify-center gap-0 bg-elevated p-1 sm:p-2 md:p-4">
              <p className="px-4 pt-3 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-muted sm:px-6">
                {t("home.theoryMapLabel")}
              </p>
              {theories.slice(0, 4).map((th, i) => (
                <div
                  key={th.name}
                  className={`flex items-start gap-3 px-4 py-3.5 sm:px-6 sm:py-4 ${
                    i < 3 ? "border-b border-line" : ""
                  }`}
                >
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-ink" />
                  <div>
                    <p className="font-semibold tracking-tight text-ink">
                      {th.name}
                    </p>
                    <p className="text-sm text-muted">{th.note}</p>
                  </div>
                </div>
              ))}
              <div className="border-t border-line px-4 py-3 sm:px-6">
                <Link
                  href="/the-model#theory"
                  className="inline-flex min-h-6 items-center text-sm font-semibold text-ink underline-offset-4 hover:underline"
                >
                  {t("home.ptmTheoryMap")} →
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-2.5 sm:mt-8 sm:flex-row sm:flex-wrap">
            <Button
              href="/the-model"
              variant="primary"
              className="w-full sm:w-auto"
            >
              {t("cta.exploreModel")}
            </Button>
            <Button href="/how" variant="ghost" className="w-full sm:w-auto">
              {t("home.ptmHow")} →
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
