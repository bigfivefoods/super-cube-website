/**
 * RS256 JSON Web Tokens. LTI 1.3 requires this algorithm.
 * Verification tries the platform's published keys and refuses any other alg.
 */
import { createPublicKey, createSign, createVerify, type JsonWebKey, type KeyObject } from "node:crypto";
import { LtiProtocolError } from "@/lib/lti/errors";

export type JwtParts = { header: Record<string, unknown>; payload: Record<string, unknown> };

export function signJwt(payload: Record<string, unknown>, privateKey: KeyObject, kid: string): string {
  const header = { alg: "RS256", typ: "JWT", kid };
  const data = `${b64url(JSON.stringify(header))}.${b64url(JSON.stringify(payload))}`;
  const sig = createSign("RSA-SHA256").update(data).sign(privateKey);
  return `${data}.${b64url(sig)}`;
}

export function verifyJwt(token: string, keys: JsonWebKey[]): JwtParts {
  const parts = token.split(".");
  if (parts.length !== 3) throw new LtiProtocolError(401, "bad_token", "The launch token was not a signed JWT.");
  let header: Record<string, unknown>;
  let payload: Record<string, unknown>;
  try {
    header = decodeJson(parts[0]);
    payload = decodeJson(parts[1]);
  } catch {
    throw new LtiProtocolError(401, "bad_token", "The launch token could not be read.");
  }
  if (header.alg !== "RS256") {
    throw new LtiProtocolError(401, "bad_alg", "The launch token must be signed with RS256.");
  }
  const data = `${parts[0]}.${parts[1]}`;
  const signature = Buffer.from(parts[2], "base64url");
  const candidates = keys.filter((key) => key.kty === "RSA" && (!header.kid || key.kid === header.kid));
  if (candidates.length === 0) {
    throw new LtiProtocolError(401, "unknown_key", "The platform key set has no key for this launch.");
  }
  const ok = candidates.some((jwk) => {
    try {
      const key = createPublicKey({ key: jwk, format: "jwk" });
      return createVerify("RSA-SHA256").update(data).verify(key, signature);
    } catch {
      return false;
    }
  });
  if (!ok) throw new LtiProtocolError(401, "bad_signature", "The launch token signature does not match the platform key set.");
  return { header, payload };
}

export function readUnverified(token: string): JwtParts | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    return { header: decodeJson(parts[0]), payload: decodeJson(parts[1]) };
  } catch {
    return null;
  }
}

function decodeJson(part: string): Record<string, unknown> {
  const value = JSON.parse(Buffer.from(part, "base64url").toString("utf8")) as unknown;
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("bad");
  return value as Record<string, unknown>;
}

function b64url(value: string | Buffer): string {
  const buf = typeof value === "string" ? Buffer.from(value) : value;
  return buf.toString("base64url");
}
