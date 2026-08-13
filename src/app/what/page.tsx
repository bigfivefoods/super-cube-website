import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { TestimonialsStrip } from "@/components/Testimonials";
import { Button, CTABanner, PageHero, SectionHeading } from "@/components/ui";
import { constructs } from "@/lib/content";
import { COURSE_PRICE_USD, programmes } from "@/lib/programmes";

import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Leadership programmes for kids, teens & adults",
  description:
    "Super-Cube® leadership programmes for Kids (5–12), Adolescents (13–21), and Adults (22+). One six-face model across the lifespan—orient, baseline, practise, re-measure.",
  path: "/what",
  image: "/images/hero/hero-programs.jpg",
  keywords: [
    "youth leadership programme",
    "adult leadership course",
    "school leadership curriculum South Africa",
  ],
});

const programmeAccents = [
  constructs[0].color,
  constructs[2].color,
  constructs[5].color,
];

const offerPathway = [
  {
    step: "01",
    title: "Orient",
    body: "Philosophy → theory → model so you know why Super-Cube exists before you score yourself.",
  },
  {
    step: "02",
    title: "Assess",
    body: "Baseline across all six faces—Choices, Principles, Mental, Emotional, Physical, Spiritual.",
  },
  {
    step: "03",
    title: "Learn",
    body: "Age-adapted courses for every face (Kids · Adolescents · Adults language).",
  },
  {
    step: "04",
    title: "Practise",
    body: "Labs, daily journal/check-in, and micro-practices so insight becomes behaviour.",
  },
  {
    step: "05",
    title: "Report",
    body: "Post-assessment, growth radar, personal development report, and verifiable certificate path.",
  },
] as const;

const offerIncludes = [
  {
    title: "Orientation that grounds the work",
    body: "Philosophy, theory, and the Super-Cube® model up front—so assessment is meaningful, not a quiz without context.",
  },
  {
    title: "Six-face courses, age-adapted",
    body: "Structured learning for Choices, Principles, Mental, Emotional, Physical, and Spiritual—with language matched to Kids, Adolescents, or Adults.",
  },
  {
    title: "Journal loop & daily check-in",
    body: "Micro-practices, labs, and a living check-in rhythm that turn classroom insight into habits you can keep.",
  },
  {
    title: "Pre- and post-assessment",
    body: "Honest six-face baselines and re-measures so growth is visible, discussable, and improvable—not assumed from attendance.",
  },
  {
    title: "Growth report & certificate path",
    body: "Personal development report with radar, narrative, and a verifiable certificate route when you complete the pathway.",
  },
  {
    title: "Coach & organisation options",
    body: "Seat packs, facilitator kit, and coach roster tools when you run Super-Cube® for a team, school, or cohort—not only solo learners.",
  },
] as const;

const offerDifferentiators = [
  {
    title: "Measured pre → post",
    body: "You leave with evidence of change across six faces—not a certificate of presence.",
  },
  {
    title: "Continuous practice",
    body: "Daily check-ins and micro-practices keep development alive between modules.",
  },
  {
    title: "Whole-person model",
    body: "One cube for ethics, mind, emotion, body, and purpose—not a single soft-skill fad.",
  },
] as const;

/** Icons live at public root: cube.png · longitudinal.svg · multilevel.svg */
const benefitIcons = {
  holistic: { src: "/cube.png", alt: "Super-Cube® cube — holistic benefit" },
  longitudinal: {
    src: "/longitudinal.svg",
    alt: "Longitudinal lifespan development",
  },
  multilevel: {
    src: "/multilevel.svg",
    alt: "Multi-level leadership capacity",
  },
} as const;

const lifespanStages = [
  { label: "Kids", ages: "5–12", line: "Character roots through play & practice" },
  {
    label: "Adolescents",
    ages: "13–21",
    line: "Identity & wise choice under real stakes",
  },
  {
    label: "Adults",
    ages: "22+",
    line: "Work, home & systems with deliberate impact",
  },
] as const;

const multiLevels = [
  { n: "L1", label: "Individual" },
  { n: "L2", label: "Single business" },
  { n: "L3", label: "Business group" },
  { n: "L4", label: "Supply network" },
  { n: "L5", label: "Industry" },
] as const;

