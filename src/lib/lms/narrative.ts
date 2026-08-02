import { constructs, type ConstructId } from "@/lib/content";
import type { AttemptResult, ConstructScore } from "@/lib/lms/scoring";

export interface FaceNarrative {
  constructId: ConstructId;
  name: string;
  color: string;
  score: number;
  band: "stretch" | "developing" | "strong";
  headline: string;
  insight: string;
  firstPractice: string;
}

export interface AssessmentNarrative {
  overall: number;
  overallHeadline: string;
  overallBody: string;
  faces: FaceNarrative[];
  weakestIds: ConstructId[];
  strongestIds: ConstructId[];
  weekFocus: string;
}

function band(score: number): FaceNarrative["band"] {
  if (score < 45) return "stretch";
  if (score < 70) return "developing";
  return "strong";
}

const faceCopy: Record<
  ConstructId,
  { stretch: string; developing: string; strong: string; practice: string }
> = {
  choices: {
    stretch:
      "Decisions under ambiguity still cost you energy—you may over-deliberate or under-weigh moral risk.",
    developing:
      "You can decide, but complex trade-offs still need a clearer personal decision protocol.",
    strong:
      "You already hold a workable decision craft—keep pressure-testing moral and strategic edges.",
    practice:
      "Today: write the one decision you are avoiding. List three options, one value constraint, and a 48-hour next step.",
  },
  principles: {
    stretch:
      "Principles may feel abstract when urgency hits—values can drift under social pressure.",
    developing:
      "You know what matters; the stretch is living it consistently when incentives pull the other way.",
    strong:
      "Your ethical spine shows—use it to coach others without moralising.",
    practice:
      "Name one non-negotiable principle for this week. Tell one peer. Live one micro-act that proves it.",
  },
  mental: {
    stretch:
      "Cognitive load or fixed framing may narrow how you see problems and people.",
    developing:
      "You learn well; expand how you hold multiple perspectives before concluding.",
    strong:
      "Mental agility is a strength—protect it with rest and deliberate reflection.",
    practice:
      "Reframe one stuck problem in three ways: personal, team, system. Note what changes.",
  },
  emotional: {
    stretch:
      "Emotional signal may be hard to read—in yourself or in the room—especially under stress.",
    developing:
      "You notice emotion; deepen regulation and the courage to name feelings at work.",
    strong:
      "Emotional intelligence is a leadership asset—use it to build psychological safety.",
    practice:
      "In your next hard conversation, name one feeling (yours or theirs) before solving.",
  },
  physical: {
    stretch:
      "Energy, presence, or stamina may undercut how others experience your leadership.",
    developing:
      "You show up; design routines that keep presence reliable under load.",
    strong:
      "Physical leadership presence is solid—guard recovery so it stays that way.",
    practice:
      "Block one non-negotiable recovery or movement ritual this week (even 15 minutes).",
  },
  spiritual: {
    stretch:
      "Purpose and meaning may feel thin—work can feel transactional without a deeper why.",
    developing:
      "You sense purpose; connect daily tasks more deliberately to contribution.",
    strong:
      "A clear sense of purpose grounds you—invite others into shared meaning.",
    practice:
      "Write one sentence: who benefits if I lead well this month? Read it before your hardest meeting.",
  },
};

function headlineFor(c: ConstructScore): string {
  const b = band(c.score);
  if (b === "stretch") return `${c.name}: priority growth face`;
  if (b === "developing") return `${c.name}: active development zone`;
  return `${c.name}: relative strength`;
}

/**
 * Human narrative from pre (or post) attempt—used after baseline and on report.
 */
export function buildAssessmentNarrative(
  result: AttemptResult
): AssessmentNarrative {
  const sorted = [...result.constructScores].sort((a, b) => a.score - b.score);
  const weakestIds = sorted.slice(0, 2).map((s) => s.constructId);
  const strongestIds = sorted
    .slice(-2)
    .reverse()
    .map((s) => s.constructId);

  const faces: FaceNarrative[] = result.constructScores.map((s) => {
    const b = band(s.score);
    const copy = faceCopy[s.constructId];
    return {
      constructId: s.constructId,
      name: s.name,
      color: s.color,
      score: s.score,
      band: b,
      headline: headlineFor(s),
      insight: copy[b],
      firstPractice: copy.practice,
    };
  });

  const weakNames = weakestIds
    .map((id) => constructs.find((c) => c.id === id)?.name)
    .filter(Boolean)
    .join(" & ");

  let overallHeadline = "A solid starting profile.";
  let overallBody =
    "Your baseline is the product. Practice will move the faces that matter most.";
  if (result.overall < 45) {
    overallHeadline = "A brave, honest baseline.";
    overallBody =
      "Lower starting scores are not a verdict—they are the map. Deliberate practice across the cube is designed exactly for this starting point.";
  } else if (result.overall >= 70) {
    overallHeadline = "A strong baseline—with room to refine.";
    overallBody =
      "Strengths are real; world-class growth still comes from deliberate stretch on your weaker faces, not more of what is already easy.";
  }

  return {
    overall: result.overall,
    overallHeadline,
    overallBody,
    faces: faces.sort((a, b) => a.score - b.score),
    weakestIds,
    strongestIds,
    weekFocus: `This week, prioritise ${weakNames || "your lowest faces"} with one session and one micro-practice each.`,
  };
}
