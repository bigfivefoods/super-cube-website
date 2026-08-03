import { featuredTestimonials } from "@/lib/testimonials";

/** Compact social proof for marketing pages */
export function SocialProofStrip() {
  return (
    <section className="border-b border-black/[0.06] bg-[#fafafa]">
      <div className="container-site py-10 sm:py-12">
        <p className="text-center text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-muted">
          Voices from African FMCG networks
        </p>
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
        <p className="mt-6 text-center text-xs text-muted">
          Programme feedback from leaders in South African FMCG businesses ·
          Developmental endorsements, not paid ads
        </p>
      </div>
    </section>
  );
}
