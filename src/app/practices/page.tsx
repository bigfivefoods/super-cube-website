import type { Metadata } from "next";
import Link from "next/link";
import { constructs } from "@/lib/content";
import { practiceLibrary } from "@/lib/lms/practices";
import { Button, PageHero, SectionHeading } from "@/components/ui";

export const metadata: Metadata = {
  title: "I–Thou practice library",
  description:
    "Relational leadership exercises and continuous face tracking grounded in Buber and Super-Cube® whole-person development.",
};

export default function PracticesPage() {
  return (
    <>
      <PageHero
        theme="programs"
        eyebrow="Deliberate practice"
        title="I–Thou practice library"
        description="Short relational exercises that transfer course content into culture—plus continuous tracking of the six faces so practice stays matched to your growth priorities."
      >
        <Button href="/learn/practice" variant="primary">
          Today’s micro-practice
        </Button>
        <Button href="/learn/pulse" variant="ghost">
          Track your six faces
        </Button>
      </PageHero>

      <section className="section-pad border-b border-black/[0.06] bg-white">
        <div className="container-site grid gap-8 lg:grid-cols-2 lg:gap-12">
          <SectionHeading
            eyebrow="Continuous development"
            title="Track the six faces. Practise what matters most."
            description="Daily or weekly pulses build patterns across Choices, Principles, Mental, Emotional, Physical, and Spiritual. Recommendations adapt as your profile shifts."
          />
          <div className="space-y-3 text-sm leading-relaxed text-slate">
            <p>
              One-off assessments show a snapshot. Continuous face tracking
              shows trends—which faces need attention this week, which are
              strengthening, and where deliberate practice will move the needle.
            </p>
            <p>
              Inside Super-Cube® Learn you can log a quick pulse (rate three or
              more faces), see pattern insights, and open micro-practices aimed
              at your current stretch faces. Journals and notes stay private by
              default.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <Button href="/learn/pulse" variant="primary">
                Open face tracking
              </Button>
              <Button href="/learn/start" variant="ghost">
                Start free baseline
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="section-pad bg-[#fafafa]">
        <div className="container-site">
          <SectionHeading
            title="Exercises"
            description="Use in classrooms, team stand-ups, or alone. Journals stay private on Super-Cube® Learn."
          />
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {practiceLibrary.map((p) => {
              const color =
                p.constructId === "relational"
                  ? "#0a0a0a"
                  : constructs.find((c) => c.id === p.constructId)?.color;
              return (
                <article
                  key={p.id}
                  className="rounded-2xl border border-black/[0.08] bg-white p-5 sm:p-6"
                  style={
                    color ? { boxShadow: `inset 3px 0 0 ${color}` } : undefined
                  }
                >
                  <p className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-muted">
                    {p.minutes} min · {p.audience}
                    {p.constructId !== "relational"
                      ? ` · ${p.constructId}`
                      : " · relational"}
                  </p>
                  <h2 className="mt-1 text-lg font-semibold tracking-tight text-ink">
                    {p.title}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-slate">
                    {p.summary}
                  </p>
                  <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-slate">
                    {p.steps.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ol>
                  <p className="mt-3 text-[0.8125rem] font-medium text-ink">
                    Debrief: {p.debrief}
                  </p>
                </article>
              );
            })}
          </div>
          <p className="mt-8 text-center text-sm text-muted">
            Need a cohort calendar?{" "}
            <Link
              href="/facilitator"
              className="font-semibold text-ink underline-offset-2 hover:underline"
            >
              Facilitator kit
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}
