import type { Metadata } from "next";
import Image from "next/image";
import { TestimonialsSection } from "@/components/Testimonials";
import { Button, CTABanner, PageHero, SectionHeading } from "@/components/ui";

export const metadata: Metadata = {
  title: "About",
  description:
    "Origins of the Super-Cube® Leadership Model—Craig Ross Muller, University of KwaZulu-Natal, and Africa-centric leadership development.",
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About Super-Cube®"
        title="From doctoral research to a development system."
        description="Super-Cube® was created to strengthen leadership capacity in complex, high-growth environments—beginning with rigorous research and a human-centric philosophy."
        visual={
          <figure className="w-full max-w-[66.666%] bg-white lg:ml-auto">
            <div className="relative aspect-square w-full overflow-hidden">
              <Image
                src="/images/hero/steve-jobs.jpg"
                alt="Steve Jobs"
                fill
                className="object-cover object-center"
                sizes="(max-width: 1024px) 14rem, 18vw"
                priority
              />
            </div>
            <figcaption className="pt-2.5">
              <p className="text-[0.7rem] font-medium italic leading-snug text-slate">
                “The ones who are crazy enough to think that they can change
                the world are the ones who do.”
              </p>
              <p className="mt-1 text-[0.65rem] font-semibold tracking-wide text-muted">
                — Steve Jobs
              </p>
            </figcaption>
          </figure>
        }
      >
        <Button href="/learn/start" variant="primary">
          Start free baseline
        </Button>
        <Button href="/the-model" variant="ghost">
          Explore the model
        </Button>
        <Button href="/contact" variant="ghost">
          Connect with us
        </Button>
      </PageHero>

      <section className="section-pad">
        <div className="container-site grid gap-12 lg:grid-cols-2">
          <div className="prose-site">
            <SectionHeading
              eyebrow="Origins"
              title="Born inside a real business network."
            />
            <p className="mt-6">
              The Super-Cube® Leadership Model was developed by{" "}
              <strong>Craig Ross Muller</strong> in 2020 as the core output of
              his Doctor of Business Administration thesis at the{" "}
              <strong>University of KwaZulu-Natal</strong>. Contact:{" "}
              <a href="mailto:hello@super-cube.me">hello@super-cube.me</a>.
              Citation pack:{" "}
              <a href="/media">/media</a>. Privacy: journals private by default;
              coaches only see consented scores (
              <a href="/privacy">privacy policy</a>). Theoretical foundations
              span major leadership schools through Ubuntu, I–Thou, and AQAL—see{" "}
              <a href="/the-model#theory">the full theory map</a>.
            </p>
            <p>
              The thesis—<em>A Leadership Skills Development Model for the
              Kwaden Group: A Case Study of an African FMCG
              Business-Network</em>—addressed leadership capacity challenges in
              Africa’s fast-moving consumer goods sector: rapid population
              growth, talent abundance alongside skills shortages, corruption
              pressures, poverty, conflict, and institutional weaknesses.
            </p>
            <p>
              Rather than import a purely Western template, Muller built and
              tested a multidimensional framework inside a live African
              business-network—bridging theory and practice for emerging-market
              leadership development.
            </p>
          </div>
          <div className="rounded-[var(--radius-lg)] border border-[var(--line)] bg-paper p-8 shadow-[var(--shadow-sm)]">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold">
              At a glance
            </p>
            <dl className="mt-6 space-y-5">
              {[
                ["Author", "Craig Ross Muller"],
                ["Year", "2020"],
                ["Institution", "University of KwaZulu-Natal"],
                ["Degree", "Doctor of Business Administration (DBA)"],
                ["Case context", "African FMCG business-network"],
                ["Validation", "Mixed-methods · CFA · thematic interviews"],
              ].map(([k, v]) => (
                <div
                  key={k}
                  className="grid grid-cols-[7rem_1fr] gap-3 border-b border-[var(--line)] pb-4 last:border-0 last:pb-0"
                >
                  <dt className="text-sm font-medium text-muted">{k}</dt>
                  <dd className="text-sm font-semibold text-ink">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section className="section-pad border-y border-[var(--line)] bg-paper">
        <div className="container-site">
          <SectionHeading
            eyebrow="Why it matters"
            title="Leadership development that fits the context."
            description="Emerging markets need models that honour complexity without abandoning evidence—or the person at the centre of the work."
          />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                title: "Human-centric",
                body: "Six whole-person constructs with you at the centre—agency first, scale second.",
              },
              {
                title: "Empirically grounded",
                body: "Survey CFA and senior-leader interviews—not a slide deck of untested slogans.",
              },
              {
                title: "Africa-aware",
                body: "Designed for FMCG network realities and transferable to other complex, multi-entity settings.",
              },
            ].map((card) => (
              <article
                key={card.title}
                className="rounded-[var(--radius)] border border-[var(--line)] bg-cream p-6 shadow-[var(--shadow-sm)]"
              >
                <h3 className="heading-md text-[1.35rem] text-ink">
                  {card.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate">
                  {card.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-site max-w-3xl prose-site">
          <SectionHeading
            eyebrow="This website"
            title="Education, not ornament."
          />
          <p className="mt-6">
            super-cube.me presents the Super-Cube® Leadership Model as a clear,
            world-class educational resource—for leaders, L&D teams, and
            organisations seeking a coherent language for human-centric
            development.
          </p>
          <p>
            Content is informed by the model’s published research record and
            public scholarly summaries. For academic citation, always consult
            the primary thesis and peer-reviewed outputs.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href="/research" variant="primary">
              Read the research summary
            </Button>
            <Button href="/programs" variant="ghost">
              See programmes
            </Button>
          </div>
        </div>
      </section>

      <TestimonialsSection
        title="Voices from the field"
        description="Leaders from Imana Foods and Kerry Foods on the Super-Cube® programme—proof that the model lands in real organisations."
      />

      <CTABanner />
    </>
  );
}
