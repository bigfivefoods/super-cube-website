import { LeadershipCircles } from "@/components/LeadershipCircles";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/config";
import { pageI18n } from "@/lib/i18n/pages/t";
import { SuperCube } from "@/components/SuperCube";
import { Button, CTABanner, PageHero, SectionHeading } from "@/components/ui";
import {
  constructs,
  levels,
  theoryCategories,
  theoryLiteratureOverview,
} from "@/lib/content";
import type { PageMetaInput } from "@/lib/seo";

/** English page metadata (title and description are translated per language by localePageMeta). */
export const META = {
  title: "Super-Cube® Leadership Model",
  description:
    "The Super-Cube® Leadership Model: six human-centric constructs (Choices, Principles, Mental, Emotional, Physical, Spiritual), I–Thou and Ubuntu philosophy, and developable leadership from UKZN doctoral research.",
  path: "/the-model",
  image: "/images/hero/hero-model.jpg",
  keywords: [
    "Super-Cube® Leadership Model",
    "multidimensional leadership framework",
    "Ubuntu leadership",
    "I-Thou leadership",
  ],
} satisfies PageMetaInput;

export async function TheModelView({ locale = DEFAULT_LOCALE }: { locale?: Locale } = {}) {
  const { t, L } = await pageI18n(locale);
  return (
    <>
      <PageHero t={t}
        theme="model"
        eyebrow={t("The Super-Cube® Leadership Model")}
        title={t("A multidimensional framework for developable leadership.")}
        description={t("Six human-centric constructs form the faces of a cube. The individual—you—stands at the centre. Leadership capacity radiates outward from personal practice to organisational and network impact.")}
      >
        <Button href={L("/constructs")} variant="primary">
          {t("Meet the six constructs")}
        </Button>
        <Button href={L("/research")} variant="ghost">
          {t("See the evidence")}
        </Button>
      </PageHero>

      <section className="section-pad bg-bg">
        <div className="container-site grid items-center gap-10 md:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] md:gap-12 lg:gap-16">
          <div className="prose-site min-w-0">
            <SectionHeading
              eyebrow={t("Definition & purpose")}
              title={t("Built for complex environments—starting with the person.")}
            />
            <p className="mt-6">
              {t("The Super-Cube® Leadership Model is a multidimensional, human-centric leadership skills development framework. Its purpose is to build leadership capacity at individual, organisational, and network levels—enabling leaders to navigate distinctive business environments marked by growth, talent abundance alongside skills shortages, and institutional complexity.")}
            </p>
            <p>
              {t("Developed in 2020 by Craig Ross Muller as the core output of his Doctor of Business Administration thesis at the University of KwaZulu-Natal, the model was empirically shaped within an African FMCG business-network and is among the first frameworks of its kind tested in that context.")}
            </p>
          </div>
          <div className="flex justify-center md:justify-end">
            <div className="w-full max-w-[15rem] bg-transparent sm:max-w-[17rem] md:max-w-[18rem] lg:max-w-[20rem]">
              <SuperCube size="md" showSkills />
            </div>
          </div>
        </div>
      </section>

      <section className="section-pad border-y border-[var(--line)] bg-paper">
        <div className="container-site">
          <SectionHeading
            eyebrow={t("Cubic structure")}
            title={t("Geometry that teaches balance.")}
            description={t("The cube is not decoration—it is a teaching tool. Six faces, one centre, continuous interdependence. Leadership begins with you, then expands through the people and systems you touch.")}
          />

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                title: "Six faces",
                body: "Choices, Principles, Mental, Emotional, Physical, and Spiritual—each a developable domain of leadership practice.",
              },
              {
                title: "You at the centre",
                body: "Personal agency is non-negotiable. Meaningful capacity cannot emerge without deliberate investment in the individual first.",
              },
              {
                title: "Outward radiation",
                body: "Growth begins personally, then extends to family, friends, colleagues, community, and wider society—and, in organisations, from one person to industry scale.",
              },
            ].map((card) => (
              <article
                key={card.title}
                className="rounded-[var(--radius)] border border-[var(--line)] bg-cream p-6 shadow-[var(--shadow-sm)]"
              >
                <h3 className="heading-md text-[1.35rem] text-ink">
                  {t(card.title)}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate">
                  {t(card.body)}
                </p>
              </article>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap gap-2">
            {constructs.map((c) => (
              <span
                key={c.id}
                className="rounded-full px-3.5 py-1.5 text-xs font-semibold tracking-wide text-white"
                style={{ background: c.color }}
              >
                {t(c.name)}
              </span>
            ))}
          </div>

          <div className="mt-14">
            <div className="mb-8 max-w-2xl">
              <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted">
                {t("Expanding leadership circles")}
              </p>
              <h3 className="mt-2 heading-md text-[1.5rem] text-ink sm:text-[1.75rem]">
                {t("From you at the centre, outward.")}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-slate sm:text-base">
                {t("The geometry of Super-Cube® is personal first: you develop the six faces. That capacity does not stay private—it radiates into the circles of life where leadership is actually lived.")}
              </p>
            </div>
            <LeadershipCircles locale={locale} />
          </div>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-site grid gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading
              eyebrow={t("Philosophy")}
              title={t("I–Thou, Ubuntu, and the whole person.")}
            />
            <div className="prose-site mt-6">
              <p>
                {t("Super-Cube® is philosophically grounded in Martin Buber’s")}{" "}
                <em>{t("I–Thou")}</em>{" "}{t("philosophy—mutual respect and encounters between equals who recognise each other’s psychological, intellectual, emotional, and spiritual attributes—and in the African philosophy of")}{" "}<strong>{t("Ubuntu")}</strong>{t(": personhood-in-relation (")}
                <em>{t("I am because we are")}</em>{t("), human dignity, and shared becoming.")}
              </p>
              <p>
                {t("Leadership is framed as a process that values people as multidimensional “Thous” rather than objects—capable of leading and following in different contexts. Ken Wilber’s")}{" "}
                <strong>{t("AQAL")}</strong>{" "}{t("(All Quadrant All Level) integral approach further holds interior and exterior, individual and collective dimensions together. This human-centric stance underpins every construct and every level of application.")}
              </p>
            </div>
          </div>
          <div>
            <SectionHeading
              eyebrow={t("Learning theory")}
              title={t("How development actually happens.")}
            />
            <div className="mt-6 space-y-4">
              {[
                {
                  title: "Content",
                  body: "Knowledge, skills, understanding, values, and feelings—primarily cognitive foundations for each construct.",
                },
                {
                  title: "Incentive",
                  body: "Intrinsic motivation, interest, and emotional engagement that make growth stick.",
                },
                {
                  title: "Interaction",
                  body: "Social engagement across situational, institutional, and broader contextual layers—where practice becomes real.",
                },
              ].map((dim) => (
                <div
                  key={dim.title}
                  className="rounded-[var(--radius)] border border-[var(--line)] bg-paper p-5"
                >
                  <h3 className="font-semibold text-ink">{t(dim.title)}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate">
                    {t(dim.body)}
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-5 text-sm text-muted">
              {t("Guided by Knud Illeris’s three-dimensional learning theory.")}
            </p>
          </div>
        </div>
      </section>

      <section
        id="theory"
        className="section-pad border-t border-[var(--line)] bg-void text-void-fg"
      >
        <div className="container-site">
          <SectionHeading
            eyebrow={t("Theoretical foundations · Theory level")}
            title={t("Literature map that underpins Super-Cube®.")}
            description={t(theoryLiteratureOverview)}
            light
          />

          <div className="mt-12 space-y-10">
            {theoryCategories.map((cat) => (
              <div key={cat.id}>
                <p className="text-[0.7rem] font-bold uppercase tracking-[0.14em] text-cream/45">
                  {t(cat.subtitle)}
                </p>
                <h3 className="mt-1 text-xl font-semibold tracking-tight text-cream sm:text-2xl">
                  {t(cat.title)}
                </h3>
                <p className="mt-2 max-w-3xl text-sm leading-relaxed text-cream/55">
                  {t(cat.description)}
                </p>
                <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {cat.items.map((item) => (
                    <div
                      key={item.name}
                      className="rounded-[var(--radius)] border border-white/10 bg-white/5 p-4 backdrop-blur sm:p-5"
                    >
                      <h4 className="font-semibold text-cream">{t(item.name)}</h4>
                      <p className="mt-1.5 text-sm text-cream/55">{t(item.note)}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad bg-paper">
        <div className="container-site">
          <SectionHeading
            eyebrow={t("Progressive application")}
            title={t("Five levels of leadership capacity building.")}
            description={t("The same six constructs scale—from a personal development plan to sector-wide programmes.")}
          />
          <div className="mt-12 space-y-0">
            {levels.map((level, i) => (
              <div
                key={level.level}
                className="grid gap-4 border-t border-[var(--line)] py-8 md:grid-cols-[5rem_1fr_1.4fr] md:items-start"
              >
                <span className="font-display text-4xl text-gold">
                  {String(level.level).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="heading-md text-[1.4rem] text-ink">
                    {t(level.title)}
                  </h3>
                  <p className="mt-1 text-sm font-medium uppercase tracking-wider text-muted">
                    {t(level.subtitle)}
                  </p>
                </div>
                <p className="text-slate leading-relaxed">
                  {t(level.description)}
                </p>
                {i === levels.length - 1 && (
                  <div className="md:col-span-3 border-b border-[var(--line)]" />
                )}
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Button href={L("/programs")} variant="primary">
              {t("Explore programs")}
            </Button>
          </div>
        </div>
      </section>

      <CTABanner t={t} L={L} />
    </>
  );
}
