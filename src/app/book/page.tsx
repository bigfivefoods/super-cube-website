import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { PaidBookSection, paidBookJsonLd } from "@/components/book/PaidBook";
import { ShareButtons } from "@/components/news/ShareButtons";
import { Button, PageHero, SectionHeading } from "@/components/ui";
import { BOOK, BOOK_CHAPTERS } from "@/lib/book";
import { site } from "@/lib/content";
import { COURSE_PRICE_ZAR } from "@/lib/programmes";
import { absoluteUrl, pageMeta } from "@/lib/seo";

const TITLE = "Free book: The Super-Cube® Leadership Model";
const DESCRIPTION =
  "Download Dr Craig R. Muller's book free: the six faces of leadership, 36 practices, six self-assessment workbook pages, a 30-day action plan and a chapter on the UN Sustainable Development Goals. PDF, English.";
const DOWNLOAD_LABEL = `Download the free book (PDF, ${BOOK.pages} pages, ${BOOK.size})`;

const base = pageMeta({ path: BOOK.page, title: TITLE, description: DESCRIPTION, image: BOOK.share.url });
const shareImage = { ...BOOK.share, alt: "The Super-Cube® Leadership Model by Dr Craig R. Muller: free book, PDF download" };

export const metadata: Metadata = {
  ...base,
  openGraph: { ...base.openGraph, type: "book", images: [shareImage] },
  twitter: { ...base.twitter, images: [shareImage.url] },
};

const INSIDE = [
  { title: "The six faces, explained simply", body: "Choices, Principles, Mental, Emotional, Physical and Spiritual, with you at the centre of the cube." },
  { title: "36 practices you can start this week", body: "Six practical habits for every face, each with a clear how-to and when to use it." },
  { title: "Six self-assessment workbook pages", body: "Ten statements per face, a score out of 100 and clear bands, so you know where to start." },
  { title: "A 30-day action plan", body: "A plan with tick boxes and a Day 1 / Day 30 scorecard, so you can see your own progress." },
  { title: "One thing you can do today", body: "Every chapter ends with a single, small action, because leadership grows through what you do." },
  { title: "From self to society, and the Global Goals", body: "How one leader's growth ripples out to a team, a network, a sector and a continent, and why the UN's 17 Sustainable Development Goals need leaders." },
];

function DownloadIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M12 11v6" />
      <path d="m9 14 3 3 3-3" />
    </svg>
  );
}

function bookJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Book",
    name: BOOK.title,
    alternativeHeadline: BOOK.subtitle,
    author: { "@type": "Person", name: BOOK.author, url: absoluteUrl("/about") },
    publisher: { "@type": "Organization", name: "Big Five Group", url: "https://bigfivegroup.africa" },
    bookFormat: "https://schema.org/EBook",
    inLanguage: "en",
    numberOfPages: BOOK.pages,
    copyrightYear: 2026,
    isAccessibleForFree: true,
    url: absoluteUrl(BOOK.page),
    image: absoluteUrl(BOOK.cover.src),
    offers: { "@type": "Offer", price: "0", priceCurrency: "ZAR", availability: "https://schema.org/InStock", url: absoluteUrl(BOOK.page) },
    workExample: { "@type": "Book", bookFormat: "https://schema.org/EBook", encodingFormat: "application/pdf", url: absoluteUrl(BOOK.href) },
  };
}

