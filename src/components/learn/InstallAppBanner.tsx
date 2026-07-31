"use client";

import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

/**
 * “Install Super-Cube Learn” banner for PWA (Chrome/Android/desktop).
 * iOS uses Add to Home Screen — we show a short tip instead.
 */
export function InstallAppBanner() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null
  );
  const [dismissed, setDismissed] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [standalone, setStandalone] = useState(false);

  useEffect(() => {
    const standaloneMode =
      window.matchMedia("(display-mode: standalone)").matches ||
      // iOS Safari
      Boolean(
        (navigator as Navigator & { standalone?: boolean }).standalone
      );
    setStandalone(standaloneMode);

    const ua = navigator.userAgent;
    const ios = /iPad|iPhone|iPod/.test(ua) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    setIsIos(ios);

    try {
      if (sessionStorage.getItem("sc_install_dismissed") === "1") {
        setDismissed(true);
      }
    } catch {
      /* ignore */
    }

    const onBip = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", onBip);
    return () => window.removeEventListener("beforeinstallprompt", onBip);
  }, []);

  if (standalone || dismissed) return null;
  if (!deferred && !isIos) return null;

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    try {
      await deferred.userChoice;
    } finally {
      setDeferred(null);
    }
  }

  function dismiss() {
    setDismissed(true);
    try {
      sessionStorage.setItem("sc_install_dismissed", "1");
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="border-b border-black/[0.06] bg-ink text-white">
      <div className="container-site flex flex-col gap-2 py-2.5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-[0.8125rem] font-semibold tracking-tight">
            Install Super-Cube® Learn
          </p>
          <p className="text-[0.7rem] text-white/65">
            {isIos && !deferred
              ? "On iPhone: Share → Add to Home Screen for a full-screen app."
              : "Add to your home screen for a faster, full-screen learning experience."}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          {deferred && (
            <button
              type="button"
              onClick={install}
              className="rounded-full bg-white px-3.5 py-1.5 text-[0.75rem] font-semibold text-ink"
            >
              Install app
            </button>
          )}
          <button
            type="button"
            onClick={dismiss}
            className="rounded-full border border-white/25 px-3.5 py-1.5 text-[0.75rem] font-semibold text-white/90"
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}
