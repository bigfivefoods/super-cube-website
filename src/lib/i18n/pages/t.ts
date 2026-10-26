import { DEFAULT_LOCALE, isEnglishOnlyHref, localizedPath, type Locale, type PrefixedLocale } from "../config";

/**
 * Inner-page translations (server only: Server Components and metadata; never import this from a
 * "use client" file, or every language would ship to the browser).
 *
 * The English text is the key, gettext style: pages keep their English copy inline and wrap it in
 * t(…). Each language's catalogue (src/lib/i18n/messages/<locale>.json) maps the normalised English
 * string (whitespace collapsed) to its translation. A string with no entry stays English. Catalogue
 * rules (tests/unit/i18n-messages.spec.ts): every language has the same keys, Super-Cube® keeps
 * its ®, numbers, URLs and {placeholders} survive translation.
 *
 * Catalogues load one language at a time, the first time that language is rendered. Importing all
 * six here (about 1.8 MB of JSON) made the server module parse every language before it could send
 * a byte, which showed up as a slow response on /leadership-challenges and /why-leadership.
 */
type Catalogue = Record<string, string>;

const catalogues: Partial<Record<PrefixedLocale, Catalogue>> = {};

function asCatalogue(mod: unknown): Catalogue {
  const wrapped = mod as { default?: unknown };
  const body =
    wrapped && typeof wrapped.default === "object" && wrapped.default && !Array.isArray(wrapped.default)
      ? wrapped.default
      : mod;
  return body as Catalogue;
}

/** The catalogue for `locale`, parsed on first use (not at module load). */
function catalogueOf(locale: PrefixedLocale): Catalogue {
  const hit = catalogues[locale];
  if (hit) return hit;
  // One explicit require per language so the bundler can keep each JSON as its own chunk.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const loaded = asCatalogue(
    locale === "fr"
      ? require("../messages/fr.json")
      : locale === "ar"
        ? require("../messages/ar.json")
        : locale === "pt"
          ? require("../messages/pt.json")
          : locale === "sw"
            ? require("../messages/sw.json")
            : locale === "zu"
              ? require("../messages/zu.json")
              : require("../messages/af.json"),
  );
  catalogues[locale] = loaded;
  return loaded;
}

/** A translator: strings are looked up; anything else (numbers, elements, undefined) passes through. */
export type T = <V>(value: V) => V;

/** Catalogue key of an English string: whitespace collapsed and trimmed. */
export function messageKey(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}

const MISSING_LOG = process.env.I18N_MISSING_LOG;

function reportMissing(locale: Locale, key: string) {
  if (!MISSING_LOG || typeof window !== "undefined") return;
  try {
    // Dev/build-time collection of untranslated strings (scripts/i18n-collect); off in production.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    require("node:fs").appendFileSync(MISSING_LOG, `${JSON.stringify({ locale, key })}\n`);
  } catch {
    /* best effort */
  }
}

const translatedValues: Partial<Record<PrefixedLocale, Set<string>>> = {};

/** Is `key` already a translation in `locale`? (A prop translated by the page and again by a component.) */
function isTranslation(locale: PrefixedLocale, key: string): boolean {
  const set = (translatedValues[locale] ??= new Set(Object.values(catalogueOf(locale)).map(messageKey)));
  return set.has(key);
}

/** The translation of `s` in `locale` (English when there is none). */
export function translateText(locale: Locale, s: string): string {
  if (locale === DEFAULT_LOCALE) return s;
  const key = messageKey(s);
  if (!key || !/\p{L}/u.test(key)) return s;
  const hit = catalogueOf(locale as PrefixedLocale)[key];
  if (hit === undefined) {
    if (!isTranslation(locale as PrefixedLocale, key)) reportMissing(locale, key);
    return s;
  }
  // Keep the source's outer spaces (JSX text next to a link, e.g. "Also see ").
  const lead = /^\s/.test(s) ? " " : "";
  const trail = /\s$/.test(s) ? " " : "";
  return `${lead}${hit}${trail}`;
}

/**
 * Page helpers for `locale`: t (translate), L (this language's URL for an English path; pages that
 * aren't translated keep their English URL) and hl (hrefLang="en" for links to English-only pages).
 */
export function pageI18n(locale: Locale = DEFAULT_LOCALE) {
  const t = (<V,>(value: V): V =>
    (typeof value === "string" ? translateText(locale, value) : value) as V) as T;
  const L = (href: string) => localizedPath(locale, href);
  const hl = (href: string) => (isEnglishOnlyHref(locale, href) ? "en" : undefined);
  return { t, L, hl, locale, isEnglish: locale === DEFAULT_LOCALE };
}

/** `value` with every string inside it translated (plain objects and arrays; other values as is). */
export function translateDeep<V>(locale: Locale, value: V): V {
  if (typeof value === "string") return translateText(locale, value) as V;
  if (Array.isArray(value)) return value.map((v) => translateDeep(locale, v)) as V;
  if (value && typeof value === "object" && Object.getPrototypeOf(value) === Object.prototype) {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, translateDeep(locale, v)])) as V;
  }
  return value;
}
