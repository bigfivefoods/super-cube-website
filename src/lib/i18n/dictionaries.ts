import type { Locale } from "./config";
import en, { type Dict } from "./dict/en";
import fr from "./dict/fr";
import ar from "./dict/ar";
import pt from "./dict/pt";
import sw from "./dict/sw";
import zu from "./dict/zu";
import af from "./dict/af";

/**
 * Every language's strings. Imported by Server Components (and, on the server only, by the client
 * chrome during prerendering: see i18n/client.ts). The browser bundle carries English only.
 */
export const DICTS: Record<Locale, Dict> = { en, fr, ar, pt, sw, zu, af };
