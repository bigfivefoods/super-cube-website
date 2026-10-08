import Link from "next/link";
import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import Image from "next/image";
import { Button, PageHero, SectionHeading } from "@/components/ui";
import { publications, site } from "@/lib/content";
import { AUTHOR_BIO } from "@/lib/author";
import { PAID_BOOK, PAID_BOOK_CITATION, PAID_BOOK_DETAILS } from "@/lib/book";
import { AmazonButton } from "@/components/book/PaidBook";

export const metadata: Metadata = pageMeta({
  path: "/media",
  title: "Media kit",
  description:
    "Brand assets, one-page abstract, peer-reviewed journal PDFs, founder bio, and citation guide for Super-Cube®.",
});

export default function MediaKitPage() {
  return (
    <>
      <PageHero
        theme="about"
        eyebrow="Press & partners"
        title="Media kit"
        description="Logos, model description, research abstract, peer-reviewed journal PDFs, a company profile (PDF), and how to credit Super-Cube®. For interviews and features: hello@super-cube.me."
      >
        <Button href="/super-cube-company-profile.pdf" variant="primary">
          Download company profile (PDF)
        </Button>
        <Button
          href={`mailto:${site.email}?subject=Media%20enquiry`}
          variant="ghost"
        >
          Email media
        </Button>
        <Button href="/research#journal-articles" variant="ghost">
          Journal articles
        </Button>
      </PageHero>

      <section className="section-pad bg-surface">
        <div className="container-site grid gap-10 lg:grid-cols-2">
          <div>
            <SectionHeading title="Brand assets" />
            <div className="mt-6 grid grid-cols-2 gap-3">
              {[
                { src: "/brand/logo.svg", alt: "Super-Cube® wordmark" },
                { src: "/brand/logo-mark.svg", alt: "Super-Cube® mark" },
                { src: "/icons/icon-512.png", alt: "App icon" },
                { src: "/cube.png", alt: "Cube visual" },
              ].map((a) => (
                <a
                  key={a.src}
                  href={a.src}
                  download
                  className="flex flex-col items-center rounded-xl border border-line bg-elevated p-4 transition hover:border-black/15 dark:hover:border-white/20"
                >
                  <div className="relative h-16 w-full">
                    <Image
                      src={a.src}
                      alt={a.alt}
                      fill
                      className="object-contain"
                      sizes="160px"
                    />
                  </div>
                  <span className="mt-2 text-xs font-semibold text-ink">
                    Download
                  </span>
                </a>
              ))}
            </div>
          </div>
          <div className="space-y-6">
            <div className="sc-card p-5">
              <SectionHeading title="Company profile" />
              <p className="mt-3 text-sm leading-relaxed text-slate">
                A 15-page Super-Cube® company profile for schools, companies,
                and partners—the six-face model, the research, programmes,
                Super-Cube® Learn, pilots, seat packs, and pricing. A4 PDF.
              </p>
              <a
                href="/super-cube-company-profile.pdf"
                download
                className="mt-4 inline-flex min-h-11 items-center justify-center rounded-full sc-btn-primary px-5 text-sm font-semibold hover:opacity-90"
              >
                Download company profile (PDF)
              </a>
            </div>
            <div className="sc-card p-5">
              <SectionHeading title="Peer-reviewed journal PDFs" />
              <p className="mt-3 text-sm leading-relaxed text-slate">
                Open access downloads of the 2022 SAJEMS and Journal of
                Contemporary Management articles on Super-Cube®.
              </p>
              <ul className="mt-4 space-y-3">
                {publications.map((pub) => (
                  <li
                    key={pub.id}
                    className="flex flex-col gap-1 border-t border-line pt-3 first:border-t-0 first:pt-0 sm:flex-row sm:items-center sm:justify-between sm:gap-3"
                  >
                    <div className="min-w-0">
                      <span className="inline-flex items-center rounded-full bg-ink px-2 py-0.5 text-[10px] font-semibold tracking-wide text-cream">
                        {pub.badge}
                      </span>
                      <p className="mt-1 text-sm font-semibold leading-snug text-ink">
                        {pub.title}
                      </p>
                    </div>
                    <a
                      href={pub.pdf}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-full border border-line-strong bg-paper px-4 text-xs font-semibold text-ink hover:border-black/25 dark:hover:border-white/25"
                    >
                      Download PDF
                    </a>
                  </li>
                ))}
              </ul>
              <Link
                href="/research#journal-articles"
                className="mt-4 inline-block text-sm font-semibold text-ink underline-offset-2 hover:underline"
              >
                Full research page →
              </Link>
            </div>
            <div>
              <SectionHeading title="One-page abstract" />
              <p className="mt-4 text-sm leading-relaxed text-slate">
                Super-Cube® is an empirically developed, multidimensional
                leadership model (six constructs: Choices, Principles, Mental,
                Emotional, Physical, Spiritual) with the person at the centre.
                Tested with mixed methods in an African FMCG business network
                (UKZN DBA thesis, December 2020; degree conferred 2021) and published in SAJEMS and the Journal of
                Contemporary Management (2022). Super-Cube® Learn delivers
                orient → baseline → deliberate practice → re-measure →
                certificate for kids, adolescents, and adults.
              </p>
            </div>
            <div>
              <h3 className="text-base font-semibold text-ink">
                Suggested citations
              </h3>
              <div className="mt-2 space-y-3">
                <p className="rounded-xl border border-line bg-elevated p-4 font-mono text-xs leading-relaxed text-slate">
                  {PAID_BOOK_CITATION}
                </p>
                <p className="rounded-xl border border-line bg-elevated p-4 font-mono text-xs leading-relaxed text-slate">
                  Muller, C. R. (2020). Doctor of Business Administration
                  thesis: a leadership skills development model (Super-Cube®),
                  a case study of an African FMCG business network. University
                  of KwaZulu-Natal. Super-Cube® Leadership Model.
                </p>
                <p className="rounded-xl border border-line bg-elevated p-4 font-mono text-xs leading-relaxed text-slate">
                  Muller, C. R., &amp; Pelser, T. G. (2022). A proposed
                  leadership skills development model for African FMCG
                  business-networks: Super-Cube®. South African Journal of
                  Economic and Management Sciences, 25(1), a4303.{" "}
                  https://doi.org/10.4102/sajems.v25i1.4303
                </p>
                <p className="rounded-xl border border-line bg-elevated p-4 font-mono text-xs leading-relaxed text-slate">
                  Muller, C. R., &amp; Pelser, T. G. (2022). Journal article:
                  the leadership skills development model, tested in an African
                  fast-moving consumer goods business network. Journal of
                  Contemporary Management, 19.{" "}
                  https://doi.org/10.35683/jcm21092.154
                </p>
              </div>
            </div>
            <div>
              <h3 className="text-base font-semibold text-ink">Boilerplate</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate">
                {site.description} Learn more at{" "}
                {site.url.replace("https://", "")}.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Author bio (About the Author, Leadership Is Learnable) and the book cover for press use. */}
      <section id="author" className="section-pad scroll-mt-24 border-t border-line bg-paper" data-testid="media-author">
        <div className="container-site grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:gap-14">
          <div className="min-w-0">
            <SectionHeading eyebrow="Founder bio" title="Dr Craig R. Muller" />
            <div className="prose-site mt-6 space-y-4" data-testid="author-bio">
              {AUTHOR_BIO.map((para) => (
                <p key={para.slice(0, 32)}>{para}</p>
              ))}
            </div>
            <p className="mt-4 text-xs text-muted">
              Adapted from the About the Author page of <em>{PAID_BOOK.title}</em> ({PAID_BOOK.imprint}, 2026).
            </p>
          </div>
          <div className="min-w-0">
            <div className="sc-card p-5 sm:p-6" data-testid="media-book">
              <p className="eyebrow">The book · {PAID_BOOK_DETAILS.edition}</p>
              <div className="mt-4 grid grid-cols-[minmax(0,7rem)_minmax(0,1fr)] gap-4">
                <a
                  href={PAID_BOOK_DETAILS.cover.src}
                  download="leadership-is-learnable-cover.jpg"
                  className="block rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink"
                  aria-label="Download the book cover (JPG, 1000 × 1500)"
                >
                  <Image
                    src={PAID_BOOK_DETAILS.cover.src}
                    width={PAID_BOOK_DETAILS.cover.width}
                    height={PAID_BOOK_DETAILS.cover.height}
                    alt={`Cover of ${PAID_BOOK.title} by ${PAID_BOOK.author}`}
                    sizes="112px"
                    className="h-auto w-full rounded-sm shadow-[0_12px_28px_-12px_rgba(0,0,0,0.45)] ring-1 ring-black/10 dark:ring-white/10"
                  />
                </a>
                <div className="min-w-0">
                  <h3 className="text-base font-semibold tracking-tight text-ink">{PAID_BOOK.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-slate">{PAID_BOOK.subtitle}</p>
                  <p className="mt-2 text-xs leading-relaxed text-slate">
                    {PAID_BOOK.imprint} · {PAID_BOOK_DETAILS.publishedLabel} · {PAID_BOOK_DETAILS.pages} pp ·{" "}
                    {PAID_BOOK_DETAILS.format}
                  </p>
                </div>
              </div>
              <dl className="mt-4 space-y-1 text-xs text-slate">
                <div>
                  <dt className="inline font-semibold text-ink">Paperback: </dt>
                  <dd className="inline">
                    ISBN {PAID_BOOK.paperback.isbn} · R{PAID_BOOK_DETAILS.paperbackPrice.zar} / $
                    {PAID_BOOK_DETAILS.paperbackPrice.usd}
                  </dd>
                </div>
                <div>
                  <dt className="inline font-semibold text-ink">eBook (Kindle): </dt>
                  <dd className="inline">
                    ISBN {PAID_BOOK.kindle.isbn} · R{PAID_BOOK_DETAILS.ebookPrice.zar} / ${PAID_BOOK_DETAILS.ebookPrice.usd}
                  </dd>
                </div>
              </dl>
              <div className="mt-5 flex flex-col gap-2.5 sm:flex-row sm:flex-wrap">
                <a
                  href={PAID_BOOK_DETAILS.cover.src}
                  download="leadership-is-learnable-cover.jpg"
                  className="inline-flex min-h-11 items-center justify-center rounded-full sc-btn-primary px-5 text-sm font-semibold hover:opacity-90"
                >
                  Download cover (JPG)
                </a>
                <AmazonButton />
              </div>
              <p className="mt-4 text-xs font-semibold text-ink">How to cite</p>
              <p className="mt-1 rounded-xl border border-line bg-elevated p-3 font-mono text-[0.6875rem] leading-relaxed text-slate">
                {PAID_BOOK_CITATION}
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
