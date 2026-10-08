import { test, expect } from "@playwright/test";
import { constructs } from "@/lib/content";
import { bandFor, buildAssessmentNarrative, faceGrowthLine, BAND_LABELS } from "@/lib/lms/narrative";
import type { AttemptResult } from "@/lib/lms/scoring";

const result = (scores: number[]): AttemptResult => ({
  constructScores: constructs.map((c, i) => ({ constructId: c.id, name: c.name, color: c.color, score: scores[i], rawMean: 1 + scores[i] / 25, itemCount: 4 })),
  overall: scores.reduce((a, b) => a + b, 0) / scores.length,
});

test("bands: four strengths-first labels with fixed cut-offs", () => {
  expect([0, 39.9, 40, 59.9, 60, 79.9, 80, 100].map(bandFor)).toEqual([
    "emerging", "emerging", "developing", "developing", "established", "established", "signature", "signature",
  ]);
  expect(Object.values(BAND_LABELS).every((l) => l.endsWith("strength"))).toBe(true);
});

test("narrative lists the strongest face first and opens every face with a strength", () => {
  for (const p of ["adults", "adolescents", "kids"] as const) {
    const n = buildAssessmentNarrative(result([30, 85, 55, 70, 45, 62]), p);
    expect(n.faces[0].constructId).toBe("principles");
    expect(n.strongestIds[0]).toBe("principles");
    expect(n.weakestIds[0]).toBe("choices");
    for (const f of n.faces) {
      expect(f.strength.length).toBeGreaterThan(10);
      expect(f.nextStep).toMatch(/^(Next|Try):/);
      expect(f.sessionHref).toBe(`/learn/courses/${f.constructId}`);
      expect(f.strength + f.nextStep).not.toMatch(/[0-9]+\s?%/);
    }
    expect(n.overallBody).toMatch(/Principles/);
  }
  const phys = buildAssessmentNarrative(result([50, 50, 50, 50, 20, 50])).faces.find((f) => f.constructId === "physical")!;
  expect(phys.nextStep).toMatch(/health professional/);
});

test("face growth wording is noise-aware", () => {
  expect(faceGrowthLine("Mental", 50, 80)).toMatch(/placeholder band/);
  expect(faceGrowthLine("Mental", 50, 51)).toMatch(/held steady/);
  expect(faceGrowthLine("Mental", 70, 40)).toMatch(/response shift/);
});
