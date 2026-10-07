"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { useLocale } from "@/components/LocaleProvider";
import {
  LOCALES,
  LOCALE_COOKIE,
  LOCALE_COOKIE_MAX_AGE,
  LOCALE_HTML_LANG,
  LOCALE_NATIVE_NAMES,
  isTranslatedPath,
  localizedPath,
  type Locale,
} from "@/lib/i18n";

/** Event the switcher fires after a choice, so the English-only note can react at once. */
export const LOCALE_CHANGE_EVENT = "sc:locale-change";

export function rememberLocale(locale: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${LOCALE_COOKIE_MAX_AGE}; samesite=lax`;
  window.dispatchEvent(new CustomEvent(LOCALE_CHANGE_EVENT, { detail: locale }));
}

function GlobeIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function ChevronDownIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}

/**
 * Language switcher (native names), the bigfivegroup.africa design. On a translated page each
 * language links to the same page in that language; on an English-only page it stays put,
 * remembers the choice and the site shows a small "available in English only" note. The choice is
 * kept in a cookie; nothing redirects by browser language.
 *
 * variant "menu": compact globe button + dropdown (header, every breakpoint)
 * variant "list": inline 2-column list (inside the mobile menu)
 */
export function LanguageSwitcher({
  variant = "menu",
  overDark = false,
  onChoose,
}: {
  variant?: "menu" | "list";
  /** White text while the header sits over a dark hero (or in dark mode). */
  overDark?: boolean;
  onChoose?: () => void;
}) {
  const { locale, basePath, t } = useLocale();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listId = useId();
  const translated = isTranslatedPath(basePath);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Close on navigation (render-time reset).
  const [seenPath, setSeenPath] = useState(basePath + locale);
  if (seenPath !== basePath + locale) {
    setSeenPath(basePath + locale);
    setOpen(false);
  }

  const choose = (l: Locale) => {
    rememberLocale(l);
    setOpen(false);
    onChoose?.();
  };

  const items = LOCALES.map((l) => {
    const current = l === locale;
    const href = translated ? localizedPath(l, basePath) : basePath;
    const common = {
      lang: LOCALE_HTML_LANG[l],
      "aria-current": current ? ("true" as const) : undefined,
      "data-locale": l,
    };
    const label = (
      <>
        <span className="flex-1">{LOCALE_NATIVE_NAMES[l]}</span>
        {current ? <CheckIcon /> : null}
      </>
    );
    return { l, current, href, common, label };
  });

  if (variant === "list") {
    return (
      <nav aria-label={t("lang.choose")} className="w-full" data-language-switcher="list">
        <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[1.5px] text-[#525252] dark:text-slate">
          <GlobeIcon className="h-4 w-4" />
          {t("lang.label")}
        </div>
        <ul className="grid grid-cols-2 gap-1.5">
          {items.map(({ l, current, href, common, label }) => {
            const cls = `flex w-full min-h-11 items-center gap-2 rounded-xl border px-3 text-sm text-start ${
              current
                ? "border-black bg-black font-semibold text-white dark:border-white dark:bg-white dark:text-black"
                : "border-black/10 bg-white text-black dark:border-line dark:bg-elevated dark:text-ink"
            }`;
            return (
              <li key={l}>
                {translated ? (
                  <Link href={href} hrefLang={LOCALE_HTML_LANG[l]} {...common} onClick={() => choose(l)} className={cls}>
                    {label}
                  </Link>
                ) : (
                  <button type="button" {...common} onClick={() => choose(l)} className={cls}>
                    {label}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    );
  }

  const itemCls = (current: boolean) =>
    `flex w-full min-h-11 items-center gap-2 rounded-xl px-3 text-sm text-start ${
      current
        ? "bg-[#f5f5f5] font-semibold text-black dark:bg-white/10 dark:text-ink"
        : "text-[#171717] hover:bg-[#fafafa] dark:text-ink dark:hover:bg-white/[0.06]"
    }`;

  return (
    <div ref={wrapRef} className="relative shrink-0" data-language-switcher="menu">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls={listId}
        aria-label={`${t("lang.label")}: ${LOCALE_NATIVE_NAMES[locale]}`}
        className={`inline-flex h-11 items-center gap-1 rounded-full px-1.5 text-[13px] font-semibold transition-colors focus-visible:outline focus-visible:outline-2 sm:px-2.5 ${
          overDark
            ? "text-white hover:bg-white/10 focus-visible:outline-white"
            : "text-[#171717] hover:bg-black/5 focus-visible:outline-black dark:text-ink dark:hover:bg-white/10 dark:focus-visible:outline-white"
        }`}
      >
        <GlobeIcon className="h-[18px] w-[18px] shrink-0" />
        <span className="uppercase">{locale}</span>
        {/* no chevron on phones: room for the brand and the menu button */}
        <ChevronDownIcon className={`hidden h-3.5 w-3.5 transition-transform sm:block ${open ? "rotate-180" : ""}`} />
      </button>
      {open ? (
        <div
          id={listId}
          className="absolute end-0 top-full z-50 mt-2 w-52 rounded-2xl border border-black/10 bg-white p-1.5 text-start shadow-xl dark:border-line dark:bg-elevated"
        >
          <div className="px-3 pb-1 pt-1.5 text-[10px] font-semibold uppercase tracking-[1.5px] text-[#737373] dark:text-muted">
            {t("lang.choose")}
          </div>
          <ul>
            {items.map(({ l, current, href, common, label }) => (
              <li key={l}>
                {translated ? (
                  <Link href={href} hrefLang={LOCALE_HTML_LANG[l]} {...common} onClick={() => choose(l)} className={itemCls(current)}>
                    {label}
                  </Link>
                ) : (
                  <button type="button" {...common} onClick={() => choose(l)} className={itemCls(current)}>
                    {label}
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
