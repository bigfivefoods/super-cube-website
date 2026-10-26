/**
 * Issue and read Open Badges 3.0 credentials. Writes use the service role.
 * The public read path is the same narrow lookup /verify uses: one id, no list.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import { isBadgeId, type BadgeId } from "@/lib/lms/badges";
import { signCredential, verifyCredential } from "@/lib/lms/open-badges/crypto";
import {
  buildCredential,
  canonicalOrigin,
  certificateAchievement,
  credentialAchievementName,
  credentialValidFrom,
  dateTimeZ,
  documentContainsEmail,
  milestoneAchievement,
  type CredentialDoc,
  type OpenBadgeState,
} from "@/lib/lms/open-badges/document";
import { loadOb3Keys } from "@/lib/lms/open-badges/keys";
import { isCertId } from "@/lib/lms/verify";

const BADGE_ID_RE = /^SCB-[A-Za-z0-9_-]{8,40}$/;

export function isCredentialId(id: string): boolean {
  return isCertId(id) || BADGE_ID_RE.test(id);
}

export type OpenBadgeCheck = {
  state: OpenBadgeState;
  id?: string;
  name?: string | null;
  validFrom?: string | null;
  kind?: "certificate" | "milestone" | null;
};

type Stored = {
  id: string;
  kind: "certificate" | "milestone";
  revoked: boolean;
  signed: boolean;
  credential: CredentialDoc;
};

export async function ensureCertificateCredential(
  admin: SupabaseClient,
  input: {
    certificateId: string;
    programmeId: string;
    issuedAt: string;
    email?: string | null;
    userId: string;
  },
): Promise<{ id: string; signed: boolean } | null> {
  try {
    return await upsertCredential(admin, {
      id: input.certificateId,
      kind: "certificate",
      certificateId: input.certificateId,
      issuedAt: input.issuedAt,
      email: input.email,
      accountId: input.userId,
      achievement: certificateAchievement(input.programmeId),
    });
  } catch (error) {
    console.error("[ob3] certificate credential not stored", error instanceof Error ? error.message : "error");
    return null;
  }
}

export async function ensureMilestoneCredentials(
  admin: SupabaseClient,
  userId: string,
  email?: string | null,
  badgeIds?: BadgeId[],
): Promise<void> {
  try {
    let address = email;
    if (address === undefined) {
      const { data: authUser } = await admin.auth.admin.getUserById(userId);
      address = authUser.user?.email ?? null;
    }
    const { data, error } = await admin
      .from("learner_badges")
      .select("id, badge_id, awarded_at")
      .eq("user_id", userId)
      .eq("revoked", false);
    if (error || !data) return;
    const wanted = new Set(badgeIds);
    for (const row of data as { id: string; badge_id: string; awarded_at: string }[]) {
      if (!isBadgeId(row.badge_id)) continue;
      if (badgeIds && !wanted.has(row.badge_id)) continue;
      await upsertCredential(admin, {
        id: row.id,
        kind: "milestone",
        learnerBadgeId: row.id,
        issuedAt: row.awarded_at,
        email: address,
        accountId: userId,
        achievement: milestoneAchievement(row.badge_id),
      });
    }
  } catch (error) {
    console.error("[ob3] milestone credential not stored", error instanceof Error ? error.message : "error");
  }
}

export async function lookupOpenBadge(
  admin: SupabaseClient | null,
  rawId: string,
): Promise<{ check: OpenBadgeCheck; credential: CredentialDoc | null }> {
  const id = decodeId(rawId);
  if (!isCredentialId(id)) return { check: { state: "none" }, credential: null };
  if (!admin) return { check: { state: "unavailable" }, credential: null };
  const { data, error } = await admin.rpc("open_badge_credential", { p_id: id });
  if (error) {
    if (error.code === "PGRST202" || error.code === "42883") {
      return { check: { state: "unavailable" }, credential: null };
    }
    const direct = await admin
      .from("open_badge_credentials")
      .select("id, kind, revoked, signed, credential")
      .eq("id", id)
      .maybeSingle();
    if (direct.error || !direct.data) {
      return { check: { state: direct.error ? "unavailable" : "none" }, credential: null };
    }
    return present(direct.data as Stored);
  }
  const row = firstRow(data);
  if (!row) return { check: { state: "none" }, credential: null };
  return present(row);
}

async function upsertCredential(
  admin: SupabaseClient,
  input: {
    id: string;
    kind: "certificate" | "milestone";
    certificateId?: string;
    learnerBadgeId?: string;
    issuedAt: string;
    email?: string | null;
    accountId: string;
    achievement: ReturnType<typeof certificateAchievement>;
  },
): Promise<{ id: string; signed: boolean }> {
  const existing = await admin
    .from("open_badge_credentials")
    .select("id, signed, credential")
    .eq("id", input.id)
    .maybeSingle();
  if (existing.error && /open_badge_credentials|schema cache|does not exist/i.test(existing.error.message)) {
    throw new Error("open_badge_credentials is not available");
  }
  const keys = safeKeys();
  if (existing.data?.signed) return { id: input.id, signed: true };

  const built = buildCredential({
    id: input.id,
    issuedAt: input.issuedAt,
    achievement: input.achievement,
    email: input.email,
    accountId: input.accountId,
    salt:
      existing.data?.credential && typeof existing.data.credential === "object"
        ? saltOf(existing.data.credential as CredentialDoc)
        : undefined,
  });
  if (input.email && documentContainsEmail(built.document, input.email)) {
    throw new Error("credential included a raw email");
  }
  const { document, signed } = attachProof(built.document, keys);
  const row = {
    id: input.id,
    user_id: input.accountId,
    kind: input.kind,
    certificate_id: input.certificateId ?? null,
    learner_badge_id: input.learnerBadgeId ?? null,
    achievement_id: input.achievement.id,
    issued_at: input.issuedAt,
    signed,
    credential: document,
  };
  const write = existing.data
    ? await admin.from("open_badge_credentials").update(row).eq("id", input.id).eq("signed", false)
    : await admin.from("open_badge_credentials").insert(row);
  if (write.error && !/duplicate key/i.test(write.error.message)) throw new Error(write.error.message);
  return { id: input.id, signed };
}

function attachProof(document: CredentialDoc, keys: ReturnType<typeof safeKeys>): { document: CredentialDoc; signed: boolean } {
  if (!keys?.privateKey || !keys.verificationMethod) return { document, signed: false };
  const signed = signCredential(document, keys.privateKey, {
    verificationMethod: keys.verificationMethod,
    created: dateTimeZ(new Date()),
  });
  return { document: signed, signed: true };
}

function present(row: Stored): { check: OpenBadgeCheck; credential: CredentialDoc | null } {
  const keys = safeKeys();
  let state: OpenBadgeState;
  if (row.revoked) state = "revoked";
  else if (!row.signed || !row.credential?.proof) state = "unsigned";
  else if (!keys?.publicKey) state = "unchecked";
  else state = verifyCredential(row.credential, keys.publicKey) ? "valid" : "invalid";
  return {
    credential: row.credential,
    check: {
      state,
      id: row.id,
      kind: row.kind,
      name: credentialAchievementName(row.credential),
      validFrom: credentialValidFrom(row.credential),
    },
  };
}

function saltOf(document: CredentialDoc): string | undefined {
  const subject = document.credentialSubject as { identifier?: { salt?: string }[] } | undefined;
  const salt = subject?.identifier?.[0]?.salt;
  return typeof salt === "string" ? salt : undefined;
}

function firstRow(data: unknown): Stored | null {
  const row = (Array.isArray(data) ? data[0] : data) as Stored | null;
  if (!row || typeof row !== "object" || !row.id || !row.credential) return null;
  return row;
}

function decodeId(raw: string): string {
  try {
    return decodeURIComponent(raw).trim();
  } catch {
    return raw.trim();
  }
}

function safeKeys() {
  try {
    return loadOb3Keys();
  } catch (error) {
    console.error("[ob3] signing key rejected", error instanceof Error ? error.message : "error");
    return null;
  }
}

export function credentialJson(document: CredentialDoc): string {
  return `${JSON.stringify(document, null, 2)}\n`;
}

export function originForCredentials(): string {
  return canonicalOrigin();
}
