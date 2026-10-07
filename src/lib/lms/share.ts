/**
 * Growth-report share links (Phase 1 · Stage 3).
 *
 * Links are created by the server: the URL holds a random token only, and the
 * scores are read from the server when the link is opened. Links expire and
 * the learner can revoke them. Journals and answers are never shared.
 *
 * Older builds put the whole score snapshot (base64 JSON) into the URL. Those
 * links are recognised and shown a friendly "this link format has retired"
 * page; their contents are never displayed.
 */

import { constructs, type ConstructId } from "@/lib/content";
import type { ConstructScore } from "@/lib/lms/scoring";

/** Expiry choices offered to learners (days). */
export const SHARE_LINK_DAYS = [7, 30, 90] as const;
export type ShareLinkDays = (typeof SHARE_LINK_DAYS)[number];
export const DEFAULT_SHARE_DAYS: ShareLinkDays = 30;

/** New tokens: 32 random bytes, base64url (43 chars). */
export const SHARE_TOKEN_RE = /^[A-Za-z0-9_-]{43}$/;

export type ShareConstructRow = {
  id: ConstructId;
  name: string;
  pre: number;
  post: number | null;
  delta: number | null;
};

/** What a share-link viewer sees. Built on the server from stored attempts. */
export type ShareView = {
  name: string | null;
  programmeName: string;
  preOverall: number;
  postOverall: number | null;
  growth: number | null;
  constructs: ShareConstructRow[];
  snapshotAt: string;
  certificateId: string | null;
  expiresAt: string;
};

/** A learner's link as listed in their report (never includes the token). */
export type ShareLinkSummary = {
  id: string;
  label: string | null;
  showName: boolean;
  createdAt: string;
  expiresAt: string;
  revokedAt: string | null;
  viewCount: number;
  lastViewedAt: string | null;
  status: "active" | "expired" | "revoked";
};

const round1 = (n: number) => Math.round(n * 10) / 10;

export function shareRows(pre: ConstructScore[], post: ConstructScore[] | null): ShareConstructRow[] {
  return constructs.map((c) => {
    const preS = pre.find((s) => s.constructId === c.id)?.score ?? 0;
    const postS = post?.find((s) => s.constructId === c.id)?.score;
    return {
      id: c.id,
      name: c.name,
      pre: round1(preS),
      post: postS != null ? round1(postS) : null,
      delta: postS != null ? round1(postS - preS) : null,
    };
  });
}

export function linkStatus(
  l: { expires_at: string; revoked_at: string | null },
  now = Date.now(),
): ShareLinkSummary["status"] {
  if (l.revoked_at) return "revoked";
  return Date.parse(l.expires_at) <= now ? "expired" : "active";
}

/** True for the retired "scores in the URL" format (base64url JSON with v:1). */
export function isLegacyShareToken(token: string): boolean {
  if (!token || SHARE_TOKEN_RE.test(token) || token.length < 24) return false;
  try {
    const pad = token.length % 4 === 0 ? "" : "=".repeat(4 - (token.length % 4));
    const b64 = token.replace(/-/g, "+").replace(/_/g, "/") + pad;
    const raw =
      typeof window === "undefined"
        ? Buffer.from(b64, "base64").toString("utf8")
        : new TextDecoder().decode(Uint8Array.from(atob(b64), (ch) => ch.charCodeAt(0)));
    const data = JSON.parse(raw) as { v?: unknown };
    return data?.v === 1;
  } catch {
    return false;
  }
}

export function shareLinkPath(token: string): string {
  return `/share/report/${token}`;
}

/** Server-issued certificate ids look like SC-YYYYMMDD-XXXXXXXXXX (10 hex). */
export const SERVER_CERT_ID_RE = /^SC-\d{8}-[0-9A-F]{10}$/;
