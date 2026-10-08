"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/components/Footer";
import { LocaleNotice } from "@/components/LocaleNotice";
import { MobileStickyCta } from "@/components/MobileStickyCta";
import { stripLocale } from "@/lib/i18n/config";

/** Public-site footer and notices. Learn keeps its own course chrome. */
export function MarketingChrome() {
  const path = stripLocale(usePathname());
  if (path === "/learn" || path.startsWith("/learn/")) return null;
  return (
    <>
      <Footer />
      <MobileStickyCta />
      <LocaleNotice />
    </>
  );
}
