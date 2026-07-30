/**
 * Pre-pre orientation: philosophy → theory → model.
 * Establishes the learner’s current leadership knowledge frame
 * before the Super-Cube® construct pre-assessment.
 */

export type LeadershipLevel = "philosophy" | "theory" | "model" | "none";

export type YesSomeNo = "yes" | "some" | "no";
export type YesEmergingNo = "yes" | "emerging" | "no";

export interface OrientationResponses {
  /** Do you know anything about leadership models? */
  knowsModels: YesSomeNo | "";
  /** Do you currently use leadership models in practice? */
  usesModels: YesSomeNo | "";
  /** Self-report: which layer do you mainly operate from? */
  primaryPerspective: LeadershipLevel | "";
  /** Do you have a personal leadership philosophy? */
  hasPhilosophy: YesEmergingNo | "";
  /** Do you draw on leadership theories? */
  hasTheory: YesEmergingNo | "";
  /** Do you use concrete leadership models? */
  hasModel: YesEmergingNo | "";
  /** Optional examples the learner can name */
  knownExamples: string;
}

export interface OrientationResult {
  primaryPerspective: LeadershipLevel;
  label: string;
  summary: string;
  guidance: string;
  knowsModels: YesSomeNo;
  usesModels: YesSomeNo;
  depth: {
    philosophy: YesEmergingNo;
    theory: YesEmergingNo;
    model: YesEmergingNo;
  };
  knownExamples: string;
}

export const ORIENTATION_EMPTY: OrientationResponses = {
  knowsModels: "",
  usesModels: "",
  primaryPerspective: "",
  hasPhilosophy: "",
  hasTheory: "",
  hasModel: "",
  knownExamples: "",
};

/** Teaching content shown before / during the orientation */
export const LEVEL_LADDER = [
  {
    id: "philosophy" as const,
    tier: "High level",
    title: "Leadership philosophy",
    short: "High-level concepts",
    description:
      "Your worldview about leadership—what leaders exist for, what good leadership means, and the values that guide you. Philosophy is broad and conceptual, not a checklist.",
    examples: "e.g. servant leadership as a way of being; Ubuntu; “leaders create leaders”",
  },
  {
    id: "theory" as const,
    tier: "Middle level",
    title: "Leadership theory",
    short: "Middle-level theories",
    description:
      "Structured explanations of how and why leadership works. Theory sits between big ideas and day-to-day tools—it organises research and experience into testable ideas.",
    examples: "e.g. transformational theory; situational theory; social identity theory of leadership",
  },
  {
    id: "model" as const,
    tier: "Applied level",
    title: "Leadership model",
    short: "Concrete, absolute models",
    description:
      "A practical, often named framework you can apply—steps, faces, stages, or dimensions. Models are more absolute and operational: they turn philosophy and theory into something you can assess and practise.",
    examples: "e.g. Super-Cube® six constructs; GROW coaching model; situational leadership grid",
  },
] as const;

export const LEVEL_RELATIONSHIP =
  "A leadership model is built on leadership theory, and theory is grounded in leadership philosophy. Philosophy (high-level concepts) → theory (middle-level explanations) → models (concrete, absolute frameworks you can use).";

const LABELS: Record<LeadershipLevel, string> = {
  philosophy: "Philosophy perspective",
  theory: "Theory perspective",
  model: "Model perspective",
  none: "Emerging / not yet framed",
};

const SUMMARIES: Record<LeadershipLevel, string> = {
  philosophy:
    "You mainly approach leadership through high-level concepts and values—your philosophy of what leadership is for.",
  theory:
    "You mainly approach leadership through middle-level theories that explain how and why leadership works.",
  model:
    "You mainly approach leadership through concrete models—named frameworks with clear parts you can apply and assess.",
  none:
    "You are early in naming a philosophy, theory, or model. That is a strong starting point for Super-Cube® development.",
};

const GUIDANCE: Record<LeadershipLevel, string> = {
  philosophy:
    "Next we will give you a structured model (Super-Cube®) so your values can sit on a clear, measurable frame—without losing the philosophy that guides you.",
  theory:
    "Next we will connect the theories you already use to an absolute developmental model (Super-Cube®) so explanation becomes deliberate practice.",
  model:
    "Next we will baseline your skills on the Super-Cube® model—six constructs—so you can compare models and deepen practice with evidence.",
  none:
    "Next we will introduce Super-Cube® as a concrete leadership model, then baseline your six constructs so philosophy and theory can grow with practice.",
};

function pickPrimary(responses: OrientationResponses): LeadershipLevel {
  if (
    responses.primaryPerspective === "philosophy" ||
    responses.primaryPerspective === "theory" ||
    responses.primaryPerspective === "model" ||
    responses.primaryPerspective === "none"
  ) {
    return responses.primaryPerspective;
  }

  // Fallback from depth answers if self-select missing
  const rank = (v: YesEmergingNo | "") =>
    v === "yes" ? 2 : v === "emerging" ? 1 : 0;
  const scores = {
    model: rank(responses.hasModel),
    theory: rank(responses.hasTheory),
    philosophy: rank(responses.hasPhilosophy),
  };
  const best = (Object.entries(scores) as [Exclude<LeadershipLevel, "none">, number][])
    .sort((a, b) => b[1] - a[1])[0];
  if (!best || best[1] === 0) return "none";
  return best[0];
}

export function scoreOrientation(
  responses: OrientationResponses
): OrientationResult {
  const primaryPerspective = pickPrimary(responses);
  const knowsModels = (responses.knowsModels || "no") as YesSomeNo;
  const usesModels = (responses.usesModels || "no") as YesSomeNo;

  return {
    primaryPerspective,
    label: LABELS[primaryPerspective],
    summary: SUMMARIES[primaryPerspective],
    guidance: GUIDANCE[primaryPerspective],
    knowsModels,
    usesModels,
    depth: {
      philosophy: (responses.hasPhilosophy || "no") as YesEmergingNo,
      theory: (responses.hasTheory || "no") as YesEmergingNo,
      model: (responses.hasModel || "no") as YesEmergingNo,
    },
    knownExamples: responses.knownExamples.trim(),
  };
}

export function isOrientationComplete(
  responses: OrientationResponses
): boolean {
  return Boolean(
    responses.knowsModels &&
      responses.usesModels &&
      responses.primaryPerspective &&
      responses.hasPhilosophy &&
      responses.hasTheory &&
      responses.hasModel
  );
}

export function depthLabel(v: YesEmergingNo): string {
  if (v === "yes") return "Clear";
  if (v === "emerging") return "Emerging";
  return "Not yet";
}
