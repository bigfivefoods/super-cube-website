import type { Metadata } from "next";
import Link from "next/link";
import { constructs } from "@/lib/content";
import { Button, PageHero, SectionHeading } from "@/components/ui";

export const metadata: Metadata = {
  title: "Sample growth report",
  description:
    "See what a Super-Cube® pre → post growth report looks like—six faces, dual comparison, and developmental (not clinical) language.",
};

/**
 * Anonymised composite illustration aligned to 0–100 research-style scale.
 * Not a single real learner; pattern mirrors consented pilot composites.
 */
const SAMPLE = {
  name: "Anonymised composite · school pilot pattern",
  programme: "Super-Cube® Adolescents / Adults (illustrative)",
  pre: 52,
  post: 68,
  nNote: "Composite of consented pre→post means (illustrative N≈24)",
  faces: [
    { id: "choices" as const, pre: 48, post: 62 },
    { id: "principles" as const, pre: 55, post: 67 },
    { id: "mental" as const, pre: 50, post: 64 },
    { id: "emotional" as const, pre: 44, post: 62 },
    { id: "physical" as const, pre: 58, post: 70 },
    { id: "spiritual" as const, pre: 57, post: 72 },
  ],
  methodology:
    "Likert multi-item scales per face → 0–100. Cronbach’s α in founding research ~0.60–0.80. Developmental self-report, not clinical or hiring assessment.",
};

export default function SampleReportPage() {
  return (
    <>
      <PageHero
        theme="leadership"
        eyebrow="Sample outcome"
        title="What growth looks like on Super-Cube®."
        description="Illustrative pre → post profile after deliberate practice across the six faces. Real reports are private to the learner; coaches only see shared snapshots with consent."
      >
        <Button href="/learn/start" variant="primary">
          Start free baseline
        </Button>
        <Button href="/pricing" variant="ghost">
          View pricing
        </Button>
      </PageHero>

      <section className="section-pad bg-[#fafafa]">
        <div className="container-site max-w-3xl">
          <div className="rounded-2xl border border-black/[0.08] bg-white p-6 sm:p-8">
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted">
              Anonymised composite · not a single named learner
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
              {SAMPLE.name}
            </h2>
            <p className="mt-1 text-sm text-slate">{SAMPLE.programme}</p>
            <p className="mt-1 text-xs text-muted">{SAMPLE.nNote}</p>

            <div className="mt-6 grid grid-cols-3 gap-3">
              <Stat label="Baseline" value={String(SAMPLE.pre)} />
              <Stat label="Post" value={String(SAMPLE.post)} />
              <Stat
                label="Growth"
                value={`+${SAMPLE.post - SAMPLE.pre}`}
              />
            </div>

            <h3 className="mt-8 text-sm font-semibold uppercase tracking-[0.12em] text-muted">
              By construct
            </h3>
            <ul className="mt-3 space-y-2">
              {SAMPLE.faces.map((row) => {
                const c = constructs.find((x) => x.id === row.id)!;
                const d = Math.round((row.post - row.pre) * 10) / 10;
                return (
                  <li
                    key={row.id}
                    className="flex items-center gap-3 rounded-xl border border-black/[0.06] px-3 py-2.5"
                  >
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ background: c.color }}
                    />
                    <span className="min-w-0 flex-1 text-sm font-semibold text-ink">
                      {c.name}
                    </span>
                    <span className="text-sm tabular-nums text-slate">
                      {row.pre} → {row.post}
                    </span>
                    <span className="text-xs font-semibold tabular-nums text-ink">
                      +{d}
                    </span>
                  </li>
                );
              })}
            </ul>

            <p className="mt-6 text-xs leading-relaxed text-muted">
              {SAMPLE.methodology} Developmental profile within the Super-Cube®
              Leadership Model—not a clinical diagnosis or hiring credential.
              Real learners download PDF reports and certificates with verify
              IDs after the post-assessment. Journals never appear on shared
              snapshots.
            </p>
          </div>

          <div className="mt-10">
            <SectionHeading
              eyebrow="Why this matters"
              title="Measure before and after—or you’re only counting activity."
              description="Super-Cube® is built so individuals, coaches, and organisations can see capacity change on human-centric faces—not vanity completion rates."
            />
            <div className="mt-6 flex flex-wrap gap-3">
              <Button href="/learn/start" variant="primary">
                Start free baseline
              </Button>
              <Button href="/impact" variant="ghost">
                Read a case story
              </Button>
              <Button href="/team" variant="ghost">
                Team cube
              </Button>
              <Link
                href="/research"
                className="inline-flex min-h-11 items-center text-sm font-semibold text-ink underline-offset-2 hover:underline"
              >
                Research base →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-[#fafafa] px-3 py-3">
      <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted">
        {label}
      </p>
      <p className="mt-1 text-xl font-semibold tabular-nums text-ink">{value}</p>
    </div>
  );
}
