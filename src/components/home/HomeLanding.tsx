import Image from "next/image";
import Link from "next/link";
import { SuperCube } from "@/components/SuperCube";
import { TestimonialsStrip } from "@/components/Testimonials";
import { Button, SectionHeading } from "@/components/ui";
import { bookingUrl } from "@/lib/booking";
import { constructs } from "@/lib/content";
import { COURSE_PRICE_USD, COURSE_PRICE_ZAR } from "@/lib/programmes";
import { SEAT_PACKS, formatSeatPackPrice } from "@/lib/seat-packs";

const steps = [
  {
    n: "1",
    title: "Measure",
    body: "Take a free 10-minute baseline. You get a score for each of the six faces of leadership, so you can see your strengths and gaps.",
  },
  {
    n: "2",
    title: "Practise",
    body: "Work through short sessions for your age group, with a weekly practice plan that starts with your weakest faces.",
  },
  {
    n: "3",
    title: "Prove",
    body: "Measure again. Your before-and-after report shows what changed, and your certificate has a public verify ID.",
  },
];

const audiences = [
  { label: "Ages 5–12", title: "Kids", body: "Character, curiosity and kindness, through stories and play.", href: "/what#kids" },
  { label: "Ages 13–21", title: "Teens", body: "Identity, influence and wise decisions for school, sport and first jobs.", href: "/what#adolescents" },
  { label: "Ages 22+", title: "Adults", body: "Human-centric leadership for work and life.", href: "/what#adults" },
  { label: "Teams", title: "Organisations", body: "Develop and measure leaders across a team, company or network.", href: "/organisations" },
  { label: "Classrooms", title: "Schools", body: "A leadership pathway for learners, with progress for teachers.", href: "/schools" },
];

const youGet = [
  "A free six-face leadership baseline",
  "Six short courses, written for your age group",
  "A weekly practice plan focused on your weakest faces",
  "A second assessment to measure the change",
  "A before-and-after growth report (PDF)",
  "A certificate with a public verify ID",
  "Private journals: a coach sees your scores only if you agree",
];

/**
 * Plain-language homepage: one big idea, who it's for, what you get, price,
 * then the free baseline. Deep theory lives on /research.
 */
