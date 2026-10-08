import Image from "next/image";
import Link from "next/link";
import { LatestNews } from "@/components/news/LatestNews";
import { SuperCube } from "@/components/SuperCube";
import { TestimonialsStrip } from "@/components/Testimonials";
import { Button, SectionHeading } from "@/components/ui";
import { bookingUrl } from "@/lib/booking";
import { BOOK } from "@/lib/book";
import { PaidBookCard } from "@/components/book/PaidBook";
import { COMPANY_PROFILE } from "@/lib/company-profile";
import { constructs } from "@/lib/content";
import { COURSE_PRICE_USD, COURSE_PRICE_ZAR } from "@/lib/programmes";
import { SEAT_PACKS, formatSeatPackPrice } from "@/lib/seat-packs";
import { EnglishOnly } from "@/components/EnglishOnly";
import { DEFAULT_LOCALE, faceI18n, isEnglishOnlyHref, localizedPath, translate, type Locale } from "@/lib/i18n";
import { DICTS } from "@/lib/i18n/dictionaries";
import { around, fill } from "@/lib/i18n/pages/format";
import { homeStrings } from "@/lib/i18n/pages/home";

/** Document with a download arrow (decorative: the link carries the name). */
function PdfDownloadIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className="h-4 w-4 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M12 11v6" />
      <path d="m9 14 3 3 3-3" />
    </svg>
  );
}

/**
 * Plain-language homepage: one big idea, who it's for, what you get, price,
 * then the free baseline. Deep theory lives on /research.
 */
