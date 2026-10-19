import type { PageMetaInput } from "@/lib/seo";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/config";
import { pageI18n } from "@/lib/i18n/pages/t";
import { FacilitatorDownloadButton } from "@/components/FacilitatorDownload";
import { cohortCalendar, safeguardingKids } from "@/lib/facilitator";
import { Button, PageHero, SectionHeading } from "@/components/ui";

/** English page metadata (title and description are translated per language by localePageMeta). */
export const META = {
  path: "/facilitator",
  title: "Facilitator kit",
  description:
    "8-week Super-Cube® cohort calendar, safeguarding notes, and coach tools for schools and companies.",
} satisfies PageMetaInput;

export function FacilitatorView({ locale = DEFAULT_LOCALE }: { locale?: Locale } = {}) {
  const { t, L } = pageI18n(locale);
  return (
    <>
      <PageHero t={t}
        theme="programs"
        eyebrow={t("Schools & companies")}
        title={t("Facilitator kit")}
        description={t("An 8-week cohort pattern: orient, baseline, faces, re-measure, certify. Pair with /learn/coach for codes, roster, and CSV export. Download a printable one-pager for staff rooms.")}
      >
        <Button href={L("/learn/coach")} variant="primary">
          {t("Open coach tools")}
        </Button>
        <Button href={L("/pricing#pilot")} variant="ghost">
          {t("Book a pilot")}
        </Button>
      </PageHero>

      {/* Pilot outcome promise */}
      <section className="border-b border-line bg-surface">
        <div className="container-site py-8 sm:py-10">
          <p className="text-center text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-muted">
            {t("What a pilot delivers")}
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {[
              {
                t: "Measured growth",
                d: "Pre → post across six faces, not attendance theatre.",
              },
              {
                t: "Coach visibility",
                d: "Cohort codes, heat map, CSV—journals stay private.",
              },
              {
                t: "Ready-to-run",
                d: "8-week calendar, practice library, verify certificates.",
              },
            ].map((item) => (
              <div
                key={item.t}
                className="sc-card p-4 text-center sm:p-5"
              >
                <p className="text-sm font-semibold tracking-tight text-ink">
                  {t(item.t)}
                </p>
                <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-slate">
                  {t(item.d)}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-col items-center justify-center gap-2.5 sm:flex-row">
            <Button href={L("/pilot-pack")} variant="primary">
              {t("Download pilot pack")}
            </Button>
            <Button href={L("/sample-report")} variant="ghost">
              {t("See sample report")}
            </Button>
          </div>
        </div>
      </section>

      <section className="border-b border-line bg-bg">
        <div className="container-site flex flex-col items-start justify-between gap-4 py-8 sm:flex-row sm:items-center">
          <div>
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-muted">
              {t("Printable pack")}
            </p>
            <p className="mt-1 text-sm text-slate">
              {t("One-page PDF: six faces, 8-week calendar, safeguarding notes.")}
            </p>
          </div>
          <FacilitatorDownloadButton />
        </div>
      </section>

      <section className="section-pad bg-bg">
        <div className="container-site">
          <SectionHeading
            eyebrow={t("Calendar")}
            title={t("Eight weeks · one model")}
            description={t("Adjust pacing for term times. Kids programmes need shorter sessions and stronger safeguarding.")}
          />
          <ol className="mt-8 space-y-4">
            {cohortCalendar.map((w) => (
              <li
                key={w.week}
                className="rounded-2xl border border-line bg-surface p-5 sm:p-6"
              >
                <p className="text-[0.7rem] font-bold uppercase tracking-[0.14em] text-muted">
                  {t("Week")}{" "}{t(w.week)}
                </p>
                <h3 className="mt-1 text-lg font-semibold tracking-tight text-ink">
                  {t(w.title)}
                </h3>
                <p className="mt-1 text-sm text-slate">{t(w.focus)}</p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                      {t("Facilitator")}
                    </p>
                    <ul className="mt-1.5 list-disc space-y-1 pl-4 text-sm text-slate">
                      {w.facilitatorNotes.map((n) => (
                        <li key={n}>{t(n)}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                      {t("Learners")}
                    </p>
                    <ul className="mt-1.5 list-disc space-y-1 pl-4 text-sm text-slate">
                      {w.learnerActions.map((n) => (
                        <li key={n}>{t(n)}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section-pad border-t border-line bg-surface">
        <div className="container-site max-w-3xl">
          <SectionHeading eyebrow={t("Safeguarding")} title={t("Kids & adolescents")} />
          <ul className="mt-6 list-disc space-y-2 pl-5 text-slate">
            {safeguardingKids.map((s) => (
              <li key={s}>{t(s)}</li>
            ))}
          </ul>
          <div className="mt-8 flex flex-col gap-2.5 sm:flex-row">
            <Button href={L("/practices")} variant="ghost">
              {t("Practice library")}
            </Button>
            <Button href={L("/privacy")} variant="ghost">
              {t("Privacy & consent")}
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
