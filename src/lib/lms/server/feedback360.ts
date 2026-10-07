import { createHash, randomBytes } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { instrumentIdFor, observerItems } from "@/lib/lms/instruments";
import {
  averageObserverScores,
  MAX_RATERS_PER_REQUEST,
  MIN_RATERS_TO_SHOW,
  type FaceObserverScore,
  type RaterRelationship,
} from "@/lib/lms/feedback360";
import type { ProgrammeId } from "@/lib/programmes";

export function hashToken(token: string): string {
  return createHash("sha256").update(`sc360:${token}`).digest("hex");
}

const RELS: RaterRelationship[] = ["manager", "peer", "direct_report", "other"];

export function parseRaters(raw: unknown): { relationship: RaterRelationship; label: string | null }[] | null {
  if (!Array.isArray(raw) || raw.length === 0 || raw.length > MAX_RATERS_PER_REQUEST) return null;
  const out: { relationship: RaterRelationship; label: string | null }[] = [];
  for (const r of raw) {
    const rel = String((r as { relationship?: unknown })?.relationship ?? "") as RaterRelationship;
    if (!RELS.includes(rel)) return null;
    const label = String((r as { label?: unknown })?.label ?? "")
      .replace(/[\u0000-\u001f<>]/g, "")
      .trim()
      .slice(0, 40);
    out.push({ relationship: rel, label: label || null });
  }
  return out;
}

/** Create a request with one single-use link per rater. Raw tokens are returned once and never stored. */
export async function createFeedbackRequest(
  admin: SupabaseClient,
  userId: string,
  programmeId: ProgrammeId,
  raters: { relationship: RaterRelationship; label: string | null }[],
) {
  const { data: req, error } = await admin
    .from("feedback_requests")
    .insert({
      user_id: userId,
      programme_id: programmeId,
      phase: "pre",
      instrument_id: instrumentIdFor(programmeId, "v2").replace("_v2", "_v2obs"),
      min_raters_to_show: MIN_RATERS_TO_SHOW,
      closes_at: new Date(Date.now() + 30 * 86_400_000).toISOString(),
    })
    .select("id, created_at, closes_at")
    .single();
  if (error || !req) return { ok: false as const, error: error?.message ?? "insert failed" };
  const links: { relationship: RaterRelationship; label: string | null; token: string }[] = [];
  const rows = raters.map((r) => {
    const token = randomBytes(24).toString("base64url");
    links.push({ ...r, token });
    return { request_id: req.id, relationship: r.relationship, invited_label: r.label, token_hash: hashToken(token) };
  });
  const { error: rErr } = await admin.from("feedback_raters").insert(rows);
  if (rErr) return { ok: false as const, error: rErr.message };
  return { ok: true as const, request: req, links };
}

export type GroupSummary = {
  key: RaterRelationship | "all";
  invited: number;
  completed: number;
  shown: boolean;
  scores: FaceObserverScore[] | null;
};

/** The learner's requests with anonymity-safe aggregates only. */
export async function loadFeedbackSummary(admin: SupabaseClient, userId: string) {
  const { data: reqs } = await admin
    .from("feedback_requests")
    .select("id, programme_id, created_at, closes_at, min_raters_to_show")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(5);
  const out = [];
  for (const r of reqs ?? []) {
    const { data: raters } = await admin
      .from("feedback_raters")
      .select("id, relationship, completed_at")
      .eq("request_id", r.id);
    const list = raters ?? [];
    const done = list.filter((x) => x.completed_at);
    const { data: resp } = done.length
      ? await admin.from("feedback_responses").select("rater_id, construct_scores").in("rater_id", done.map((d) => d.id))
      : { data: [] as { rater_id: string; construct_scores: FaceObserverScore[] }[] };
    const byRater = new Map((resp ?? []).map((x) => [x.rater_id as string, x.construct_scores as FaceObserverScore[]]));
    const min = Number(r.min_raters_to_show) || MIN_RATERS_TO_SHOW;
    const group = (key: GroupSummary["key"]): GroupSummary => {
      const inv = key === "all" ? list : list.filter((x) => x.relationship === key);
      const comp = inv.filter((x) => x.completed_at);
      const shown = comp.length >= min;
      return {
        key,
        invited: inv.length,
        completed: comp.length,
        shown,
        scores: shown ? averageObserverScores(comp.map((c) => byRater.get(c.id)).filter(Boolean) as FaceObserverScore[][], min) : null,
      };
    };
    out.push({
      id: r.id as string,
      programmeId: r.programme_id as string,
      createdAt: r.created_at as string,
      closesAt: r.closes_at as string | null,
      groups: [group("all"), group("peer"), group("direct_report"), group("manager"), group("other")],
    });
  }
  return out;
}

/** Look up a rater link. Returns null when unknown, used, or closed. */
export async function findRater(admin: SupabaseClient, token: string) {
  if (!/^[A-Za-z0-9_-]{20,80}$/.test(token)) return null;
  const { data: rater } = await admin
    .from("feedback_raters")
    .select("id, request_id, relationship, completed_at")
    .eq("token_hash", hashToken(token))
    .maybeSingle();
  if (!rater) return null;
  const { data: req } = await admin
    .from("feedback_requests")
    .select("id, user_id, programme_id, closes_at")
    .eq("id", rater.request_id)
    .maybeSingle();
  if (!req) return null;
  const closed = req.closes_at ? Date.parse(req.closes_at) < Date.now() : false;
  const { data: profile } = await admin.from("profiles").select("full_name").eq("id", req.user_id).maybeSingle();
  const firstName = String(profile?.full_name ?? "").trim().split(/\s+/)[0]?.slice(0, 30) || "";
  const programmeId = req.programme_id as ProgrammeId;
  return {
    raterId: rater.id as string,
    relationship: rater.relationship as RaterRelationship,
    completed: Boolean(rater.completed_at),
    closed,
    programmeId,
    firstName,
    items: observerItems(programmeId, firstName || "this person"),
  };
}
