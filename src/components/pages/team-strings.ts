import { constructs, type ConstructId } from "@/lib/content";

/** The page's English strings; translated pages pass them through the catalogue (teamStrings). */
export const TEAM_STRINGS = {
  eyebrow: "Teams & networks",
  title: "Team Super-Cube®",
  description:
    "Enter cohort mean scores (from consented export) to light a shared cube. Illustrates network-level impact—not individual ranking.",
  coachExport: "Coach export",
  impactStory: "Impact story",
  meanTitle: "Mean scores by face",
  meanDescription: "Overall mean · {overall}/100 · adjust sliders from your CSV averages.",
  meanScoreLabel: "{face} mean score",
  note: "Weak faces appear dimmer; stronger faces glow. Use for board updates and school reports—never to shame individuals.",
  faces: Object.fromEntries(constructs.map((c) => [c.id, c.name])) as Record<ConstructId, string>,
};
export type TeamStrings = typeof TEAM_STRINGS;

/** English page metadata (title and description are translated per language by localePageMeta). */
export const TEAM_META = {
  title: "Team cube: cohort leadership view",
  description:
    "Light a shared Super-Cube® from consented cohort mean scores to show team and network leadership capacity, never individual rankings.",
  path: "/team",
};
