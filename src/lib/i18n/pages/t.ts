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
 * Each language is its own ESM import() so the bundler keeps that JSON as its own chunk.
 */
type Catalogue = Record<string, string>;

const catalogues: Partial<Record<PrefixedLocale, Catalogue>> = {};
const loading = new Map<PrefixedLocale, Promise<Catalogue>>();

function asCatalogue(mod: unknown): Catalogue {
  const wrapped = mod as { default?: unknown };
  const body =
    wrapped && typeof wrapped.default === "object" && wrapped.default && !Array.isArray(wrapped.default)
      ? wrapped.default
      : mod;
  return body as Catalogue;
}

/** One static import() per language so the bundler can keep each JSON as its own chunk. */
const LOADERS: Record<PrefixedLocale, () => Promise<Catalogue>> = {
  fr: () => import("../messages/fr.json", { with: { type: "json" } }).then(asCatalogue),
  ar: () => import("../messages/ar.json", { with: { type: "json" } }).then(asCatalogue),
  pt: () => import("../messages/pt.json", { with: { type: "json" } }).then(asCatalogue),
  sw: () => import("../messages/sw.json", { with: { type: "json" } }).then(asCatalogue),
  zu: () => import("../messages/zu.json", { with: { type: "json" } }).then(asCatalogue),
  af: () => import("../messages/af.json", { with: { type: "json" } }).then(asCatalogue),
};

/** Parse this language's catalogue once. English has no catalogue. */
async function ensureCatalogue(locale: Locale): Promise<void> {
  if (locale === DEFAULT_LOCALE) return;
  const key = locale as PrefixedLocale;
  if (catalogues[key]) return;
  let pending = loading.get(key);
  if (!pending) {
    pending = LOADERS[key]().then((loaded) => {
      catalogues[key] = loaded;
      return loaded;
    });
    loading.set(key, pending);
  }
  await pending;
}

function catalogueOf(locale: PrefixedLocale): Catalogue {
  const hit = catalogues[locale];
  if (!hit) throw new Error(`Page catalogue for ${locale} is not loaded`);
  return hit;
}

/** A translator: strings are looked up; anything else (numbers, elements, undefined) passes through. */
export type T = <V>(value: V) => V;

/** Catalogue key of an English string: whitespace collapsed and trimmed. */
export function messageKey(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}

const MISSING_LOG = process.env.I18N_MISSING_LOG;

function reportMissing(locale: Locale, key: string) {
  const file = MISSING_LOG;
  if (!file || typeof window !== "undefined") return;
  const line = `${JSON.stringify({ locale, key })}\n`;
  // Dev/build-time collection of untranslated strings; off unless I18N_MISSING_LOG is set.
  void import("node:fs")
    .then(({ appendFileSync }) => appendFileSync(file, line))
    .catch(() => {
      /* best effort */
    });
}

const translatedValues: Partial<Record<PrefixedLocale, Set<string>>> = {};

/** Is `key` already a translation in `locale`? (A prop translated by the page and again by a component.) */
function isTranslation(locale: PrefixedLocale, key: string): boolean {
  const set = (translatedValues[locale] ??= new Set(Object.values(catalogueOf(locale)).map(messageKey)));
  return set.has(key);
}

/** The translation of `s` in `locale` (English when there is none). Catalogue must already be loaded. */
function translateTextSync(locale: Locale, s: string): string {
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

/** The translation of `s` in `locale` (English when there is none). */
export async function translateText(locale: Locale, s: string): Promise<string> {
  await ensureCatalogue(locale);
  return translateTextSync(locale, s);
}

/**
 * Page helpers for `locale`: t (translate), L (this language's URL for an English path; pages that
 * aren't translated keep their English URL) and hl (hrefLang="en" for links to English-only pages).
 */
export async function pageI18n(locale: Locale = DEFAULT_LOCALE) {
  await ensureCatalogue(locale);
  const t = (<V,>(value: V): V =>
    (typeof value === "string" ? translateTextSync(locale, value) : value) as V) as T;
  const L = (href: string) => localizedPath(locale, href);
  const hl = (href: string) => (isEnglishOnlyHref(locale, href) ? "en" : undefined);
  return { t, L, hl, locale, isEnglish: locale === DEFAULT_LOCALE };
}

function translateDeepSync<V>(locale: Locale, value: V): V {
  if (typeof value === "string") return translateTextSync(locale, value) as V;
  if (Array.isArray(value)) return value.map((v) => translateDeepSync(locale, v)) as V;
  if (value && typeof value === "object" && Object.getPrototypeOf(value) === Object.prototype) {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, translateDeepSync(locale, v)])) as V;
  }
  return value;
}

/** `value` with every string inside it translated (plain objects and arrays; other values as is). */
export async function translateDeep<V>(locale: Locale, value: V): Promise<V> {
  await ensureCatalogue(locale);
  return translateDeepSync(locale, value);
}
