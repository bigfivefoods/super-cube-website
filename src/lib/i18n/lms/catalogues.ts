import type { PrefixedLocale } from "@/lib/i18n/config";
import type { LmsCatalogue } from "./text";
import fr from "./messages/fr.json";
import ar from "./messages/ar.json";
import pt from "./messages/pt.json";
import sw from "./messages/sw.json";
import zu from "./messages/zu.json";
import af from "./messages/af.json";

/** Server-only Learn catalogues. Do not import this from a client component. */
export const LMS_MESSAGES: Record<PrefixedLocale, LmsCatalogue> = {
  fr: fr as LmsCatalogue,
  ar: ar as LmsCatalogue,
  pt: pt as LmsCatalogue,
  sw: sw as LmsCatalogue,
  zu: zu as LmsCatalogue,
  af: af as LmsCatalogue,
};
