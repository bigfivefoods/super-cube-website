/**
 * Named actions for Website Insights (sign-up, assessment start / finish and so on).
 * Callers fire a window event; the WebsiteInsights recorder turns it into a click event
 * labelled `cta-<name>`. Nothing is sent when the recorder is off (DNT, GPC, automated browser).
 */

export const INSIGHTS_ACTION_EVENT = "sc-insights-action";

const NAME = /^[a-z0-9-]{2,40}$/;

export function trackInsightsAction(name: string): void {
  if (typeof window === "undefined" || !NAME.test(name)) return;
  try {
    window.dispatchEvent(new CustomEvent(INSIGHTS_ACTION_EVENT, { detail: name }));
  } catch {
    /* never affect the page */
  }
}

/** Funnel events that are also Website Insights actions. */
export const FUNNEL_ACTIONS: Record<string, string> = {
  pre_start: "assessment-start",
  pre_complete: "assessment-finish",
  post_start: "assessment-post-start",
  post_complete: "assessment-post-finish",
};
