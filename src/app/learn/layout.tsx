import type { Metadata, Viewport } from "next";
import { InstallAppBanner } from "@/components/learn/InstallAppBanner";
import { LearnBottomNav } from "@/components/learn/LearnBottomNav";
import { LmsSyncProvider } from "@/components/learn/LmsSyncProvider";

export const metadata: Metadata = {
  title: "Learn",
  description:
    "Super-Cube® Learn — leadership pathway: orient, assess, develop six faces, re-measure, and download your growth report.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Super-Cube Learn",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function LearnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="learn-app min-h-[100svh] bg-[#fafafa] pb-16 lg:pb-0">
      <LmsSyncProvider>
        <InstallAppBanner />
        {children}
        <LearnBottomNav />
      </LmsSyncProvider>
    </div>
  );
}
