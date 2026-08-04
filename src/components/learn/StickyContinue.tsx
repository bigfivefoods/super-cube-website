"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { track } from "@/lib/analytics";
import { getNextBestAction } from "@/lib/lms/next-action";
import { loadLmsState } from "@/lib/lms/store";
import { useJourney } from "@/components/learn/JourneyProgress";

/**
 * Minimal sticky next-page CTA on mobile.
 * Hidden when the current page already is a focused flow.
 */
export function StickyContinue() {
  const journey = useJourney();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, [journey?.doneCount, pathname]);

  if (
    pathname.startsWith("/learn/pulse") ||
    pathname.startsWith("/learn/welcome") ||
    pathname.startsWith("/learn/assessment/") ||
    pathname.startsWith("/learn/courses/") ||
    pathname === "/learn" ||
    pathname === "/learn/"
  ) {
    return null;
  }

  if (!ready || !journey) return null;

  const action = getNextBestAction(loadLmsState());

  return (
    <div
      className="pointer-events-none fixed inset-x-0 z-40 lg:hidden"
      style={{
        bottom: "calc(4.25rem + env(safe-area-inset-bottom, 0px))",
      }}
    >
      <div className="container-site pointer-events-auto flex justify-center pb-1">
        <Link
          href={action.href}
          onClick={() =>
            track("continue_click", { kind: action.kind, sticky: true })
          }
          className="inline-flex min-h-11 max-w-sm items-center gap-2 rounded-full border border-black/[0.08] bg-ink px-5 text-sm font-semibold text-white shadow-lg"
        >
          <span className="truncate">{action.title}</span>
          <span aria-hidden>→</span>
        </Link>
      </div>
    </div>
  );
}
