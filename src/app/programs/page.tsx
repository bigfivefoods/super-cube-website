import type { Metadata } from "next";
import Image from "next/image";
import { Button, CTABanner, PageHero, SectionHeading } from "@/components/ui";
import { constructs, levels } from "@/lib/content";

export const metadata: Metadata = {
  title: "Programs",
  description:
    "Blended leadership development programmes aligned with the Super-Cube® model—from personal plans to network-scale pipelines.",
};

const bookCovers = [
  { id: "choices", title: "Choices", src: "/images/programs/choices-cover.jpg" },
  {
    id: "principles",
    title: "Principles",
    src: "/images/programs/principles-cover.jpg",
  },
  { id: "mental", title: "Mental", src: "/images/programs/mental-cover.jpg" },
  {
    id: "emotional",
    title: "Emotional",
    src: "/images/programs/emotional-cover.jpg",
  },
  {
    id: "physical",
    title: "Physical",
    src: "/images/programs/physical-cover.jpg",
  },
  {
    id: "spiritual",
    title: "Spiritual",
    src: "/images/programs/spiritual-cover.jpg",
  },
];

const offerings = [
  {
    title: "Personal Super-Cube® Plan",
    audience: "Individual leaders & high-potentials",
    duration: "12 weeks",
    points: [
      "Baseline assessment across all six constructs",
      "Personal development plan with deliberate practice goals",
      "Coaching checkpoints and reflective journaling",
      "Post-assessment to measure growth",
    ],
  },
  {
    title: "Leadership Pipeline Programme",
    audience: "Single organisations",
    duration: "6–12 months",
    points: [
      "Cohort-based blended learning (workshops, online, on-the-job)",
      "Construct modules with workplace application projects",
      "Manager-as-coach enablement",
      "Pipeline metrics and succession alignment",
    ],
  },
  {
    title: "Network Capacity Partnership",
    audience: "Groups, alliances & supply chains",
    duration: "Custom",
    points: [
      "Shared language and standards across entities",
      "Multi-level implementation roadmap (Levels 1–5)",
      "Inclusive design extending to partners where relevant",
      "Evaluation design informed by the model’s research methods",
    ],
  },
];

const modalities = [
  {
    title: "Formal learning",
    body: "Structured modules covering each construct—theory, case application, and skills practice.",
  },
  {
    title: "Mentoring & coaching",
    body: "Relational development that honours I–Thou: mutual respect, whole-person growth, and real dialogue.",
  },
  {
    title: "On-the-job experience",
    body: "Deliberate practice in live work contexts—where Illeris’s interaction dimension becomes tangible.",
  },
  {
    title: "Assessment loops",
    body: "Pre- and post-measures across constructs so progress is visible, discussable, and improvable.",
  },
];

