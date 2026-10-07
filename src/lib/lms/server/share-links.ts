import { createHash, randomBytes } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { MINOR_AGE_BANDS } from "@/lib/lms/consent";
import type { ConstructScore } from "@/lib/lms/scoring";
import {
  SERVER_CERT_ID_RE,
  SHARE_TOKEN_RE,
  isLegacyShareToken,
  linkStatus,
  shareRows,
  type ShareLinkSummary,
  type ShareView,
} from "@/lib/lms/share";
import { getProgramme } from "@/lib/programmes";

export const MAX_ACTIVE_LINKS = 20;
export const MAX_LINKS_PER_HOUR = 10;

export function newShareToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashShareToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export type ShareLinkRow = {
  id: string;
  user_id: string;
  programme_id: string;
  label: string | null;
  show_name: boolean;
  expires_at: string;
  revoked_at: string | null;
  view_count: number;
  last_viewed_at: string | null;
  created_at: string;
};

export const SHARE_LINK_COLUMNS =
  "id, user_id, programme_id, label, show_name, expires_at, revoked_at, view_count, last_viewed_at, created_at";

export function toSummary(r: ShareLinkRow, now = Date.now()): ShareLinkSummary {
  return {
    id: r.id,
    label: r.label,
    showName: r.show_name,
    createdAt: r.created_at,
    expiresAt: r.expires_at,
    revokedAt: r.revoked_at,
    viewCount: r.view_count,
    lastViewedAt: r.last_viewed_at,
    status: linkStatus(r, now),
  };
}

/** Age band the learner gave in their profile (server copy of learner state). */
export async function learnerAgeBand(admin: SupabaseClient, userId: string): Promise<string | null> {
  const { data } = await admin
    .from("learner_state")
    .select("age_band:payload->profile->>ageBand")
    .eq("user_id", userId)
    .maybeSingle();
  const band = (data as { age_band?: string | null } | null)?.age_band;
  return typeof band === "string" && band ? band : null;
}

export function isMinorBand(band: string | null): boolean {
  return Boolean(band && (MINOR_AGE_BANDS as string[]).includes(band));
}

/**
 * Under-18 check for sharing. Minor if the profile says so, or if a guardian
 * consent was ever recorded for this learner (so editing the age band later
 * doesn't bypass consent).
 */
export async function isMinorLearner(admin: SupabaseClient, userId: string): Promise<boolean> {
  if (isMinorBand(await learnerAgeBand(admin, userId))) return true;
  const { data } = await admin
    .from("guardian_consents")
    .select("learner_age_band")
    .eq("learner_user_id", userId)
    .limit(5);
  return (data ?? []).some((c) => isMinorBand((c as { learner_age_band?: string }).learner_age_band ?? null));
}

/** Under-18s may only share progress reports with a guardian's granted consent for that scope. */
export async function minorMayShare(admin: SupabaseClient, userId: string): Promise<boolean> {
  const { data } = await admin
    .from("guardian_consents")
    .select("id, scope")
    .eq("learner_user_id", userId)
    .eq("status", "granted")
    .limit(5);
  return (data ?? []).some((c) => Array.isArray(c.scope) && (c.scope as string[]).includes("progress_reports"));
}

const asList = (v: unknown): ConstructScore[] => (Array.isArray(v) ? (v as ConstructScore[]) : []);

function firstName(full: string): string {
  return full.trim().split(/\s+/)[0] ?? "";
}

export type ResolvedShare =
  | { state: "ok"; view: ShareView }
  | { state: "expired" | "revoked" | "not_found" | "legacy" | "unavailable" };

/** Look up a share token and build what the viewer may see. Counts the view. */
export async function resolveShare(admin: SupabaseClient | null, token: string): Promise<ResolvedShare> {
  if (isLegacyShareToken(token)) return { state: "legacy" };
  if (!SHARE_TOKEN_RE.test(token)) return { state: "not_found" };
  if (!admin) return { state: "unavailable" };

  const { data: link } = await admin
    .from("report_share_links")
    .select(SHARE_LINK_COLUMNS)
    .eq("token_hash", hashShareToken(token))
    .maybeSingle();
  if (!link) return { state: "not_found" };
  const row = link as ShareLinkRow;
  const status = linkStatus(row);
  if (status !== "active") return { state: status };

  const [{ data: attempts }, { data: profile }, { data: cert }, minor] = await Promise.all([
    admin
      .from("lms_attempts")
      .select("phase, overall, construct_scores, created_at")
      .eq("user_id", row.user_id)
      .eq("programme_id", row.programme_id)
      .in("phase", ["pre", "post"]),
    row.show_name
      ? admin.from("profiles").select("full_name").eq("id", row.user_id).maybeSingle()
      : Promise.resolve({ data: null }),
    admin
      .from("certificates")
      .select("id")
      .eq("user_id", row.user_id)
      .eq("programme_id", row.programme_id)
      .eq("revoked", false)
      .is("revoked_at", null)
      .maybeSingle(),
    isMinorLearner(admin, row.user_id),
  ]);

  type A = { phase: string; overall: number; construct_scores: ConstructScore[]; created_at: string };
  const list = (attempts ?? []) as A[];
  const pre = list.find((a) => a.phase === "pre");
  if (!pre) return { state: "not_found" };
  const post = list.find((a) => a.phase === "post") ?? null;

  // A minor's link stops working if guardian consent is withdrawn.
  if (minor && !(await minorMayShare(admin, row.user_id))) return { state: "revoked" };

  const full = (profile as { full_name?: string | null } | null)?.full_name?.trim() || "";
  const name = row.show_name && full ? (minor ? firstName(full) : full) : null;
  const certificateId = (cert as { id?: string } | null)?.id ?? null;

  await admin.rpc("report_share_link_viewed", { p_id: row.id });

  return {
    state: "ok",
    view: {
      name,
      programmeName: getProgramme(row.programme_id)?.name ?? "Super-Cube®",
      preOverall: Math.round(Number(pre.overall) * 10) / 10,
      postOverall: post ? Math.round(Number(post.overall) * 10) / 10 : null,
      growth: post ? Math.round((Number(post.overall) - Number(pre.overall)) * 10) / 10 : null,
      constructs: shareRows(asList(pre.construct_scores), post ? asList(post.construct_scores) : null),
      snapshotAt: (post ?? pre).created_at,
      certificateId: certificateId && SERVER_CERT_ID_RE.test(certificateId) ? certificateId : null,
      expiresAt: row.expires_at,
    },
  };
}
