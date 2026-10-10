"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import {
  browserOptedOut,
  clickEvent,
  sanitizeClientEvent,
  isSamePageLink,
  pageScrollBand,
  screenBand,
  skipAutomatedBrowser,
  type ClientEvent,
} from "@/lib/website-insights";
import { INSIGHTS_ACTION_EVENT } from "@/lib/insights-action";
import { observeVitals } from "@/lib/vitals";

/** The free book's file name (src/lib/book.ts BOOK.fileName). */
const BOOK_PDF = "super-cube-leadership-book.pdf";

const ENDPOINT = "/api/insights/collect";
const SESSION = "sc_ins_session";
const LANDING = "sc_ins_landing";
const PAGES = "sc_ins_pages";

let memorySession = false;
let lastViewKey = "";
let lastViewAt = 0;
let vitalsStarted = false;
let flushVitals: () => void = () => {};
/** Page-speed readings waiting to ride with the next engagement beacon. */
const pendingVitals: ClientEvent[] = [];

/** A whitelisted `data-insights` slug on the element or an ancestor, e.g. `cta-amazon`. */
function dataLabel(el: Element): string | null {
  const v = el.closest("[data-insights]")?.getAttribute("data-insights") ?? "";
  return /^[a-z0-9-]{2,40}$/.test(v) ? v : null;
}

function send(events: ClientEvent[], beacon = false) {
  for (let i = 0; i < events.length; i += 10) {
    const body = JSON.stringify({ v: 1, e: events.slice(i, i + 10) });
    try {
      // Leaving the page: sendBeacon survives the unload; if the browser refuses it, keepalive fetch.
      if (beacon && navigator.sendBeacon && navigator.sendBeacon(ENDPOINT, new Blob([body], { type: "text/plain" }))) continue;
      void fetch(ENDPOINT, {
        method: "POST",
        body,
        keepalive: true,
        credentials: "same-origin",
        headers: { "Content-Type": "text/plain" },
      }).catch(() => {});
    } catch {
      /* A failed beacon must not affect the page. */
    }
  }
}

function utmFromLocation(): ClientEvent["u"] | undefined {
  try {
    const q = new URLSearchParams(location.search);
    const u = {
      s: q.get("utm_source") || undefined,
      m: q.get("utm_medium") || undefined,
      c: q.get("utm_campaign") || undefined,
      n: q.get("utm_content") || undefined,
      t: q.get("utm_term") || undefined,
    };
    return u.s || u.m || u.c || u.n || u.t ? u : undefined;
  } catch {
    return undefined;
  }
}

function remember(path: string): { landing: string; pages: string[]; ns: boolean } {
  try {
    const fresh = sessionStorage.getItem(SESSION) !== "1";
    if (fresh) sessionStorage.setItem(SESSION, "1");
    let landing = sessionStorage.getItem(LANDING) || "";
    if (!landing) {
      landing = path;
      sessionStorage.setItem(LANDING, landing);
    }
    let pages: string[] = [];
    try {
      const parsed = JSON.parse(sessionStorage.getItem(PAGES) || "[]") as unknown;
      if (Array.isArray(parsed)) pages = parsed.filter((item) => typeof item === "string").slice(0, 8);
    } catch {
      pages = [];
    }
    if (pages[pages.length - 1] !== path && pages.length < 8) pages.push(path);
    sessionStorage.setItem(PAGES, JSON.stringify(pages));
    return { landing, pages, ns: fresh };
  } catch {
    const ns = !memorySession;
    memorySession = true;
    return { landing: path, pages: [path], ns };
  }
}

function standalone(): boolean {
  try {
    return (
      window.matchMedia("(display-mode: standalone)").matches ||
      window.matchMedia("(display-mode: minimal-ui)").matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true
    );
  } catch {
    return false;
  }
}

/**
 * Records a visit for Website Insights. Renders nothing.
 * Do Not Track and Global Privacy Control send nothing.
 */
