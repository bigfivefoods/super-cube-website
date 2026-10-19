import type { PageMetaInput } from "@/lib/seo";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/config";
import { pageI18n } from "@/lib/i18n/pages/t";
import Image from "next/image";
import Link from "next/link";
import { ImpactResults } from "@/components/ImpactResults";
import { TestimonialsSection } from "@/components/Testimonials";
import { Button, CTABanner, PageHero, SectionHeading } from "@/components/ui";
import { constructs } from "@/lib/content";
import { faceInkStyle } from "@/lib/contrast";

/** English page metadata (title and description are translated per language by localePageMeta). */
export const META = {
  path: "/how",
  title: "How — Leadership Education",
  description:
    "How Super-Cube® develops leaders: philosophy to model, orientation, assessment, six construct courses, continuous face tracking, deliberate practice, and growth reports.",
} satisfies PageMetaInput;

const pathway = [
  {
    n: "01",
    title: "Orient",
    body: "Clarify whether the learner thinks from philosophy, theory, or model—so education meets them where they are.",
    href: "/learn/assessment/orientation",
  },
  {
    n: "02",
    title: "Pre-assess",
    body: "Baseline all six Super-Cube® faces. Strengths and priorities become visible, discussable, and improvable.",
    href: "/learn/assessment",
  },
  {
    n: "03",
    title: "Learn the six faces",
    body: "Structured modules for Choices, Principles, Mental, Emotional, Physical, and Spiritual—age-adapted language and scenarios.",
    href: "/constructs",
  },
  {
    n: "04",
    title: "Track & practise deliberately",
    body: "Daily or weekly face pulses reveal patterns. Micro-practices and weekly plans adapt to your weakest faces so insight becomes behaviour.",
    href: "/learn/pulse",
  },
  {
    n: "05",
    title: "Re-assess & report",
    body: "Post-assessment and a personal development report so growth is measured—not assumed.",
    href: "/learn/report",
  },
];

const pillars = [
  {
    title: "Philosophy → theory → model",
    body: "We do not skip the layers. Philosophy sets values; theory explains how leadership works; Super-Cube® is the absolute model learners can practise and assess.",
  },
  {
    title: "Blended & human-centric",
    body: "Content, motivation, and social interaction (Illeris) sit inside an I–Thou stance: people are whole beings, not objects of control.",
  },
  {
    title: "Evidence-informed",
    body: "The six-construct structure was tested in doctoral research (mixed methods, African FMCG network) so education is built on a tested frame.",
  },
  {
    title: "Continuous & adaptive",
    body: "Beyond one-off assessments: track the six faces over days and weeks, see patterns, and receive practice recommendations matched to your growth priorities.",
  },
];

