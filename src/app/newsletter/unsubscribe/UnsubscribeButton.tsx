"use client";

import { useState } from "react";

export function UnsubscribeButton({ token }: { token: string }) {
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");

  async function go() {
    setState("busy");
    try {
      const res = await fetch(`/api/newsletter/unsubscribe?t=${encodeURIComponent(token)}`, {
        method: "POST",
      });
      setState(res.ok ? "done" : "error");
    } catch {
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <p className="mt-6 rounded-xl border border-line bg-elevated p-4 text-ink" role="status">
        You’re unsubscribed. You won’t receive further newsletters.
      </p>
    );
  }
  return (
    <div className="mt-6">
      <button
        type="button"
        onClick={go}
        disabled={state === "busy"}
        className="sc-btn-primary inline-flex min-h-11 items-center justify-center rounded-full px-6 text-sm font-semibold"
      >
        {state === "busy" ? "Unsubscribing…" : "Unsubscribe me"}
      </button>
      {state === "error" && (
        <p className="mt-3 text-sm text-slate" role="alert">
          That link didn’t work. Please contact us and we’ll remove you.
        </p>
      )}
    </div>
  );
}
