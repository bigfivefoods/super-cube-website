import { createHash } from "node:crypto";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Fixed-window rate limits for API routes and server actions.
 *
 * Counts are kept in Postgres (`lms_rate_hit`, service role only) so they hold
 * across serverless instances. Keys are SHA-256 hashed with the bucket name
 * before they leave this process, so the table never stores an IP or email.
 * A small per-instance memory window backs it up when the database is
 * unreachable (e.g. previews without the service-role key). If both fail the
 * request is allowed: a limiter outage must never block checkout or learning.
 */

export type RateRule = { limit: number; windowSec: number };

/** Limits per bucket. Generous for people, tight for scripts. */
export const RATE_RULES = {
  "auth-callback": { limit: 30, windowSec: 600 },
  "admin-signin": { limit: 5, windowSec: 900 },
  "admin-signin-ip": { limit: 20, windowSec: 900 },
  checkout: { limit: 20, windowSec: 600 },
  "org-join": { limit: 10, windowSec: 600 },
  "guardian-consent": { limit: 10, windowSec: 3600 },
  contact: { limit: 5, windowSec: 600 },
  newsletter: { limit: 10, windowSec: 600 },
  "newsletter-email": { limit: 3, windowSec: 3600 },
  "newsletter-confirm": { limit: 20, windowSec: 600 },
  "account-delete": { limit: 5, windowSec: 3600 },
  attempts: { limit: 30, windowSec: 600 },
  "attempts-claim": { limit: 10, windowSec: 600 },
  events: { limit: 120, windowSec: 600 },
  shares: { limit: 20, windowSec: 3600 },
  "share-view": { limit: 60, windowSec: 600 },
  "csp-report": { limit: 60, windowSec: 600 },
  "feedback360-create": { limit: 5, windowSec: 3600 },
  "feedback360-rater": { limit: 30, windowSec: 600 },
  "email-ip": { limit: 20, windowSec: 600 },
  "email-welcome": { limit: 3, windowSec: 86400 },
  "email-weekly": { limit: 3, windowSec: 86400 },
  "email-receipt": { limit: 1, windowSec: 86400 },
  "email-admin-test": { limit: 3, windowSec: 3600 },
} as const satisfies Record<string, RateRule>;

export type RateBucket = keyof typeof RATE_RULES;

export type RateResult = { allowed: boolean; hits: number; limit: number; retryAfter: number };

/** Client IP as set by Vercel's edge (first x-forwarded-for hop). */
export function clientIp(headers: Headers): string {
  const fwd = headers.get("x-forwarded-for") || "";
  return fwd.split(",")[0].trim() || headers.get("x-real-ip") || "unknown";
}

export function hashKey(bucket: string, key: string): string {
  return createHash("sha256").update(`sc-rl:${bucket}:${key}`).digest("hex");
}

const memory = new Map<string, { windowStart: number; hits: number }>();

export function memoryHit(bucket: string, keyHash: string, rule: RateRule, now = Date.now()): RateResult {
  const windowMs = rule.windowSec * 1000;
  const windowStart = Math.floor(now / windowMs) * windowMs;
  const id = `${bucket}:${keyHash}`;
  const cur = memory.get(id);
  const hits = cur && cur.windowStart === windowStart ? cur.hits + 1 : 1;
  memory.set(id, { windowStart, hits });
  if (memory.size > 5000) {
    for (const [k, v] of memory) if (v.windowStart < windowStart) memory.delete(k);
  }
  return {
    allowed: hits <= rule.limit,
    hits,
    limit: rule.limit,
    retryAfter: Math.max(1, Math.ceil((windowStart + windowMs - now) / 1000)),
  };
}

/**
 * Count one hit for each key (IP, user id, email…) in `bucket`; the request
 * is refused if any of them is over the limit.
 */
export async function hit(bucket: RateBucket, keys: string[]): Promise<RateResult> {
  const rule = RATE_RULES[bucket];
  const results: RateResult[] = [];
  const admin = createAdminClient();
  for (const raw of keys.filter(Boolean)) {
    const keyHash = hashKey(bucket, raw);
    const local = memoryHit(bucket, keyHash, rule);
    results.push(local);
    if (!admin) continue;
    try {
      const { data, error } = await admin.rpc("lms_rate_hit", {
        p_bucket: bucket,
        p_key: keyHash,
        p_limit: rule.limit,
        p_window_seconds: rule.windowSec,
      });
      if (error || !data) continue;
      const d = data as { allowed: boolean; hits: number; resetAt: string };
      results.push({
        allowed: Boolean(d.allowed),
        hits: Number(d.hits) || 0,
        limit: rule.limit,
        retryAfter: Math.max(1, Math.ceil((Date.parse(d.resetAt) - Date.now()) / 1000) || rule.windowSec),
      });
    } catch {
      // Fail open on the shared counter; the memory window still applies.
    }
  }
  const blocked = results.find((r) => !r.allowed);
  return blocked ?? results[0] ?? { allowed: true, hits: 0, limit: rule.limit, retryAfter: 0 };
}

/** 429 response with Retry-After, or null when the request may go ahead. */
export async function limitRequest(
  request: Request,
  bucket: RateBucket,
  userKeys: (string | null | undefined)[] = [],
): Promise<NextResponse | null> {
  // Signed-in routes count per account only: a whole school class can share
  // one IP. Anonymous routes count per IP.
  const keys = userKeys.filter((k): k is string => Boolean(k));
  if (keys.length === 0) keys.push(`ip:${clientIp(request.headers)}`);
  const res = await hit(bucket, keys);
  if (res.allowed) return null;
  return NextResponse.json(
    { error: "Too many requests. Please wait a few minutes and try again." },
    { status: 429, headers: { "Retry-After": String(res.retryAfter) } },
  );
}
