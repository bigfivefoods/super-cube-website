import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ImpactResults } from "@/components/ImpactResults";
import { TestimonialsSection } from "@/components/Testimonials";
import { Button, CTABanner, PageHero, SectionHeading } from "@/components/ui";
import { constructs } from "@/lib/content";

export const metadata: Metadata = {
  title: "How — Leadership Education",
  description:
    "How Super-Cube® develops leaders: philosophy to model, orientation, assessment, six construct courses, deliberate practice, and growth reports.",
};

const pathway = [
  {
    n: "01",
    title: "Orient",
    body: "Clarify whether the learner thinks from philosophy, theory, or model—so education meets them where they are.",
    href: "/learn/assessment/orientation",
  },
  {
    n: "02",
    title: "Pre-assess",
    body: "Baseline all six Super-Cube® faces. Strengths and priorities become visible, discussable, and improvable.",
    href: "/learn/assessment",
  },
  {
    n: "03",
    title: "Learn the six faces",
    body: "Structured modules for Choices, Principles, Mental, Emotional, Physical, and Spiritual—age-adapted language and scenarios.",
    href: "/constructs",
  },
  {
    n: "04",
    title: "Practise deliberately",
    body: "Every session moves Read → Engage → Apply. Micro-actions turn insight into behaviour in real life and work.",
    href: "/learn/courses",
  },
  {
    n: "05",
    title: "Re-assess & report",
    body: "Post-assessment and a personal development report so growth is measured—not assumed.",
    href: "/learn/report",
  },
];

const pillars = [
  {
    title: "Philosophy → theory → model",
    body: "We do not skip the layers. Philosophy sets values; theory explains how leadership works; Super-Cube® is the absolute model learners can practise and assess.",
  },
  {
    title: "Blended & human-centric",
    body: "Content, motivation, and social interaction (Illeris) sit inside an I–Thou stance: people are whole beings, not objects of control.",
  },
  {
    title: "Evidence-informed",
    body: "The six-construct structure was tested in doctoral research (mixed methods, African FMCG network) so education is built on a validated frame.",
  },
  {
    title: "From centre outward",
    body: "Development starts with you, then expands through family, friends, colleagues, organisations, and society—capacity that radiates.",
  },
];

export default function HowPage() {
  return (
    <>
      <PageHero
        theme="leadership"
        eyebrow="How Super-Cube® works"
        title="Leadership education that turns insight into practice."
        description="How we develop leaders: a clear model, honest assessment, six construct courses, deliberate practice, and measured growth—designed for kids, adolescents, and adults."
        visual={
          <figure className="w-full overflow-hidden rounded-2xl border border-white/15 bg-white/10 shadow-xl backdrop-blur-sm">
            <div className="relative aspect-[694/584] w-full overflow-hidden">
              <Image
                src="/images/hero/nelson-mandela.jpg"
                alt="Nelson Mandela"
                fill
                className="object-cover object-center"
                sizes="(max-width: 1024px) 20rem, 28vw"
                priority
              />
            </div>
            <figcaption className="p-3.5 sm:p-4">
              <p className="text-[0.7rem] font-medium italic leading-snug text-white/85">
                “Education is the most powerful weapon which you can use to
                change the world.”
              </p>
              <p className="mt-1 text-[0.65rem] font-semibold tracking-wide text-white/55">
                — Nelson Mandela
              </p>
            </figcaption>
          </figure>
        }
      >
        <Button href="/what" variant="primary">
          See the programmes
        </Button>
        <Button href="/learn" variant="ghost">
          Enter the learning app
        </Button>
      </PageHero>

      <section className="section-pad border-b border-black/[0.06] bg-white">
        <div className="container-site grid gap-10 lg:grid-cols-2 lg:gap-16">
          <SectionHeading
            eyebrow="The education approach"
            title="Not a lecture. A development system."
            description="Super-Cube® education is built so learners can understand, practise, and prove growth—not merely consume content."
          />
          <div className="prose-site space-y-4 text-slate">
            <p>
              Leadership is substantially developable through deliberate
              practice. Our pathway combines a multidimensional model with
              structured learning loops: orient, assess, learn, apply, and
              re-measure.
            </p>
            <p>
              Language and scenarios adapt by age, but the six faces stay
              constant—so families, schools, and organisations can share one
              leadership language.
            </p>
          </div>
        </div>

        <div className="container-site mt-12 grid gap-4 sm:grid-cols-2">
          {pillars.map((p) => (
            <article
              key={p.title}
              className="rounded-2xl border border-black/[0.07] bg-[#fafafa] p-5 sm:p-6"
            >
              <h3 className="text-base font-semibold tracking-tight text-ink">
                {p.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate">{p.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section-pad border-b border-black/[0.06] bg-[#fafafa]">
        <div className="container-site">
          <SectionHeading
            eyebrow="The learning pathway"
            title="Five stages. One coherent journey."
            description="From first orientation to personal report—the same arc for every Super-Cube® learner."
          />
          <ol className="mt-10 space-y-3">
            {pathway.map((step) => (
              <li key={step.n}>
                <Link
                  href={step.href}
                  className="grid gap-2 rounded-2xl border border-black/[0.07] bg-white p-5 transition hover:border-black/15 hover:shadow-sm sm:grid-cols-[4rem_1fr_auto] sm:items-center sm:gap-6 sm:p-6"
                >
                  <span className="font-display text-2xl text-muted">
                    {step.n}
                  </span>
                  <div>
                    <h3 className="text-base font-semibold tracking-tight text-ink">
                      {step.title}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate">
                      {step.body}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-ink sm:text-right">
                    Open →
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section-pad border-b border-black/[0.06] bg-white">
        <div className="container-site">
          <SectionHeading
            eyebrow="What learners develop"
            title="Six faces of leadership capacity."
            description="Each construct is a developable domain—taught, practised, and assessed."
          />
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {constructs.map((c) => (
              <Link
                key={c.id}
                href={`/constructs#${c.id}`}
                className="rounded-2xl border border-black/[0.07] bg-white p-5 transition hover:shadow-sm"
                style={{ boxShadow: `inset 3px 0 0 ${c.color}` }}
              >
                <p
                  className="text-[0.65rem] font-bold uppercase tracking-wider"
                  style={{ color: c.color }}
                >
                  {c.name}
                </p>
                <p className="mt-2 text-sm font-semibold tracking-tight text-ink">
                  {c.tagline}
                </p>
                <p className="mt-2 text-xs leading-relaxed text-slate">
                  {c.summary}
                </p>
              </Link>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap gap-3">
            <Button href="/the-model" variant="primary">
              Read the full model
            </Button>
            <Button href="/research" variant="ghost">
              See the evidence
            </Button>
            <Button href="/what" variant="ghost">
              What we offer →
            </Button>
          </div>
        </div>
      </section>

      <ImpactResults
        eyebrow="Does it work?"
        title="Intervention gains you can measure."
        description="Average pre- to post-assessment improvement after Super-Cube® development interventions—by construct and overall."
      />

      <TestimonialsSection
        title="What participants say"
        description="Feedback from leaders in South African FMCG businesses who walked the Super-Cube® programme—learning, growth, and behaviour change in their own words."
      />

      <CTABanner />
    </>
  );
}
