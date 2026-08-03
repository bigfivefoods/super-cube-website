import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ConstructFaceLabel,
  ConstructsHero,
} from "@/components/ConstructsHero";
import { Button, CTABanner } from "@/components/ui";
import { constructs, type ConstructId } from "@/lib/content";
import { interventionGains } from "@/lib/impact";

import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Six faces of leadership",
  description:
    "Explore Choices, Principles, Mental, Emotional, Physical, and Spiritual—the six Super-Cube® leadership constructs with overviews, key components, and research-backed development.",
  path: "/constructs",
  image: "/images/hero/hero-constructs.jpg",
  keywords: [
    "six faces of leadership",
    "leadership constructs",
    "emotional intelligence leadership Africa",
    "principled leadership",
  ],
});

const media: Record<
  ConstructId,
  { icon: string; banner: string; quote?: string; attribution?: string }
> = {
  choices: {
    icon: "/images/constructs/choices-icon.png",
    banner: "/images/constructs/choices-banner.jpg",
    quote:
      "The history of free men is never written by chance, but by choice—their choice.",
    attribution: "Dwight D. Eisenhower",
  },
  principles: {
    icon: "/images/constructs/principles-icon.png",
    banner: "/images/constructs/principles-banner.jpg",
    quote: "You must be the change you wish to see in the world.",
    attribution: "Mahatma Gandhi",
  },
  mental: {
    icon: "/images/constructs/mental-icon.png",
    banner: "/images/constructs/mental-banner.jpg",
    quote:
      "Imagination is more important than knowledge. Memory is past—it’s finite. Vision is future—it’s infinite.",
    attribution: "Albert Einstein",
  },
  emotional: {
    icon: "/images/constructs/emotional-icon.png",
    banner: "/images/constructs/emotional-banner.jpg",
    quote:
      "One of the most difficult things to give away is kindness, for it’s often returned.",
    attribution: "Mark Ortman",
  },
  physical: {
    icon: "/images/constructs/physical-icon.png",
    banner: "/images/constructs/physical-banner.jpg",
    quote: "Take care of your body. It’s the only place you have to live.",
    attribution: "Jim Rohn",
  },
  spiritual: {
    icon: "/images/constructs/spiritual-icon.png",
    banner: "/images/constructs/spiritual-banner.jpg",
    quote:
      "Example is not the main thing in influencing others. It is the only thing.",
    attribution: "Albert Schweitzer",
  },
};

/** Short compelling overview under each face name */
const overviews: Record<ConstructId, string> = {
  choices:
    "Leadership is a series of decisions under pressure. Choices trains you to decide with moral clarity, sound judgement, and calculated courage—so ambiguity becomes action, not freeze or flinch.",
  principles:
    "Trust is earned when power meets character. Principles turns ethics into lived practice—integrity you can see, fairness others can feel, and governance that holds when incentives pull the wrong way.",
  mental:
    "Strategy without clarity is noise. Mental builds the cognitive craft of leadership: seeing systems, setting vision, solving hard problems, and applying knowledge when the map no longer matches the terrain.",
  emotional:
    "People follow leaders who can read the room and themselves. Emotional intelligence converts feeling into connection—psychological safety, resilient teams, and influence that does not require fear.",
  physical:
    "Presence is not posture alone—it is energy, stamina, and the body as leadership signal. Physical develops the capacity to show up steady under load, so others experience reliability, not depletion.",
  spiritual:
    "Purpose is the quiet force that keeps effort meaningful. Spiritual leadership connects daily work to contribution beyond self—conviction, example, and a why strong enough to outlast a quarter.",
};

