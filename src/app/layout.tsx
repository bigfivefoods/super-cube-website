import type { Metadata, Viewport } from "next";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { AnalyticsProvider } from "@/components/AnalyticsProvider";
import { CapacitorInit } from "@/components/CapacitorInit";
import { CapacitorPush } from "@/components/CapacitorPush";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { LocaleProvider } from "@/components/LocaleProvider";
import { PwaRegister } from "@/components/PwaRegister";
import { SentryInit } from "@/components/SentryInit";
import { site } from "@/lib/content";
import "./globals.css";

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
    <html lang="en" className="h-full scroll-smooth antialiased">
      <body className="flex min-h-full flex-col bg-white text-ink">
        <LocaleProvider>
          <PwaRegister />
          <CapacitorInit />
          <CapacitorPush />
          <SentryInit />
          <AnalyticsProvider />
          {/* Site chrome hidden when installed as standalone app (PWA / Capacitor) */}
          <div className="site-chrome contents">
            <Header />
          </div>
          <ErrorBoundary>
            <main className="flex-1">{children}</main>
          </ErrorBoundary>
          <div className="site-chrome contents">
            <Footer />
          </div>
        </LocaleProvider>
      </body>
    </html>
  );
}
