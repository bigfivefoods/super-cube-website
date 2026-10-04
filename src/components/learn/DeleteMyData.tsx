"use client";

import { useState } from "react";
import { deleteAccountOnServer } from "@/lib/lms/cloud";
import { createClient } from "@/lib/supabase/client";

const LOCAL_KEYS = [
  "supercube_lms_v1",
  "supercube_analytics_v1",
  "sc_checkout_email",
  "sc_checkout_org",
  "sc_checkout_pack",
  "sc_checkout_programme",
  "sc_practice_reminder_day",
  "sc_pulse_reminder_day",
];

/**
 * POPIA right to erasure: deletes the cloud account (if signed in) and wipes
 * every Super-Cube® key from this browser. Requires typing DELETE.
 */
export function DeleteMyData() {
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function run() {
    if (typed !== "DELETE" || busy) return;
    setBusy(true);
    setResult(null);
    const r = await deleteAccountOnServer();
    if (r.kind === "error") {
      setBusy(false);
      setResult(
        `We could not delete your cloud account (${String(r.body.error || r.status)}). Nothing was removed. Please try again or email hello@super-cube.me.`,
      );
      return;
    }
    try {
      await createClient()?.auth.signOut();
    } catch {
      /* already signed out */
    }
    for (const k of LOCAL_KEYS) {
      try {
        localStorage.removeItem(k);
      } catch {
        /* ignore */
      }
    }
    setBusy(false);
    setResult(
      r.kind === "ok"
        ? "Done. Your Super-Cube® account, scores, sessions, reflections and certificates were deleted from our servers and from this browser."
        : "Done. Your data was deleted from this browser. You were not signed in, so there was no cloud account to delete.",
    );
    setTyped("");
  }

  return (
    <section className="learn-card border-red-200 lg:col-span-2" data-testid="delete-my-data">
      <h2 className="learn-card-title">Delete my data</h2>
      <p className="learn-body mt-2">
        Permanently erase your Super-Cube® account and learning data: profile, baseline and
        after-test scores, sessions, reflections, cohort progress, certificates and guardian
        consent records. Download a backup first if you want a copy. This cannot be undone.
      </p>
      {!open ? (
        <button
          type="button"
          className="learn-btn learn-btn-ghost mt-3 !text-red-700"
          onClick={() => setOpen(true)}
        >
          Delete my data…
        </button>
      ) : (
        <div className="mt-3 space-y-2">
          <label className="block">
            <span className="learn-label">Type DELETE to confirm</span>
            <input
              className="learn-input mt-1.5 w-full max-w-xs"
              value={typed}
              onChange={(e) => setTyped(e.target.value.trim())}
              name="confirmDelete"
              autoComplete="off"
            />
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="learn-btn bg-red-700 text-white disabled:opacity-40"
              disabled={typed !== "DELETE" || busy}
              onClick={() => void run()}
            >
              {busy ? "Deleting…" : "Permanently delete"}
            </button>
            <button type="button" className="learn-btn learn-btn-ghost" onClick={() => setOpen(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}
      {result && (
        <p className="mt-3 text-[0.8125rem] font-medium text-ink" role="status">
          {result}
        </p>
      )}
    </section>
  );
}
