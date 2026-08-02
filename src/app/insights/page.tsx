import type { Metadata } from "next";
import Link from "next/link";
import { insightPosts } from "@/lib/insights";
import { Button, PageHero, SectionHeading } from "@/components/ui";

export const metadata: Metadata = {
  title: "Insights",
  description:
    "Essays on learnable leadership, Super-Cube® constructs, I–Thou practice, and SDG-linked development.",
};

export default function InsightsIndexPage() {
  return (
    <>
      <PageHero
        eyebrow="Content"
        title="Insights"
        description="Short, research-informed essays for leaders, L&D, and educators. Continuous publishing keeps Super-Cube® a living authority—not a static brochure."
      >
        <Button href="/research" variant="ghost">
          Research
        </Button>
        <Button href="/media" variant="ghost">
          Media kit
        </Button>
      </PageHero>

      <section className="section-pad bg-[#fafafa]">
        <div className="container-site">
          <SectionHeading title="Latest" />
          <ul className="mt-8 grid gap-4 md:grid-cols-2">
            {insightPosts.map((p) => (
              <li key={p.slug}>
                <Link
                  href={`/insights/${p.slug}`}
                  className="block h-full rounded-2xl border border-black/[0.08] bg-white p-5 transition hover:border-black/15 hover:shadow-sm sm:p-6"
                >
                  <p className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-muted">
                    {p.date} · {p.readingMinutes} min
                  </p>
                  <h2 className="mt-2 text-lg font-semibold tracking-tight text-ink">
                    {p.title}
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-slate">
                    {p.excerpt}
                  </p>
                  <p className="mt-3 text-sm font-semibold text-ink">Read →</p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
