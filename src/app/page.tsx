import Link from "next/link";
import { HomeHero } from "@/components/HomeHero";
import { courseJsonLd, JsonLd, organizationJsonLd } from "@/components/JsonLd";
import { TestimonialsStrip } from "@/components/Testimonials";
import { Button, CTABanner, SectionHeading } from "@/components/ui";
import { site } from "@/lib/content";

export default function HomePage() {
  return (
    <>
      <JsonLd data={organizationJsonLd(site.url)} />
      <JsonLd data={courseJsonLd(site.url)} />

      {/*
        Narrative order (HomeHero client):
        1 hero → 2 cube → 3 programmes → 4 philosophy/theory/model
        → 5 constructs → 6 benefits → 7 trust + social → 8 stats
      */}
      <HomeHero />

      {/* 9. Research strip */}
      <section className="section-pad bg-paper">
        <div className="container-site grid gap-8 sm:gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:gap-12">
          <SectionHeading
            eyebrow="Evidence"
            title="Built through rigorous mixed-methods research."
            description="Validated with confirmatory factor analysis and senior-leader thematic interviews—designed for practical utility in complex business networks."
          />
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
            {[
              {
                k: "132",
                v: "Employees surveyed",
                d: "Structural validity across six constructs",
              },
              {
                k: "10",
                v: "Senior interviews",
                d: "Thematic validation of lived practice",
              },
              {
                k: "0.86",
                v: "CFI model fit",
                d: "Acceptable confirmatory factor analysis",
              },
              {
                k: "α",
                v: "Reliable scales",
                d: "Cronbach’s alpha 0.60–0.80 across constructs",
              },
            ].map((item) => (
              <div
                key={item.v}
                className="rounded-xl border border-line bg-surface p-3.5 sm:p-5"
              >
                <p className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
                  {item.k}
                </p>
                <p className="mt-1 text-sm font-semibold tracking-tight text-ink sm:text-base">
                  {item.v}
                </p>
                <p className="mt-1 text-xs text-muted sm:text-sm">{item.d}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="container-site mt-8 flex flex-col gap-2.5 sm:mt-10 sm:flex-row">
          <Button href="/research" variant="ghost" className="w-full sm:w-auto">
            Explore the research →
          </Button>
          <Button href="/media" variant="ghost" className="w-full sm:w-auto">
            Media kit →
          </Button>
        </div>
      </section>

      {/* 10. Proof of growth */}
      <section className="section-pad border-t border-line bg-surface">
        <div className="container-site grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <SectionHeading
              eyebrow="Proof of growth"
              title="Not activity theatre—measured change."
              description="Learners orient, set a six-face baseline, practice deliberately, then re-measure. Dual radar and PDF report make growth visible for you, a coach, or your organisation."
            />
            <ul className="mt-6 space-y-2.5 text-sm leading-relaxed text-slate sm:text-base">
              <li>· Pre → post comparison across all six Super-Cube® faces</li>
              <li>· Downloadable growth PDF + certificate with verify ID</li>
              <li>
                · Optional private share link for coaches (journals stay
                private)
              </li>
            </ul>
            <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
              <Button href="/learn/start" variant="primary">
                Start free baseline
              </Button>
              <Button href="/pricing" variant="ghost">
                Pricing · pilot · book walkthrough
              </Button>
            </div>
          </div>
          <div className="rounded-2xl border border-line bg-elevated p-5 sm:p-6">
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted">
              Anonymised cohort illustration
            </p>
            <p className="mt-2 text-lg font-semibold tracking-tight text-ink">
              Baseline 52 → Post 68
            </p>
            <p className="mt-1 text-sm text-slate">
              Composite 0–100 scale after an 8-week school pilot pattern
              (illustrative; individual results vary). See methodology notes on
              the sample report.
            </p>
            <div className="mt-5 space-y-2">
              {[
                { n: "Emotional", d: "+18" },
                { n: "Choices", d: "+14" },
                { n: "Principles", d: "+12" },
              ].map((row) => (
                <div
                  key={row.n}
                  className="flex items-center justify-between rounded-lg bg-surface px-3 py-2 text-sm"
                >
                  <span className="font-medium text-ink">{row.n}</span>
                  <span className="font-semibold tabular-nums text-ink">
                    {row.d}
                  </span>
                </div>
              ))}
            </div>
            <Link
              href="/sample-report"
              className="mt-4 inline-block text-sm font-semibold text-ink underline-offset-4 hover:underline"
            >
              Open full sample report →
            </Link>
          </div>
        </div>
      </section>

      {/* 11. Testimonials */}
      <TestimonialsStrip />

      {/* 12. CTA banner */}
      <CTABanner />
    </>
  );
}
