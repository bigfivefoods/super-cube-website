"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useLocale } from "@/components/LocaleProvider";
import { LOCALE_CHANGE_EVENT, rememberLocale } from "@/components/LanguageSwitcher";
import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE,
  LOCALE_HTML_LANG,
  PREFIXED_LOCALES,
  dirOf,
  isLocale,
  isTranslatedPath,
  localizedPath,
  translate,
  type Dict,
  type Locale,
} from "@/lib/i18n";
import { loadDict, peekDict } from "@/lib/i18n/client";

const DISMISS_KEY = "sc-locale-notice-dismissed";

/** The visitor's saved choice (the switcher's cookie). */
function savedLocale(): Locale | null {
  const m = document.cookie.match(new RegExp(`(?:^|; )${LOCALE_COOKIE}=([^;]*)`));
  const v = m ? decodeURIComponent(m[1]!) : null;
  return isLocale(v) ? v : null;
}

/** First browser language we have a translation for (only ever a suggestion, never a redirect). */
function browserLocale(): Locale | null {
  for (const tag of navigator.languages ?? [navigator.language]) {
    const base = tag.toLowerCase().split("-")[0];
    const hit = PREFIXED_LOCALES.find((l) => l === base);
    if (hit) return hit;
  }
  return null;
}

type Notice =
  | { kind: "englishOnly"; locale: Locale }
  | { kind: "suggest"; locale: Locale; href: string; fromBrowser: boolean };

function GlobeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700 dark:text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
      <path d="M2 12h20" />
    </svg>
  );
}

/**
 * Small, dismissible language notes (fixed position, so they never shift the layout), as on
 * bigfivegroup.africa:
 * - on an English-only page, after the visitor chose another language: "available in English only";
 * - on the English version of a translated page: a gentle suggestion to view it in the language the
 *   visitor chose earlier, or (with no choice yet) in their browser language. Never a redirect.
 */
export function LocaleNotice() {
  const { locale, basePath } = useLocale();
  const [notice, setNotice] = useState<Notice | null>(null);

  useEffect(() => {
    const evaluate = () => {
      // Learn, sign-in and admin have their own app shell; no notes there.
      if (/^\/(learn|login|signup|auth|admin|newsletter\/admin|share)(\/|$)/.test(basePath)) {
        setNotice(null);
        return;
      }
      let dismissed = false;
      try {
        dismissed = sessionStorage.getItem(DISMISS_KEY) === basePath;
      } catch {
        /* storage blocked */
      }
      const pref = savedLocale();
      if (!isTranslatedPath(basePath)) {
        setNotice(pref && pref !== DEFAULT_LOCALE && !dismissed ? { kind: "englishOnly", locale: pref } : null);
        return;
      }
      if (locale !== DEFAULT_LOCALE || dismissed) {
        setNotice(null);
        return;
      }
      if (pref && pref !== DEFAULT_LOCALE) {
        setNotice({ kind: "suggest", locale: pref, href: localizedPath(pref, basePath), fromBrowser: false });
        return;
      }
      const fromBrowser = pref ? null : browserLocale();
      setNotice(
        fromBrowser
          ? { kind: "suggest", locale: fromBrowser, href: localizedPath(fromBrowser, basePath), fromBrowser: true }
          : null,
      );
    };
    evaluate();
    window.addEventListener(LOCALE_CHANGE_EVENT, evaluate);
    return () => window.removeEventListener(LOCALE_CHANGE_EVENT, evaluate);
  }, [basePath, locale]);

  // The note speaks the chosen language: its strings load on demand (only English is bundled).
  const [strings, setStrings] = useState<{ locale: Locale; dict: Dict } | null>(null);
  useEffect(() => {
    if (!notice || strings?.locale === notice.locale) return;
    let live = true;
    void loadDict(notice.locale).then((d) => live && setStrings({ locale: notice.locale, dict: d }));
    return () => {
      live = false;
    };
  }, [notice, strings]);

  if (!notice) return null;
  const dict = strings?.locale === notice.locale ? strings.dict : peekDict(notice.locale);
  if (!dict) return null;

  const dismiss = () => {
    try {
      sessionStorage.setItem(DISMISS_KEY, basePath);
    } catch {
      /* storage blocked */
    }
    // Dismissing a browser-language suggestion counts as choosing English.
    if (notice.kind === "suggest" && notice.fromBrowser) rememberLocale(DEFAULT_LOCALE);
    setNotice(null);
  };

  return (
    <div
      role="status"
      lang={LOCALE_HTML_LANG[notice.locale]}
      dir={dirOf(notice.locale)}
      data-locale-notice={notice.kind}
      className="fixed inset-x-3 bottom-[calc(5.25rem+env(safe-area-inset-bottom))] z-40 rounded-2xl border border-black/10 bg-white/95 px-4 py-3 text-sm text-[#171717] shadow-[0_8px_30px_rgba(0,0,0,0.12)] backdrop-blur-md md:inset-x-auto md:bottom-6 md:end-6 md:max-w-sm dark:border-line dark:bg-elevated/95 dark:text-ink"
    >
      <div className="flex items-start gap-3">
        <GlobeIcon />
        <div className="min-w-0 flex-1">
          <p className="leading-snug">
            {translate(dict, notice.kind === "englishOnly" ? "lang.englishOnly" : "lang.suggestion")}
          </p>
          {notice.kind === "suggest" ? (
            <Link
              href={notice.href}
              hrefLang={LOCALE_HTML_LANG[notice.locale]}
              onClick={() => rememberLocale(notice.locale)}
              className="mt-1 inline-flex min-h-6 items-center font-semibold underline underline-offset-2"
            >
              {translate(dict, "lang.suggestionCta")}
            </Link>
          ) : null}
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label={translate(dict, "common.dismiss")}
          className="-m-2 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-[#525252] hover:bg-black/5 dark:text-slate dark:hover:bg-white/10"
        >
          <svg viewBox="0 0 24 24" aria-hidden className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
