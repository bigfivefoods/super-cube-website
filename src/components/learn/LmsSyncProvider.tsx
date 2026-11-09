"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { stripLocale } from "@/lib/i18n/config";
import type { SyncStatus } from "@/lib/lms/sync";

/**
 * On Learn mount / auth change: pull → merge → push cloud progress.
 * Renders a slim status strip when syncing or on error.
 */
export function LmsSyncProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<SyncStatus>("idle");
  const [message, setMessage] = useState<string | null>(null);
  // The profile step has nothing to sync yet. Loading Supabase here competes with first paint.
  const defer = stripLocale(usePathname() || "/") === "/learn/welcome";

  useEffect(() => {
    if (defer) return;
    let cancelled = false;
    let unsubscribe = () => {};

    const onSync = (e: Event) => {
      const detail = (e as CustomEvent).detail as
        { status?: SyncStatus; message?: string } | undefined;
      if (detail?.status) {
        setStatus(detail.status);
        setMessage(detail.message ?? null);
      }
    };
    window.addEventListener("sc-lms-sync", onSync);

    // Supabase is a large client. Load it after first paint so the welcome
    // screen is not waiting on it (the profile step does not sync yet).
    void (async () => {
      const { createClient } = await import("@/lib/supabase/client");
      if (cancelled) return;
      const supabase = createClient();
      if (!supabase) {
        setStatus("offline");
        return;
      }
      const { syncLearnerState } = await import("@/lib/lms/sync");
      const { claimDeviceBaselines } = await import("@/lib/lms/cloud");
      if (cancelled) return;

      async function run(reason: string) {
        setStatus("syncing");
        setMessage(null);
        const result = await syncLearnerState(supabase!);
        if (cancelled) return;
        setStatus(result.status);
        setMessage(result.message ?? null);
        if (result.status === "synced") {
          // A baseline taken before signing in becomes the account's locked baseline
          void claimDeviceBaselines();
          window.setTimeout(() => {
            if (!cancelled) setStatus("idle");
          }, 2500);
        }
        void reason;
      }

      void run("mount");

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((event) => {
        if (
          event === "SIGNED_IN" ||
          event === "TOKEN_REFRESHED" ||
          event === "USER_UPDATED"
        ) {
          void run(event);
        }
        if (event === "SIGNED_OUT") {
          setStatus("unsigned");
          setMessage(null);
        }
      });
      unsubscribe = () => subscription.unsubscribe();
    })();

    return () => {
      cancelled = true;
      unsubscribe();
      window.removeEventListener("sc-lms-sync", onSync);
    };
  }, [defer]);

  const show =
    status === "syncing" || status === "error" || status === "synced";

  return (
    <>
      {show && (
        <div
          className={`border-b px-3 py-1.5 text-center text-[0.7rem] font-medium ${
            status === "error"
              ? "border-red-200 bg-red-50 text-red-800"
              : status === "synced"
                ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                : "border-line bg-elevated text-muted"
          }`}
          role="status"
        >
          {status === "syncing" && "Syncing progress to the cloud…"}
          {status === "synced" && (message || "Progress synced.")}
          {status === "error" && (message || "Cloud sync failed.")}
        </div>
      )}
      {children}
    </>
  );
}
