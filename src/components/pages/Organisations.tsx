import { EnquiryForm } from "@/components/EnquiryForm";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/config";
import { pageI18n } from "@/lib/i18n/pages/t";
import { enquiryStrings, localizeEnquiryFields } from "@/lib/i18n/pages/enquiry";
import { fill } from "@/lib/i18n/pages/format";
import { CaseStudyFeature, HowItWorks, OfferList } from "@/components/OfferBlocks";
import { Button, PageHero, SectionHeading } from "@/components/ui";
import { bookingUrl } from "@/lib/booking";
import { SEAT_PACKS, formatSeatPackPrice } from "@/lib/seat-packs";
import type { PageMetaInput } from "@/lib/seo";

/** English page metadata (title and description are translated per language by localePageMeta). */
export const META = {
  path: "/organisations",
  title: "Leadership development for organisations",
  description:
    "Develop and measure your leaders with Super-Cube®: pre-assessment, a six-face programme, post-assessment and a cohort report. Request a quote or book a call.",
} satisfies PageMetaInput;

export function OrganisationsView({ locale = DEFAULT_LOCALE }: { locale?: Locale } = {}) {
  const { t, L } = pageI18n(locale);
  const booking = bookingUrl();
  return (
    <>
      <PageHero t={t}
        theme="leadership"
        eyebrow={t("For organisations")}
        title={t("Develop leaders you can measure.")}
        description={t("A Super-Cube® programme for your managers and teams. We assess, develop and re-assess leadership across six faces, then give you a report you can take to your board.")}
      >
        <Button href="#quote" variant="primary">{t("Request a quote")}</Button>
        <Button href={L(booking)} variant="ghost">{t("Book a call")}</Button>
      </PageHero>

      <OfferList locale={locale}
        eyebrow={t("The offer")}
        title={t("What your organisation gets.")}
        description={t("Built for companies, NGOs and multi-entity networks that want leadership growth they can see, not just training hours.")}
        items={[
          { title: "Whole-leader development", body: "Six faces of leadership: Choices, Principles, Mental, Emotional, Physical and Spiritual." },
          { title: "Online, at each leader’s pace", body: "Short sessions and weekly practice that fit around work, on any device." },
          { title: "Optional facilitated sessions", body: "Run cohort sessions with the 8-week facilitator calendar and coach tools." },
          { title: "Cohort view, with consent", body: "See completion and scores only where leaders agree. Journals always stay private." },
          { title: "Before-and-after report", body: "Pre → post change by face for the cohort, plus individual growth reports." },
          { title: "Certificates you can check", body: "Each certificate has a public verify ID." },
        ]}
      />

      <HowItWorks locale={locale}
        steps={[
          { title: "Pre-assessment", body: "Each leader takes a 10-minute baseline across the six faces." },
          { title: "Programme", body: "Six short courses and a weekly practice plan, weakest faces first." },
          { title: "Post-assessment", body: "Leaders re-measure at the end of the programme." },
          { title: "Report", body: "You receive a cohort report of the change; leaders get their own growth report and certificate." },
        ]}
      />

      <section className="section-pad border-t border-line bg-paper">
        <div className="container-site grid gap-6 lg:grid-cols-[1fr_1fr] lg:items-center">
          <SectionHeading
            eyebrow={t("Pricing")}
            title={t("Seat packs or a tailored quote.")}
            description={fill(
              t("Seat packs start at {price} for {seats} learners. For larger groups, facilitation or custom reporting, we’ll send you a quote."),
              { price: formatSeatPackPrice(SEAT_PACKS[0]), seats: SEAT_PACKS[0].seats },
            )}
          />
          <div className="flex flex-col gap-2.5 sm:flex-row lg:justify-end">
            <Button href={L("/pricing#pilot")} variant="ghost">{t("See seat packs")}</Button>
            <Button href="#quote" variant="primary">{t("Request a quote")}</Button>
          </div>
        </div>
      </section>

      <CaseStudyFeature locale={locale}
        testId="case-study-fmcg"
        eyebrow={t("Case study · FMCG leadership")}
        title={t("Twelve weeks, six faces, +32.2%.")}
        body={t("Leaders at Imana Foods and Kerry Foods completed a 12-week, accredited Super-Cube® leadership development intervention, assessed on every face before and after the course.")}
        stats={[
          { value: "+32.2%", label: "Overall growth, all six faces (%)" },
          { value: "+45.1%", label: "Principles (%)" },
          { value: "+39.5%", label: "Emotional (%)" },
        ]}
        quote={{
          text: "More than the word influence, it provokes your behaviour and calls for change.",
          cite: "Theolen Thevan, Kerry Foods",
        }}
        source="Average gain in assessment score, pre- to post-course, in %. 12-week accredited Super-Cube® intervention (NQF levels 3–5) with leaders at Imana Foods and Kerry Foods. Source: Leadership Is Learnable (2026), Chapter 18."
        href={L("/news/twelve-weeks-six-faces-fmcg-leadership")}
        linkLabel={t("Read the case study")}
        image="/news/fmcg-leadership-case-study-cover.jpg"
        imageAlt={t("Super-Cube® results card: average scores rose by 32.2% across all six faces, with gains by face in %: Choices +26.6%, Principles +45.1%, Mental +29.7%, Emotional +39.5%, Physical +27.7%, Spiritual +24.6%.")}
      />

      <section id="quote" className="section-pad scroll-mt-24 border-t border-line bg-surface">
        <div className="container-site grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-12">
          <div>
            <SectionHeading
              eyebrow={t("Request a quote")}
              title={t("Tell us about your leaders.")}
              description={t("We’ll reply with a proposal and price. Prefer to talk first? Book a short call.")}
            />
            <div className="mt-6">
              <Button href={L(booking)} variant="ghost">{t("Book a call")}</Button>
            </div>
          </div>
          <EnquiryForm
            strings={enquiryStrings(t)}
            intent="organisation-quote"
            source="organisations"
            submitLabel={t("Request a quote")}
            fields={localizeEnquiryFields(t, [
              { name: "name", label: "Your name", required: true, autoComplete: "name" },
              { name: "email", label: "Work email", type: "email", required: true, autoComplete: "email" },
              { name: "organisation", label: "Organisation", required: true, autoComplete: "organization" },
              { name: "role", label: "Your role", autoComplete: "organization-title" },
              { name: "leaders", label: "Number of leaders", type: "number" },
              { name: "timeframe", label: "When would you like to start?", type: "select", options: ["Within a month", "In 1–3 months", "In 3–6 months", "Just exploring"] },
              { name: "message", label: "What would you like to achieve?", type: "textarea" },
            ])}
          />
        </div>
      </section>
    </>
  );
}
