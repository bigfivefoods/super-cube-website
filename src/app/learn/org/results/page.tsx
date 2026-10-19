"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { LearnShell } from "@/components/learn/LearnShell";
import { track } from "@/lib/analytics";
import { faceInkStyle } from "@/lib/contrast";
import {
  completionRate,
  faceRows,
  funnelRows,
  orgResultsCsv,
  overallRow,
  type FaceRow,
  type OrgResultsRaw,
} from "@/lib/lms/org-results";

type Org = { id: string; name: string; code: string; kind: string };
type Load =
  | { state: "loading" }
  | { state: "sign_in" }
  | { state: "not_admin" }
  | { state: "not_ready"; orgs: Org[] }
  | { state: "unavailable" }
  | { state: "ready"; orgs: Org[]; results: OrgResultsRaw };

const f1 = (v: number | undefined) => (v != null && Number.isFinite(v) ? (Math.round(v * 10) / 10).toFixed(1) : "–");
const sign = (v: number | undefined) => (v != null && Number.isFinite(v) ? `${v > 0 ? "+" : ""}${f1(v)}` : "–");
const pctOf = (a: number, b: number) => (b > 0 ? `${Math.round((a / b) * 100)}%` : "–");

export default function OrgResultsPage() {
  const [load, setLoad] = useState<Load>({ state: "loading" });
  const [orgId, setOrgId] = useState<string>(() =>
    typeof window === "undefined" ? "" : (new URLSearchParams(window.location.search).get("org") ?? ""),
  );

  const fetchResults = useCallback(async (id: string) => {
    try {
      const r = await fetch(`/api/org/results${id ? `?org=${encodeURIComponent(id)}` : ""}`, { cache: "no-store" });
      const j = (await r.json().catch(() => ({}))) as { error?: string; orgs?: Org[]; results?: OrgResultsRaw };
      if (r.status === 401) return setLoad({ state: "sign_in" });
      if (j.error === "not_admin") return setLoad({ state: "not_admin" });
      if (j.error === "not_ready") return setLoad({ state: "not_ready", orgs: j.orgs ?? [] });
      if (!r.ok || !j.results) return setLoad({ state: "unavailable" });
      setLoad({ state: "ready", orgs: j.orgs ?? [], results: j.results });
      if (!id && j.results.org) setOrgId(j.results.org.id);
    } catch {
      setLoad({ state: "unavailable" });
    }
  }, []);

  useEffect(() => {
    void fetchResults(new URLSearchParams(window.location.search).get("org") ?? "");
  }, [fetchResults]);

  function downloadCsv(raw: OrgResultsRaw) {
    const csv = orgResultsCsv(raw);
    const url = URL.createObjectURL(new Blob(["\uFEFF", csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `super-cube-results-${(raw.org?.code ?? "organisation").replace(/[^A-Za-z0-9-]/g, "")}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    track("org_results_download", { format: "csv" });
  }

  return (
    <LearnShell
      title="Organisation results"
      subtitle="Super-Cube® results for your organisation: aggregates of learners who share progress, never names or journals."
      hideJourneyRail
    >
      {load.state === "loading" && <p className="learn-meta" role="status">Loading results…</p>}

      {load.state === "sign_in" && (
        <Notice title="Sign in to see your organisation's results">
          <Link href="/login?next=%2Flearn%2Forg%2Fresults" className="learn-btn learn-btn-primary mt-3 inline-flex">
            Sign in
          </Link>
        </Notice>
      )}
      {load.state === "not_admin" && (
        <Notice title="Organisation admins only">
          Results are shown to your organisation&apos;s admins. Ask your Super-Cube® contact or your organisation&apos;s
          admin for an admin invite. Coaches can use{" "}
          <Link href="/learn/coach" className="underline">
            Coach tools
          </Link>
          .
        </Notice>
      )}
      {load.state === "not_ready" && (
        <Notice title="Results are not switched on yet">
          Organisation results are being set up for this site. Please check back soon.
        </Notice>
      )}
      {load.state === "unavailable" && (
        <Notice title="Results unavailable">We could not load results just now. Please try again in a moment.</Notice>
      )}

      {load.state === "ready" && (
        <Dashboard
          raw={load.results}
          orgs={load.orgs}
          orgId={orgId || load.results.org?.id || ""}
          onOrg={(id) => {
            setOrgId(id);
            setLoad({ state: "loading" });
            window.history.replaceState(null, "", `/learn/org/results?org=${encodeURIComponent(id)}`);
            void fetchResults(id);
          }}
          onCsv={() => downloadCsv(load.results)}
        />
      )}
    </LearnShell>
  );
}

function Notice({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="learn-card" data-testid="org-results-notice">
      <h2 className="learn-card-title">{title}</h2>
      <div className="learn-body mt-1.5">{children}</div>
    </section>
  );
}

function Kpi({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="learn-card">
      <p className="learn-eyebrow">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-ink">{value}</p>
      {hint && <p className="learn-meta mt-0.5">{hint}</p>}
    </div>
  );
}

function Dashboard({
  raw,
  orgs,
  orgId,
  onOrg,
  onCsv,
}: {
  raw: OrgResultsRaw;
  orgs: Org[];
  orgId: string;
  onOrg: (id: string) => void;
  onCsv: () => void;
}) {
  const faces = faceRows(raw);
  const overall = overallRow(raw);
  const steps = funnelRows(raw);
  const completion = completionRate(raw);
  const e = raw.engagement;
  const k = raw.min_group;
  const maxWeek = Math.max(1, ...e.weekly_active.map((w) => w.active));
  const generated = new Date(raw.generated_at).toLocaleString("en-ZA", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Africa/Johannesburg",
  });

  return (
    <div className="space-y-4" data-testid="org-results">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          {orgs.length > 1 ? (
            <label className="block">
              <span className="learn-eyebrow">Organisation</span>
              <select
                value={orgId}
                onChange={(ev) => onOrg(ev.target.value)}
                className="mt-1 block min-h-11 rounded-full border border-line-strong bg-elevated px-4 text-sm font-semibold text-ink"
              >
                {orgs.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </select>
            </label>
          ) : (
            <>
              <p className="learn-eyebrow">Organisation</p>
              <p className="text-lg font-semibold tracking-tight text-ink">{raw.org?.name}</p>
            </>
          )}
          <p className="learn-meta mt-1">
            Cohort code {raw.org?.code} · updated {generated} SAST
          </p>
        </div>
        <button type="button" onClick={onCsv} className="learn-btn learn-btn-primary" data-testid="org-results-csv">
          Download CSV
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="Learners" value={String(raw.funnel.joined)} hint={`${raw.funnel.consented} sharing progress`} />
        <Kpi
          label="Overall change"
          value={overall.suppressed ? "–" : sign(overall.change?.mean)}
          hint={overall.suppressed ? `Shown once ${k}+ have re-measured` : `${f1(overall.before?.mean)} → ${f1(overall.after?.mean)} · n ${overall.n}`}
        />
        <Kpi
          label="Completion rate"
          value={completion == null ? "–" : `${completion}%`}
          hint={`${raw.funnel.remeasured} of ${raw.funnel.baseline} took the after-test`}
        />
        <Kpi
          label="Active this week"
          value={pctOf(e.active_7d, raw.funnel.consented)}
          hint={`${e.active_7d} of ${raw.funnel.consented} · ${e.active_30d} in 30 days`}
        />
      </div>

      <section className="learn-card" aria-labelledby="faces-h">
        <h2 id="faces-h" className="learn-card-title">
          Before and after, by Super-Cube® face
        </h2>
        <p className="learn-meta mt-0.5">
          28-question baseline vs after-test, paired learners only, 0–100. Bars show the after mean; the tick marks the
          baseline. 95% CI of the change and Cohen&apos;s d (0.2 small, 0.5 medium, 0.8 large). Faces with fewer than {k}{" "}
          paired learners stay hidden.
        </p>
        <ul className="mt-4 space-y-3" data-testid="org-results-faces">
          {[...faces, overall].map((f) => (
            <FaceBar key={f.id} f={f} k={k} />
          ))}
        </ul>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="learn-card" aria-labelledby="funnel-h">
          <h2 id="funnel-h" className="learn-card-title">
            Completion
          </h2>
          <p className="learn-meta mt-0.5">Share of learners who joined. Coaches and admins are not counted.</p>
          <ol className="mt-3 space-y-2" data-testid="org-results-funnel">
            {steps.map((s) => (
              <li key={s.key}>
                <div className="flex items-baseline justify-between gap-2 text-[0.8125rem]">
                  <span className="text-ink">{s.label}</span>
                  <span className="tabular-nums text-slate">
                    {s.count} · {s.pct}%
                  </span>
                </div>
                <div className="mt-1 h-2 rounded-full bg-surface" aria-hidden>
                  <div className="h-2 rounded-full bg-ink" style={{ width: `${s.pct}%` }} />
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="learn-card" aria-labelledby="eng-h">
          <h2 id="eng-h" className="learn-card-title">
            Engagement
          </h2>
          <dl className="mt-3 grid grid-cols-2 gap-3 text-[0.8125rem]">
            <Stat label="Sessions completed" value={String(e.sessions_completed)} />
            <Stat
              label="Average progress"
              value={e.avg_session_share == null ? "–" : `${Math.round(Number(e.avg_session_share) * 100)}%`}
            />
            <Stat label="Median streak" value={e.median_streak == null ? "–" : `${Math.round(Number(e.median_streak))} days`} />
            <Stat label="Practice minutes (30 days)" value={String(Math.round(Number(e.minutes_30d)))} />
          </dl>
          <h3 className="mt-4 text-[0.8125rem] font-semibold text-ink">Active learners per week</h3>
          <div className="mt-2 flex h-24 items-end gap-1.5" role="img" aria-label={`Active learners per week: ${e.weekly_active.map((w) => w.active).join(", ")}`}>
            {e.weekly_active.map((w) => (
              <div key={w.week} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-[0.625rem] tabular-nums text-slate">{w.active}</span>
                <div className="w-full rounded-t bg-ink/80" style={{ height: `${Math.max(3, (w.active / maxWeek) * 64)}px` }} />
              </div>
            ))}
          </div>
          <div className="mt-1 flex gap-1.5 text-[0.5625rem] text-muted" aria-hidden>
            {e.weekly_active.map((w) => (
              <span key={w.week} className="flex-1 text-center">
                {new Date(w.week).toLocaleDateString("en-ZA", { day: "numeric", month: "short" })}
              </span>
            ))}
          </div>
        </section>
      </div>

      <p className="learn-meta">
        Self-report scores from the server-scored Super-Cube® questionnaire; no control group. Only learners who chose to
        share progress with their cohort are included, and no individual can be singled out. The CSV holds the same
        aggregates.
      </p>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="learn-card-muted">
      <dt className="learn-meta">{label}</dt>
      <dd className="mt-0.5 text-lg font-semibold tabular-nums text-ink">{value}</dd>
    </div>
  );
}

function FaceBar({ f, k }: { f: FaceRow; k: number }) {
  const isOverall = f.id === "overall";
  return (
    <li className={isOverall ? "border-t border-line pt-3" : ""} data-face={f.id}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
        <span className={`text-[0.875rem] font-semibold ${isOverall ? "text-ink" : "face-ink"}`} style={isOverall ? undefined : faceInkStyle(f.color)}>
          {f.name}
        </span>
        {f.suppressed ? (
          <span className="learn-meta">
            {f.n > 0 ? `${f.n} paired · ` : ""}shown once {k}+ have both measures
          </span>
        ) : (
          <span className="text-[0.8125rem] tabular-nums text-ink">
            {f1(f.before?.mean)} → {f1(f.after?.mean)} <strong>({sign(f.change?.mean)})</strong>
            <span className="text-slate">
              {" "}
              · CI {sign(f.change?.low)} to {sign(f.change?.high)} · d {f.d == null ? "–" : f.d.toFixed(2)}
              {f.label ? ` ${f.label}` : ""} · n {f.n}
            </span>
          </span>
        )}
      </div>
      {!f.suppressed && (
        <div className="relative mt-1.5 h-2.5 rounded-full bg-surface" aria-hidden>
          <div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{ width: `${Math.min(100, f.after?.mean ?? 0)}%`, background: f.color }}
          />
          <div
            className="absolute -top-1 h-[1.125rem] w-0.5 rounded bg-ink"
            style={{ left: `calc(${Math.min(100, f.before?.mean ?? 0)}% - 1px)` }}
            title="Baseline"
          />
        </div>
      )}
    </li>
  );
}
