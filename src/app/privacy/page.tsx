import type { Metadata } from "next";
import { Button, PageHero, SectionHeading } from "@/components/ui";
import { site } from "@/lib/content";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "How Super-Cube® Learn handles learner data, journals, scores, and coach consent.",
};

export default function PrivacyPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title="Privacy"
        description={`How ${site.name} handles personal data. Journals stay private by default. Coaches only see consented progress snapshots—never journal text.`}
      >
        <Button href="/terms" variant="ghost">
          Terms of use
        </Button>
        <Button href="/contact" variant="primary">
          Contact
        </Button>
      </PageHero>

      <section className="section-pad bg-[#fafafa]">
        <div className="container-site prose-site max-w-3xl space-y-8">
          <div>
            <SectionHeading title="Who we are" />
            <p className="mt-4">
              Super-Cube® Learn is operated in connection with the Super-Cube®
              Leadership Model (Craig Ross Muller / University of KwaZulu-Natal
              research lineage). Contact:{" "}
              <a href={`mailto:${site.email}`}>{site.email}</a>.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold tracking-tight text-ink">
              What we store
            </h2>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-slate">
              <li>
                <strong className="text-ink">On your device:</strong> LMS
                progress, reflections, assessment responses, and preferences in
                browser storage until you clear them or sync.
              </li>
              <li>
                <strong className="text-ink">If you sign in (Supabase):</strong>{" "}
                account email, encrypted session cookies, and optional cloud
                backup of learner state for multi-device resume.
              </li>
              <li>
                <strong className="text-ink">If you join a cohort:</strong>{" "}
                membership and consented progress snapshots (scores, completion,
                certificate id)—not journals.
              </li>
              <li>
                <strong className="text-ink">Payments:</strong> processed by
                Paystack; we store programme activation status, not full card
                numbers.
              </li>
              <li>
                <strong className="text-ink">Contact form:</strong> name, email,
                message—used only to respond or route a pilot request.
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold tracking-tight text-ink">
              Consent & coaches
            </h2>
            <p className="mt-3 text-slate">
              Sharing progress with a cohort coach is opt-in on the Learn
              dashboard. You can turn it off anytime. Journal reflections are
              never included in coach exports or roster APIs.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold tracking-tight text-ink">
              Analytics & errors
            </h2>
            <p className="mt-3 text-slate">
              Optional analytics (e.g. Google Analytics) and error monitoring
              (e.g. Sentry) may run when configured. They help improve the product
              and do not require journal content.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold tracking-tight text-ink">
              Children & schools
            </h2>
            <p className="mt-3 text-slate">
              School programmes should be run under the school’s safeguarding and
              parental consent policies. Super-Cube® is a development tool, not a
              clinical assessment. Facilitators must not force public comparison
              of scores.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold tracking-tight text-ink">
              Your rights (POPIA-oriented)
            </h2>
            <p className="mt-3 text-slate">
              You may request access, correction, or deletion of account-linked
              data by emailing {site.email}. Local device data can be cleared via
              browser storage. Certificate verification pages show only what you
              chose to register publicly.
            </p>
          </div>

          <p className="text-sm text-muted">Last updated: 2026-07-31</p>
        </div>
      </section>
    </>
  );
}
