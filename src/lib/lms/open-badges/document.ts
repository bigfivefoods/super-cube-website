/**
 * Open Badges 3.0 credential builders. Pure: no keys, no database.
 * Personal email is hashed (Open Badges IdentityHash). It is never written
 * into the credential. Holder names stay on /verify, which already publishes
 * the name printed on the certificate.
 */
import { createHash, randomBytes } from "node:crypto";
import { CERT_ISSUER, DEFAULT_ORIGIN, credentialName } from "@/lib/lms/certificate";
import { BADGES, type BadgeId } from "@/lib/lms/badges";

export const OB_CONTEXT = [
  "https://www.w3.org/ns/credentials/v2",
  "https://purl.imsglobal.org/spec/ob/v3p0/context-3.0.3.json",
  "https://w3id.org/security/data-integrity/v2",
] as const;

export const ISSUER_NAME = CERT_ISSUER;
export const ISSUER_PATH = "/issuer/super-cube";

export type OpenBadgeState =
  | "valid"
  | "revoked"
  | "unsigned"
  | "invalid"
  | "unchecked"
  | "none"
  | "unavailable";

export function canonicalOrigin(env: NodeJS.ProcessEnv = process.env): string {
  const raw = env.NEXT_PUBLIC_SITE_URL?.trim() || DEFAULT_ORIGIN;
  return raw.replace(/\/$/, "");
}

export function issuerId(origin = canonicalOrigin()): string {
  return `${origin}${ISSUER_PATH}`;
}

export function dateTimeZ(iso: string | Date): string {
  const date = iso instanceof Date ? iso : new Date(iso);
  if (Number.isNaN(date.getTime())) throw new Error("Invalid date");
  return date.toISOString().replace(/\.\d{3}Z$/, "Z");
}

/**
 * Open Badges IdentityHash: sha256$ + hex(SHA-256(UTF-8(identifier + salt))).
 * The published example hashes " a@example.com" + "Kosher" with no separator.
 */
export function identityHash(identifier: string, salt = ""): string {
  const hex = createHash("sha256").update(`${identifier}${salt}`, "utf8").digest("hex");
  return `sha256$${hex}`;
}

export function newSalt(): string {
  return randomBytes(16).toString("hex");
}

export function normaliseEmail(email: string): string {
  return email.trim().toLowerCase();
}

type ImageRef = { id: string; type: "Image" };

export type AchievementDoc = {
  "@context": readonly string[];
  id: string;
  type: ["Achievement"];
  name: string;
  description: string;
  criteria: { narrative: string };
  achievementType: "Certificate" | "Badge";
  inLanguage: "en";
  image: ImageRef;
};

export type CredentialDoc = Record<string, unknown>;

export function achievementImage(origin: string): ImageRef {
  return { id: `${origin}/brand/logo-mark.png`, type: "Image" };
}

export function certificateAchievement(programmeId: string, origin = canonicalOrigin()): AchievementDoc {
  const name = credentialName(programmeId);
  return {
    "@context": OB_CONTEXT,
    id: `${origin}/achievements/certificate-${programmeId}`,
    type: ["Achievement"],
    achievementType: "Certificate",
    name,
    description: `${name}, awarded by ${ISSUER_NAME} when the server has recorded a locked baseline and a gated after-test.`,
    criteria: {
      narrative:
        "The learner completed a Super-Cube® programme. The server recorded a locked baseline and a gated after-test before issuing this certificate. Scores are not part of this credential.",
    },
    inLanguage: "en",
    image: achievementImage(origin),
  };
}

export function milestoneAchievement(badgeId: BadgeId, origin = canonicalOrigin()): AchievementDoc {
  const badge = BADGES[badgeId];
  const name = `Super-Cube® badge: ${badge.name}`;
  return {
    "@context": OB_CONTEXT,
    id: `${origin}/achievements/milestone-${badgeId}`,
    type: ["Achievement"],
    achievementType: "Badge",
    name,
    description: badge.criteria,
    criteria: { narrative: badge.criteria },
    inLanguage: "en",
    image: achievementImage(origin),
  };
}

