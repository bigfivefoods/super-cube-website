import { Button, PageHero, SectionHeading } from "@/components/ui";
import { site } from "@/lib/content";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/config";
import { pageI18n } from "@/lib/i18n/pages/t";
import type { PageMetaInput } from "@/lib/seo";

export const META = {
  path: "/privacy",
  title: "Privacy",
  description: "How Super-Cube® Learn handles learner data, journals, scores, and coach consent.",
} satisfies PageMetaInput;

const stored: { label: string; body: string }[] = [
  {
    label: "On your device:",
    body: "LMS progress, reflections, assessment responses, and preferences in browser storage until you clear them or sync.",
  },
  {
    label: "If you sign in (Supabase):",
    body: "account email, encrypted session cookies, and optional cloud backup of learner state for multi-device resume.",
  },
  {
    label: "If you join a cohort:",
    body: "membership and consented progress snapshots (scores, completion, certificate id)—not journals.",
  },
  {
    label: "Payments:",
    body: "processed by Paystack; we store programme activation status, not full card numbers.",
  },
  {
    label: "Contact form:",
    body: "name, email, message—used only to respond or route a pilot request.",
  },
  {
    label: "Website visits (unless you opt out):",
    body: "a random visitor cookie kept about 180 days, the pages you open, and the visit details described under Analytics. We do not store your IP address.",
  },
  {
    label: "Newsletter (only if you tick the consent box):",
    body: "your email address, where you signed up, and when you gave and confirmed consent (we email you a link to confirm before sending anything)—stored in our secured database (Supabase, EU region) and used only to send Super-Cube® updates. Every email has a one-click unsubscribe link, or ask us to remove you at any time.",
  },
];

const childItems: { label: string; body: string }[] = [
  {
    label: "Purpose:",
    body: "only to deliver the learner’s programme, progress and growth report, and certificate. No selling, no advertising, no profiling for marketing.",
  },
  {
    label: "What we collect:",
    body: "first name or nickname, age band, learning context, assessment answers and scores, session progress, certificate, private reflections, and a login email if they sign in. We also keep a record of the consent (guardian’s name, relationship, optional email, date and wording version).",
  },
  {
    label: "Who can see it:",
    body: "the learner and their parent or guardian. A coach or school sees scores and progress only if the learner joins their cohort. Reflections are never shared. Wider reports are anonymous and aggregated.",
  },
  {
    label: "Retention:",
    body: "kept while the learner uses Super-Cube®. Deleted on request immediately from live systems and from backups within 30 days. We keep only an anonymous deletion record.",
  },
  {
    label: "Not clinical:",
    body: "results are developmental self-reflection, not a psychological assessment.",
  },
];

function Items({
  items,
  t,
}: {
  items: { label: string; body: string }[];
  t: (s: string) => string;
}) {
  return (
    <ul className="mt-3 list-disc space-y-2 pl-5 text-slate">
      {items.map((item) => (
        <li key={item.label}>
          <strong className="text-ink">{t(item.label)}</strong> {t(item.body)}
        </li>
      ))}
    </ul>
  );
}

