/**
 * The tool signs deep-linking responses and service tokens with RSA (RS256),
 * which LTI 1.3 requires. Open Badges stay on their own Ed25519 key.
 *
 * LTI_TOOL_PRIVATE_KEY  RSA PKCS#8 PEM. Newlines may be written as \n.
 * LTI_TOOL_KEY_ID       Optional key id published in the tool JWKS.
 */
import { createPrivateKey, createPublicKey, type JsonWebKey, type KeyObject } from "node:crypto";

export type LtiKeys = {
  privateKey: KeyObject | null;
  publicKey: KeyObject | null;
  kid: string;
  jwks: { keys: JsonWebKey[] };
};

type Env = {
  LTI_TOOL_PRIVATE_KEY?: string;
  LTI_TOOL_KEY_ID?: string;
};

export function loadLtiKeys(env: Env = process.env as Env): LtiKeys {
  const kid = cleanKid(env.LTI_TOOL_KEY_ID) || "supercube-lti-1";
  const raw = env.LTI_TOOL_PRIVATE_KEY?.trim();
  if (!raw) return { privateKey: null, publicKey: null, kid, jwks: { keys: [] } };
  let privateKey: KeyObject;
  try {
    privateKey = createPrivateKey(raw.replace(/\\n/g, "\n"));
  } catch {
    throw new Error("LTI_TOOL_PRIVATE_KEY is not a usable RSA private key");
  }
  if (privateKey.asymmetricKeyType !== "rsa") {
    throw new Error("LTI_TOOL_PRIVATE_KEY must be an RSA key (LTI 1.3 uses RS256)");
  }
  const publicKey = createPublicKey(privateKey);
  return { privateKey, publicKey, kid, jwks: { keys: [publicJwk(publicKey, kid)] } };
}

export function keysFromPrivate(privateKey: KeyObject, kid = "supercube-lti-1"): LtiKeys {
  const publicKey = createPublicKey(privateKey);
  return { privateKey, publicKey, kid, jwks: { keys: [publicJwk(publicKey, kid)] } };
}

export function publicJwk(publicKey: KeyObject, kid: string): JsonWebKey {
  const jwk = publicKey.export({ format: "jwk" }) as JsonWebKey;
  delete jwk.d;
  delete jwk.p;
  delete jwk.q;
  delete jwk.dp;
  delete jwk.dq;
  delete jwk.qi;
  return { ...jwk, kid, alg: "RS256", use: "sig" };
}

function cleanKid(raw: string | undefined): string | null {
  const kid = raw?.trim() ?? "";
  return /^[A-Za-z0-9._-]{1,64}$/.test(kid) ? kid : null;
}