export function HomeLanding({ locale = DEFAULT_LOCALE }: { locale?: Locale }) {
  const smallestPack = SEAT_PACKS[0];
  const booking = bookingUrl();
  const s = homeStrings(locale);
  const dict = DICTS[locale];
  // Links stay on this language where the page is translated; others go to English (hrefLang="en").
  const L = (href: string) => localizedPath(locale, href);
  const hl = (href: string) => (isEnglishOnlyHref(locale, href) ? "en" : undefined);
  /** The free book (PDF and /book) is English: hrefLang/lang "en" on translated pages. */
  const en = locale === DEFAULT_LOCALE ? undefined : "en";
  const steps = s.steps.map((x, i) => ({ n: String(i + 1), ...x }));
  const paths = [
    {
      key: "individuals",
      ...s.individuals,
      href: "/what",
      color: "#26408C",
      sub: [
        { label: s.individuals.kids, href: "/what#kids" },
        { label: s.individuals.teens, href: "/what#adolescents" },
        { label: s.individuals.adults, href: "/what#adults" },
      ],
    },
    {
      key: "organisations",
      ...s.organisations,
      href: "/organisations",
      color: "#16979A",
      sub: [
        { label: s.organisations.pilot, href: "/pilot-pack" },
        { label: s.organisations.speaking, href: "/speaking" },
      ],
    },
    {
      key: "schools",
      ...s.schools,
      href: "/schools",
      color: "#ED8F20",
      sub: [
        { label: s.schools.pricing, href: "/pricing" },
        { label: s.schools.sample, href: "/sample-report" },
      ],
    },
  ];
  const [exampleBefore, exampleAfter] = around(s.exampleBody, "score");

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
            <p className="eyebrow eyebrow--on-dark">{s.heroEyebrow}</p>
            <h1 className="page-hero__title heading-xl mt-3 text-white sm:mt-4">
              {s.heroTitle}
            </h1>
            <p className="page-hero__lede mt-4 text-[0.9375rem] leading-relaxed tracking-tight text-white/85 sm:mt-5 sm:text-base md:text-lg lg:text-xl">
              {s.heroLede}
            </p>
            <div className="mt-6 flex w-full max-w-md flex-col gap-2.5 sm:mt-8 sm:max-w-none sm:flex-row sm:flex-wrap sm:gap-3">
              <Button
                href="/learn/start"
                hrefLang={hl("/learn/start")}
                variant="primary"
                className="w-full !bg-white !text-ink hover:!bg-white/90 sm:w-auto"
              >
                {s.heroCtaBaseline}
              </Button>
              <Button
                href={COMPANY_PROFILE.href}
                hrefLang={locale === DEFAULT_LOCALE ? undefined : "en"}
                download
                variant="light"
                ariaLabel={translate(dict, "home.profileLabel", { pages: COMPANY_PROFILE.pages, size: COMPANY_PROFILE.size })}
                className="w-full flex-wrap gap-y-0.5 border-white/35 focus-visible:!outline-white sm:w-auto"
              >
                <PdfDownloadIcon />
                <span className="whitespace-nowrap">{translate(dict, "home.profileCta")}</span>
                <span className="whitespace-nowrap text-xs font-medium text-white/80">
                  {translate(dict, "home.profileMeta", { pages: COMPANY_PROFILE.pages })}
                </span>
              </Button>
              <Button
                href="/sample-report"
                hrefLang={hl("/sample-report")}
                variant="light"
                className="w-full border-white/35 sm:w-auto"
              >
                {s.heroCtaSample}
              </Button>
            </div>
            <p className="mt-5 text-[0.8125rem] leading-snug text-white/75 sm:mt-6 sm:text-sm">
              {s.heroResearch}
            </p>
          </div>
        </div>
      </section>

      {/* What it is */}
      <section className="section-pad bg-paper">
        <div className="container-site grid items-center gap-10 md:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-14">
          <div className="min-w-0">
            <SectionHeading
              eyebrow={s.whatEyebrow}
              title={s.whatTitle}
              description={s.whatDescription}
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
            <ul className="mt-6 flex flex-wrap gap-2" aria-label={s.facesLabel}>
              {constructs.map((c) => (
                <li key={c.id}>
                  <Link
                    href={L(`/constructs#${c.id}`)}
                    hrefLang={hl(`/constructs#${c.id}`)}
                    className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-line bg-elevated px-3 text-[0.8125rem] font-medium text-ink hover:border-ink/30"
                  >
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: c.color }} aria-hidden />
                    {faceI18n[c.id] ? translate(dict, faceI18n[c.id]) : c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex min-w-0 justify-center">
            {/* The 3D cube is an illustration with English face text (white on every face). */}
            <div lang={locale === DEFAULT_LOCALE ? undefined : "en"} dir="ltr" className="contents">
              <SuperCube size="md" showSkills />
            </div>
          </div>
        </div>
      </section>

      {/* Choose your path */}
      <section className="section-pad border-t border-line bg-surface">
        <div className="container-site">
          <SectionHeading
            eyebrow={s.pathEyebrow}
            title={s.pathTitle}
            description={s.pathDescription}
          />
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {paths.map((p) => (
              <div key={p.key} className="sc-card relative flex flex-col overflow-hidden p-6 sm:p-7">
                <span
                  className="absolute inset-x-0 top-0 h-1"
                  style={{ background: p.color }}
                  aria-hidden
                />
                <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted">
                  {p.label}
                </p>
                <h3 className="mt-2 text-xl font-semibold tracking-tight text-ink">{p.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-slate sm:text-[0.9375rem]">{p.body}</p>
                <ul className="mt-5 flex flex-wrap gap-2">
                  {p.sub.map((x) => (
                    <li key={x.href}>
                      <Link
                        href={L(x.href)}
                        hrefLang={hl(x.href)}
                        className="inline-flex min-h-9 items-center rounded-full border border-line px-3 text-[0.8125rem] font-medium text-ink hover:border-ink/30"
                      >
                        {x.label}
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link
                  href={L(p.href)}
                  hrefLang={hl(p.href)}
                  className="mt-6 inline-flex min-h-11 items-center justify-between rounded-full bg-ink px-5 text-sm font-semibold text-bg hover:opacity-90"
                >
                  {p.cta}
                  <span aria-hidden className="rtl:-scale-x-100">→</span>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What you get + price */}
      <section className="section-pad border-t border-line bg-paper">
        <div className="container-site grid gap-10 lg:grid-cols-2 lg:gap-14">
          <div>
            <SectionHeading eyebrow={s.getEyebrow} title={s.getTitle} />
            <ul className="mt-6 space-y-2.5">
              {s.youGet.map((item) => (
                <li key={item} className="flex gap-3 text-sm leading-relaxed text-slate sm:text-base">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-ink" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-6 rounded-xl border border-dashed border-line-strong bg-surface p-4">
              <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted">
                {s.exampleLabel}
              </p>
              <p className="mt-1 text-sm text-slate">
                {exampleBefore}
                <strong className="text-ink">{s.exampleScore}</strong>
                {exampleAfter}{" "}
                <Link
                  href={L("/sample-report")}
                  hrefLang={hl("/sample-report")}
                  className="font-semibold text-ink underline underline-offset-2"
                >
                  {s.exampleLink}
                </Link>
              </p>
            </div>
          </div>
          <div>
            <SectionHeading eyebrow={s.priceEyebrow} title={s.priceTitle} />
            <div className="mt-6 grid gap-3">
              <div className="sc-card p-5">
                <p className="text-sm font-semibold text-ink">{s.freeTitle}</p>
                <p className="mt-1 text-3xl font-semibold tracking-tight text-ink">R0</p>
                <p className="mt-1 text-sm text-slate">{s.freeBody}</p>
              </div>
              <div className="sc-card p-5">
                <p className="text-sm font-semibold text-ink">{s.fullTitle}</p>
                <p className="mt-1 text-3xl font-semibold tracking-tight text-ink">
                  R{COURSE_PRICE_ZAR}{" "}
                  <span className="text-base font-medium text-slate">{fill(s.fullOnce, { usd: COURSE_PRICE_USD })}</span>
                </p>
                <p className="mt-1 text-sm text-slate">{s.fullBody}</p>
              </div>
              <div className="sc-card p-5">
                <p className="text-sm font-semibold text-ink">{s.groupsTitle}</p>
                <p className="mt-1 text-sm text-slate">
                  {fill(s.groupsBody, { pack: formatSeatPackPrice(smallestPack), seats: smallestPack.seats })}
                </p>
                <div className="mt-4 flex flex-col gap-2.5 sm:flex-row">
                  <Button href="/organisations" hrefLang={hl("/organisations")} variant="ghost">
                    {s.forOrganisations}
                  </Button>
                  <Button href="/schools" hrefLang={hl("/schools")} variant="ghost">
                    {s.forSchools}
                  </Button>
                </div>
              </div>
            </div>
            <p className="mt-4 text-sm">
              <Link
                href={L("/pricing")}
                hrefLang={hl("/pricing")}
                className="inline-flex min-h-6 items-center gap-1 font-semibold text-ink underline underline-offset-2"
              >
                {s.fullPricing} <span aria-hidden className="rtl:-scale-x-100">→</span>
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* Research, briefly */}
      <section className="section-pad border-t border-line bg-surface">
        <div className="container-site grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-center">
          <SectionHeading
            eyebrow={s.researchEyebrow}
            title={s.researchTitle}
            description={s.researchDescription}
          />
          <div className="lg:justify-self-end">
            <div className="sc-card p-5">
              <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted">
                {s.researchCardLabel}
              </p>
              <div className="mt-2 grid grid-cols-2 gap-4">
                <div data-testid="home-results-overall">
                  <p className="text-3xl font-semibold tabular-nums tracking-tight text-ink" dir="ltr">+32.2%</p>
                  <p className="mt-0.5 text-sm text-slate">{s.researchOverall}</p>
                </div>
                <div data-testid="home-results-emotional">
                  <p className="text-3xl font-semibold tabular-nums tracking-tight text-ink" dir="ltr">+39.5%</p>
                  <p className="mt-0.5 text-sm text-slate">{s.researchEmotional}</p>
                </div>
              </div>
              <p className="mt-3 text-xs text-muted">
                {s.researchNote}
              </p>
              <p className="mt-3 text-sm">
                <Link
                  href="/news/twelve-weeks-six-faces-fmcg-leadership"
                  className="inline-flex min-h-6 items-center gap-1 font-semibold text-ink underline underline-offset-2"
                  data-testid="home-case-study-link"
                >
                  {s.readCaseStudy} <span aria-hidden className="rtl:-scale-x-100">→</span>
                </Link>
              </p>
            </div>
            <div className="mt-4 flex flex-col gap-2.5 sm:flex-row">
              <Button href="/research" hrefLang={hl("/research")} variant="ghost">
                {s.readResearch} <span aria-hidden className="rtl:-scale-x-100">→</span>
              </Button>
              <Button href="/about" hrefLang={hl("/about")} variant="ghost">
                {s.aboutCraig}
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Free book: the PDF and /book are English (hrefLang="en" on translated home pages). */}
      <section className="section-pad border-t border-line bg-paper" data-testid="home-book" aria-labelledby="home-book-title">
        <div className="container-site">
          <div className="sc-card relative grid items-center gap-8 overflow-hidden p-6 sm:grid-cols-[minmax(0,10rem)_minmax(0,1fr)] sm:p-8 md:grid-cols-[minmax(0,13rem)_minmax(0,1fr)] md:gap-10 lg:p-10">
            <span className="spectrum-rule absolute inset-x-0 top-0 h-1" aria-hidden />
            <div className="mx-auto w-36 sm:mx-0 sm:w-full">
              <Image
                src={BOOK.cover.src}
                width={BOOK.cover.width}
                height={BOOK.cover.height}
                alt={translate(dict, "home.bookCoverAlt")}
                sizes="(min-width: 768px) 208px, 160px"
                className="h-auto w-full rounded-md shadow-[0_18px_40px_-16px_rgba(0,0,0,0.5)] ring-1 ring-black/10 dark:ring-white/10"
              />
            </div>
            <div className="min-w-0">
              <p className="eyebrow">{translate(dict, "home.bookEyebrow")}</p>
              <h2 id="home-book-title" className="heading-lg mt-2.5 text-ink sm:mt-3">
                {translate(dict, "home.bookHeading")}
              </h2>
              <p className="mt-2 text-base font-semibold tracking-tight text-ink">
                {/* Book title: English, read left to right in every language */}
                <bdi lang={en} dir="ltr">
                  {BOOK.title}
                </bdi>
              </p>
              <p className="mt-3 text-base leading-relaxed text-slate sm:text-[1.0625rem]">
                {translate(dict, "home.bookBody")}
              </p>
              <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center">
                <Button
                  href={BOOK.href}
                  hrefLang={en}
                  download
                  variant="primary"
                  ariaLabel={translate(dict, "home.bookLabel", { pages: BOOK.pages, size: BOOK.size })}
                  className="flex-wrap gap-y-0.5"
                >
                  <PdfDownloadIcon />
                  <span className="whitespace-nowrap">{translate(dict, "home.bookCta")}</span>
                  <span className="whitespace-nowrap text-xs font-medium opacity-75">
                    {translate(dict, "home.bookMeta", { pages: BOOK.pages })}
                  </span>
                </Button>
                <Button href={BOOK.page} hrefLang={en} variant="ghost">
                  {translate(dict, "home.bookMore")} <span aria-hidden className="rtl:-scale-x-100">→</span>
                </Button>
                {locale !== DEFAULT_LOCALE && (
                  <span className="text-sm text-muted">{translate(dict, "home.bookLang")}</span>
                )}
              </div>
            </div>
          </div>
          {/* The comprehensive edition (paid): the Amazon button stays hidden until AMAZON_URL_TBD is live. */}
          <div className="mt-6">
            <PaidBookCard
              testId="home-paid-book"
              eyebrow={translate(dict, "home.paidEyebrow")}
              body={translate(dict, "home.paidBody")}
              moreLabel={translate(dict, "home.paidMore")}
              soonLabel={translate(dict, "home.paidSoon")}
              buyLabel={translate(dict, "home.paidBuy")}
              coverAlt={translate(dict, "home.paidCoverAlt")}
              hrefLang={en}
            />
          </div>
        </div>
      </section>

      {/* News posts are written in English: on translated home pages they carry the EN note. */}
      <EnglishOnly note={locale === DEFAULT_LOCALE ? null : translate(dict, "lang.untranslated")}>
        <LatestNews />
      </EnglishOnly>

      <EnglishOnly note={locale === DEFAULT_LOCALE ? null : s.testimonialsNote}>
        <TestimonialsStrip />
      </EnglishOnly>

      {/* Final CTA */}
      <section className="section-pad">
        <div className="container-site">
          <div className="rounded-2xl bg-void px-6 py-10 text-void-fg sm:px-10 sm:py-14 dark:bg-elevated dark:ring-1 dark:ring-white/10">
            <div className="spectrum-rule mb-8 max-w-24 rounded-full" aria-hidden />
            <p className="eyebrow eyebrow--on-dark">{s.nextEyebrow}</p>
            <h2 className="heading-lg mt-3 max-w-2xl text-void-fg">
              {s.nextTitle}
            </h2>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-void-fg/80">
              {s.nextBody}
            </p>
            <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
              <Link
                href="/learn/start"
                hrefLang={hl("/learn/start")}
                className="inline-flex min-h-11 items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-black hover:bg-white/90"
              >
                {s.startBaseline}
              </Link>
              <Link
                href={booking}
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/35 px-6 text-sm font-semibold text-white hover:bg-white/10"
              >
                {s.bookCall}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
