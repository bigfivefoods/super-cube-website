/**
 * First-party visit events for the investor Website Insights report.
 *
 * The browser posts a short batch to `/api/insights/collect`. This module turns
 * that batch into the shape bigfivegroup.africa already stores: `{ v, site, host, e }`
 * with the live collector's keys (`k`, `p`, `a`, `r`, `u`, `l`, `ms`) plus the
 * metadata the report accepts (screen-width band, scroll, paths, organisation
 * label, coarse network location, new/returning). The server adds location and
 * the signed-in email. The raw IP is never a field on the payload.
 *
 * Do Not Track and Global Privacy Control drop the visit before a cookie is set.
 */

import { redactAnalyticsUrl } from "@/lib/vercel-analytics";

export const INSIGHTS_SITE = "super-cube";
export const INSIGHTS_HOST = "www.super-cube.me";
export const VISITOR_COOKIE = "sc_visitor";
/** About 180 days, sliding on each recorded visit. */
export const VISITOR_MAX_AGE = 60 * 60 * 24 * 180;

export const SCREEN_BANDS = ["phone", "tablet", "laptop", "desktop"] as const;
export type ScreenBand = (typeof SCREEN_BANDS)[number];

export type InsightKind = "pageview" | "engage" | "pdf" | "outbound" | "button";

/** Live collector UTM keys, plus content (`n`) and term (`t`). */
export type Utm = { s?: string; m?: string; c?: string; n?: string; t?: string };

export type ClientEvent = {
  k?: unknown;
  p?: unknown;
  a?: unknown;
  r?: unknown;
  u?: unknown;
  l?: unknown;
  ms?: unknown;
  scroll?: unknown;
  lang?: unknown;
  screen?: unknown;
  landing?: unknown;
  exit?: unknown;
  pages?: unknown;
  ns?: unknown;
  ip?: unknown;
  email?: unknown;
  [key: string]: unknown;
};

export type StoredEvent = {
  k: InsightKind;
  p: string;
  a?: boolean;
  r?: string;
  u?: Utm;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  l?: string;
  ms?: number;
  scroll?: number;
  lang?: string;
  screen?: ScreenBand;
  landing?: string;
  exit?: string;
  pages?: string[];
  device?: string;
  browser?: string;
  os?: string;
  country?: string;
  region?: string;
  city?: string;
  timezone?: string;
  organisation?: string;
  industry?: string;
  size?: string;
  network?: string;
  returning?: boolean;
  frequency?: number;
  recency_days?: number;
  email?: string;
};

export type InsightsPayload = {
  v: 1;
  site: typeof INSIGHTS_SITE;
  host: typeof INSIGHTS_HOST;
  e: StoredEvent[];
};

export type NetworkFields = Pick<
  StoredEvent,
  "country" | "region" | "city" | "timezone" | "organisation" | "industry" | "size" | "network"
>;

const KINDS = new Set<InsightKind>(["pageview", "engage", "pdf", "outbound", "button"]);
const SCROLLS = new Set([0, 25, 50, 75, 100]);

/** Phone < 600, tablet < 1024, laptop < 1440, desktop otherwise. The pixel value is not returned. */
export function screenBand(width: number): ScreenBand | undefined {
  if (!Number.isFinite(width) || width <= 0) return undefined;
  if (width < 600) return "phone";
  if (width < 1024) return "tablet";
  if (width < 1440) return "laptop";
  return "desktop";
}

/** Coarse scroll depth. Exact scroll offsets are not returned. */
export function scrollBand(scrollTop: number, scrollHeight: number, clientHeight: number): number {
  const range = scrollHeight - clientHeight;
  if (!Number.isFinite(range) || range <= 0) return 100;
  const pct = Math.max(0, Math.min(100, (scrollTop / range) * 100));
  if (pct >= 90) return 100;
  if (pct >= 75) return 75;
  if (pct >= 50) return 50;
  if (pct >= 25) return 25;
  return 0;
}

