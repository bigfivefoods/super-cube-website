"use client";

import Link from "next/link";
import { hasFullPathwayAccess } from "@/lib/lms/entitlements";
import { loadLmsState } from "@/lib/lms/store";
import { COURSE_PRICE_ZAR, COURSE_PRICE_USD } from "@/lib/programmes";
import { useEffect, useState } from "react";

/** Soft paywall banner when DEMO_LMS_OPEN is false and user is not paid/demo */
export function PaywallCard() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const s = loadLmsState();
    setShow(!hasFullPathwayAccess(s));
  }, []);

  if (!show) return null;

  return (
    <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 sm:px-5">
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-amber-900/70">
        Full pathway
      </p>
      <p className="mt-1 text-sm font-semibold text-ink">
        Unlock courses, post assessment, and certificate
      </p>
      <p className="mt-1 text-[0.8125rem] leading-relaxed text-slate">
        Baseline stays free. Full access is R{COURSE_PRICE_ZAR} (or $
        {COURSE_PRICE_USD} USD) once via Paystack — no monthly fee.
      </p>
      <Link
        href="/pricing"
        className="mt-3 inline-flex min-h-10 items-center justify-center rounded-full bg-ink px-4 text-[0.8125rem] font-semibold text-white"
      >
        View pricing & pay →
      </Link>
    </div>
  );
}
