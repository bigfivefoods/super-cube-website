import type { ConstructId } from "@/lib/content";
import type { ProgrammeId } from "@/lib/programmes";

/** Capstone: one realistic case that needs all six faces at once. */
export type Capstone = {
  title: string;
  scenario: string;
  prompts: Record<ConstructId, string>;
  planIntro: string;
};

export const CAPSTONE: Record<ProgrammeId, Capstone> = {
  adults: {
    title: "The hard quarter",
    scenario:
      "Your organisation has to reduce costs this year and your team of twelve will be affected. Rumours are spreading. Two of your strongest people have offers elsewhere. A long-standing client wants a decision on a major project by Friday. And you've been sleeping badly for weeks. You have a meeting with your team on Monday morning.",
    prompts: {
      choices: "What is the real decision in front of you? List three options and the criteria you'll use. What's the smallest bold step?",
      principles: "Which values must not be traded away? What do you owe your team in honesty and fairness, and what governance or process applies?",
      mental: "What's the strategic picture beyond this quarter? What will you stop doing, and what problem sits underneath the symptoms?",
      emotional: "How are people likely to be feeling? What will you say first on Monday, and how will you listen? Who needs a one-on-one?",
      physical: "How will you protect your sleep, energy and judgement over the next month? What's your pressure-week plan?",
      spiritual: "What purpose does your team serve that's worth protecting? How will you lead so you're proud of it in five years?",
    },
    planIntro: "Turn your answers into one if–then plan per face for the next month.",
  },
  adolescents: {
    title: "The big project",
    scenario:
      "You've been chosen to lead your school's fundraising drive for a local children's home. Your team of six is split on what to do. Exams are six weeks away. A friend in the group has posted something unkind about another member, and that member wants to quit. A teacher needs your plan by Friday.",
    prompts: {
      choices: "What's the real decision? Write three options and what matters most when choosing.",
      principles: "What's the fair and honest way to handle the unkind post? Who needs to be accountable for what?",
      mental: "What's your plan from now until the event? What will you not do, so the team isn't overloaded before exams?",
      emotional: "How might each person be feeling? What will you say to the member who wants to quit, and to your friend?",
      physical: "How will you look after your sleep, energy and study time during these six weeks?",
      spiritual: "Why does this project matter to you and to the children it helps? How will you remind the team of that?",
    },
    planIntro: "Write one if–then plan for each face to help you lead this project well.",
  },
  kids: {
    title: "Kindness day",
    scenario:
      "Your class is planning a kindness day for the whole school. Some friends want to bake, some want to make cards and some want to clean the playground. One friend feels left out. You feel a bit nervous about talking in front of everyone. The teacher asks you to help the class decide.",
    prompts: {
      choices: "What are the choices? How can the class pick in a fair way?",
      principles: "How can you make sure everyone gets a fair turn and nobody is left out?",
      mental: "What is your big idea for the day? What is the first small step?",
      emotional: "How might your friend who feels left out be feeling? What could you say to them? What helps you feel calm before talking?",
      physical: "How will you make sure you have energy on the big day? (Think about sleep, water and food.)",
      spiritual: "Why does kindness matter to you? Who will feel happy because of kindness day?",
    },
    planIntro: "With your grown-up, write one plan for each face: If…, then I will…",
  },
};
