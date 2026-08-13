"use client";

import Image from "next/image";
import Link from "next/link";
import { useLocale } from "@/components/LocaleProvider";
import { SocialProofStrip } from "@/components/SocialProof";
import { SuperCube } from "@/components/SuperCube";
import { Button, SectionHeading } from "@/components/ui";
import { constructs, stats, theories } from "@/lib/content";
import { faceI18n, type I18nKey } from "@/lib/i18n";
import { programmes } from "@/lib/programmes";

const constructIcons: Record<string, string> = {
  choices: "/images/constructs/choices-icon.png",
  principles: "/images/constructs/principles-icon.png",
  mental: "/images/constructs/mental-icon.png",
  emotional: "/images/constructs/emotional-icon.png",
  physical: "/images/constructs/physical-icon.png",
  spiritual: "/images/constructs/spiritual-icon.png",
};

const programmeAccents = [
  constructs[0].color,
  constructs[2].color,
  constructs[5].color,
];

const benefits: {
  id: "holistic" | "longitudinal" | "multi-level";
  titleKey: I18nKey;
  tagKey: I18nKey;
  bodyKey: I18nKey;
  icon: { src: string; alt: string };
}[] = [
  {
    id: "holistic",
    titleKey: "home.benefit.holistic",
    tagKey: "home.benefit.holisticTag",
    bodyKey: "home.benefit.holisticBody",
    icon: { src: "/cube.png", alt: "Super-Cube® — holistic" },
  },
  {
    id: "longitudinal",
    titleKey: "home.benefit.longitudinal",
    tagKey: "home.benefit.longitudinalTag",
    bodyKey: "home.benefit.longitudinalBody",
    icon: {
      src: "/longitudinal.svg",
      alt: "Longitudinal lifespan development",
    },
  },
  {
    id: "multi-level",
    titleKey: "home.benefit.multilevel",
    tagKey: "home.benefit.multilevelTag",
    bodyKey: "home.benefit.multilevelBody",
    icon: {
      src: "/multilevel.svg",
      alt: "Multi-level leadership capacity",
    },
  },
];

/**
 * Landing narrative (client, i18n):
 * hero → cube → programmes → philosophy/theory/model → constructs → benefits
 * → trust + social proof → stats
 */
