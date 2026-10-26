import Image from "next/image";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/config";
import { pageI18n } from "@/lib/i18n/pages/t";
import Link from "next/link";
import { Button, CTABanner, PageHero, SectionHeading } from "@/components/ui";
import { constructs } from "@/lib/content";
import {
  howSuperCubeAddresses,
  leadershipChallengeSources,
  leadershipChallengeThesis,
  sdgChallenges,
  sofiSnapshot,
} from "@/lib/leadership-challenges";
import { sdgGoals } from "@/lib/sdgs";
import type { PageMetaInput } from "@/lib/seo";
import { faceInkStyle } from "@/lib/contrast";

/** English page metadata (title and description are translated per language by localePageMeta). */
export const META = {
  title: "Leadership challenges · UN SDGs & SOFI",
  description:
    "How Super-Cube® leadership development addresses challenges across all 17 UN SDGs—anchored in the UN SOFI report on food security and nutrition.",
  path: "/leadership-challenges",
  image: "/images/hero/hero-sdg.jpg",
  keywords: [
    "leadership challenges SDGs",
    "SOFI food security leadership",
    "UN SDG leadership development",
    "Super-Cube® SDGs",
  ],
} satisfies PageMetaInput;

function goalById(id: number) {
  return sdgGoals.find((g) => g.id === id)!;
}

function faceLabel(id: string) {
  return constructs.find((c) => c.id === id)?.name ?? id;
}

function faceColor(id: string) {
  return constructs.find((c) => c.id === id)?.color ?? "#666";
}