export function achievementBySlug(slug: string, origin = canonicalOrigin()): AchievementDoc | null {
  if (slug.startsWith("certificate-")) {
    const programmeId = slug.slice("certificate-".length);
    if (programmeId !== "kids" && programmeId !== "adolescents" && programmeId !== "adults") return null;
    return certificateAchievement(programmeId, origin);
  }
  if (slug.startsWith("milestone-")) {
    const badgeId = slug.slice("milestone-".length);
    if (!(badgeId in BADGES)) return null;
    return milestoneAchievement(badgeId as BadgeId, origin);
  }
  return null;
}

export function issuerProfile(origin = canonicalOrigin(), verificationMethod?: string, publicKeyMultibase?: string) {
  const id = issuerId(origin);
  const profile: Record<string, unknown> = {
    "@context": [...OB_CONTEXT],
    id,
    type: ["Profile"],
    name: ISSUER_NAME,
    url: origin,
    description:
      "Super-Cube® by Big Five Group issues leadership certificates and milestone badges for its learning programmes. Certificates can also be checked at /verify.",
    image: achievementImage(origin),
  };
  if (verificationMethod && publicKeyMultibase) {
    profile.verificationMethod = [
      {
        id: verificationMethod,
        type: "Multikey",
        controller: id,
        publicKeyMultibase,
      },
    ];
    profile.assertionMethod = [verificationMethod];
  }
  return profile;
}

type SubjectInput = {
  email?: string | null;
  accountId?: string | null;
  salt: string;
};

function identifier(input: SubjectInput) {
  if (input.email?.includes("@")) {
    return {
      type: "IdentityObject",
      hashed: true,
      identityType: "emailAddress",
      identityHash: identityHash(normaliseEmail(input.email), input.salt),
      salt: input.salt,
    };
  }
  if (input.accountId) {
    return {
      type: "IdentityObject",
      hashed: true,
      identityType: "accountId",
      identityHash: identityHash(input.accountId, input.salt),
      salt: input.salt,
    };
  }
  throw new Error("A credential needs an email or an account id to bind");
}

export function buildCredential(input: {
  id: string;
  origin?: string;
  issuedAt: string;
  achievement: AchievementDoc;
  email?: string | null;
  accountId?: string | null;
  salt?: string;
}): { document: CredentialDoc; salt: string } {
  const origin = input.origin ?? canonicalOrigin();
  const salt = input.salt ?? newSalt();
  const when = dateTimeZ(input.issuedAt);
  const { "@context": _context, ...achievement } = input.achievement;
  const document: CredentialDoc = {
    "@context": [...OB_CONTEXT],
    id: `${origin}/credentials/${encodeURIComponent(input.id)}`,
    type: ["VerifiableCredential", "OpenBadgeCredential"],
    name: input.achievement.name,
    issuer: {
      id: issuerId(origin),
      type: ["Profile"],
      name: ISSUER_NAME,
      url: origin,
    },
    validFrom: when,
    awardedDate: when,
    credentialSubject: {
      type: ["AchievementSubject"],
      achievement,
      identifier: [identifier({ email: input.email, accountId: input.accountId, salt })],
    },
    credentialStatus: {
      id: `${origin}/credentials/${encodeURIComponent(input.id)}/status`,
      type: "CredentialStatus",
    },
  };
  return { document, salt };
}

export function credentialAchievementName(document: unknown): string | null {
  if (!document || typeof document !== "object") return null;
  const subject = (document as { credentialSubject?: { achievement?: { name?: string } } }).credentialSubject;
  return subject?.achievement?.name ?? null;
}

export function credentialValidFrom(document: unknown): string | null {
  if (!document || typeof document !== "object") return null;
  const value = (document as { validFrom?: unknown }).validFrom;
  return typeof value === "string" ? value : null;
}

/** True when the signed or unsigned document still contains a raw email address. */
export function documentContainsEmail(document: unknown, email: string): boolean {
  return JSON.stringify(document).toLowerCase().includes(email.trim().toLowerCase());
}
