import { isPrefixedLocale, type PrefixedLocale } from "@/lib/i18n/config";
import { LMS_MESSAGES } from "@/lib/i18n/lms/catalogues";
import { pickLmsCatalogue } from "@/lib/i18n/lms/slice";
import { LMS_LOCALE_DATA_ID } from "@/lib/i18n/lms/text";

/**
 * This language's Learn catalogue, for client components under /fr/learn, /ar/learn, ….
 * `keys` limits the payload to the strings that screen can look up. Screens that
 * render lessons or the questionnaire omit it and ship the whole catalogue.
 */
export function LmsLocaleData({ locale, keys }: { locale: string; keys?: readonly string[] }) {
  if (!isPrefixedLocale(locale)) return null;
  const catalogue = LMS_MESSAGES[locale as PrefixedLocale];
  const slice = keys ? pickLmsCatalogue(catalogue, keys) : catalogue;
  const json = JSON.stringify(slice).replace(/</g, "\\u003c");
  return (
    <script
      id={LMS_LOCALE_DATA_ID}
      type="application/json"
      data-locale={locale}
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
