import type { Metadata } from "next";
import { Button, PageHero, SectionHeading } from "@/components/ui";

export const metadata: Metadata = {
  title: "Impact stories",
  description:
    "How Super-Cube® leadership development shows up in South African business and education contexts—growth over activity.",
};

export default function ImpactPage() {
  return (
    <>
      <PageHero
        eyebrow="Impact"
        title="Built in practice. Proven in networks."
        description="Super-Cube® was shaped in African FMCG business-networks and is designed for schools, companies, and multi-entity alliances that need human-centric capacity—not generic leadership theatre."
      >
        <Button href="/sample-report" variant="primary">
          View sample report
        </Button>
        <Button href="/learn/demo" variant="ghost">
          Try free demo
        </Button>
      </PageHero>

      <section className="section-pad">
        <div className="container-site max-w-3xl space-y-12">
          <article className="rounded-2xl border border-black/[0.08] bg-white p-6 sm:p-8">
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted">
              Case · FMCG network (anonymised composite)
            </p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-ink sm:text-2xl">
              From “more training hours” to six-face capacity
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-slate sm:text-base">
              Mid-level leaders in a multi-entity FMCG network completed a
              Super-Cube® adults pathway: orientation, baseline, deliberate
              practice across Choices through Spiritual, then re-measure.
              Facilitators stopped tracking only attendance and started reviewing
              pre → post deltas by face with consent.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-slate">
              <li>
                · <strong className="text-ink">Challenge:</strong> talent
                abundance next to skills gaps; complex stakeholder webs
              </li>
              <li>
                · <strong className="text-ink">Intervention:</strong> linear
                pathway + session journals + dual radar report
              </li>
              <li>
                · <strong className="text-ink">Signal:</strong> stronger Emotional
                and Choices scores; clearer decision language in reviews
              </li>
            </ul>
            <p className="mt-4 text-xs text-muted">
              Composite narrative for illustration; individual results vary.
              Research base: CFA and senior interviews (see Research).
            </p>
          </article>

          <article className="rounded-2xl border border-black/[0.08] bg-white p-6 sm:p-8">
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted">
              Case · School pilot pattern
            </p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-ink sm:text-2xl">
              Youth pathway with guardian-friendly progress
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-slate sm:text-base">
              Schools piloting Super-Cube® Kids or Adolescents use cohort codes
              so facilitators see completion and growth snapshots—while learner
              journals stay private. Short sessions and age-adapted language make
              practice doable between classes.
            </p>
            <ul className="mt-4 space-y-2 text-sm text-slate">
              <li>
                · <strong className="text-ink">Setup:</strong> cohort code + free
                demo for teachers, then paid seats
              </li>
              <li>
                · <strong className="text-ink">Rhythm:</strong> one face focus per
                week (weakest-first after baseline)
              </li>
              <li>
                · <strong className="text-ink">Outcome language:</strong>{" "}
                character, agency, and care—not empty certificates
              </li>
            </ul>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button href="/contact" variant="primary">
                Book a school pilot
              </Button>
              <Button href="/learn/org" variant="ghost">
                Join with a code
              </Button>
            </div>
          </article>

          <div>
            <SectionHeading
              eyebrow="Evidence"
              title="Underpinned by mixed-methods research."
              description="Structural validity across six constructs, senior-leader thematic interviews, and a model built for complex environments."
            />
            <div className="mt-6 flex flex-wrap gap-3">
              <Button href="/research" variant="primary">
                Explore research
              </Button>
              <Button href="/sample-report" variant="ghost">
                Sample report
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
