"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { notoArabic } from "@/fonts/noto-arabic";
import { LOCALE_HTML_LANG, dirOf, localeFromPathname } from "@/lib/i18n";

/**
 * <html> with the right lang and dir for the URL (/ar/… → lang="ar" dir="rtl"; unprefixed → "en").
 * The pathname is known when each page is prerendered, so the static HTML carries the correct
 * attributes and client navigation keeps them in sync (as on bigfivegroup.africa).
 */
export function LocaleHtml({ className, children }: { className?: string; children: ReactNode }) {
  const locale = localeFromPathname(usePathname());
  const arabic = locale === "ar" ? notoArabic.variable : "";
  return (
    <html lang={LOCALE_HTML_LANG[locale]} dir={dirOf(locale)} className={`${className ?? ""} ${arabic}`.trim()} suppressHydrationWarning>
      {children}
    </html>
  );
}
