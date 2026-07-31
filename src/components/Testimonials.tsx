import { constructs } from "@/lib/content";
import {
  featuredTestimonials,
  testimonials,
  type Testimonial,
} from "@/lib/testimonials";

function QuoteCard({
  t,
  accent,
  compact,
}: {
  t: Testimonial;
  accent: string;
  compact?: boolean;
}) {
  return (
    <article
      className={`flex h-full flex-col rounded-2xl border border-black/[0.07] bg-white ${
        compact ? "p-5" : "p-5 sm:p-6"
      }`}
      style={{ boxShadow: `inset 3px 0 0 ${accent}` }}
    >
      {t.question && (
        <p className="mb-3 text-[0.7rem] font-semibold leading-snug text-muted">
          Q: {t.question}
        </p>
      )}
      <p
        className={`flex-1 leading-relaxed text-ink ${
          compact ? "text-sm" : "text-sm sm:text-[0.95rem]"
        }`}
      >
        <span className="text-muted">“</span>
        {t.quote}
        <span className="text-muted">”</span>
      </p>
      <footer className="mt-4 border-t border-black/[0.05] pt-3">
        <p className="text-sm font-semibold tracking-tight text-ink">{t.name}</p>
        <p className="text-xs text-muted">{t.org}</p>
      </footer>
    </article>
  );
}

/** Full grid — use on How / About / dedicated stories */
export function TestimonialsSection({
  title = "Voices from the programme",
  description = "Feedback from leaders in South African FMCG businesses who experienced Super-Cube® development.",
  compact = false,
  limit,
}: {
  title?: string;
  description?: string;
  compact?: boolean;
  limit?: number;
}) {
  const list = limit ? testimonials.slice(0, limit) : testimonials;
  return (
    <section className="section-pad border-b border-black/[0.06] bg-[#fafafa]">
      <div className="container-site">
        <div className="max-w-2xl">
          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted">
            Case voices
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            {title}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate sm:text-base">
            {description}
          </p>
        </div>
        <div
          className={`mt-8 grid gap-4 ${
            compact
              ? "sm:grid-cols-2 lg:grid-cols-3"
              : "sm:grid-cols-2 lg:grid-cols-3"
          }`}
        >
          {list.map((t, i) => (
            <QuoteCard
              key={t.id}
              t={t}
              accent={constructs[i % constructs.length].color}
              compact={compact}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/** Compact home / conversion strip */
export function TestimonialsStrip() {
  return (
    <section className="border-y border-black/[0.06] bg-white py-12 sm:py-16">
      <div className="container-site">
        <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted">
              What leaders say
            </p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight text-ink sm:text-2xl">
              Proven in practice
            </h2>
          </div>
          <p className="max-w-md text-sm text-slate sm:text-right">
            Voices from Imana Foods and Kerry Foods programme participants.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {featuredTestimonials.map((t, i) => (
            <QuoteCard
              key={t.id}
              t={t}
              accent={constructs[i % constructs.length].color}
              compact
            />
          ))}
        </div>
      </div>
    </section>
  );
}
