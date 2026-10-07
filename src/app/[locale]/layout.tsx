import { notFound } from "next/navigation";
import { LocaleData } from "@/components/LocaleData";
import { PREFIXED_LOCALES, isPrefixedLocale } from "@/lib/i18n";

/**
 * /fr, /ar, /pt, /sw, /zu and /af: translated versions of the pages in TRANSLATED_PATHS only
 * (src/lib/i18n/config.ts), as on bigfivegroup.africa. Prerendered per locale; any other first
 * segment is a 404, and /<locale>/<other page> redirects to the English page (next.config.ts).
 * <html lang/dir> is set by the root layout (LocaleHtml) from the URL.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return PREFIXED_LOCALES.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isPrefixedLocale(locale)) notFound();
  return (
    <>
      {/* this language's strings for the client chrome (src/lib/i18n/client.ts) */}
      <LocaleData locale={locale} />
      {children}
    </>
  );
}