const benefits: {
  id: "holistic" | "longitudinal" | "multi-level";
  title: string;
  tagline: string;
  logo: (typeof benefitIcons)[keyof typeof benefitIcons];
  intro: string;
  points: string[];
  sdg: string;
  detail: "faces" | "stages" | "levels";
}[] = [
  {
    id: "holistic",
    title: "Holistic",
    tagline: "The whole leader—not a single skill.",
    logo: benefitIcons.holistic,
    intro:
      "Leadership as a complete human system: six interdependent faces so growth in one domain strengthens the others. You stand at the centre—agency first, then impact outward.",
    points: [
      "Six developable faces working as one language",
      "Balance over fads—ethics, mind, emotion, energy, purpose",
      "Shared vocabulary for home, school, work, and community",
      "I–Thou stance: people as whole beings, not tools",
    ],
    sdg: "Mirrors the multidimensional 2030 Agenda—leaders who hold trade-offs, not one Goal at others’ expense.",
    detail: "faces",
  },
  {
    id: "longitudinal",
    title: "Longitudinal",
    tagline: "One model for a whole life.",
    logo: benefitIcons.longitudinal,
    intro:
      "The same Super-Cube® across Kids, Adolescents, and Adults. Language and practice deepen with age; arenas expand—so the impact of six faces grows more profound over a lifetime.",
    points: [
      "Architecture never changes—six faces, you at the centre",
      "Context expands: family → school → work → society",
      "Measurable loops each season: orient → assess → practise → report",
      "One language families and organisations can share across generations",
    ],
    sdg: "Builds capacity early, steadies it through youth, multiplies it in adulthood—leaders who stay for decades, not one campaign.",
    detail: "stages",
  },
  {
    id: "multi-level",
    title: "Multi-level",
    tagline: "From one person to whole systems.",
    logo: benefitIcons.multilevel,
    intro:
      "The same six constructs scale outward—from personal practice to organisations, networks, and industry—so leadership development becomes infrastructure, not a side project.",
    points: [
      "Starts with the individual: pre/post six-face assessment",
      "Org pipelines with construct-aligned pathways",
      "Group and network alignment without erasing local context",
      "Sector-scale floor-lift for skills, ethics, and institutions",
    ],
    sdg: "Shared capability from person to sector—alignment Goals 16 and 17 demand for institutions and partnerships.",
    detail: "levels",
  },
];

