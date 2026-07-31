"use client";

import { useParams } from "next/navigation";
import { useMemo } from "react";
import { constructs } from "@/lib/content";
import {
  decodeShareToken,
  type ReportSharePayload,
} from "@/lib/lms/share";
import Link from "next/link";

export default function SharedReportPage() {
  const params = useParams();
  const token = String(params.token ?? "");

  const payload = useMemo(
    () => (token ? decodeShareToken(token) : null),
    [token]
  );

  if (!payload) {
    return (
      <main className="mx-auto max-w-lg px-4 py-20 text-center">
        <p className="text-sm font-semibold uppercase tracking-wider text-muted">
          Share link
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-ink">
          This growth summary could not be opened
        </h1>
        <p className="mt-3 text-sm text-slate">
          The link may be incomplete or corrupted. Ask the learner to re-share
          from their report page.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white"
        >
          Super-Cube® home
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-[100svh] bg-[#fafafa]">
      <div className="border-b border-black/[0.06] bg-white">
        <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted">
            Shared growth summary · Super-Cube®
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            {payload.name}
          </h1>
          <p className="mt-2 text-sm text-slate">
            {payload.programmeName}
            {payload.orgCode ? ` · Cohort ${payload.orgCode}` : ""}
          </p>
          <p className="mt-1 text-xs text-muted">
            Snapshot of{" "}
            {new Date(payload.completedAt).toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
            · Developmental profile, not a clinical diagnosis
          </p>

          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Stat
              label="Baseline"
              value={String(payload.preOverall)}
            />
            <Stat
              label="Post"
              value={
                payload.postOverall != null
                  ? String(payload.postOverall)
                  : "—"
              }
            />
            <Stat
              label="Growth"
              value={
                payload.growth != null
                  ? `${payload.growth > 0 ? "+" : ""}${payload.growth}`
                  : "Pending post"
              }
            />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-muted">
          By construct
        </h2>
        <ul className="mt-4 space-y-2">
          {payload.constructs.map((row) => {
            const c = constructs.find((x) => x.id === row.id);
            return (
              <li
                key={row.id}
                className="flex items-center gap-3 rounded-xl border border-black/[0.07] bg-white px-3 py-3"
              >
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ background: c?.color ?? "#111" }}
                />
                <span className="min-w-0 flex-1 text-sm font-semibold text-ink">
                  {row.name}
                </span>
                <span className="text-sm tabular-nums text-slate">
                  {row.pre}
                  {row.post != null ? ` → ${row.post}` : ""}
                </span>
                {row.delta != null && (
                  <span
                    className={`text-xs font-semibold tabular-nums ${
                      row.delta > 0
                        ? "text-emerald-700"
                        : row.delta < 0
                          ? "text-amber-700"
                          : "text-muted"
                    }`}
                  >
                    {row.delta > 0 ? "+" : ""}
                    {row.delta}
                  </span>
                )}
              </li>
            );
          })}
        </ul>

        {payload.certificateId && (
          <p className="mt-8 text-center text-xs text-muted">
            Certificate ID{" "}
            <Link
              href={`/verify/${payload.certificateId}`}
              className="font-semibold text-ink underline-offset-2 hover:underline"
            >
              {payload.certificateId}
            </Link>
          </p>
        )}

        <div className="mt-10 text-center">
          <Link
            href="/pricing"
            className="inline-flex rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white"
          >
            Start your Super-Cube® pathway
          </Link>
        </div>
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-black/[0.07] bg-white px-3 py-3">
      <p className="text-[0.65rem] font-semibold uppercase tracking-wider text-muted">
        {label}
      </p>
      <p className="mt-1 text-xl font-semibold tabular-nums text-ink">{value}</p>
    </div>
  );
}
