import type { Metadata, Viewport } from "next";
import { Inter, Noto_Sans_Arabic } from "next/font/google";
import { Header } from "@/components/Header";
import { MarketingChrome } from "@/components/MarketingChrome";
import { AnalyticsProvider } from "@/components/AnalyticsProvider";
import { VercelAnalytics } from "@/components/VercelAnalytics";
import { WebsiteInsights } from "@/components/WebsiteInsights";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { CapacitorInit } from "@/components/CapacitorInit";
import { CapacitorPush } from "@/components/CapacitorPush";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { LocaleHtml } from "@/components/LocaleHtml";
import { LocaleProvider } from "@/components/LocaleProvider";
import { PwaRegister } from "@/components/PwaRegister";
import { SentryInit } from "@/components/SentryInit";
import { SkipLink } from "@/components/SkipLink";
import { ThemeProvider } from "@/components/ThemeProvider";
import { site } from "@/lib/content";
import { SHARE_IMAGE } from "@/lib/seo";
import "./globals.css";

/** Self-hosted Inter via next/font — no render-blocking Google CSS */
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  weight: ["400", "500", "600", "700", "800", "900"],
});

/**
 * Arabic pages (/ar): Noto Sans Arabic, Arabic subset only, not preloaded, so English and the other
 * languages never download it. Used only under html[lang="ar"] (globals.css), as on bigfivegroup.africa.
 */
const notoArabic = Noto_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: false,
  variable: "--font-arabic",
});

/** FOUC: apply html.dark before paint from sc-theme + prefers-color-scheme */
const themeInitScript = `(function(){try{var preferDark=window.matchMedia('(prefers-color-scheme: dark)').matches;var mode=localStorage.getItem('sc-theme')||'system';var isDark=mode==='dark'||(mode==='system'&&preferDark);document.documentElement.classList.toggle('dark',isDark);document.documentElement.dataset.theme=isDark?'dark':'light';}catch(e){}})();`;

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "Super-Cube® | Human-Centric Leadership Development",
    template: "%s | Super-Cube®",
  },
  description: site.description,
  // Canonical + hreflang are set per page (see src/lib/seo.ts) so every URL
  // points to itself rather than inheriting the homepage canonical.
  applicationName: "Super-Cube® Learn",
  appleWebApp: {
    capable: true,
    title: "Super-Cube® Learn",
    statusBarStyle: "default",
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
  openGraph: {
    title: "Super-Cube® | Human-Centric Leadership Development",
    description: site.description,
    url: site.url,
    siteName: site.name,
    type: "website",
    locale: "en_ZA",
    images: [{ ...SHARE_IMAGE }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Super-Cube® | Human-Centric Leadership Development",
    description: site.description,
    images: [SHARE_IMAGE.url],
  },
  keywords: [
    "Super-Cube® Leadership Model",
    "leadership development South Africa",
    "human-centric leadership",
    "leadership programme Africa",
    "school leadership curriculum",
    "corporate leadership development",
    "emotional intelligence training",
    "principled leadership",
    "Ubuntu leadership",
    "Craig Ross Muller UKZN",
    "leadership skills for SDGs",
    "youth leadership programme",
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // lang/dir follow the URL (/fr/… → fr, /ar/… → ar + rtl); see components/LocaleHtml.
    <LocaleHtml className={`h-full scroll-smooth antialiased ${inter.variable} ${notoArabic.variable}`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body
        className={`${inter.className} flex min-h-full flex-col bg-bg text-ink`}
      >
        <SkipLink />
        <ThemeProvider>
          <LocaleProvider>
            <PwaRegister />
            <CapacitorInit />
            <CapacitorPush />
            <SentryInit />
            <AnalyticsProvider />
            <VercelAnalytics />
            <WebsiteInsights />
            <div className="site-chrome contents">
              <Header />
            </div>
            <ErrorBoundary>
              <main id="main-content" className="flex-1" tabIndex={-1}>
                <Breadcrumbs />
                {children}
              </main>
            </ErrorBoundary>
            <div className="site-chrome contents">
              <MarketingChrome />
            </div>
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </LocaleHtml>
  );
}
