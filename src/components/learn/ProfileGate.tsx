"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useLocale } from "@/components/LocaleProvider";
import { stripLocale } from "@/lib/i18n/config";
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
  const raw = usePathname() || "/";
  const pathname = stripLocale(raw);
  const router = useRouter();
  const { L } = useLocale();

  useEffect(() => {
    if (!pathname.startsWith("/learn")) return;
    if (ALLOW.some((p) => pathname === p || pathname.startsWith(p + "/")))
      return;
    try {
      const s = loadLmsState();
      const p = getProfile(s);
      if (!profileComplete(p)) {
        router.replace(L("/learn/welcome"));
      } else if (!hasValidGuardianConsent(p, s.guardianConsent)) {
        // Under-18 learners need a parent or guardian's consent first (POPIA s35)
        router.replace(`${L("/learn/consent")}?next=${encodeURIComponent(raw)}`);
      }
    } catch {
      /* ignore */
    }
  }, [pathname, raw, router, L]);

  return <>{children}</>;
}