export default function BookPage() {
  const share = {
    url: absoluteUrl(BOOK.page),
    title: TITLE,
    summary: "A free book on the six faces of leadership, by Dr Craig R. Muller.",
  };
  return (
    <>
      <JsonLd data={bookJsonLd()} />
      <JsonLd data={paidBookJsonLd()} />
      <PageHero
        theme="model"
        eyebrow="Free book · PDF download"
        title={BOOK.title}
        description="Leadership is learnable, and Africa's future depends on it. Dr Craig R. Muller's book puts you at the centre of six faces of leadership you can grow, with practices, workbook pages and a 30-day plan. Free to download and share."
      >
        <Button href={BOOK.href} download variant="primary" ariaLabel={DOWNLOAD_LABEL}>
          <DownloadIcon />
          <span className="whitespace-nowrap">Download the free book</span>
          <span className="whitespace-nowrap text-xs font-medium opacity-75">
            {BOOK.pages} pages · PDF
          </span>
        </Button>
        <Button href="#inside" variant="ghost">
          See what&apos;s inside
        </Button>
      </PageHero>

      {/* About the book: cover beside full-width text */}
      <section className="section-pad bg-paper" data-testid="book-about">
        <div className="container-site grid items-start gap-10 md:grid-cols-[minmax(0,0.42fr)_minmax(0,1fr)] lg:gap-16">
          <div className="mx-auto w-full max-w-[18rem] md:mx-0 md:max-w-none">
            <a href={BOOK.href} download className="block rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink" aria-label={DOWNLOAD_LABEL}>
              <Image
                src={BOOK.cover.src}
                width={BOOK.cover.width}
                height={BOOK.cover.height}
                alt="Cover of The Super-Cube® Leadership Model by Dr Craig R. Muller: a glowing glass cube in the six face colours on black"
                sizes="(min-width: 1024px) 360px, (min-width: 768px) 30vw, 288px"
                className="h-auto w-full rounded-md shadow-[0_24px_60px_-20px_rgba(0,0,0,0.55)] ring-1 ring-black/10 dark:ring-white/10"
              />
            </a>
          </div>
          <div className="min-w-0">
            <p className="eyebrow">About the book</p>
            <h2 className="heading-lg mt-3 text-ink">A practical, human-centric way to grow as a leader</h2>
            <div className="mt-5 space-y-4 text-base leading-relaxed text-slate sm:text-[1.0625rem]">
              <p>
                The Super-Cube® Leadership Model puts <em>you</em> at the centre of six developable faces of
                leadership: Choices, Principles, Mental, Emotional, Physical and Spiritual. Born from doctoral
                research at the University of KwaZulu-Natal and tested inside a real African business network, it
                is a practical way to grow as a leader, and to grow the leaders around you.
              </p>
              <p>
                Each face has its own chapter: why it matters, how it grows, an illustrative story, six practices,
                a self-assessment workbook page and one thing you can do today. The book closes with a 30-day action
                plan and a scorecard, so you can measure your own progress.
              </p>
              <p className="text-sm text-muted">
                The stories are illustrative composites. The self-assessments are reflective tools for personal
                growth, not the research questionnaire.
              </p>
              <p>
                Want the research and evidence in full? The 312-page comprehensive edition,{" "}
                <a href="#comprehensive-edition" className="font-semibold text-ink underline underline-offset-2">
                  <em>Leadership Is Learnable</em>
                </a>
                , is out now on Amazon in paperback and as a Kindle e-book.
              </p>
            </div>
            <dl className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                { k: "Author", v: BOOK.author },
                { k: "Pages", v: String(BOOK.pages) },
                { k: "Format", v: `PDF · ${BOOK.size}` },
                { k: "Language", v: "English" },
              ].map((x) => (
                <div key={x.k} className="rounded-xl border border-line bg-surface p-3">
                  <dt className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted">{x.k}</dt>
                  <dd className="mt-1 text-sm font-semibold text-ink">{x.v}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-7 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center">
              <Button href={BOOK.href} download variant="primary" ariaLabel={DOWNLOAD_LABEL}>
                <DownloadIcon />
                Download the free book
              </Button>
              <p className="text-sm text-muted">Free · no sign-up · {BOOK.pages} pages · {BOOK.size}</p>
            </div>
            <div className="mt-8 border-t border-line pt-6">
              <ShareButtons {...share} position="bottom" label="Share the official download link" />
            </div>
          </div>
        </div>
      </section>

      {/* What's inside */}
      <section id="inside" className="section-pad scroll-mt-24 border-t border-line bg-surface">
        <div className="container-site">
          <SectionHeading
            eyebrow="What's inside"
            title="Everything you need to start leading from all six faces"
            description="Short chapters, clear practices and space to write: a book to work through, not just read."
          />
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {INSIDE.map((x) => (
              <li key={x.title} className="sc-card p-5 sm:p-6">
                <h3 className="text-base font-semibold tracking-tight text-ink">{x.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate">{x.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Chapters */}
      <section id="chapters" className="section-pad scroll-mt-24 border-t border-line bg-paper">
        <div className="container-site">
          <SectionHeading eyebrow="Contents" title="Chapters" />
          <ol className="mt-8 gap-x-10 md:columns-2" data-testid="book-chapters">
            {BOOK_CHAPTERS.map((c) => (
              <li key={c.title} className="flex break-inside-avoid gap-4 border-b border-line py-4">
                <span className="w-8 shrink-0 text-sm font-semibold tabular-nums text-muted" aria-hidden={!c.n}>
                  {c.n ? String(c.n).padStart(2, "0") : "·"}
                </span>
                <div className="min-w-0">
                  <p className="text-base font-semibold tracking-tight text-ink">
                    {c.n ? <span className="sr-only">Chapter {c.n}: </span> : null}
                    {c.title}
                  </p>
                  <p className="mt-0.5 text-sm text-slate">{c.note}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* The comprehensive edition (paid): paperback (AMAZON_URL_TBD) and Kindle (KINDLE_URL_TBD) on Amazon. */}
      <PaidBookSection />

      {/* Download CTA */}
      <section className="section-pad">
        <div className="container-site">
          <div className="rounded-2xl bg-void px-6 py-10 text-void-fg sm:px-10 sm:py-14 dark:bg-elevated dark:ring-1 dark:ring-white/10">
            <div className="spectrum-rule mb-8 max-w-24 rounded-full" aria-hidden />
            <p className="eyebrow eyebrow--on-dark">Free digital edition</p>
            <h2 className="heading-lg mt-3 text-void-fg">Download your free copy</h2>
            <p className="mt-3 text-base leading-relaxed text-void-fg/80">
              Read it, work through it, and share the link with your team. When you are ready to measure your
              leadership and practise with guidance, Super-Cube® programmes for Kids, Adolescents and Adults start
              with a free baseline, with lifetime access for R{COURSE_PRICE_ZAR}.
            </p>
            <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
              <a
                href={BOOK.href}
                download
                aria-label={DOWNLOAD_LABEL}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-white px-6 text-sm font-semibold text-black hover:bg-white/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <DownloadIcon />
                Download the free book
              </a>
              <Link
                href="/learn/start"
                className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/35 px-6 text-sm font-semibold text-white hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                Start the free baseline
              </Link>
            </div>
            <p className="mt-5 text-xs text-void-fg/60">
              © 2026 {BOOK.author}. All rights reserved. Free to download from {site.url.replace(/^https?:\/\//, "")} and
              bigfivegroup.africa/leadership.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
