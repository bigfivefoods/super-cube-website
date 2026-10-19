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
  path: "/schools",
  title: "Leadership programme for schools",
  description:
    "Super-Cube® for schools: an age-adapted leadership pathway for learners aged 5–21, with pre- and post-assessment and progress for teachers. Request a quote or book a call.",
} satisfies PageMetaInput;

export function SchoolsView({ locale = DEFAULT_LOCALE }: { locale?: Locale } = {}) {
  const { t, L } = pageI18n(locale);
  const booking = bookingUrl();
  return (
    <>
      <PageHero t={t}
        theme="sdg"
        eyebrow={t("For schools")}
        title={t("Grow young leaders, and see the growth.")}
        description={t("An age-adapted Super-Cube® pathway for learners aged 5 to 21. Learners build character and wise decision-making; teachers see progress with consent.")}
      >
        <Button href="#quote" variant="primary">{t("Request a quote")}</Button>
        <Button href={L(booking)} variant="ghost">{t("Book a call")}</Button>
      </PageHero>

      <OfferList locale={locale}
        eyebrow={t("The offer")}
        title={t("What your school gets.")}
        description={t("One model from Grade R to matric and beyond, so the language of leadership stays consistent as learners grow.")}
        items={[
          { title: "Kids (ages 5–12)", body: "Simple language, stories and play-based practice, with parent and teacher support." },
          { title: "Adolescents (ages 13–21)", body: "Identity, influence and wise decisions, with real-world scenarios from school, sport and digital life." },
          { title: "Short sessions", body: "Practice that fits between classes, one face of leadership at a time." },
          { title: "Cohort codes for teachers", body: "Facilitators see completion and growth snapshots. Learner journals stay private." },
          { title: "Safe by design", body: "Run under your school’s safeguarding and parental consent policies. No public score comparisons." },
          { title: "Reports and certificates", body: "Before-and-after growth reports and certificates with a public verify ID." },
        ]}
      />

      <HowItWorks locale={locale}
        steps={[
          { title: "Pre-assessment", body: "Learners complete an age-appropriate baseline across the six faces." },
          { title: "Programme", body: "Age-adapted courses and weekly practice, starting with each learner’s weakest faces." },
          { title: "Post-assessment", body: "Learners re-measure at the end of the term or programme." },
          { title: "Report", body: "Your school receives a cohort summary; learners and guardians get a personal growth report." },
        ]}
      />

      <section className="section-pad border-t border-line bg-paper">
        <div className="container-site grid gap-6 lg:grid-cols-[1fr_1fr] lg:items-center">
          <SectionHeading
            eyebrow={t("Pricing")}
            title={t("Seat packs or a whole-school quote.")}
            description={fill(
              t("Classroom seat packs start at {price} for {seats} learners. For a grade or whole school, we’ll send you a quote."),
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
        testId="case-study-school"
        eyebrow={t("Field snapshot · School survey, 2024")}
        title={t("No leadership model at all, and a clear wish for one.")}
        body={t("We surveyed 33 Grade 12 boarders at a leading high school in South Africa who took part in a brief Super-Cube® leadership intervention.")}
        stats={[
          { value: "0%", label: "had a leadership model they actually used" },
          { value: "88%", label: "would like to develop their leadership using a scientific approach" },
          { value: "94%", label: "believe leadership is important" },
        ]}
        source="Field snapshot: survey answers from 33 Grade 12 boarders at a leading high school in South Africa, August 2024 (Dr Craig Muller). Self-reported answers, not assessment scores or before-and-after results. 0%: asked which leadership approach they use, none named one."
        href={L("/news/grade-12-boarders-leadership-field-snapshot")}
        linkLabel={t("Read the field snapshot")}
        image="/news/grade-12-leadership-snapshot-cover.jpg"
        imageAlt={t("Super-Cube® field snapshot card: 0% had a leadership model they actually used, 88% want to develop their leadership using a scientific approach, 94% believe leadership is important.")}
      />

      <section id="quote" className="section-pad scroll-mt-24 border-t border-line bg-surface">
        <div className="container-site grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-12">
          <div>
            <SectionHeading
              eyebrow={t("Request a quote")}
              title={t("Tell us about your learners.")}
              description={t("We’ll reply with a plan and price for your school. Prefer to talk first? Book a short call.")}
            />
            <div className="mt-6">
              <Button href={L(booking)} variant="ghost">{t("Book a call")}</Button>
            </div>
          </div>
          <EnquiryForm
            strings={enquiryStrings(t)}
            intent="school-quote"
            source="schools"
            submitLabel={t("Request a quote")}
            fields={localizeEnquiryFields(t, [
              { name: "name", label: "Your name", required: true, autoComplete: "name" },
              { name: "email", label: "Email", type: "email", required: true, autoComplete: "email" },
              { name: "organisation", label: "School", required: true, autoComplete: "organization" },
              { name: "role", label: "Your role", placeholder: "e.g. Principal, Life Orientation teacher" },
              { name: "learners", label: "Number of learners", type: "number" },
              { name: "ages", label: "Learner ages", type: "select", options: ["Ages 5–12", "Ages 13–21", "Both"] },
              { name: "timeframe", label: "When would you like to start?", type: "select", options: ["This term", "Next term", "Next year", "Just exploring"] },
              { name: "message", label: "Anything else we should know?", type: "textarea" },
            ])}
          />
        </div>
      </section>
    </>
  );
}
