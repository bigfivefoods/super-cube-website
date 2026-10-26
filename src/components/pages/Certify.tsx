import type { PageMetaInput } from "@/lib/seo";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/config";
import { pageI18n } from "@/lib/i18n/pages/t";
import Link from "next/link";
import { Button, PageHero, SectionHeading } from "@/components/ui";

/** English page metadata (title and description are translated per language by localePageMeta). */
export const META = {
  path: "/certify",
  title: "Certification ladder",
  description:
    "Learner, Practitioner, and Facilitator pathways with public verify IDs.",
} satisfies PageMetaInput;

const rungs = [
  {
    level: "1 · Learner",
    title: "Complete the pathway",
    d: "Orient, baseline, courses, post-assessment, growth report. Certificate with public verify URL.",
    href: "/learn/start",
    cta: "Start learning",
  },
  {
    level: "2 · Practitioner",
    title: "30-day deliberate practice",
    d: "Streak + micro-practices after certificate. Designed for managers who coach themselves first.",
    href: "/learn/practice",
    cta: "Micro-practices",
  },
  {
    level: "3 · Facilitator",
    title: "Run a cohort",
    d: "Create org, 8-week calendar, roster, consented heat map, CSV export. Partner clinic monthly.",
    href: "/facilitator",
    cta: "Facilitator kit",
  },
];

export async function CertifyView({ locale = DEFAULT_LOCALE }: { locale?: Locale } = {}) {
  const { t, L } = await pageI18n(locale);
  return (
    <>
      <PageHero t={t}
        theme="impact"
        eyebrow={t("Credentials")}
        title={t("Certification ladder")}
        description={t("Growth you can verify—not empty badges. Each rung maps to product behaviour already in Super-Cube® Learn.")}
      >
        <Button href={L("/learn/report")} variant="primary">
          {t("Your report & certificate")}
        </Button>
        <Button href={L("/community")} variant="ghost">
          {t("Community clinic")}
        </Button>
      </PageHero>

      <section className="section-pad bg-surface">
        <div className="container-site max-w-3xl space-y-4">
          {rungs.map((r) => (
            <div
              key={r.level}
              className="sc-card p-5 sm:p-6"
            >
              <p className="text-[0.7rem] font-bold uppercase tracking-[0.14em] text-muted">
                {t(r.level)}
              </p>
              <h2 className="mt-1 text-xl font-semibold tracking-tight text-ink">
                {t(r.title)}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate">{t(r.d)}</p>
              <Link
                href={L(r.href)}
                className="mt-3 inline-block text-sm font-semibold text-ink underline-offset-4 hover:underline"
              >
                {t(r.cta)} →
              </Link>
            </div>
          ))}
          <SectionHeading
            title={t("Verify")}
            description={t("Completion certificates include an ID like SC-YYYYMMDD-HEX. Anyone can check /verify/[id].")}
          />
        </div>
      </section>
    </>
  );
}
