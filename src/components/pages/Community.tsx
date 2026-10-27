import type { PageMetaInput } from "@/lib/seo";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/config";
import { pageI18n } from "@/lib/i18n/pages/t";
import { Button, PageHero, SectionHeading } from "@/components/ui";
import { site } from "@/lib/content";

/** English page metadata (title and description are translated per language by localePageMeta). */
export const META = {
  path: "/community",
  title: "Community of practice",
  description:
    "Monthly Super-Cube® facilitator clinic for cohort coaches and partners.",
} satisfies PageMetaInput;

export async function CommunityView({ locale = DEFAULT_LOCALE }: { locale?: Locale } = {}) {
  const { t, L } = await pageI18n(locale);
  return (
    <>
      <PageHero t={t}
        theme="impact"
        eyebrow={t("Partners")}
        title={t("Community of practice")}
        description={t("A monthly clinic for facilitators running school or company cohorts—heat maps, safeguarding, I–Thou exercises, and product updates.")}
      >
        <Button
          href={L(`mailto:${site.email}?subject=Community%20clinic%20RSVP`)}
          variant="primary"
        >
          {t("RSVP by email")}
        </Button>
        <Button href={L("/facilitator")} variant="ghost">
          {t("Facilitator kit")}
        </Button>
      </PageHero>

      <section className="section-pad bg-surface">
        <div className="container-site max-w-3xl space-y-8">
          <SectionHeading
            title={t("What we cover")}
            description={t("45–60 minutes. Bring one cohort challenge. No sales pitch first.")}
          />
          <ul className="list-disc space-y-2 pl-5 text-slate">
            <li>{t("Reading coach heat maps without ranking kids or teams")}</li>
            <li>{t("Consent, POPIA, and journal privacy in practice")}</li>
            <li>{t("Weakest-face weekly plans and micro-practices")}</li>
            <li>{t("Roadmap preview (apps, languages, enterprise SSO)")}</li>
          </ul>
          <div className="sc-card p-5">
            <p className="text-sm font-semibold text-ink">{t("Next clinic")}</p>
            <p className="mt-1 text-sm text-slate">
              {t("Published via email to active coaches. Prefer calendar booking? Use Book a pilot on pricing—select “Facilitator clinic”.")}
            </p>
            <Button href={L("/pricing#pilot")} variant="primary" className="mt-4">
              {t("Book a pilot / clinic")}
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