export function HomeHero() {
  const { t } = useLocale();

  const trustItems = [
    { label: t("home.proof1"), detail: "Doctoral thesis" },
    { label: t("home.proof2"), detail: "Capacity change" },
    { label: t("home.proof3"), detail: "Public verify IDs" },
    { label: t("home.proof4"), detail: "Privacy by design" },
  ];

  return (
    <>
      {/* 1. Hero — media + title/lede/CTAs only (no cube) */}
      <section className="page-hero page-hero--full page-hero--media relative isolate flex w-full overflow-hidden bg-ink">
        <Image
          src="/images/hero/leadership-hero.jpg"
          alt="Super-Cube® leadership development"
          fill
          className="object-cover object-center"
          sizes="100vw"
          priority
        />
        <div
          className="absolute inset-0 bg-gradient-to-r from-black/88 via-black/60 to-black/30 sm:via-black/50 sm:to-transparent"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30"
          aria-hidden
        />

        <div className="container-site page-hero__inner relative z-10 w-full pb-2">
          <div className="page-hero__copy animate-fade-up max-w-2xl md:max-w-[38rem] lg:max-w-[42rem]">
            <p className="eyebrow text-white/70 before:bg-white/50">
              {t("home.eyebrow")}
            </p>
            <h1 className="page-hero__title heading-xl mt-3 text-white sm:mt-4">
              {t("home.title")}
              <span className="mt-1 block text-white/75">
                {t("home.titleLine2")}
              </span>
            </h1>
            <p className="page-hero__lede mt-4 text-[0.9375rem] leading-relaxed tracking-tight text-white/80 sm:mt-5 sm:text-base md:text-lg lg:text-xl">
              {t("home.lede")}
            </p>
            <div className="mt-6 flex w-full max-w-md flex-col gap-2.5 sm:mt-8 sm:max-w-none sm:flex-row sm:flex-wrap sm:gap-3">
              <Button
                href="/learn/start"
                variant="primary"
                className="w-full !bg-white !text-ink hover:!bg-white/90 sm:w-auto"
              >
                {t("home.ctaBaseline")}
              </Button>
              <Button
                href="/sample-report"
                variant="light"
                className="w-full border-white/35 sm:w-auto"
              >
                {t("home.ctaSample")}
              </Button>
            </div>
            <p className="mt-5 text-[0.75rem] leading-snug text-white/55 sm:mt-6 sm:text-sm">
              {t("home.whatChanges")}
            </p>
          </div>
        </div>
      </section>

      {/* 2. Rotating model — interactive SuperCube */}
      <section className="section-pad bg-white">
        <div className="container-site grid items-center gap-8 sm:gap-10 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] md:gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-12 xl:gap-16">
          <div className="min-w-0 order-2 md:order-1">
            <SectionHeading
              eyebrow={t("home.cubeEyebrow")}
              title={t("home.cubeTitle")}
              description={t("home.cubeDesc")}
            />
            <p className="mt-5 text-sm leading-relaxed text-slate sm:mt-6 sm:text-base">
              {t("home.cubeBody")}
            </p>
            <div className="mt-6 flex flex-col gap-2.5 sm:mt-8 sm:flex-row sm:flex-wrap">
              <Button
                href="/the-model"
                variant="ghost"
                className="w-full sm:w-auto"
              >
                {t("cta.exploreModel")} →
              </Button>
              <Button
                href="/learn/start"
                variant="primary"
                className="w-full sm:w-auto"
              >
                {t("cta.tryFree")}
              </Button>
            </div>
          </div>
          <div className="order-1 flex justify-center md:order-2 md:justify-end">
            <div className="w-full max-w-[15rem] bg-white sm:max-w-[18rem] md:max-w-[19rem] lg:max-w-[21rem]">
              <SuperCube size="md" showSkills />
            </div>
          </div>
        </div>
      </section>

      {/* 3. Who the programme is for — Kids / Adolescents / Adults */}
      <section className="section-pad border-t border-black/[0.06] bg-[#fafafa]">
        <div className="container-site">
          <SectionHeading
            eyebrow={t("home.programmesEyebrow")}
            title={t("home.programmesTitle")}
            description={t("home.programmesDesc")}
          />
          <div className="mt-8 grid gap-4 sm:mt-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
            {programmes.map((p, i) => {
              const color = programmeAccents[i % programmeAccents.length];
              const shortName = p.name.replace("Super-Cube® ", "");
              return (
                <Link
                  key={p.id}
                  href={`/what#${p.id}`}
                  className="card-lift group flex flex-col overflow-hidden rounded-2xl border border-black/[0.08] bg-white"
                >
                  <div
                    className="h-1.5 w-full"
                    style={{ background: color }}
                    aria-hidden
                  />
                  <div className="flex flex-1 flex-col p-5 sm:p-6">
                    <p
                      className="text-[0.65rem] font-bold uppercase tracking-[0.14em]"
                      style={{ color }}
                    >
                      {p.ageLabel}
                    </p>
                    <h3 className="mt-2 text-lg font-semibold tracking-tight text-ink sm:text-xl">
                      {shortName}
                    </h3>
                    <p className="mt-1.5 text-sm font-medium text-slate">
                      {p.tagline}
                    </p>
                    <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">
                      {p.description}
                    </p>
                    <span className="mt-5 inline-flex text-sm font-semibold text-ink opacity-60 transition group-hover:opacity-100">
                      {t("cta.learnMore")} →
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
          <div className="mt-8 flex justify-center sm:mt-10">
            <Button href="/what" variant="primary">
              {t("home.programmesCta")}
            </Button>
          </div>
        </div>
      </section>

      {/* 4. Philosophy → theory → model */}
      <section className="section-pad bg-white">
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
                className="rounded-2xl border border-black/[0.08] bg-[#fafafa] p-5 sm:p-6"
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

          <div className="mt-6 grid gap-0 overflow-hidden rounded-xl border border-black/[0.08] sm:mt-8 sm:rounded-2xl md:grid-cols-2">
            <div className="bg-ink p-6 text-white sm:p-8 md:p-10">
              <p className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-white/50">
                {t("home.coreBeliefEyebrow")}
              </p>
              <h3 className="heading-lg mt-3 text-white">
                {t("home.coreBelief")}
              </h3>
              <p className="mt-4 text-base leading-relaxed text-white/65">
                {t("home.coreBeliefBody")}
              </p>
            </div>
            <div className="flex flex-col justify-center gap-0 bg-white p-1 sm:p-2 md:p-4">
              <p className="px-4 pt-3 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-muted sm:px-6">
                {t("home.theoryMapLabel")}
              </p>
              {theories.slice(0, 4).map((th, i) => (
                <div
                  key={th.name}
                  className={`flex items-start gap-3 px-4 py-3.5 sm:px-6 sm:py-4 ${
                    i < 3 ? "border-b border-black/[0.06]" : ""
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
              <div className="border-t border-black/[0.06] px-4 py-3 sm:px-6">
                <Link
                  href="/the-model#theory"
                  className="text-sm font-semibold text-ink underline-offset-4 hover:underline"
                >
                  {t("home.ptmTheoryMap")} →
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-2.5 sm:mt-8 sm:flex-row sm:flex-wrap">
            <Button href="/the-model" variant="primary" className="w-full sm:w-auto">
              {t("cta.exploreModel")}
            </Button>
            <Button href="/how" variant="ghost" className="w-full sm:w-auto">
              {t("home.ptmHow")} →
            </Button>
          </div>
        </div>
      </section>

      {/* 5. Six constructs */}
      <section className="section-pad border-y border-black/[0.06] bg-[#fafafa]">
        <div className="container-site">
          <SectionHeading
            eyebrow={t("home.facesEyebrow")}
            title={t("home.facesTitle")}
            description={t("home.facesDesc")}
          />

          <div className="mt-8 grid gap-3 sm:mt-12 sm:grid-cols-2 lg:mt-14 lg:grid-cols-3">
            {constructs.map((c) => (
              <Link
                key={c.id}
                href={`/constructs#${c.id}`}
                className="card-lift group relative overflow-hidden rounded-xl border border-black/[0.08] bg-white p-4 sm:p-5 md:p-6"
              >
                <div className="relative mb-5 h-12 w-12 overflow-hidden rounded-xl bg-[#f4f4f4]">
                  <Image
                    src={constructIcons[c.id] || constructIcons.choices}
                    alt=""
                    fill
                    className="object-contain p-1.5"
                    sizes="48px"
                  />
                </div>
                <h3 className="text-xl font-semibold tracking-tight text-ink">
                  {t(faceI18n[c.id] || "face.choices")}
                </h3>
                <p className="mt-1 text-sm font-medium text-muted">
                  {c.tagline}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-slate">
                  {c.summary}
                </p>
                <span className="mt-6 inline-flex text-sm font-semibold text-ink opacity-50 transition group-hover:opacity-100">
                  {t("cta.learnMore")} →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Benefits — Holistic / Longitudinal / Multi-level */}
      <section className="section-pad bg-white">
        <div className="container-site">
          <SectionHeading
            eyebrow={t("home.benefitsEyebrow")}
            title={t("home.benefitsTitle")}
            description={t("home.benefitsDesc")}
          />
          <div className="mt-8 grid gap-4 sm:mt-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
            {benefits.map((b) => (
              <article
                key={b.id}
                className="flex flex-col rounded-2xl border border-black/[0.08] bg-[#fafafa] p-5 sm:p-6"
              >
                <div className="relative h-12 w-12 sm:h-14 sm:w-14">
                  <Image
                    src={b.icon.src}
                    alt={b.icon.alt}
                    fill
                    className="object-contain"
                    sizes="56px"
                  />
                </div>
                <h3 className="mt-4 text-lg font-semibold tracking-tight text-ink">
                  {t(b.titleKey)}
                </h3>
                <p className="mt-1 text-sm font-medium text-slate">
                  {t(b.tagKey)}
                </p>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">
                  {t(b.bodyKey)}
                </p>
              </article>
            ))}
          </div>
          <div className="mt-8 flex flex-col gap-2.5 sm:mt-10 sm:flex-row sm:flex-wrap">
            <Button href="/what" variant="primary" className="w-full sm:w-auto">
              {t("home.benefitsCta")}
            </Button>
            <Button href="/why" variant="ghost" className="w-full sm:w-auto">
              {t("nav.why")} →
            </Button>
          </div>
        </div>
      </section>

      {/* 7. Trust strip + social proof */}
      <section className="border-y border-black/[0.06] bg-white">
        <div className="container-site py-4 sm:py-5">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            {trustItems.map((item) => (
              <div key={item.label} className="min-w-0 text-center sm:text-left">
                <p className="text-[0.7rem] font-semibold tracking-tight text-ink sm:text-xs">
                  {item.label}
                </p>
                <p className="mt-0.5 text-[0.65rem] text-muted sm:text-[0.7rem]">
                  {item.detail}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-center text-[0.65rem] text-muted sm:mt-4 sm:text-left sm:text-xs">
            {t("home.trustFooter")}
          </p>
        </div>
      </section>

      <SocialProofStrip />

      {/* 8. Stats strip */}
      <section className="border-b border-black/[0.06] bg-[#fafafa]">
        <div className="container-site grid grid-cols-2 gap-px bg-black/[0.06] md:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-[#fafafa] px-3 py-6 sm:px-5 sm:py-10 md:px-6 md:py-12"
            >
              <p className="text-xl font-semibold tracking-tight text-ink sm:text-3xl md:text-4xl">
                {stat.value}
              </p>
              <p className="mt-1.5 text-xs font-semibold text-ink sm:mt-2 sm:text-sm">
                {stat.label}
              </p>
              <p className="mt-1 text-[0.75rem] leading-snug text-muted sm:text-sm">
                {stat.detail}
              </p>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
