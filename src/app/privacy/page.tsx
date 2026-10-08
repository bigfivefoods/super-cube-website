import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { Button, PageHero, SectionHeading } from "@/components/ui";
import { site } from "@/lib/content";

export const metadata: Metadata = pageMeta({
  path: "/privacy",
  title: "Privacy",
  description:
    "How Super-Cube® Learn handles learner data, journals, scores, and coach consent.",
});

export default function PrivacyPage() {
  return (
    <>
      <PageHero
        theme="none"
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

      <section className="section-pad bg-surface">
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
              <li>
                <strong className="text-ink">Newsletter (only if you tick the consent box):</strong>{" "}
                your email address, where you signed up, and when you gave
                and confirmed consent (we email you a link to confirm before
                sending anything)—stored in our secured database (Supabase, EU
                region) and used only to send Super-Cube® updates. Every email
                has a one-click unsubscribe link, or ask us to remove you at any time.
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
              We count page views with Vercel Web Analytics: no cookies, no
              account details, and private links (shared reports, feedback
              invitations, certificates) are recorded without their codes.
              Optional analytics (e.g. Google Analytics) and error monitoring
              (e.g. Sentry) may run when configured. They help improve the
              product and do not require journal content.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold tracking-tight text-ink">
              Children & schools
            </h2>
            <p className="mt-3 text-slate">
              School programmes should be run under the school’s safeguarding
              and parental consent policies. Super-Cube® is a development tool,
              not a clinical assessment. Facilitators must not force public
              comparison of scores.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold tracking-tight text-ink">
              Children under 18
            </h2>
            <p className="mt-3 text-slate">
              We take extra care with children&apos;s information. Under POPIA section 35, a
              parent, legal guardian or other person with parental responsibility must consent
              before a learner under 18 uses Super-Cube® Learn. Where a school runs the
              programme, the school may collect that consent under its own parental consent
              process.
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-slate">
              <li><strong className="text-ink">Purpose:</strong> only to deliver the learner&apos;s programme, progress and growth report, and certificate. No selling, no advertising, no profiling for marketing.</li>
              <li><strong className="text-ink">What we collect:</strong> first name or nickname, age band, learning context, assessment answers and scores, session progress, certificate, private reflections, and a login email if they sign in. We also keep a record of the consent (guardian&apos;s name, relationship, optional email, date and wording version).</li>
              <li><strong className="text-ink">Who can see it:</strong> the learner and their parent or guardian. A coach or school sees scores and progress only if the learner joins their cohort. Reflections are never shared. Wider reports are anonymous and aggregated.</li>
              <li><strong className="text-ink">Retention:</strong> kept while the learner uses Super-Cube®. Deleted on request immediately from live systems and from backups within 30 days. We keep only an anonymous deletion record.</li>
              <li><strong className="text-ink">Withdrawal and deletion:</strong> a parent or guardian can withdraw consent at any time on the consent screen (learning pauses until consent is given again) and delete all data from You → Delete my data, or by emailing {site.email}. They may also ask to access or correct the information, or complain to the Information Regulator.</li>
              <li><strong className="text-ink">Not clinical:</strong> results are developmental self-reflection, not a psychological assessment.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold tracking-tight text-ink">
              Your rights (POPIA-oriented)
            </h2>
            <p className="mt-3 text-slate">
              You may request access, correction, or deletion of account-linked
              data by emailing {site.email}. Local device data can be cleared
              via browser storage. Certificate verification pages show only what
              you chose to register publicly.
            </p>
          </div>

          <p className="text-sm text-muted">Last updated: 2026-10-04</p>
        </div>
      </section>
    </>
  );
}
