import type { Metadata } from "next";
import Image from "next/image";
import { EnquiryForm } from "@/components/EnquiryForm";
import { Button, PageHero, SectionHeading } from "@/components/ui";
import { bookingUrl } from "@/lib/booking";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  path: "/speaking",
  title: "Speaking and media · Dr Craig Muller",
  description:
    "Book Dr Craig Muller, creator of the Super-Cube® leadership model (DBA, University of KwaZulu-Natal, 2021), for keynotes, workshops and panels on learnable leadership.",
});

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
  "Creator of the Super-Cube® leadership model, developed in his 2021 doctoral thesis",
  "Research published in peer-reviewed journals (SAJEMS and the Journal of Contemporary Management)",
  "Over 20 years of blue-chip experience in FMCG, supply chain and consulting",
];

export default function SpeakingPage() {
  const booking = bookingUrl();
  return (
    <>
      <PageHero
        theme="about"
        eyebrow="Speaking and media"
        title="Book Dr Craig Muller to speak on learnable leadership."
        description="Keynotes, workshops and panels on the Super-Cube® leadership model and human-centric leadership, grounded in doctoral research at the University of KwaZulu-Natal."
      >
        <Button href="#enquire" variant="primary">Enquire about a keynote</Button>
        <Button href="/media" variant="ghost">Media kit</Button>
      </PageHero>

      <section className="section-pad bg-paper">
        <div className="container-site grid gap-10 lg:grid-cols-[1fr_1fr] lg:gap-14">
          <div>
            <SectionHeading eyebrow="The speaker" title="Dr Craig Muller" />
            <ul className="mt-6 space-y-2.5">
              {facts.map((f) => (
                <li key={f} className="flex gap-3 text-sm leading-relaxed text-slate sm:text-base">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-ink" aria-hidden />
                  {f}
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
              <Button href="/about" variant="ghost">Full biography</Button>
              <Button href="/media" variant="ghost">Media kit, bio and citations</Button>
            </div>
          </div>
          <div className="relative mx-auto aspect-[3/4] w-full max-w-sm overflow-hidden rounded-2xl border border-line bg-surface lg:mx-0 lg:justify-self-end">
            <Image
              src="/images/people/craig-muller.webp"
              alt="Dr Craig Muller"
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
            eyebrow="Talk topics"
            title="Talks on Super-Cube® and leadership."
            description="Each topic can be a keynote, a workshop or a panel contribution, shaped to your audience."
          />
          <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {topics.map((t) => (
              <li key={t.title} className="sc-card p-5">
                <h3 className="text-base font-semibold tracking-tight text-ink">{t.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate">{t.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section-pad border-t border-line bg-paper">
        <div className="container-site">
          <SectionHeading eyebrow="Watch and listen" title="Talks, interviews and podcasts." />
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {[
              ["Talk videos coming soon", "Recorded keynotes and talks will appear here."],
              ["Podcasts and interviews coming soon", "Podcast episodes and media interviews will appear here."],
            ].map(([h, p]) => (
              <div key={h} className="rounded-2xl border-2 border-dashed border-line-strong bg-surface p-6">
                <p className="text-base font-semibold tracking-tight text-ink">{h}</p>
                <p className="mt-1.5 text-sm text-slate">{p}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="enquire" className="section-pad scroll-mt-24 border-t border-line bg-surface">
        <div className="container-site grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-12">
          <div>
            <SectionHeading
              eyebrow="Keynote enquiry"
              title="Invite Craig to your event."
              description="Share a few details and we’ll come back to you about availability and fees. Prefer to talk first? Book a short call."
            />
            <div className="mt-6">
              <Button href={booking} variant="ghost">Book a call</Button>
            </div>
          </div>
          <EnquiryForm
            intent="keynote"
            source="speaking"
            submitLabel="Send enquiry"
            fields={[
              { name: "name", label: "Your name", required: true, autoComplete: "name" },
              { name: "email", label: "Email", type: "email", required: true, autoComplete: "email" },
              { name: "organisation", label: "Organisation", autoComplete: "organization" },
              { name: "event", label: "Event name" },
              { name: "date", label: "Event date", type: "date" },
              { name: "format", label: "Format", type: "select", options: ["In person", "Online", "Hybrid"] },
              { name: "audience", label: "Audience size", type: "number" },
              { name: "topic", label: "Topic of interest", type: "select", options: [...topics.map((t) => t.title), "Something else"] },
              { name: "message", label: "Tell us about the event", type: "textarea" },
            ]}
          />
        </div>
      </section>
    </>
  );
}
