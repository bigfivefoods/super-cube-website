import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { TestimonialsStrip } from "@/components/Testimonials";
import { Button, CTABanner, PageHero, SectionHeading } from "@/components/ui";
import { constructs } from "@/lib/content";
import { COURSE_PRICE_USD, programmes } from "@/lib/programmes";

export const metadata: Metadata = {
  title: "What — Super-Cube® Programmes",
  description:
    "What Super-Cube® is: leadership programmes for Kids (5–12), Adolescents (13–21), and Adults (22+)—one model across the lifespan. Holistic, longitudinal, multi-level benefits for people and the UN SDGs.",
};

const programmeAccents = [
  constructs[0].color,
  constructs[2].color,
  constructs[5].color,
];

const includes = [
  "Pre-pre orientation (philosophy · theory · model)",
  "Pre-assessment across six constructs",
  "Age-adapted courses for every Super-Cube® face",
  "Practice labs and quick checks",
  "Post-assessment and personal development report",
];

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

type StageOrLevel = {
  label: string;
  meta: string;
  body: string;
  why: string;
};

const benefits: {
  id: "holistic" | "longitudinal" | "multi-level";
  title: string;
  tagline: string;
  logo: (typeof benefitIcons)[keyof typeof benefitIcons];
  intro: string;
  points?: string[];
  stages?: StageOrLevel[];
  levels?: StageOrLevel[];
  sdg: string;
}[] = [
  {
    id: "holistic",
    title: "Holistic",
    tagline: "The whole leader—not a single skill.",
    logo: benefitIcons.holistic,
    intro:
      "Super-Cube® develops leadership as a complete human system. Six interdependent faces work together so growth in one domain strengthens the others—and blind spots are harder to ignore. You stand at the centre: agency first, then impact outward.",
    points: [
      "Six developable constructs: Choices, Principles, Mental, Emotional, Physical, and Spiritual",
      "You at the centre—deliberate practice before cascade to others",
      "Balance over fads: cognition and relationships without neglecting ethics, energy, or purpose",
      "One shared language for home, school, work, sport, and community",
      "Human-centric philosophy (I–Thou): people as whole beings, not tools",
    ],
    levels: [
      {
        label: "Apply it to your life",
        meta: "Why holistic practice matters",
        body: "When only one face is trained, leadership becomes brittle—clever but unkind, driven but exhausted, principled but indecisive.",
        why: "Choose Super-Cube® so every part of who you are can lead: clear choices, steady principles, sharp thinking, warm presence, sustained energy, and a purpose that outlasts the next deadline.",
      },
    ],
    sdg: "The 2030 Agenda is multidimensional—people, planet, prosperity, peace, and partnership. Holistic leadership mirrors that reality: leaders who can hold trade-offs, not optimise one Goal at the expense of others.",
  },
  {
    id: "longitudinal",
    title: "Longitudinal",
    tagline: "One model for a whole life.",
    logo: benefitIcons.longitudinal,
    intro:
      "Longitudinal means more than a course timeline—it means the full arc of a human life. From Kids to Adolescents to Adults, Super-Cube® stays the same. What changes is you: you learn more, and the environments where you live, work, learn, and play grow larger—so the impact of the same six faces becomes more profound.",
    points: [
      "The model never changes—six faces, you at the centre, always",
      "Language and practice deepen with age; the architecture stays continuous",
      "Context expands: family → school → peers → work → community → society",
      "Measurable loops inside each season: orient, pre-assess, learn, practise, post-assess, report",
      "Families and organisations can share one leadership language across generations",
    ],
    stages: [
      {
        label: "Kids (5–12)",
        meta: "Foundations of character",
        body: "Play, stories, and short practice plant the six faces as everyday strengths—kindness, curiosity, fair play, brave choices.",
        why: "Start here so a child grows up knowing leadership is something they can practise—not a title they wait for. The earlier the language of the cube, the deeper the roots.",
      },
      {
        label: "Adolescents (13–21)",
        meta: "Identity, influence, and first real stakes",
        body: "School, sport, first jobs, and digital life raise the stakes. The same six faces now guide identity, peer influence, and wise decisions under pressure.",
        why: "Apply Super-Cube® in these years so young people meet complexity with a compass—not only reaction. This is when the model begins to shape who they become under real consequence.",
      },
      {
        label: "Adults (22+)",
        meta: "Work, home, and wider responsibility",
        body: "Teams, families, communities, and organisations become the arena. Practice is deliberate; assessment makes growth visible; impact reaches further.",
        why: "Live Super-Cube® as an adult so leadership is not a mask at work—it is how you show up in every room. The environments are larger; so is the chance to leave people and systems better than you found them.",
      },
    ],
    sdg: "The SDGs need leaders who can stay in the work across decades—not one campaign. A lifespan model builds capacity early, steadies it through youth, and multiplies it in adulthood, so institutions inherit people who already know how to choose, care, think, feel, endure, and serve purpose.",
  },
  {
    id: "multi-level",
    title: "Multi-level",
    tagline: "From one person to whole systems.",
    logo: benefitIcons.multilevel,
    intro:
      "The same six constructs scale outward. Capacity begins with the individual and can extend through organisations, groups, networks, and industries—so leadership development becomes infrastructure, not a side project.",
    levels: [
      {
        label: "Level 1 · Individual",
        meta: "Personal development plans",
        body: "Pre- and post-assessment across six constructs. Deliberate practice begins with you at the centre of the cube.",
        why: "Apply it here first: no organisation can outsource your integrity, energy, or judgment. Become the leader you would follow—then everything else has somewhere solid to stand.",
      },
      {
        label: "Level 2 · Single Business",
        meta: "Leadership pipelines",
        body: "Systematic talent development inside one organisation—consistent capacity through construct-aligned pathways.",
        why: "Apply it in your company so culture is not left to chance. When teams share Super-Cube® language, feedback gets clearer, trust thickens, and high-potentials grow on purpose.",
      },
      {
        label: "Level 3 · Business Group",
        meta: "Coordinated organisational scale",
        body: "Aligned development across multi-entity groups—shared standards without erasing local context.",
        why: "Apply it across a group so scale does not mean fragmentation. One human-centric model keeps sister companies pulling in the same direction when markets and mandates diverge.",
      },
      {
        label: "Level 4 · Supply Network",
        meta: "Alliance & value-chain capacity",
        body: "Leadership across interconnected entities—suppliers, partners, customers—strengthening the web that delivers value.",
        why: "Apply it in the network so ethics and excellence travel with the product. The cube at this level is how you refuse to profit from weak links you could have strengthened.",
      },
      {
        label: "Level 5 · Industry",
        meta: "Sector-wide impact",
        body: "A framework for broader adoption—growth, skills gaps, and institutional complexity at industry scale.",
        why: "Apply it to your sector so leadership lifts the floor for everyone—competitors included. That is how industries become worthy of the societies they serve, and how Super-Cube® serves the SDGs at true scale.",
      },
    ],
    sdg: "No SDG can be delivered by a single actor. Multi-level Super-Cube® development builds shared capability from personal practice to supply networks and sector scale—exactly the alignment Goals 16 and 17 demand for institutions and partnerships.",
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

      <section className="section-pad border-b border-black/[0.06] bg-white">
        <div className="container-site">
          <SectionHeading
            eyebrow="The offer"
            title="What you get with Super-Cube®."
            description="A complete individual pathway: orient, assess, learn, practise, and report—built for real development, not one-off workshops."
          />
          <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {includes.map((item) => (
              <li
                key={item}
                className="rounded-2xl border border-black/[0.07] bg-[#fafafa] px-5 py-4 text-sm font-medium leading-relaxed text-ink"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Benefits: Holistic · Longitudinal · Multi-level */}
      <section className="section-pad border-b border-black/[0.06] bg-[#fafafa]">
        <div className="container-site">
          <SectionHeading
            eyebrow="Why Super-Cube®"
            title="Benefits of the model."
            description="Three design strengths set Super-Cube® apart: holistic across the whole person; longitudinal across a whole life—Kids, Adolescents, Adults—with the same model as your world gets larger; and multi-level from one person to industry, so leadership capacity can serve people and the UN Sustainable Development Goals."
          />

          <div className="mt-8 flex flex-wrap gap-2">
            {benefits.map((b) => (
              <a
                key={b.id}
                href={`#benefit-${b.id}`}
                className="inline-flex items-center gap-2 rounded-full border border-black/[0.1] bg-white px-3.5 py-1.5 text-sm font-medium text-ink transition hover:border-ink hover:bg-ink hover:text-white"
              >
                <span className="relative h-5 w-5 overflow-hidden">
                  <Image
                    src={b.logo.src}
                    alt=""
                    fill
                    className="object-contain"
                    sizes="20px"
                  />
                </span>
                {b.title}
              </a>
            ))}
          </div>

          <div className="mt-10 space-y-8">
            {benefits.map((b) => (
              <article
                key={b.id}
                id={`benefit-${b.id}`}
                className="scroll-mt-28 overflow-hidden rounded-2xl border border-black/[0.07] bg-white shadow-[0_1px_0_rgba(0,0,0,0.02)]"
              >
                <div className="grid gap-0 lg:grid-cols-[minmax(0,12rem)_minmax(0,1fr)]">
                  <div className="flex flex-col items-center justify-center gap-3 border-b border-black/[0.06] bg-[#fafafa] px-6 py-8 lg:border-b-0 lg:border-r lg:px-8">
                    <div className="relative h-20 w-20 sm:h-24 sm:w-24">
                      <Image
                        src={b.logo.src}
                        alt={b.logo.alt}
                        fill
                        className="object-contain"
                        sizes="96px"
                      />
                    </div>
                    <p className="text-center text-lg font-semibold tracking-tight text-ink">
                      {b.title}
                    </p>
                    <p className="text-center text-xs font-medium text-muted">
                      {b.tagline}
                    </p>
                  </div>

                  <div className="p-5 sm:p-7 lg:p-8">
                    <p className="text-sm leading-relaxed text-slate sm:text-[0.9375rem]">
                      {b.intro}
                    </p>

                    {b.points && b.points.length > 0 && (
                      <>
                        <h3 className="mt-6 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-muted">
                          Benefits in practice
                        </h3>
                        <ul className="mt-3 space-y-2">
                          {b.points.map((point) => (
                            <li
                              key={point}
                              className="flex gap-2.5 text-sm leading-relaxed text-ink"
                            >
                              <span
                                className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-ink"
                                aria-hidden
                              />
                              <span>{point}</span>
                            </li>
                          ))}
                        </ul>
                      </>
                    )}

                    {/* Lifespan stages (longitudinal) */}
                    {b.stages && (
                      <>
                        <h3 className="mt-6 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-muted">
                          Across the lifespan
                        </h3>
                        <p className="mt-1.5 text-xs text-slate">
                          Same model. Deeper learning. Wider context. More
                          profound impact.
                        </p>
                        <div className="mt-3 space-y-3">
                          {b.stages.map((s) => (
                            <div
                              key={s.label}
                              className="rounded-xl border border-black/[0.06] bg-[#fafafa] p-4"
                            >
                              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                                <p className="text-sm font-semibold tracking-tight text-ink">
                                  {s.label}
                                </p>
                                <p className="text-[0.7rem] font-medium text-muted">
                                  {s.meta}
                                </p>
                              </div>
                              <p className="mt-1.5 text-sm leading-relaxed text-slate">
                                {s.body}
                              </p>
                              <p className="mt-2.5 border-l-2 border-ink/20 pl-3 text-sm font-medium leading-relaxed text-ink">
                                {s.why}
                              </p>
                            </div>
                          ))}
                        </div>
                      </>
                    )}

                    {/* Multi-level (and holistic apply) */}
                    {b.levels && (
                      <>
                        <h3 className="mt-6 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-muted">
                          {b.id === "multi-level"
                            ? "Five levels · why apply it"
                            : "Why apply it"}
                        </h3>
                        <div className="mt-3 space-y-3">
                          {b.levels.map((lv) => (
                            <div
                              key={lv.label}
                              className="rounded-xl border border-black/[0.06] bg-[#fafafa] p-4"
                            >
                              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                                <p className="text-sm font-semibold tracking-tight text-ink">
                                  {lv.label}
                                </p>
                                <p className="text-[0.7rem] font-medium text-muted">
                                  {lv.meta}
                                </p>
                              </div>
                              <p className="mt-1.5 text-sm leading-relaxed text-slate">
                                {lv.body}
                              </p>
                              <p className="mt-2.5 border-l-2 border-ink/20 pl-3 text-sm font-medium leading-relaxed text-ink">
                                {lv.why}
                              </p>
                            </div>
                          ))}
                        </div>
                      </>
                    )}

                    <div className="mt-6 rounded-xl border border-black/[0.06] bg-[#f5f7fa] p-4 sm:p-5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="relative h-7 w-7 overflow-hidden">
                          <Image
                            src="/images/sdgs/sdg-logo.png"
                            alt="UN SDGs"
                            fill
                            className="object-contain"
                            sizes="28px"
                          />
                        </span>
                        <p className="text-[0.65rem] font-bold uppercase tracking-[0.12em] text-muted">
                          Addressing the UN SDGs
                        </p>
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-slate">
                        {b.sdg}
                      </p>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-10 rounded-2xl border border-black/[0.07] bg-ink px-5 py-6 text-white sm:px-8 sm:py-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-white/50">
                  Leadership × sustainable development
                </p>
                <h3 className="mt-2 text-xl font-semibold tracking-tight sm:text-2xl">
                  The SDGs define what we must achieve. Super-Cube® develops who
                  can deliver—across a life, and across systems.
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-white/65">
                  Holistic capacity for multi-goal complexity. Longitudinal
                  growth from childhood to adulthood as impact deepens.
                  Multi-level scale for institutions and partnerships. Together,
                  they make Super-Cube® enabling infrastructure for the
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

      <section className="section-pad border-b border-black/[0.06] bg-white">
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
                  className="flex flex-col overflow-hidden rounded-2xl border border-black/[0.08] bg-white shadow-sm"
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

                    <div className="mt-6 border-t border-black/[0.06] pt-5">
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
                        className="inline-flex min-h-11 items-center justify-center rounded-full bg-ink px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-ink-soft"
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

      <section className="section-pad bg-white">
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
