import type { Metadata } from "next";
import { cohortCalendar, safeguardingKids } from "@/lib/facilitator";
import { Button, PageHero, SectionHeading } from "@/components/ui";

export const metadata: Metadata = {
  title: "Facilitator kit",
  description:
    "8-week Super-Cube® cohort calendar, safeguarding notes, and coach tools for schools and companies.",
};

export default function FacilitatorPage() {
  return (
    <>
      <PageHero
        theme="programs"
        eyebrow="Schools & companies"
        title="Facilitator kit"
        description="An 8-week cohort pattern: orient, baseline, faces, re-measure, certify. Pair with /learn/coach for codes, roster, and CSV export."
      >
        <Button href="/learn/coach" variant="primary">
          Open coach tools
        </Button>
        <Button href="/pricing#pilot" variant="ghost">
          Book a pilot
        </Button>
      </PageHero>

      <section className="section-pad bg-white">
        <div className="container-site">
          <SectionHeading
            eyebrow="Calendar"
            title="Eight weeks · one model"
            description="Adjust pacing for term times. Kids programmes need shorter sessions and stronger safeguarding."
          />
          <ol className="mt-8 space-y-4">
            {cohortCalendar.map((w) => (
              <li
                key={w.week}
                className="rounded-2xl border border-black/[0.08] bg-[#fafafa] p-5 sm:p-6"
              >
                <p className="text-[0.7rem] font-bold uppercase tracking-[0.14em] text-muted">
                  Week {w.week}
                </p>
                <h3 className="mt-1 text-lg font-semibold tracking-tight text-ink">
                  {w.title}
                </h3>
                <p className="mt-1 text-sm text-slate">{w.focus}</p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                      Facilitator
                    </p>
                    <ul className="mt-1.5 list-disc space-y-1 pl-4 text-sm text-slate">
                      {w.facilitatorNotes.map((n) => (
                        <li key={n}>{n}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                      Learners
                    </p>
                    <ul className="mt-1.5 list-disc space-y-1 pl-4 text-sm text-slate">
                      {w.learnerActions.map((n) => (
                        <li key={n}>{n}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section-pad border-t border-black/[0.06] bg-[#fafafa]">
        <div className="container-site max-w-3xl">
          <SectionHeading
            eyebrow="Safeguarding"
            title="Kids & adolescents"
          />
          <ul className="mt-6 list-disc space-y-2 pl-5 text-slate">
            {safeguardingKids.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
          <div className="mt-8 flex flex-col gap-2.5 sm:flex-row">
            <Button href="/practices" variant="ghost">
              Practice library
            </Button>
            <Button href="/privacy" variant="ghost">
              Privacy & consent
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
