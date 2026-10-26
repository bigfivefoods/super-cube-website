import type { PageMetaInput } from "@/lib/seo";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/config";
import { pageI18n } from "@/lib/i18n/pages/t";
import Link from "next/link";
import { constructs } from "@/lib/content";
import { SampleReportCharts } from "@/components/learn/SampleReportCharts";
import { NewsletterSignup } from "@/components/NewsletterSignup";
import { Button, PageHero, SectionHeading } from "@/components/ui";

/** English page metadata (title and description are translated per language by localePageMeta). */
export const META = {
  path: "/sample-report",
  title: "Sample growth report",
  description:
    "See what a Super-Cube® pre → post growth report looks like—six faces, dual radar comparison, longitudinal tracking, and developmental (not clinical) language.",
} satisfies PageMetaInput;

/**
 * Anonymised composite illustration aligned to 0–100 research-style scale.
 * Not a single real learner; pattern mirrors consented pilot composites.
 */
const SAMPLE = {
  name: "Anonymised composite · school pilot pattern",
  programme: "Super-Cube® Adolescents / Adults (illustrative)",
  pre: 52,
  post: 68,
  nNote: "Composite of consented pre→post means (illustrative N≈24)",
  faces: [
    { id: "choices" as const, pre: 48, post: 62 },
    { id: "principles" as const, pre: 55, post: 67 },
    { id: "mental" as const, pre: 50, post: 64 },
    { id: "emotional" as const, pre: 45, post: 60 },
    { id: "physical" as const, pre: 58, post: 70 },
    { id: "spiritual" as const, pre: 57, post: 72 },
  ],
  methodology:
    "Likert multi-item scales per face → 0–100. Cronbach’s α in founding research ~0.60–0.80. Developmental self-report, not clinical or hiring assessment.",
};

export async function SampleReportView({ locale = DEFAULT_LOCALE }: { locale?: Locale } = {}) {
  const { t, L } = await pageI18n(locale);
  return (
    <>
      <PageHero t={t}
        theme="impact"
        eyebrow={t("Sample outcome")}
        title={t("What growth looks like on Super-Cube®.")}
        description={t("Illustrative pre → post profile after deliberate practice across the six faces—plus continuous tracking trends. Real reports are private to the learner; coaches only see shared snapshots with consent.")}
      >
        <Button href={L("/learn/start")} variant="primary">
          {t("Start free baseline")}
        </Button>
        <Button href={L("/pricing#pilot")} variant="ghost">
          {t("Run this with your team")}
        </Button>
      </PageHero>

      <section className="section-pad bg-surface">
        <div className="container-site max-w-5xl">
          {/* Conversion band above the fold of the report */}
          <div className="mb-6 rounded-2xl border border-line bg-void px-5 py-5 text-void-fg sm:px-6 sm:py-6">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-void-fg/50">
              {t("For schools & L&D")}
            </p>
            <p className="mt-1.5 text-lg font-semibold tracking-tight">
              {t("Baseline 52 → Post 68 after an 8-week pattern")}
            </p>
            <p className="mt-1 text-sm text-void-fg/65">
              {t("Capacity change you can show a principal or board—not activity completion rates.")}
            </p>
            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <Link
                href={L("/pricing#pilot")}
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-white px-5 text-sm font-semibold text-black"
              >
                {t("Book a pilot")}
              </Link>
              <Link
                href={L("/facilitator")}
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/30 px-5 text-sm font-semibold text-white"
              >
                {t("Facilitator kit")}
              </Link>
            </div>
          </div>

          <div className="sc-card p-6 sm:p-8">
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted">
              {t("Example only · illustrative composite, not a real learner or a research result")}
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
              {t(SAMPLE.name)}
            </h2>
            <p className="mt-1 text-sm text-slate">{t(SAMPLE.programme)}</p>
            <p className="mt-1 text-xs text-muted">{t(SAMPLE.nNote)}</p>
            <p className="mt-2 text-xs text-slate">
              {t("The measured result is different: in the 12-week Super-Cube® leadership intervention with Imana Foods and Kerry Foods, the average Emotional score rose by")}{" "}
              <strong className="text-ink">+39.5%</strong>.{" "}
              <Link href={L("/impact")} className="font-semibold text-ink underline underline-offset-2">
                {t("See the results")}
              </Link>
            </p>

            <div className="mt-6 grid grid-cols-3 gap-3">
              <Stat label={t("Baseline")} value={String(SAMPLE.pre)} />
              <Stat label={t("Post")} value={String(SAMPLE.post)} />
              <Stat label={t("Growth")} value={`+${SAMPLE.post - SAMPLE.pre}`} />
            </div>

            <h3 className="mt-8 text-sm font-semibold uppercase tracking-[0.12em] text-muted">
              {t("By construct")}
            </h3>
            <ul className="mt-3 space-y-2">
              {SAMPLE.faces.map((row) => {
                const c = constructs.find((x) => x.id === row.id)!;
                const d = Math.round((row.post - row.pre) * 10) / 10;
                return (
                  <li
                    key={row.id}
                    className="flex items-center gap-3 rounded-xl border border-line px-3 py-2.5"
                  >
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ background: c.color }}
                    />
                    <span className="min-w-0 flex-1 text-sm font-semibold text-ink">
                      {t(c.name)}
                    </span>
                    <span className="text-sm tabular-nums text-slate">
                      {t(row.pre)} → {t(row.post)}
                    </span>
                    <span className="text-xs font-semibold tabular-nums text-ink">
                      +{t(d)}
                    </span>
                  </li>
                );
              })}
            </ul>

            <SampleReportCharts
              faces={SAMPLE.faces}
              preOverall={t(SAMPLE.pre)}
              postOverall={t(SAMPLE.post)}
            />

            <p className="mt-6 text-xs leading-relaxed text-muted">
              {t(SAMPLE.methodology)}{" "}{t("Developmental profile within the Super-Cube® Leadership Model—not a clinical diagnosis or hiring credential. Real learners download PDF reports and certificates with verify IDs after the post-assessment. Journals never appear on shared snapshots. Continuous face pulses (daily/weekly) power the longitudinal trend in Learn.")}
            </p>
          </div>

          <div className="mt-10">
            <SectionHeading
              eyebrow={t("Why this matters")}
              title={t("Measure before and after—or you’re only counting activity.")}
              description={t("Super-Cube® is built so individuals, coaches, and organisations can see capacity change on human-centric faces—not vanity completion rates—and track patterns continuously between assessments.")}
            />
            <div className="mt-6 flex flex-wrap gap-3">
              <Button href={L("/learn/start")} variant="primary">
                {t("Start free baseline")}
              </Button>
              <Button href={L("/learn/pulse")} variant="ghost">
                {t("Face tracking")}
              </Button>
              <Button href={L("/impact")} variant="ghost">
                {t("Read a case story")}
              </Button>
              <Link
                href={L("/research")}
                className="inline-flex min-h-11 items-center text-sm font-semibold text-ink underline-offset-2 hover:underline"
              >
                {t("Research base →")}
              </Link>
            </div>
          </div>
        </div>
      </section>
      <section className="section-pad border-t border-line bg-paper">
        <div className="container-site max-w-2xl">
          <NewsletterSignup source="sample-report" />
        </div>
      </section>
    </>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-surface px-3 py-3">
      <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted">
        {label}
      </p>
      <p className="mt-1 text-xl font-semibold tabular-nums text-ink">
        {value}
      </p>
    </div>
  );
}
