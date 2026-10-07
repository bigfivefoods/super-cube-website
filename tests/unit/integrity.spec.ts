import { expect, test } from "@playwright/test";
import { constructs } from "@/lib/content";
import { buildAssessmentItems } from "@/lib/lms/curriculum";
import {
  attentionItem,
  cronbachAlpha,
  isStraightLining,
  itemOrder,
  itemsForFace,
  qualityFlags,
  seededShuffle,
} from "@/lib/lms/integrity";
import { computeReliability } from "@/lib/admin/reliability";

const faces = constructs.map((c) => c.id);

test("Cronbach's alpha matches a hand-checked value", () => {
  const rows = [[4, 5, 4, 5], [2, 2, 3, 2], [3, 4, 3, 3], [5, 5, 4, 5], [1, 2, 2, 1], [3, 3, 4, 4]];
  expect(cronbachAlpha(rows)!).toBeCloseTo(0.9531, 3);
  expect(cronbachAlpha([[1, 2], [2, 3]])).toBeNull(); // too few respondents
  expect(cronbachAlpha([[3, 3], [3, 3], [3, 3]])).toBeNull(); // no variance
});

test("item order is random per seed, stable for the same seed, and keeps every item", () => {
  const items = buildAssessmentItems("adults");
  const att = attentionItem("adults");
  const a = itemOrder(items, faces, 123, att);
  const b = itemOrder(items, faces, 123, att);
  const c = itemOrder(items, faces, 99999, att);
  expect(a).toEqual(b);
  expect(a).not.toEqual(c);
  expect(new Set(a).size).toBe(items.length + 1);
  expect(a.filter((id) => id === att.id)).toHaveLength(1);
  // Items stay within their own face
  for (const f of faces) {
    const shown = itemsForFace(items, faces, f, 123, att).filter((i) => !i.attention);
    expect(shown.every((i) => i.constructId === f)).toBe(true);
    expect(shown).toHaveLength(items.filter((i) => i.constructId === f).length);
  }
  expect(seededShuffle([1, 2, 3, 4, 5], 7).sort()).toEqual([1, 2, 3, 4, 5]);
});

test("the attention check is never the first statement on its face", () => {
  const items = buildAssessmentItems("kids");
  const att = attentionItem("kids");
  for (let seed = 0; seed < 200; seed++) {
    for (const f of faces) {
      const shown = itemsForFace(items, faces, f, seed, att);
      expect(shown[0]?.attention).not.toBe(true);
    }
  }
});

test("quality flags: attention, straight-lining and speed", () => {
  const same = Array(28).fill(4);
  const varied = [1, 2, 3, 4, 5, 4, 3, 2, 1, 2, 3, 4, 5, 4, 3, 2, 1, 2, 3, 4, 5, 4, 3, 2, 1, 2, 3, 4];
  expect(isStraightLining(same)).toBe(true);
  expect(isStraightLining(varied)).toBe(false);
  expect(qualityFlags({ scoredValues: varied, attentionValue: 4, durationMs: 300_000 })).toEqual([]);
  expect(qualityFlags({ scoredValues: varied, attentionValue: 2, durationMs: 300_000 })).toEqual(["attention_failed"]);
  expect(qualityFlags({ scoredValues: varied, attentionValue: null })).toEqual(["attention_missing"]);
  expect(qualityFlags({ scoredValues: same, attentionValue: 4, durationMs: 10_000 })).toEqual(["straight_lining", "too_fast"]);
});

test("reliability leaves out flagged attempts", () => {
  const items = buildAssessmentItems("adults");
  const attempts = Array.from({ length: 6 }, (_, i) => ({ id: `a${i}`, programme_id: "adults", phase: "pre", flags: i === 5 ? ["attention_failed"] : [] }));
  const rows = attempts.flatMap((a, i) =>
    items.map((it, j) => ({ attempt_id: a.id, item_id: it.id, construct_id: it.constructId, value: 1 + ((i + (j % 2)) % 5) })),
  );
  const [r] = computeReliability(attempts, rows);
  expect(r.attempts).toBe(6);
  expect(r.usable).toBe(5);
  expect(r.flagCounts).toEqual({ attention_failed: 1 });
  expect(r.faces).toHaveLength(6);
  expect(r.overall.items).toBe(items.length);
  expect(r.overall.n).toBe(5);
});
