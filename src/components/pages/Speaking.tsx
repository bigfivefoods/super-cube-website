import Image from "next/image";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/config";
import { pageI18n } from "@/lib/i18n/pages/t";
import { enquiryStrings, localizeEnquiryFields } from "@/lib/i18n/pages/enquiry";
import { EnquiryForm } from "@/components/EnquiryForm";
import { Button, PageHero, SectionHeading } from "@/components/ui";
import { bookingUrl } from "@/lib/booking";
import type { PageMetaInput } from "@/lib/seo";

/** English page metadata (title and description are translated per language by localePageMeta). */
export const META = {
  path: "/speaking",
  title: "Speaking and media · Dr Craig Muller",
  description:
    "Book Dr Craig Muller, creator of the Super-Cube® leadership model (DBA, University of KwaZulu-Natal, 2021) and author of Leadership Is Learnable (2026), for keynotes, workshops and panels on learnable leadership.",
} satisfies PageMetaInput;

const topics = [
  {
    title: "Leadership is learnable: the six faces of the Super-Cube®",
    body: "Why most leadership capacity can be developed, and how Choices, Principles, Mental, Emotional, Physical and Spiritual growth fit together.",
  },
  {
    title: "Measure growth, not attendance",
    body: "Moving leadership development from training hours to before-and-after evidence that boards and funders can trust.",
  },
  {
    title: "Ubuntu and I–Thou: human-centric leadership",
    body: "Leading people as people, drawing on Ubuntu and Buber’s I–Thou, in complex African organisations and networks.",
  },
  {
    title: "Leadership education as a development lever",
    body: "How structured leadership development links to quality education, decent work and strong institutions (the UN SDGs).",
  },
  {
    title: "Raising leaders early",
    body: "One model from childhood to adulthood: building character, agency and wise decisions in kids and teens.",
  },
];

const facts = [
  "Doctor of Business Administration (DBA), University of KwaZulu-Natal, 2021",
  "Creator of the Super-Cube® leadership model, developed in his 2020 doctoral thesis",
  "Author of Leadership Is Learnable (2026), the comprehensive book on the Super-Cube® model and the evidence behind it",
  "Research published in peer-reviewed journals (SAJEMS and the Journal of Contemporary Management)",
  "Over 20 years of blue-chip experience in FMCG, supply chain and consulting",
];

export function SpeakingView({ locale = DEFAULT_LOCALE }: { locale?: Locale } = {}) {
  const { t, L } = pageI18n(locale);
  const booking = bookingUrl();
  return (
    <>
      <PageHero t={t}
        theme="about"
        eyebrow={t("Speaking and media")}
        title={t("Book Dr Craig Muller to speak on learnable leadership.")}
        description={t("Keynotes, workshops and panels on the Super-Cube® leadership model and human-centric leadership, grounded in doctoral research at the University of KwaZulu-Natal.")}
      >
        <Button href="#enquire" variant="primary">{t("Enquire about a keynote")}</Button>
        <Button href={L("/media")} variant="ghost">{t("Media kit")}</Button>
      </PageHero>

      <section className="section-pad bg-paper">
        <div className="container-site grid gap-10 lg:grid-cols-[1fr_1fr] lg:gap-14">
          <div>
            <SectionHeading eyebrow={t("The speaker")} title={t("Dr Craig Muller")} />
            <ul className="mt-6 space-y-2.5">
              {facts.map((f) => (
                <li key={f} className="flex gap-3 text-sm leading-relaxed text-slate sm:text-base">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-ink" aria-hidden />
                  {t(f)}
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
              <Button href={L("/about")} variant="ghost">{t("Full biography")}</Button>
              <Button href={L("/media")} variant="ghost">{t("Media kit, bio and citations")}</Button>
            </div>
          </div>
          <div className="relative mx-auto aspect-[3/4] w-full max-w-sm overflow-hidden rounded-2xl border border-line bg-surface lg:mx-0 lg:justify-self-end">
            <Image
              src="/images/people/craig-muller.webp"
              alt={t("Dr Craig Muller")}
              fill
              sizes="(max-width: 440px) 90vw, 384px"
              className="object-cover object-top"
            />
          </div>
        </div>
      </section>

      <section className="section-pad border-t border-line bg-surface">
        <div className="container-site">
          <SectionHeading
            eyebrow={t("Talk topics")}
            title={t("Talks on Super-Cube® and leadership.")}
            description={t("Each topic can be a keynote, a workshop or a panel contribution, shaped to your audience.")}
          />
          <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {topics.map((topic) => (
              <li key={topic.title} className="sc-card p-5">
                <h3 className="text-base font-semibold tracking-tight text-ink">{t(topic.title)}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate">{t(topic.body)}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section-pad border-t border-line bg-paper">
        <div className="container-site">
          <SectionHeading eyebrow={t("Watch and listen")} title={t("Talks, interviews and podcasts.")} />
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {[
              ["Talk videos coming soon", "Recorded keynotes and talks will appear here."],
              ["Podcasts and interviews coming soon", "Podcast episodes and media interviews will appear here."],
            ].map(([h, p]) => (
              <div key={h} className="rounded-2xl border-2 border-dashed border-line-strong bg-surface p-6">
                <p className="text-base font-semibold tracking-tight text-ink">{t(h)}</p>
                <p className="mt-1.5 text-sm text-slate">{t(p)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="enquire" className="section-pad scroll-mt-24 border-t border-line bg-surface">
        <div className="container-site grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-12">
          <div>
            <SectionHeading
              eyebrow={t("Keynote enquiry")}
              title={t("Invite Craig to your event.")}
              description={t("Share a few details and we’ll come back to you about availability and fees. Prefer to talk first? Book a short call.")}
            />
            <div className="mt-6">
              <Button href={L(booking)} variant="ghost">{t("Book a call")}</Button>
            </div>
          </div>
          <EnquiryForm
            strings={enquiryStrings(t)}
            intent="keynote"
            source="speaking"
            submitLabel={t("Send enquiry")}
            fields={localizeEnquiryFields(t, [
              { name: "name", label: "Your name", required: true, autoComplete: "name" },
              { name: "email", label: "Email", type: "email", required: true, autoComplete: "email" },
              { name: "organisation", label: "Organisation", autoComplete: "organization" },
              { name: "event", label: "Event name" },
              { name: "date", label: "Event date", type: "date" },
              { name: "format", label: "Format", type: "select", options: ["In person", "Online", "Hybrid"] },
              { name: "audience", label: "Audience size", type: "number" },
              { name: "topic", label: "Topic of interest", type: "select", options: [...topics.map((t) => t.title), "Something else"] },
              { name: "message", label: "Tell us about the event", type: "textarea" },
            ])}
          />
        </div>
      </section>
    </>
  );
}
