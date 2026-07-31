"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  syncLearnerState,
  type SyncStatus,
} from "@/lib/lms/sync";

/**
 * On Learn mount / auth change: pull → merge → push cloud progress.
 * Renders a slim status strip when syncing or on error.
 */
export function LmsSyncProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<SyncStatus>("idle");
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) {
      setStatus("offline");
      return;
    }

    let cancelled = false;

    async function run(reason: string) {
      setStatus("syncing");
      setMessage(null);
      const result = await syncLearnerState(supabase);
      if (cancelled) return;
      setStatus(result.status);
      setMessage(result.message ?? null);
      if (result.status === "synced") {
        // Clear success banner shortly
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

    const onSync = (e: Event) => {
      const detail = (e as CustomEvent).detail as
        | { status?: SyncStatus; message?: string }
        | undefined;
      if (detail?.status) {
        setStatus(detail.status);
        setMessage(detail.message ?? null);
      }
    };
    window.addEventListener("sc-lms-sync", onSync);

    return () => {
      cancelled = true;
      subscription.unsubscribe();
      window.removeEventListener("sc-lms-sync", onSync);
    };
  }, []);

  const show =
    status === "syncing" ||
    status === "error" ||
    status === "synced";

  return (
    <>
      {show && (
        <div
          className={`border-b px-3 py-1.5 text-center text-[0.7rem] font-medium ${
            status === "error"
              ? "border-red-200 bg-red-50 text-red-800"
              : status === "synced"
                ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                : "border-black/[0.06] bg-white text-muted"
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
