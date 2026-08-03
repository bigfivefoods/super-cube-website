/**
 * Optional manager / peer 5-item observation pulse (post-programme).
 * Developmental, not HR grading.
 */

export const peerPulseItems = [
  {
    id: "listen",
    prompt: "Listens fully before proposing solutions.",
  },
  {
    id: "decide",
    prompt: "Makes clear decisions under ambiguity.",
  },
  {
    id: "principle",
    prompt: "Acts consistently with stated principles under pressure.",
  },
  {
    id: "emotion",
    prompt: "Names and regulates emotion helpfully in hard moments.",
  },
  {
    id: "purpose",
    prompt: "Connects daily work to a purpose beyond self.",
  },
] as const;

export type PeerPulseResponses = Record<string, number>; // 1–5

export function scorePeerPulse(responses: PeerPulseResponses) {
  const vals = peerPulseItems
    .map((i) => responses[i.id])
    .filter((v): v is number => typeof v === "number" && v >= 1 && v <= 5);
  if (!vals.length) return null;
  const mean = vals.reduce((a, b) => a + b, 0) / vals.length;
  return Math.round(((mean - 1) / 4) * 1000) / 10; // 0–100
}
