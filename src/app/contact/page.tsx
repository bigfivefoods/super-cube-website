import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";
import { PageHero, SectionHeading } from "@/components/ui";
import { site } from "@/lib/content";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Begin a conversation about Super-Cube® leadership development—personal plans, organisational pipelines, or network partnerships.",
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Begin development."
        description="Tell us about your context—individual growth, a leadership pipeline, or network-scale capacity building. We’ll explore how Super-Cube® can fit."
      />

      <section className="section-pad pt-12">
        <div className="container-site grid gap-12 lg:grid-cols-[1fr_1.15fr]">
          <div>
            <SectionHeading
              eyebrow="How we help"
              title="A conversation, not a pitch deck."
            />
            <ul className="mt-8 space-y-5">
              {[
                "Clarify which level of application fits your ambition.",
                "Map the six constructs to your organisational challenges.",
                "Outline assessment, blended learning, and measurement options.",
                "Explore research-informed design for multi-entity networks.",
              ].map((item) => (
                <li key={item} className="flex gap-3 text-slate leading-relaxed">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-10 rounded-[var(--radius)] border border-[var(--line)] bg-paper p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold">
                Direct
              </p>
              <p className="mt-2 text-sm text-slate">
                Prefer email? Reach us at{" "}
                <a
                  href={`mailto:${site.email}`}
                  className="font-semibold text-ink underline-offset-4 hover:underline"
                >
                  {site.email}
                </a>
              </p>
            </div>
          </div>

          <ContactForm />
        </div>
      </section>
    </>
  );
}
