import type { PrefixedLocale } from "../config";
import fr from "../messages/fr.json";
import ar from "../messages/ar.json";
import pt from "../messages/pt.json";
import sw from "../messages/sw.json";
import zu from "../messages/zu.json";
import af from "../messages/af.json";

/**
 * Every inner-page catalogue, for tests (tests/unit/i18n-messages.spec.ts).
 * Page rendering does not import this: src/lib/i18n/pages/t.ts loads one language when that
 * language is rendered, so a request does not parse all six catalogues first.
 */
type Catalogue = Record<string, string>;

export const MESSAGES: Record<PrefixedLocale, Catalogue> = { fr, ar, pt, sw, zu, af };
