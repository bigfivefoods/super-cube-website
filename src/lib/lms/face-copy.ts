/**
 * Age-appropriate face copy for the learner app: the one-line summary, the longer
 * description, the skill chips and the practice-lab checklist on course pages.
 *
 * Adults keep the existing site and course copy. Kids (reading level about grade 3–4)
 * and Adolescents (about grade 7–8) reuse wording from the Super-Cube® session copy in
 * src/lib/lms/sessions/* (hooks, core ideas, practices and if–then plans) and the
 * practice-lab challenges. No new claims and no statistics.
 */
import { constructs, type ConstructId } from "@/lib/content";
import { COURSE_COPY } from "@/lib/lms/course-content";
import { skillsForProgramme, type ProgrammeId } from "@/lib/programmes";

export type FaceCopy = {
  /** One line under the tagline (course list and course header) */
  summary: string;
  /** Short paragraph on the course header */
  description: string;
  /** Practice-lab success checklist */
  checklist: string[];
};

export const KIDS_FACE_COPY: Record<ConstructId, FaceCopy> = {
  choices: {
    summary: "Choices are like little steering wheels for your day.",
    description:
      "Every day you choose things: what to play, what to say, whether to share. For a big choice, stop and take a breath. Think about what could happen. Check: is it kind, fair and true? Then go, and be brave.",
    checklist: [
      "I said \"Stop, think, check, go\" before a choice.",
      "I said my reason out loud.",
      "I thought before choosing three times.",
      "I drew or wrote what I wanted, what I chose and why.",
    ],
  },
  principles: {
    summary: "When you live by good principles, people know they can trust you.",
    description:
      "Principles are the rules you live by, like being honest, being fair and keeping promises. Think of someone you trust. What do they do that makes you feel safe with them?",
    checklist: [
      "I kept a promise.",
      "I told the truth, even when it was hard.",
      "I helped make a game fair for everyone.",
      "I was honest, kind and clear about rules.",
    ],
  },
  mental: {
    summary: "Your brain is like a muscle. The more you use it, the stronger it grows!",
    description:
      "Mental is about your thinking brain: being curious, solving puzzles, dreaming big and learning new things. Mistakes help your brain grow. Every time you try something hard, you get a little smarter.",
    checklist: [
      "I found one problem.",
      "I broke it into pieces.",
      "I tried a fix. If it didn't work, I tried another way.",
      "I shared what I learned.",
    ],
  },
  emotional: {
    summary: "All feelings are OK. What matters is what we do with them.",
    description:
      "Happy, sad, cross, scared, excited: everybody has lots of feelings. Notice the feeling in your body. Name it: \"I feel…\" Then choose a kind way to handle it.",
    checklist: [
      "I named a feeling: \"I feel…\"",
      "I helped one person every day.",
      "I stayed calm in one hard moment.",
      "I did balloon breathing.",
    ],
  },
  physical: {
    summary: "Your body is amazing! It helps you run, play, think and learn.",
    description:
      "Your body needs moving and playing, sleep and rest, water and healthy food. Ask a grown-up to help when you feel sick or hurt.",
    checklist: [
      "I went to bed on time.",
      "I played or moved my body.",
      "I drank water.",
      "I took calm breaths.",
    ],
  },
  spiritual: {
    summary: "Every family has its own beliefs and traditions. They're all welcome here.",
    description:
      "What makes you feel happy deep inside, like when you look at the stars or help a friend? Think about someone who loves you, and someone you can help.",
    checklist: [
      "I helped others.",
      "I kept a promise.",
      "I found one thing that made me say \"Wow!\"",
      "I told someone what matters to me.",
    ],
  },
};

