import { test, expect } from "@playwright/test";
import { constructs } from "@/lib/content";
import {
  credentialDetails,
  credentialName,
  issuedYearMonth,
  linkedInAddToProfileUrl,
  linkedInShareUrl,
  qrMatrix,
  signed,
  verifyUrl,
} from "@/lib/lms/certificate";
import { buildCertificatePdf, pdfSafe } from "@/lib/lms/certificate-pdf";

const origin = "https://www.super-cube.me";
const faces = (v: number[]) => constructs.map((c, i) => ({ constructId: c.id, name: c.name, color: c.color, score: v[i], rawMean: 3, itemCount: 4 }));
const cert = {
  id: "SC-20261003-1A2B3C4D5E",
  learnerName: "Thandi Mokoena",
  programmeId: "adults",
  preOverall: 53,
  postOverall: 65.5,
  growth: 12.5,
  issuedAt: "2026-09-30T23:30:00.000Z", // 1 Oct in SAST
  siteOrigin: origin,
};

test("verify URL and LinkedIn links point at the public verify page", () => {
  expect(verifyUrl(cert.id, origin)).toBe(`${origin}/verify/${cert.id}`);
  const add = new URL(linkedInAddToProfileUrl(cert));
  expect(add.origin + add.pathname).toBe("https://www.linkedin.com/profile/add");
  expect(add.searchParams.get("startTask")).toBe("CERTIFICATION_NAME");
  expect(add.searchParams.get("organizationName")).toBe("Super-Cube®");
  expect(add.searchParams.get("certId")).toBe(cert.id);
  expect(add.searchParams.get("certUrl")).toBe(`${origin}/verify/${cert.id}`);
  // Issue month follows SAST, not UTC
  expect(add.searchParams.get("issueYear")).toBe("2026");
  expect(add.searchParams.get("issueMonth")).toBe("10");
  expect(issuedYearMonth(cert.issuedAt)).toEqual({ year: 2026, month: 10 });
  expect(linkedInShareUrl(cert.id, origin)).toContain(encodeURIComponent(`${origin}/verify/${cert.id}`));
});

test("brand is written Super-Cube® exactly once", () => {
  const name = credentialName("adults");
  expect(name).toContain("Super-Cube® Adults");
  expect(name).not.toContain("®®");
  for (const d of credentialDetails(cert)) expect(d.value).not.toContain("®®");
});

test("signed numbers and PDF-safe text", () => {
  expect(signed(12.46)).toBe("+12.5");
  expect(signed(-3)).toBe("-3");
  expect(signed(0)).toBe("0");
  expect(pdfSafe("52 → 64 ‘ok’")).toBe("52 to 64 'ok'");
  expect(pdfSafe("Super-Cube®")).toBe("Super-Cube®");
});

test("QR matrix encodes the verify URL", () => {
  const m = qrMatrix(verifyUrl(cert.id, origin));
  expect(m.length).toBeGreaterThanOrEqual(25);
  expect(m.every((row) => row.length === m.length)).toBe(true);
  // Finder pattern corner is dark
  expect(m[0][0]).toBe(true);
});

test("certificate PDF is A4 landscape with the verify link and author", () => {
  const doc = buildCertificatePdf({ ...cert, preFaces: faces([52, 61, 48, 44, 58, 55]), postFaces: faces([64, 70, 63, 66, 62, 68]), logo: null });
  expect(doc.getNumberOfPages()).toBe(1);
  expect(Math.round(doc.internal.pageSize.getWidth())).toBe(297);
  expect(Math.round(doc.internal.pageSize.getHeight())).toBe(210);
  const raw = doc.output();
  expect(raw).toContain(`/verify/${cert.id}`);
  expect(raw).toContain("Dr Craig R. Muller");
  // A long name still fits on one page
  const long = buildCertificatePdf({ ...cert, learnerName: "Nomvula Charlotte Dlamini-van der Merwe Mthembu", logo: null });
  expect(long.getNumberOfPages()).toBe(1);
});