export default function WhatPage() {
  return (
    <>
      <PageHero
        theme="programs"
        eyebrow="What Super-Cube® is"
        title="One leadership model. Three age programmes."
        description={`Kids, Adolescents, and Adults—each pathway uses the same six faces of Super-Cube®, with language and practice matched to life stage. Launch price: $${COURSE_PRICE_USD} USD once per programme.`}
      >
        <Button href="/pricing" variant="primary">
          View pricing
        </Button>
        <Button href="/learn" variant="ghost">
          Go to Learn
        </Button>
      </PageHero>

      <section className="section-pad border-b border-line bg-bg">
        <div className="container-site">
          <SectionHeading
            eyebrow="Programmes"
            title="Kids · Adolescents · Adults"
            description="One model across the lifespan. Choose the pathway for this season—the six faces stay with you as your world gets larger."
          />

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {programmes.map((p, i) => {
              const color = programmeAccents[i % programmeAccents.length];
              return (
                <article
                  key={p.id}
                  id={p.id}
                  className="flex flex-col overflow-hidden rounded-2xl border border-line bg-elevated shadow-sm"
                >
                  <div
                    className="h-1.5 w-full"
                    style={{ background: color }}
                    aria-hidden
                  />
                  <div className="flex flex-1 flex-col p-6 sm:p-7">
                    <p
                      className="text-[0.65rem] font-bold uppercase tracking-[0.14em]"
                      style={{ color }}
                    >
                      {p.ageLabel}
                    </p>
                    <h2 className="mt-2 text-xl font-semibold tracking-tight text-ink">
                      {p.name.replace("Super-Cube® ", "")}
                    </h2>
                    <p className="mt-2 text-sm font-medium text-slate">
                      {p.tagline}
                    </p>
                    <p className="mt-4 flex-1 text-sm leading-relaxed text-slate">
                      {p.description}
                    </p>
                    <p className="mt-4 text-xs text-muted">{p.audienceNote}</p>

                    <div className="mt-6 border-t border-line pt-5">
                      <p className="text-2xl font-semibold tracking-tight text-ink">
                        ${p.priceUsd}
                        <span className="text-sm font-medium text-muted">
                          {" "}
                          USD once
                        </span>
                      </p>
                    </div>

                    <div className="mt-5 flex flex-col gap-2">
                      <Link
                        href={`/pricing#${p.id}`}
                        className="inline-flex min-h-11 items-center justify-center rounded-full sc-btn-primary px-4 py-2.5 text-sm font-semibold transition hover:opacity-90"
                      >
                        Get access
                      </Link>
                      <Link
                        href="/learn/programmes"
                        className="text-center text-xs font-semibold text-muted underline-offset-2 hover:text-ink hover:underline"
                      >
                        Explore in Learn
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section-pad border-b border-line bg-bg">
        <div className="container-site">
          <SectionHeading
            eyebrow="The offer"
            title="What you get with Super-Cube®."
            description="A complete development pathway—not a one-day workshop. Orient, assess, learn, practise, and report so growth is measured and practised, not assumed."
          />

          {/* Pathway journey: Orient → Assess → Learn → Practise → Report */}
          <ol className="mt-10 lg:grid lg:grid-cols-5 lg:gap-0">
            {offerPathway.map((step, i) => {
              const accent = constructs[i % constructs.length].color;
              const isLast = i === offerPathway.length - 1;
              return (
                <li key={step.step} className="relative flex lg:flex-col">
                  <div
                    className="relative mr-4 flex w-10 shrink-0 flex-col items-center lg:mb-4 lg:mr-0 lg:w-auto lg:flex-row lg:items-center lg:pr-3"
                    aria-hidden
                  >
                    <span
                      className="z-[1] flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line bg-elevated font-display text-sm font-semibold tracking-tight text-ink"
                      style={{ boxShadow: `inset 0 0 0 2px ${accent}33` }}
                    >
                      {step.step}
                    </span>
                    {!isLast && (
                      <>
                        <span className="mt-1 w-px flex-1 bg-line lg:hidden" />
                        <span
                          className="ml-2 hidden h-px min-w-0 flex-1 lg:block"
                          style={{
                            background: `linear-gradient(90deg, ${accent}66, color-mix(in srgb, ${accent} 12%, transparent))`,
                          }}
                        />
                      </>
                    )}
                  </div>

                  <div
                    className={`min-w-0 flex-1 lg:pr-4 ${
                      isLast
                        ? "pb-0"
                        : "border-b border-line pb-7 lg:border-b-0 lg:pb-0"
                    }`}
                  >
                    <div
                      className="mb-2.5 h-1 w-8 rounded-full"
                      style={{ background: accent }}
                      aria-hidden
                    />
                    <h3 className="text-base font-semibold tracking-tight text-ink">
                      {step.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-slate">
                      {step.body}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>

          {/* Deliverables */}
          <div className="mt-14">
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-muted">
              Included in every programme
            </p>
            <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {offerIncludes.map((item, i) => {
                const accent = constructs[i % constructs.length].color;
                return (
                  <li
                    key={item.title}
                    className="flex flex-col rounded-2xl border border-line bg-surface p-5 sm:p-6"
                  >
                    <span
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-elevated text-xs font-bold tabular-nums text-ink"
                      style={{ color: accent }}
                      aria-hidden
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="mt-4 text-base font-semibold tracking-tight text-ink">
                      {item.title}
                    </h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-slate">
                      {item.body}
                    </p>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Differentiation callout */}
          <div className="mt-12 overflow-hidden rounded-2xl border border-line bg-elevated">
            <div className="grid gap-0 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.4fr)]">
              <div className="border-b border-line bg-void px-6 py-7 text-void-fg sm:px-8 sm:py-9 lg:border-b-0 lg:border-r">
                <p className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-void-fg/50">
                  Why it&apos;s different
                </p>
                <h3 className="mt-3 text-xl font-semibold tracking-tight sm:text-2xl">
                  Built for real development, not one-off workshops.
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-void-fg/65">
                  Workshops inspire for a day. Super-Cube® is a closed loop:
                  understand the model, measure the six faces, learn and
                  practise, then re-measure—so you can prove growth and keep
                  practising after the room empties.
                </p>
              </div>
              <ul className="grid gap-0 sm:grid-cols-3 sm:divide-x sm:divide-line">
                {offerDifferentiators.map((d) => (
                  <li
                    key={d.title}
                    className="border-b border-line px-5 py-6 last:border-b-0 sm:border-b-0 sm:px-6 sm:py-8"
                  >
                    <p className="text-sm font-semibold tracking-tight text-ink">
                      {d.title}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-slate">
                      {d.body}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* CTA strip */}
          <div className="mt-10 flex flex-col items-start justify-between gap-5 rounded-2xl border border-line bg-surface px-5 py-6 sm:flex-row sm:items-center sm:px-8 sm:py-7">
            <div className="max-w-xl">
              <p className="text-base font-semibold tracking-tight text-ink">
                Ready to see your six-face baseline?
              </p>
              <p className="mt-1 text-sm leading-relaxed text-slate">
                Start free on this device, or review pricing for full pathway
                access—report and certificate included.
              </p>
            </div>
            <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row">
              <Button href="/learn/start" variant="primary">
                Start free baseline
              </Button>
              <Button href="/pricing" variant="ghost">
                See pricing
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits: Holistic · Longitudinal · Multi-level — equal 3-col */}
      <section className="section-pad border-b border-line bg-surface">
        <div className="container-site">
          <SectionHeading
            eyebrow="Why Super-Cube®"
            title="Three strengths. One model."
            description="Holistic across the whole person · longitudinal across a whole life · multi-level from one leader to industry—so capacity serves people and the UN Sustainable Development Goals."
          />

          <div className="mt-10 grid gap-4 lg:grid-cols-3 lg:gap-5 lg:items-stretch">
            {benefits.map((b) => (
              <article
                key={b.id}
                id={`benefit-${b.id}`}
                className="flex h-full scroll-mt-28 flex-col overflow-hidden rounded-2xl border border-line bg-elevated shadow-[0_1px_0_rgba(0,0,0,0.02)]"
              >
                {/* Top band */}
                <div className="flex items-start gap-3 border-b border-line bg-surface px-5 py-5 sm:px-6">
                  <div className="relative h-12 w-12 shrink-0 sm:h-14 sm:w-14">
                    <Image
                      src={b.logo.src}
                      alt={b.logo.alt}
                      fill
                      className="object-contain"
                      sizes="56px"
                    />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-lg font-semibold tracking-tight text-ink">
                      {b.title}
                    </h3>
                    <p className="mt-0.5 text-xs font-medium leading-snug text-muted sm:text-sm">
                      {b.tagline}
                    </p>
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-5 sm:p-6">
                  <p className="text-sm leading-relaxed text-slate">{b.intro}</p>

                  <h4 className="mt-5 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-muted">
                    In practice
                  </h4>
                  <ul className="mt-2.5 space-y-2">
                    {b.points.map((point) => (
                      <li
                        key={point}
                        className="flex gap-2.5 text-sm leading-snug text-ink"
                      >
                        <span
                          className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-ink/70"
                          aria-hidden
                        />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Unique detail strip */}
                  <div className="mt-5 rounded-xl border border-line bg-surface p-3.5 sm:p-4">
                    {b.detail === "faces" && (
                      <>
                        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-muted">
                          Six faces
                        </p>
                        <div className="mt-2.5 flex flex-wrap gap-1.5">
                          {constructs.map((c) => (
                            <span
                              key={c.id}
                              className="rounded-full px-2.5 py-1 text-[0.7rem] font-semibold text-white"
                              style={{ background: c.color }}
                            >
                              {c.name}
                            </span>
                          ))}
                        </div>
                      </>
                    )}

                    {b.detail === "stages" && (
                      <>
                        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-muted">
                          Across the lifespan
                        </p>
                        <ul className="mt-2.5 space-y-2">
                          {lifespanStages.map((s) => (
                            <li
                              key={s.label}
                              className="flex items-start gap-2.5 rounded-lg border border-line bg-elevated px-2.5 py-2"
                            >
                              <span className="shrink-0 rounded-md bg-void px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wide text-void-fg">
                                {s.label}
                              </span>
                              <span className="min-w-0">
                                <span className="block text-[0.65rem] font-medium text-muted">
                                  {s.ages}
                                </span>
                                <span className="block text-xs leading-snug text-ink">
                                  {s.line}
                                </span>
                              </span>
                            </li>
                          ))}
                        </ul>
                      </>
                    )}

                    {b.detail === "levels" && (
                      <>
                        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-muted">
                          Five levels
                        </p>
                        <ol className="mt-2.5 space-y-0">
                          {multiLevels.map((lv, i) => {
                            const isLast = i === multiLevels.length - 1;
                            return (
                              <li key={lv.n} className="flex gap-2.5">
                                <div
                                  className="flex w-7 shrink-0 flex-col items-center"
                                  aria-hidden
                                >
                                  <span className="flex h-6 w-6 items-center justify-center rounded-full border border-line bg-elevated text-[0.6rem] font-bold tabular-nums text-ink">
                                    {lv.n}
                                  </span>
                                  {!isLast && (
                                    <span className="w-px flex-1 bg-line" />
                                  )}
                                </div>
                                <p
                                  className={`text-xs font-medium text-ink ${
                                    isLast ? "pb-0 pt-1" : "pb-2.5 pt-1"
                                  }`}
                                >
                                  {lv.label}
                                </p>
                              </li>
                            );
                          })}
                        </ol>
                      </>
                    )}
                  </div>

                  {/* SDG footer */}
                  <div className="mt-auto border-t border-line pt-4">
                    <div className="flex items-center gap-2">
                      <span className="relative h-5 w-5 shrink-0 overflow-hidden">
                        <Image
                          src="/images/sdgs/sdg-logo.png"
                          alt=""
                          fill
                          className="object-contain"
                          sizes="20px"
                        />
                      </span>
                      <p className="text-[0.6rem] font-bold uppercase tracking-[0.12em] text-muted">
                        UN SDGs
                      </p>
                    </div>
                    <p className="mt-1.5 text-xs leading-relaxed text-slate">
                      {b.sdg}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-10 rounded-2xl border border-line bg-void px-5 py-6 text-void-fg sm:px-8 sm:py-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-void-fg/50">
                  Leadership × sustainable development
                </p>
                <h3 className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">
                  The SDGs set the destination. Super-Cube® develops who can
                  deliver—across a life, and across systems.
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-void-fg/65">
                  Holistic capacity for multi-goal complexity. Longitudinal
                  growth as arenas expand. Multi-level scale for institutions
                  and partnerships. Together: enabling infrastructure for the
                  Goals—not a side programme.
                </p>
              </div>
              <div className="flex shrink-0 flex-col gap-2 sm:flex-row lg:flex-col">
                <Button href="/why-leadership" variant="light">
                  Why leadership & the SDGs
                </Button>
                <Button
                  href="/constructs"
                  variant="ghost"
                  className="!border-white/20 !bg-transparent !text-white hover:!bg-white/10"
                >
                  Explore the six faces
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section-pad bg-bg">
        <div className="container-site grid gap-10 lg:grid-cols-2 lg:items-center">
          <SectionHeading
            eyebrow="Same cube, different season of life"
            title="One language for home, school, and work."
            description="Whether the learner is five or fifty, Super-Cube® keeps the six faces intact—so growth can be shared across generations and organisations as the arenas of life expand."
          />
          <div className="flex flex-wrap gap-2">
            {constructs.map((c) => (
              <span
                key={c.id}
                className="rounded-full px-3 py-1.5 text-xs font-semibold text-white"
                style={{ background: c.color }}
              >
                {c.name}
              </span>
            ))}
          </div>
          <div className="lg:col-span-2 flex flex-wrap gap-3">
            <Button href="/how" variant="ghost">
              ← How education works
            </Button>
            <Button href="/why-leadership" variant="ghost">
              Why leadership matters
            </Button>
            <Button href="/pricing" variant="primary">
              Pricing
            </Button>
          </div>
        </div>
      </section>

      <TestimonialsStrip />

      <CTABanner />
    </>
  );
}