export function LeadershipChallengesView({ locale = DEFAULT_LOCALE }: { locale?: Locale } = {}) {
  const { t, L } = pageI18n(locale);
  return (
    <>
      <PageHero t={t}
        theme="sdg"
        eyebrow={t("Leadership challenges")}
        title={t("Seventeen goals. One leadership gap.")}
        description={t("The UN SOFI report shows food systems—and with them much of the 2030 Agenda—are stuck on delivery, coordination, and equity. Super-Cube® develops the whole-person leaders those challenges demand.")}
      >
        <Button href={L("/learn/start")} variant="primary">
          {t("Start free")}
        </Button>
        <Button href={L("/why-leadership")} variant="ghost">
          {t("Why leadership")}
        </Button>
      </PageHero>

      {/* SOFI evidence band */}
      <section className="section-pad border-b border-line bg-surface">
        <div className="container-site">
          <SectionHeading
            eyebrow={t("Evidence · UN SOFI")}
            title={t(sofiSnapshot.title)}
            description={t(sofiSnapshot.summary)}
          />

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {sofiSnapshot.keyStats.map((stat) => (
              <article
                key={stat.label}
                className="flex h-full flex-col sc-card p-5 sm:p-6"
              >
                <p className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                  {t(stat.value)}
                </p>
                <p className="mt-2 text-sm font-semibold text-ink">
                  {t(stat.label)}
                </p>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-slate">
                  {t(stat.note)}
                </p>
              </article>
            ))}
          </div>

          <div className="mt-8 sc-card p-5 sm:p-6">
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted">
              {t("SOFI themes")}
            </p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {sofiSnapshot.themes.map((theme) => (
                <li
                  key={theme}
                  className="rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-medium text-ink sm:text-sm"
                >
                  {t(theme)}
                </li>
              ))}
            </ul>
            <p className="mt-5 text-sm leading-relaxed text-slate">
              {t("Food security is tightly coupled to poverty, health, education, climate, peace, and partnerships. Closing SOFI gaps is therefore closing leadership and delivery gaps across the full SDG agenda.")}
            </p>
            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm">
              {sofiSnapshot.sources.map((s) => (
                <a
                  key={s.href}
                  href={L(s.href)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-ink underline-offset-2 hover:underline"
                >
                  {t(s.label)} ↗
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Thesis */}
      <section className="section-pad border-b border-line bg-bg">
        <div className="container-site max-w-3xl">
          <SectionHeading
            eyebrow={t("The Super-Cube® thesis")}
            title={t("Development gaps are leadership capacity gaps.")}
          />
          <p className="mt-6 text-base leading-relaxed text-slate sm:text-lg">
            {t(leadershipChallengeThesis)}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href={L("/the-model")} variant="primary">
              {t("Explore the model")}
            </Button>
            <Button href={L("/constructs")} variant="ghost">
              {t("Six faces")}
            </Button>
          </div>
        </div>
      </section>

      {/* All 17 SDGs */}
      <section
        id="sdgs"
        className="section-pad scroll-mt-20 border-b border-line bg-elevated"
      >
        <div className="container-site">
          <SectionHeading
            eyebrow={t("All 17 Sustainable Development Goals")}
            title={t("Issue by goal. Capacity Super-Cube® builds.")}
            description={t("Each card states a concrete challenge, how Super-Cube® develops the leadership needed, and which faces of the model carry the load. SOFI and food-system links appear where evidence is strongest.")}
          />

          <div className="mt-10 space-y-5">
            {sdgChallenges.map((row) => {
              const goal = goalById(row.id);
              return (
                <article key={row.id} className="lc-card">
                  <div className="lc-card-grid">
                    <div
                      className="lc-goal"
                      style={{
                        borderTopColor: goal.color,
                        boxShadow: `inset 0 3px 0 0 ${goal.color}`,
                      }}
                    >
                      <div className="lc-icon">
                        {/* Fixed 120px icon: width/height give a 1x/2x srcset instead of every breakpoint. */}
                        <Image
                          src={goal.icon}
                          alt={`SDG ${goal.id}: ${goal.short}`}
                          width={120}
                          height={120}
                          className="lc-img"
                        />
                      </div>
                      <div className="text-center">
                        <p
                          className="lc-kicker face-ink"
                          style={faceInkStyle(goal.color)}
                        >
                          {t("Goal")}{" "}{t(goal.id)}
                        </p>
                        <p className="lc-name">
                          {t(goal.short)}
                        </p>
                      </div>
                    </div>

                    <div className="lc-body">
                      <div>
                        <p className="lc-label">
                          {t("Issue")}
                        </p>
                        <p className="lc-text">
                          {t(row.issue)}
                        </p>
                      </div>

                      {row.sofiLink && (
                        <div className="lc-note">
                          <p className="lc-label">
                            {t("SOFI / food systems")}
                          </p>
                          <p className="lc-text">
                            {t(row.sofiLink)}
                          </p>
                        </div>
                      )}

                      <div>
                        <p className="lc-label">
                          {t("Leadership need")}
                        </p>
                        <p className="lc-text">
                          {t(row.leadershipNeed)}
                        </p>
                      </div>

                      <div>
                        <p className="lc-label">
                          {t("How Super-Cube® helps")}
                        </p>
                        <p className="lc-text">
                          {t(row.superCubeHelp)}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {row.faces.map((face) => (
                          <span
                            key={face}
                            className="lc-chip"
                            style={{ background: faceColor(face) }}
                          >
                            {faceLabel(face)}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <p className="mt-8 text-center text-xs text-muted">
            {t("Official UN SDG icons and titles · challenges framed for leadership development · Super-Cube® does not claim UN endorsement")}
          </p>
        </div>
      </section>

      {/* How Super-Cube helps overall */}
      <section className="section-pad border-b border-line bg-bg">
        <div className="container-site">
          <SectionHeading
            eyebrow={t("How Super-Cube® addresses the agenda")}
            title={t("Capacity that compounds across goals.")}
            description={t("The six faces and multi-level model turn SDG ambition into developable human capability—measurable practice from the individual outward.")}
          />

          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {howSuperCubeAddresses.map((item) => (
              <article
                key={item.title}
                className="sc-card p-5 sm:p-6"
              >
                <h3 className="text-base font-semibold tracking-tight text-ink sm:text-lg">
                  {t(item.title)}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate">
                  {t(item.body)}
                </p>
              </article>
            ))}
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {constructs.map((c) => (
              <Link
                key={c.id}
                href={L("/constructs")}
                className="flex items-start gap-3 sc-card p-4 transition hover:border-line-strong"
                style={{ boxShadow: `inset 3px 0 0 ${c.color}` }}
              >
                <span
                  className="mt-0.5 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[0.65rem] font-bold text-white"
                  style={{ background: c.color }}
                  aria-hidden
                >
                  {c.name.slice(0, 1)}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ink">{t(c.name)}</p>
                  <p className="mt-0.5 text-xs leading-snug text-slate">
                    {t(c.tagline)}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <Button href={L("/the-model")} variant="primary">
              {t("The Super-Cube® model")}
            </Button>
            <Button href={L("/constructs")} variant="ghost">
              {t("Explore six faces")}
            </Button>
            <Button href={L("/why-leadership")} variant="ghost">
              {t("Why leadership for SDGs")}
            </Button>
          </div>
        </div>
      </section>

      {/* Sources */}
      <section className="border-t border-line bg-elevated py-10">
        <div className="container-site">
          <h2 className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted">
            {t("Sources")}
          </h2>
          <ul className="mt-4 space-y-2 text-sm text-slate">
            {leadershipChallengeSources.map((s) => (
              <li key={s.href}>
                <a
                  href={L(s.href)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-ink underline-offset-2 hover:underline"
                >
                  {t(s.label)}
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-4 max-w-3xl text-xs leading-relaxed text-muted">
            {t("Figures and themes are summarised from official UN SOFI and SDG publications for educational framing. Always consult the latest joint UN agency reports for full methodologies, country data, and updates. Super-Cube® does not claim UN endorsement.")}
          </p>
          <p className="mt-3 text-xs text-muted">
            {t("Also see")}{" "}
            <Link
              href={L("/why-leadership")}
              className="text-ink underline-offset-2 hover:underline"
            >
              {t("Why leadership")}
            </Link>
            ,{" "}
            <Link
              href={L("/research")}
              className="text-ink underline-offset-2 hover:underline"
            >
              {t("research")}
            </Link>
            {t(", and")}{" "}
            <Link
              href={L("/the-model")}
              className="text-ink underline-offset-2 hover:underline"
            >
              {t("the model")}
            </Link>
            .
          </p>
        </div>
      </section>

      <CTABanner t={t} L={L} />
    </>
  );
}
