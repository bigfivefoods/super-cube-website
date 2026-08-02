import type { Metadata } from "next";
import Link from "next/link";
import { Button, PageHero, SectionHeading } from "@/components/ui";

export const metadata: Metadata = {
  title: "Certification ladder",
  description:
    "Learner, Practitioner, and Facilitator pathways with public verify IDs.",
};

const rungs = [
  {
    level: "1 · Learner",
    title: "Complete the pathway",
    d: "Orient, baseline, courses, post-assessment, growth report. Certificate with public verify URL.",
    href: "/learn/start",
    cta: "Start learning",
  },
  {
    level: "2 · Practitioner",
    title: "30-day deliberate practice",
    d: "Streak + micro-practices after certificate. Designed for managers who coach themselves first.",
    href: "/learn/practice",
    cta: "Micro-practices",
  },
  {
    level: "3 · Facilitator",
    title: "Run a cohort",
    d: "Create org, 8-week calendar, roster, consented heat map, CSV export. Partner clinic monthly.",
    href: "/facilitator",
    cta: "Facilitator kit",
  },
];

export default function CertifyPage() {
  return (
    <>
      <PageHero
        eyebrow="Credentials"
        title="Certification ladder"
        description="Growth you can verify—not empty badges. Each rung maps to product behaviour already in Super-Cube® Learn."
      >
        <Button href="/learn/report" variant="primary">
          Your report & certificate
        </Button>
        <Button href="/community" variant="ghost">
          Community clinic
        </Button>
      </PageHero>

      <section className="section-pad bg-[#fafafa]">
        <div className="container-site max-w-3xl space-y-4">
          {rungs.map((r) => (
            <div
              key={r.level}
              className="rounded-2xl border border-black/[0.08] bg-white p-5 sm:p-6"
            >
              <p className="text-[0.7rem] font-bold uppercase tracking-[0.14em] text-muted">
                {r.level}
              </p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight text-ink">
                {r.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate">{r.d}</p>
              <Link
                href={r.href}
                className="mt-3 inline-block text-sm font-semibold text-ink underline-offset-4 hover:underline"
              >
                {r.cta} →
              </Link>
            </div>
          ))}
          <SectionHeading
            title="Verify"
            description="Completion certificates include an ID like SC-YYYYMMDD-HEX. Anyone can check /verify/[id]."
          />
        </div>
      </section>
    </>
  );
}
