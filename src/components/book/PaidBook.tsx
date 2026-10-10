import Image from "next/image";
import Link from "next/link";
import { PAID_BOOK, PAID_BOOK_DETAILS, amazonBuyUrl, kindleBuyUrl } from "@/lib/book";
import { absoluteUrl } from "@/lib/seo";

/**
 * Leadership Is Learnable, the comprehensive edition (the paid book). The "Buy the paperback on Amazon" button
 * shows while amazonBuyUrl() returns a real product URL (src/lib/book.ts; otherwise "Coming soon on Amazon").
 * The Kindle edition reads kindleBuyUrl() and shows "Kindle edition coming soon" until its listing is live.
 */

const D = PAID_BOOK_DETAILS;

export const PAID_BOOK_FACTS: { k: string; v: string }[] = [
  { k: "Pages", v: `${D.pages}` },
  { k: "Format", v: D.format },
  { k: "Paperback", v: `R${D.paperbackPrice.zar} · $${D.paperbackPrice.usd} · ISBN ${PAID_BOOK.paperback.isbn}` },
  {
    k: "eBook (Kindle)",
    v: `${kindleBuyUrl() ? "" : "Coming soon · "}$${D.ebookPrice.usd} · ISBN ${PAID_BOOK.kindle.isbn}`,
  },
  { k: amazonBuyUrl() ? "Paperback published" : "Published", v: `${D.publishedLabel} · ${PAID_BOOK.imprint}` },
];

export function AmazonButton({
  className = "",
  soonLabel = "Coming soon on Amazon",
  buyLabel = "Buy the paperback on Amazon",
  dark = false,
}: {
  className?: string;
  soonLabel?: string;
  buyLabel?: string;
  dark?: boolean;
}) {
  const url = amazonBuyUrl();
  const base =
    "inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold tracking-tight sm:w-auto sm:px-6";
  if (!url) {
    return (
      <span
        className={`${base} cursor-default border border-dashed ${dark ? "border-white/40 text-white/80" : "border-line-strong text-slate"} ${className}`}
        data-testid="paid-book-coming-soon"
      >
        {soonLabel}
      </span>
    );
  }
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`${base} sc-btn sc-btn-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${className}`}
      data-testid="paid-book-amazon"
      data-insights="cta-amazon"
      aria-label={`${buyLabel}: ${PAID_BOOK.title} (opens Amazon)`}
    >
      {buyLabel}
    </a>
  );
}

/** The Kindle edition: a link once kindleBuyUrl() is live, otherwise "Kindle edition coming soon" (only while the paperback is live). */
export function KindleNote({
  className = "",
  soonLabel = "Kindle edition coming soon",
  buyLabel = "Kindle edition on Amazon",
}: {
  className?: string;
  soonLabel?: string;
  buyLabel?: string;
}) {
  if (!amazonBuyUrl()) return null;
  const url = kindleBuyUrl();
  const base =
    "inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold tracking-tight sm:w-auto sm:px-6";
  if (!url) {
    return (
      <span className={`${base} cursor-default border border-dashed border-line-strong text-slate ${className}`} data-testid="paid-book-kindle-soon">
        {soonLabel}
      </span>
    );
  }
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`${base} border border-line-strong text-ink hover:bg-surface ${className}`}
      data-testid="paid-book-kindle"
      data-insights="cta-amazon"
    >
      {buyLabel}
    </a>
  );
}

function Cover({ sizes, className = "" }: { sizes: string; className?: string }) {
  return (
    <Image
      src={D.cover.src}
      width={D.cover.width}
      height={D.cover.height}
      alt={`Cover of ${PAID_BOOK.title} by ${PAID_BOOK.author}: a glowing six-colour Super-Cube® on white`}
      sizes={sizes}
      className={`h-auto w-full rounded-md shadow-[0_24px_60px_-20px_rgba(0,0,0,0.45)] ring-1 ring-black/10 dark:ring-white/10 ${className}`}
    />
  );
}

