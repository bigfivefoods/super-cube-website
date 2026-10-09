import type { Metadata } from "next";
import Link from "next/link";
import { ImpactResults } from "@/components/ImpactResults";
import { LiveCohortResults } from "@/components/LiveCohortResults";
import { pageMeta } from "@/lib/seo";
import { Button, PageHero, SectionHeading } from "@/components/ui";

export const metadata: Metadata = pageMeta({
  path: "/impact",
  title: "Impact and results",
  description:
    "Super-Cube® impact: live, consented cohort results as they arrive, alongside the results of the 12-week Super-Cube® leadership intervention with Imana Foods and Kerry Foods, each clearly labelled.",
});

export default function ImpactPage() {
  return (
    <>
      <PageHero
        theme="impact"
        eyebrow="Impact"
        title="Growth you can see, labelled honestly."
        description="This page keeps three things apart: live results from real cohorts, results from the original research, and examples that show what a report looks like."
      >
        <Button href="/sample-report" variant="primary">
          View sample report
        </Button>
        <Button href="/learn/start" variant="ghost">
          Start free baseline
        </Button>
      </PageHero>

      {/* 1. Live data (empty state until consented aggregates exist) */}
      <section className="section-pad bg-paper">
        <div className="container-site max-w-4xl">
          <LiveCohortResults />
        </div>
      </section>

      {/* 2. Intervention results (Imana Foods and Kerry Foods), not the doctoral study */}
      <ImpactResults
        eyebrow="Results · 12-week Super-Cube® leadership intervention"
        title="+32.2 percentage points of overall growth across all six faces."
        description="Average pre- and post-course scores from the 12-week accredited Super-Cube® leadership intervention with leaders at Imana Foods and Kerry Foods (South African and international FMCG organisations), with the gain for each face in percentage points (source: Leadership Is Learnable, 2026, Chapter 18). These are programme results, not live LMS data."
      />

      {/* 3. Example pattern (illustrative) */}
      <section className="section-pad border-b border-line">
        <div className="container-site max-w-4xl">
          <article className="rounded-2xl border-2 border-dashed border-line-strong bg-elevated p-6 sm:p-8">
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted">
              Example only · illustrative composite, not live data or a client result
            </p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-ink sm:text-2xl">
              What an 8-week adult cohort report can look like
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate sm:text-base">
              This example shows the format of a cohort report: an overall
              score on a 0–100 scale before and after the programme, and the
              change for each face. Real cohorts will differ. For measured
              results, see the 12-week intervention results above: average scores
              rose by 32.2 percentage points across all six faces, with an
              Emotional gain of +39.5 points.
            </p>
            <div className="mt-5 grid grid-cols-3 gap-2">
              {[
                { k: "52 → 68", v: "Mean overall (0–100)" },
                { k: "+16", v: "Overall points (example)" },
                { k: "8 wks", v: "Pathway length" },
              ].map((s) => (
                <div key={s.v} className="rounded-xl bg-surface px-3 py-3 text-center">
                  <p className="text-lg font-semibold tabular-nums text-ink">{s.k}</p>
                  <p className="mt-0.5 text-xs text-slate">{s.v}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="mt-6 sc-card p-6 sm:p-8">
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted">
              How a school cohort works · a pattern, not a result
            </p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-ink sm:text-2xl">
              Youth pathway with guardian-friendly progress
            </h2>
            <ul className="mt-4 space-y-2 text-sm text-slate">
              <li>· <strong className="text-ink">Setup:</strong> cohort code and a free demo for teachers, then paid seats</li>
              <li>· <strong className="text-ink">Rhythm:</strong> one face per week, weakest first after the baseline</li>
              <li>· <strong className="text-ink">Privacy:</strong> facilitators see completion and growth snapshots; learner journals stay private</li>
            </ul>
          </article>
        </div>
      </section>

      {/* 4. Reporting impact */}
      <section className="section-pad">
        <div className="container-site grid max-w-5xl gap-10 lg:grid-cols-2">
          <div>
            <SectionHeading
              eyebrow="For schools, NGOs and funders"
              title="Report leadership growth as development impact."
              description="With learners’ consent, cohorts can share before-and-after change and certificate verify IDs in SDG-linked reports, without ever publishing journals."
            />
            <ul className="mt-4 list-disc space-y-1.5 pl-5 text-sm text-slate">
              <li>SDG 4 Quality education: a structured leadership pathway</li>
              <li>SDG 5, 8 and 16: agency, work capability and institutions of trust</li>
              <li>
                Exports: coach CSV, cohort report and{" "}
                <Link href="/verify/SC-DEMO" className="font-semibold text-ink underline underline-offset-2">
                  certificate verification
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <SectionHeading
              eyebrow="Run a cohort"
              title="Be part of the first live results."
              description="Organisations and schools that run a cohort can choose to contribute anonymised results to this page (groups of 10 or more only)."
            />
            <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
              <Button href="/organisations" variant="primary">For organisations</Button>
              <Button href="/schools" variant="ghost">For schools</Button>
              <Button href="/research" variant="ghost">The research</Button>
              <Button href="/facilitator" variant="ghost">Facilitator kit</Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
