"use client";

import { useEffect } from "react";

/**
 * Native shell polish when running inside Capacitor (iOS / Android).
 * Safe no-op on the regular web / PWA.
 */
export function CapacitorInit() {
  useEffect(() => {
    let cancelled = false;

    async function boot() {
      try {
        const { Capacitor } = await import("@capacitor/core");
        if (!Capacitor.isNativePlatform()) return;
        if (cancelled) return;

        document.body.classList.add("capacitor-app");

        const { StatusBar, Style } = await import("@capacitor/status-bar");
        await StatusBar.setStyle({ style: Style.Dark }).catch(() => undefined);
        await StatusBar.setBackgroundColor({ color: "#0a0a0a" }).catch(
          () => undefined
        );

        const { SplashScreen } = await import("@capacitor/splash-screen");
        await SplashScreen.hide().catch(() => undefined);

        const { App } = await import("@capacitor/app");
        // Soft-handle Android back: go back in history when possible
        App.addListener("backButton", ({ canGoBack }) => {
          if (canGoBack) {
            window.history.back();
          } else {
            App.exitApp();
          }
        });
      } catch {
        // @capacitor/* not available or web-only
      }
    }

    void boot();
    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
