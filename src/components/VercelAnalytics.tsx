"use client";

import { Analytics, type BeforeSendEvent } from "@vercel/analytics/next";
import { redactAnalyticsUrl } from "@/lib/vercel-analytics";

function beforeSend(event: BeforeSendEvent): BeforeSendEvent | null {
  const url = redactAnalyticsUrl(event.url);
  return url ? { ...event, url } : null;
}

/** Cookieless page-view counts (Vercel Web Analytics); see lib/vercel-analytics.ts for what is sent. */
export function VercelAnalytics() {
  return <Analytics beforeSend={beforeSend} />;
}
