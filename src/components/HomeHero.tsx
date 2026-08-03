"use client";

import Image from "next/image";
import Link from "next/link";
import { useLocale } from "@/components/LocaleProvider";
import { SocialProofStrip } from "@/components/SocialProof";
import { SuperCube } from "@/components/SuperCube";
import { Button, SectionHeading } from "@/components/ui";
import { constructs, stats } from "@/lib/content";
import { faceI18n, type I18nKey } from "@/lib/i18n";

const constructIcons: Record<string, string> = {
  choices: "/images/constructs/choices-icon.png",
  principles: "/images/constructs/principles-icon.png",
  mental: "/images/constructs/mental-icon.png",
  emotional: "/images/constructs/emotional-icon.png",
  physical: "/images/constructs/physical-icon.png",
  spiritual: "/images/constructs/spiritual-icon.png",
};

const buyers: {
  titleKey: I18nKey;
  descKey: I18nKey;
  ctaKey: I18nKey;
  href: string;
}[] = [
  {
    titleKey: "home.buyer.individual",
    descKey: "home.buyer.individualDesc",
    ctaKey: "home.buyer.individualCta",
    href: "/learn/start",
  },
  {
    titleKey: "home.buyer.school",
    descKey: "home.buyer.schoolDesc",
    ctaKey: "home.buyer.schoolCta",
    href: "/facilitator",
  },
  {
    titleKey: "home.buyer.corp",
    descKey: "home.buyer.corpDesc",
    ctaKey: "home.buyer.corpCta",
    href: "/impact",
  },
  {
    titleKey: "home.buyer.coach",
    descKey: "home.buyer.coachDesc",
    ctaKey: "home.buyer.coachCta",
    href: "/certify",
  },
];

/**
 * Localised home hero through faces grid.
 * Theory thesis / levels / research strips stay English on the server page.
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

      {/* Trust strip — institutional density under hero */}
      <section className="border-b border-black/[0.06] bg-white">
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
            Validated at the University of KwaZulu-Natal · Peer-reviewed in SAJEMS ·
            Pre→post certificates with public verify IDs
          </p>
        </div>
      </section>

      <SocialProofStrip />

      <section className="section-pad bg-white">
        <div className="container-site grid items-center gap-8 sm:gap-10 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] md:gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-12 xl:gap-16">
          <div className="min-w-0 order-2 md:order-1">
            <SectionHeading
              eyebrow={t("home.cubeEyebrow")}
              title={t("home.cubeTitle")}
              description={t("home.cubeDesc")}
            />
            <div className="prose-site mt-5 space-y-4 sm:mt-6">
              <p>
                Born from doctoral research in an African FMCG business-network,
                Super-Cube® synthesises the major leadership schools—from trait
                and contingency through relational, shared, evolutionary, and
                neuroscientific perspectives—plus contemporary topics and
                skills-development debates into one practical system.
              </p>
              <p>
                Philosophically grounded in Buber’s <em>I–Thou</em>, Wilber’s
                AQAL integral frame, and the African philosophy of{" "}
                <strong>Ubuntu</strong>—people as subjects-in-relation, never
                objects of control.
              </p>
            </div>
            <div className="mt-6 flex flex-col gap-2.5 sm:mt-8 sm:flex-row sm:flex-wrap">
              <Button
                href="/the-model#theory"
                variant="ghost"
                className="w-full sm:w-auto"
              >
                Full theory map →
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

      <section className="border-y border-black/[0.06] bg-[#fafafa]">
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

      <section className="section-pad bg-white">
        <div className="container-site">
          <SectionHeading
            eyebrow={t("home.buyersEyebrow")}
            title={t("home.buyersTitle")}
            description={t("home.buyersDesc")}
          />
          <div className="mt-8 grid gap-3 sm:mt-10 sm:grid-cols-2 lg:grid-cols-4">
            {buyers.map((card) => (
              <div
                key={card.titleKey}
                className="flex flex-col rounded-2xl border border-black/[0.08] bg-[#fafafa] p-5"
              >
                <h3 className="text-base font-semibold tracking-tight text-ink">
                  {t(card.titleKey)}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-slate">
                  {t(card.descKey)}
                </p>
                <Link
                  href={card.href}
                  className="mt-4 text-sm font-semibold text-ink underline-offset-4 hover:underline"
                >
                  {t(card.ctaKey)} →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

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
    </>
  );
}