export function requestOptedOut(headers: Headers): boolean {
  return headers.get("dnt") === "1" || headers.get("sec-gpc") === "1";
}

type PrivacyNavigator = Navigator & { globalPrivacyControl?: boolean; msDoNotTrack?: string };

/** True when this browser asks not to be recorded (DNT or Global Privacy Control). */
export function browserOptedOut(): boolean {
  try {
    const nav = navigator as PrivacyNavigator;
    const w = window as Window & { doNotTrack?: string };
    return (
      nav.doNotTrack === "1" ||
      w.doNotTrack === "1" ||
      nav.msDoNotTrack === "1" ||
      nav.globalPrivacyControl === true
    );
  } catch {
    return false;
  }
}

/** Playwright and other automated browsers are not visits, unless a local test flag is set. */
export function skipAutomatedBrowser(): boolean {
  try {
    if (!navigator.webdriver) return false;
    return localStorage.getItem("sc-insights-test") !== "1";
  } catch {
    return true;
  }
}

function clip(value: unknown, max: number): string | undefined {
  if (typeof value !== "string") return undefined;
  const s = value.replace(/[\u0000-\u001f\u007f]/g, "").trim();
  if (!s) return undefined;
  return s.slice(0, max);
}

function recordablePath(raw: string): string | null {
  const redacted = redactAnalyticsUrl(raw.includes("://") ? raw : `https://${INSIGHTS_HOST}${raw.startsWith("/") ? raw : `/${raw}`}`);
  if (!redacted) return null;
  try {
    const path = new URL(redacted).pathname || "/";
    if (path.length > 300) return null;
    return path;
  } catch {
    return null;
  }
}

function utmFrom(raw: unknown): Utm | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const o = raw as Record<string, unknown>;
  const u: Utm = {};
  const s = clip(o.s, 100);
  const m = clip(o.m, 100);
  const c = clip(o.c, 100);
  const n = clip(o.n, 100);
  const t = clip(o.t, 100);
  if (s) u.s = s;
  if (m) u.m = m;
  if (c) u.c = c;
  if (n) u.n = n;
  if (t) u.t = t;
  return u.s || u.m || u.c || u.n || u.t ? u : undefined;
}

function referrerOf(raw: unknown): string | undefined {
  const s = clip(raw, 500);
  if (!s) return undefined;
  try {
    const u = new URL(s);
    if (u.protocol !== "http:" && u.protocol !== "https:") return undefined;
    return `${u.origin}${u.pathname}`.slice(0, 300);
  } catch {
    return undefined;
  }
}

function languageOf(raw: unknown): string | undefined {
  const s = clip(raw, 16);
  if (!s || !/^[a-zA-Z]{2,3}(-[a-zA-Z]{2})?$/.test(s)) return undefined;
  const [lang, region] = s.split("-");
  return region ? `${lang.toLowerCase()}-${region.toUpperCase()}` : lang.toLowerCase();
}

function labelOf(kind: InsightKind, raw: unknown): string | undefined {
  const s = clip(raw, 120);
  if (!s || s.includes("@")) return undefined;
  if (kind === "pdf") {
    const file = (s.split("/").pop() ?? "").toLowerCase().replace(/\s+/g, "-");
    return /^[a-z0-9._-]{1,120}\.pdf$/.test(file) ? file : undefined;
  }
  if (kind === "outbound") {
    const host = s.toLowerCase().replace(/^www\./, "");
    if (!/^[a-z0-9.-]{1,80}$/.test(host) || !host.includes(".")) return undefined;
    if (isPublicIp(host)) return undefined;
    return host;
  }
  const label = s.replace(/\s+/g, " ").slice(0, 80);
  if (!label || /^https?:/i.test(label)) return undefined;
  return label;
}

function pagesOf(raw: unknown): string[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const out: string[] = [];
  for (const item of raw) {
    if (out.length >= 8 || typeof item !== "string") continue;
    const path = recordablePath(item);
    if (path && out[out.length - 1] !== path) out.push(path);
  }
  return out.length ? out : undefined;
}

