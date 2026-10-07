/**
 * Strengths-first narrative for the baseline feedback, the growth report and
 * the deep-dive (content v2). Every face opens with what is already working,
 * then names one growth edge and one next step. Bands describe a self-report
 * profile, never a diagnosis or a fixed trait.
 */
import { constructs, type ConstructId } from "@/lib/content";
import type { ProgrammeId } from "@/lib/programmes";
import { changeBand, type AttemptResult, type ConstructScore } from "@/lib/lms/scoring";

export type FaceBand = "emerging" | "developing" | "established" | "signature";

export const BAND_LABELS: Record<FaceBand, string> = {
  emerging: "Emerging strength",
  developing: "Developing strength",
  established: "Established strength",
  signature: "Signature strength",
};

export interface FaceNarrative {
  constructId: ConstructId;
  name: string;
  color: string;
  score: number;
  band: FaceBand;
  bandLabel: string;
  headline: string;
  /** What is already working (always first) */
  strength: string;
  /** The growth edge and how to work on it */
  nextStep: string;
  /** strength + next step, for older layouts */
  insight: string;
  firstPractice: string;
  /** Where to practise next */
  sessionHref: string;
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

export function bandFor(score: number): FaceBand {
  if (score >= 80) return "signature";
  if (score >= 60) return "established";
  if (score >= 40) return "developing";
  return "emerging";
}

type BandCopy = Record<FaceBand, string>;
type FaceCopy = { strength: BandCopy; next: BandCopy; practice: string; kidsStrength: BandCopy; kidsNext: BandCopy; kidsPractice: string };

const COPY: Record<ConstructId, FaceCopy> = {
  choices: {
    strength: {
      emerging: "You're willing to look honestly at how you decide, which is where better decisions start.",
      developing: "You already make sound everyday decisions and can explain your reasons.",
      established: "You decide with a clear process, weigh values and risks, and people can follow your reasoning.",
      signature: "Decisive, principled judgement is a defining strength: people likely turn to you when choices are hard.",
    },
    next: {
      emerging: "Next: use the Choices stack (clarify, values, judgement, risk) on one real decision this week.",
      developing: "Next: for bigger decisions, write three options and two criteria before you choose.",
      established: "Next: stretch into higher-stakes, less certain decisions, and invite challenge before you commit.",
      signature: "Next: coach others in how you decide, and watch for overconfidence on decisions outside your expertise.",
    },
    practice: "Write the one decision you're avoiding. List three options, one value that must be protected and a 48-hour next step.",
    kidsStrength: {
      emerging: "You're learning to stop and think before you choose. Great start!",
      developing: "You often make good choices and can say why.",
      established: "You make kind, fair choices most of the time.",
      signature: "You're a really good chooser, and friends trust your ideas.",
    },
    kidsNext: {
      emerging: "Try: \"Stop, think, check, go\" before one choice each day.",
      developing: "Try: think of two choices before you pick one.",
      established: "Try: help a friend think through a choice.",
      signature: "Try: a brave new choice, like a new game or a new friend.",
    },
    kidsPractice: "Before one choice today, say \"Stop, think, check, go.\"",
  },
  principles: {
    strength: {
      emerging: "You care about doing the right thing; this is the foundation every principled leader builds on.",
      developing: "You know what you stand for and act on it in most situations.",
      established: "People experience you as fair, honest and reliable, and you read context before you act.",
      signature: "Integrity is a defining strength: you hold steady under pressure and make it safe for others to do the same.",
    },
    next: {
      emerging: "Next: name your top three values and check one decision against them each day.",
      developing: "Next: notice where pressure, targets or wanting to belong make your values bend, and plan for those moments.",
      established: "Next: strengthen the systems around you (clear owners, transparent decisions) so integrity doesn't rely on willpower.",
      signature: "Next: mentor others in principled leadership without moralising, and stay curious about contexts unlike your own.",
    },
    practice: "Name one non-negotiable principle for this week. Tell one colleague and do one small thing that proves it.",
    kidsStrength: {
      emerging: "You're learning what's honest and fair. Well done!",
      developing: "You're usually honest and fair with others.",
      established: "Friends know they can trust you to play fair and keep promises.",
      signature: "You're a super-trustworthy friend who always tries to do what's right.",
    },
    kidsNext: {
      emerging: "Try: make one small promise and keep it.",
      developing: "Try: tell the truth even when it's a little hard.",
      established: "Try: help make a game fair for everyone.",
      signature: "Try: help a younger child learn about fair play.",
    },
    kidsPractice: "Make one small promise today and keep it.",
  },
  mental: {
    strength: {
      emerging: "You're open to new ways of thinking, which is the starting point for sharper strategy and problem-solving.",
      developing: "You learn well and can work through problems when you have time to think.",
      established: "You think strategically, solve problems at the root and apply what you learn.",
      signature: "Clear, strategic thinking is a defining strength: you connect the big picture to the next step.",
    },
    next: {
      emerging: "Next: after reading or a meeting, write three takeaways from memory. It's a simple habit that makes learning stick.",
      developing: "Next: on one recurring problem, ask \"why?\" five times before you fix it.",
      established: "Next: decide what you'll stop doing to make room for your top priority, and share the vision in one sentence.",
      signature: "Next: protect deep-thinking time, and test your strategy with people who see the world differently.",
    },
    practice: "Reframe one stuck problem three ways (personal, team, system) and note what changes.",
    kidsStrength: {
      emerging: "You're curious, and that's how every great thinker starts!",
      developing: "You like solving puzzles and learning new things.",
      established: "You're a great thinker who keeps trying new ideas.",
      signature: "You're a brilliant, curious thinker with big ideas.",
    },
    kidsNext: {
      emerging: "Try: ask three \"why?\" questions today.",
      developing: "Try: when something is tricky, try a different way.",
      established: "Try: teach someone at home something you learned.",
      signature: "Try: draw your big idea and take one small step.",
    },
    kidsPractice: "Ask three \"why?\" questions today and find one answer.",
  },
  emotional: {
    strength: {
      emerging: "You're paying attention to emotions, in yourself and others, which is the first step of emotional intelligence.",
      developing: "You notice how people feel and you care about relationships.",
      established: "You read the room, manage your reactions and build trust through empathy.",
      signature: "Emotional intelligence is a defining strength: people feel understood and motivated around you.",
    },
    next: {
      emerging: "Next: name your feeling in one precise word, three times a day, for a week.",
      developing: "Next: in your next hard conversation, name a feeling (yours or theirs) before solving.",
      established: "Next: use your empathy to lift others: tell one person specifically what you believe they can do.",
      signature: "Next: build psychological safety in your team, and make sure you also look after your own emotional load.",
    },
    practice: "In your next difficult conversation, name one feeling before moving to solutions.",
    kidsStrength: {
      emerging: "You're learning to name your feelings. That's brave and clever!",
      developing: "You're kind and you notice how friends feel.",
      established: "You're a caring friend who can calm down when things are hard.",
      signature: "You're a super-kind friend who helps others feel happy and safe.",
    },
    kidsNext: {
      emerging: "Try: say \"I feel…\" when you have a big feeling.",
      developing: "Try: balloon breathing three times when you're upset.",
      established: "Try: ask a friend who looks sad, \"Are you OK?\"",
      signature: "Try: invite someone who is alone to play.",
    },
    kidsPractice: "Tell someone at home one feeling you had today and why.",
  },
  physical: {
    strength: {
      emerging: "You're thinking about how your energy affects your day, which is where healthy habits begin.",
      developing: "You have some helpful habits around sleep, movement or recovery.",
      established: "You look after your energy and recover well, which supports your focus and mood.",
      signature: "Sustained energy is a defining strength: you model healthy rhythms for others.",
    },
    next: {
      emerging: "Next: pick one small habit (a regular bedtime, water at your desk, a short walk) and keep it for seven days. For any health concern, speak to a health professional.",
      developing: "Next: protect your basics in busy weeks and plan one recovery block after demanding periods.",
      established: "Next: build recovery into your team's rhythm as well as your own, such as walking meetings and real breaks.",
      signature: "Next: keep the habits that work, and watch for overdoing it. Rest is part of performance.",
    },
    practice: "Block one recovery or movement ritual this week, even 15 minutes. Check with a health professional before any big change.",
    kidsStrength: {
      emerging: "You're learning how to look after your body. Great!",
      developing: "You like moving and playing.",
      established: "You look after your body with play, rest and water.",
      signature: "You're full of energy and look after your body really well.",
    },
    kidsNext: {
      emerging: "Try: play an active game every day this week.",
      developing: "Try: go to bed on time every night this week.",
      established: "Try: a new way to move, like skipping or dancing.",
      signature: "Try: invite a friend to play an active game.",
    },
    kidsPractice: "Move your body for fun today: dance, skip or play outside with a grown-up's OK.",
  },
  spiritual: {
    strength: {
      emerging: "You're asking what matters most to you, and that question is the heart of this face.",
      developing: "You have a sense of what matters and sometimes connect it to your daily work.",
      established: "Your purpose and values guide your choices and help you through hard times.",
      signature: "A deep sense of purpose is a defining strength: you help others find meaning too.",
    },
    next: {
      emerging: "Next: write one sentence that starts \"I lead in order to…\" and read it each morning.",
      developing: "Next: find out how one piece of your work helped someone, and let that shape your week.",
      established: "Next: commit to one act of service beyond your role, and invite others into the purpose.",
      signature: "Next: make time for reflection so your purpose stays fresh, and help others discover theirs.",
    },
    practice: "Write one sentence: who benefits if I lead well this month? Read it before your hardest meeting.",
    kidsStrength: {
      emerging: "You're thinking about what matters to you. Lovely!",
      developing: "You know what's special to you and you like helping.",
      established: "You help others and feel hopeful about the world.",
      signature: "You're a caring helper who makes others feel they belong.",
    },
    kidsNext: {
      emerging: "Try: tell someone what matters most to you.",
      developing: "Try: do one helpful job at home without being asked.",
      established: "Try: invite someone new to join in.",
      signature: "Try: plan a kind surprise for someone.",
    },
    kidsPractice: "Do one kind thing for someone today without being asked.",
  },
};

const HEADLINE_SUFFIX: Record<FaceBand, string> = {
  emerging: "an emerging strength to grow",
  developing: "a developing strength",
  established: "an established strength",
  signature: "a signature strength",
};

function faceFor(s: ConstructScore, p: ProgrammeId): FaceNarrative {
  const b = bandFor(s.score);
  const c = COPY[s.constructId];
  const kids = p === "kids";
  const strength = (kids ? c.kidsStrength : c.strength)[b];
  const nextStep = (kids ? c.kidsNext : c.next)[b];
  return {
    constructId: s.constructId,
    name: s.name,
    color: s.color,
    score: s.score,
    band: b,
    bandLabel: BAND_LABELS[b],
    headline: `${s.name}: ${HEADLINE_SUFFIX[b]}`,
    strength,
    nextStep,
    insight: `${strength} ${nextStep}`,
    firstPractice: kids ? c.kidsPractice : c.practice,
    sessionHref: `/learn/courses/${s.constructId}`,
  };
}

/** Narrative from a pre (or post) attempt: baseline feedback, report and deep-dive. */
export function buildAssessmentNarrative(result: AttemptResult, programmeId: ProgrammeId = "adults"): AssessmentNarrative {
  const sorted = [...result.constructScores].sort((a, b) => a.score - b.score);
  const weakestIds = sorted.slice(0, 2).map((s) => s.constructId);
  const strongestIds = sorted.slice(-2).reverse().map((s) => s.constructId);
  const nameOf = (id: ConstructId) => constructs.find((c) => c.id === id)?.name;
  const strongNames = strongestIds.map(nameOf).filter(Boolean).join(" and ");
  const growNames = weakestIds.map(nameOf).filter(Boolean).join(" and ");
  const kids = programmeId === "kids";

  let overallHeadline = "A solid profile to build on.";
  let overallBody = `Your strongest faces right now are ${strongNames}. Lead with them while you grow the others: this is a starting map, not a verdict.`;
  if (result.overall < 40) {
    overallHeadline = "An honest starting map.";
    overallBody = `Your relative strengths are ${strongNames}. Lower starting scores aren't a judgement; they show where practice can help most, and the sessions are built for exactly this starting point.`;
  } else if (result.overall >= 75) {
    overallHeadline = "A strong profile, with room to refine.";
    overallBody = `${strongNames} stand out as signature or established strengths. The next level of growth comes from deliberate stretch on the faces that feel less natural.`;
  }
  if (kids) {
    overallHeadline = "Look at all your strengths!";
    overallBody = `You're especially good at ${strongNames}. Now let's have fun growing the other faces too.`;
  }

  // Strengths first: strongest face first in the list.
  const faces = result.constructScores.map((s) => faceFor(s, programmeId)).sort((a, b) => b.score - a.score);

  return {
    overall: result.overall,
    overallHeadline,
    overallBody,
    faces,
    weakestIds,
    strongestIds,
    weekFocus: kids
      ? `This week: keep using ${strongNames}, and try one session on ${growNames}.`
      : `This week: lead with ${strongNames}, and give ${growNames || "your growth faces"} one session and one micro-practice each.`,
  };
}

/** Strengths-first, noise-aware wording for one face's change from pre to post. */
export function faceGrowthLine(name: string, pre: number, post: number): string {
  const delta = Math.round((post - pre) * 10) / 10;
  const band = changeBand(delta, "face");
  const signed = `${delta > 0 ? "+" : ""}${delta}`;
  switch (band?.id) {
    case "real_growth":
      return `${name} grew ${signed} points, more than normal measurement noise. Name what you did differently so you can keep doing it.`;
    case "possible_growth":
      return `${name} rose ${signed} points. That may be real growth; keep practising to confirm it.`;
    case "within_noise":
      return post >= 60
        ? `${name} held steady at a strong level (${signed}). Keep using it, and pick one stretch practice to take it further.`
        : `${name} held steady (${signed}). This is a good face for your next 21 days of practice.`;
    case "possible_decline":
      return `${name} dipped ${signed} points, which may be noise or a tougher few weeks. Treat it as useful data, not a verdict.`;
    default:
      return `${name} fell ${signed} points. Greater self-awareness after a programme can sometimes lower self-ratings (known as response shift); talk it through with a coach or mentor and choose one practice.`;
  }
}
