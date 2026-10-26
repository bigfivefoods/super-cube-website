import Link from "next/link";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/config";
import { pageI18n } from "@/lib/i18n/pages/t";
import type { PageMetaInput } from "@/lib/seo";
import { TestimonialsSection } from "@/components/Testimonials";
import { Button, CTABanner, PageHero, SectionHeading } from "@/components/ui";
import { AUTHOR_BIO } from "@/lib/author";
import { BOOK, PAID_BOOK, PAID_BOOK_DETAILS } from "@/lib/book";

/** English page metadata (title and description are translated per language by localePageMeta). */
export const META = {
  path: "/about",
  title: "About · Dr Craig R. Muller",
  description:
    "Dr Craig R. Muller — DBA, UKZN. Creator of Super-Cube® leadership development. Visionary architect of Kingdom-centred leadership and sustainable impact across Africa through Feed, Educate, and Empower.",
} satisfies PageMetaInput;

const glance = [
  ["Author", "Dr Craig Ross Muller"],
  ["Book", "Leadership Is Learnable (Big Five Group, 2026)"],
  ["Degree", "Doctor of Business Administration (DBA)"],
  ["Institution", "University of KwaZulu-Natal (2021)"],
  ["Model", "Super-Cube® (2020 thesis · peer-reviewed)"],
  ["Case context", "African FMCG business-network"],
  ["Methods", "Mixed methods · CFA · thematic interviews"],
];

const pillars = [
  {
    label: "Feed",
    title: "Big Five Foods",
    body: "Innovative, accessible, nutritious FMCG solutions that strengthen food security continent-wide.",
  },
  {
    label: "Educate",
    title: "Super-Cube®",
    body: "A pioneering holistic leadership model across Choices · Principles · Mental · Emotional · Physical · Spiritual intelligence.",
  },
  {
    label: "Empower",
    title: "SupplierAdvisor®",
    body: "Strategic programmes that equip suppliers, entrepreneurs, and communities with tools, strategies, and networks for sustainable growth.",
  },
];

const education = [
  {
    degree: "Doctor of Business Administration (DBA)",
    detail:
      "University of KwaZulu-Natal · 2021 · Creator of the Super-Cube® leadership model",
  },
  {
    degree: "Master of Business Administration (MBA)",
    detail: "University of KwaZulu-Natal · 2006",
  },
  {
    degree: "Postgraduate Diploma in Management",
    detail: "University of KwaZulu-Natal · 2004",
  },
  {
    degree: "Bachelor of Commerce (B.Comm)",
    detail: "University of Natal · 2002",
  },
];

