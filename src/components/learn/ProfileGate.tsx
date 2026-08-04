"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { getProfile, profileComplete } from "@/lib/lms/profile";

const ALLOW = [
  "/learn/welcome",
  "/learn/org",
  "/learn/start",
  "/learn/account", // allow viewing You while incomplete (shows setup CTA)
];

/** Soft gate: incomplete profile → welcome (except allowlist). */
export function ProfileGate({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (!pathname?.startsWith("/learn")) return;
    if (ALLOW.some((p) => pathname === p || pathname.startsWith(p + "/"))) return;
    try {
      if (!profileComplete(getProfile())) {
        router.replace("/learn/welcome");
      }
    } catch {
      /* ignore */
    }
  }, [pathname, router]);

  return <>{children}</>;
}
