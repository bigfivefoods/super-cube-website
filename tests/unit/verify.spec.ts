import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import path from "node:path";
import { linkedInAddToProfileUrl } from "@/lib/lms/certificate";
import { isCertId, normaliseCertId, toPublicCertificate, VERIFY_ISSUER } from "@/lib/lms/verify";

const ROOT = path.resolve(__dirname, "../..");

test("certificate IDs are normalised and strictly checked", () => {
  expect(normaliseCertId(" sc-20261004-1a2b3c4d5e ")).toBe("SC-20261004-1A2B3C4D5E");
  expect(normaliseCertId("SC-20261004-1A2B%203C4D5E")).toBe("SC-20261004-1A2B3C4D5E");
  expect(normaliseCertId("%E0%A4%A")).toBe("%E0%A4%A");
  expect(isCertId("SC-20261004-1A2B3C4D5E")).toBe(true);
  for (const bad of ["", "SC-2026-0001", "SC-20261004-XYZ123", "SC-20261004-1A2B3C4D5E6F7", "' or 1=1 --"]) {
    expect(isCertId(normaliseCertId(bad)), bad).toBe(false);
  }
});

test("public shape carries no scores, user id or cohort", () => {
  const pub = toPublicCertificate({
    id: "SC-20261004-1A2B3C4D5E",
    learner_name: "Thandi Mokoena",
    programme_id: "adults",
    issued_at: "2026-10-04T10:00:00Z",
    revoked: false,
    // extra columns a careless select might return must not leak through
    ...({ pre_overall: 50, post_overall: 60, user_id: "u", org_code: "ACME" } as object),
  } as Parameters<typeof toPublicCertificate>[0]);
  expect(Object.keys(pub).sort()).toEqual(["holderName", "id", "issuedAt", "programmeId", "revokedAt", "revoked"].sort());
});

test("Add to LinkedIn names Big Five Group as the issuing organisation", () => {
  const u = new URL(
    linkedInAddToProfileUrl(
      { id: "SC-20261004-1A2B3C4D5E", programmeId: "adults", issuedAt: "2026-10-04T10:00:00Z", siteOrigin: "https://www.super-cube.me" },
      VERIFY_ISSUER,
    ),
  );
  expect(u.searchParams.get("organizationName")).toBe("Big Five Group");
  expect(u.searchParams.get("certUrl")).toBe("https://www.super-cube.me/verify/SC-20261004-1A2B3C4D5E");
});

test("the lookup selects only public columns", () => {
  const src = readFileSync(path.join(ROOT, "src/lib/lms/server/certificate-lookup.ts"), "utf8");
  const cols = /const COLUMNS = "([^"]+)"/.exec(src)?.[1] ?? "";
  expect(cols.split(/,\s*/).sort()).toEqual(["id", "issued_at", "learner_name", "programme_id", "revoked", "revoked_at"]);
  const sql = readFileSync(path.join(ROOT, "supabase/migrations/20261019100000_verify_certificate.sql"), "utf8").replace(/--.*$/gm, "");
  expect(sql).not.toMatch(/pre_overall|post_overall|growth|user_id|org_code|meta/);
});
