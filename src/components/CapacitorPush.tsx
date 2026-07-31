"use client";

import { useEffect } from "react";

/**
 * Optional Capacitor Push Notifications bridge.
 * Install: npm run cap:add:push
 * Registers only when running inside a native Capacitor shell.
 */
export function CapacitorPush() {
  useEffect(() => {
    const w = window as Window & {
      Capacitor?: { isNativePlatform?: () => boolean };
    };
    if (!w.Capacitor?.isNativePlatform?.()) return;

    void (async () => {
      try {
        // Dynamic string keeps TypeScript happy when package is not installed
        const pkg = "@capacitor/push-notifications";
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const mod: any = await import(/* webpackIgnore: true */ pkg).catch(
          () => null
        );
        if (!mod?.PushNotifications) return;
        const PushNotifications = mod.PushNotifications;
        let perm = await PushNotifications.checkPermissions();
        if (perm.receive !== "granted") {
          perm = await PushNotifications.requestPermissions();
        }
        if (perm.receive !== "granted") return;
        await PushNotifications.register();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        PushNotifications.addListener("registration", (token: any) => {
          console.info("[push] token", String(token?.value || "").slice(0, 12));
        });
        PushNotifications.addListener(
          "pushNotificationActionPerformed",
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (action: any) => {
            const data = action?.notification?.data as
              | { url?: string }
              | undefined;
            if (data?.url) window.location.href = data.url;
          }
        );
      } catch {
        /* plugin not installed — optional */
      }
    })();
  }, []);

  return null;
}
