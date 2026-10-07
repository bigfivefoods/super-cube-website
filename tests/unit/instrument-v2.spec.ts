import { test, expect } from "@playwright/test";
import { constructs } from "@/lib/content";
import { buildAssessmentItems } from "@/lib/lms/curriculum";
import {
  buildInstrumentItems,
  honestyItem,
  instrumentSummary,
  isInstrumentV2EnabledClient,
  isInstrumentV2EnabledServer,
  observerItems,
  versionOf,
  versionOfResponses,
} from "@/lib/lms/instruments";
import { V2_BANK } from "@/lib/lms/instruments/v2-bank";
import { averageObserverScores, is360EnabledServer, MIN_RATERS_TO_SHOW, scoreObserver, validateObserverResponses } from "@/lib/lms/feedback360";
import { likertToScore, scoreAttempt } from "@/lib/lms/scoring";
import type { ProgrammeId } from "@/lib/programmes";

const PROGRAMMES: ProgrammeId[] = ["kids", "adolescents", "adults"];

test("flags are OFF by default", () => {
  expect(isInstrumentV2EnabledServer()).toBe(false);
  expect(isInstrumentV2EnabledClient()).toBe(false);
  expect(is360EnabledServer()).toBe(false);
});

test("v1 standard form is unchanged: 28 Likert items, same ids, same scoring", () => {
  for (const p of PROGRAMMES) {
    const v1 = buildInstrumentItems(p, "v1");
    expect(v1).toEqual(buildAssessmentItems(p));
    expect(v1.every((i) => i.itemType === "likert_5" && !i.reverse && !i.options)).toBe(true);
    expect(v1.every((i) => versionOf(i.id) === "v1")).toBe(true);
  }
  expect(buildInstrumentItems("adults", "v1").length).toBe(28);
  // Original engine: mean of 1..5 answers per face, mapped to 0–100, rounded to 0.1
  const items = buildInstrumentItems("adults", "v1");
  const responses = Object.fromEntries(items.map((it, i) => [it.id, (i % 5) + 1]));
  const r = scoreAttempt(items, responses);
  for (const c of constructs) {
    const vals = items.filter((i) => i.constructId === c.id).map((i) => responses[i.id]);
    const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
    const face = r.constructScores.find((s) => s.constructId === c.id)!;
    expect(face.score).toBe(Math.round(likertToScore(mean) * 10) / 10);
    expect(face).not.toHaveProperty("sjtScore");
  }
});

test("v2 bank: 6–8 Likert and 2–3 SJTs per face for every programme", () => {
  for (const p of PROGRAMMES) {
    const sum = instrumentSummary(p, "v2");
    for (const f of sum.perFace) {
      expect(f.likert, `${p}/${f.faceId} likert`).toBeGreaterThanOrEqual(6);
      expect(f.likert, `${p}/${f.faceId} likert`).toBeLessThanOrEqual(8);
      expect(f.sjt, `${p}/${f.faceId} sjt`).toBeGreaterThanOrEqual(2);
      expect(f.sjt, `${p}/${f.faceId} sjt`).toBeLessThanOrEqual(3);
      expect(f.reverse, `${p}/${f.faceId} has a reverse item`).toBeGreaterThanOrEqual(1);
    }
    expect(buildInstrumentItems(p, "v2").every((i) => versionOf(i.id) === "v2")).toBe(true);
  }
});

test("v2 item-writing rules: reverse items avoid negation; each SJT has one best answer", () => {
  for (const p of PROGRAMMES) {
    for (const c of constructs) {
      const face = V2_BANK[p][c.id];
      for (const l of face.likert.filter((x) => x.reverse)) {
        expect(l.self, `${p}/${c.id}: ${l.self}`).not.toMatch(/\bnot\b|n't\b|\bnever\b/i);
      }
      for (const l of face.likert) expect(l.observer).toContain("{name}");
      for (const s of face.sjt) {
        const keys = s.options.map((o) => o.key);
        expect(keys.filter((k) => k === 4).length, s.scenario).toBe(1);
        expect(s.options.length).toBeGreaterThanOrEqual(3);
      }
    }
  }
});

test("v2 scoring reverse-keys Likert items and blends SJTs at 30%", () => {
  const items = buildInstrumentItems("adults", "v2");
  // Always the top option and the best SJT answer: every face should score 100
  const best = Object.fromEntries(
    items.map((i) => [i.id, i.itemType === "sjt" ? i.options!.find((o) => o.key === 4)!.value : i.reverse ? 1 : 5]),
  );
  const r = scoreAttempt(items, best);
  for (const f of r.constructScores) expect(f.score).toBe(100);
  // Straight 5s ignore reverse keying, so they cannot reach the top
  const fives = Object.fromEntries(items.map((i) => [i.id, i.itemType === "sjt" ? i.options!.find((o) => o.key === 1)!.value : 5]));
  const r2 = scoreAttempt(items, fives);
  for (const f of r2.constructScores) {
    expect(f.score).toBeLessThan(100);
    expect(f.sjtScore).toBe(0);
  }
  expect(versionOfResponses(best)).toBe("v2");
});

test("honesty item is separate from face scores", () => {
  const h = honestyItem("adults");
  expect(h.labels.length).toBe(5);
  const items = buildInstrumentItems("adults", "v2");
  const base = Object.fromEntries(items.map((i) => [i.id, i.itemType === "sjt" ? 1 : 3]));
  const a = scoreAttempt(items, base);
  const b = scoreAttempt(items, { ...base, [h.id]: 1 });
  expect(b).toEqual(a);
});

test("observer (360) form: third person, scored with 'not seen' left out, anonymity per face", () => {
  const obs = observerItems("adults", "Thandi");
  expect(obs.length).toBeGreaterThanOrEqual(36);
  expect(obs.every((o) => !o.prompt.includes("{name}"))).toBe(true);
  expect(obs.some((o) => o.prompt.includes("Thandi"))).toBe(true);
  expect(MIN_RATERS_TO_SHOW).toBe(3);

  const all4 = Object.fromEntries(obs.map((o) => [o.id, 4]));
  const v = validateObserverResponses(obs, all4);
  expect(v.ok).toBe(true);
  const tooFew = Object.fromEntries(obs.map((o, i) => [o.id, i < 3 ? 4 : 0]));
  expect(validateObserverResponses(obs, tooFew).ok).toBe(false);

  const s = scoreObserver(obs, all4);
  expect(s.every((f) => f.score != null && f.answered > 0)).toBe(true);

  // A face seen by only one of three raters is hidden at minPerFace = 3
  const seen = scoreObserver(obs, all4);
  const unseen = scoreObserver(obs, Object.fromEntries(obs.map((o) => [o.id, o.constructId === "spiritual" ? 0 : 4])));
  const avg = averageObserverScores([seen, unseen, unseen], 3);
  expect(avg.find((f) => f.constructId === "spiritual")!.score).toBeNull();
  expect(avg.find((f) => f.constructId === "choices")!.score).not.toBeNull();
});
