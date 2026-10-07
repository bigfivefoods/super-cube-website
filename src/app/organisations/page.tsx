import type { Metadata } from "next";
import { EnquiryForm } from "@/components/EnquiryForm";
import { CaseStudyFeature, HowItWorks, OfferList } from "@/components/OfferBlocks";
import { Button, PageHero, SectionHeading } from "@/components/ui";
import { bookingUrl } from "@/lib/booking";
import { SEAT_PACKS, formatSeatPackPrice } from "@/lib/seat-packs";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  path: "/organisations",
  title: "Leadership development for organisations",
  description:
    "Develop and measure your leaders with Super-Cube®: pre-assessment, a six-face programme, post-assessment and a cohort report. Request a quote or book a call.",
});

export default function OrganisationsPage() {
  const booking = bookingUrl();
  return (
    <>
      <PageHero
        theme="leadership"
        eyebrow="For organisations"
        title="Develop leaders you can measure."
        description="A Super-Cube® programme for your managers and teams. We assess, develop and re-assess leadership across six faces, then give you a report you can take to your board."
      >
        <Button href="#quote" variant="primary">Request a quote</Button>
        <Button href={booking} variant="ghost">Book a call</Button>
      </PageHero>

      <OfferList
        eyebrow="The offer"
        title="What your organisation gets."
        description="Built for companies, NGOs and multi-entity networks that want leadership growth they can see, not just training hours."
        items={[
          { title: "Whole-leader development", body: "Six faces of leadership: Choices, Principles, Mental, Emotional, Physical and Spiritual." },
          { title: "Online, at each leader’s pace", body: "Short sessions and weekly practice that fit around work, on any device." },
          { title: "Optional facilitated sessions", body: "Run cohort sessions with the 8-week facilitator calendar and coach tools." },
          { title: "Cohort view, with consent", body: "See completion and scores only where leaders agree. Journals always stay private." },
          { title: "Before-and-after report", body: "Pre → post change by face for the cohort, plus individual growth reports." },
          { title: "Certificates you can check", body: "Each certificate has a public verify ID." },
        ]}
      />

      <HowItWorks
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
            eyebrow="Pricing"
            title="Seat packs or a tailored quote."
            description={`Seat packs start at ${formatSeatPackPrice(SEAT_PACKS[0])} for ${SEAT_PACKS[0].seats} learners. For larger groups, facilitation or custom reporting, we’ll send you a quote.`}
          />
          <div className="flex flex-col gap-2.5 sm:flex-row lg:justify-end">
            <Button href="/pricing#pilot" variant="ghost">See seat packs</Button>
            <Button href="#quote" variant="primary">Request a quote</Button>
          </div>
        </div>
      </section>

      <CaseStudyFeature
        testId="case-study-fmcg"
        eyebrow="Case study · FMCG leadership"
        title="Twelve weeks, six faces, +32.2%."
        body="Leaders at Imana Foods and Kerry Foods completed a 12-week, accredited Super-Cube® leadership development intervention, assessed on every face before and after the course."
        stats={[
          { value: "+32.2%", label: "Overall, all six faces" },
          { value: "+45.1%", label: "Principles" },
          { value: "+39.5%", label: "Emotional" },
        ]}
        quote={{
          text: "More than the word influence, it provokes your behaviour and calls for change.",
          cite: "Theolen Thevan, Kerry Foods",
        }}
        source="Average gain in assessment score, pre- to post-course, in percentage points. 12-week Super-Cube® interventions (NQF levels 3–5) at Imana Foods and Kerry Foods. Source: Super-Cube® company profile, September 2023."
        href="/news/twelve-weeks-six-faces-fmcg-leadership"
        linkLabel="Read the case study"
        image="/news/fmcg-leadership-case-study-cover.jpg"
        imageAlt="Super-Cube® results card: overall leadership development +32.2% across all six faces, with gains by face: Choices +26.6%, Principles +45.1%, Mental +29.7%, Emotional +39.5%, Physical +27.7%, Spiritual +24.6%."
      />

      <section id="quote" className="section-pad scroll-mt-24 border-t border-line bg-surface">
        <div className="container-site grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-12">
          <div>
            <SectionHeading
              eyebrow="Request a quote"
              title="Tell us about your leaders."
              description="We’ll reply with a proposal and price. Prefer to talk first? Book a short call."
            />
            <div className="mt-6">
              <Button href={booking} variant="ghost">Book a call</Button>
            </div>
          </div>
          <EnquiryForm
            intent="organisation-quote"
            source="organisations"
            submitLabel="Request a quote"
            fields={[
              { name: "name", label: "Your name", required: true, autoComplete: "name" },
              { name: "email", label: "Work email", type: "email", required: true, autoComplete: "email" },
              { name: "organisation", label: "Organisation", required: true, autoComplete: "organization" },
              { name: "role", label: "Your role", autoComplete: "organization-title" },
              { name: "leaders", label: "Number of leaders", type: "number" },
              { name: "timeframe", label: "When would you like to start?", type: "select", options: ["Within a month", "In 1–3 months", "In 3–6 months", "Just exploring"] },
              { name: "message", label: "What would you like to achieve?", type: "textarea" },
            ]}
          />
        </div>
      </section>
    </>
  );
}
