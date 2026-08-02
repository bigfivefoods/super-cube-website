import type { Metadata } from "next";
import Image from "next/image";
import { Button, PageHero, SectionHeading } from "@/components/ui";
import { site } from "@/lib/content";

export const metadata: Metadata = {
  title: "Media kit",
  description:
    "Brand assets, one-page abstract, founder bio, and citation guide for Super-Cube®.",
};

export default function MediaKitPage() {
  return (
    <>
      <PageHero
        theme="about"
        eyebrow="Press & partners"
        title="Media kit"
        description="Logos, model description, research abstract, and how to credit Super-Cube®. For interviews and features: hello@super-cube.me."
      >
        <Button href={`mailto:${site.email}?subject=Media%20enquiry`} variant="primary">
          Email media
        </Button>
        <Button href="/research" variant="ghost">
          Research summary
        </Button>
      </PageHero>

      <section className="section-pad bg-[#fafafa]">
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
                  className="flex flex-col items-center rounded-xl border border-black/[0.08] bg-white p-4 transition hover:border-black/15"
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
            <div>
              <SectionHeading title="One-page abstract" />
              <p className="mt-4 text-sm leading-relaxed text-slate">
                Super-Cube® is an empirically developed, multidimensional
                leadership model (six constructs: Choices, Principles, Mental,
                Emotional, Physical, Spiritual) with the person at the centre.
                Validated via mixed methods in an African FMCG business-network
                (UKZN DBA, 2020). Super-Cube® Learn delivers orient → baseline →
                deliberate practice → re-measure → certificate for kids,
                adolescents, and adults.
              </p>
            </div>
            <div>
              <h3 className="text-base font-semibold text-ink">Suggested citation</h3>
              <p className="mt-2 rounded-xl border border-black/[0.08] bg-white p-4 font-mono text-xs leading-relaxed text-slate">
                Muller, C. R. (2020). A Leadership Skills Development Model for
                the Kwaden Group: A Case Study of an African FMCG
                Business-Network. Doctor of Business Administration thesis,
                University of KwaZulu-Natal. Super-Cube® Leadership Model.
              </p>
            </div>
            <div>
              <h3 className="text-base font-semibold text-ink">Boilerplate</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate">
                {site.description} Learn more at {site.url.replace("https://", "")}.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
