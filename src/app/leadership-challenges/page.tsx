import type { Metadata } from "next";
import Image from "next/image";
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
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Leadership challenges · UN SDGs & SOFI",
  description:
    "How Super-Cube® leadership development addresses challenges across all 17 UN SDGs—anchored in the UN SOFI report on food security and nutrition.",
  path: "/leadership-challenges",
  image: "/images/hero/hero-sdg.jpg",
  keywords: [
    "leadership challenges SDGs",
    "SOFI food security leadership",
    "UN SDG leadership development",
    "Super-Cube SDGs",
  ],
});

function goalById(id: number) {
  return sdgGoals.find((g) => g.id === id)!;
}

function faceLabel(id: string) {
  return constructs.find((c) => c.id === id)?.name ?? id;
}

function faceColor(id: string) {
  return constructs.find((c) => c.id === id)?.color ?? "#666";
}

export default function LeadershipChallengesPage() {
  return (
    <>
      <PageHero
        theme="sdg"
        eyebrow="Leadership challenges"
        title="Seventeen goals. One leadership gap."
        description="The UN SOFI report shows food systems—and with them much of the 2030 Agenda—are stuck on delivery, coordination, and equity. Super-Cube® develops the whole-person leaders those challenges demand."
      >
        <Button href="/learn/start" variant="primary">
          Start free
        </Button>
        <Button href="/why-leadership" variant="ghost">
          Why leadership
        </Button>
      </PageHero>

      {/* SOFI evidence band */}
      <section className="section-pad border-b border-line bg-surface">
        <div className="container-site">
          <SectionHeading
            eyebrow="Evidence · UN SOFI"
            title={sofiSnapshot.title}
            description={sofiSnapshot.summary}
          />

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {sofiSnapshot.keyStats.map((stat) => (
              <article
                key={stat.label}
                className="flex h-full flex-col rounded-2xl border border-line bg-elevated p-5 sm:p-6"
              >
                <p className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                  {stat.value}
                </p>
                <p className="mt-2 text-sm font-semibold text-ink">
                  {stat.label}
                </p>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-slate">
                  {stat.note}
                </p>
              </article>
            ))}
          </div>

          <div className="mt-8 rounded-2xl border border-line bg-elevated p-5 sm:p-6">
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted">
              SOFI themes
            </p>
            <ul className="mt-4 flex flex-wrap gap-2">
              {sofiSnapshot.themes.map((theme) => (
                <li
                  key={theme}
                  className="rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-medium text-ink sm:text-sm"
                >
                  {theme}
                </li>
              ))}
            </ul>
            <p className="mt-5 text-sm leading-relaxed text-slate">
              Food security is tightly coupled to poverty, health, education,
              climate, peace, and partnerships. Closing SOFI gaps is therefore
              closing leadership and delivery gaps across the full SDG agenda.
            </p>
            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm">
              {sofiSnapshot.sources.map((s) => (
                <a
                  key={s.href}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-ink underline-offset-2 hover:underline"
                >
                  {s.label} ↗
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
            eyebrow="The Super-Cube® thesis"
            title="Development gaps are leadership capacity gaps."
          />
          <p className="mt-6 text-base leading-relaxed text-slate sm:text-lg">
            {leadershipChallengeThesis}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href="/the-model" variant="primary">
              Explore the model
            </Button>
            <Button href="/constructs" variant="ghost">
              Six faces
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
            eyebrow="All 17 Sustainable Development Goals"
            title="Issue by goal. Capacity Super-Cube® builds."
            description="Each card states a concrete challenge, how Super-Cube® develops the leadership needed, and which faces of the model carry the load. SOFI and food-system links appear where evidence is strongest."
          />

          <div className="mt-10 space-y-5">
            {sdgChallenges.map((row) => {
              const goal = goalById(row.id);
              return (
                <article
                  key={row.id}
                  className="overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_1px_0_rgba(0,0,0,0.03)] dark:shadow-none"
                >
                  <div className="grid gap-0 md:grid-cols-[minmax(0,11rem)_1fr]">
                    <div
                      className="relative flex flex-col items-center justify-center gap-3 border-b border-line p-5 md:border-b-0 md:border-r"
                      style={{
                        borderTopColor: goal.color,
                        boxShadow: `inset 0 3px 0 0 ${goal.color}`,
                      }}
                    >
                      <div className="relative aspect-square w-full max-w-[7.5rem] overflow-hidden rounded-xl border border-line bg-elevated">
                        <Image
                          src={goal.icon}
                          alt={`SDG ${goal.id}: ${goal.short}`}
                          fill
                          className="object-cover object-center"
                          sizes="120px"
                        />
                      </div>
                      <div className="text-center">
                        <p
                          className="text-[0.65rem] font-bold uppercase tracking-[0.12em]"
                          style={{ color: goal.color }}
                        >
                          Goal {goal.id}
                        </p>
                        <p className="mt-1 text-sm font-semibold tracking-tight text-ink">
                          {goal.short}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-4 p-5 sm:p-6">
                      <div>
                        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted">
                          Issue
                        </p>
                        <p className="mt-1.5 text-sm leading-relaxed text-slate">
                          {row.issue}
                        </p>
                      </div>

                      {row.sofiLink && (
                        <div className="rounded-xl border border-line bg-elevated px-4 py-3">
                          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted">
                            SOFI / food systems
                          </p>
                          <p className="mt-1.5 text-sm leading-relaxed text-slate">
                            {row.sofiLink}
                          </p>
                        </div>
                      )}

                      <div>
                        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted">
                          Leadership need
                        </p>
                        <p className="mt-1.5 text-sm leading-relaxed text-slate">
                          {row.leadershipNeed}
                        </p>
                      </div>

                      <div>
                        <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted">
                          How Super-Cube® helps
                        </p>
                        <p className="mt-1.5 text-sm leading-relaxed text-slate">
                          {row.superCubeHelp}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {row.faces.map((face) => (
                          <span
                            key={face}
                            className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[0.65rem] font-semibold text-white"
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
            Official UN SDG icons and titles · challenges framed for leadership
            development · Super-Cube® does not claim UN endorsement
          </p>
        </div>
      </section>

      {/* How Super-Cube helps overall */}
      <section className="section-pad border-b border-line bg-bg">
        <div className="container-site">
          <SectionHeading
            eyebrow="How Super-Cube® addresses the agenda"
            title="Capacity that compounds across goals."
            description="The six faces and multi-level model turn SDG ambition into developable human capability—measurable practice from the individual outward."
          />

          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {howSuperCubeAddresses.map((item) => (
              <article
                key={item.title}
                className="rounded-2xl border border-line bg-elevated p-5 sm:p-6"
              >
                <h3 className="text-base font-semibold tracking-tight text-ink sm:text-lg">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate">
                  {item.body}
                </p>
              </article>
            ))}
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {constructs.map((c) => (
              <Link
                key={c.id}
                href="/constructs"
                className="flex items-start gap-3 rounded-2xl border border-line bg-elevated p-4 transition hover:border-line-strong"
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
                  <p className="text-sm font-semibold text-ink">{c.name}</p>
                  <p className="mt-0.5 text-xs leading-snug text-slate">
                    {c.tagline}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <Button href="/the-model" variant="primary">
              The Super-Cube® model
            </Button>
            <Button href="/constructs" variant="ghost">
              Explore six faces
            </Button>
            <Button href="/why-leadership" variant="ghost">
              Why leadership for SDGs
            </Button>
          </div>
        </div>
      </section>

      {/* Sources */}
      <section className="border-t border-line bg-elevated py-10">
        <div className="container-site">
          <h2 className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted">
            Sources
          </h2>
          <ul className="mt-4 space-y-2 text-sm text-slate">
            {leadershipChallengeSources.map((s) => (
              <li key={s.href}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-ink underline-offset-2 hover:underline"
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-4 max-w-3xl text-xs leading-relaxed text-muted">
            Figures and themes are summarised from official UN SOFI and SDG
            publications for educational framing. Always consult the latest joint
            UN agency reports for full methodologies, country data, and updates.
            Super-Cube® does not claim UN endorsement.
          </p>
          <p className="mt-3 text-xs text-muted">
            Also see{" "}
            <Link
              href="/why-leadership"
              className="text-ink underline-offset-2 hover:underline"
            >
              Why leadership
            </Link>
            ,{" "}
            <Link
              href="/research"
              className="text-ink underline-offset-2 hover:underline"
            >
              research
            </Link>
            , and{" "}
            <Link
              href="/the-model"
              className="text-ink underline-offset-2 hover:underline"
            >
              the model
            </Link>
            .
          </p>
        </div>
      </section>

      <CTABanner />
    </>
  );
}
