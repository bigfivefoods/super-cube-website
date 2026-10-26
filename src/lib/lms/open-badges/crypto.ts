/**
 * Data Integrity proof, cryptosuite eddsa-jcs-2022
 * (W3C Data Integrity EdDSA Cryptosuites, the suite Open Badges 3.0 requires).
 *
 * JCS is used instead of RDF canonicalisation so verification does not depend on
 * a JSON-LD library. The proof is an embedded DataIntegrityProof on the JSON-LD
 * credential. Ed25519 signs SHA-256(proof config) || SHA-256(document).
 */
import { createHash, createPublicKey, sign, verify, type KeyObject } from "node:crypto";
import { canonicalize } from "@/lib/lms/open-badges/jcs";
import { multibaseDecode, multibaseEncode } from "@/lib/lms/open-badges/multibase";

export const CRYPTOSUITE = "eddsa-jcs-2022";

const ED25519_PUB_PREFIX = Buffer.from([0xed, 0x01]);

export type ProofOptions = {
  verificationMethod: string;
  created: string;
  proofPurpose?: string;
};

export function publicKeyMultibase(publicKey: KeyObject): string {
  const spki = publicKey.export({ type: "spki", format: "der" }) as Buffer;
  const raw = spki.subarray(spki.length - 32);
  if (raw.length !== 32) throw new Error("Expected an Ed25519 public key");
  return multibaseEncode(Buffer.concat([ED25519_PUB_PREFIX, raw]));
}

export function signCredential(
  document: Record<string, unknown>,
  privateKey: KeyObject,
  options: ProofOptions,
): Record<string, unknown> {
  const { proof: _ignored, ...unsecured } = document;
  const proof = proofConfig(options);
  const proofValue = multibaseEncode(signatureBytes(unsecured, proof, privateKey));
  return { ...unsecured, proof: { ...proof, proofValue } };
}

export function verifyCredential(document: unknown, publicKey: KeyObject): boolean {
  if (!document || typeof document !== "object" || Array.isArray(document)) return false;
  const record = document as Record<string, unknown>;
  const proof = firstProof(record.proof);
  if (!proof) return false;
  if (proof.type !== "DataIntegrityProof" || proof.cryptosuite !== CRYPTOSUITE) return false;
  if (typeof proof.proofValue !== "string" || typeof proof.verificationMethod !== "string") return false;
  const { proofValue, ...config } = proof;
  const { proof: _ignored, ...unsecured } = record;
  let sig: Uint8Array;
  try {
    sig = multibaseDecode(proofValue);
  } catch {
    return false;
  }
  if (sig.length !== 64) return false;
  const message = hashData(unsecured, config);
  return verify(null, message, publicKey, sig);
}

/** Ed25519 SPKI PEM or raw verification, used when only the public key is configured. */
export function publicKeyFromSpkiPem(pem: string): KeyObject {
  return createPublicKey(pem.replace(/\\n/g, "\n"));
}

function proofConfig(options: ProofOptions): Record<string, string> {
  return {
    type: "DataIntegrityProof",
    cryptosuite: CRYPTOSUITE,
    created: options.created,
    verificationMethod: options.verificationMethod,
    proofPurpose: options.proofPurpose ?? "assertionMethod",
  };
}

function signatureBytes(
  document: Record<string, unknown>,
  proof: Record<string, string>,
  privateKey: KeyObject,
): Buffer {
  return sign(null, hashData(document, proof), privateKey);
}

function hashData(document: unknown, proof: unknown): Buffer {
  const docHash = createHash("sha256").update(canonicalize(document), "utf8").digest();
  const proofHash = createHash("sha256").update(canonicalize(proof), "utf8").digest();
  return Buffer.concat([proofHash, docHash]);
}

function firstProof(proof: unknown): Record<string, unknown> | null {
  const value = Array.isArray(proof) ? proof[0] : proof;
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}
