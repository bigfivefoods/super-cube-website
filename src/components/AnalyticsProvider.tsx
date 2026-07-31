"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { track } from "@/lib/analytics";

function AnalyticsInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    track("page_view", {
      path: pathname,
      query: searchParams?.toString() || undefined,
    });

    // Funnel-ish auto tags for key LMS paths
    if (pathname.startsWith("/learn/assessment/orientation")) {
      track("orient_start");
    } else if (pathname.startsWith("/learn/assessment/pre")) {
      track("pre_start");
    } else if (pathname.startsWith("/learn/assessment/post")) {
      track("post_start");
    } else if (pathname.startsWith("/learn/report")) {
      track("report_view");
    } else if (pathname.match(/^\/learn\/courses\/[^/]+\/[^/]+/)) {
      track("lesson_open", { path: pathname });
    } else if (pathname === "/login") {
      track("login_view");
    } else if (pathname === "/signup") {
      track("signup_view");
    }
  }, [pathname, searchParams]);

  // Optional GA4
  useEffect(() => {
    const id = process.env.NEXT_PUBLIC_GA_ID;
    if (!id || document.getElementById("sc-ga")) return;
    const s = document.createElement("script");
    s.id = "sc-ga";
    s.async = true;
    s.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
    document.head.appendChild(s);
    const inline = document.createElement("script");
    inline.innerHTML = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${id}',{send_page_view:false});`;
    document.head.appendChild(inline);
  }, []);

  return null;
}

export function AnalyticsProvider() {
  return (
    <Suspense fallback={null}>
      <AnalyticsInner />
    </Suspense>
  );
}
