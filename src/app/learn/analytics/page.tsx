"use client";

import { useEffect, useState } from "react";
import { LearnShell } from "@/components/learn/LearnShell";
import {
  clearAnalyticsLog,
  FUNNEL_GOALS,
  funnelCounts,
  getAnalyticsLog,
  type AnalyticsRow,
} from "@/lib/analytics";

/**
 * Local-device funnel debug — not multi-user server analytics.
 * Site-wide visits require NEXT_PUBLIC_GA_ID (see docs/ANALYTICS.md).
 */
export default function LearnAnalyticsPage() {
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [log, setLog] = useState<AnalyticsRow[]>([]);
  const gaConfigured = Boolean(process.env.NEXT_PUBLIC_GA_ID);

  function refresh() {
    setCounts(funnelCounts());
    setLog(getAnalyticsLog().slice(-40).reverse());
  }

  useEffect(() => {
    refresh();
  }, []);

  return (
    <LearnShell
      title="Funnel analytics"
      subtitle="Counts on this device only. For all visitors, configure Google Analytics (docs/ANALYTICS.md)."
    >
      <div
        className={`mb-4 rounded-2xl border px-4 py-3 text-sm ${
          gaConfigured
            ? "border-emerald-200 bg-emerald-50 text-emerald-900"
            : "border-amber-200 bg-amber-50 text-amber-950"
        }`}
      >
        {gaConfigured ? (
          <>
            <strong>GA4 is configured</strong> on this build. View site-wide
            reports at analytics.google.com (Realtime + Engagement).
          </>
        ) : (
          <>
            <strong>GA4 not configured.</strong> Set{" "}
            <code className="text-xs">NEXT_PUBLIC_GA_ID</code> in Vercel
            Production and redeploy. See <code className="text-xs">docs/ANALYTICS.md</code>.
          </>
        )}
      </div>

      <section className="learn-card mb-4">
        <h2 className="learn-card-title">Conversion goals</h2>
        <ul className="mt-3 space-y-2">
          {FUNNEL_GOALS.map((g) => (
            <li
              key={g.event}
              className="flex items-center justify-between rounded-xl bg-[#fafafa] px-3 py-2 text-sm"
            >
              <span className="font-medium text-ink">{g.label}</span>
              <span className="tabular-nums font-semibold text-ink">
                {counts[g.event] ?? 0}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="learn-card mb-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="learn-card-title">Recent events</h2>
          <div className="flex gap-2">
            <button type="button" className="learn-btn learn-btn-ghost" onClick={refresh}>
              Refresh
            </button>
            <button
              type="button"
              className="learn-btn learn-btn-ghost"
              onClick={() => {
                clearAnalyticsLog();
                refresh();
              }}
            >
              Clear log
            </button>
          </div>
        </div>
        <ul className="mt-3 max-h-80 space-y-1.5 overflow-y-auto text-[0.75rem]">
          {log.length === 0 && (
            <li className="text-muted">No events yet on this device.</li>
          )}
          {log.map((row, i) => (
            <li
              key={`${row.ts}-${i}`}
              className="rounded-lg border border-black/[0.05] px-2.5 py-1.5 font-mono text-slate"
            >
              <span className="font-semibold text-ink">{row.event}</span>
              <span className="text-muted"> · {row.path}</span>
              <span className="mt-0.5 block text-[0.65rem] text-muted">
                {new Date(row.ts).toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </LearnShell>
  );
}
