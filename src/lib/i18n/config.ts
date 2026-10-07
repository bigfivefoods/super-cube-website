/**
 * Site languages: the same set as bigfivegroup.africa (en, fr, ar, pt, sw, zu), plus Afrikaans,
 * which super-cube.me already offered.
 *
 * Same approach as bigfivegroup.africa: English is the default and keeps the existing unprefixed
 * URLs. The other languages live under /fr, /ar, /pt, /sw, /zu and /af, but only for the pages in
 * TRANSLATED_PATHS. Every other page (Learn, the assessment, account, admin, API and the rest of
 * the site) stays English and outside locale routing: /fr/<anything else> redirects to the English
 * page (next.config.ts). The visitor's choice is kept in a cookie set by the switcher; nothing ever
 * redirects by browser language.
 *
 * No hooks and no server-only imports: safe in Server and Client Components.
 */
export const LOCALES = ["en", "fr", "ar", "pt", "sw", "zu", "af"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

/** Locales that carry a URL prefix. */
export const PREFIXED_LOCALES = ["fr", "ar", "pt", "sw", "zu", "af"] as const satisfies readonly Locale[];
export type PrefixedLocale = (typeof PREFIXED_LOCALES)[number];

/** Native names, shown in the language switcher. */
export const LOCALE_NATIVE_NAMES: Record<Locale, string> = {
  en: "English",
  fr: "Français",
  ar: "العربية",
  pt: "Português",
  sw: "Kiswahili",
  zu: "isiZulu",
  af: "Afrikaans",
};

/** BCP 47 tags for <html lang> and hreflang. */
export const LOCALE_HTML_LANG: Record<Locale, string> = {
  en: "en",
  fr: "fr",
  ar: "ar",
  pt: "pt",
  sw: "sw",
  zu: "zu",
  af: "af",
};

/** Open Graph locale per language (English keeps the site's existing en_ZA). */
export const LOCALE_OG: Record<Locale, string> = {
  en: "en_ZA",
  fr: "fr_FR",
  ar: "ar_AR",
  pt: "pt_PT",
  sw: "sw_KE",
  zu: "zu_ZA",
  af: "af_ZA",
};

export const RTL_LOCALES: readonly Locale[] = ["ar"];

export function dirOf(locale: Locale): "rtl" | "ltr" {
  return RTL_LOCALES.includes(locale) ? "rtl" : "ltr";
}

/**
 * English paths that have translated versions. Keep in sync with src/app/[locale]/… and the
 * redirect in next.config.ts (TRANSLATED_SEGMENTS).
 */
export const TRANSLATED_PATHS = ["/", "/pricing", "/faq"] as const;
export type TranslatedPath = (typeof TRANSLATED_PATHS)[number];

/** Cookie that remembers the visitor's language choice (set by the switcher; never by browser language). */
export const LOCALE_COOKIE = "sc-locale";
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export function isLocale(value: string | null | undefined): value is Locale {
  return !!value && (LOCALES as readonly string[]).includes(value);
}

export function isPrefixedLocale(value: string | null | undefined): value is PrefixedLocale {
  return !!value && (PREFIXED_LOCALES as readonly string[]).includes(value);
}

/** Locale of a pathname: "/fr/faq" → "fr", "/faq" → "en". */
export function localeFromPathname(pathname: string | null | undefined): Locale {
  const seg = (pathname || "/").split("/")[1];
  return isPrefixedLocale(seg) ? seg : DEFAULT_LOCALE;
}

/** The English path behind a pathname: "/fr/faq" → "/faq", "/fr" → "/". */
export function stripLocale(pathname: string | null | undefined): string {
  const p = pathname || "/";
  const seg = p.split("/")[1];
  if (!isPrefixedLocale(seg)) return p;
  const rest = p.slice(seg.length + 1);
  return rest === "" ? "/" : rest;
}

export function isTranslatedPath(path: string): path is TranslatedPath {
  return (TRANSLATED_PATHS as readonly string[]).includes(path);
}

/**
 * Path of `path` (an English path, optionally with #hash or ?query) in `locale`.
 * Only translated pages get a prefix; everything else stays on its English URL.
 */
export function localizedPath(locale: Locale, path: string): string {
  const m = /^([^?#]*)(.*)$/.exec(path);
  const base = (m?.[1] || "/") as string;
  const suffix = m?.[2] ?? "";
  if (locale === DEFAULT_LOCALE || !isTranslatedPath(base)) return path;
  const p: string = base;
  return `${p === "/" ? `/${locale}` : `/${locale}${p}`}${suffix}`;
}

/** hreflang alternates for a translated English path (every language, x-default → English). */
export function hreflangAlternates(path: TranslatedPath): Record<string, string> {
  const out: Record<string, string> = {};
  for (const l of LOCALES) out[LOCALE_HTML_LANG[l]] = localizedPath(l, path);
  out["x-default"] = path;
  return out;
}

/**
 * Is this href a page that stays English while the visitor reads another language?
 * (Used for hrefLang="en" on such links, as on bigfivegroup.africa.)
 */
export function isEnglishOnlyHref(locale: Locale, href: string): boolean {
  if (locale === DEFAULT_LOCALE || !href.startsWith("/")) return false;
  const base = (/^([^?#]*)/.exec(href)?.[1] || "/") as string;
  return !isTranslatedPath(base);
}
