import Link from "next/link";
import { SuperCube } from "@/components/SuperCube";
import { Button, CTABanner, Eyebrow, SectionHeading } from "@/components/ui";
import { constructs, levels, site, stats, theories } from "@/lib/content";

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-[var(--line)] bg-paper pt-28 pb-16 md:pt-36 md:pb-24">
        <div className="pointer-events-none absolute inset-0 grain" />
        <div className="pointer-events-none absolute -right-24 top-10 h-80 w-80 rounded-full bg-gold/15 blur-3xl" />
        <div className="pointer-events-none absolute -left-32 bottom-0 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="container-site relative grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-8">
          <div>
            <p className="eyebrow animate-fade-up">Leadership development</p>
            <h1 className="heading-xl mt-4 animate-fade-up delay-1 text-ink">
              Six faces of leadership.
              <span className="block text-slate">You at the centre.</span>
            </h1>
            <p className="mt-6 max-w-xl animate-fade-up delay-2 text-lg leading-relaxed text-slate md:text-xl">
              {site.description} Leadership is substantially developable—through
              deliberate practice, structured learning, and a model built for
              real organisational complexity.
            </p>
            <div className="mt-8 flex animate-fade-up delay-3 flex-wrap gap-3">
              <Button href="/the-model" variant="primary">
                Explore the model
              </Button>
              <Button href="/programs" variant="ghost">
                View programs
              </Button>
            </div>
            <p className="mt-8 animate-fade-up delay-4 text-sm text-muted">
              Empirically developed · University of KwaZulu-Natal · 2020
            </p>
          </div>

          <div className="relative flex animate-fade-up delay-2 justify-center lg:justify-end">
            <div className="absolute inset-0 m-auto h-56 w-56 rounded-full bg-gold/10 blur-2xl" />
            <SuperCube className="relative py-6" />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-[var(--line)] bg-cream">
        <div className="container-site grid grid-cols-2 gap-px bg-[var(--line)] md:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-cream px-5 py-8 md:px-6 md:py-10"
            >
              <p className="font-display text-3xl font-medium tracking-tight text-ink md:text-4xl">
                {stat.value}
              </p>
              <p className="mt-2 text-sm font-semibold text-ink">{stat.label}</p>
              <p className="mt-1 text-sm leading-snug text-muted">{stat.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Model overview */}
      <section className="section-pad">
        <div className="container-site grid gap-12 lg:grid-cols-2 lg:items-center">
          <SectionHeading
            eyebrow="The Super-Cube®"
            title="A cubic framework for whole-person leadership."
            description="Each face of the cube is a human-centric construct. Together they form an integrated system—with the individual at the centre—radiating outward from personal growth to organisational and network impact."
          />
          <div className="space-y-5 prose-site">
            <p>
              Born from doctoral research in an African FMCG business-network,
              Super-Cube® synthesises trait, relational, charismatic,
              evolutionary, and entrepreneurial leadership theory into a
              practical development framework.
            </p>
            <p>
              Philosophically grounded in Martin Buber’s{" "}
              <em>I–Thou</em> philosophy of mutual respect, it treats people as
              multidimensional beings—leaders and followers in different
              contexts—never as objects of control.
            </p>
            <Button href="/the-model" variant="ghost">
              Read the full model →
            </Button>
          </div>
        </div>
      </section>

      {/* Six constructs */}
      <section className="section-pad border-y border-[var(--line)] bg-paper">
        <div className="container-site">
          <SectionHeading
            eyebrow="Six constructs"
            title="Develop leadership across every face of the cube."
            description="Each construct is a developable set of capabilities—validated in practice and designed for deliberate growth."
          />

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {constructs.map((c, i) => (
              <Link
                key={c.id}
                href={`/constructs#${c.id}`}
                className="card-lift group relative overflow-hidden rounded-[var(--radius)] border border-[var(--line)] bg-cream p-6 shadow-[var(--shadow-sm)]"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div
                  className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold text-white shadow-sm"
                  style={{ background: c.color }}
                  aria-hidden
                >
                  {c.name.charAt(0)}
                </div>
                <h3 className="heading-md text-[1.35rem] text-ink group-hover:text-ink-soft">
                  {c.name}
                </h3>
                <p className="mt-1 text-sm font-medium text-gold">{c.tagline}</p>
                <p className="mt-3 text-sm leading-relaxed text-slate">
                  {c.summary}
                </p>
                <span className="mt-5 inline-flex text-sm font-semibold text-ink opacity-70 transition group-hover:opacity-100">
                  Explore construct →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Developable thesis */}
      <section className="section-pad">
        <div className="container-site">
          <div className="grid gap-10 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--line)] bg-ink md:grid-cols-2">
            <div className="p-8 md:p-12">
              <Eyebrow>Core belief</Eyebrow>
              <h2 className="heading-lg mt-3 text-cream">
                Leadership is largely learnable.
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-cream/70">
                Super-Cube® holds that roughly{" "}
                <strong className="font-semibold text-gold-bright">
                  70–76% of leadership capacity
                </strong>{" "}
                is developable through deliberate practice, experience, and
                structured intervention—not fixed by heredity alone.
              </p>
              <p className="mt-4 leading-relaxed text-cream/60">
                Development follows Illeris’s three-dimensional learning
                theory: content (knowledge & skills), incentive (motivation &
                emotion), and interaction (social application in context).
              </p>
            </div>
            <div className="flex flex-col justify-center gap-4 border-t border-white/10 bg-ink-soft/50 p-8 md:border-t-0 md:border-l md:p-12">
              {theories.map((t) => (
                <div
                  key={t.name}
                  className="flex items-start gap-3 border-b border-white/10 pb-4 last:border-0 last:pb-0"
                >
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                  <div>
                    <p className="font-semibold text-cream">{t.name}</p>
                    <p className="text-sm text-cream/55">{t.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Progressive levels */}
      <section className="section-pad border-t border-[var(--line)] bg-paper">
        <div className="container-site">
          <SectionHeading
            eyebrow="Scale of impact"
            title="From personal plans to industry reach."
            description="Capacity building radiates outward—strong individuals first, then organisations, networks, and sectors."
          />

          <ol className="mt-12 grid gap-4 md:grid-cols-5">
            {levels.map((level) => (
              <li
                key={level.level}
                className="relative rounded-[var(--radius)] border border-[var(--line)] bg-cream p-5 shadow-[var(--shadow-sm)]"
              >
                <span className="font-display text-3xl font-medium text-gold">
                  {String(level.level).padStart(2, "0")}
                </span>
                <h3 className="mt-3 font-semibold text-ink">{level.title}</h3>
                <p className="mt-1 text-xs font-medium uppercase tracking-wider text-muted">
                  {level.subtitle}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-slate">
                  {level.description}
                </p>
              </li>
            ))}
          </ol>

          <div className="mt-10">
            <Button href="/programs" variant="primary">
              See how programs work
            </Button>
          </div>
        </div>
      </section>

      {/* Research strip */}
      <section className="section-pad">
        <div className="container-site grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center">
          <SectionHeading
            eyebrow="Evidence"
            title="Built through rigorous mixed-methods research."
            description="Validated with confirmatory factor analysis and senior-leader thematic interviews—designed for practical utility in complex business networks."
          />
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              {
                k: "132",
                v: "Employees surveyed",
                d: "Structural validity across six constructs",
              },
              {
                k: "10",
                v: "Senior interviews",
                d: "Thematic validation of lived practice",
              },
              {
                k: "0.86",
                v: "CFI model fit",
                d: "Acceptable confirmatory factor analysis",
              },
              {
                k: "α",
                v: "Reliable scales",
                d: "Cronbach’s alpha 0.60–0.80 across constructs",
              },
            ].map((item) => (
              <div
                key={item.v}
                className="rounded-[var(--radius)] border border-[var(--line)] bg-paper p-5"
              >
                <p className="font-display text-3xl text-gold">{item.k}</p>
                <p className="mt-1 font-semibold text-ink">{item.v}</p>
                <p className="mt-1 text-sm text-muted">{item.d}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="container-site mt-8">
          <Button href="/research" variant="ghost">
            Explore the research →
          </Button>
        </div>
      </section>

      <CTABanner />
    </>
  );
}
