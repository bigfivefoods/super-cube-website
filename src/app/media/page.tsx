import type { Metadata } from "next";
import Image from "next/image";
import { Button, PageHero, SectionHeading } from "@/components/ui";
import { publications, site } from "@/lib/content";

export const metadata: Metadata = {
  title: "Media kit",
  description:
    "Brand assets, one-page abstract, peer-reviewed journal PDFs, founder bio, and citation guide for Super-Cube®.",
};

export default function MediaKitPage() {
  return (
    <>
      <PageHero
        theme="about"
        eyebrow="Press & partners"
        title="Media kit"
        description="Logos, model description, research abstract, peer-reviewed journal PDFs, overview slides, and how to credit Super-Cube®. For interviews and features: hello@super-cube.me."
      >
        <Button href="/downloads/super-cube-overview.pptx" variant="primary">
          Download overview deck (.pptx)
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
                { src: "/brand/logo.svg", alt: "Super-Cube wordmark" },
                { src: "/brand/logo-mark.svg", alt: "Super-Cube mark" },
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
            <div className="rounded-2xl border border-line bg-elevated p-5">
              <SectionHeading title="Overview presentation" />
              <p className="mt-3 text-sm leading-relaxed text-slate">
                A 12-slide Super-Cube® overview for schools, companies, and
                partners—model, research, Learn pathway, seat packs, and
                pricing. Widescreen PowerPoint (.pptx).
              </p>
              <a
                href="/downloads/super-cube-overview.pptx"
                download
                className="mt-4 inline-flex min-h-11 items-center justify-center rounded-full sc-btn-primary px-5 text-sm font-semibold hover:opacity-90"
              >
                Download Super-Cube overview (.pptx)
              </a>
            </div>
            <div className="rounded-2xl border border-line bg-elevated p-5">
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
              <a
                href="/research#journal-articles"
                className="mt-4 inline-block text-sm font-semibold text-ink underline-offset-2 hover:underline"
              >
                Full research page →
              </a>
            </div>
            <div>
              <SectionHeading title="One-page abstract" />
              <p className="mt-4 text-sm leading-relaxed text-slate">
                Super-Cube® is an empirically developed, multidimensional
                leadership model (six constructs: Choices, Principles, Mental,
                Emotional, Physical, Spiritual) with the person at the centre.
                Validated via mixed methods in an African FMCG business-network
                (UKZN DBA, 2020) and published in SAJEMS and the Journal of
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
                  Muller, C. R. (2020). A Leadership Skills Development Model
                  for the Kwaden Group: A Case Study of an African FMCG
                  Business-Network. Doctor of Business Administration thesis,
                  University of KwaZulu-Natal. Super-Cube® Leadership Model.
                </p>
                <p className="rounded-xl border border-line bg-elevated p-4 font-mono text-xs leading-relaxed text-slate">
                  Muller, C. R., &amp; Pelser, T. G. (2022). A proposed
                  leadership skills development model for African FMCG
                  business-networks: Super-Cube®. South African Journal of
                  Economic and Management Sciences, 25(1), a4303.{" "}
                  https://doi.org/10.4102/sajems.v25i1.4303
                </p>
                <p className="rounded-xl border border-line bg-elevated p-4 font-mono text-xs leading-relaxed text-slate">
                  Muller, C. R., &amp; Pelser, T. G. (2022). A leadership skills
                  development model for the Kwaden Group: A case study of an
                  African fast-moving consumer goods business network. Journal
                  of Contemporary Management, 19.{" "}
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
    </>
  );
}
