"use client";

import { useState } from "react";
import { downloadGrowthReportPdf } from "@/lib/lms/report-pdf";
import type { LocalAttempt, LocalLmsState } from "@/lib/lms/store";

export function DownloadReportButton({
  state,
  pre,
  post,
  className = "",
}: {
  state: LocalLmsState;
  pre: LocalAttempt;
  post?: LocalAttempt | null;
  className?: string;
}) {
  const [busy, setBusy] = useState(false);
  const [lastFile, setLastFile] = useState<string | null>(null);

  async function onDownload() {
    setBusy(true);
    try {
      // Defer so UI can show busy state
      await new Promise((r) => setTimeout(r, 20));
      const name = downloadGrowthReportPdf({ state, pre, post });
      setLastFile(name);
    } catch (e) {
      console.error(e);
      alert("Could not create the PDF. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={`flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3 ${className}`}>
      <button
        type="button"
        onClick={onDownload}
        disabled={busy}
        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full bg-ink px-5 py-2 text-[0.8125rem] font-semibold text-white transition hover:bg-ink-soft disabled:opacity-50"
      >
        <DownloadIcon />
        {busy
          ? "Preparing PDF…"
          : post
            ? "Download growth report (PDF)"
            : "Download baseline report (PDF)"}
      </button>
      {lastFile && (
        <p className="learn-meta">
          Saved · <span className="font-medium text-ink">{lastFile}</span>
        </p>
      )}
    </div>
  );
}

function DownloadIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 3v12" />
      <path d="m7 10 5 5 5-5" />
      <path d="M5 21h14" />
    </svg>
  );
}
