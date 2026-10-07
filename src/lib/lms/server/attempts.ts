import type { SupabaseClient } from "@supabase/supabase-js";
import { constructs } from "@/lib/content";
import { buildAssessmentItems, type AssessmentItem } from "@/lib/lms/curriculum";
import { attentionItem, itemOrder, qualityFlags, type QualityFlag } from "@/lib/lms/integrity";
import { scoreAttempt } from "@/lib/lms/scoring";
import type { ProgrammeId } from "@/lib/programmes";

export type AttemptMetaInput = {
  seed?: unknown;
  durationMs?: unknown;
  attention?: unknown;
};

export type ParsedAttempt = {
  items: AssessmentItem[];
  responses: Record<string, number>;
  attentionValue: number | null;
  seed: number | null;
  durationMs: number | null;
  flags: QualityFlag[];
};

/** Validate answers (every item 1..5, no extras) and work out quality flags. */
export function parseAttempt(
  programmeId: ProgrammeId,
  rawResponses: unknown,
  meta: AttemptMetaInput = {},
): { ok: true; value: ParsedAttempt } | { ok: false; error: string; itemId?: string } {
  const items = buildAssessmentItems(programmeId);
  const raw = rawResponses && typeof rawResponses === "object" ? (rawResponses as Record<string, unknown>) : {};
  const responses: Record<string, number> = {};
  for (const item of items) {
    const v = Number(raw[item.id]);
    if (!Number.isInteger(v) || v < 1 || v > 5) {
      return { ok: false, error: "Every item needs an answer from 1 to 5", itemId: item.id };
    }
    responses[item.id] = v;
  }
  const att = attentionItem(programmeId);
  const attRaw = meta.attention ?? raw[att.id];
  const attNum = Number(attRaw);
  const attentionValue = attRaw == null || attRaw === "" ? null : Number.isInteger(attNum) && attNum >= 1 && attNum <= 5 ? attNum : null;
  const seedNum = Number(meta.seed);
  const seed = Number.isInteger(seedNum) && seedNum >= 0 && seedNum < 2 ** 31 ? seedNum : null;
  const durNum = Number(meta.durationMs);
  const durationMs = Number.isFinite(durNum) && durNum > 0 && durNum < 30 * 86_400_000 ? Math.round(durNum) : null;
  const flags = qualityFlags({
    scoredValues: items.map((i) => responses[i.id]),
    attentionValue,
    durationMs,
  });
  return { ok: true, value: { items, responses, attentionValue, seed, durationMs, flags } };
}

/**
 * Insert an attempt (scored here, never in the browser) plus one row per item
 * answer. Returns the stored attempt, or a duplicate/unique error for locked phases.
 */
export async function recordAttempt(
  admin: SupabaseClient,
  opts: {
    userId: string;
    programmeId: ProgrammeId;
    phase: "pre" | "mid" | "post";
    parsed: ParsedAttempt;
    source: "live" | "claimed_device";
    createdAt?: string;
  },
) {
  const { items, responses, attentionValue, seed, durationMs, flags } = opts.parsed;
  const result = scoreAttempt(items, responses);
  const instrumentId = items[0]?.instrumentId ?? `super_cube_${opts.programmeId}_v1`;
  const att = attentionItem(opts.programmeId);
  const faceIds = constructs.map((c) => c.id);
  const order = seed != null ? itemOrder(items, faceIds, seed, att) : items.map((i) => i.id);
  const meta = {
    source: opts.source,
    seed,
    duration_ms: durationMs,
    attention: attentionValue,
    item_order: order,
  };
  const insert: Record<string, unknown> = {
    user_id: opts.userId,
    programme_id: opts.programmeId,
    instrument_id: instrumentId,
    phase: opts.phase,
    responses,
    construct_scores: result.constructScores,
    overall: result.overall,
    flags,
    meta,
  };
  if (opts.createdAt) insert.created_at = opts.createdAt;

  const { data, error } = await admin
    .from("lms_attempts")
    .insert(insert)
    .select("id, phase, programme_id, construct_scores, overall, responses, flags, created_at")
    .single();
  if (error || !data) return { ok: false as const, error: error?.message ?? "insert failed" };

  const pos = new Map(order.map((id, i) => [id, i + 1]));
  type ItemRow = {
    attempt_id: string; user_id: string; programme_id: string; instrument_id: string; phase: string;
    item_id: string; construct_id: string; value: number; position: number | null;
  };
  const rows: ItemRow[] = items.map((i) => ({
    attempt_id: data.id,
    user_id: opts.userId,
    programme_id: opts.programmeId,
    instrument_id: instrumentId,
    phase: opts.phase,
    item_id: i.id,
    construct_id: i.constructId,
    value: responses[i.id],
    position: pos.get(i.id) ?? null,
  }));
  if (attentionValue != null) {
    rows.push({
      attempt_id: data.id,
      user_id: opts.userId,
      programme_id: opts.programmeId,
      instrument_id: instrumentId,
      phase: opts.phase,
      item_id: att.id,
      construct_id: "attention",
      value: attentionValue,
      position: pos.get(att.id) ?? null,
    });
  }
  const { error: itemErr } = await admin.from("lms_item_responses").insert(rows);
  if (itemErr) console.error("[lms] item responses insert failed", itemErr.message);

  return {
    ok: true as const,
    attempt: {
      id: data.id as string,
      phase: data.phase as "pre" | "mid" | "post",
      programmeId: data.programme_id as ProgrammeId,
      overall: Number(data.overall),
      constructScores: data.construct_scores,
      responses: data.responses as Record<string, number>,
      flags: (data.flags ?? []) as string[],
      completedAt: data.created_at as string,
    },
  };
}
