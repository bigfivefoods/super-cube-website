import { Noto_Sans_Arabic } from "next/font/google";

/**
 * Arabic script only, one weight. Preloaded so /ar does not discover the file after
 * CSS (that late fetch was the Arabic welcome LCP). Latin text uses Inter, listed
 * first in globals.css. LocaleHtml adds this variable on /ar only.
 */
export const notoArabic = Noto_Sans_Arabic({
  subsets: ["arabic"],
  weight: "400",
  display: "swap",
  preload: true,
  adjustFontFallback: true,
  variable: "--font-arabic",
});