/** Drop anything the browser is not allowed to assert (IP, email, exact pixels). */
export function sanitizeClientEvent(raw: ClientEvent): StoredEvent | null {
  if (!raw || typeof raw !== "object") return null;
  const k = raw.k;
  if (typeof k !== "string" || !KINDS.has(k as InsightKind)) return null;
  const kind = k as InsightKind;
  const path = typeof raw.p === "string" ? recordablePath(raw.p) : null;
  if (!path) return null;
  const event: StoredEvent = { k: kind, p: path };
  if (raw.a === true) event.a = true;
  const r = referrerOf(raw.r);
  if (r) event.r = r;
  const u = utmFrom(raw.u);
  if (u) {
    event.u = u;
    if (u.s) event.utm_source = u.s;
    if (u.m) event.utm_medium = u.m;
    if (u.c) event.utm_campaign = u.c;
    if (u.n) event.utm_content = u.n;
    if (u.t) event.utm_term = u.t;
  }
  if (kind === "pdf" || kind === "outbound" || kind === "button") {
    const l = labelOf(kind, raw.l);
    if (!l) return null;
    event.l = l;
  }
  if (typeof raw.ms === "number" && Number.isFinite(raw.ms)) {
    const ms = Math.round(raw.ms);
    if (ms >= 500 && ms <= 3_600_000) event.ms = ms;
  }
  if (typeof raw.scroll === "number" && SCROLLS.has(raw.scroll)) event.scroll = raw.scroll;
  const lang = languageOf(raw.lang);
  if (lang) event.lang = lang;
  if (typeof raw.screen === "string" && (SCREEN_BANDS as readonly string[]).includes(raw.screen)) {
    event.screen = raw.screen as ScreenBand;
  }
  const landing = typeof raw.landing === "string" ? recordablePath(raw.landing) : null;
  if (landing) event.landing = landing;
  const exit = typeof raw.exit === "string" ? recordablePath(raw.exit) : null;
  if (exit) event.exit = exit;
  const pages = pagesOf(raw.pages);
  if (pages) event.pages = pages;
  if (kind === "engage" && event.ms == null && (event.scroll == null || event.scroll === 0)) return null;
  return event;
}

