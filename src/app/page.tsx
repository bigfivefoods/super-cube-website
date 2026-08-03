import Link from "next/link";
import { HomeHero } from "@/components/HomeHero";
import {
  courseJsonLd,
  JsonLd,
  organizationJsonLd,
} from "@/components/JsonLd";
import { TestimonialsStrip } from "@/components/Testimonials";
import { Button, CTABanner, Eyebrow, SectionHeading } from "@/components/ui";
import { levels, site, theories } from "@/lib/content";

export default function HomePage() {
  return (
    <>
      <JsonLd data={organizationJsonLd(site.url)} />
      <JsonLd data={courseJsonLd(site.url)} />

      <HomeHero />

      {/* Developable thesis */}
      <section className="section-pad bg-white">
        <div className="container-site">
          <div className="grid gap-0 overflow-hidden rounded-xl border border-black/[0.08] sm:rounded-2xl md:grid-cols-2">
            <div className="bg-ink p-6 text-white sm:p-8 md:p-10 lg:p-12">
              <Eyebrow>Core belief</Eyebrow>
              <h2 className="heading-lg mt-3 text-white sm:mt-4">
                Leadership is largely learnable.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-white/65 sm:mt-5 sm:text-lg">
                Super-Cube® holds that roughly{" "}
                <strong className="font-semibold text-white">
                  70–76% of leadership capacity
                </strong>{" "}
                is developable through deliberate practice, experience, and
                structured intervention—not fixed by heredity alone.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-white/45 sm:mt-4 sm:text-base">
                Development follows Illeris’s three-dimensional learning
                theory: content, incentive, and interaction.
              </p>
            </div>
            <div className="flex flex-col justify-center gap-0 bg-white p-1 sm:p-2 md:p-4">
              <p className="px-4 pt-3 text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-muted sm:px-6">
                Theory map (summary)
              </p>
              {theories.map((th, i) => (
                <div
                  key={th.name}
                  className={`flex items-start gap-3 px-4 py-3.5 sm:px-6 sm:py-4 ${
                    i < theories.length - 1 ? "border-b border-black/[0.06]" : ""
                  }`}
                >
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-ink" />
                  <div>
                    <p className="font-semibold tracking-tight text-ink">
                      {th.name}
                    </p>
                    <p className="text-sm text-muted">{th.note}</p>
                  </div>
                </div>
              ))}
              <div className="border-t border-black/[0.06] px-4 py-3 sm:px-6">
                <a
                  href="/the-model#theory"
                  className="text-sm font-semibold text-ink underline-offset-4 hover:underline"
                >
                  Open full literature map →
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Progressive levels */}
      <section className="section-pad border-t border-black/[0.06] bg-[#fafafa]">
        <div className="container-site">
          <SectionHeading
            eyebrow="Scale of impact"
            title="From personal plans to industry reach."
            description="Capacity building radiates outward—strong individuals first, then organisations, networks, and sectors."
          />

          <ol className="mt-8 grid gap-3 sm:mt-12 sm:grid-cols-2 lg:mt-14 lg:grid-cols-3 xl:grid-cols-5">
            {levels.map((level) => (
              <li
                key={level.level}
                className="relative rounded-xl border border-black/[0.08] bg-white p-4 sm:p-5"
              >
                <span className="text-xl font-semibold tracking-tight text-muted sm:text-2xl">
                  {String(level.level).padStart(2, "0")}
                </span>
                <h3 className="mt-2.5 text-[0.975rem] font-semibold tracking-tight text-ink sm:mt-3 sm:text-base">
                  {level.title}
                </h3>
                <p className="mt-1 text-[0.65rem] font-medium uppercase tracking-wider text-muted sm:text-[0.6875rem]">
                  {level.subtitle}
                </p>
                <p className="mt-2.5 text-sm leading-relaxed text-slate sm:mt-3">
                  {level.description}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Research strip */}
      <section className="section-pad bg-white">
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
                className="rounded-xl border border-black/[0.08] bg-[#fafafa] p-3.5 sm:p-5"
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

      {/* Proof + try free */}
      <section className="section-pad border-t border-black/[0.06] bg-[#fafafa]">
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
                · Optional private share link for coaches (journals stay private)
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
          <div className="rounded-2xl border border-black/[0.08] bg-white p-5 sm:p-6">
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
                  className="flex items-center justify-between rounded-lg bg-[#fafafa] px-3 py-2 text-sm"
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

      <TestimonialsStrip />

      <CTABanner />
    </>
  );
}
