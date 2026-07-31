/**
 * Coach-shareable growth report tokens (client-side, no secrets).
 * Token encodes a compact growth snapshot; anyone with the link can view.
 */

import type { ConstructId } from "@/lib/content";
import { constructs } from "@/lib/content";
import type { LocalAttempt, LocalLmsState } from "@/lib/lms/store";
import { getProgramme } from "@/lib/programmes";

export type ShareConstructScore = {
  id: ConstructId;
  name: string;
  pre: number;
  post: number | null;
  delta: number | null;
};

export type ReportSharePayload = {
  v: 1;
  name: string;
  programmeName: string;
  programmeId?: string;
  preOverall: number;
  postOverall: number | null;
  growth: number | null;
  constructs: ShareConstructScore[];
  completedAt: string;
  certificateId?: string;
  orgCode?: string;
};

function b64urlEncode(str: string): string {
  if (typeof window === "undefined") {
    return Buffer.from(str, "utf8")
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  }
  const bytes = new TextEncoder().encode(str);
  let bin = "";
  bytes.forEach((b) => {
    bin += String.fromCharCode(b);
  });
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlDecode(token: string): string {
  const pad = token.length % 4 === 0 ? "" : "=".repeat(4 - (token.length % 4));
  const b64 = token.replace(/-/g, "+").replace(/_/g, "/") + pad;
  if (typeof window === "undefined") {
    return Buffer.from(b64, "base64").toString("utf8");
  }
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

export function buildReportSharePayload(
  state: LocalLmsState
): ReportSharePayload | null {
  const pre = state.attempts.find((a) => a.phase === "pre");
  if (!pre) return null;
  const post = state.attempts.find((a) => a.phase === "post") as
    | LocalAttempt
    | undefined;
  const programmeId =
    post?.programmeId ||
    pre.programmeId ||
    state.subscription?.programmeId ||
    state.user?.programmeId;
  const programme = programmeId ? getProgramme(programmeId) : undefined;

  const constructScores: ShareConstructScore[] = constructs.map((c) => {
    const preS =
      pre.result.constructScores.find((s) => s.constructId === c.id)
        ?.score ?? 0;
    const postS = post?.result.constructScores.find(
      (s) => s.constructId === c.id
    )?.score;
    return {
      id: c.id,
      name: c.name,
      pre: Math.round(preS * 10) / 10,
      post: postS != null ? Math.round(postS * 10) / 10 : null,
      delta:
        postS != null ? Math.round((postS - preS) * 10) / 10 : null,
    };
  });

  const growth =
    post != null
      ? Math.round((post.result.overall - pre.result.overall) * 10) / 10
      : null;

  return {
    v: 1,
    name:
      state.user?.fullName?.trim() ||
      state.user?.email?.trim() ||
      "Super-Cube® Learner",
    programmeName: programme?.name ?? "Super-Cube®",
    programmeId,
    preOverall: Math.round(pre.result.overall * 10) / 10,
    postOverall:
      post != null ? Math.round(post.result.overall * 10) / 10 : null,
    growth,
    constructs: constructScores,
    completedAt: post?.completedAt ?? pre.completedAt,
    certificateId: state.certificateId,
    orgCode: state.orgCode,
  };
}

export function encodeShareToken(payload: ReportSharePayload): string {
  return b64urlEncode(JSON.stringify(payload));
}

export function decodeShareToken(token: string): ReportSharePayload | null {
  try {
    const raw = b64urlDecode(token);
    const data = JSON.parse(raw) as ReportSharePayload;
    if (!data || data.v !== 1 || typeof data.preOverall !== "number") {
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

export function shareReportUrl(token: string): string {
  const base =
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_SITE_URL || "https://www.super-cube.me";
  return `${base}/share/report/${token}`;
}

/** Deterministic certificate id from learner + completion time */
export function ensureCertificateId(state: LocalLmsState): string {
  if (state.certificateId) return state.certificateId;
  const post = state.attempts.find((a) => a.phase === "post");
  const seed = `${state.user?.email ?? "anon"}|${post?.completedAt ?? Date.now()}`;
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  }
  const hex = Math.abs(h).toString(16).toUpperCase().padStart(8, "0");
  const day = (post?.completedAt ?? new Date().toISOString()).slice(0, 10).replace(/-/g, "");
  return `SC-${day}-${hex}`;
}
