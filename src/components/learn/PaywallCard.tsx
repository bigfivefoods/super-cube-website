"use client";

import Link from "next/link";
import { hasFullPathwayAccess } from "@/lib/lms/entitlements";
import { sessionCount } from "@/lib/lms/curriculum-meta";
import { learnerProgrammeId } from "@/lib/lms/programme-copy";
import { loadLmsState } from "@/lib/lms/store";
import { COURSE_PRICE_USD, formatCoursePrice } from "@/lib/programmes";
import { useEffect, useState } from "react";

/** Soft paywall banner when DEMO_LMS_OPEN is false and user is not paid/demo */
export function PaywallCard() {
  const [show, setShow] = useState(false);
  const [n, setN] = useState(() => sessionCount("adults"));

  useEffect(() => {
    const s = loadLmsState();
    setShow(!hasFullPathwayAccess(s));
    setN(sessionCount(learnerProgrammeId(s) ?? "adults"));
  }, []);

  if (!show) return null;

  return (
    <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 sm:px-5">
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.12em] text-amber-900">
        Full pathway
      </p>
      <p className="mt-1 text-sm font-semibold text-ink" data-testid="paywall-unlock">
        Unlock all {n} sessions · {formatCoursePrice("ZAR")} once, lifetime access
      </p>
      <p className="mt-1 text-[0.8125rem] leading-relaxed text-slate">
        The baseline and the two Choices sample sessions stay free. Full access adds every session, spaced reviews,
        the after-test and a certificate for {formatCoursePrice("ZAR")} (or ${COURSE_PRICE_USD} USD) once via
        Paystack. No monthly fee.
      </p>
      <Link
        href="/pricing"
        className="mt-3 inline-flex min-h-10 items-center justify-center rounded-full sc-btn-primary px-4 text-[0.8125rem] font-semibold "
      >
        Unlock all {n} for {formatCoursePrice("ZAR")} →
      </Link>
    </div>
  );
}
