import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/config";
import { pageI18n } from "@/lib/i18n/pages/t";
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
      className={`flex h-full flex-col sc-card ${
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
      <footer className="mt-4 border-t border-line pt-3">
        <p className="text-sm font-semibold tracking-tight text-ink">
          {t.name}
        </p>
        <p className="text-xs text-muted">{t.org}</p>
      </footer>
    </article>
  );
}

/** Full grid — use on How / About / dedicated stories */
export async function TestimonialsSection({ locale = DEFAULT_LOCALE,
  title = "Voices from the programme",
  description = "Feedback from leaders in South African FMCG businesses who experienced Super-Cube® development.",
  compact = false,
  limit,
}: { locale?: Locale;
  title?: string;
  description?: string;
  compact?: boolean;
  limit?: number;
}) {
  const { t, L } = await pageI18n(locale);
  const list = limit ? testimonials.slice(0, limit) : testimonials;
  return (
    <section className="section-pad border-b border-line bg-surface">
      <div className="container-site">
        <div className="max-w-2xl">
          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted">
            {t("Case voices")}
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            {t(title)}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-slate sm:text-base">
            {t(description)}
          </p>
          {locale !== DEFAULT_LOCALE && (
            <p className="mt-3 text-xs text-muted">{t("The quotes are shown in their original English.")}</p>
          )}
        </div>
        <div
          lang={locale === DEFAULT_LOCALE ? undefined : "en"}
          dir={locale === DEFAULT_LOCALE ? undefined : "ltr"}
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
export async function TestimonialsStrip({ locale = DEFAULT_LOCALE }: { locale?: Locale } = {}) {
  const { t, L } = await pageI18n(locale);
  return (
    <section className="border-y border-line bg-bg py-10 sm:py-14 md:py-16">
      <div className="container-site">
        <div className="mb-6 flex flex-col gap-2 sm:mb-8 sm:flex-row sm:items-end sm:justify-between sm:gap-6">
          <div className="min-w-0">
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted">
              {t("What leaders say")}
            </p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight text-ink sm:text-2xl">
              {t("Named voices from real programmes")}
            </h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-slate sm:text-right">
            {t("Leaders at Imana Foods and Kerry Foods—developmental feedback, not paid endorsements.")}
          </p>
        </div>
        {locale !== DEFAULT_LOCALE && (
          <p className="-mt-3 mb-4 text-xs text-muted">{t("The quotes are shown in their original English.")}</p>
        )}
        <div
          lang={locale === DEFAULT_LOCALE ? undefined : "en"}
          dir={locale === DEFAULT_LOCALE ? undefined : "ltr"}
          className="grid gap-3 sm:grid-cols-2 sm:gap-4 md:grid-cols-3"
        >
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
