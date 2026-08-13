"use client";

import { useLocale } from "@/components/LocaleProvider";
import { LOCALES, LOCALE_LABELS, LOCALE_SHORT, type Locale } from "@/lib/i18n";

export function LanguageSwitcher({
  variant = "header",
  overDark = false,
}: {
  variant?: "header" | "footer" | "compact";
  /** White text styles when over dark hero */
  overDark?: boolean;
}) {
  const { locale, setLocale, t } = useLocale();

  if (variant === "footer") {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">
          {t("lang.label")}
        </span>
        <div className="flex flex-wrap gap-1">
          {LOCALES.map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => setLocale(code)}
              className={`rounded-full px-2.5 py-1 text-xs font-semibold transition ${
                locale === code
                  ? "sc-btn-primary"
                  : "border border-line-strong bg-elevated text-slate hover:text-ink"
              }`}
              aria-pressed={locale === code}
              lang={code === "en" ? "en" : code}
            >
              {LOCALE_LABELS[code]}
            </button>
          ))}
        </div>
      </div>
    );
  }

  const btnBase = overDark
    ? "rounded-full px-2 py-1.5 text-[0.7rem] font-semibold transition"
    : "rounded-full px-2 py-1.5 text-[0.7rem] font-semibold transition";

  return (
    <div
      className="flex items-center gap-0.5"
      role="group"
      aria-label={t("lang.label")}
    >
      {LOCALES.map((code: Locale) => {
        const active = locale === code;
        return (
          <button
            key={code}
            type="button"
            onClick={() => setLocale(code)}
            className={`${btnBase} ${
              active
                ? overDark
                  ? "bg-white text-black"
                  : "sc-btn-primary"
                : overDark
                  ? "text-white/80 hover:bg-white/10 hover:text-white"
                  : "text-slate hover:bg-black/[0.04] hover:text-ink dark:hover:bg-white/[0.06]"
            }`}
            aria-pressed={active}
            title={LOCALE_LABELS[code]}
            lang={code === "en" ? "en" : code}
          >
            {variant === "compact" ? LOCALE_SHORT[code] : LOCALE_SHORT[code]}
          </button>
        );
      })}
    </div>
  );
}