export async function AboutView({ locale = DEFAULT_LOCALE }: { locale?: Locale } = {}) {
  const { t, L } = await pageI18n(locale);
  return (
    <>
      <PageHero t={t}
        theme="about"
        eyebrow={t("About Super-Cube®")}
        title={t("From doctoral research to a development system.")}
        description={t("Super-Cube® was created to strengthen leadership capacity in complex, high-growth environments—beginning with rigorous research and a human-centric philosophy.")}
      >
        <Button href={L("/learn/start")} variant="primary">
          {t("Start free baseline")}
        </Button>
        <Button href={L("/the-model")} variant="ghost">
          {t("Explore the model")}
        </Button>
        <Button href={L("/contact")} variant="ghost">
          {t("Connect with us")}
        </Button>
      </PageHero>

      {/* Founder bio */}
      <section className="section-pad border-b border-line bg-bg">
        <div className="container-site">
          <div className="grid min-w-0 gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-12 xl:gap-16">
            <div className="min-w-0">
              <p className="eyebrow">{t("Founder")}</p>
              <h2 className="heading-lg mt-2.5 text-ink sm:mt-3">
                {t("Dr Craig R. Muller")}
              </h2>
              <p className="mt-2 text-sm font-semibold tracking-tight text-slate sm:text-base">
                {t("Visionary architect of Kingdom-centred leadership and sustainable impact in Africa")}
              </p>
              <div className="prose-site mt-5 space-y-4 sm:mt-6" data-testid="author-bio">
                {AUTHOR_BIO.map((para) => (
                  <p key={para.slice(0, 32)}>{t(para)}</p>
                ))}
              </div>
              <p className="mt-5 text-sm font-semibold text-ink">
                {t("Author of")}{" "}
                <Link href={L(`/book#${PAID_BOOK_DETAILS.anchor}`)} className="underline underline-offset-2">
                  <em>{t(PAID_BOOK.title)}</em>
                </Link>{" "}
                ({t(PAID_BOOK.imprint)}, 2026)
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {["Integrity", "Excellence", "Compassionate empowerment"].map(
                  (v) => (
                    <span
                      key={v}
                      className="inline-flex rounded-full border border-line bg-surface px-3 py-1.5 text-[0.75rem] font-semibold text-ink"
                    >
                      {t(v)}
                    </span>
                  ),
                )}
              </div>
              <p className="mt-4 text-sm leading-relaxed text-muted">
                {t("Grounded in humility, trust, collaboration, and continuous improvement.")}
              </p>
            </div>

            <div className="min-w-0 rounded-2xl border border-line bg-surface p-5 sm:p-6 md:p-7">
              <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted">
                {t("Education")}
              </p>
              <ul className="mt-4 space-y-4">
                {education.map((ed) => (
                  <li
                    key={ed.degree}
                    className="border-b border-line pb-4 last:border-0 last:pb-0"
                  >
                    <p className="text-sm font-semibold tracking-tight text-ink">
                      {t(ed.degree)}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-slate sm:text-sm">
                      {t(ed.detail)}
                    </p>
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted">
                {t("Books")}
              </p>
              <ul className="mt-4 space-y-4" data-testid="author-books">
                <li className="border-b border-line pb-4">
                  <p className="text-sm font-semibold tracking-tight text-ink">
                    <Link href={L(`/book#${PAID_BOOK_DETAILS.anchor}`)} className="hover:underline">
                      {t(PAID_BOOK.title)}
                    </Link>
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-slate sm:text-sm">
                    {t(PAID_BOOK.imprint)} · {t(PAID_BOOK_DETAILS.publishedLabel)} · {t(PAID_BOOK_DETAILS.pages)}{" "}{t("pp · ISBN")}{" "}
                    {t(PAID_BOOK.paperback.isbn)}{" "}{t("(paperback) · ISBN")}{" "}{t(PAID_BOOK.kindle.isbn)}{" "}{t("(eBook)")}
                  </p>
                </li>
                <li>
                  <p className="text-sm font-semibold tracking-tight text-ink">
                    <Link href={L(BOOK.page)} className="hover:underline">
                      {t(BOOK.title)}
                    </Link>
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-slate sm:text-sm">
                    {t("Free book · 2026 ·")}{" "}{t(BOOK.pages)}{" "}{t("pp · PDF")}
                  </p>
                </li>
              </ul>
              <p className="mt-5 text-xs text-muted">
                {t("Contact:")}{" "}
                <a
                  href="mailto:hello@super-cube.me"
                  className="font-semibold text-ink underline-offset-2 hover:underline"
                >
                  {t("hello@super-cube.me")}
                </a>
              </p>
            </div>
          </div>

          <div className="mt-10 grid gap-3 sm:mt-12 sm:grid-cols-3 sm:gap-4">
            {pillars.map((p) => (
              <article
                key={p.label}
                className="sc-card p-5 shadow-[0_1px_0_rgba(0,0,0,0.02)]"
              >
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-muted">
                  {t(p.label)}
                </p>
                <h3 className="mt-2 text-base font-semibold tracking-tight text-ink">
                  {t(p.title)}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate">
                  {t(p.body)}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-site grid min-w-0 gap-10 lg:grid-cols-2 lg:gap-12">
          <div className="prose-site min-w-0">
            <SectionHeading
              eyebrow={t("Origins")}
              title={t("Born inside a real business network.")}
            />
            <p className="mt-6">
              {t("The Super-Cube® Leadership Model was developed by")}{" "}
              <strong>{t("Dr Craig Ross Muller")}</strong>{" "}{t("as the core output of his Doctor of Business Administration thesis at the")}{" "}
              <strong>{t("University of KwaZulu-Natal")}</strong>{t(". Citation pack:")}{" "}
              <Link href={L("/media")}>{t("/media")}</Link>{t(". Privacy: journals private by default; coaches only see consented scores (")}
              <Link href={L("/privacy")}>{t("privacy policy")}</Link>{t("). Theoretical foundations span major leadership schools through Ubuntu, I–Thou, and AQAL—see")}{" "}
              <Link href={L("/the-model#theory")}>{t("the full theory map")}</Link>.
            </p>
            <p>
              {t("The thesis (December 2020), a leadership skills development model built as a case study of an African FMCG business network, addressed leadership capacity challenges in Africa’s fast-moving consumer goods sector: rapid population growth, talent abundance alongside skills shortages, corruption pressures, poverty, conflict, and institutional weaknesses.")}
            </p>
            <p>
              {t("Rather than import a purely Western template, Muller built and tested a multidimensional framework inside a live African business-network—bridging theory and practice for emerging-market leadership development.")}
            </p>
          </div>
          <div className="min-w-0 sc-card p-5 shadow-[0_1px_0_rgba(0,0,0,0.02)] sm:p-6 md:p-8">
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted">
              {t("At a glance")}
            </p>
            <dl className="mt-5 space-y-4 sm:mt-6 sm:space-y-5">
              {glance.map(([k, v]) => (
                <div
                  key={k}
                  className="grid grid-cols-1 gap-1 border-b border-line pb-4 last:border-0 last:pb-0 sm:grid-cols-[minmax(6.5rem,30%)_1fr] sm:gap-3"
                >
                  <dt className="text-xs font-medium text-muted sm:text-sm">
                    {t(k)}
                  </dt>
                  <dd className="text-sm font-semibold text-ink">{t(v)}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section className="section-pad border-y border-line bg-surface">
        <div className="container-site">
          <SectionHeading
            eyebrow={t("Why it matters")}
            title={t("Leadership development that fits the context.")}
            description={t("Emerging markets need models that honour complexity without abandoning evidence—or the person at the centre of the work.")}
          />
          <div className="mt-8 grid gap-3 sm:mt-10 sm:grid-cols-2 sm:gap-4 md:mt-12 md:grid-cols-3">
            {[
              {
                title: "Human-centric",
                body: "Six whole-person constructs with you at the centre—agency first, scale second.",
              },
              {
                title: "Empirically grounded",
                body: "Survey CFA and senior-leader interviews—not a slide deck of untested slogans.",
              },
              {
                title: "Africa-aware",
                body: "Designed for FMCG network realities and transferable to other complex, multi-entity settings.",
              },
            ].map((card) => (
              <article
                key={card.title}
                className="sc-card p-5 sm:p-6"
              >
                <h3 className="text-base font-semibold tracking-tight text-ink sm:text-lg">
                  {t(card.title)}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate sm:mt-3">
                  {t(card.body)}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-site max-w-3xl prose-site">
          <SectionHeading
            eyebrow={t("This website")}
            title={t("Education, not ornament.")}
          />
          <p className="mt-6">
            {t("super-cube.me presents the Super-Cube® Leadership Model as a clear, world-class educational resource—for leaders, L&D teams, and organisations seeking a coherent language for human-centric development.")}
          </p>
          <p>
            {t("Content is informed by the model’s published research record and public scholarly summaries. For academic citation, always consult the primary thesis and peer-reviewed outputs.")}
          </p>
          <div className="mt-8 flex w-full max-w-md flex-col gap-2.5 sm:max-w-none sm:flex-row sm:flex-wrap">
            <Button
              href={L("/research")}
              variant="primary"
              className="w-full sm:w-auto"
            >
              {t("Read the research summary")}
            </Button>
            <Button
              href={L("/programs")}
              variant="ghost"
              className="w-full sm:w-auto"
            >
              {t("See programmes")}
            </Button>
          </div>
        </div>
      </section>

      <TestimonialsSection locale={locale}
        title={t("Voices from the field")}
        description={t("Leaders from Imana Foods and Kerry Foods on the Super-Cube® programme—proof that the model lands in real organisations.")}
      />

      <CTABanner t={t} L={L} />
    </>
  );
}