export type VisitorState = {
  id: string;
  count: number;
  lastDay: number;
  /** Days between the previous session and the session that wrote this cookie. Null on the first visit. */
  recency: number | null;
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function parseVisitor(raw: string | undefined | null): VisitorState | null {
  if (!raw) return null;
  const [id, countRaw, dayRaw, recencyRaw] = raw.split(".");
  if (!id || !UUID.test(id)) return null;
  const count = Number(countRaw);
  const lastDay = Number(dayRaw);
  if (!Number.isInteger(count) || count < 1 || count > 1_000_000) return null;
  if (!Number.isInteger(lastDay) || lastDay < 1) return null;
  let recency: number | null = null;
  if (recencyRaw) {
    const n = Number(recencyRaw);
    if (!Number.isInteger(n) || n < 0 || n > 100_000) return null;
    recency = n;
  }
  return { id, count, lastDay, recency };
}

export function visitorCookieValue(state: VisitorState): string {
  return `${state.id}.${state.count}.${state.lastDay}.${state.recency ?? ""}`;
}

export function nextVisitor(
  current: VisitorState | null,
  newSession: boolean,
  now: number,
  mint: () => string,
): { state: VisitorState; returning: boolean; frequency: number; recency_days: number | null } {
  const today = Math.floor(now / 86_400_000);
  if (!current) {
    return {
      state: { id: mint(), count: 1, lastDay: today, recency: null },
      returning: false,
      frequency: 1,
      recency_days: null,
    };
  }
  if (newSession) {
    const recency = Math.max(0, today - current.lastDay);
    const count = Math.min(1_000_000, current.count + 1);
    return {
      state: { id: current.id, count, lastDay: today, recency },
      returning: true,
      frequency: count,
      recency_days: recency,
    };
  }
  return {
    state: current,
    returning: current.count > 1,
    frequency: current.count,
    recency_days: current.recency,
  };
}

function asObject(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
}

function text(value: unknown, max = 80): string | undefined {
  const s = clip(value, max);
  if (!s || s.includes("@")) return undefined;
  return s;
}

function flag(value: unknown): boolean {
  return value === true || value === "true" || value === 1;
}

/** Organisation / location labels from an IPinfo response. IP, coordinates and postal code are dropped. */
export function networkFromIpinfo(raw: unknown): NetworkFields {
  const root = asObject(raw);
  if (!root) return {};
  const geo = asObject(root.geo) ?? root;
  const company = asObject(root.company);
  const asn = asObject(root.as) ?? asObject(root.asn);
  const privacy = asObject(root.anonymous) ?? asObject(root.privacy);
  const orgField = text(root.org, 120);
  const organisation =
    text(company?.name, 120) ||
    text(asn?.name, 120) ||
    (orgField ? orgField.replace(/^AS\d+\s+/, "") : undefined);
  let network: string | undefined;
  if (flag(privacy?.is_vpn) || flag(privacy?.vpn)) network = "vpn";
  else if (flag(privacy?.is_tor) || flag(privacy?.tor)) network = "tor";
  else if (flag(privacy?.is_proxy) || flag(privacy?.proxy)) network = "proxy";
  else if (flag(root.is_hosting) || flag(privacy?.hosting)) network = "hosting";
  else if (flag(root.is_mobile) || asObject(root.carrier) || asObject(root.mobile)) network = "mobile";
  else network = text(company?.type, 40) || text(asn?.type, 40);
  const fields: NetworkFields = {
    city: text(geo.city, 80),
    region: text(geo.region, 80),
    country: text(geo.country_code, 8) || text(geo.country, 8),
    timezone: text(geo.timezone, 64),
    organisation,
    industry: text(company?.industry, 80),
    size: text(company?.size, 40),
    network,
  };
  const out: NetworkFields = {};
  for (const [key, value] of Object.entries(fields)) {
    if (value) out[key as keyof NetworkFields] = value;
  }
  return out;
}

/** Device, browser and OS family only. The raw User-Agent is not returned. */
export function clientFamily(ua: string): { device: string; browser: string; os: string } {
  const u = ua.slice(0, 400);
  const os = /iPhone|iPad|iPod/.test(u)
    ? "iOS"
    : /Android/.test(u)
      ? "Android"
      : /Windows/.test(u)
        ? "Windows"
        : /Mac OS X|Macintosh/.test(u)
          ? "macOS"
          : /CrOS/.test(u)
            ? "ChromeOS"
            : /Linux/.test(u)
              ? "Linux"
              : "Other";
  const device = /iPad|Tablet/.test(u) || (/Macintosh/.test(u) && /Mobile/.test(u))
    ? "tablet"
    : /Mobi|iPhone|Android.+Mobile/.test(u)
      ? "mobile"
      : "desktop";
  const browser = /Edg\//.test(u)
    ? "Edge"
    : /OPR\/|Opera/.test(u)
      ? "Opera"
      : /SamsungBrowser/.test(u)
        ? "Samsung Internet"
        : /Firefox\//.test(u)
          ? "Firefox"
          : /Chrome\//.test(u)
            ? "Chrome"
            : /Safari\//.test(u)
              ? "Safari"
              : "Other";
  return { device, browser, os };
}

export function isPublicIp(ip: string): boolean {
  if (!ip || ip === "unknown") return false;
  if (ip.includes(":")) {
    const v = ip.toLowerCase();
    if (v === "::1" || v.startsWith("fc") || v.startsWith("fd") || v.startsWith("fe80")) return false;
    return /^[0-9a-f:]+$/.test(v);
  }
  const m = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(ip);
  if (!m) return false;
  const n = m.slice(1).map(Number);
  if (n.some((x) => x > 255)) return false;
  const [a, b] = n;
  if (a === 10 || a === 127 || a === 0) return false;
  if (a === 192 && b === 168) return false;
  if (a === 172 && b >= 16 && b <= 31) return false;
  if (a === 169 && b === 254) return false;
  if (a === 100 && b >= 64 && b <= 127) return false;
  return true;
}

export function resolveIngestUrl(raw: string | undefined, requestHost: string): string | null {
  if (!raw?.trim()) return null;
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    return null;
  }
  const local = url.hostname === "localhost" || url.hostname === "127.0.0.1";
  if (url.protocol !== "https:" && !(url.protocol === "http:" && local)) return null;
  if (url.username || url.password) return null;
  if (requestHost && url.hostname === requestHost) return null;
  return url.toString();
}

