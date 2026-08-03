/**
 * Lightweight funnel analytics for Super-Cube® Learn.
 * - Always records events in localStorage (debug + offline)
 * - Forwards to window.gtag / plausible / va when present
 * - Optional NEXT_PUBLIC_GA_ID loads via AnalyticsProvider
 */

export type FunnelEvent =
  | "page_view"
  | "signup_view"
  | "login_view"
  | "programme_selected"
  | "checkout_start"
  | "checkout_demo"
  | "orient_start"
  | "orient_complete"
  | "pre_start"
  | "pre_complete"
  | "mid_start"
  | "mid_complete"
  | "lesson_open"
  | "lesson_complete"
  | "session_done_today"
  | "reflection_save"
  | "post_start"
  | "post_complete"
  | "report_view"
  | "report_share"
  | "certificate_download"
  | "continue_click"
  | "demo_start"
  | "contact_submit"
  | "org_join"
  | "notify_opt_in"
  | "weekly_email_request"
  | "pilot_click"
  | "micro_practice_complete"
  | "guided_start_open"
  | "guided_start_cta"
  | "peer_pulse_complete"
  | "client_error";

/** Conversion funnel steps to watch in GA4 + local debug */
export const FUNNEL_GOALS = [
  { event: "demo_start", label: "Demo start" },
  { event: "guided_start_open", label: "Guided start" },
  { event: "orient_complete", label: "Orientation done" },
  { event: "pre_complete", label: "Baseline done" },
  { event: "lesson_complete", label: "Lesson complete" },
  { event: "mid_complete", label: "Mid check-in" },
  { event: "post_complete", label: "Post assessment" },
  { event: "report_view", label: "Report viewed" },
  { event: "certificate_download", label: "Certificate" },
  { event: "contact_submit", label: "Contact / lead" },
  { event: "pilot_click", label: "Book pilot click" },
] as const;

const KEY = "supercube_analytics_v1";
const MAX = 400;

export type AnalyticsRow = {
  event: FunnelEvent | string;
  ts: string;
  path?: string;
  props?: Record<string, string | number | boolean | null | undefined>;
};

function readLog(): AnalyticsRow[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as AnalyticsRow[];
  } catch {
    return [];
  }
}

function writeLog(rows: AnalyticsRow[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(KEY, JSON.stringify(rows.slice(-MAX)));
  } catch {
    /* quota */
  }
}

export function getAnalyticsLog(): AnalyticsRow[] {
  return readLog();
}

export function clearAnalyticsLog() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
}

/** Funnel summary for account/debug */
export function funnelCounts(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const row of readLog()) {
    counts[row.event] = (counts[row.event] ?? 0) + 1;
  }
  return counts;
}

export function track(
  event: FunnelEvent | string,
  props?: Record<string, string | number | boolean | null | undefined>
) {
  if (typeof window === "undefined") return;

  const path = window.location.pathname;
  const row: AnalyticsRow = {
    event,
    ts: new Date().toISOString(),
    path,
    props,
  };
  const log = readLog();
  log.push(row);
  writeLog(log);

  const payload = { ...props, path };

  try {
    const w = window as Window & {
      gtag?: (...args: unknown[]) => void;
      plausible?: (e: string, o?: { props?: Record<string, unknown> }) => void;
      va?: (e: string, p?: Record<string, unknown>) => void;
      dataLayer?: unknown[];
    };
    if (typeof w.gtag === "function") {
      w.gtag("event", event, payload);
    }
    if (typeof w.plausible === "function") {
      w.plausible(event, { props: payload as Record<string, unknown> });
    }
    if (typeof w.va === "function") {
      w.va(event, payload as Record<string, unknown>);
    }
  } catch {
    /* third-party optional */
  }

  if (process.env.NODE_ENV === "development") {
    // eslint-disable-next-line no-console
    console.debug("[sc-analytics]", event, payload);
  }
}
