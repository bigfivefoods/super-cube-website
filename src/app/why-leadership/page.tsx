import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Button, CTABanner, PageHero, SectionHeading } from "@/components/ui";
import { constructs } from "@/lib/content";
import {
  leadershipForSdgs,
  sdgGoals,
  sdgHeadlineStats,
  sdgPressurePoints,
  sdgSources,
} from "@/lib/sdgs";

export const metadata: Metadata = {
  title: "Why Leadership Matters",
  description:
    "Why human-centric leadership is essential for the UN Sustainable Development Goals—and how Super-Cube® develops leaders who can deliver.",
};

function goalById(id: number) {
  return sdgGoals.find((g) => g.id === id)!;
}

export default function WhyLeadershipPage() {
  return (
    <>
      <PageHero
        eyebrow="Why · Super-Cube®"
        title="The world has goals. It needs leaders who can deliver them."
        description="The UN Sustainable Development Goals (SDGs) are humanity’s shared agenda for people, planet, and prosperity. Progress is off track—not only for lack of money or technology, but for lack of human-centric leadership at every level."
        visual={
          <figure className="mx-auto w-full max-w-[17rem] bg-white sm:max-w-[19rem] lg:mx-0 lg:ml-auto lg:max-w-[22rem]">
            <div className="relative mx-auto aspect-[1280/811] w-full">
              <Image
                src="/images/sdgs/sdg-logo.png"
                alt="United Nations Sustainable Development Goals"
                fill
                className="object-contain object-center"
                sizes="(max-width: 1024px) 19rem, 22rem"
                priority
              />
            </div>
            <figcaption className="pt-3 text-center lg:text-right">
              <p className="text-[0.7rem] font-semibold tracking-tight text-ink">
                2030 Agenda · 17 Goals
              </p>
              <p className="mt-0.5 text-[0.65rem] leading-snug text-muted">
                One shared plan for people, planet, and prosperity.
              </p>
            </figcaption>
          </figure>
        }
      >
        <Button href="#sdgs" variant="primary">
          Explore the 17 SDGs
        </Button>
        <Button href="/learn" variant="ghost">
          Start developing leadership
        </Button>
      </PageHero>

      {/* Opening argument */}
      <section className="section-pad border-b border-black/[0.06] bg-white">
        <div className="container-site grid gap-10 lg:grid-cols-2 lg:items-start lg:gap-16">
          <div>
            <SectionHeading
              eyebrow="The leadership case"
              title="Development is a leadership challenge."
              description="Policies, capital, and innovation matter—but they do not implement themselves. Leaders set direction, build trust, make hard trade-offs, and sustain coalitions when conditions are messy."
            />
          </div>
          <div className="prose-site space-y-4 text-slate">
            <p>
              From classrooms to boardrooms, ministries to markets, leadership
              determines whether ambition becomes action. Super-Cube® starts
              with the individual—because systems change when people with
              agency, principles, and skill show up consistently.
            </p>
            <p>
              The 2030 Agenda asks for more than technical competence. It asks
              for leaders who can hold complexity (Choices), earn trust
              (Principles), think in systems (Mental), mobilise people
              (Emotional), sustain energy (Physical), and serve a purpose larger
              than themselves (Spiritual).
            </p>
            <p className="text-sm text-muted">
              Below: the latest global picture on SDG progress, the 17 Goals,
              and why leadership capacity is central to closing the gap.
            </p>
          </div>
        </div>
      </section>

      {/* Headline stats */}
      <section className="section-pad border-b border-black/[0.06] bg-[#fafafa]">
        <div className="container-site">
          <SectionHeading
            eyebrow="Latest global picture"
            title="The SDGs are not on track."
            description="Figures drawn from the UN Sustainable Development Goals Reports (2024 and 2025). They describe global trends—not a verdict on any single country."
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {sdgHeadlineStats.map((stat) => (
              <article
                key={stat.label}
                className="flex h-full flex-col rounded-2xl border border-black/[0.07] bg-white p-5 sm:p-6"
              >
                <p className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                  {stat.value}
                </p>
                <p className="mt-2 text-sm font-semibold text-ink">{stat.label}</p>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-slate">
                  {stat.detail}
                </p>
                <p className="mt-4 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted">
                  {stat.source}
                </p>
              </article>
            ))}
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {sdgPressurePoints.map((p) => (
              <article
                key={p.title}
                className="rounded-2xl border border-black/[0.07] bg-white p-5 sm:p-6"
              >
                <h3 className="text-base font-semibold tracking-tight text-ink">
                  {p.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate">{p.body}</p>
                <p className="mt-3 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted">
                  {p.source}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 17 SDGs visual grid */}
      <section
        id="sdgs"
        className="section-pad scroll-mt-20 border-b border-black/[0.06] bg-white"
      >
        <div className="container-site">
          <SectionHeading
            eyebrow="The 17 Sustainable Development Goals"
            title="One agenda. Seventeen faces of progress."
            description="Adopted by UN Member States in 2015, the SDGs are a shared blueprint to end poverty, protect the planet, and ensure peace and prosperity by 2030. Each goal below uses its official UN colour."
          />

          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-4 xl:grid-cols-6">
            {sdgGoals.map((goal) => (
              <article
                key={goal.id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-black/[0.06] bg-white shadow-[0_1px_0_rgba(0,0,0,0.03)] transition hover:shadow-md"
              >
                {/* Official UN SDG icon */}
                <div className="relative aspect-square w-full overflow-hidden bg-white">
                  <Image
                    src={goal.icon}
                    alt={`SDG ${goal.id}: ${goal.short}`}
                    fill
                    className="object-cover object-center transition duration-300 group-hover:scale-[1.03]"
                    sizes="(max-width: 640px) 50vw, (max-width: 1280px) 25vw, 180px"
                  />
                </div>
                <div
                  className="flex flex-1 flex-col border-t border-black/[0.04] p-3 sm:p-3.5"
                  style={{ background: goal.soft }}
                >
                  <p
                    className="text-[0.65rem] font-bold uppercase tracking-[0.1em]"
                    style={{ color: goal.color }}
                  >
                    Goal {goal.id}
                  </p>
                  <p className="mt-1 text-sm font-semibold leading-snug tracking-tight text-ink">
                    {goal.short}
                  </p>
                  <p className="mt-1.5 text-[0.7rem] leading-snug text-slate sm:text-xs">
                    {goal.title}
                  </p>
                  <p
                    className="mt-2 text-[0.65rem] font-semibold uppercase tracking-[0.08em]"
                    style={{ color: goal.color }}
                  >
                    {goal.focus}
                  </p>
                </div>
              </article>
            ))}
          </div>

          <p className="mt-8 text-center text-xs text-muted">
            Official UN SDG icons, colours, and titles · 2030 Agenda
          </p>
        </div>
      </section>

      {/* Why leadership for SDGs */}
      <section className="section-pad border-b border-black/[0.06] bg-[#fafafa]">
        <div className="container-site">
          <SectionHeading
            eyebrow="Leadership × the SDGs"
            title="Why leadership is decisive for the Goals."
            description="The SDGs will not be achieved by reports alone. They require leaders who can choose wisely, govern fairly, think systemically, mobilise people, sustain effort, and stay anchored in purpose."
          />

          <div className="mt-10 space-y-4">
            {[
              {
                n: "01",
                title: "The goals are multi-stakeholder",
                body: "No single ministry, company, or NGO can deliver an SDG alone. Leadership is the skill of aligning diverse actors around shared outcomes—without erasing local context.",
              },
              {
                n: "02",
                title: "Trade-offs are the work",
                body: "Energy transition, food security, jobs, and equity often pull in different directions. Leaders must hold complexity, make values-explicit choices, and communicate them with integrity.",
              },
              {
                n: "03",
                title: "Trust is infrastructure",
                body: "Where institutions are weak or trust is thin, capital and cooperation stall. Principled, emotionally intelligent leadership rebuilds the social infrastructure SDG delivery depends on.",
              },
              {
                n: "04",
                title: "Long horizons need resilient people",
                body: "2030 is near; many goals need decades of follow-through. Physical and spiritual leadership—energy, meaning, and purpose—keep teams and communities in the work.",
              },
            ].map((item) => (
              <article
                key={item.n}
                className="grid gap-3 rounded-2xl border border-black/[0.07] bg-white p-5 sm:grid-cols-[4rem_1fr] sm:gap-6 sm:p-6"
              >
                <p className="font-display text-2xl text-muted">{item.n}</p>
                <div>
                  <h3 className="text-base font-semibold tracking-tight text-ink sm:text-lg">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate">
                    {item.body}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Super-Cube mapping */}
      <section className="section-pad border-b border-black/[0.06] bg-white">
        <div className="container-site">
          <SectionHeading
            eyebrow="Super-Cube® for sustainable development"
            title="Six faces of leadership for a 17-goal world."
            description="Human-centric leadership development is not a side programme to the SDGs—it is enabling infrastructure. Each Super-Cube® construct strengthens capabilities the Goals require."
          />

          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {leadershipForSdgs.map((row) => {
              const construct = constructs.find((c) => c.id === row.constructId)!;
              return (
                <article
                  key={row.constructId}
                  className="flex flex-col rounded-2xl border border-black/[0.07] bg-white p-5 sm:p-6"
                  style={{ boxShadow: `inset 3px 0 0 ${construct.color}` }}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className="rounded-full px-2.5 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider text-white"
                      style={{ background: construct.color }}
                    >
                      {construct.name}
                    </span>
                    <span className="text-xs font-medium text-muted">
                      {row.sdgHook}
                    </span>
                  </div>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-slate">
                    {row.body}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {row.sdgs.map((id) => {
                      const g = goalById(id);
                      return (
                        <span
                          key={id}
                          className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.65rem] font-semibold text-white"
                          style={{ background: g.color }}
                          title={g.short}
                        >
                          <span className="opacity-90">{id}</span>
                          <span className="hidden sm:inline">{g.short}</span>
                        </span>
                      );
                    })}
                  </div>
                </article>
              );
            })}
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <Button href="/constructs" variant="primary">
              Explore the six constructs
            </Button>
            <Button href="/learn" variant="ghost">
              Enter the learning pathway
            </Button>
            <Button href="/programs" variant="ghost">
              View programmes
            </Button>
          </div>
        </div>
      </section>

      {/* Closing call */}
      <section className="section-pad bg-[#fafafa]">
        <div className="container-site max-w-3xl text-center">
          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-muted">
            From goals to practice
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            Leadership is how the world keeps its promises.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate">
            The SDGs define <em>what</em> we must achieve. Super-Cube® develops
            the human capability for <em>how</em>—starting with you at the
            centre, then radiating through teams, organisations, and networks.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button href="/pricing" variant="primary">
              Start a programme
            </Button>
            <Button href="/contact" variant="ghost">
              Talk to us
            </Button>
          </div>
        </div>
      </section>

      {/* Sources */}
      <section className="border-t border-black/[0.06] bg-white py-10">
        <div className="container-site">
          <h2 className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted">
            Sources
          </h2>
          <ul className="mt-4 space-y-2 text-sm text-slate">
            {sdgSources.map((s) => (
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
            Statistics are summarised from official UN publications for
            educational framing on this site. Always consult the latest UN SDG
            reports for full methodologies, country data, and updates. Super-Cube®
            does not claim UN endorsement.
          </p>
          <p className="mt-3 text-xs text-muted">
            Also see{" "}
            <Link href="/research" className="text-ink underline-offset-2 hover:underline">
              Super-Cube® research
            </Link>{" "}
            and{" "}
            <Link href="/the-model" className="text-ink underline-offset-2 hover:underline">
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
