import type { PrefixedLocale } from "@/lib/i18n/config";
import { LTI_MESSAGES } from "@/lib/i18n/lms/lti-messages";
import { installServerLmsMessages, type LmsCatalogue } from "./text";
import fr from "./messages/fr.json";
import ar from "./messages/ar.json";
import pt from "./messages/pt.json";
import sw from "./messages/sw.json";
import zu from "./messages/zu.json";
import af from "./messages/af.json";

function withLti(locale: PrefixedLocale, base: LmsCatalogue): LmsCatalogue {
  return { ...base, ...LTI_MESSAGES[locale] };
}

/**
 * Server-only Learn catalogues. Do not import this from a client component:
 * one language is embedded in the page (`#sc-lms-locale`) instead.
 */
if (typeof window !== "undefined") {
  throw new Error("LMS catalogues are server-only");
}

export const LMS_MESSAGES: Record<PrefixedLocale, LmsCatalogue> = {
  fr: withLti("fr", fr as LmsCatalogue),
  ar: withLti("ar", ar as LmsCatalogue),
  pt: withLti("pt", pt as LmsCatalogue),
  sw: withLti("sw", sw as LmsCatalogue),
  zu: withLti("zu", zu as LmsCatalogue),
  af: withLti("af", af as LmsCatalogue),
};

installServerLmsMessages(LMS_MESSAGES);
