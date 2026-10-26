import Link from "next/link";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/config";
import { pageI18n } from "@/lib/i18n/pages/t";
import { FacilitatorDownloadButton } from "@/components/FacilitatorDownload";
import { Button, PageHero, SectionHeading } from "@/components/ui";
import { cohortCalendar, safeguardingKids } from "@/lib/facilitator";
import { COURSE_PRICE_USD } from "@/lib/programmes";
import type { PageMetaInput } from "@/lib/seo";

/** English page metadata (title and description are translated per language by localePageMeta). */
export const META = {
  title: "School & company pilot pack",
  description:
    "Super-Cube® pilot pack for schools and companies: pricing from $" +
    COURSE_PRICE_USD +
    ", 8-week calendar, consent notes, coach tools, and facilitator one-pager PDF.",
  path: "/pilot-pack",
  image: "/images/hero/hero-programs.jpg",
  keywords: [
    "leadership pilot school",
    "corporate leadership programme South Africa",
    "cohort leadership development",
  ],
} satisfies PageMetaInput;

export async function PilotPackView({ locale = DEFAULT_LOCALE }: { locale?: Locale } = {}) {
  const { t, L } = await pageI18n(locale);
  return (
    <>
      <PageHero t={t}
        theme="programs"
        eyebrow={t("Sales enablement")}
        title={t("School & company pilot pack")}
        description={t("Everything a principal, L&D lead, or coach needs to run an 8-week Super-Cube® pilot—without inventing process from scratch.")}
      >
        <Button href={L("/pricing#pilot")} variant="primary">
          {t("Buy seat pack")}
        </Button>
        <Button href={L("/super-cube-company-profile.pdf")} variant="ghost">
          {t("Download company profile (PDF)")}
        </Button>
        <Button href={L("/learn/coach")} variant="ghost">
          {t("Coach tools")}
        </Button>
      </PageHero>

      <section className="section-pad bg-bg">
        <div className="container-site grid gap-10 lg:grid-cols-2">
          <div>
            <SectionHeading
              title={t("What’s in the pack")}
              description={t("Use this page + the PDF as your leave-behind.")}
            />
            <ul className="mt-6 space-y-3 text-sm leading-relaxed text-slate">
              <li>
                · <strong className="text-ink">{t("Company profile:")}</strong>{" "}
                <a
                  href={L("/super-cube-company-profile.pdf")}
                  download
                  className="font-semibold text-ink underline-offset-2 hover:underline"
                >
                  {t("Super-Cube® company profile (PDF)")}
                </a>{" "}
                {t("— 15 A4 pages for leave-behinds and parent/board meetings")}
              </li>
              <li>
                · <strong className="text-ink">{t("Pricing:")}</strong>{" "}{t("from $")}
                {t(COURSE_PRICE_USD)}{" "}{t("USD per learner; seat packs 10/20/50 on")}{" "}
                <Link
                  href={L("/pricing#pilot")}
                  className="font-semibold text-ink underline-offset-2 hover:underline"
                >
                  {t("pricing")}
                </Link>
              </li>
              <li>
                · <strong className="text-ink">{t("Pathway:")}</strong>{" "}{t("orient → baseline → six faces → mid check-in → post → report & certificate")}
              </li>
              <li>
                · <strong className="text-ink">{t("Consent:")}</strong>{" "}{t("journals private; coach sees scores only when learners opt in")}
              </li>
              <li>
                · <strong className="text-ink">{t("Tools:")}</strong>{" "}{t("org codes, roster, CSV export, face heat map, verify URLs")}
              </li>
              <li>
                · <strong className="text-ink">{t("Calendar:")}</strong>{" "}{t("8-week facilitator rhythm below")}
              </li>
            </ul>
            <div className="mt-6">
              <FacilitatorDownloadButton />
            </div>
          </div>
          <div className="rounded-2xl border border-line bg-surface p-5 sm:p-6">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-muted">
              {t("Consent language (draft)")}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-slate">
              {t("“I understand Super-Cube® Learn stores my reflections on my device (and optionally my signed-in account). I may choose to share")}{" "}
              <strong className="text-ink">{t("scores and completion only")}</strong>{" "}
              {t("with my cohort coach—not journal text. I can turn sharing off anytime on the Learn dashboard.”")}
            </p>
            <p className="mt-4 text-xs text-muted">
              {t("Adapt under school/company POPIA counsel. See /privacy.")}
            </p>
          </div>
        </div>
      </section>

      <section className="section-pad border-t border-line bg-surface">
        <div className="container-site">
          <SectionHeading title={t("8-week calendar")} />
          <ol className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {cohortCalendar.map((w) => (
              <li
                key={w.week}
                className="sc-card p-4"
              >
                <p className="text-[0.65rem] font-bold uppercase tracking-wider text-muted">
                  {t("Week")}{" "}{t(w.week)}
                </p>
                <p className="mt-1 font-semibold text-ink">{t(w.title)}</p>
                <p className="mt-1 text-xs text-slate">{t(w.focus)}</p>
              </li>
            ))}
          </ol>
          <div className="mt-10 max-w-2xl">
            <h3 className="text-sm font-semibold text-ink">{t("Safeguarding")}</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate">
              {safeguardingKids.map((s) => (
                <li key={s}>{t(s)}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