export const ADOLESCENT_FACE_COPY: Record<ConstructId, FaceCopy> = {
  choices: {
    summary: "You make many choices every day. A few of them shape who you become.",
    description:
      "Choices is about how you decide when things are unclear. Before a big choice, run four steps. Clarify: what is the real decision? Values: what must not be traded away? Judgement: what do the facts and other people tell you? Risk: what is the smartest step forward?",
    checklist: [
      "I used values, judgement and smart risk for three real choices.",
      "I ran the four steps before a choice.",
      "I listed my options before deciding.",
      "I checked where a post came from before I shared it.",
      "I logged each choice in 5 lines.",
    ],
  },
  principles: {
    summary: "The people we trust most are the same when nobody is watching.",
    description:
      "Principles are about acting on clear standards, like honesty, fairness, kindness and self-control. A useful question for any situation: what would a fair, honest person do here?",
    checklist: [
      "I wrote my \"I will always…\" statements.",
      "I acted with integrity online and in group chats.",
      "I said \"Not for me\" to a shortcut that isn't honest.",
      "I thought of three responses before I reacted to something unfair.",
      "When something went wrong, I started with \"My part in this was…\"",
    ],
  },
  mental: {
    summary: "Life tests how you think: how you plan, solve problems and picture your future.",
    description:
      "Thinking skills grow with the right kind of practice. Test yourself instead of re-reading. Start with the big picture, then plan the next step. Use what you learn on a real problem.",
    checklist: [
      "I chose one goal and built a 14-day plan.",
      "I did one step every day.",
      "I reviewed my plan twice.",
      "I tested myself instead of re-reading.",
      "I wrote five possible solutions before choosing one.",
    ],
  },
  emotional: {
    summary: "Knowing what you feel, and what to do with it, is a skill you can build.",
    description:
      "Feelings aren't a weakness. When you feel a strong emotion, notice it, name it, then choose your move. A precise word, like \"frustrated\" instead of just \"bad\", helps you choose a response instead of reacting.",
    checklist: [
      "I named my feeling in one word each day (not \"fine\").",
      "I said \"That sounds hard\" before giving advice.",
      "I made one repair.",
      "I sent one motivating message to a teammate.",
    ],
  },
  physical: {
    summary: "Sleep, movement, food and downtime are the battery that powers everything else.",
    description:
      "Your body is part of your leadership. Sleep, movement, food and recovery affect your focus, mood and patience. Start small: one habit at a time beats a big plan that lasts a week.",
    checklist: [
      "I hit my sleep target.",
      "I kept a movement streak.",
      "I drank water and planned proper meals.",
      "I used one recovery activity after stress.",
    ],
  },
  spiritual: {
    summary: "What do you stand for, and where do you belong?",
    description:
      "This face is for everyone. For some people it is a religious faith. For others it lives in values, culture, family, community or nature. It helps you connect what you do with what matters most to you.",
    checklist: [
      "I wrote down three things that matter most to me.",
      "I did one helpful thing for someone.",
      "I invited someone who was left out.",
      "I chose one thing that fits who I want to be.",
    ],
  },
};

function youthCopy(constructId: ConstructId, programmeId: ProgrammeId): FaceCopy | null {
  if (programmeId === "kids") return KIDS_FACE_COPY[constructId];
  if (programmeId === "adolescents") return ADOLESCENT_FACE_COPY[constructId];
  return null;
}

/** One-line face summary (course list and course header). Adults: course promise. */
export function faceSummary(constructId: ConstructId, programmeId: ProgrammeId): string {
  return youthCopy(constructId, programmeId)?.summary ?? COURSE_COPY[constructId].promise;
}

/** Longer face description on the course header. Adults: site description. */
export function faceDescription(constructId: ConstructId, programmeId: ProgrammeId): string {
  return (
    youthCopy(constructId, programmeId)?.description ??
    constructs.find((c) => c.id === constructId)?.description ??
    ""
  );
}

/** Practice-lab success checklist. Adults: existing course checklist. */
export function faceChecklist(constructId: ConstructId, programmeId: ProgrammeId): string[] {
  return youthCopy(constructId, programmeId)?.checklist ?? COURSE_COPY[constructId].practiceLab.checklist;
}

/** Skill chips on the course header: the programme's own skill names. */
export function faceSkills(constructId: ConstructId, programmeId: ProgrammeId): string[] {
  return skillsForProgramme(programmeId, constructId);
}