export function sessionEmail(raw: string | null | undefined): string | undefined {
  const s = clip(raw, 200)?.toLowerCase();
  if (!s || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s)) return undefined;
  return s;
}

export type CollectPlan =
  | { record: false; clearCookie: boolean }
  | {
      record: true;
      payload: InsightsPayload;
      cookieValue: string;
      visitorId: string;
    };

export function planCollect(input: {
  headers: Headers;
  cookie: string | undefined;
  body: string;
  now: number;
  mint: () => string;
  family?: { device: string; browser: string; os: string };
  network?: NetworkFields;
  email?: string;
}): CollectPlan {
  if (requestOptedOut(input.headers)) {
    return { record: false, clearCookie: Boolean(input.cookie) };
  }
  let parsed: { e?: unknown } | null = null;
  try {
    parsed = JSON.parse(input.body) as { e?: unknown };
  } catch {
    return { record: false, clearCookie: false };
  }
  const list = Array.isArray(parsed?.e) ? parsed.e : [];
  const events = list
    .slice(0, 10)
    .map((item) => sanitizeClientEvent(item as ClientEvent))
    .filter((item): item is StoredEvent => Boolean(item));
  if (!events.length) return { record: false, clearCookie: false };
  const newSession = list.slice(0, 10).some((item) => (item as ClientEvent)?.ns === true);
  const visitor = nextVisitor(parseVisitor(input.cookie), newSession, input.now, input.mint);
  const email = sessionEmail(input.email);
  const enriched = events.map((event) => {
    const next: StoredEvent = {
      ...event,
      ...input.family,
      ...input.network,
      returning: visitor.returning,
      frequency: visitor.frequency,
    };
    if (visitor.recency_days != null) next.recency_days = visitor.recency_days;
    if (email) next.email = email;
    return next;
  });
  return {
    record: true,
    visitorId: visitor.state.id,
    cookieValue: visitorCookieValue(visitor.state),
    payload: { v: 1, site: INSIGHTS_SITE, host: INSIGHTS_HOST, e: enriched },
  };
}

/** A click on a link or button, as an event the report already stores. */
export function clickEvent(input: {
  pageUrl: string;
  href: string | null;
  download: boolean;
  button: boolean;
  label: string;
}): StoredEvent | null {
  const page = recordablePath(input.pageUrl);
  if (!page) return null;
  if (input.href) {
    let target: URL;
    try {
      target = new URL(input.href, input.pageUrl);
    } catch {
      return null;
    }
    const file = decodeURIComponent(target.pathname.split("/").pop() || "");
    if ((input.download || /\.pdf$/i.test(target.pathname)) && !target.pathname.startsWith("/api/")) {
      return sanitizeClientEvent({ k: "pdf", p: page, l: file });
    }
    const pageOrigin = (() => {
      try {
        return new URL(input.pageUrl).origin;
      } catch {
        return "";
      }
    })();
    if (target.origin !== pageOrigin) {
      return sanitizeClientEvent({ k: "outbound", p: page, l: target.hostname });
    }
  }
  if (!input.button) return null;
  return sanitizeClientEvent({ k: "button", p: page, l: input.label });
}