export default function ConstructsPage() {
  return (
    <>
      <ConstructsHero />

      {constructs.map((c, index) => {
        const m = media[c.id];
        const gain = interventionGains.find((g) => g.constructId === c.id);
        const next = constructs[(index + 1) % constructs.length]!;

        return (
          <article key={c.id} id={c.id} className="scroll-mt-0">
            {/* Full-bleed face hero */}
            <section className="relative isolate flex min-h-[100svh] min-h-[100dvh] w-full flex-col justify-end overflow-hidden">
              <Image
                src={m.banner}
                alt=""
                fill
                priority={index === 0}
                className="object-cover object-center"
                sizes="100vw"
              />
              <div
                className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/25"
                aria-hidden
              />
              <div
                className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent sm:via-black/20"
                aria-hidden
              />
              {/* Colour accent bar */}
              <div
                className="absolute inset-x-0 top-0 h-1 z-[2]"
                style={{ background: c.color }}
                aria-hidden
              />

              <div className="container-site relative z-[2] w-full pb-10 pt-[max(6rem,env(safe-area-inset-top))] sm:pb-14 md:pb-16">
                <div className="max-w-2xl md:max-w-[36rem] lg:max-w-[40rem]">
                  <ConstructFaceLabel
                    index={index}
                    constructId={c.id}
                    tagline={c.tagline}
                  />
                  {m.quote && (
                    <blockquote className="mt-6 border-l-2 pl-4 sm:mt-8" style={{ borderColor: c.color }}>
                      <p className="text-sm font-medium italic leading-relaxed text-white/90 sm:text-base">
                        “{m.quote}”
                      </p>
                      {m.attribution && (
                        <footer className="mt-2 text-xs font-semibold tracking-wide text-white/55">
                          — {m.attribution}
                        </footer>
                      )}
                    </blockquote>
                  )}
                  <a
                    href={`#${c.id}-detail`}
                    className="mt-8 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-white underline-offset-4 hover:underline"
                  >
                    Read overview
                    <span aria-hidden>↓</span>
                  </a>
                </div>
              </div>
            </section>

            {/* Detail panel — white + construct colour accents */}
            <section
              id={`${c.id}-detail`}
              className="scroll-mt-28 border-b border-black/[0.06] bg-white"
            >
              <div
                className="h-1 w-full"
                style={{ background: c.color }}
                aria-hidden
              />
              <div className="container-site section-pad">
                <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
                  {/* Overview column */}
                  <div className="lg:col-span-5">
                    <div className="flex items-center gap-3">
                      <span
                        className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl"
                        style={{ background: c.colorSoft }}
                      >
                        <Image
                          src={m.icon}
                          alt=""
                          width={36}
                          height={36}
                          className="object-contain p-1"
                        />
                      </span>
                      <div>
                        <p
                          className="text-[0.65rem] font-bold uppercase tracking-[0.14em]"
                          style={{ color: c.color }}
                        >
                          Overview
                        </p>
                        <h3 className="text-xl font-semibold tracking-tight text-ink sm:text-2xl">
                          Why {c.name} matters
                        </h3>
                      </div>
                    </div>
                    <p className="mt-5 text-base leading-relaxed text-slate sm:text-[1.0625rem]">
                      {overviews[c.id]}
                    </p>
                    <p className="mt-4 text-sm font-medium text-ink">
                      {c.summary}
                    </p>
                    {gain && (
                      <p
                        className="mt-6 inline-flex items-center rounded-full px-3.5 py-1.5 text-xs font-semibold text-white"
                        style={{ background: c.color }}
                      >
                        Research intervention gain · +{gain.gainPct}%
                      </p>
                    )}
                  </div>

                  {/* Deep content */}
                  <div className="lg:col-span-7">
                    <h3 className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-muted">
                      In depth
                    </h3>
                    <p className="mt-3 text-[0.975rem] leading-relaxed text-ink/90 sm:text-base">
                      {c.description}
                    </p>

                    <h3 className="mt-8 text-[0.65rem] font-bold uppercase tracking-[0.14em] text-muted">
                      Core elements
                    </h3>
                    <ul className="mt-3 flex flex-wrap gap-2">
                      {c.elements.map((el) => (
                        <li
                          key={el}
                          className="rounded-full border border-black/[0.08] bg-[#fafafa] px-3.5 py-1.5 text-sm font-medium text-ink"
                          style={{ boxShadow: `inset 0 0 0 1px ${c.color}22` }}
                        >
                          {el}
                        </li>
                      ))}
                    </ul>

                    {c.keyComponents && c.keyComponents.length > 0 && (
                      <>
                        <h3 className="mt-8 text-[0.65rem] font-bold uppercase tracking-[0.14em] text-muted">
                          Key components
                        </h3>
                        <p className="mt-2 text-sm text-slate">
                          Character virtues that make principled leadership
                          concrete in daily behaviour.
                        </p>
                        <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
                          {c.keyComponents.map((comp) => (
                            <li
                              key={comp.name}
                              className="rounded-xl bg-[#fafafa] p-3.5 sm:p-4"
                              style={{
                                boxShadow: `inset 3px 0 0 ${c.color}`,
                              }}
                            >
                              <p className="text-sm font-semibold tracking-tight text-ink">
                                {comp.name}
                              </p>
                              <p className="mt-1 text-[0.8125rem] leading-relaxed text-slate">
                                {comp.definition}
                              </p>
                            </li>
                          ))}
                        </ul>
                      </>
                    )}

                    <h3 className="mt-8 text-[0.65rem] font-bold uppercase tracking-[0.14em] text-muted">
                      Theoretical grounding
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-slate">
                      {c.theory}
                    </p>

                    <div className="mt-8 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
                      <Link
                        href={`/learn/courses/${c.id}`}
                        className="inline-flex min-h-11 items-center justify-center rounded-full px-5 text-sm font-semibold text-white transition hover:opacity-90"
                        style={{ background: c.color }}
                      >
                        Learn {c.name} in Super-Cube® Learn
                      </Link>
                      <Link
                        href={`#${next.id}`}
                        className="inline-flex min-h-11 items-center justify-center rounded-full border border-black/[0.12] bg-white px-5 text-sm font-semibold text-ink transition hover:border-black/25"
                      >
                        Next · {next.name} →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </article>
        );
      })}

      <section className="section-pad border-t border-black/[0.06] bg-[#fafafa]">
        <div className="container-site max-w-3xl">
          <p className="text-[0.65rem] font-bold uppercase tracking-[0.14em] text-muted">
            Integrated practice
          </p>
          <h2 className="heading-lg mt-2 text-ink">No face stands alone.</h2>
          <p className="mt-4 text-base leading-relaxed text-slate sm:text-lg">
            Mental and Emotional often dominate day-to-day discourse—but
            Super-Cube® insists on balance. Choices without Principles erode
            trust. Vision without Physical resilience burns out. Purpose without
            Emotional intelligence fails to move people. Develop the whole cube.
          </p>
          <div className="mt-8 flex flex-wrap gap-2">
            {constructs.map((c) => (
              <a
                key={c.id}
                href={`#${c.id}`}
                className="inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-semibold text-white"
                style={{ background: c.color }}
              >
                {c.name}
              </a>
            ))}
          </div>
          <div className="mt-8 flex flex-col gap-2.5 sm:flex-row">
            <Button href="/learn/start" variant="primary">
              Start free baseline
            </Button>
            <Button href="/the-model" variant="ghost">
              Back to the model
            </Button>
          </div>
        </div>
      </section>

      <CTABanner />
    </>
  );
}
