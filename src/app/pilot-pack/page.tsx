import type { Metadata } from "next";
import { FacilitatorDownloadButton } from "@/components/FacilitatorDownload";
import { Button, PageHero, SectionHeading } from "@/components/ui";
import { cohortCalendar, safeguardingKids } from "@/lib/facilitator";
import { COURSE_PRICE_USD } from "@/lib/programmes";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "School & company pilot pack",
  description:
    "Super-Cube® pilot pack for schools and companies: pricing from $" +
    COURSE_PRICE_USD +
    ", 8-week calendar, consent notes, coach tools, and facilitator one-pager PDF.",
  path: "/pilot-pack",
  image: "/images/hero/hero-programs.jpg",
  keywords: [
    "leadership pilot school",
    "corporate leadership programme South Africa",
    "cohort leadership development",
  ],
});

export default function PilotPackPage() {
  return (
    <>
      <PageHero
        theme="programs"
        eyebrow="Sales enablement"
        title="School & company pilot pack"
        description="Everything a principal, L&D lead, or coach needs to run an 8-week Super-Cube® pilot—without inventing process from scratch."
      >
        <Button href="/pricing#pilot" variant="primary">
          Book a pilot
        </Button>
        <Button href="/learn/coach" variant="ghost">
          Coach tools
        </Button>
      </PageHero>

      <section className="section-pad bg-white">
        <div className="container-site grid gap-10 lg:grid-cols-2">
          <div>
            <SectionHeading
              title="What’s in the pack"
              description="Use this page + the PDF as your leave-behind."
            />
            <ul className="mt-6 space-y-3 text-sm leading-relaxed text-slate">
              <li>
                · <strong className="text-ink">Pricing:</strong> from $
                {COURSE_PRICE_USD} USD per learner; custom for 20+ seats
              </li>
              <li>
                · <strong className="text-ink">Pathway:</strong> orient →
                baseline → six faces → mid check-in → post → report & certificate
              </li>
              <li>
                · <strong className="text-ink">Consent:</strong> journals private;
                coach sees scores only when learners opt in
              </li>
              <li>
                · <strong className="text-ink">Tools:</strong> org codes, roster,
                CSV export, face heat map, verify URLs
              </li>
              <li>
                · <strong className="text-ink">Calendar:</strong> 8-week
                facilitator rhythm below
              </li>
            </ul>
            <div className="mt-6">
              <FacilitatorDownloadButton />
            </div>
          </div>
          <div className="rounded-2xl border border-black/[0.08] bg-[#fafafa] p-5 sm:p-6">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-muted">
              Consent language (draft)
            </p>
            <p className="mt-3 text-sm leading-relaxed text-slate">
              “I understand Super-Cube® Learn stores my reflections on my device
              (and optionally my signed-in account). I may choose to share{" "}
              <strong className="text-ink">scores and completion only</strong>{" "}
              with my cohort coach—not journal text. I can turn sharing off
              anytime on the Learn dashboard.”
            </p>
            <p className="mt-4 text-xs text-muted">
              Adapt under school/company POPIA counsel. See /privacy.
            </p>
          </div>
        </div>
      </section>

      <section className="section-pad border-t border-black/[0.06] bg-[#fafafa]">
        <div className="container-site">
          <SectionHeading title="8-week calendar" />
          <ol className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {cohortCalendar.map((w) => (
              <li
                key={w.week}
                className="rounded-2xl border border-black/[0.07] bg-white p-4"
              >
                <p className="text-[0.65rem] font-bold uppercase tracking-wider text-muted">
                  Week {w.week}
                </p>
                <p className="mt-1 font-semibold text-ink">{w.title}</p>
                <p className="mt-1 text-xs text-slate">{w.focus}</p>
              </li>
            ))}
          </ol>
          <div className="mt-10 max-w-2xl">
            <h3 className="text-sm font-semibold text-ink">Safeguarding</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate">
              {safeguardingKids.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
