import type { PrefixedLocale } from "@/lib/i18n/config";
import { installServerLmsMessages, type LmsCatalogue } from "./text";
import fr from "./messages/fr.json";
import ar from "./messages/ar.json";
import pt from "./messages/pt.json";
import sw from "./messages/sw.json";
import zu from "./messages/zu.json";
import af from "./messages/af.json";

/**
 * Server-only Learn catalogues. Do not import this from a client component:
 * one language is embedded in the page (`#sc-lms-locale`) instead.
 */
if (typeof window !== "undefined") {
  throw new Error("LMS catalogues are server-only");
}

export const LMS_MESSAGES: Record<PrefixedLocale, LmsCatalogue> = {
  fr: fr as LmsCatalogue,
  ar: ar as LmsCatalogue,
  pt: pt as LmsCatalogue,
  sw: sw as LmsCatalogue,
  zu: zu as LmsCatalogue,
  af: af as LmsCatalogue,
};

installServerLmsMessages(LMS_MESSAGES);
