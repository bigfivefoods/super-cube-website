"use client";

import { useLocale } from "@/components/LocaleProvider";
import { Button, PageHero } from "@/components/ui";
import { constructs } from "@/lib/content";
import { faceI18n } from "@/lib/i18n";

/** Localised constructs page hero + sticky face jump nav. */
export function ConstructsHero() {
  const { t } = useLocale();

  return (
    <>
      <PageHero
        theme="constructs"
        eyebrow={t("constructs.eyebrow")}
        title={t("constructs.title")}
        description={t("constructs.description")}
      >
        <Button href="/learn/start" variant="primary">
          {t("constructs.ctaBaseline")}
        </Button>
        <Button href="/the-model" variant="ghost">
          {t("constructs.ctaModel")}
        </Button>
      </PageHero>

      <nav
        className="sticky top-14 z-40 border-b border-black/[0.06] bg-white/95 py-2.5 backdrop-blur-md md:top-16"
        aria-label={t("face.jump")}
      >
        <div className="container-site flex flex-wrap items-center gap-2">
          <span className="mr-1 hidden text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted sm:inline">
            {t("face.jump")}
          </span>
          {constructs.map((c) => (
            <a
              key={c.id}
              href={`#${c.id}`}
              className="face-jump inline-flex items-center gap-1.5 rounded-full border border-black/[0.08] bg-white px-3 py-1.5 text-[0.8125rem] font-semibold text-ink transition"
              style={{ ["--face-color" as string]: c.color }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: c.color }}
                aria-hidden
              />
              {t(faceI18n[c.id] || "face.choices")}
            </a>
          ))}
        </div>
      </nav>
    </>
  );
}

/** Localised face number + name overlay for full-bleed construct heroes. */
export function ConstructFaceLabel({
  index,
  constructId,
  tagline,
}: {
  index: number;
  constructId: string;
  tagline: string;
}) {
  const { t } = useLocale();
  const n = String(index + 1).padStart(2, "0");

  return (
    <>
      <p className="text-[0.7rem] font-bold uppercase tracking-[0.16em] text-white/60">
        {t("constructs.faceOf", { n })}
      </p>
      <h2 className="heading-xl mt-3 text-white">
        {t(faceI18n[constructId] || "face.choices")}
      </h2>
      <p className="mt-3 text-base font-medium tracking-tight text-white/85 sm:text-lg md:text-xl">
        {tagline}
      </p>
    </>
  );
}