export function WebsiteInsights() {
  const pathname = usePathname() || "/";

  useEffect(() => {
    if (browserOptedOut() || skipAutomatedBrowser()) return;
    const pageUrl = `${location.origin}${pathname}${location.search}`;
    const seen = new Set<string>();
    // Engaged time is counted in slices: each flush sends only the visible time since the last one,
    // so a tab switched away and back (or a same-page click) never double-counts or loses time.
    let sliceStart = document.visibilityState === "visible" ? Date.now() : 0;
    let carried = 0;
    let maxScroll = pageScrollBand();
    let scrollSent = -1;

    const takeMs = () => {
      let ms = carried;
      if (sliceStart) ms += Date.now() - sliceStart;
      carried = 0;
      sliceStart = document.visibilityState === "visible" ? Date.now() : 0;
      return Math.max(0, ms);
    };

    const context = remember(pathname);
    const draft: ClientEvent = {
      k: "pageview",
      p: pageUrl,
      ...(standalone() ? { a: true } : {}),
      lang: navigator.language,
      screen: screenBand(window.screen?.width || 0),
      landing: context.landing,
      pages: context.pages,
    };
    if (context.ns) {
      if (document.referrer) draft.r = document.referrer;
      const u = utmFromLocation();
      if (u) draft.u = u;
    }
    const view = sanitizeClientEvent(draft);
    const viewKey = `${pathname}${location.search}`;
    const now = Date.now();
    if (view && (viewKey !== lastViewKey || now - lastViewAt > 1000)) {
      lastViewKey = viewKey;
      lastViewAt = now;
      send([context.ns ? { ...view, ns: true } : view]);
    }

    const flush = (beacon: boolean) => {
      const ms = takeMs();
      const batch: ClientEvent[] = [];
      // Enough time, or a deeper scroll than the last engagement row said.
      if (ms >= 500 || maxScroll > Math.max(0, scrollSent)) {
        const engage = sanitizeClientEvent({
          k: "engage",
          p: pageUrl,
          ms: ms >= 500 ? Math.min(ms, 3_600_000) : undefined,
          scroll: maxScroll,
          exit: pathname,
          landing: context.landing,
          pages: context.pages,
        });
        if (engage) {
          batch.push(engage);
          scrollSent = maxScroll;
        }
      }
      if (beacon) {
        // Leaving or hiding: page speed travels in the same beacon as the engaged time.
        flushVitals();
        batch.push(...pendingVitals.splice(0, pendingVitals.length));
      }
      send(batch, beacon);
    };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") flush(true);
      else if (!sliceStart) sliceStart = Date.now();
    };
    const onPageHide = () => flush(true);
    const onScroll = () => {
      maxScroll = Math.max(maxScroll, pageScrollBand());
    };
    const sendOnce = (recorded: ClientEvent | null) => {
      if (!recorded?.l) return;
      const key = `${String(recorded.k)}:${String(recorded.l)}`;
      if (seen.has(key)) return;
      seen.add(key);
      send([recorded]);
    };
    const onClick = (event: MouseEvent) => {
      const el = (event.target as Element | null)?.closest?.("a[href], button, [role='button']");
      if (!el) return;
      if (el instanceof HTMLAnchorElement && isSamePageLink(el.href, location.href, el.getAttribute("target"))) {
        // The path does not change, so this effect does not re-run: bank the time so far (the
        // click may also reload the page) and keep counting from here.
        flush(false);
      }
      const named = dataLabel(el);
      if (named) sendOnce(sanitizeClientEvent({ k: "click", p: pageUrl, l: named }));
      const recorded = clickEvent({
        pageUrl,
        href: el instanceof HTMLAnchorElement ? el.href : null,
        download: el instanceof HTMLAnchorElement && el.hasAttribute("download"),
        button: el instanceof HTMLButtonElement || el.getAttribute("role") === "button",
        label: (el.getAttribute("aria-label") || el.textContent || "").replace(/\s+/g, " ").trim(),
      });
      if (recorded?.k === "pdf" && recorded.l === BOOK_PDF) {
        sendOnce(sanitizeClientEvent({ k: "click", p: pageUrl, l: "cta-book-pdf" }));
      }
      sendOnce(recorded);
    };
    const onAction = (event: Event) => {
      const name = (event as CustomEvent<unknown>).detail;
      if (typeof name !== "string" || !/^[a-z0-9-]{2,40}$/.test(name)) return;
      const recorded = sanitizeClientEvent({ k: "click", p: pageUrl, l: `cta-${name}` });
      if (recorded) send([recorded]);
    };
    if (!vitalsStarted) {
      // Page speed for the page this load started on: one reading per metric, sent when hidden.
      vitalsStarted = true;
      const vitalsPage = pageUrl;
      flushVitals = observeVitals((name, value) => {
        pendingVitals.push({ k: "vital", p: vitalsPage, l: name, v: value });
        // Normally drained by flush() in the same hide/pagehide; a task (not a microtask) so the
        // engagement listener runs first and both travel together.
        setTimeout(() => {
          if (pendingVitals.length) send(pendingVitals.splice(0, pendingVitals.length), true);
        }, 0);
      });
    }

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", onPageHide);
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("click", onClick, { capture: true });
    window.addEventListener(INSIGHTS_ACTION_EVENT, onAction);
    return () => {
      window.removeEventListener(INSIGHTS_ACTION_EVENT, onAction);
      flush(false);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", onPageHide);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("click", onClick, { capture: true });
    };
  }, [pathname]);

  return null;
}
