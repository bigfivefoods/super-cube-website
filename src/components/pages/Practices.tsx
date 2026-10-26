import type { PageMetaInput } from "@/lib/seo";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/config";
import { pageI18n } from "@/lib/i18n/pages/t";
import Link from "next/link";
import { constructs } from "@/lib/content";
import { practiceLibrary } from "@/lib/lms/practices";
import { Button, PageHero, SectionHeading } from "@/components/ui";

/** English page metadata (title and description are translated per language by localePageMeta). */
export const META = {
  path: "/practices",
  title: "I–Thou practice library",
  description:
    "Relational leadership exercises and continuous face tracking grounded in Buber and Super-Cube® whole-person development.",
} satisfies PageMetaInput;

export async function PracticesView({ locale = DEFAULT_LOCALE }: { locale?: Locale } = {}) {
  const { t, L } = await pageI18n(locale);
  return (
    <>
      <PageHero t={t}
        theme="programs"
        eyebrow={t("Deliberate practice")}
        title={t("I–Thou practice library")}
        description={t("Short relational exercises that transfer course content into culture—plus continuous tracking of the six faces so practice stays matched to your growth priorities.")}
      >
        <Button href={L("/learn/practice")} variant="primary">
          {t("Today’s micro-practice")}
        </Button>
        <Button href={L("/learn/pulse")} variant="ghost">
          {t("Track your six faces")}
        </Button>
      </PageHero>

      <section className="section-pad border-b border-line bg-bg">
        <div className="container-site grid gap-8 lg:grid-cols-2 lg:gap-12">
          <SectionHeading
            eyebrow={t("Continuous development")}
            title={t("Track the six faces. Practise what matters most.")}
            description={t("Daily or weekly pulses build patterns across Choices, Principles, Mental, Emotional, Physical, and Spiritual. Recommendations adapt as your profile shifts.")}
          />
          <div className="space-y-3 text-sm leading-relaxed text-slate">
            <p>
              {t("One-off assessments show a snapshot. Continuous face tracking shows trends—which faces need attention this week, which are strengthening, and where deliberate practice will move the needle.")}
            </p>
            <p>
              {t("Inside Super-Cube® Learn you can log a quick pulse (rate three or more faces), see pattern insights, and open micro-practices aimed at your current stretch faces. Journals and notes stay private by default.")}
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <Button href={L("/learn/pulse")} variant="primary">
                {t("Open face tracking")}
              </Button>
              <Button href={L("/learn/start")} variant="ghost">
                {t("Start free baseline")}
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="section-pad bg-surface">
        <div className="container-site">
          <SectionHeading
            title={t("Exercises")}
            description={t("Use in classrooms, team stand-ups, or alone. Journals stay private on Super-Cube® Learn.")}
          />
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {practiceLibrary.map((p) => {
              const color =
                p.constructId === "relational"
                  ? "#0a0a0a"
                  : constructs.find((c) => c.id === p.constructId)?.color;
              return (
                <article
                  key={p.id}
                  className="sc-card p-5 sm:p-6"
                  style={
                    color ? { boxShadow: `inset 3px 0 0 ${color}` } : undefined
                  }
                >
                  <p className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-muted">
                    {t(p.minutes)}{" "}{t("min ·")}{" "}{t(p.audience)}
                    {p.constructId !== "relational"
                      ? ` · ${p.constructId}`
                      : t(" · relational")}
                  </p>
                  <h2 className="mt-1 text-lg font-semibold tracking-tight text-ink">
                    {t(p.title)}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-slate">
                    {t(p.summary)}
                  </p>
                  <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-slate">
                    {p.steps.map((s) => (
                      <li key={s}>{t(s)}</li>
                    ))}
                  </ol>
                  <p className="mt-3 text-[0.8125rem] font-medium text-ink">
                    {t("Debrief:")}{" "}{t(p.debrief)}
                  </p>
                </article>
              );
            })}
          </div>
          <p className="mt-8 text-center text-sm text-muted">
            {t("Need a cohort calendar?")}{" "}
            <Link
              href={L("/facilitator")}
              className="font-semibold text-ink underline-offset-2 hover:underline"
            >
              {t("Facilitator kit")}
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}
