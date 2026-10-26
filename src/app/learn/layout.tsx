import type { Metadata, Viewport } from "next";
import { LearnAppFrame } from "@/components/learn/LearnAppFrame";
import { pageMeta } from "@/lib/seo";

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
  ...pageMeta({
    title: "Learning dashboard",
    description:
      "Super-Cube® Learn — leadership pathway: orient, assess, develop six faces, re-measure, and download your growth report.",
    path: "/learn",
  }),
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Super-Cube® Learn",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function LearnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <LearnAppFrame>{children}</LearnAppFrame>;
}
