import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Button, CTABanner, PageHero, SectionHeading } from "@/components/ui";
import { constructs } from "@/lib/content";
import { interventionGains } from "@/lib/impact";

export const metadata: Metadata = {
  title: "Six faces",
  description:
    "Explore Choices, Principles, Mental, Emotional, Physical, and Spiritual—the six faces of the Super-Cube® Leadership Model. Jump to Principles for character components.",
};

const media: Record<
  string,
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

export default function ConstructsPage() {
  return (
    <>
      <PageHero
        eyebrow="The six faces"
        title="Human-centric constructs. Developable skills."
        description="Each face of the Super-Cube® is a coherent domain of leadership practice—grounded in theory, validated in research, and designed for deliberate growth. Use the jump links below (or header → Six faces) to open Principles, Choices, and the rest."
      >
        <Button href="/learn/start" variant="primary">
          Start free baseline
        </Button>
        <Button href="/the-model" variant="ghost">
          How the model works
        </Button>
      </PageHero>

      {/* Sticky jump bar — Principles etc. always one click away */}
      <section className="sticky top-14 z-40 border-b border-black/[0.06] bg-white/95 py-3 backdrop-blur-md md:top-16">
        <div className="container-site">
          <p className="mb-2 text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-muted">
            Jump to a face
          </p>
          <div className="flex flex-wrap gap-2">
            {constructs.map((c) => (
              <a
                key={c.id}
                href={`#${c.id}`}
                className="inline-flex items-center gap-2 rounded-full border border-black/[0.1] bg-white px-3.5 py-1.5 text-sm font-medium text-ink transition hover:border-ink hover:bg-ink hover:text-white"
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: c.color }}
                  aria-hidden
                />
                {c.name}
              </a>
            ))}
          </div>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-site space-y-24">
          {constructs.map((c, index) => {
            const gain = interventionGains.find((g) => g.constructId === c.id);
            return (
            <article
              key={c.id}
              id={c.id}
              className="scroll-mt-28 grid gap-8 lg:grid-cols-12 lg:gap-12"
            >
              <div className="lg:col-span-4">
                <div className="relative mb-5 h-16 w-16 overflow-hidden rounded-2xl bg-[#f4f4f4]">
                  <Image
                    src={media[c.id].icon}
                    alt={`${c.name} icon`}
                    fill
                    className="object-contain p-2"
                    sizes="64px"
                  />
                </div>
                <p className="text-sm font-semibold text-muted">
                  {String(index + 1).padStart(2, "0")}
                </p>
                <h2 className="heading-lg mt-2 text-ink">{c.name}</h2>
                <p className="mt-2 font-medium text-slate">{c.tagline}</p>
                {gain && (
                  <p className="mt-4 text-sm text-muted">
                    Average intervention improvement:{" "}
                    <strong className="text-ink">+{gain.gainPct}%</strong>
                  </p>
                )}
              </div>

              <div className="lg:col-span-8 space-y-4">
                <div className="relative aspect-[1441/630] w-full overflow-hidden rounded-2xl bg-[#f4f4f4]">
                  <Image
                    src={media[c.id].banner}
                    alt={`${c.name} construct`}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 66vw"
                  />
                  {media[c.id].quote && (
                    <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/65 via-black/25 to-transparent p-4 sm:p-6 md:p-8">
                      <blockquote className="max-w-3xl">
                        <p className="text-lg font-semibold leading-snug tracking-tight text-white drop-shadow-sm sm:text-xl md:text-2xl md:leading-snug lg:text-[1.75rem]">
                          “{media[c.id].quote}”
                        </p>
                        {media[c.id].attribution && (
                          <footer className="mt-2 text-xs font-semibold tracking-wide text-white/85 sm:mt-2.5 sm:text-sm">
                            — {media[c.id].attribution}
                          </footer>
                        )}
                      </blockquote>
                    </div>
                  )}
                </div>
                <div className="rounded-2xl border border-black/[0.08] bg-[#fafafa] p-6 md:p-8">
                  <p className="text-lg leading-relaxed text-ink/90">
                    {c.description}
                  </p>

                  <h3 className="mt-8 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                    Core elements
                  </h3>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {c.elements.map((el) => (
                      <li
                        key={el}
                        className="rounded-full border border-black/[0.08] bg-white px-3.5 py-1.5 text-sm font-medium text-ink"
                      >
                        {el}
                      </li>
                    ))}
                  </ul>

                  {c.keyComponents && c.keyComponents.length > 0 && (
                    <>
                      <h3 className="mt-8 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                        Key components
                      </h3>
                      <p className="mt-2 text-sm text-slate">
                        Character virtues that make principled leadership
                        concrete in daily behaviour.
                      </p>
                      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                        {c.keyComponents.map((comp) => (
                          <li
                            key={comp.name}
                            className="rounded-xl border border-black/[0.07] bg-white p-3.5 sm:p-4"
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

                  <h3 className="mt-8 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                    Theoretical grounding
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate">
                    {c.theory}
                  </p>
                </div>
              </div>
            </article>
            );
          })}
        </div>
      </section>

      <section className="section-pad border-t border-[var(--line)] bg-paper">
        <div className="container-site">
          <SectionHeading
            eyebrow="Integrated practice"
            title="No face stands alone."
            description="Mental and Emotional dimensions often dominate day-to-day leadership discourse—but Super-Cube® insists on balance. Choices without Principles erode trust. Vision without Physical resilience burns out. Purpose without Emotional intelligence fails to move people."
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {constructs.map((c) => (
              <Link
                key={c.id}
                href={`#${c.id}`}
                className="card-lift flex items-center gap-3 rounded-[var(--radius)] border border-[var(--line)] bg-cream p-4 shadow-[var(--shadow-sm)]"
              >
                <span
                  className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-black/[0.06]"
                  style={{ background: c.colorSoft }}
                >
                  <Image
                    src={media[c.id].icon}
                    alt=""
                    fill
                    className="object-contain p-1.5"
                    sizes="40px"
                  />
                </span>
                <span className="font-semibold text-ink">{c.name}</span>
                <span className="ml-auto text-xs text-muted">Jump ↑</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <CTABanner />
    </>
  );
}
