import type { Metadata } from "next";
import { Button, PageHero, SectionHeading } from "@/components/ui";
import { site } from "@/lib/content";

export const metadata: Metadata = {
  title: "Community of practice",
  description:
    "Monthly Super-Cube® facilitator clinic for cohort coaches and partners.",
};

export default function CommunityPage() {
  return (
    <>
      <PageHero
        eyebrow="Partners"
        title="Community of practice"
        description="A monthly clinic for facilitators running school or company cohorts—heat maps, safeguarding, I–Thou exercises, and product updates."
      >
        <Button
          href={`mailto:${site.email}?subject=Community%20clinic%20RSVP`}
          variant="primary"
        >
          RSVP by email
        </Button>
        <Button href="/facilitator" variant="ghost">
          Facilitator kit
        </Button>
      </PageHero>

      <section className="section-pad bg-[#fafafa]">
        <div className="container-site max-w-3xl space-y-8">
          <SectionHeading
            title="What we cover"
            description="45–60 minutes. Bring one cohort challenge. No sales pitch first."
          />
          <ul className="list-disc space-y-2 pl-5 text-slate">
            <li>Reading coach heat maps without ranking kids or teams</li>
            <li>Consent, POPIA, and journal privacy in practice</li>
            <li>Weakest-face weekly plans and micro-practices</li>
            <li>Roadmap preview (apps, languages, enterprise SSO)</li>
          </ul>
          <div className="rounded-2xl border border-black/[0.08] bg-white p-5">
            <p className="text-sm font-semibold text-ink">Next clinic</p>
            <p className="mt-1 text-sm text-slate">
              Published via email to active coaches. Prefer calendar booking?
              Use Book a pilot on pricing—select “Facilitator clinic”.
            </p>
            <Button href="/pricing#pilot" variant="primary" className="mt-4">
              Book a pilot / clinic
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
