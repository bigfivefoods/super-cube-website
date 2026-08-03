import type { Metadata } from "next";
import { TestimonialsSection } from "@/components/Testimonials";
import { Button, CTABanner, PageHero, SectionHeading } from "@/components/ui";

export const metadata: Metadata = {
  title: "About · Dr Craig R. Muller",
  description:
    "Dr Craig R. Muller — DBA, UKZN. Creator of Super-Cube® leadership development. Visionary architect of Kingdom-centred leadership and sustainable impact across Africa through Feed, Educate, and Empower.",
};

const glance = [
  ["Author", "Dr Craig Ross Muller"],
  ["Degree", "Doctor of Business Administration (DBA)"],
  ["Institution", "University of KwaZulu-Natal (2021)"],
  ["Model", "Super-Cube® (2020 thesis · peer-reviewed)"],
  ["Case context", "African FMCG business-network"],
  ["Validation", "Mixed-methods · CFA · thematic interviews"],
];

const pillars = [
  {
    label: "Feed",
    title: "Big Five Foods",
    body: "Innovative, accessible, nutritious FMCG solutions that strengthen food security continent-wide.",
  },
  {
    label: "Educate",
    title: "Super-Cube®",
    body: "A pioneering holistic leadership model across Choices · Principles · Mental · Emotional · Physical · Spiritual intelligence.",
  },
  {
    label: "Empower",
    title: "SupplierAdvisor®",
    body: "Strategic programmes that equip suppliers, entrepreneurs, and communities with tools, strategies, and networks for sustainable growth.",
  },
];

