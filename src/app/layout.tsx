import type { Metadata } from "next";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { site } from "@/lib/content";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "Super-Cube® | Human-Centric Leadership Development",
    template: "%s | Super-Cube®",
  },
  description: site.description,
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/brand/logo.png", type: "image/png" },
    ],
    apple: [{ url: "/brand/logo.png" }],
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
    "leadership development",
    "human-centric leadership",
    "Africa leadership",
    "FMCG leadership",
    "Craig Ross Muller",
    "leadership skills",
    "emotional intelligence",
    "principled leadership",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full scroll-smooth antialiased">
      <body className="flex min-h-full flex-col bg-white text-ink">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