export function HomeLanding() {
  const smallestPack = SEAT_PACKS[0];
  const booking = bookingUrl();

  return (
    <>
      {/* Hero */}
      <section className="page-hero page-hero--full page-hero--media relative isolate flex w-full overflow-hidden bg-void">
        <Image
          src="/images/hero/leadership-hero.jpg"
          alt=""
          fill
          className="object-cover object-center"
          sizes="100vw"
          priority
        />
        <div
          className="absolute inset-0 bg-gradient-to-r from-black/88 via-black/65 to-black/35 sm:via-black/55 sm:to-transparent"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30"
          aria-hidden
        />
        <div className="container-site page-hero__inner relative z-10 w-full pb-2">
          <div className="page-hero__copy max-w-2xl md:max-w-[38rem] lg:max-w-[42rem]">
            <p className="eyebrow eyebrow--on-dark before:bg-white/50">
              Super-Cube® leadership development
            </p>
            <h1 className="page-hero__title heading-xl mt-3 text-white sm:mt-4">
              Leadership is learnable—and we prove it.
            </h1>
            <p className="page-hero__lede mt-4 text-[0.9375rem] leading-relaxed tracking-tight text-white/85 sm:mt-5 sm:text-base md:text-lg lg:text-xl">
              Measure your leadership in 10 minutes. Practise the areas that
              need it most. Measure again, and see the change in a report you
              can share.
            </p>
            <div className="mt-6 flex w-full max-w-md flex-col gap-2.5 sm:mt-8 sm:max-w-none sm:flex-row sm:flex-wrap sm:gap-3">
              <Button
                href="/learn/start"
                variant="primary"
                className="w-full !bg-white !text-ink hover:!bg-white/90 sm:w-auto"
              >
                Start free baseline · 10 min
              </Button>
              <Button href="/sample-report" variant="light" className="w-full border-white/35 sm:w-auto">
                See a sample report
              </Button>
            </div>
            <p className="mt-5 text-[0.8125rem] leading-snug text-white/75 sm:mt-6 sm:text-sm">
              Built on doctoral research at the University of KwaZulu-Natal
              (DBA, 2021).
            </p>
          </div>
        </div>
      </section>

      {/* What it is */}
      <section className="section-pad bg-paper">
        <div className="container-site grid items-center gap-10 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-14">
          <div className="min-w-0">
            <SectionHeading
              eyebrow="What it is"
              title="A simple loop: measure, practise, prove."
              description="Super-Cube® looks at the whole leader, not one skill. It measures six faces: Choices, Principles, Mental, Emotional, Physical and Spiritual. Then it helps you grow the ones that matter most for you."
            />
            <ol className="mt-8 grid gap-3">
              {steps.map((s) => (
                <li key={s.n} className="flex gap-4 rounded-xl border border-line bg-surface p-4 sm:p-5">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-ink text-sm font-semibold text-bg">
                    {s.n}
                  </span>
                  <div>
                    <h3 className="text-base font-semibold tracking-tight text-ink">{s.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate">{s.body}</p>
                  </div>
                </li>
              ))}
            </ol>
            <ul className="mt-6 flex flex-wrap gap-2" aria-label="The six faces">
              {constructs.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/constructs#${c.id}`}
                    className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-line bg-elevated px-3 text-[0.8125rem] font-medium text-ink hover:border-ink/30"
                  >
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: c.color }} aria-hidden />
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex min-w-0 justify-center">
            <SuperCube showSkills={false} />
          </div>
        </div>
      </section>

      {/* Who it's for */}
      <section className="section-pad border-t border-line bg-surface">
        <div className="container-site">
          <SectionHeading
            eyebrow="Who it’s for"
            title="One model for every stage of life."
            description="The six faces stay the same as you grow. The language and examples change with your age and your world."
          />
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {audiences.map((a) => (
              <Link
                key={a.title}
                href={a.href}
                className="card-lift group flex flex-col rounded-2xl border border-line bg-elevated p-5"
              >
                <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted">
                  {a.label}
                </p>
                <h3 className="mt-1.5 text-lg font-semibold tracking-tight text-ink">{a.title}</h3>
                <p className="mt-1.5 flex-1 text-sm leading-relaxed text-slate">{a.body}</p>
                <span className="mt-4 text-sm font-semibold text-ink">Learn more →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* What you get + price */}
      <section className="section-pad border-t border-line bg-paper">
        <div className="container-site grid gap-10 lg:grid-cols-2 lg:gap-14">
          <div>
            <SectionHeading eyebrow="What you get" title="Everything you need to grow, and to show it." />
            <ul className="mt-6 space-y-2.5">
              {youGet.map((item) => (
                <li key={item} className="flex gap-3 text-sm leading-relaxed text-slate sm:text-base">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-ink" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-6 rounded-xl border border-dashed border-line-strong bg-surface p-4">
              <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted">
                Example only, not a real learner
              </p>
              <p className="mt-1 text-sm text-slate">
                A report might show an overall score moving from{" "}
                <strong className="text-ink">52 to 68</strong> (out of 100)
                after eight weeks. Your results will differ.{" "}
                <Link href="/sample-report" className="font-semibold text-ink underline underline-offset-2">
                  See the sample report
                </Link>
                .
              </p>
            </div>
          </div>
          <div>
            <SectionHeading eyebrow="Price" title="Start free. Pay once if you continue." />
            <div className="mt-6 grid gap-3">
              <div className="rounded-2xl border border-line bg-elevated p-5">
                <p className="text-sm font-semibold text-ink">Free baseline</p>
                <p className="mt-1 text-3xl font-semibold tracking-tight text-ink">R0</p>
                <p className="mt-1 text-sm text-slate">Your six-face scores in about 10 minutes. No card needed.</p>
              </div>
              <div className="rounded-2xl border border-line bg-elevated p-5">
                <p className="text-sm font-semibold text-ink">Full programme, per person</p>
                <p className="mt-1 text-3xl font-semibold tracking-tight text-ink">
                  R{COURSE_PRICE_ZAR}{" "}
                  <span className="text-base font-medium text-slate">once (about ${COURSE_PRICE_USD} USD)</span>
                </p>
                <p className="mt-1 text-sm text-slate">Courses, practice plan, second assessment, report and certificate. No subscription.</p>
              </div>
              <div className="rounded-2xl border border-line bg-elevated p-5">
                <p className="text-sm font-semibold text-ink">Groups, schools and organisations</p>
                <p className="mt-1 text-sm text-slate">
                  Seat packs from {formatSeatPackPrice(smallestPack)} for{" "}
                  {smallestPack.seats} learners, or ask us for a quote for a
                  full programme with facilitation and reporting.
                </p>
                <div className="mt-4 flex flex-col gap-2.5 sm:flex-row">
                  <Button href="/organisations" variant="ghost">For organisations</Button>
                  <Button href="/schools" variant="ghost">For schools</Button>
                </div>
              </div>
            </div>
            <p className="mt-4 text-sm">
              <Link href="/pricing" className="inline-flex min-h-6 items-center font-semibold text-ink underline underline-offset-2">
                See full pricing →
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* Research, briefly */}
      <section className="section-pad border-t border-line bg-surface">
        <div className="container-site grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-center">
          <SectionHeading
            eyebrow="The research"
            title="Tested before it was taught."
            description="Super-Cube® came out of Dr Craig Muller’s doctoral research at the University of KwaZulu-Natal (DBA, 2021). The model was tested with a survey of 132 employees and interviews with 10 senior leaders, and published in peer-reviewed journals."
          />
          <div className="flex flex-col gap-2.5 sm:flex-row lg:justify-end">
            <Button href="/research" variant="ghost">Read the research and theory →</Button>
            <Button href="/about" variant="ghost">About Dr Craig Muller</Button>
          </div>
        </div>
      </section>

      <TestimonialsStrip />

      {/* Final CTA */}
      <section className="section-pad">
        <div className="container-site">
          <div className="rounded-2xl bg-void px-6 py-10 text-void-fg sm:px-10 sm:py-14 dark:bg-elevated dark:ring-1 dark:ring-white/10">
            <p className="eyebrow eyebrow--on-dark">Next step</p>
            <h2 className="heading-lg mt-3 max-w-2xl text-void-fg">
              Start with a free 10-minute baseline.
            </h2>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-void-fg/80">
              See your six-face scores today. Leading a team or a school? Book a
              short call and we’ll plan a pilot with you.
            </p>
            <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
              <Link
                href="/learn/start"
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-black hover:bg-white/90"
              >
                Start free baseline
              </Link>
              <Link
                href={booking}
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/35 px-6 text-sm font-semibold text-white hover:bg-white/10"
              >
                Book a call
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
