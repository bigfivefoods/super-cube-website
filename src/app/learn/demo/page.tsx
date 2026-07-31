"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LearnShell } from "@/components/learn/LearnShell";
import { track } from "@/lib/analytics";
import { unlockDemo } from "@/lib/lms/store";
import { programmes, type ProgrammeId } from "@/lib/programmes";

/**
 * Free sample path: unlock demo access without Paystack so people can
 * orient + try a construct course before buying.
 */
export default function LearnDemoPage() {
  const router = useRouter();
  const [busy, setBusy] = useState<ProgrammeId | null>(null);

  function start(programmeId: ProgrammeId) {
    setBusy(programmeId);
    unlockDemo(programmeId);
    track("demo_start", { programmeId });
    router.push("/learn/assessment/orientation");
  }

  return (
    <LearnShell
      title="Try Super-Cube® free"
      subtitle="Unlock a full demo pathway on this device—orientation, six faces, and practice. No card required. Upgrade anytime for paid access and multi-device sync."
    >
      <div className="mb-5 rounded-2xl border border-black/[0.07] bg-white p-4 sm:p-5">
        <p className="learn-eyebrow">What you get</p>
        <ul className="mt-2 space-y-1.5 text-[0.8125rem] leading-relaxed text-slate">
          <li>· Pre-pre orientation + baseline self-assessment</li>
          <li>· All six construct courses for your age band</li>
          <li>· Session reflections, streak, and growth report tools</li>
          <li>· Private to this browser until you create an account &amp; sync</li>
        </ul>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {programmes.map((p) => (
          <button
            key={p.id}
            type="button"
            disabled={busy !== null}
            onClick={() => start(p.id)}
            className="learn-card flex flex-col items-start text-left transition hover:border-black/20 disabled:opacity-60"
          >
            <p className="learn-eyebrow">{p.ageLabel}</p>
            <p className="mt-1 text-[0.9375rem] font-semibold text-ink">
              {p.name.replace("Super-Cube® ", "")}
            </p>
            <p className="mt-1.5 flex-1 text-[0.75rem] leading-snug text-slate">
              {p.tagline}
            </p>
            <span className="mt-3 text-[0.8125rem] font-semibold text-ink">
              {busy === p.id ? "Starting…" : "Start free demo →"}
            </span>
          </button>
        ))}
      </div>

      <p className="learn-meta mt-6">
        Ready to purchase?{" "}
        <Link href="/pricing" className="font-semibold text-ink underline-offset-2 hover:underline">
          See pricing
        </Link>{" "}
        · Already learning?{" "}
        <Link href="/learn" className="font-semibold text-ink underline-offset-2 hover:underline">
          Dashboard
        </Link>
      </p>
    </LearnShell>
  );
}
