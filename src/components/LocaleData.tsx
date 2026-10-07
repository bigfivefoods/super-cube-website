import type { Locale } from "@/lib/i18n";
import { DICTS } from "@/lib/i18n/dictionaries";
import { LOCALE_DATA_ID } from "@/lib/i18n/dataId";

/**
 * The page language's strings as inert JSON (type="application/json" never runs, so the CSP is
 * unaffected). Client chrome reads it on hydration (i18n/client), so the browser bundle only
 * carries English.
 */
export function LocaleData({ locale }: { locale: Locale }) {
  const json = JSON.stringify(DICTS[locale]).replace(/</g, "\\u003c");
  return (
    <script id={LOCALE_DATA_ID} type="application/json" data-locale={locale} dangerouslySetInnerHTML={{ __html: json }} />
  );
}
