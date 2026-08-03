import type { Metadata, Viewport } from "next";
import { PracticeReminders } from "@/components/PracticeReminders";
import { InstallAppBanner } from "@/components/learn/InstallAppBanner";
import { LearnBottomNav } from "@/components/learn/LearnBottomNav";
import { LmsSyncProvider } from "@/components/learn/LmsSyncProvider";
import { StickyContinue } from "@/components/learn/StickyContinue";

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
    /* pb clears bottom nav (~3.5rem) + sticky continue bar (~4rem) + safe area */
    <div className="learn-app min-h-[100svh] bg-[#fafafa] pb-[calc(8.5rem+env(safe-area-inset-bottom,0px))] lg:pb-0">
      <LmsSyncProvider>
        <PracticeReminders />
        <InstallAppBanner />
        {children}
        <StickyContinue />
        <LearnBottomNav />
      </LmsSyncProvider>
    </div>
  );
}
