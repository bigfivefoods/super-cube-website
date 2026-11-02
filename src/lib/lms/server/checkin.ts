import { createHash, randomBytes } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { constructs, type ConstructId } from "@/lib/content";
import {
  CHECKIN_DAYS,
  MAX_MANAGERS,
  MAX_PEERS,
  checkinComparison,
  type CheckinRelationship,
  type FaceRating,
  type RatedResponse,
} from "@/lib/lms/checkin";
import type { ProgrammeId } from "@/lib/programmes";

export function hashCheckinToken(token: string): string {
  return createHash("sha256").update(`sc-checkin:${token}`).digest("hex");
}

export function newCheckinToken(): string {
  return randomBytes(24).toString("base64url");
}

type InviteRow = {
  id: string;
  relationship: CheckinRelationship;
  email: string;
  sent_at: string;
  completed_at: string | null;
  expires_at: string;
};

export type InviteStatus = "sent" | "completed" | "expired";

function statusOf(row: InviteRow, now = Date.now()): InviteStatus {
  if (row.completed_at) return "completed";
  if (Date.parse(row.expires_at) <= now) return "expired";
  return "sent";
}

function asScores(raw: unknown): FaceRating[] {
  if (!Array.isArray(raw)) return [];
  return raw.flatMap((row) => {
    const constructId = String((row as { constructId?: unknown }).constructId ?? "") as ConstructId;
    const score = Number((row as { score?: unknown }).score);
    if (!constructs.some((c) => c.id === constructId) || !Number.isFinite(score)) return [];
    return [{ constructId, score }];
  });
}

export async function loadCheckinSummary(admin: SupabaseClient, userId: string) {
  const { data: inviteData, error } = await admin
    .from("checkin_invites")
    .select("id, relationship, email, sent_at, completed_at, expires_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(40);
  if (error) return { ok: false as const, error: error.message };
  const invites = (inviteData ?? []) as InviteRow[];
  const done = invites.filter((i) => i.completed_at);
  const { data: resp } = done.length
    ? await admin.from("checkin_responses").select("invite_id, face_scores").in(
        "invite_id",
        done.map((d) => d.id),
      )
    : { data: [] as { invite_id: string; face_scores: unknown }[] };
  const rel = new Map(invites.map((i) => [i.id, i.relationship]));
  const rated: RatedResponse[] = (resp ?? []).flatMap((row) => {
    const relationship = rel.get(row.invite_id as string);
    if (!relationship) return [];
    return [{ relationship, scores: asScores(row.face_scores) }];
  });

  const { data: attempts } = await admin
    .from("lms_attempts")
    .select("phase, construct_scores, created_at")
    .eq("user_id", userId)
    .in("phase", ["pre", "post"])
    .order("created_at", { ascending: false })
    .limit(8);
  const list = (attempts ?? []) as { phase: string; construct_scores: unknown }[];
  const selfRow = list.find((a) => a.phase === "post") ?? list.find((a) => a.phase === "pre") ?? null;

  return {
    ok: true as const,
    invites: invites.map((i) => ({
      id: i.id,
      relationship: i.relationship,
      email: i.email,
      sentAt: i.sent_at,
      status: statusOf(i),
    })),
    self: selfRow ? asScores(selfRow.construct_scores) : null,
    selfPhase: selfRow?.phase ?? null,
    groups: checkinComparison(rated),
  };
}

export async function createCheckinInvites(
  admin: SupabaseClient,
  userId: string,
  ownEmail: string | null,
  programmeId: ProgrammeId,
  locale: string,
  invites: { email: string; relationship: CheckinRelationship }[],
) {
  const own = (ownEmail ?? "").trim().toLowerCase();
  if (invites.some((i) => i.email === own)) return { ok: false as const, error: "own_email" as const };

  const { data: existing, error } = await admin
    .from("checkin_invites")
    .select("id, email, relationship, completed_at, expires_at")
    .eq("user_id", userId);
  if (error) return { ok: false as const, error: /checkin_invites|does not exist|schema cache/i.test(error.message) ? ("not_ready" as const) : ("save_failed" as const) };

  const now = Date.now();
  const rows = (existing ?? []) as { id: string; email: string; relationship: CheckinRelationship; completed_at: string | null; expires_at: string }[];
  const replacing = new Set(invites.map((i) => i.email));
  const active = rows.filter((r) => !replacing.has(r.email.toLowerCase()) && (r.completed_at || Date.parse(r.expires_at) > now));
  const managers = active.filter((r) => r.relationship === "manager").length + invites.filter((i) => i.relationship === "manager").length;
  const peers = active.filter((r) => r.relationship === "peer").length + invites.filter((i) => i.relationship === "peer").length;
  if (managers > MAX_MANAGERS || peers > MAX_PEERS) return { ok: false as const, error: "limit" as const };

  const openIds = rows.filter((r) => replacing.has(r.email.toLowerCase()) && !r.completed_at && Date.parse(r.expires_at) > now).map((r) => r.id);
  if (openIds.length) {
    await admin.from("checkin_invites").update({ expires_at: new Date(now).toISOString() }).in("id", openIds);
  }

  const created: { email: string; relationship: CheckinRelationship; token: string; id: string }[] = [];
  const expires = new Date(now + CHECKIN_DAYS * 86_400_000).toISOString();
  for (const invite of invites) {
    const token = newCheckinToken();
    const { data, error: insErr } = await admin
      .from("checkin_invites")
      .insert({
        user_id: userId,
        programme_id: programmeId,
        relationship: invite.relationship,
        email: invite.email,
        locale,
        token_hash: hashCheckinToken(token),
        expires_at: expires,
      })
      .select("id")
      .single();
    if (insErr || !data) {
      for (const row of created) await deleteCheckinInvite(admin, row.id);
      return { ok: false as const, error: "save_failed" as const };
    }
    created.push({ ...invite, token, id: data.id as string });
  }
  return { ok: true as const, created };
}

export async function deleteCheckinInvite(admin: SupabaseClient, id: string) {
  await admin.from("checkin_invites").delete().eq("id", id);
}

export async function findCheckin(admin: SupabaseClient, token: string) {
  if (!/^[A-Za-z0-9_-]{20,80}$/.test(token)) return null;
  const { data: invite } = await admin
    .from("checkin_invites")
    .select("id, user_id, relationship, locale, completed_at, expires_at")
    .eq("token_hash", hashCheckinToken(token))
    .maybeSingle();
  if (!invite) return null;
  const row = invite as {
    id: string;
    user_id: string;
    relationship: CheckinRelationship;
    locale: string;
    completed_at: string | null;
    expires_at: string;
  };
  const { data: profile } = await admin.from("profiles").select("full_name").eq("id", row.user_id).maybeSingle();
  const firstName = String((profile as { full_name?: string } | null)?.full_name ?? "")
    .trim()
    .split(/\s+/)[0]
    ?.replace(/[^\p{L}\p{M}'-]/gu, "")
    .slice(0, 30) || "";
  return {
    id: row.id,
    relationship: row.relationship,
    locale: row.locale,
    firstName,
    completed: Boolean(row.completed_at),
    expired: Date.parse(row.expires_at) <= Date.now(),
  };
}

export async function peekCheckinLocale(admin: SupabaseClient, token: string): Promise<string> {
  if (!/^[A-Za-z0-9_-]{20,80}$/.test(token)) return "en";
  const { data } = await admin.from("checkin_invites").select("locale").eq("token_hash", hashCheckinToken(token)).maybeSingle();
  return String((data as { locale?: string } | null)?.locale ?? "en");
}
