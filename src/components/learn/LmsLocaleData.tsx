import { isPrefixedLocale, type PrefixedLocale } from "@/lib/i18n/config";
import { LMS_MESSAGES } from "@/lib/i18n/lms/catalogues";
import { LMS_LOCALE_DATA_ID } from "@/lib/i18n/lms/text";

/** This language's Learn catalogue, for client components under /fr/learn, /ar/learn, …. */
export function LmsLocaleData({ locale }: { locale: string }) {
  if (!isPrefixedLocale(locale)) return null;
  const json = JSON.stringify(LMS_MESSAGES[locale as PrefixedLocale]).replace(/</g, "\\u003c");
  return (
    <script
      id={LMS_LOCALE_DATA_ID}
      type="application/json"
      data-locale={locale}
      dangerouslySetInnerHTML={{ __html: json }}
    />
  );
}
