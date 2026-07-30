import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Button, CTABanner, PageHero, SectionHeading } from "@/components/ui";
import { constructs } from "@/lib/content";

export const metadata: Metadata = {
  title: "Six Constructs",
  description:
    "Explore Choices, Principles, Mental, Emotional, Physical, and Spiritual—the six faces of the Super-Cube® Leadership Model.",
};

const media: Record<string, { icon: string; banner: string }> = {
  choices: {
    icon: "/images/constructs/choices-icon.png",
    banner: "/images/constructs/choices-banner.jpg",
  },
  principles: {
    icon: "/images/constructs/principles-icon.png",
    banner: "/images/constructs/principles-banner.jpg",
  },
  mental: {
    icon: "/images/constructs/mental-icon.png",
    banner: "/images/constructs/mental-banner.jpg",
  },
  emotional: {
    icon: "/images/constructs/emotional-icon.png",
    banner: "/images/constructs/emotional-banner.jpg",
  },
  physical: {
    icon: "/images/constructs/physical-icon.png",
    banner: "/images/constructs/physical-banner.jpg",
  },
  spiritual: {
    icon: "/images/constructs/spiritual-icon.png",
    banner: "/images/constructs/spiritual-banner.jpg",
  },
};

export default function ConstructsPage() {
  return (
    <>
      <PageHero
        eyebrow="The six faces"
        title="Human-centric constructs. Developable skills."
        description="Each face of the Super-Cube® is a coherent domain of leadership practice—grounded in theory, validated in research, and designed for deliberate growth."
      >
        <Button href="/programs" variant="primary">
          Develop these capabilities
        </Button>
      </PageHero>

      <section className="border-b border-black/[0.06] bg-white py-8">
        <div className="container-site flex flex-wrap gap-2">
          {constructs.map((c) => (
            <a
              key={c.id}
              href={`#${c.id}`}
              className="inline-flex items-center gap-2 rounded-full border border-black/[0.1] bg-white px-3.5 py-1.5 text-sm font-medium text-ink transition hover:border-ink hover:bg-ink hover:text-white"
            >
              <span className="relative h-5 w-5 overflow-hidden rounded">
                <Image
                  src={media[c.id].icon}
                  alt=""
                  fill
                  className="object-contain"
                  sizes="20px"
                />
              </span>
              {c.name}
            </a>
          ))}
        </div>
      </section>

      <section className="section-pad">
        <div className="container-site space-y-24">
          {constructs.map((c, index) => (
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
                {c.qualitativeShare && (
                  <p className="mt-4 text-sm text-muted">
                    Qualitative prominence in validation interviews:{" "}
                    <strong className="text-ink">{c.qualitativeShare}</strong>
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

                  <h3 className="mt-8 text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                    Theoretical grounding
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate">
                    {c.theory}
                  </p>
                </div>
              </div>
            </article>
          ))}
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
                  className="h-3 w-3 shrink-0 rounded-full"
                  style={{ background: c.color }}
                />
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
