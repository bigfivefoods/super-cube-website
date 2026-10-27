import type { PageMetaInput } from "@/lib/seo";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/config";
import { pageI18n } from "@/lib/i18n/pages/t";
import { ContactForm } from "@/components/ContactForm";
import { PageHero, SectionHeading } from "@/components/ui";
import { site } from "@/lib/content";

/** English page metadata (title and description are translated per language by localePageMeta). */
export const META = {
  path: "/contact",
  title: "Contact",
  description:
    "Begin a conversation about Super-Cube® leadership development—personal plans, organisational pipelines, or network partnerships.",
} satisfies PageMetaInput;

export async function ContactView({ locale = DEFAULT_LOCALE }: { locale?: Locale } = {}) {
  const { t, L } = await pageI18n(locale);
  return (
    <>
      <PageHero t={t}
        theme="about"
        eyebrow={t("Contact")}
        title={t("Begin development.")}
        description={t("Tell us about your context—individual growth, a leadership pipeline, or network-scale capacity building. We’ll explore how Super-Cube® can fit.")}
      />

      <section className="section-pad pt-12">
        <div className="container-site grid gap-12 lg:grid-cols-[1fr_1.15fr]">
          <div>
            <SectionHeading
              eyebrow={t("How we help")}
              title={t("A conversation, not a pitch deck.")}
            />
            <ul className="mt-8 space-y-5">
              {[
                "Clarify which level of application fits your ambition.",
                "Map the six constructs to your organisational challenges.",
                "Outline assessment, blended learning, and measurement options.",
                "Explore research-informed design for multi-entity networks.",
              ].map((item) => (
                <li
                  key={item}
                  className="flex gap-3 text-slate leading-relaxed"
                >
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                  {t(item)}
                </li>
              ))}
            </ul>
            <div className="mt-10 rounded-[var(--radius)] border border-[var(--line)] bg-paper p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gold-bright">
                {t("Direct")}
              </p>
              <p className="mt-2 text-sm text-slate">
                {t("Prefer email? Reach us at")}{" "}
                <a
                  href={L(`mailto:${site.email}`)}
                  className="font-semibold text-ink underline-offset-4 hover:underline"
                >
                  {t(site.email)}
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
