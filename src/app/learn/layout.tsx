import type { Metadata, Viewport } from "next";
import { PracticeReminders } from "@/components/PracticeReminders";
import { InstallAppBanner } from "@/components/learn/InstallAppBanner";
import { LearnBottomNav } from "@/components/learn/LearnBottomNav";
import { LmsSyncProvider } from "@/components/learn/LmsSyncProvider";
import { ProfileGate } from "@/components/learn/ProfileGate";
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
    /*
      pt: clear fixed site header (h-14 / md:h-16 + safe-area)
      pb: clear bottom nav + sticky continue + safe-area
    */
    <div className="learn-app min-h-[100svh] bg-[#fafafa] pt-[calc(3.5rem+env(safe-area-inset-top,0px))] pb-[calc(8.5rem+env(safe-area-inset-bottom,0px))] md:pt-[calc(4rem+env(safe-area-inset-top,0px))] lg:pb-0">
      <LmsSyncProvider>
        <ProfileGate>
          <PracticeReminders />
          <div className="sticky top-[calc(3.5rem+env(safe-area-inset-top,0px))] z-40 md:top-[calc(4rem+env(safe-area-inset-top,0px))]">
            <InstallAppBanner />
          </div>
          {children}
          <StickyContinue />
          <LearnBottomNav />
        </ProfileGate>
      </LmsSyncProvider>
    </div>
  );
}