export default function ProgramsPage() {
  return (
    <>
      <PageHero
        eyebrow="Programs & pathways"
        title="Structured development. Measurable growth."
        description="Super-Cube® programmes combine deliberate practice with blended learning—flexible, interactive, and designed to embed in organisational systems."
      >
        <Button href="/contact" variant="secondary">
          Request a programme conversation
        </Button>
        <Button href="/the-model" variant="ghost">
          Understand the model first
        </Button>
      </PageHero>

      <section className="section-pad border-b border-black/[0.06] bg-white">
        <div className="container-site">
          <SectionHeading
            eyebrow="Course library"
            title="Six construct pathways. Six book covers."
            description="Each Super-Cube® construct is developed through deliberate practice and structured learning—anchored by its own module."
          />
          <div className="mt-10 grid grid-cols-2 gap-3 sm:mt-12 sm:gap-4 md:grid-cols-3 lg:grid-cols-6">
            {bookCovers.map((book) => (
              <a
                key={book.id}
                href={`/constructs#${book.id}`}
                className="card-lift group block overflow-hidden rounded-xl border border-black/[0.08] bg-white"
              >
                <div className="relative aspect-[3/4] w-full bg-[#f4f4f4]">
                  <Image
                    src={book.src}
                    alt={`${book.title} course cover`}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-[1.03]"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                  />
                </div>
                <p className="px-2 py-2.5 text-center text-xs font-semibold tracking-tight text-ink sm:px-3 sm:py-3 sm:text-sm">
                  {book.title}
                </p>
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-site">
          <SectionHeading
            eyebrow="How we work"
            title="Blended learning for real leadership work."
            description="Interventions are designed around content, incentive, and interaction—so learning is cognitive, motivational, and socially applied."
          />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {modalities.map((m) => (
              <article
                key={m.title}
                className="rounded-xl border border-black/[0.08] bg-white p-6"
              >
                <h3 className="font-semibold text-ink">{m.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate">
                  {m.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad border-y border-[var(--line)] bg-paper">
        <div className="container-site">
          <SectionHeading
            eyebrow="Programme pathways"
            title="Choose the scale of ambition."
          />
          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {offerings.map((o) => (
              <article
                key={o.title}
                className="flex flex-col rounded-[var(--radius-lg)] border border-[var(--line)] bg-cream p-7 shadow-[var(--shadow-sm)]"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold">
                  {o.duration}
                </p>
                <h3 className="heading-md mt-2 text-[1.45rem] text-ink">
                  {o.title}
                </h3>
                <p className="mt-2 text-sm font-medium text-slate">
                  {o.audience}
                </p>
                <ul className="mt-6 flex-1 space-y-3">
                  {o.points.map((p) => (
                    <li key={p} className="flex gap-2.5 text-sm text-slate">
                      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                      {p}
                    </li>
                  ))}
                </ul>
                <Button href="/contact" variant="primary" className="mt-8 w-full">
                  Enquire
                </Button>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-site grid gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading
              eyebrow="Curriculum spine"
              title="Every programme develops all six faces."
            />
            <p className="mt-6 leading-relaxed text-slate">
              Modules are sequenced to build awareness, skill, and application
              across the cube—while allowing organisations to emphasise
              constructs that matter most in their context (for example, Mental
              and Emotional often surface strongly in practice, while Physical
              and Spiritual complete the whole-person picture).
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {constructs.map((c) => (
              <div
                key={c.id}
                className="rounded-[var(--radius)] border border-[var(--line)] bg-paper p-4"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ background: c.color }}
                  />
                  <h3 className="font-semibold text-ink">{c.name}</h3>
                </div>
                <p className="mt-2 text-sm text-muted">{c.tagline}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad border-t border-[var(--line)] bg-ink text-cream">
        <div className="container-site">
          <SectionHeading
            eyebrow="Implementation levels"
            title="A roadmap from self to system."
            description="Programmes map cleanly onto the model’s five progressive levels of application."
            light
          />
          <ol className="mt-12 space-y-4">
            {levels.map((level) => (
              <li
                key={level.level}
                className="grid gap-3 rounded-[var(--radius)] border border-white/10 bg-white/5 p-5 md:grid-cols-[4rem_12rem_1fr] md:items-center"
              >
                <span className="font-display text-3xl text-gold">
                  {String(level.level).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="font-semibold text-cream">{level.title}</h3>
                  <p className="text-xs uppercase tracking-wider text-cream/45">
                    {level.subtitle}
                  </p>
                </div>
                <p className="text-sm leading-relaxed text-cream/65">
                  {level.description}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section-pad bg-paper">
        <div className="container-site max-w-3xl">
          <SectionHeading
            eyebrow="Design principles"
            title="What good Super-Cube® development looks like."
          />
          <ul className="mt-10 space-y-5">
            {[
              "Starts with the individual—assessments and plans that place agency at the centre.",
              "Integrates all six constructs rather than cherry-picking soft skills in isolation.",
              "Uses blended modalities so content, motivation, and workplace interaction reinforce each other.",
              "Scales intentionally—from personal plans to pipelines, groups, networks, and industry.",
              "Remains context-sensitive—especially for emerging-market and multi-entity environments.",
            ].map((item) => (
              <li key={item} className="flex gap-3 text-slate leading-relaxed">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                {item}
              </li>
            ))}
          </ul>
          <div className="mt-10">
            <Button href="/contact" variant="secondary">
              Design a programme with us
            </Button>
          </div>
        </div>
      </section>

      <CTABanner />
    </>
  );
}
