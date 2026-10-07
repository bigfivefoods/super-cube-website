import type { SupabaseClient } from "@supabase/supabase-js";
import { constructs } from "@/lib/content";
import { cronbachAlpha, type QualityFlag } from "@/lib/lms/integrity";

/** Flags that make an attempt unusable for reliability estimates. */
export const EXCLUDING_FLAGS: QualityFlag[] = ["attention_failed", "straight_lining", "too_fast"];

export type FaceReliability = { faceId: string; name: string; items: number; n: number; alpha: number | null };
export type ProgrammeReliability = {
  programmeId: string;
  phase: "pre" | "post";
  attempts: number;
  usable: number;
  flagCounts: Record<string, number>;
  faces: FaceReliability[];
  overall: { items: number; n: number; alpha: number | null };
};

type AttemptRow = { id: string; programme_id: string; phase: string; flags: string[] | null };
type ItemRow = { attempt_id: string; item_id: string; construct_id: string; value: number };

/** Pure: build per-programme, per-face Cronbach's alpha from stored item answers. */
export function computeReliability(attempts: AttemptRow[], items: ItemRow[]): ProgrammeReliability[] {
  const byAttempt = new Map<string, Map<string, number>>();
  const itemFace = new Map<string, string>();
  for (const r of items) {
    if (r.construct_id === "attention") continue;
    itemFace.set(r.item_id, r.construct_id);
    const m = byAttempt.get(r.attempt_id) ?? new Map<string, number>();
    m.set(r.item_id, r.value);
    byAttempt.set(r.attempt_id, m);
  }
  const groups = new Map<string, AttemptRow[]>();
  for (const a of attempts) {
    if (a.phase !== "pre" && a.phase !== "post") continue;
    const key = `${a.programme_id}|${a.phase}`;
    groups.set(key, [...(groups.get(key) ?? []), a]);
  }
  const out: ProgrammeReliability[] = [];
  for (const [key, list] of groups) {
    const [programmeId, phase] = key.split("|") as [string, "pre" | "post"];
    const flagCounts: Record<string, number> = {};
    for (const a of list) for (const f of a.flags ?? []) flagCounts[f] = (flagCounts[f] ?? 0) + 1;
    const usable = list.filter((a) => !(a.flags ?? []).some((f) => (EXCLUDING_FLAGS as string[]).includes(f)) && byAttempt.has(a.id));
    const prefix = `super_cube_${programmeId}_v1-`;
    const allItems = [...itemFace.keys()].filter((id) => id.startsWith(prefix)).sort();
    const matrix = (ids: string[]) =>
      usable
        .map((a) => ids.map((id) => byAttempt.get(a.id)!.get(id)))
        .filter((row): row is number[] => row.every((v) => typeof v === "number"));
    const faces: FaceReliability[] = constructs.map((c) => {
      const ids = allItems.filter((id) => itemFace.get(id) === c.id);
      const rows = matrix(ids);
      return { faceId: c.id, name: c.name, items: ids.length, n: rows.length, alpha: cronbachAlpha(rows) };
    });
    const allRows = matrix(allItems);
    out.push({
      programmeId,
      phase,
      attempts: list.length,
      usable: usable.length,
      flagCounts,
      faces,
      overall: { items: allItems.length, n: allRows.length, alpha: cronbachAlpha(allRows) },
    });
  }
  return out.sort((a, b) => a.programmeId.localeCompare(b.programmeId) || a.phase.localeCompare(b.phase));
}

export async function loadReliability(db: SupabaseClient) {
  const [attempts, items] = await Promise.all([
    db.from("lms_attempts").select("id, programme_id, phase, flags").in("phase", ["pre", "post"]).limit(20000),
    db.from("lms_item_responses").select("attempt_id, item_id, construct_id, value").in("phase", ["pre", "post"]).limit(200000),
  ]);
  const error = attempts.error?.message || items.error?.message || null;
  return {
    error,
    programmes: computeReliability((attempts.data ?? []) as AttemptRow[], (items.data ?? []) as ItemRow[]),
  };
}
