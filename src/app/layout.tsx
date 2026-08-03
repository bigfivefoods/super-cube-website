import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { AnalyticsProvider } from "@/components/AnalyticsProvider";
import { CapacitorInit } from "@/components/CapacitorInit";
import { CapacitorPush } from "@/components/CapacitorPush";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { LocaleProvider } from "@/components/LocaleProvider";
import { MobileStickyCta } from "@/components/MobileStickyCta";
import { PwaRegister } from "@/components/PwaRegister";
import { SentryInit } from "@/components/SentryInit";
import { site } from "@/lib/content";
import "./globals.css";

/** Self-hosted Inter via next/font — no render-blocking Google CSS */
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
  weight: ["400", "500", "600", "700", "800"],
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0a0a0a" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
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
  alternates: {
    canonical: site.url,
    languages: {
      en: site.url,
      "en-ZA": site.url,
      zu: site.url,
      af: site.url,
      "x-default": site.url,
    },
  },
  applicationName: "Super-Cube® Learn",
  appleWebApp: {
    capable: true,
    title: "Super-Cube Learn",
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
    images: [
      {
        url: "/images/hero/leadership-hero.jpg",
        width: 1440,
        height: 900,
        alt: "Super-Cube® Leadership Model",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Super-Cube® | Human-Centric Leadership Development",
    description: site.description,
    images: ["/images/hero/leadership-hero.jpg"],
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
    <html lang="en" className={`h-full scroll-smooth antialiased ${inter.variable}`}>
      <body
        className={`${inter.className} flex min-h-full flex-col bg-white text-ink`}
      >
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <LocaleProvider>
          <PwaRegister />
          <CapacitorInit />
          <CapacitorPush />
          <SentryInit />
          <AnalyticsProvider />
          <div className="site-chrome contents">
            <Header />
          </div>
          <ErrorBoundary>
            <main id="main-content" className="flex-1" tabIndex={-1}>
              {children}
            </main>
          </ErrorBoundary>
          <div className="site-chrome contents">
            <Footer />
            <MobileStickyCta />
          </div>
        </LocaleProvider>
      </body>
    </html>
  );
}