export async function PrivacyView({ locale = DEFAULT_LOCALE }: { locale?: Locale } = {}) {
  const { t, L } = await pageI18n(locale);
  return (
    <>
      <PageHero
        t={t}
        theme="none"
        eyebrow="Legal"
        title="Privacy"
        description="How Super-Cube® handles personal data. Journals stay private by default. Coaches only see consented progress snapshots—never journal text."
      >
        <Button href={L("/terms")} variant="ghost">
          {t("Terms of use")}
        </Button>
        <Button href={L("/contact")} variant="primary">
          {t("Contact")}
        </Button>
      </PageHero>

      <section className="section-pad bg-surface">
        <div className="container-site prose-site max-w-3xl space-y-8">
          <div>
            <SectionHeading title={t("Who we are")} />
            <p className="mt-4">
              {t(
                "Super-Cube® Learn is operated in connection with the Super-Cube® Leadership Model (Craig Ross Muller / University of KwaZulu-Natal research lineage). Contact:",
              )}{" "}
              <a href={`mailto:${site.email}`}>{site.email}</a>.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold tracking-tight text-ink">{t("What we store")}</h2>
            <Items items={stored} t={t} />
          </div>

          <div>
            <h2 className="text-xl font-semibold tracking-tight text-ink">{t("Consent & coaches")}</h2>
            <p className="mt-3 text-slate">
              {t(
                "Sharing progress with a cohort coach is opt-in on the Learn dashboard. You can turn it off anytime. Journal reflections are never included in coach exports or roster APIs.",
              )}
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold tracking-tight text-ink">{t("Analytics & errors")}</h2>
            <p className="mt-3 text-slate">
              {t(
                "We count page views with Vercel Web Analytics: no cookies, no account details, and private links (shared reports, feedback invitations, certificates) are recorded without their codes. Those daily totals are one part of the investor Website Insights.",
              )}
            </p>
            <p className="mt-3 text-slate">
              {t(
                "We also keep our own first-party visit record, so the same investor Website Insights can show how the site is used and not only daily totals. If your browser sends Do Not Track or Global Privacy Control, we record nothing and we do not set a cookie. We do not show a cookie banner. Those two signals are the opt-out.",
              )}
            </p>
            <p className="mt-3 text-slate">
              {t(
                "When those signals are off, we set one random visitor cookie for about 180 days. It is not derived from your IP address. It lets us tell a new visit from a returning one, and how often and how recently you came back. Along with that cookie we record the page path, the landing page, the exit page and the first pages of a multi-page visit; time on the page and scroll depth; a PDF download’s file name; the site name of an outbound link (not the full address); the label of a button you use; and named actions such as downloading the free book, signing up, or starting and finishing an assessment. We also record language, the device, browser and operating system family, and a screen-width band (phone, tablet, laptop or desktop) rather than exact pixels. We keep the referring site and the campaign tags you arrived with: source, medium, campaign, content and term.",
              )}
            </p>
            <p className="mt-3 text-slate">
              {t(
                "Country, region, city and timezone are a coarse network location from our hosting provider’s (Vercel’s) location headers, not GPS. Where a server-side lookup can say so, we also keep an organisation label, and industry, size and network type (for example a business network, a mobile network or a hosting network). The lookup runs on our server. We do not write your IP address into the database, the cache or our logs, and we do not store coordinates.",
              )}
            </p>
            <p className="mt-3 text-slate">
              {t(
                "We also measure how quickly each page loads and responds (Core Web Vitals: LCP, INP and CLS). These page-speed readings are stored per page with the device type only, without the visitor cookie.",
              )}
            </p>
            <p className="mt-3 text-slate">
              {t(
                "A visit record does not include your email address, your IP address, GPS coordinates, or anything you type into a form. We do not show your name or email on any public page, and a visit does not send an email, Slack message or other alert.",
              )}
            </p>
            <p className="mt-3 text-slate">
              {t(
                "Optional analytics (e.g. Google Analytics) and error monitoring (e.g. Sentry) may run when configured. They help improve the product and do not require journal content.",
              )}
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold tracking-tight text-ink">{t("Children & schools")}</h2>
            <p className="mt-3 text-slate">
              {t(
                "School programmes should be run under the school’s safeguarding and parental consent policies. Super-Cube® is a development tool, not a clinical assessment. Facilitators must not force public comparison of scores.",
              )}
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold tracking-tight text-ink">{t("Children under 18")}</h2>
            <p className="mt-3 text-slate">
              {t(
                "We take extra care with children’s information. Under POPIA section 35, a parent, legal guardian or other person with parental responsibility must consent before a learner under 18 uses Super-Cube® Learn. Where a school runs the programme, the school may collect that consent under its own parental consent process.",
              )}
            </p>
            <Items items={childItems} t={t} />
            <ul className="mt-3 list-disc space-y-2 pl-5 text-slate">
              <li>
                <strong className="text-ink">{t("Withdrawal and deletion:")}</strong>{" "}
                {t(
                  "a parent or guardian can withdraw consent at any time on the consent screen (learning pauses until consent is given again) and delete all data from You → Delete my data, or by emailing",
                )}{" "}
                <a href={`mailto:${site.email}`}>{site.email}</a>.{" "}
                {t(
                  "They may also ask to access or correct the information, or complain to the Information Regulator.",
                )}
              </li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold tracking-tight text-ink">{t("Your rights (POPIA-oriented)")}</h2>
            <p className="mt-3 text-slate">
              {t("You may request access, correction, or deletion of account-linked data by emailing")}{" "}
              <a href={`mailto:${site.email}`}>{site.email}</a>.{" "}
              {t(
                "Local device data can be cleared via browser storage. Certificate verification pages show only what you chose to register publicly.",
              )}
            </p>
          </div>

          <p className="text-sm text-muted">{t("Last updated: 2026-10-08")}</p>
        </div>
      </section>
    </>
  );
}
