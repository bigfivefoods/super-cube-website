import { createHash, generateKeyPairSync } from "node:crypto";
import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { bakeOpenBadgePng, extractOpenBadge, fallbackBadgePng } from "@/lib/lms/open-badges/bake";
import { publicKeyMultibase, signCredential, verifyCredential } from "@/lib/lms/open-badges/crypto";
import {
  buildCredential,
  certificateAchievement,
  documentContainsEmail,
  identityHash,
  ISSUER_NAME,
  issuerProfile,
  milestoneAchievement,
} from "@/lib/lms/open-badges/document";
import { canonicalize } from "@/lib/lms/open-badges/jcs";
import { loadOb3Keys } from "@/lib/lms/open-badges/keys";

test("JCS sorts object keys and keeps array order", () => {
  expect(canonicalize({ b: 1, a: { d: 1, c: 2 } })).toBe('{"a":{"c":2,"d":1},"b":1}');
  expect(canonicalize(["b", "a"])).toBe('["b","a"]');
  expect(canonicalize("é")).toBe('"é"');
});

test("identity hash concatenates identifier and salt with no separator", () => {
  // OB 3.0: SHA-256(UTF-8(identifier + salt)). The 1EdTech example string
  // is " a@example.com" + "Kosher". Its published digest does not match
  // SHA-256 of that string, so the expected value is the computed digest.
  const digest = createHash("sha256").update(" a@example.comKosher", "utf8").digest("hex");
  expect(digest).toBe("8184b65b83f37aaccd7db6e4bd06cac24279f83e7d278b1e1cff307496b0858b");
  expect(identityHash(" a@example.com", "Kosher")).toBe(`sha256$${digest}`);
});

test("a signed Open Badge 3.0 credential verifies and hides the email", () => {
  const { privateKey, publicKey } = generateKeyPairSync("ed25519");
  const email = "thandi@example.com";
  const achievement = certificateAchievement("adults", "https://www.super-cube.me");
  const { document } = buildCredential({
    id: "SC-20261026-ABCDEF0123",
    origin: "https://www.super-cube.me",
    issuedAt: "2026-10-26T08:00:00.000Z",
    achievement,
    email,
    salt: "abc123",
  });
  expect(documentContainsEmail(document, email)).toBe(false);
  expect(JSON.stringify(document)).toContain("Super-Cube® by Big Five Group");
  expect(JSON.stringify(document).toLowerCase()).not.toContain("kwaden");
  const multibase = publicKeyMultibase(publicKey);
  const signed = signCredential(document, privateKey, {
    verificationMethod: `https://www.super-cube.me/issuer/super-cube#${multibase}`,
    created: "2026-10-26T08:00:01Z",
  });
  expect(verifyCredential(signed, publicKey)).toBe(true);
  const tampered = structuredClone(signed) as { name?: string };
  tampered.name = "Someone else";
  expect(verifyCredential(tampered, publicKey)).toBe(false);
  const proof = signed.proof as { cryptosuite: string; type: string };
  expect(proof.type).toBe("DataIntegrityProof");
  expect(proof.cryptosuite).toBe("eddsa-jcs-2022");
});

test("issuer profile names Super-Cube® by Big Five Group", () => {
  const profile = issuerProfile("https://www.super-cube.me");
  expect(profile.name).toBe(ISSUER_NAME);
  expect(profile.name).toBe("Super-Cube® by Big Five Group");
  expect(milestoneAchievement("baseline-set", "https://www.super-cube.me").name).toContain("Super-Cube®");
});

test("keys load from a PEM env var and are not required to boot", () => {
  expect(loadOb3Keys({}).privateKey).toBeNull();
  const { privateKey } = generateKeyPairSync("ed25519");
  const pem = privateKey.export({ type: "pkcs8", format: "pem" }).toString().replace(/\n/g, "\\n");
  const loaded = loadOb3Keys({ OB3_SIGNING_PRIVATE_KEY: pem });
  expect(loaded.publicKeyMultibase?.startsWith("z")).toBe(true);
  expect(loaded.verificationMethod).toContain("/issuer/super-cube#");
});

test("baked PNG round-trips the credential JSON", () => {
  const logo = readFileSync("public/brand/logo-mark.png");
  const credential = JSON.stringify({ id: "https://www.super-cube.me/credentials/SC-20261026-ABCDEF0123", type: ["OpenBadgeCredential"] });
  const baked = bakeOpenBadgePng(logo, credential);
  expect(extractOpenBadge(baked)).toBe(credential);
  expect(extractOpenBadge(bakeOpenBadgePng(fallbackBadgePng(), credential))).toBe(credential);
  expect(extractOpenBadge(bakeOpenBadgePng(baked, "{\"id\":\"next\"}"))).toBe("{\"id\":\"next\"}");
});
