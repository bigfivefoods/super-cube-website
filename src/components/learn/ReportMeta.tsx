"use client";

import Link from "next/link";
import {
  AGE_BANDS,
  COHORT_KINDS,
  CONTEXTS,
  ROLES,
  getProfile,
  profileStory,
} from "@/lib/lms/profile";
import type { LocalLmsState } from "@/lib/lms/store";
import { getProgramme } from "@/lib/programmes";

/** Learner identity + assessment timeline strip for the Report page. */
export function ReportMeta({ state }: { state: LocalLmsState }) {
  const profile = getProfile(state);
  const pre = state.attempts.find((a) => a.phase === "pre");
  const post = state.attempts.find((a) => a.phase === "post");
  const mid = state.attempts.find((a) => a.phase === "mid");
  const programme = getProgramme(
    pre?.programmeId ||
      state.subscription?.programmeId ||
      state.user?.programmeId ||
      profile?.programmeId ||
      ""
  );
  const pulseCount = state.facePulses?.length ?? 0;
  const sessions = Object.values(state.lessonProgress).filter(
    (s) => s === "completed"
  ).length;

  const role = profile?.role
    ? ROLES.find((r) => r.id === profile.role)?.label
    : null;
  const context = profile?.context
    ? CONTEXTS.find((c) => c.id === profile.context)?.label
    : null;
  const age = profile?.ageBand
    ? AGE_BANDS.find((a) => a.id === profile.ageBand)?.label
    : null;
  const cohort = profile?.cohortKind
    ? COHORT_KINDS.find((c) => c.id === profile.cohortKind)?.label
    : null;

  const name =
    profile?.displayName || state.user?.fullName || "Learner";

  return (
    <div className="mb-4 space-y-3">
      <section className="rounded-2xl border border-black/[0.07] bg-white p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="learn-eyebrow">Report for</p>
            <h2 className="mt-0.5 text-lg font-semibold tracking-tight text-ink">
              {name}
            </h2>
            <p className="mt-1 text-[0.8125rem] text-slate">
              {profile ? profileStory(profile) : programme?.name || "Super-Cube® Learn"}
            </p>
          </div>
          <Link
            href="/learn/account"
            className="text-[0.75rem] font-semibold text-ink underline-offset-2 hover:underline"
          >
            Open You →
          </Link>
        </div>

        <dl className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            ["Programme", programme?.name || "—"],
            ["Age", age || "—"],
            ["Role", role || "—"],
            ["Context", context || "—"],
            [
              "Location",
              [profile?.city, profile?.country].filter(Boolean).join(", ") ||
                "—",
            ],
            ["Cohort", state.orgCode || cohort || "Solo"],
            ["Sessions done", String(sessions)],
            ["Face pulses", String(pulseCount)],
          ].map(([k, v]) => (
            <div
              key={k}
              className="rounded-xl bg-[#fafafa] px-3 py-2.5"
            >
              <dt className="text-[0.65rem] font-semibold uppercase tracking-[0.08em] text-muted">
                {k}
              </dt>
              <dd className="mt-0.5 text-[0.8125rem] font-semibold text-ink">
                {v}
              </dd>
            </div>
          ))}
        </dl>

        {profile?.goal && (
          <p className="mt-3 rounded-xl border border-black/[0.05] bg-[#f8f9fb] px-3 py-2 text-[0.8125rem] text-slate">
            <span className="font-semibold text-ink">Goal · </span>
            {profile.goal}
          </p>
        )}
      </section>

      <section className="rounded-2xl border border-black/[0.07] bg-white p-4 sm:p-5">
        <h3 className="text-sm font-semibold text-ink">Assessment history</h3>
        <ol className="mt-3 space-y-2">
          {[
            {
              label: "Orientation",
              at: state.orientation?.completedAt,
              meta: state.orientation?.result.label,
            },
            {
              label: "Pre-assessment",
              at: pre?.completedAt,
              meta: pre ? `Overall ${pre.result.overall}` : undefined,
            },
            {
              label: "Mid check",
              at: mid?.completedAt,
              meta: mid ? `Overall ${mid.result.overall}` : undefined,
            },
            {
              label: "Post-assessment",
              at: post?.completedAt,
              meta: post ? `Overall ${post.result.overall}` : undefined,
            },
          ].map((row) => (
            <li
              key={row.label}
              className="flex items-center justify-between gap-3 rounded-xl border border-black/[0.05] px-3 py-2"
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-[0.65rem] font-bold ${
                    row.at
                      ? "bg-emerald-600 text-white"
                      : "border border-black/[0.12] text-muted"
                  }`}
                >
                  {row.at ? "✓" : "·"}
                </span>
                <div>
                  <p className="text-sm font-semibold text-ink">{row.label}</p>
                  {row.meta && (
                    <p className="text-[0.7rem] text-muted">{row.meta}</p>
                  )}
                </div>
              </div>
              <p className="text-[0.7rem] tabular-nums text-muted">
                {row.at ? new Date(row.at).toLocaleDateString() : "Pending"}
              </p>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
