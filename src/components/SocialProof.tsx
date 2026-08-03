import Link from "next/link";
import { featuredTestimonials } from "@/lib/testimonials";

/** Compact social proof for marketing pages */
export function SocialProofStrip() {
  return (
    <section className="border-b border-black/[0.06] bg-[#fafafa]">
      <div className="container-site py-10 sm:py-12">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-muted">
            Voices from African FMCG networks
          </p>
          <p className="mt-2 text-sm text-slate sm:text-base">
            Named leaders from Imana Foods and Kerry Foods—programme feedback,
            not paid ads.
          </p>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {featuredTestimonials.map((t) => (
            <blockquote
              key={t.id}
              className="rounded-2xl border border-black/[0.07] bg-white p-4 sm:p-5"
            >
              <p className="text-sm leading-relaxed text-ink">“{t.quote}”</p>
              <footer className="mt-3 border-t border-black/[0.05] pt-2">
                <p className="text-sm font-semibold text-ink">{t.name}</p>
                <p className="text-xs text-muted">{t.org}</p>
              </footer>
            </blockquote>
          ))}
        </div>

        <div className="mt-8 grid gap-3 rounded-2xl border border-black/[0.07] bg-white p-4 sm:grid-cols-3 sm:gap-0 sm:divide-x sm:divide-black/[0.06] sm:p-5">
          <div className="text-center sm:px-4">
            <p className="text-lg font-semibold tracking-tight text-ink">52 → 68</p>
            <p className="mt-0.5 text-xs text-muted">Mean capacity (illustrative 8-week pattern)</p>
          </div>
          <div className="text-center sm:px-4">
            <p className="text-lg font-semibold tracking-tight text-ink">UKZN · SAJEMS</p>
            <p className="mt-0.5 text-xs text-muted">Doctoral model · peer-reviewed paper</p>
          </div>
          <div className="text-center sm:px-4">
            <p className="text-lg font-semibold tracking-tight text-ink">Verify IDs</p>
            <p className="mt-0.5 text-xs text-muted">
              <Link href="/sample-report" className="font-semibold text-ink underline-offset-2 hover:underline">
                Sample report
              </Link>
              {" · "}
              <Link href="/verify/SC-DEMO" className="font-semibold text-ink underline-offset-2 hover:underline">
                Demo certificate
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
