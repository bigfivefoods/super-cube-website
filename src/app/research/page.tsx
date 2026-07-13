import type { Metadata } from "next";
import { Button, CTABanner, PageHero, SectionHeading } from "@/components/ui";
import { constructs, researchHighlights } from "@/lib/content";

export const metadata: Metadata = {
  title: "Research",
  description:
    "Empirical validation of the Super-Cube® Leadership Model—mixed-methods research, confirmatory factor analysis, and qualitative findings.",
};

export default function ResearchPage() {
  return (
    <>
      <PageHero
        eyebrow="Research & validation"
        title="Evidence that the model holds."
        description="Super-Cube® was developed and tested through a pragmatic explanatory sequential mixed-methods design—quantitative structure first, qualitative depth second—within an African FMCG business-network."
      >
        <Button href="/the-model" variant="primary">
          Return to the model
        </Button>
        <Button href="/about" variant="ghost">
          Origins & authorship
        </Button>
      </PageHero>

      <section className="section-pad">
        <div className="container-site">
          <SectionHeading
            eyebrow="Methodology"
            title="Pragmatic. Sequential. Practice-oriented."
            description="The research prioritised practical utility and real-world applicability—testing whether the six-construct structure fits observed leadership reality."
          />
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {researchHighlights.map((h) => (
              <article
                key={h.title}
                className="rounded-[var(--radius)] border border-[var(--line)] bg-paper p-6 shadow-[var(--shadow-sm)]"
              >
                <h3 className="heading-md text-[1.35rem] text-ink">{h.title}</h3>
                <p className="mt-3 leading-relaxed text-slate">{h.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad border-y border-[var(--line)] bg-ink text-cream">
        <div className="container-site">
          <SectionHeading
            eyebrow="Quantitative results"
            title="Acceptable model fit. Adequate reliability."
            light
            description="Confirmatory factor analysis on survey data from 132 employees assessed overall fit of the Super-Cube® structure."
          />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { k: "2.232", v: "CMIN/DF", d: "Within common SEM thresholds" },
              { k: "0.86", v: "CFI", d: "Comparative Fit Index" },
              { k: "0.097", v: "RMSEA", d: "Root mean square error of approx." },
              {
                k: "0.60–0.80",
                v: "Cronbach’s α",
                d: "Internal consistency across constructs",
              },
            ].map((m) => (
              <div
                key={m.v}
                className="rounded-[var(--radius)] border border-white/10 bg-white/5 p-6"
              >
                <p className="font-display text-3xl text-gold-bright md:text-4xl">
                  {m.k}
                </p>
                <p className="mt-2 font-semibold text-cream">{m.v}</p>
                <p className="mt-1 text-sm text-cream/50">{m.d}</p>
              </div>
            ))}
          </div>
          <p className="mt-8 max-w-2xl text-sm leading-relaxed text-cream/55">
            Fit indices collectively suggest acceptable model fit based on
            established thresholds in structural equation modelling. Reliability
            coefficients indicate adequate to good internal consistency for the
            study sample.
          </p>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-site">
          <SectionHeading
            eyebrow="Qualitative findings"
            title="What senior leaders emphasised."
            description="Face-to-face semi-structured interviews with 10 key decision-makers (Nov 2018–Feb 2019) were analysed using inductive thematic analysis (Braun & Clarke)."
          />

          <div className="mt-12 space-y-4">
            {constructs
              .slice()
              .sort(
                (a, b) =>
                  parseFloat(b.qualitativeShare || "0") -
                  parseFloat(a.qualitativeShare || "0")
              )
              .map((c) => {
                const pct = parseFloat(c.qualitativeShare || "0");
                return (
                  <div key={c.id} className="grid gap-2 md:grid-cols-[10rem_1fr_3rem] md:items-center">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ background: c.color }}
                      />
                      <span className="font-semibold text-ink">{c.name}</span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-cream-dark">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${Math.max(pct * 2.8, 4)}%`,
                          background: c.color,
                        }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-muted md:text-right">
                      {c.qualitativeShare}
                    </span>
                  </div>
                );
              })}
          </div>

          <div className="prose-site mt-10 max-w-3xl">
            <p>
              Mental (31%) and Emotional (29%) together accounted for roughly
              60% of construct-related qualitative content—underscoring
              cognitive and relational demands in practice. Principles (18%),
              Spiritual (12%), Choices (9%), and Physical (1%) also appeared as
              meaningful themes.
            </p>
            <p>
              Participants expressed unanimous support for multilevel
              leadership development—from individual to organisational and
              network levels—with recommendations for inclusive approaches that
              can extend to suppliers and customers for a broader ripple effect.
            </p>
          </div>
        </div>
      </section>

      <section className="section-pad border-t border-[var(--line)] bg-paper">
        <div className="container-site grid gap-10 lg:grid-cols-2">
          <div>
            <SectionHeading
              eyebrow="Limitations"
              title="Honest about scope."
            />
            <div className="prose-site mt-6">
              <p>
                The model was developed and validated within a single-case study
                of one African FMCG business-network. Findings are
                context-specific and should not be over-generalised without
                further testing.
              </p>
              <p>
                Wider industry replication—across organisations, regions, and
                sectors facing comparable challenges—is recommended to assess
                robustness and refine the six constructs for broader continental
                and emerging-market use.
              </p>
            </div>
          </div>
          <div>
            <SectionHeading
              eyebrow="Significance"
              title="Africa-centric and practice-ready."
            />
            <div className="prose-site mt-6">
              <p>
                Super-Cube® stands as one of the first empirically validated
                leadership development frameworks tailored to African FMCG
                complexity—bridging Western-dominant theory and local
                organisational reality.
              </p>
              <p>
                By emphasising human-centric constructs and the developable
                nature of leadership (estimated at 70–76% through practice), it
                offers a credible, context-sensitive alternative for
                organisations building capacity at scale.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-site">
          <SectionHeading
            eyebrow="Primary sources"
            title="Where to go deeper."
          />
          <ul className="mt-8 space-y-4">
            {[
              {
                title:
                  "A Leadership Skills Development Model for the Kwaden Group: A Case Study of an African FMCG Business-Network",
                meta: "Craig Ross Muller · DBA thesis · University of KwaZulu-Natal · 2020",
              },
              {
                title:
                  "A proposed leadership skills development model for African FMCG business-networks: Super-Cube®",
                meta: "Published scholarship (SAJEMS / related research outputs)",
              },
            ].map((ref) => (
              <li
                key={ref.title}
                className="rounded-[var(--radius)] border border-[var(--line)] bg-paper p-5"
              >
                <p className="font-semibold text-ink">{ref.title}</p>
                <p className="mt-1 text-sm text-muted">{ref.meta}</p>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm text-muted">
            Public summaries of the model are also available via scholarly
            repositories and reference encyclopaedias such as Grokipedia.
          </p>
        </div>
      </section>

      <CTABanner />
    </>
  );
}
