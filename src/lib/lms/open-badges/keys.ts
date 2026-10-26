/**
 * Signing keys stay in the environment. Nothing here reads a file from the repo.
 *
 * OB3_SIGNING_PRIVATE_KEY  Ed25519 PKCS#8 PEM, base64 PKCS#8, or base64 32-byte seed.
 *                          PEM newlines may be written as \n in a single env line.
 * OB3_SIGNING_PUBLIC_KEY   Optional SPKI PEM. A verifier-only deploy can set this
 *                          without the private key. When both are set they must match.
 */
import { createPrivateKey, createPublicKey, type KeyObject } from "node:crypto";
import { publicKeyMultibase } from "@/lib/lms/open-badges/crypto";
import { issuerId } from "@/lib/lms/open-badges/document";

const PKCS8_SEED_PREFIX = Buffer.from("302e020100300506032b657004220420", "hex");

export type Ob3Keys = {
  privateKey: KeyObject | null;
  publicKey: KeyObject | null;
  publicKeyMultibase: string | null;
  verificationMethod: string | null;
};

type Ob3Env = {
  OB3_SIGNING_PRIVATE_KEY?: string;
  OB3_SIGNING_PUBLIC_KEY?: string;
};

export function loadOb3Keys(env: Ob3Env = process.env as Ob3Env): Ob3Keys {
  const privateKey = loadPrivate(env.OB3_SIGNING_PRIVATE_KEY);
  let publicKey = privateKey ? createPublicKey(privateKey) : loadPublic(env.OB3_SIGNING_PUBLIC_KEY);
  if (privateKey && env.OB3_SIGNING_PUBLIC_KEY?.trim()) {
    const declared = loadPublic(env.OB3_SIGNING_PUBLIC_KEY);
    if (!declared || publicKeyMultibase(declared) !== publicKeyMultibase(publicKey!)) {
      throw new Error("OB3_SIGNING_PUBLIC_KEY does not match OB3_SIGNING_PRIVATE_KEY");
    }
    publicKey = declared;
  }
  if (!publicKey) {
    return { privateKey: null, publicKey: null, publicKeyMultibase: null, verificationMethod: null };
  }
  const multibase = publicKeyMultibase(publicKey);
  return {
    privateKey,
    publicKey,
    publicKeyMultibase: multibase,
    verificationMethod: `${issuerId()}#${multibase}`,
  };
}

function loadPrivate(raw: string | undefined): KeyObject | null {
  const text = raw?.trim();
  if (!text) return null;
  const pem = text.replace(/\\n/g, "\n");
  if (pem.includes("BEGIN")) return createPrivateKey(pem);
  const der = Buffer.from(pem, "base64");
  if (der.length === 32) {
    return createPrivateKey({ key: Buffer.concat([PKCS8_SEED_PREFIX, der]), format: "der", type: "pkcs8" });
  }
  return createPrivateKey({ key: der, format: "der", type: "pkcs8" });
}

function loadPublic(raw: string | undefined): KeyObject | null {
  const text = raw?.trim();
  if (!text) return null;
  return createPublicKey(text.replace(/\\n/g, "\n"));
}
