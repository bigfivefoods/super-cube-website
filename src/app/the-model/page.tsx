import type { Metadata } from "next";
import { LeadershipCircles } from "@/components/LeadershipCircles";
import { SuperCube } from "@/components/SuperCube";
import { Button, CTABanner, PageHero, SectionHeading } from "@/components/ui";
import { constructs, levels, theories } from "@/lib/content";

export const metadata: Metadata = {
  title: "The Model",
  description:
    "Understand the Super-Cube® Leadership Model—a multidimensional, human-centric framework with six constructs and you at the centre.",
};

export default function TheModelPage() {
  return (
    <>
      <PageHero
        eyebrow="The Super-Cube® Leadership Model"
        title="A multidimensional framework for developable leadership."
        description="Six human-centric constructs form the faces of a cube. The individual—you—stands at the centre. Leadership capacity radiates outward from personal practice to organisational and network impact."
        visual={
          <div className="mx-auto w-full max-w-[15rem] bg-white sm:max-w-[18rem] md:max-w-[19rem] lg:mx-0 lg:max-w-none">
            <SuperCube size="md" showSkills />
          </div>
        }
      >
        <Button href="/constructs" variant="primary">
          Meet the six constructs
        </Button>
        <Button href="/research" variant="ghost">
          See the evidence
        </Button>
      </PageHero>

      <section className="section-pad">
        <div className="container-site">
          <div className="prose-site mx-auto max-w-3xl">
            <SectionHeading
              eyebrow="Definition & purpose"
              title="Built for complex environments—starting with the person."
            />
            <p className="mt-6">
              The Super-Cube® Leadership Model is a multidimensional,
              human-centric leadership skills development framework. Its
              purpose is to build leadership capacity at individual,
              organisational, and network levels—enabling leaders to navigate
              distinctive business environments marked by growth, talent
              abundance alongside skills shortages, and institutional
              complexity.
            </p>
            <p>
              Developed in 2020 by Craig Ross Muller as the core output of his
              Doctor of Business Administration thesis at the University of
              KwaZulu-Natal, the model was empirically shaped within an African
              FMCG business-network and is among the first frameworks of its
              kind validated in that context.
            </p>
          </div>
        </div>
      </section>

      <section className="section-pad border-y border-[var(--line)] bg-paper">
        <div className="container-site">
          <SectionHeading
            eyebrow="Cubic structure"
            title="Geometry that teaches balance."
            description="The cube is not decoration—it is a teaching tool. Six faces, one centre, continuous interdependence. Leadership begins with you, then expands through the people and systems you touch."
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
                  {card.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-slate">
                  {card.body}
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
                {c.name}
              </span>
            ))}
          </div>

          <div className="mt-14">
            <div className="mb-8 max-w-2xl">
              <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted">
                Expanding leadership circles
              </p>
              <h3 className="mt-2 heading-md text-[1.5rem] text-ink sm:text-[1.75rem]">
                From you at the centre, outward.
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-slate sm:text-base">
                The geometry of Super-Cube® is personal first: you develop the
                six faces. That capacity does not stay private—it radiates into
                the circles of life where leadership is actually lived.
              </p>
            </div>
            <LeadershipCircles />
          </div>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-site grid gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading
              eyebrow="Philosophy"
              title="I–Thou: people as whole beings."
            />
            <div className="prose-site mt-6">
              <p>
                Super-Cube® is philosophically grounded in Martin Buber’s{" "}
                <em>I–Thou</em> philosophy, which emphasises mutual respect and
                encounters between equals who recognise each other’s
                psychological, intellectual, emotional, and spiritual
                attributes.
              </p>
              <p>
                Leadership is framed as a process that values people as
                multidimensional “Thous” rather than objects—capable of leading
                and following in different contexts. This human-centric stance
                underpins every construct and every level of application.
              </p>
            </div>
          </div>
          <div>
            <SectionHeading
              eyebrow="Learning theory"
              title="How development actually happens."
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
                  <h3 className="font-semibold text-ink">{dim.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate">
                    {dim.body}
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-5 text-sm text-muted">
              Guided by Knud Illeris’s three-dimensional learning theory.
            </p>
          </div>
        </div>
      </section>

      <section className="section-pad border-t border-[var(--line)] bg-ink text-cream">
        <div className="container-site">
          <SectionHeading
            eyebrow="Theoretical foundations"
            title="Integrated leadership theories."
            description="Super-Cube® synthesises established traditions into one multidimensional foundation suited to dynamic business networks."
            light
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {theories.map((t) => (
              <div
                key={t.name}
                className="rounded-[var(--radius)] border border-white/10 bg-white/5 p-5 backdrop-blur"
              >
                <h3 className="font-semibold text-cream">{t.name}</h3>
                <p className="mt-2 text-sm text-cream/55">{t.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad bg-paper">
        <div className="container-site">
          <SectionHeading
            eyebrow="Progressive application"
            title="Five levels of leadership capacity building."
            description="The same six constructs scale—from a personal development plan to sector-wide programmes."
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
                    {level.title}
                  </h3>
                  <p className="mt-1 text-sm font-medium uppercase tracking-wider text-muted">
                    {level.subtitle}
                  </p>
                </div>
                <p className="text-slate leading-relaxed">{level.description}</p>
                {i === levels.length - 1 && (
                  <div className="md:col-span-3 border-b border-[var(--line)]" />
                )}
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Button href="/programs" variant="primary">
              Explore programs
            </Button>
          </div>
        </div>
      </section>

      <CTABanner />
    </>
  );
}
