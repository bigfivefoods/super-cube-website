import { Noto_Sans_Arabic } from "next/font/google";

/**
 * Arabic script only, one weight. Not preloaded, so English never downloads it.
 * display: swap — Latin text uses Inter (listed first in globals.css), so this file
 * does not gate the welcome sentence. LocaleHtml adds the variable on /ar only.
 */
export const notoArabic = Noto_Sans_Arabic({
  subsets: ["arabic"],
  weight: "400",
  display: "swap",
  preload: false,
  adjustFontFallback: true,
  variable: "--font-arabic",
});
