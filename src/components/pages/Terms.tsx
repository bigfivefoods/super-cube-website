import { Button, PageHero } from "@/components/ui";
import { site } from "@/lib/content";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/config";
import { pageI18n } from "@/lib/i18n/pages/t";
import type { PageMetaInput } from "@/lib/seo";

export const META = {
  path: "/terms",
  title: "Terms of use",
  description: "Terms for using Super-Cube® website and Learn platform.",
} satisfies PageMetaInput;

const sections: { title: string; body: string }[] = [
  {
    title: "1. Service",
    body: "We provide leadership education content, assessments, and tools for personal, school, and organisational development. Features may change as we improve the product.",
  },
  {
    title: "2. Not clinical or employment advice",
    body: "Assessments are developmental self-report instruments, not clinical diagnostics, hiring tools, or medical advice. Organisations remain responsible for fair HR practice and POPIA compliance.",
  },
  {
    title: "3. Accounts & demos",
    body: "Demo access may run on-device without payment. Paid programmes and cohort tools may require authentication and payment providers (e.g. Paystack). You are responsible for safeguarding your login.",
  },
  {
    title: "4. Intellectual property",
    body: "Super-Cube® model, branding, course media, and software remain our intellectual property (or licensed to us). You may use outputs (e.g. your growth report) for personal and organisational development; you may not resell course content or rebrand the model without written permission.",
  },
  {
    title: "5. Acceptable use",
    body: "Do not abuse APIs, scrape at scale, harass users, or upload unlawful content. School facilitators must follow safeguarding policies.",
  },
  {
    title: "6. Liability",
    body: "The service is provided “as is.” To the fullest extent permitted by law we disclaim indirect damages. Nothing excludes liability that cannot be excluded under applicable South African law.",
  },
];

export async function TermsView({ locale = DEFAULT_LOCALE }: { locale?: Locale } = {}) {
  const { t, L } = await pageI18n(locale);
  return (
    <>
      <PageHero
        t={t}
        theme="none"
        eyebrow="Legal"
        title="Terms of use"
        description="By using super-cube.me and Super-Cube® Learn you agree to these terms. Super-Cube® is a trademark of its owner; the model is for educational and development use."
      >
        <Button href={L("/privacy")} variant="ghost">
          {t("Privacy")}
        </Button>
        <Button href={L("/contact")} variant="primary">
          {t("Questions")}
        </Button>
      </PageHero>

      <section className="section-pad bg-surface">
        <div className="container-site max-w-3xl space-y-8 text-slate">
          {sections.map((s) => (
            <div key={s.title}>
              <h2 className="text-xl font-semibold tracking-tight text-ink">{t(s.title)}</h2>
              <p className="mt-3">{t(s.body)}</p>
            </div>
          ))}
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-ink">{t("7. Contact")}</h2>
            <p className="mt-3">
              <a className="font-semibold text-ink" href={`mailto:${site.email}`}>
                {site.email}
              </a>
            </p>
          </div>
          <p className="text-sm text-muted">{t("Last updated: 2026-07-31")}</p>
        </div>
      </section>
    </>
  );
}