export function HowView({ locale = DEFAULT_LOCALE }: { locale?: Locale } = {}) {
  const { t, L } = pageI18n(locale);
  return (
    <>
      <PageHero t={t}
        theme="leadership"
        eyebrow={t("How Super-Cube® works")}
        title={t("Leadership education that turns insight into practice.")}
        description={t("How we develop leaders: a clear model, honest assessment, six construct courses, continuous face tracking, deliberate practice, and measured growth—designed for kids, adolescents, and adults.")}
        visual={
          <figure className="w-full overflow-hidden rounded-2xl border border-white/15 bg-white/10 shadow-xl backdrop-blur-sm">
            <div className="relative aspect-[694/584] w-full overflow-hidden">
              <Image
                src="/images/hero/nelson-mandela.jpg"
                alt="Nelson Mandela"
                fill
                className="object-cover object-center"
                sizes="(max-width: 1024px) 20rem, 28vw"
                priority
              />
            </div>
            <figcaption className="p-3.5 sm:p-4">
              <p className="text-[0.7rem] font-medium italic leading-snug text-white/85">
                “Education is the most powerful weapon which you can use to
                change the world.”
              </p>
              <p className="mt-1 text-[0.65rem] font-semibold tracking-wide text-white/55">
                — Nelson Mandela
              </p>
            </figcaption>
          </figure>
        }
      >
        <Button href={L("/what")} variant="primary">
          {t("See the programmes")}
        </Button>
        <Button href={L("/learn")} variant="ghost">
          {t("Enter the learning app")}
        </Button>
      </PageHero>

      <section className="section-pad border-b border-line bg-bg">
        <div className="container-site grid gap-10 lg:grid-cols-2 lg:gap-16">
          <SectionHeading
            eyebrow={t("The education approach")}
            title={t("Not a lecture. A development system.")}
            description={t("Super-Cube® education is built so learners can understand, practise, track, and prove growth—not merely consume content.")}
          />
          <div className="prose-site space-y-4 text-slate">
            <p>
              {t("Leadership is substantially developable through deliberate practice. Our pathway combines a multidimensional model with structured learning loops: orient, assess, learn, track, apply, and re-measure.")}
            </p>
            <p>
              {t("Language and scenarios adapt by age, but the six faces stay constant—so families, schools, and organisations can share one leadership language. Continuous face tracking turns one-time baselines into living patterns that guide weekly practice.")}
            </p>
          </div>
        </div>

        <div className="container-site mt-12 grid gap-4 sm:grid-cols-2">
          {pillars.map((p) => (
            <article
              key={p.title}
              className="rounded-2xl border border-line bg-surface p-5 sm:p-6"
            >
              <h3 className="text-base font-semibold tracking-tight text-ink">
                {t(p.title)}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate">
                {t(p.body)}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="section-pad border-b border-line bg-surface">
        <div className="container-site">
          <SectionHeading
            eyebrow={t("The learning pathway")}
            title={t("Five stages. One coherent journey.")}
            description={t("From first orientation to personal report—including continuous face tracking so practice stays targeted.")}
          />
          <ol className="mt-10 space-y-3">
            {pathway.map((step) => (
              <li key={step.n}>
                <Link
                  href={L(step.href)}
                  className="grid gap-2 sc-card p-5 transition hover:border-black/15 dark:hover:border-white/20 hover:shadow-sm sm:grid-cols-[4rem_1fr_auto] sm:items-center sm:gap-6 sm:p-6"
                >
                  <span className="font-display text-2xl text-muted">
                    {t(step.n)}
                  </span>
                  <div>
                    <h3 className="text-base font-semibold tracking-tight text-ink">
                      {t(step.title)}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate">
                      {t(step.body)}
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-ink sm:text-right">
                    {t("Open →")}
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section-pad border-b border-line bg-bg">
        <div className="container-site">
          <SectionHeading
            eyebrow={t("What learners develop")}
            title={t("Six faces of leadership capacity.")}
            description={t("Each construct is a developable domain—taught, practised, tracked, and assessed.")}
          />
          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {constructs.map((c) => (
              <Link
                key={c.id}
                href={L(`/constructs#${c.id}`)}
                className="sc-card p-5 transition hover:shadow-sm"
                style={{ boxShadow: `inset 3px 0 0 ${c.color}` }}
              >
                <p
                  className="text-[0.65rem] font-bold uppercase tracking-wider face-ink"
                  style={faceInkStyle(c.color)}
                >
                  {t(c.name)}
                </p>
                <p className="mt-2 text-sm font-semibold tracking-tight text-ink">
                  {t(c.tagline)}
                </p>
                <p className="mt-2 text-xs leading-relaxed text-slate">
                  {t(c.summary)}
                </p>
              </Link>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap gap-3">
            <Button href={L("/the-model")} variant="primary">
              {t("Read the full model")}
            </Button>
            <Button href={L("/research")} variant="ghost">
              {t("See the evidence")}
            </Button>
            <Button href={L("/what")} variant="ghost">
              {t("What we offer →")}
            </Button>
          </div>
        </div>
      </section>

      <ImpactResults locale={locale}
        eyebrow={t("Does it work?")}
        title={t("Intervention gains you can measure.")}
        description={t("Average pre- to post-course gains from the 12-week Super-Cube® leadership intervention with leaders at Imana Foods and Kerry Foods, by face and overall.")}
      />

      <TestimonialsSection locale={locale}
        title={t("What participants say")}
        description={t("Feedback from leaders in South African FMCG businesses who walked the Super-Cube® programme—learning, growth, and behaviour change in their own words.")}
      />

      <CTABanner t={t} L={L} />
    </>
  );
}
