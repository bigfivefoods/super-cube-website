/**
 * Sample artefacts for review (not a test): GEN_DOCS=/abs/out/dir npm run test:unit -- docs
 * Skipped in CI and normal runs.
 */
import { test } from "@playwright/test";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { constructs } from "@/lib/content";
import { buildGrowthReportPdf } from "@/lib/lms/report-pdf";
import { buildCertificatePdf } from "@/lib/lms/certificate-pdf";
import type { AttemptResult } from "@/lib/lms/scoring";
import type { LocalAttempt, LocalLmsState } from "@/lib/lms/store";

const OUT = process.env.GEN_DOCS;

const result = (scores: number[]): AttemptResult => ({
  constructScores: constructs.map((c, i) => ({ constructId: c.id, name: c.name, color: c.color, score: scores[i], rawMean: 1 + scores[i] / 25, itemCount: 4 })),
  overall: Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10,
});
// Illustrative sample learner only (not research data)
export const SAMPLE_PRE = result([52, 61, 48, 44, 58, 55]);
export const SAMPLE_POST = result([64, 70, 63, 66, 62, 68]);

test.describe("sample documents", () => {
  test.skip(!OUT, "set GEN_DOCS to an output directory");

  test("growth report PDF", () => {
    const pre: LocalAttempt = { phase: "pre", programmeId: "adults", responses: {}, result: SAMPLE_PRE, completedAt: "2026-09-10T08:00:00.000Z" };
    const post: LocalAttempt = { phase: "post", programmeId: "adults", responses: {}, result: SAMPLE_POST, completedAt: "2026-10-03T08:00:00.000Z" };
    const state = { user: { email: "", fullName: "Thandi Mokoena", programmeId: "adults" }, lessonProgress: {}, attempts: [pre, post] } as LocalLmsState;
    const doc = buildGrowthReportPdf({ state, pre, post });
    writeFileSync(join(OUT!, "sample-growth-report.pdf"), Buffer.from(doc.output("arraybuffer")));
  });

  test("certificate PDF", () => {
    const png = new Uint8Array(readFileSync(join(process.cwd(), "public/brand/logo.png")));
    const dv = new DataView(png.buffer, png.byteOffset, png.byteLength);
    const base = {
      id: "SC-20261003-1A2B3C4D5E",
      programmeId: "adults",
      preOverall: SAMPLE_PRE.overall,
      postOverall: SAMPLE_POST.overall,
      growth: SAMPLE_POST.overall - SAMPLE_PRE.overall,
      issuedAt: "2026-10-03T08:00:00.000Z",
      siteOrigin: "https://www.super-cube.me",
      logo: { data: png, width: dv.getUint32(16), height: dv.getUint32(20) },
    };
    const doc = buildCertificatePdf({ ...base, learnerName: "Thandi Mokoena", preFaces: SAMPLE_PRE.constructScores, postFaces: SAMPLE_POST.constructScores });
    writeFileSync(join(OUT!, "sample-certificate.pdf"), Buffer.from(doc.output("arraybuffer")));
    const long = buildCertificatePdf({ ...base, logo: null, learnerName: "Nomvula Charlotte Dlamini-van der Merwe" });
    writeFileSync(join(OUT!, "sample-certificate-long-name.pdf"), Buffer.from(long.output("arraybuffer")));
  });
});
