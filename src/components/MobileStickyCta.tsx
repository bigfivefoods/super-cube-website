"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useLocale } from "@/components/LocaleProvider";
import { track } from "@/lib/analytics";

const HIDDEN_PREFIXES = ["/learn", "/login", "/signup", "/auth"];

/**
 * Marketing-only mobile sticky primary CTA.
 * Hidden on Learn product routes and after user dismisses for the session.
 */
export function MobileStickyCta() {
  const pathname = usePathname() || "/";
  const { t } = useLocale();
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem("sc_sticky_cta_dismissed") === "1") {
        setDismissed(true);
        return;
      }
    } catch {
      /* ignore */
    }

    const onScroll = () => {
      setVisible(window.scrollY > window.innerHeight * 0.45);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const hide =
    dismissed ||
    HIDDEN_PREFIXES.some(
      (p) => pathname === p || pathname.startsWith(`${p}/`)
    );

  if (hide || !visible) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 pb-[max(0.75rem,env(safe-area-inset-bottom))] md:hidden">
      <div className="container-site pointer-events-auto">
        <div className="mb-1 flex items-center gap-2 rounded-2xl border border-black/[0.1] bg-white/95 p-2 shadow-lg backdrop-blur-md supports-[backdrop-filter]:bg-white/90">
          <Link
            href="/learn/start"
            onClick={() => track("sticky_cta_click", { path: pathname })}
            className="flex min-h-11 flex-1 items-center justify-center rounded-xl bg-ink px-3 text-sm font-semibold text-white touch-manipulation"
          >
            {t("cta.tryFree")}
          </Link>
          <button
            type="button"
            aria-label="Dismiss"
            onClick={() => {
              setDismissed(true);
              try {
                sessionStorage.setItem("sc_sticky_cta_dismissed", "1");
              } catch {
                /* ignore */
              }
              track("sticky_cta_dismiss", { path: pathname });
            }}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-black/[0.1] text-lg leading-none text-muted touch-manipulation hover:text-ink"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}
