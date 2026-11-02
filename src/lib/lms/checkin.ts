/**
 * Manager and peer check-ins. Raters score the same six Super-Cube® faces as
 * the self-report, on the same 1–5 agreement scale, mapped to 0–100.
 * No I/O here. Anonymity rules are repeated in org_checkin_comparison().
 */
import { constructs, type ConstructId } from "@/lib/content";
import { likertToScore } from "@/lib/lms/scoring";

export type CheckinRelationship = "manager" | "peer";

export const CHECKIN_RELATIONSHIPS: CheckinRelationship[] = ["manager", "peer"];

/** Peer ratings stay hidden until this many peers have answered. */
export const MIN_PEERS_TO_SHOW = 3;
export const MAX_MANAGERS = 3;
export const MAX_PEERS = 12;
export const CHECKIN_DAYS = 21;

export type FaceRating = { constructId: ConstructId; score: number };

export type RatedResponse = { relationship: CheckinRelationship; scores: FaceRating[] };

export type CheckinGroup = {
  completed: number;
  shown: boolean;
  scores: FaceRating[] | null;
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeEmail(raw: unknown): string | null {
  const email = String(raw ?? "").trim().toLowerCase();
  if (email.length < 6 || email.length > 120) return null;
  if (/[\u0000-\u001f\s]/.test(email)) return null;
  return EMAIL_RE.test(email) ? email : null;
}

export function parseInvites(
  raw: unknown,
): { email: string; relationship: CheckinRelationship }[] | null {
  if (!Array.isArray(raw) || raw.length === 0 || raw.length > MAX_MANAGERS + MAX_PEERS) return null;
  const out: { email: string; relationship: CheckinRelationship }[] = [];
  const seen = new Set<string>();
  for (const row of raw) {
    const relationship = String((row as { relationship?: unknown })?.relationship ?? "") as CheckinRelationship;
    if (!CHECKIN_RELATIONSHIPS.includes(relationship)) return null;
    const email = normalizeEmail((row as { email?: unknown })?.email);
    if (!email || seen.has(email)) return null;
    seen.add(email);
    out.push({ email, relationship });
  }
  return out;
}

/** Every face is 1–5. There is no "skip": a check-in is a full face rating. */
export function validateFaceResponses(
  raw: unknown,
): { ok: true; responses: Record<ConstructId, number> } | { ok: false; error: string } {
  const src = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const responses = {} as Record<ConstructId, number>;
  for (const c of constructs) {
    const v = Number(src[c.id]);
    if (!Number.isInteger(v) || v < 1 || v > 5) return { ok: false, error: "Please rate every face." };
    responses[c.id] = v;
  }
  return { ok: true, responses };
}

export function scoreFaces(responses: Record<string, number>): FaceRating[] {
  return constructs.map((c) => ({
    constructId: c.id,
    score: Math.round(likertToScore(responses[c.id] ?? 1) * 10) / 10,
  }));
}

function meanScores(rows: FaceRating[][]): FaceRating[] {
  return constructs.map((c) => {
    const vals = rows
      .map((r) => r.find((s) => s.constructId === c.id)?.score)
      .filter((v): v is number => typeof v === "number" && Number.isFinite(v));
    const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
    return { constructId: c.id, score: Math.round(mean * 10) / 10 };
  });
}

/**
 * Self vs others. Manager ratings show from the first manager. Peers show
 * from the third peer. Others is the mean of ratings that are safe to show.
 */
export function checkinComparison(rows: RatedResponse[]): {
  manager: CheckinGroup;
  peer: CheckinGroup;
  others: CheckinGroup;
} {
  const managers = rows.filter((r) => r.relationship === "manager");
  const peers = rows.filter((r) => r.relationship === "peer");
  const managerShown = managers.length >= 1;
  const peerShown = peers.length >= MIN_PEERS_TO_SHOW;
  const included = rows.filter(
    (r) => (r.relationship === "peer" && peerShown) || (r.relationship === "manager" && (peers.length === 0 || peerShown)),
  );
  return {
    manager: {
      completed: managers.length,
      shown: managerShown,
      scores: managerShown ? meanScores(managers.map((r) => r.scores)) : null,
    },
    peer: {
      completed: peers.length,
      shown: peerShown,
      scores: peerShown ? meanScores(peers.map((r) => r.scores)) : null,
    },
    others: {
      completed: included.length,
      shown: included.length > 0,
      scores: included.length ? meanScores(included.map((r) => r.scores)) : null,
    },
  };
}

export function gapLabel(gap: number | null): "others rate higher" | "you rate higher" | null {
  if (gap == null || Math.abs(gap) < 10) return null;
  return gap > 0 ? "others rate higher" : "you rate higher";
}