const education = [
  {
    degree: "Doctor of Business Administration (DBA)",
    detail: "University of KwaZulu-Natal · 2021 · Creator of the Super-Cube® leadership model",
  },
  {
    degree: "Master of Business Administration (MBA)",
    detail: "University of KwaZulu-Natal · 2006",
  },
  {
    degree: "Postgraduate Diploma in Management",
    detail: "University of KwaZulu-Natal · 2004",
  },
  {
    degree: "Bachelor of Commerce (B.Comm)",
    detail: "University of KwaZulu-Natal · 2002",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        theme="about"
        eyebrow="About Super-Cube®"
        title="From doctoral research to a development system."
        description="Super-Cube® was created to strengthen leadership capacity in complex, high-growth environments—beginning with rigorous research and a human-centric philosophy."
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

      {/* Founder bio */}
      <section className="section-pad border-b border-black/[0.06] bg-white">
        <div className="container-site">
          <div className="grid min-w-0 gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-12 xl:gap-16">
            <div className="min-w-0">
              <p className="eyebrow">Founder</p>
              <h2 className="heading-lg mt-2.5 text-ink sm:mt-3">
                Dr Craig R. Muller
              </h2>
              <p className="mt-2 text-sm font-semibold tracking-tight text-slate sm:text-base">
                Visionary architect of Kingdom-centred leadership and sustainable
                impact in Africa
              </p>
              <div className="prose-site mt-5 space-y-4 sm:mt-6">
                <p>
                  Dr Craig Muller is a driven innovator—a DBA-credentialed
                  executive with over 20 years of blue-chip experience in FMCG,
                  supply chain optimisation, and global consulting.
                </p>
                <p>
                  His goal is to <strong>feed</strong> (Big Five Foods),{" "}
                  <strong>educate</strong> (Super-Cube® leadership development),
                  and <strong>empower</strong> (SupplierAdvisor®) people across
                  the African continent—to help progress humanity.
                </p>
                <p>
                  Purpose is carried through three integrated platforms that
                  accelerate food security, transformative leadership, and
                  economic empowerment via scalable, evidence-based solutions
                  aligned with Zero Hunger, Quality Education, and No Poverty.
                </p>
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                {["Integrity", "Excellence", "Compassionate empowerment"].map(
                  (v) => (
                    <span
                      key={v}
                      className="inline-flex rounded-full border border-black/[0.08] bg-[#fafafa] px-3 py-1.5 text-[0.75rem] font-semibold text-ink"
                    >
                      {v}
                    </span>
                  )
                )}
              </div>
              <p className="mt-4 text-sm leading-relaxed text-muted">
                Grounded in humility, trust, collaboration, and continuous
                improvement.
              </p>
            </div>

            <div className="min-w-0 rounded-2xl border border-black/[0.08] bg-[#fafafa] p-5 sm:p-6 md:p-7">
              <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted">
                Education
              </p>
              <ul className="mt-4 space-y-4">
                {education.map((ed) => (
                  <li
                    key={ed.degree}
                    className="border-b border-black/[0.06] pb-4 last:border-0 last:pb-0"
                  >
                    <p className="text-sm font-semibold tracking-tight text-ink">
                      {ed.degree}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-slate sm:text-sm">
                      {ed.detail}
                    </p>
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-xs text-muted">
                Contact:{" "}
                <a
                  href="mailto:hello@super-cube.me"
                  className="font-semibold text-ink underline-offset-2 hover:underline"
                >
                  hello@super-cube.me
                </a>
              </p>
            </div>
          </div>

          <div className="mt-10 grid gap-3 sm:mt-12 sm:grid-cols-3 sm:gap-4">
            {pillars.map((p) => (
              <article
                key={p.label}
                className="rounded-2xl border border-black/[0.08] bg-white p-5 shadow-[0_1px_0_rgba(0,0,0,0.02)]"
              >
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-muted">
                  {p.label}
                </p>
                <h3 className="mt-2 text-base font-semibold tracking-tight text-ink">
                  {p.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate">{p.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-site grid min-w-0 gap-10 lg:grid-cols-2 lg:gap-12">
          <div className="prose-site min-w-0">
            <SectionHeading
              eyebrow="Origins"
              title="Born inside a real business network."
            />
            <p className="mt-6">
              The Super-Cube® Leadership Model was developed by{" "}
              <strong>Dr Craig Ross Muller</strong> as the core output of his
              Doctor of Business Administration thesis at the{" "}
              <strong>University of KwaZulu-Natal</strong>. Citation pack:{" "}
              <a href="/media">/media</a>. Privacy: journals private by default;
              coaches only see consented scores (
              <a href="/privacy">privacy policy</a>). Theoretical foundations
              span major leadership schools through Ubuntu, I–Thou, and AQAL—see{" "}
              <a href="/the-model#theory">the full theory map</a>.
            </p>
            <p>
              The thesis—
              <em>
                A Leadership Skills Development Model for the Kwaden Group: A
                Case Study of an African FMCG Business-Network
              </em>
              —addressed leadership capacity challenges in Africa’s fast-moving
              consumer goods sector: rapid population growth, talent abundance
              alongside skills shortages, corruption pressures, poverty,
              conflict, and institutional weaknesses.
            </p>
            <p>
              Rather than import a purely Western template, Muller built and
              tested a multidimensional framework inside a live African
              business-network—bridging theory and practice for emerging-market
              leadership development.
            </p>
          </div>
          <div className="min-w-0 rounded-2xl border border-black/[0.08] bg-white p-5 shadow-[0_1px_0_rgba(0,0,0,0.02)] sm:p-6 md:p-8">
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted">
              At a glance
            </p>
            <dl className="mt-5 space-y-4 sm:mt-6 sm:space-y-5">
              {glance.map(([k, v]) => (
                <div
                  key={k}
                  className="grid grid-cols-1 gap-1 border-b border-black/[0.06] pb-4 last:border-0 last:pb-0 sm:grid-cols-[minmax(6.5rem,30%)_1fr] sm:gap-3"
                >
                  <dt className="text-xs font-medium text-muted sm:text-sm">
                    {k}
                  </dt>
                  <dd className="text-sm font-semibold text-ink">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section className="section-pad border-y border-black/[0.06] bg-[#fafafa]">
        <div className="container-site">
          <SectionHeading
            eyebrow="Why it matters"
            title="Leadership development that fits the context."
            description="Emerging markets need models that honour complexity without abandoning evidence—or the person at the centre of the work."
          />
          <div className="mt-8 grid gap-3 sm:mt-10 sm:grid-cols-2 sm:gap-4 md:mt-12 md:grid-cols-3">
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
                className="rounded-2xl border border-black/[0.08] bg-white p-5 sm:p-6"
              >
                <h3 className="text-base font-semibold tracking-tight text-ink sm:text-lg">
                  {card.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate sm:mt-3">
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
          <div className="mt-8 flex w-full max-w-md flex-col gap-2.5 sm:max-w-none sm:flex-row sm:flex-wrap">
            <Button href="/research" variant="primary" className="w-full sm:w-auto">
              Read the research summary
            </Button>
            <Button href="/programs" variant="ghost" className="w-full sm:w-auto">
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
