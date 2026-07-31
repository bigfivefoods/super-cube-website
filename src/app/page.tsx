import Image from "next/image";
import Link from "next/link";
import { SuperCube } from "@/components/SuperCube";
import { TestimonialsStrip } from "@/components/Testimonials";
import { Button, CTABanner, Eyebrow, SectionHeading } from "@/components/ui";
import { constructs, levels, site, stats, theories } from "@/lib/content";

const constructIcons: Record<string, string> = {
  choices: "/images/constructs/choices-icon.png",
  principles: "/images/constructs/principles-icon.png",
  mental: "/images/constructs/mental-icon.png",
  emotional: "/images/constructs/emotional-icon.png",
  physical: "/images/constructs/physical-icon.png",
  spiritual: "/images/constructs/spiritual-icon.png",
};

export default function HomePage() {
  return (
    <>
      {/* Full-viewport hero — shared page-hero rhythm */}
      <section className="page-hero page-hero--full page-hero--media relative isolate flex w-full overflow-hidden bg-ink">
        <Image
          src="/images/hero/leadership-hero.jpg"
          alt="Super-Cube® leadership development"
          fill
          className="object-cover object-center"
          sizes="100vw"
          priority
        />
        <div
          className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/25 sm:via-black/45 sm:to-transparent"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/25 sm:from-black/45 sm:to-black/20"
          aria-hidden
        />

        <div className="container-site page-hero__inner relative z-10 w-full pb-2">
          <div className="page-hero__copy animate-fade-up max-w-2xl md:max-w-[36rem] lg:max-w-[40rem]">
            <p className="eyebrow text-white/70 before:bg-white/50">
              Leadership development
            </p>
            <h1 className="page-hero__title heading-xl mt-3 text-white sm:mt-4">
              Six faces of leadership.
              <span className="mt-1 block text-white/70">
                You at the centre.
              </span>
            </h1>
            <p className="page-hero__lede mt-4 text-[0.9375rem] leading-relaxed tracking-tight text-white/80 sm:mt-5 sm:text-base md:text-lg lg:text-xl">
              {site.description} Leadership is substantially developable—through
              deliberate practice, structured learning, and a model built for
              real organisational complexity.
            </p>
            <div className="mt-6 flex w-full max-w-md flex-col gap-2.5 sm:mt-8 sm:max-w-none sm:flex-row sm:flex-wrap sm:gap-3">
              <Button
                href="/the-model"
                variant="primary"
                className="w-full !bg-white !text-ink hover:!bg-white/90 sm:w-auto"
              >
                Explore the model
              </Button>
              <Button
                href="/programs"
                variant="light"
                className="w-full border-white/35 sm:w-auto"
              >
                View programs
              </Button>
            </div>
            <p className="mt-6 text-[0.7rem] leading-snug text-white/55 sm:mt-8 sm:text-sm">
              Empirically developed · University of KwaZulu-Natal · 2020
            </p>
          </div>
        </div>
      </section>

      {/* Super-Cube interactive — below landing hero */}
      <section className="section-pad bg-white">
        <div className="container-site grid items-center gap-8 sm:gap-10 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] md:gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:gap-12 xl:gap-16">
          <div className="min-w-0 order-2 md:order-1">
            <SectionHeading
              eyebrow="The Super-Cube®"
              title="A cubic framework for whole-person leadership."
              description="Each face of the cube is a human-centric construct. Together they form an integrated system—with the individual at the centre—radiating outward from personal growth to organisational and network impact."
            />
            <div className="prose-site mt-5 space-y-4 sm:mt-6">
              <p>
                Born from doctoral research in an African FMCG business-network,
                Super-Cube® synthesises trait, relational, charismatic,
                evolutionary, and entrepreneurial leadership theory into a
                practical development framework.
              </p>
              <p>
                Philosophically grounded in Martin Buber’s <em>I–Thou</em>{" "}
                philosophy of mutual respect, it treats people as multidimensional
                beings—leaders and followers in different contexts—never as
                objects of control.
              </p>
            </div>
            <div className="mt-6 sm:mt-8">
              <Button href="/the-model" variant="ghost" className="w-full sm:w-auto">
                Read the full model →
              </Button>
            </div>
          </div>
          <div className="order-1 flex justify-center md:order-2 md:justify-end">
            <div className="w-full max-w-[15rem] bg-white sm:max-w-[18rem] md:max-w-[19rem] lg:max-w-[21rem]">
              <SuperCube size="md" showSkills />
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-black/[0.06] bg-[#fafafa]">
        <div className="container-site grid grid-cols-2 gap-px bg-black/[0.06] md:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-[#fafafa] px-3 py-6 sm:px-5 sm:py-10 md:px-6 md:py-12"
            >
              <p className="text-xl font-semibold tracking-tight text-ink sm:text-3xl md:text-4xl">
                {stat.value}
              </p>
              <p className="mt-1.5 text-xs font-semibold text-ink sm:mt-2 sm:text-sm">
                {stat.label}
              </p>
              <p className="mt-1 text-[0.75rem] leading-snug text-muted sm:text-sm">
                {stat.detail}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Six constructs */}
      <section className="section-pad border-y border-black/[0.06] bg-[#fafafa]">
        <div className="container-site">
          <SectionHeading
            eyebrow="Six constructs"
            title="Develop leadership across every face of the cube."
            description="Each construct is a developable set of capabilities—validated in practice and designed for deliberate growth."
          />

          <div className="mt-8 grid gap-3 sm:mt-12 sm:grid-cols-2 lg:mt-14 lg:grid-cols-3">
            {constructs.map((c) => (
              <Link
                key={c.id}
                href={`/constructs#${c.id}`}
                className="card-lift group relative overflow-hidden rounded-xl border border-black/[0.08] bg-white p-4 sm:p-5 md:p-6"
              >
                <div className="relative mb-5 h-12 w-12 overflow-hidden rounded-xl bg-[#f4f4f4]">
                  <Image
                    src={constructIcons[c.id]}
                    alt=""
                    fill
                    className="object-contain p-1.5"
                    sizes="48px"
                  />
                </div>
                <h3 className="text-xl font-semibold tracking-tight text-ink">
                  {c.name}
                </h3>
                <p className="mt-1 text-sm font-medium text-muted">{c.tagline}</p>
                <p className="mt-3 text-sm leading-relaxed text-slate">
                  {c.summary}
                </p>
                <span className="mt-6 inline-flex text-sm font-semibold text-ink opacity-50 transition group-hover:opacity-100">
                  Explore →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Developable thesis */}
      <section className="section-pad bg-white">
        <div className="container-site">
          <div className="grid gap-0 overflow-hidden rounded-xl border border-black/[0.08] sm:rounded-2xl md:grid-cols-2">
            <div className="bg-ink p-6 text-white sm:p-8 md:p-10 lg:p-12">
              <Eyebrow>Core belief</Eyebrow>
              <h2 className="heading-lg mt-3 text-white sm:mt-4">
                Leadership is largely learnable.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-white/65 sm:mt-5 sm:text-lg">
                Super-Cube® holds that roughly{" "}
                <strong className="font-semibold text-white">
                  70–76% of leadership capacity
                </strong>{" "}
                is developable through deliberate practice, experience, and
                structured intervention—not fixed by heredity alone.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-white/45 sm:mt-4 sm:text-base">
                Development follows Illeris’s three-dimensional learning
                theory: content, incentive, and interaction.
              </p>
            </div>
            <div className="flex flex-col justify-center gap-0 bg-white p-1 sm:p-2 md:p-4">
              {theories.map((t, i) => (
                <div
                  key={t.name}
                  className={`flex items-start gap-3 px-4 py-3.5 sm:px-6 sm:py-4 ${
                    i < theories.length - 1 ? "border-b border-black/[0.06]" : ""
                  }`}
                >
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-ink" />
                  <div>
                    <p className="font-semibold tracking-tight text-ink">
                      {t.name}
                    </p>
                    <p className="text-sm text-muted">{t.note}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Progressive levels */}
      <section className="section-pad border-t border-black/[0.06] bg-[#fafafa]">
        <div className="container-site">
          <SectionHeading
            eyebrow="Scale of impact"
            title="From personal plans to industry reach."
            description="Capacity building radiates outward—strong individuals first, then organisations, networks, and sectors."
          />

          <ol className="mt-8 grid gap-3 sm:mt-12 sm:grid-cols-2 lg:mt-14 lg:grid-cols-3 xl:grid-cols-5">
            {levels.map((level) => (
              <li
                key={level.level}
                className="relative rounded-xl border border-black/[0.08] bg-white p-4 sm:p-5"
              >
                <span className="text-xl font-semibold tracking-tight text-muted sm:text-2xl">
                  {String(level.level).padStart(2, "0")}
                </span>
                <h3 className="mt-2.5 text-[0.975rem] font-semibold tracking-tight text-ink sm:mt-3 sm:text-base">
                  {level.title}
                </h3>
                <p className="mt-1 text-[0.65rem] font-medium uppercase tracking-wider text-muted sm:text-[0.6875rem]">
                  {level.subtitle}
                </p>
                <p className="mt-2.5 text-sm leading-relaxed text-slate sm:mt-3">
                  {level.description}
                </p>
              </li>
            ))}
          </ol>

          <div className="mt-8 sm:mt-12">
            <Button href="/programs" variant="primary" className="w-full sm:w-auto">
              See how programs work
            </Button>
          </div>
        </div>
      </section>

      {/* Research strip */}
      <section className="section-pad bg-white">
        <div className="container-site grid gap-8 sm:gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:gap-12">
          <SectionHeading
            eyebrow="Evidence"
            title="Built through rigorous mixed-methods research."
            description="Validated with confirmatory factor analysis and senior-leader thematic interviews—designed for practical utility in complex business networks."
          />
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
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
                className="rounded-xl border border-black/[0.08] bg-[#fafafa] p-3.5 sm:p-5"
              >
                <p className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
                  {item.k}
                </p>
                <p className="mt-1 text-sm font-semibold tracking-tight text-ink sm:text-base">
                  {item.v}
                </p>
                <p className="mt-1 text-xs text-muted sm:text-sm">{item.d}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="container-site mt-8 sm:mt-10">
          <Button href="/research" variant="ghost" className="w-full sm:w-auto">
            Explore the research →
          </Button>
        </div>
      </section>

      <TestimonialsStrip />

      <CTABanner />
    </>
  );
}
