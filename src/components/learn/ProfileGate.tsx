"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { hasValidGuardianConsent } from "@/lib/lms/consent";
import { getProfile, profileComplete } from "@/lib/lms/profile";
import { loadLmsState } from "@/lib/lms/store";

const ALLOW = [
  "/learn/welcome",
  "/learn/org",
  "/learn/start",
  "/learn/account", // allow viewing You while incomplete (shows setup CTA) and Delete my data
  "/learn/consent",
];

/** Soft gate: incomplete profile → welcome; minors without guardian consent → consent. */
export function ProfileGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!pathname?.startsWith("/learn")) return;
    if (ALLOW.some((p) => pathname === p || pathname.startsWith(p + "/")))
      return;
    try {
      const s = loadLmsState();
      const p = getProfile(s);
      if (!profileComplete(p)) {
        router.replace("/learn/welcome");
      } else if (!hasValidGuardianConsent(p, s.guardianConsent)) {
        // Under-18 learners need a parent or guardian's consent first (POPIA s35)
        router.replace(`/learn/consent?next=${encodeURIComponent(pathname)}`);
      }
    } catch {
      /* ignore */
    }
  }, [pathname, router]);

  return <>{children}</>;
}
