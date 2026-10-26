import { PracticeReminders } from "@/components/PracticeReminders";
import { InstallAppBanner } from "@/components/learn/InstallAppBanner";
import { LearnBottomNav } from "@/components/learn/LearnBottomNav";
import { LearnLocaleSync } from "@/components/learn/LearnLocaleSync";
import { LmsSyncProvider } from "@/components/learn/LmsSyncProvider";
import { ProfileGate } from "@/components/learn/ProfileGate";
import { CelebrationToast } from "@/components/learn/progress/CelebrationToast";

/** Shared chrome for /learn and /fr/learn, /ar/learn, and the other languages. */
export function LearnAppFrame({ children }: { children: React.ReactNode }) {
  return (
    /*
      pt: clear fixed site header (h-14 / md:h-16 + safe-area)
      pb: clear bottom nav + safe-area (the pathway pill carries "Continue")
    */
    <div className="learn-app min-h-[100svh] bg-surface pt-[calc(3.5rem+env(safe-area-inset-top,0px))] pb-[calc(6.5rem+env(safe-area-inset-bottom,0px))] md:pt-[calc(4rem+env(safe-area-inset-top,0px))] lg:pb-8">
      <LearnLocaleSync />
      <LmsSyncProvider>
        <ProfileGate>
          <PracticeReminders />
          <div className="sticky top-[calc(3.5rem+env(safe-area-inset-top,0px))] z-40 md:top-[calc(4rem+env(safe-area-inset-top,0px))]">
            <InstallAppBanner />
          </div>
          {children}
          <CelebrationToast />
          <LearnBottomNav />
        </ProfileGate>
      </LmsSyncProvider>
    </div>
  );
}
