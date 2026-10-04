import Link from "next/link";
import { SectionHeading } from "@/components/ui";

export type Step = { title: string; body: string };

/** Pre-assessment → programme → post-assessment → report. */
export function HowItWorks({
  steps,
  eyebrow = "How it works",
  title = "Four steps, from baseline to proof.",
}: {
  steps: Step[];
  eyebrow?: string;
  title?: string;
}) {
  return (
    <section className="section-pad border-t border-line bg-surface">
      <div className="container-site">
        <SectionHeading eyebrow={eyebrow} title={title} />
        <ol className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <li key={s.title} className="rounded-2xl border border-line bg-elevated p-5">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-sm font-semibold text-bg">
                {i + 1}
              </span>
              <h3 className="mt-4 text-base font-semibold tracking-tight text-ink">{s.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate">{s.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/** Honest placeholder until a real, approved case study exists. */
export function CaseStudyComingSoon({ audience }: { audience: string }) {
  return (
    <section className="section-pad border-t border-line">
      <div className="container-site">
        <div className="rounded-2xl border-2 border-dashed border-line-strong bg-surface p-6 sm:p-8">
          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted">
            Case study coming soon
          </p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-ink sm:text-2xl">
            We’re preparing a {audience} case study.
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate sm:text-base">
            We only publish case studies with the organisation’s permission and
            real, consented before-and-after results. Until then, you can see
            the{" "}
            <Link href="/research" className="font-semibold text-ink underline underline-offset-2">
              research behind the model
            </Link>{" "}
            and an{" "}
            <Link href="/sample-report" className="font-semibold text-ink underline underline-offset-2">
              example report
            </Link>
            .
          </p>
        </div>
      </div>
    </section>
  );
}

/** Two-column offer list. */
export function OfferList({
  eyebrow,
  title,
  description,
  items,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  items: { title: string; body: string }[];
}) {
  return (
    <section className="section-pad bg-paper">
      <div className="container-site">
        <SectionHeading eyebrow={eyebrow} title={title} description={description} />
        <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it) => (
            <li key={it.title} className="rounded-2xl border border-line bg-elevated p-5">
              <h3 className="text-base font-semibold tracking-tight text-ink">{it.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-slate">{it.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
