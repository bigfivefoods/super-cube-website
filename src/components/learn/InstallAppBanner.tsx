"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

const DISMISS_KEY = "sc_install_dismissed_until";
const DISMISS_DAYS = 14;

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    Boolean((navigator as Navigator & { standalone?: boolean }).standalone)
  );
}

function isIosDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  return (
    /iPad|iPhone|iPod/.test(ua) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

function isDismissed(): boolean {
  try {
    const until = localStorage.getItem(DISMISS_KEY);
    if (!until) return false;
    return Date.now() < Number(until);
  } catch {
    return false;
  }
}

function setDismissedForDays(days: number) {
  try {
    localStorage.setItem(
      DISMISS_KEY,
      String(Date.now() + days * 24 * 60 * 60 * 1000)
    );
  } catch {
    /* ignore */
  }
}

/** Share icon matching iOS Safari toolbar */
function ShareIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 3v12m0-12 4 4m-4-4-4 4M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"
      />
    </svg>
  );
}

/**
 * Install / Add to Home Screen for Super-Cube® Learn.
 * - Chrome/Edge/Android: native beforeinstallprompt
 * - iOS Safari: step-by-step Share → Add to Home Screen guide
 */
export function InstallAppBanner() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null
  );
  const [dismissed, setDismissed] = useState(true); // hide until client check
  const [standalone, setStandalone] = useState(true);
  const [ios, setIos] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setStandalone(isStandalone());
    setIos(isIosDevice());
    setDismissed(isDismissed());
    setReady(true);

    const onBip = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onBip);

    const onInstalled = () => {
      setDeferred(null);
      setStandalone(true);
      setShowGuide(false);
    };
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBip);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const dismiss = useCallback(() => {
    setDismissed(true);
    setShowGuide(false);
    setDismissedForDays(DISMISS_DAYS);
  }, []);

  const installNative = useCallback(async () => {
    if (!deferred) return;
    setInstalling(true);
    try {
      await deferred.prompt();
      const choice = await deferred.userChoice;
      if (choice.outcome === "accepted") {
        setStandalone(true);
      }
    } finally {
      setDeferred(null);
      setInstalling(false);
    }
  }, [deferred]);

  if (!ready || standalone || dismissed) return null;
  // Show for iOS always; for others only when install prompt is available
  if (!ios && !deferred) return null;

  return (
    <>
      <div className="border-b border-black/[0.08] bg-ink text-white">
        <div className="container-site flex items-center gap-3 py-3">
          <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-white/15 bg-white/10">
            <Image
              src="/icons/icon-192.png"
              alt=""
              width={44}
              height={44}
              className="h-full w-full object-cover"
            />
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-[0.8125rem] font-semibold tracking-tight">
              Super-Cube® Learn
            </p>
            <p className="text-[0.7rem] leading-snug text-white/65">
              {ios
                ? "Add to your Home Screen for one-tap access and a full-screen app."
                : "Install for offline-ready, full-screen learning."}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            {deferred ? (
              <button
                type="button"
                onClick={installNative}
                disabled={installing}
                className="rounded-full bg-white px-3.5 py-2 text-[0.75rem] font-semibold text-ink disabled:opacity-60"
              >
                {installing ? "…" : "Install"}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setShowGuide(true)}
                className="inline-flex items-center gap-1.5 rounded-full bg-white px-3.5 py-2 text-[0.75rem] font-semibold text-ink"
              >
                <ShareIcon className="h-3.5 w-3.5" />
                Add to Home
              </button>
            )}
            <button
              type="button"
              onClick={dismiss}
              className="rounded-full px-2.5 py-2 text-[0.7rem] font-semibold text-white/55 hover:text-white"
              aria-label="Dismiss install prompt"
            >
              ✕
            </button>
          </div>
        </div>
      </div>

      {showGuide && (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 p-3 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="install-guide-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowGuide(false);
          }}
        >
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="border-b border-black/[0.06] px-5 py-4">
              <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-muted">
                Install app
              </p>
              <h2
                id="install-guide-title"
                className="mt-1 text-lg font-semibold tracking-tight text-ink"
              >
                Add Super-Cube® to your Home Screen
              </h2>
              <p className="mt-1 text-sm text-slate">
                Takes about 10 seconds in Safari. Opens full-screen like a native
                app.
              </p>
            </div>

            <ol className="space-y-4 px-5 py-5">
              <li className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink text-xs font-bold text-white">
                  1
                </span>
                <div className="min-w-0 pt-0.5">
                  <p className="text-sm font-semibold text-ink">
                    Tap the Share button
                  </p>
                  <p className="mt-0.5 text-[0.8125rem] text-slate">
                    In Safari, use the{" "}
                    <span className="inline-flex items-center gap-0.5 font-semibold text-ink">
                      <ShareIcon className="inline h-3.5 w-3.5" /> Share
                    </span>{" "}
                    icon at the bottom of the screen (or top on iPad).
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink text-xs font-bold text-white">
                  2
                </span>
                <div className="min-w-0 pt-0.5">
                  <p className="text-sm font-semibold text-ink">
                    Scroll and tap “Add to Home Screen”
                  </p>
                  <p className="mt-0.5 text-[0.8125rem] text-slate">
                    You may need to swipe the share sheet up to see it. Look for
                    the icon with a + on a square.
                  </p>
                </div>
              </li>
              <li className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink text-xs font-bold text-white">
                  3
                </span>
                <div className="min-w-0 pt-0.5">
                  <p className="text-sm font-semibold text-ink">Tap Add</p>
                  <p className="mt-0.5 text-[0.8125rem] text-slate">
                    Confirm the name “Super-Cube Learn”, then open it from your
                    Home Screen anytime.
                  </p>
                </div>
              </li>
            </ol>

            <div className="flex gap-2 border-t border-black/[0.06] px-5 py-4">
              <button
                type="button"
                onClick={() => setShowGuide(false)}
                className="flex min-h-11 flex-1 items-center justify-center rounded-full bg-ink text-sm font-semibold text-white"
              >
                Got it — open Share
              </button>
              <button
                type="button"
                onClick={dismiss}
                className="min-h-11 shrink-0 rounded-full border border-black/[0.1] px-4 text-sm font-semibold text-ink"
              >
                Not now
              </button>
            </div>

            <p className="px-5 pb-4 text-center text-[0.65rem] text-muted">
              Must use Safari on iPhone. Chrome on iOS cannot add this site to
              Home Screen the same way.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
