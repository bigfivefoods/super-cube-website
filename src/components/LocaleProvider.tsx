"use client";

import { usePathname } from "next/navigation";
import { useCallback, type ReactNode } from "react";
import {
  DEFAULT_LOCALE,
  localeFromPathname,
  localizedPath,
  stripLocale,
  translate,
  type Dict,
  type I18nKey,
  type Locale,
} from "@/lib/i18n";
import { useDict } from "@/lib/i18n/client";

/**
 * Language of the current page, from its URL (the bigfivegroup.africa approach): /fr/… → "fr",
 * unprefixed → "en". Known while each page is prerendered, so the static HTML is already in the
 * right language (no flash, no request-time headers) and client navigation stays in sync.
 */
export function useLocale(): {
  locale: Locale;
  /** The English path behind the URL ("/fr/faq" → "/faq"). */
  basePath: string;
  pathname: string;
  dict: Dict;
  t: (key: I18nKey, vars?: Record<string, string | number>) => string;
  /** An English href in this page's language (only translated pages get a prefix). */
  L: (href: string) => string;
} {
  const pathname = usePathname() || "/";
  const locale = localeFromPathname(pathname);
  const dict = useDict(locale);
  const t = useCallback(
    (key: I18nKey, vars?: Record<string, string | number>) => translate(dict, key, vars),
    [dict],
  );
  const L = useCallback(
    (href: string) => (locale === DEFAULT_LOCALE ? href : localizedPath(locale, href)),
    [locale],
  );
  return { locale, basePath: stripLocale(pathname), pathname, dict, t, L };
}

/** Kept as the root wrapper (same DOM as before); the language itself comes from the URL. */
export function LocaleProvider({ children }: { children: ReactNode }) {
  const { locale } = useLocale();
  return (
    <div data-locale={locale} data-locale-ready="1">
      {children}
    </div>
  );
}
