import type { Metadata } from "next";
import Link from "next/link";
import { Button, CTABanner, PageHero, SectionHeading } from "@/components/ui";
import { constructs } from "@/lib/content";

export const metadata: Metadata = {
  title: "Six Constructs",
  description:
    "Explore Choices, Principles, Mental, Emotional, Physical, and Spiritual—the six faces of the Super-Cube® Leadership Model.",
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

      <section className="border-b border-[var(--line)] bg-paper py-8">
        <div className="container-site flex flex-wrap gap-2">
          {constructs.map((c) => (
            <a
              key={c.id}
              href={`#${c.id}`}
              className="rounded-full border border-[var(--line-strong)] bg-cream px-3.5 py-1.5 text-sm font-medium text-ink transition hover:border-ink hover:bg-ink hover:text-cream"
            >
              {c.name}
            </a>
          ))}
        </div>
      </section>

      <section className="section-pad">
        <div className="container-site space-y-20">
          {constructs.map((c, index) => (
            <article
              key={c.id}
              id={c.id}
              className="scroll-mt-28 grid gap-8 lg:grid-cols-12 lg:gap-12"
            >
              <div className="lg:col-span-4">
                <div
                  className="inline-flex h-14 w-14 items-center justify-center rounded-2xl text-xl font-bold text-white shadow-md"
                  style={{ background: c.color }}
                >
                  {String(index + 1).padStart(2, "0")}
                </div>
                <h2 className="heading-lg mt-5 text-ink">{c.name}</h2>
                <p className="mt-2 font-medium" style={{ color: c.color }}>
                  {c.tagline}
                </p>
                {c.qualitativeShare && (
                  <p className="mt-4 text-sm text-muted">
                    Qualitative prominence in validation interviews:{" "}
                    <strong className="text-ink">{c.qualitativeShare}</strong>
                  </p>
                )}
              </div>

              <div className="lg:col-span-8">
                <div
                  className="rounded-[var(--radius-lg)] border border-[var(--line)] p-6 md:p-8"
                  style={{ background: c.colorSoft }}
                >
                  <p className="text-lg leading-relaxed text-ink/90">
                    {c.description}
                  </p>

                  <h3 className="mt-8 text-xs font-semibold uppercase tracking-[0.14em] text-ink/60">
                    Core elements
                  </h3>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {c.elements.map((el) => (
                      <li
                        key={el}
                        className="rounded-full bg-paper/80 px-3.5 py-1.5 text-sm font-medium text-ink shadow-sm"
                      >
                        {el}
                      </li>
                    ))}
                  </ul>

                  <h3 className="mt-8 text-xs font-semibold uppercase tracking-[0.14em] text-ink/60">
                    Theoretical grounding
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink/75">
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