/** Full section for /book. */
export function PaidBookSection() {
  return (
    <section
      id={D.anchor}
      className="section-pad scroll-mt-24 border-t border-line bg-surface"
      data-testid="paid-book"
      aria-labelledby="paid-book-title"
    >
      <div className="container-site grid items-start gap-10 md:grid-cols-[minmax(0,0.42fr)_minmax(0,1fr)] lg:gap-16">
        <div className="mx-auto w-full max-w-[18rem] md:mx-0 md:max-w-none">
          <Cover sizes="(min-width: 1024px) 360px, (min-width: 768px) 30vw, 288px" />
        </div>
        <div className="min-w-0">
          <p className="eyebrow">Go deeper · {D.edition}</p>
          <h2 id="paid-book-title" className="heading-lg mt-3 text-ink">
            {PAID_BOOK.title}
          </h2>
          <p className="mt-2 text-base font-semibold tracking-tight text-slate sm:text-lg">{PAID_BOOK.subtitle}</p>
          <div className="mt-5 space-y-4 text-base leading-relaxed text-slate sm:text-[1.0625rem]">
            <p>
              The free book is the front door. <em>{PAID_BOOK.title}</em> is the house behind it: the doctoral research
              behind the Super-Cube® model (a survey of 132 people in an African FMCG business network and interviews
              with ten of its directors), a full chapter on each of the six faces, and a step-by-step guide for boards, HR
              directors and facilitators to building a leadership programme.
            </p>
            <p>
              It also reports the 12-week accredited Super-Cube® leadership intervention with leaders at Imana Foods and
              Kerry Foods, where average assessment scores rose by 32.2 percentage points across the six faces, and is
              candid about what those results can and cannot show.
            </p>
          </div>
          <dl className="mt-6 grid gap-3 sm:grid-cols-2">
            {PAID_BOOK_FACTS.map((x) => (
              <div key={x.k} className="rounded-xl border border-line bg-paper p-3">
                <dt className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted">{x.k}</dt>
                <dd className="mt-1 text-sm font-semibold text-ink">{x.v}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-7 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap sm:items-center">
            <AmazonButton />
            <KindleNote />
            <p className="text-sm text-muted">
              {amazonBuyUrl() ? "Paperback out now" : "Paperback and Kindle"} · English · by {PAID_BOOK.author}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Compact card: home page, /about, /research. Strings can be translated by the caller. */
export function PaidBookCard({
  eyebrow = `New · ${D.edition}`,
  body = `${D.pages} pages on the research and evidence behind the Super-Cube® model, each face in depth, and how to develop leaders at every level. Out now in paperback; Kindle edition coming soon.`,
  moreLabel = "About the book",
  soonLabel,
  buyLabel,
  kindleSoonLabel,
  coverAlt,
  hrefLang,
  testId = "paid-book-card",
}: {
  eyebrow?: string;
  body?: string;
  moreLabel?: string;
  soonLabel?: string;
  buyLabel?: string;
  kindleSoonLabel?: string;
  coverAlt?: string;
  hrefLang?: string;
  testId?: string;
}) {
  return (
    <div
      className="sc-card grid items-center gap-5 p-5 sm:grid-cols-[minmax(0,6.5rem)_minmax(0,1fr)] sm:p-6"
      data-testid={testId}
    >
      <div className="mx-auto w-24 sm:mx-0 sm:w-full">
        <Image
          src={D.cover.src}
          width={D.cover.width}
          height={D.cover.height}
          alt={coverAlt ?? `Cover of ${PAID_BOOK.title} by ${PAID_BOOK.author}`}
          sizes="112px"
          className="h-auto w-full rounded-sm shadow-[0_12px_28px_-12px_rgba(0,0,0,0.45)] ring-1 ring-black/10 dark:ring-white/10"
        />
      </div>
      <div className="min-w-0">
        <p className="eyebrow">{eyebrow}</p>
        <p className="mt-2 text-lg font-semibold tracking-tight text-ink">
          <bdi lang="en" dir="ltr">
            {PAID_BOOK.title}
          </bdi>
        </p>
        <p className="mt-1 text-sm leading-relaxed text-slate">{body}</p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <AmazonButton soonLabel={soonLabel} buyLabel={buyLabel} />
          <KindleNote soonLabel={kindleSoonLabel} />
          <Link
            href={`/book#${D.anchor}`}
            hrefLang={hrefLang}
            className="inline-flex min-h-11 items-center justify-center gap-1 rounded-full px-3 text-sm font-semibold text-ink underline underline-offset-2"
          >
            {moreLabel} <span aria-hidden className="rtl:-scale-x-100">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

/** schema.org Book for the comprehensive edition: the paperback offer carries the Amazon URL; Kindle has none until live. */
export function paidBookJsonLd() {
  const url = amazonBuyUrl();
  const kindleUrl = kindleBuyUrl();
  const offer = (price: string, priceCurrency: string, link: string | null) => ({
    "@type": "Offer",
    price,
    priceCurrency,
    ...(link ? { url: link, availability: "https://schema.org/InStock" } : {}),
  });
  return {
    "@context": "https://schema.org",
    "@type": "Book",
    name: PAID_BOOK.title,
    alternativeHeadline: PAID_BOOK.subtitle,
    author: { "@type": "Person", name: PAID_BOOK.author, url: absoluteUrl("/about") },
    publisher: { "@type": "Organization", name: PAID_BOOK.imprint, url: "https://bigfivegroup.africa" },
    datePublished: D.published,
    bookEdition: D.edition,
    inLanguage: "en",
    image: absoluteUrl(D.cover.src),
    url: absoluteUrl(`/book#${D.anchor}`),
    workExample: [
      {
        "@type": "Book",
        bookFormat: "https://schema.org/Paperback",
        isbn: PAID_BOOK.paperback.isbn.replace(/-/g, ""),
        numberOfPages: D.pages,
        datePublished: D.published,
        offers: [offer(D.paperbackPrice.usd.toFixed(2), "USD", url), offer(D.paperbackPrice.zar.toFixed(2), "ZAR", null)],
      },
      {
        "@type": "Book",
        bookFormat: "https://schema.org/EBook",
        isbn: PAID_BOOK.kindle.isbn.replace(/-/g, ""),
        offers: [offer(D.ebookPrice.usd.toFixed(2), "USD", kindleUrl)],
      },
    ],
  };
}
