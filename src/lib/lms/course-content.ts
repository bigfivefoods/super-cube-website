/**
 * Rich, practical Super-Cube® course content.
 * Philosophy → theory → model, made usable in sessions: Read · Engage · Apply.
 */

import type { ConstructId } from "@/lib/content";
import type { ProgrammeId } from "@/lib/programmes";

export type SessionBlock = "read" | "engage" | "apply";

export interface SessionSection {
  block: SessionBlock;
  title: string;
  /** Short markdown-friendly paragraphs and bullets */
  body: string;
}

export interface ConstructCourseCopy {
  /** Module-level promise */
  promise: string;
  /** One-line workplace / life relevance */
  relevance: string;
  /** Overview “read” narrative */
  overviewRead: string;
  /** Overview engage prompt */
  overviewEngage: string;
  /** Overview apply micro-goal */
  overviewApply: string;
  /** Per-skill deep content keyed by adult element name (fallback for kids/teens by index) */
  skills: {
    /** Adult element name for matching */
    key: string;
    insight: string;
    practiceTip: string;
    commonTrap: string;
    scenario: Record<ProgrammeId, string>;
    apply: Record<ProgrammeId, string>;
  }[];
  practiceLab: {
    challenge: Record<ProgrammeId, string>;
    checklist: string[];
  };
  quizPrompts: string[];
}

export const COURSE_COPY: Record<ConstructId, ConstructCourseCopy> = {
  choices: {
    promise:
      "Choose wisely under pressure—balance values, judgement, and calculated risk.",
    relevance:
      "Every leadership moment is a decision. This face trains how you decide, not only what you decide.",
    overviewRead: `## Decision-making is a skill, not a personality trait

Leadership Choices are how you select action amid ambiguity. Super-Cube® treats **decision-making intelligence**, **moral values**, **judgement**, and **risk-taking** as developable capabilities—not fixed traits.

### The Choices stack
1. **Clarify** the real decision (what is actually at stake?).
2. **Values check** — what must not be traded away?
3. **Judgement** — what does context, data, and experience suggest?
4. **Risk** — what is the smallest bold move that still advances the goal?

Strong leaders do not eliminate risk; they **price it honestly** and act with integrity.`,
    overviewEngage: `### Engage · map a real decision

Think of one decision you made in the last week (big or small).

1. What was the **real** choice (not the surface issue)?
2. Which **value** guided you—or did you skip that step?
3. Did you take a **smart risk**, avoid a needed risk, or gamble carelessly?

Write 3–5 sentences. Be specific.`,
    overviewApply: `### Apply · the 90-second pause

For the next 7 days, before any non-trivial decision:

1. Pause **90 seconds**.
2. Ask: *What is the decision? What value is non-negotiable? What is the smartest risk?*
3. Act—and note the outcome in one line.

Mark complete when you have used the pause at least **three times**.`,
    skills: [
      {
        key: "Decision-making intelligence",
        insight:
          "Decision-making intelligence is the ability to structure a messy situation into options, criteria, and a clear next step—without freezing or rushing.",
        practiceTip:
          "Write options as A / B / C, then score each against 2–3 criteria (impact, values fit, reversibility).",
        commonTrap:
          "Treating every choice as urgent. Most decisions improve with a short structure pause.",
        scenario: {
          kids: "Your friends want to play one game, but you promised to finish homework first. How do you decide fairly?",
          adolescents:
            "Two group projects are due and a social event lands the same night. How do you prioritise without ghosting your team?",
          adults:
            "Two stakeholders want opposite timelines. How do you frame options so the team can decide with clear criteria?",
        },
        apply: {
          kids: "Today, when you choose between two fun things, say your reason out loud in one sentence.",
          adolescents:
            "Use a simple pros/cons table for one school or team decision this week—and share it with someone you trust.",
          adults:
            "In your next meeting decision, list criteria first, then options. Send a 5-line decision note afterward.",
        },
      },
      {
        key: "Moral values",
        insight:
          "Moral values are the non-negotiables that keep decisions human. Without them, clever choices can still be harmful.",
        practiceTip:
          "Name your top 3 leadership values (e.g. honesty, fairness, care). Use them as a pre-flight checklist.",
        commonTrap:
          "Claiming values in public, then trading them under pressure for speed or approval.",
        scenario: {
          kids: "Someone asks you to hide a broken toy. What value helps you choose what to say?",
          adolescents:
            "A friend wants you to cover for them with a half-truth. What value guides your response?",
          adults:
            "A shortcut would hit the target but stretch the truth to a client. How do values reshape the option set?",
        },
        apply: {
          kids: "Write your 3 “always true for me” rules and put them where you can see them.",
          adolescents:
            "Pick one value and live it on purpose for 48 hours—journal one win and one miss.",
          adults:
            "In your next decision, write: “This choice protects ___ value.” Share it with a peer if appropriate.",
        },
      },
      {
        key: "Judgement",
        insight:
          "Judgement blends experience, context, and pattern recognition. It is slower than instinct and faster than endless analysis.",
        practiceTip:
          "Ask: What would a wise mentor notice that I am missing? Seek one extra perspective before you lock in.",
        commonTrap:
          "Confusing confidence with judgement. Loud certainty is not the same as sound sense.",
        scenario: {
          kids: "Two friends tell different stories about a fight. How do you decide what is fair?",
          adolescents:
            "A viral post looks true and urgent. What judgement checks do you run before sharing?",
          adults:
            "A junior’s proposal is bold but light on data. How do you coach judgement without killing initiative?",
        },
        apply: {
          kids: "Before you decide who is right in a disagreement, ask one more question.",
          adolescents:
            "Before you post or reply online, wait 10 minutes and re-read as if you were the other person.",
          adults:
            "Run a “pre-mortem”: assume the decision failed—list the top 3 reasons why, then adjust.",
        },
      },
      {
        key: "Risk-taking",
        insight:
          "Healthy risk-taking is calculated courage: enough stretch to grow, enough safeguard to protect people and purpose.",
        practiceTip:
          "Separate reversible risks (try fast) from irreversible ones (slow down). Size the bet to the downside.",
        commonTrap:
          "Either avoiding all risk (stagnation) or thrill-seeking without a floor (chaos).",
        scenario: {
          kids: "Trying out for a new team feels scary. What is a brave small step?",
          adolescents:
            "Speaking up in class or applying for a leadership role has social risk. What is a smart first move?",
          adults:
            "A pilot project could fail publicly. How do you design a safe-to-try experiment?",
        },
        apply: {
          kids: "Do one brave try this week—something new that is safe but a little scary.",
          adolescents:
            "Take one healthy risk (ask a question, join a group, start a project) and note what you learned.",
          adults:
            "Propose one reversible experiment with success metrics and a kill-switch date.",
        },
      },
    ],
    practiceLab: {
      challenge: {
        kids: "This week, practise **thinking before choosing** three times. Draw or write each story: what you wanted, what you chose, and why.",
        adolescents:
          "Run a **Decision Week**: for three real choices (study, friends, online), use values + judgement + smart risk. Log each in 5 lines.",
        adults:
          "Lead one **structured decision** with your team or family: criteria first, options second, values check, risk sizing, decision note.",
      },
      checklist: [
        "I named the real decision, not only the symptoms",
        "I checked at least one non-negotiable value",
        "I sought or used judgement (data, context, or a second view)",
        "I sized the risk on purpose",
        "I captured one lesson for next time",
      ],
    },
    quizPrompts: [
      "I can explain Choices as decision-making intelligence + values + judgement + risk.",
      "I can give a real example of a values-guided decision.",
      "I have a micro-practice for smarter decisions this week.",
    ],
  },

  principles: {
    promise:
      "Earn trust through integrity, context-aware ethics, and accountable governance.",
    relevance:
      "People follow leaders they trust. Principles make trust durable—especially under stress.",
    overviewRead: `## Principles are the ethics you can stand on

The Principles face builds **ethical foundations**, **contextual awareness**, **situational judgement**, and **governance**. Philosophy says what good leadership is; principles make it operational in messy situations.

### Key character components
Principled leadership is lived through virtues you can practise: **love**, **joy**, **peace**, **patience**, **mercy**, **kindness**, **goodness**, **faithfulness**, **gentleness**, **self-control**, **gratefulness**, **honesty**, **integrity**, **authenticity**, **forgiveness**, and **improvement**.

### Trust equation (practical)
**Trust rises** when competence meets consistency and care.  
**Trust falls** when rules are private, exceptions are unexplained, or power is unaccountable.

Principled leaders do not only “mean well”—they design **fair process** others can see, and they grow the character components that make trust durable.
    overviewEngage: `### Engage · trust audit

Rate yourself 1–5 on:
1. I do what I say I will do.
2. I explain the “why” when rules or decisions change.
3. I hold myself to the same standards I set for others.

Where is the biggest gap? Write one concrete example.`,
    overviewApply: `### Apply · one transparent standard

This week, pick **one** standard you lead by (punctuality, feedback honesty, fairness in tasks).

1. State it clearly to the people affected.
2. Live it visibly.
3. When you miss, own it fast.

Mark complete after 7 days of deliberate practice.`,
    skills: [
      {
        key: "Ethical foundations",
        insight:
          "Ethical foundations are the standing commitments that guide you when incentives push the wrong way.",
        practiceTip:
          "Write a personal ethics line: “I will not ___ even if it costs me ___.”",
        commonTrap:
          "Ethics as slogans. If it cannot survive a hard trade-off, it is branding, not foundation.",
        scenario: {
          kids: "You found something valuable that is not yours. What does honest leadership look like?",
          adolescents:
            "You could copy work and not get caught. What ethical foundation do you choose—and why?",
          adults:
            "A target can be hit by pushing grey-area reporting. How do you hold the ethical line with the team?",
        },
        apply: {
          kids: "Return something or tell the truth about one hard thing this week.",
          adolescents:
            "Choose honesty in one situation where a shortcut is tempting. Note the cost and the pride.",
          adults:
            "Document one ethical non-negotiable for your team and discuss it in 10 minutes.",
        },
      },
      {
        key: "Contextual awareness",
        insight:
          "Context changes what “fair” looks like. Principled leaders read culture, power, history, and constraints before prescribing.",
        practiceTip:
          "Ask: Who is affected? What history sits under this? What constraints am I not seeing?",
        commonTrap:
          "One-size-fits-all rules that ignore culture, access, or unequal risk.",
        scenario: {
          kids: "A new classmate does not know the rules yet. How do you help fairly?",
          adolescents:
            "A rule works for most students but hurts someone with less support at home. How do you respond?",
          adults:
            "A policy that works at HQ fails in a field team. How do you adapt without abandoning principle?",
        },
        apply: {
          kids: "Help one person who is new or left out—on purpose.",
          adolescents:
            "Before judging a peer’s choice, list two possible contexts you might not know.",
          adults:
            "In your next decision, list three stakeholder contexts and one adjustment that keeps the principle intact.",
        },
      },
      {
        key: "Situational judgement",
        insight:
          "Situational judgement is ethical agility: same principles, different moves depending on stakes and relationships.",
        practiceTip:
          "Separate principles (fixed) from tactics (flexible). Never trade the first for the second.",
        commonTrap:
          "Rigid rule-following that harms people, or flexible tactics that quietly abandon principles.",
        scenario: {
          kids: "A friend is sad and broke a small rule. How do you respond with both care and honesty?",
          adolescents:
            "A teammate is struggling; calling them out publicly would shame them. What is wise judgement?",
          adults:
            "A high performer violated a value. How do you respond with fairness to them and the team?",
        },
        apply: {
          kids: "Practise “kind and honest” in one hard conversation.",
          adolescents:
            "Give private feedback once this week instead of public call-outs.",
          adults:
            "Use a fair-process checklist: listen → explain → decide → own the outcome.",
        },
      },
      {
        key: "Governance",
        insight:
          "Governance is how power is held accountable—roles, transparency, escalation, and shared standards.",
        practiceTip:
          "Make one process visible: who decides, who is consulted, who is informed.",
        commonTrap:
          "Informal power with no clear process—decisions feel political even when they are not.",
        scenario: {
          kids: "Who decides the rules in a game? How can everyone know they are fair?",
          adolescents:
            "In a club or team, how should decisions be made so people feel heard?",
          adults:
            "A recurring conflict has no owner. How do you design light governance without bureaucracy?",
        },
        apply: {
          kids: "Help write 3 fair rules for a game or group activity.",
          adolescents:
            "Propose a simple decision method for a group project (vote, lead decides after listening, etc.).",
          adults:
            "Publish a one-page RACI (or similar) for one recurring decision this week.",
        },
      },
    ],
    practiceLab: {
      challenge: {
        kids: "Be a **fair captain** for one week at home or school: honest, kind, and clear about rules.",
        adolescents:
          "Lead with **integrity in public and private** for one week—especially online and in group chats.",
        adults:
          "Run a **trust reset**: clarify one standard, one fair process, and one accountability loop with your team.",
      },
      checklist: [
        "I stated a clear standard people can understand",
        "I considered context, not only the rulebook",
        "I used fair process in at least one tough moment",
        "I owned a miss without excuses",
        "Someone else could describe how decisions get made",
      ],
    },
    quizPrompts: [
      "I can explain Principles as ethics + context + situational judgement + governance.",
      "I can give an example of fair process under pressure.",
      "I have one transparent standard I am practising this week.",
    ],
  },

  mental: {
    promise:
      "Think strategically, solve hard problems, set vision, and apply knowledge where it counts.",
    relevance:
      "Leaders create clarity in complexity. Mental strength is cognitive leadership—not just IQ.",
    overviewRead: `## Mental leadership is trained thinking

The Mental face develops **cognitive intelligence**, **strategic thinking**, **problem-solving**, **vision**, and **knowledge application**. In Super-Cube® research, mental themes often dominate how people describe leadership—so this face deserves deliberate practice, not assumption.

### A practical thinking loop
1. **Frame** the problem correctly.
2. **Explore** options and systems, not single symptoms.
3. **Decide** a direction (vision + strategy).
4. **Apply** knowledge in *this* context.
5. **Review** learning and update the map.`,
    overviewEngage: `### Engage · problem framing

Take a challenge you care about. Rewrite it three ways:
1. As a **people** problem
2. As a **process** problem
3. As a **priority** problem

Which framing opens the best next step?`,
    overviewApply: `### Apply · weekly strategy hour

Block **45–60 minutes** this week for thinking only (no inbox).

Deliverable:
- One-page: problem frame, options, chosen direction, next 3 actions.

Mark complete when the page exists.`,
    skills: [
      {
        key: "Cognitive intelligence",
        insight:
          "Cognitive intelligence in leadership is useful thinking under load: attention, analysis, and sense-making others can follow.",
        practiceTip:
          "Externalise thinking: whiteboard, notes, or a 5-bullet brief so others can improve the idea.",
        commonTrap:
          "Keeping the best analysis in your head—teams cannot follow what they cannot see.",
        scenario: {
          kids: "A hard puzzle feels confusing. How do you break it into smaller pieces?",
          adolescents:
            "Exam stress makes it hard to think. What is one method to organise your mind under pressure?",
          adults:
            "Information overload is freezing the team. How do you create a clear thinking structure?",
        },
        apply: {
          kids: "Break one hard task into 3 smaller steps and do the first step today.",
          adolescents:
            "Use a mind map for one assignment or project this week.",
          adults:
            "Turn one complex issue into a one-page brief: situation, complication, question, options.",
        },
      },
      {
        key: "Strategic thinking",
        insight:
          "Strategy connects today’s actions to a future worth building—trade-offs included.",
        practiceTip:
          "Ask: If this works in 12 months, what must be true in 30 days?",
        commonTrap:
          "Confusing busy activity with strategy. Motion is not progress.",
        scenario: {
          kids: "You want a big goal (a badge, a sport, a project). What is the plan for this week?",
          adolescents:
            "You want a future pathway (course, sport, career). What is the 30-day strategy?",
          adults:
            "Your team is reactive. How do you introduce a simple strategy cadence?",
        },
        apply: {
          kids: "Write a mini plan: goal → 3 steps → first step today.",
          adolescents:
            "Write a 30-day plan with weekly milestones for one personal goal.",
          adults:
            "Define one strategic priority and kill or pause two low-value activities.",
        },
      },
      {
        key: "Problem-solving",
        insight:
          "Problem-solving is creative and disciplined: diagnose root causes, prototype solutions, test, learn.",
        practiceTip:
          "Use “5 whys” or a simple fishbone once this week before jumping to solutions.",
        commonTrap:
          "Solving the loudest symptom while the real constraint stays hidden.",
        scenario: {
          kids: "Something keeps going wrong in a game or project. How do you find the real reason?",
          adolescents:
            "A group project keeps failing the same way. How do you diagnose and fix it?",
          adults:
            "A recurring operational issue returns every quarter. How do you solve the system, not the fire?",
        },
        apply: {
          kids: "When something breaks, ask “why?” three times before fixing.",
          adolescents:
            "For one problem, list root causes and pick one fix to test for 3 days.",
          adults:
            "Run a 15-minute root-cause session and assign a single experiment owner.",
        },
      },
      {
        key: "Vision",
        insight:
          "Vision is a picture of a better future vivid enough to align effort and brave enough to stretch people.",
        practiceTip:
          "Describe the future in sensory detail: what will people see, hear, and feel if we succeed?",
        commonTrap:
          "Vague slogans (“be the best”) that do not guide daily choices.",
        scenario: {
          kids: "Imagine your best team or classroom. What does it look and feel like?",
          adolescents:
            "Where do you want to be in 3 years? What picture would make daily choices easier?",
          adults:
            "Your team needs a north star for the next year. How do you co-create a usable vision?",
        },
        apply: {
          kids: "Draw or write a “best future” picture for one goal.",
          adolescents:
            "Write a one-paragraph future self letter dated 3 years from now.",
          adults:
            "Draft a 5-sentence vision and test it with two people for clarity.",
        },
      },
      {
        key: "Knowledge application",
        insight:
          "Knowledge only becomes leadership when it changes behaviour in context—teaching, transferring, and adapting.",
        practiceTip:
          "After every learning, answer: So what? Now what? Who else needs this?",
        commonTrap:
          "Collecting courses and frameworks without changing practice.",
        scenario: {
          kids: "You learned something new. How can you use it to help a friend?",
          adolescents:
            "You learned a study method that works. How do you apply it to a hard subject this week?",
          adults:
            "A workshop was excellent. How do you convert insight into a team habit within 14 days?",
        },
        apply: {
          kids: "Teach one new thing you learned to someone else today.",
          adolescents:
            "Apply one study or leadership idea for 7 days and track results.",
          adults:
            "Translate one insight into a team ritual, checklist, or decision rule.",
        },
      },
    ],
    practiceLab: {
      challenge: {
        kids: "Be a **problem-solver of the week**: find one problem, break it into pieces, try a fix, share what you learned.",
        adolescents:
          "Complete a **strategy sprint**: choose one goal, build a 14-day plan, execute daily, review twice.",
        adults:
          "Facilitate one **thinking session** that produces a one-page strategy and three owned actions.",
      },
      checklist: [
        "I framed the problem before jumping to solutions",
        "I used a structured thinking tool at least once",
        "I connected actions to a future outcome",
        "I applied knowledge in a real context",
        "I reviewed learning and updated my approach",
      ],
    },
    quizPrompts: [
      "I can explain Mental leadership as thinking, strategy, problem-solving, vision, and application.",
      "I can show a real example of framing a problem well.",
      "I have a thinking practice scheduled this week.",
    ],
  },

  emotional: {
    promise:
      "Use emotional intelligence to build trust, motivate people, and lead relationships with skill.",
    relevance:
      "Results travel through relationships. Emotional leadership is how influence becomes sustainable.",
    overviewRead: `## Emotions are leadership data

The Emotional face develops **emotional intelligence**, **empathy**, **social relationships**, **motivation**, and **inspiration**. Feeling is not the opposite of professionalism—unexamined emotion is.

### The EI loop for leaders
1. **Perceive** — name what you and others feel.
2. **Understand** — what need or threat sits underneath?
3. **Use** — let emotion inform priorities (without hijacking them).
4. **Manage** — regulate yourself; support others’ regulation.
5. **Connect** — turn insight into trust and motivated action.`,
    overviewEngage: `### Engage · emotion map

Recall a tense moment this week.
1. What did **you** feel in your body?
2. What might the **other person** have felt?
3. What did you do—and what would high-EQ leadership have done instead?

Write honestly; no performance needed.`,
    overviewApply: `### Apply · name it to tame it

For 7 days, once per day:
1. Name your emotion in one word.
2. Name one need underneath it.
3. Choose one constructive action.

Mark complete after logging at least **five** days.`,
    skills: [
      {
        key: "Emotional intelligence",
        insight:
          "EI is the skill of reading and regulating emotion so relationships and decisions improve.",
        practiceTip:
          "Build a feeling vocabulary beyond mad/sad/fine. Precision reduces drama.",
        commonTrap:
          "Suppressing emotion until it leaks as sarcasm, silence, or overcontrol.",
        scenario: {
          kids: "You feel angry at a friend. How can you name the feeling without hurting them?",
          adolescents:
            "You feel anxious before a presentation. How do you use EI instead of shutting down?",
          adults:
            "A meeting turns tense. How do you name the climate and re-open productive dialogue?",
        },
        apply: {
          kids: "Use a feelings chart once a day and tell a trusted adult.",
          adolescents:
            "Journal emotion → need → action for five evenings this week.",
          adults:
            "Open one meeting with a 60-second climate check (“energy / blockers”).",
        },
      },
      {
        key: "Empathy",
        insight:
          "Empathy is understanding another’s experience without losing your own centre—or your standards.",
        practiceTip:
          "Reflect before you solve: “What I hear is… Is that right?”",
        commonTrap:
          "Fixing too fast, or absorbing others’ emotions until you burn out.",
        scenario: {
          kids: "A classmate is left out. What does empathy look like in action?",
          adolescents:
            "A friend is struggling but saying “I’m fine.” How do you show empathy without prying?",
          adults:
            "A team member is underperforming and defensive. How does empathy open coaching?",
        },
        apply: {
          kids: "Do one kind act for someone who seems sad or alone.",
          adolescents:
            "Have one conversation where you only ask questions and reflect—no advice first.",
          adults:
            "In your next 1:1, spend the first 10 minutes on their world before your agenda.",
        },
      },
      {
        key: "Social relationships",
        insight:
          "Leadership multiplies through healthy networks—trust, clear boundaries, and repair after conflict.",
        practiceTip:
          "Invest in “relationship deposits” before you need a withdrawal.",
        commonTrap:
          "Transactional relationships that only appear when you need something.",
        scenario: {
          kids: "How do you make a group feel welcoming?",
          adolescents:
            "Peer groups can pressure you. How do you keep friendships and your standards?",
          adults:
            "Cross-team work is stuck in politics. How do you rebuild a working relationship?",
        },
        apply: {
          kids: "Invite someone new to play or sit with you once this week.",
          adolescents:
            "Repair one strained relationship with a clear, respectful message.",
          adults:
            "Send one genuine appreciation note and one repair conversation if needed.",
        },
      },
      {
        key: "Motivation",
        insight:
          "Motivation is the energy to start and sustain effort—self and others—toward meaningful goals.",
        practiceTip:
          "Link tasks to purpose and progress. People move for meaning and mastery, not only pressure.",
        commonTrap:
          "Only using fear or rewards—short spikes, long resentment.",
        scenario: {
          kids: "A hard task feels boring. What can make it feel worth doing?",
          adolescents:
            "You lost drive for a goal. What rebuilds healthy motivation?",
          adults:
            "Your team’s energy is flat. How do you redesign motivation without empty pep talks?",
        },
        apply: {
          kids: "Turn one chore into a game with a small reward for finishing.",
          adolescents:
            "Set a 7-day streak goal with a visible tracker and a meaningful why.",
          adults:
            "For one priority, clarify purpose, autonomy, and a visible progress signal.",
        },
      },
      {
        key: "Inspiration",
        insight:
          "Inspiration is leadership that lifts standards and hope—through example, story, and belief in people.",
        practiceTip:
          "Share a short story of struggle → learning → progress. Vulnerability + competence inspires.",
        commonTrap:
          "Performative hype without follow-through. Inspiration without integrity collapses.",
        scenario: {
          kids: "How can your actions encourage someone younger or shy?",
          adolescents:
            "Who inspires you—and what do they do that you could practise this week?",
          adults:
            "How do you inspire a team facing fatigue without denying reality?",
        },
        apply: {
          kids: "Tell someone what you admire about them—specifically.",
          adolescents:
            "Share one honest “I struggled, then I grew” story with a peer or team.",
          adults:
            "Open a meeting with a 2-minute story that reconnects people to purpose.",
        },
      },
    ],
    practiceLab: {
      challenge: {
        kids: "Be a **kindness leader** for a week: name feelings, help one person daily, stay calm in one hard moment.",
        adolescents:
          "Run an **EQ week**: daily emotion log, one empathy conversation, one repair, one motivating message to a teammate.",
        adults:
          "Lead with **relational intentionality**: climate checks, one deep 1:1, one repair, one moment of public recognition.",
      },
      checklist: [
        "I named emotions with more precision than usual",
        "I practised empathy before problem-solving at least once",
        "I invested in a relationship on purpose",
        "I used motivation tools beyond pressure",
        "I inspired with example or story, not hype alone",
      ],
    },
    quizPrompts: [
      "I can explain Emotional leadership as EI, empathy, relationships, motivation, and inspiration.",
      "I can describe a moment I regulated myself under pressure.",
      "I have a relationship or EI practice for this week.",
    ],
  },

  physical: {
    promise:
      "Protect energy, health, and resilience so leadership can be sustained—not just sprinted.",
    relevance:
      "You cannot lead from an empty body. Physical capacity is leadership infrastructure.",
    overviewRead: `## Physical leadership is energy stewardship

The Physical face covers **health**, **energy management**, **fitness**, **nutrition**, and **bodily resilience**. Many leadership models ignore the body; Super-Cube® does not. Fatigue, illness, and depletion quietly destroy judgement, empathy, and courage.

### The energy budget
Treat energy like a budget:
- **Deposit** — sleep, food, movement, recovery, boundaries.
- **Spend** — deep work, care, conflict, travel, screens.
- **Audit** — weekly: where did energy leak?

Sustainable leaders design recovery as seriously as delivery.`,
    overviewEngage: `### Engage · energy audit

Score 1–5 this week:
1. Sleep quality
2. Movement
3. Nutrition consistency
4. Recovery / rest
5. Stress load

Which one, improved by 10%, would lift everything else?`,
    overviewApply: `### Apply · one non-negotiable deposit

Choose **one** physical deposit for 7 days:
- consistent bedtime, or
- 20-minute walk/move, or
- phone-free first 30 minutes, or
- water + real meals baseline.

Track a simple yes/no calendar. Mark complete at 5/7 days.`,
    skills: [
      {
        key: "Physical health",
        insight:
          "Physical health is the baseline system—sleep, medical care, injury prevention, and habits that keep you available to lead.",
        practiceTip:
          "Protect sleep like a critical meeting. Cognition and mood depend on it.",
        commonTrap:
          "Heroic overwork that looks committed and quietly reduces leadership quality.",
        scenario: {
          kids: "You stayed up late and feel grumpy. How does body care change your day?",
          adolescents:
            "Exams and screens steal sleep. What is a realistic health boundary?",
          adults:
            "Travel and deadlines wreck routines. How do you protect a health minimum?",
        },
        apply: {
          kids: "Go to bed on time 5 nights this week.",
          adolescents:
            "Set a device curfew 30–60 minutes before sleep for 5 nights.",
          adults:
            "Define a personal “health minimum” (sleep hours + movement) and honour it 5/7 days.",
        },
      },
      {
        key: "Energy management",
        insight:
          "Energy management is scheduling work to match biological peaks and protecting recovery between peaks.",
        practiceTip:
          "Do your hardest thinking in your peak energy window; batch low-value tasks later.",
        commonTrap:
          "Managing only time. A full calendar with empty energy still fails.",
        scenario: {
          kids: "When do you have the most energy to learn or play well?",
          adolescents:
            "When is your brain sharpest for hard study—and do you use that window?",
          adults:
            "Your calendar is full of low-value meetings in your peak hours. How do you redesign?",
        },
        apply: {
          kids: "Do your hardest homework when you feel most awake.",
          adolescents:
            "Block your best 90 minutes for deep work 3 days this week.",
          adults:
            "Move one high-stakes task into your peak window and one admin task out of it.",
        },
      },
      {
        key: "Fitness",
        insight:
          "Fitness builds capacity for stress—cardiovascular base, strength, and mobility support resilience and confidence.",
        practiceTip:
          "Prefer consistency over intensity. Ten minutes daily beats a heroic once-a-month session.",
        commonTrap:
          "All-or-nothing fitness plans that collapse under a busy week.",
        scenario: {
          kids: "What movement makes your body feel strong and happy?",
          adolescents:
            "How can fitness support stress and confidence without becoming obsession?",
          adults:
            "How do you keep a fitness floor during peak delivery periods?",
        },
        apply: {
          kids: "Play actively for 20 minutes a day, 5 days.",
          adolescents:
            "Complete 5 movement sessions this week (walk, sport, gym, dance—your choice).",
          adults:
            "Commit to a “never zero” rule: at least 10 minutes of movement on hard days.",
        },
      },
      {
        key: "Nutrition",
        insight:
          "Nutrition fuels attention and mood. Leaders who skip meals or live on sugar often lead with irritability.",
        practiceTip:
          "Anchor the day with protein + fibre at the first meal; hydrate early.",
        commonTrap:
          "Using caffeine and sugar as personality replacements for real fuel.",
        scenario: {
          kids: "How does junk food vs good food change how you feel at school?",
          adolescents:
            "Busy days lead to skipped meals. What is a practical fuel plan?",
          adults:
            "Back-to-back meetings destroy meal patterns. How do you design default nutrition?",
        },
        apply: {
          kids: "Eat fruit or veggies with two meals a day for 5 days.",
          adolescents:
            "Prep one simple healthy default snack/meal for busy days.",
          adults:
            "Design a default lunch for workdays and use it 4 times this week.",
        },
      },
      {
        key: "Bodily resilience",
        insight:
          "Bodily resilience is recovering from stress and strain—nervous system regulation, injury care, and bounce-back habits.",
        practiceTip:
          "Practise a 2-minute downshift: longer exhale breathing, stretch, or brief walk after intensity.",
        commonTrap:
          "Ignoring early body signals until forced offline by illness or burnout.",
        scenario: {
          kids: "After a big day, what helps your body rest and reset?",
          adolescents:
            "After high stress (exams, conflict), what recovery works for you?",
          adults:
            "After a crisis week, how do you deliberately restore capacity?",
        },
        apply: {
          kids: "Practise 5 slow breaths when you feel upset, once a day.",
          adolescents:
            "After one hard event, use a recovery ritual within 30 minutes.",
          adults:
            "Schedule one recovery block after your highest-stress day this week—and keep it.",
        },
      },
    ],
    practiceLab: {
      challenge: {
        kids: "Run a **strong body week**: sleep, play/move, water, and calm breaths—track with stickers or ticks.",
        adolescents:
          "Complete a **capacity week**: sleep target, movement streak, fuel defaults, and one recovery ritual after stress.",
        adults:
          "Install a **leadership energy system**: health minimum, peak-hour deep work, movement floor, recovery block.",
      },
      checklist: [
        "I protected sleep or another health baseline",
        "I scheduled work to match energy at least once",
        "I moved my body on most days",
        "I fuelled with intention, not only convenience",
        "I practised recovery after stress",
      ],
    },
    quizPrompts: [
      "I can explain Physical leadership as health, energy, fitness, nutrition, and resilience.",
      "I can identify my biggest energy leak.",
      "I have one physical deposit habit for this week.",
    ],
  },

  spiritual: {
    promise:
      "Lead from purpose, meaning, and deeper motivation that outlasts short-term pressure.",
    relevance:
      "People give their best when work connects to something larger than the task list.",
    overviewRead: `## Spiritual leadership is purpose in practice

The Spiritual face develops **purpose**, **meaning**, **faith** (in the broad sense of trust and conviction), **transcendence**, and **spiritual intelligence**. This is not about imposing belief systems—it is about aligning action with what matters most, for you and for those you serve.

### From philosophy to practice
- **Philosophy** asks: What is a good life and good leadership?
- **Theory** explains how purpose fuels motivation and commitment.
- **Model** (Super-Cube®) gives you faces and skills to grow on purpose.

Spiritual leadership shows up as coherence: your calendar, decisions, and relationships match your stated purpose.`,
    overviewEngage: `### Engage · purpose pulse

Complete these sentences:
1. I feel most alive when…
2. People count on me for…
3. If I led with more purpose this month, I would stop ___ and start ___.

Share with a trusted person if you can.`,
    overviewApply: `### Apply · purpose in the calendar

This week, schedule **one** action that only makes sense because of your deeper purpose (service, craft, family, faith community, learning, creation).

Protect it like a meeting with your future self. Mark complete when done.`,
    skills: [
      {
        key: "Purpose",
        insight:
          "Purpose is the “why” that organises trade-offs. Without it, every urgent request looks equal.",
        practiceTip:
          "Write a one-sentence purpose for this season of life—not forever, just now.",
        commonTrap:
          "Borrowing someone else’s purpose (status, comparison) and wondering why energy is thin.",
        scenario: {
          kids: "What do you love doing that also helps others?",
          adolescents:
            "How do you choose activities that fit who you are becoming—not only who others want?",
          adults:
            "How does purpose change which meetings, projects, and relationships get your best energy?",
        },
        apply: {
          kids: "Do one helpful act that matches what you care about.",
          adolescents:
            "Write a season purpose in one sentence and post it where you will see it.",
          adults:
            "Rewrite your top weekly priority so the purpose is explicit in the first line.",
        },
      },
      {
        key: "Meaning",
        insight:
          "Meaning is how you interpret events—especially setbacks—so effort stays coherent and hopeful.",
        practiceTip:
          "After a hard day, ask: What did this teach? Who did it serve? What still matters?",
        commonTrap:
          "Meaning collapse: “nothing matters” after failure. Leaders re-author the story with honesty.",
        scenario: {
          kids: "When something fails, how can you still find something good you learned?",
          adolescents:
            "A rejection or low grade hits hard. How do you make meaning without toxic positivity?",
          adults:
            "A project fails. How do you lead a meaning-making debrief that restores agency?",
        },
        apply: {
          kids: "After a hard moment, say one thing you learned.",
          adolescents:
            "Write a short “what this means / what I will do” note after one setback.",
          adults:
            "Facilitate a 15-minute learning debrief: facts → feelings → meaning → next experiment.",
        },
      },
      {
        key: "Faith",
        insight:
          "Faith here means trusted conviction—belief in people, principles, or the path—strong enough to act before certainty is complete.",
        practiceTip:
          "Name what you trust: a value, a process, a community, a spiritual tradition, or a future you are building.",
        commonTrap:
          "Either cynical control (“trust no one”) or blind optimism without responsibility.",
        scenario: {
          kids: "Who do you trust to help you grow—and how do you show trustworthiness back?",
          adolescents:
            "What do you believe about your future strongly enough to practise for?",
          adults:
            "Where must you act with conviction before full certainty—and what anchors that faith?",
        },
        apply: {
          kids: "Keep a small promise to show you are trustworthy.",
          adolescents:
            "Take one action that matches a belief about your future (study, craft, service).",
          adults:
            "State one conviction publicly with your team and take a matching action within 48 hours.",
        },
      },
      {
        key: "Transcendence",
        insight:
          "Transcendence is rising above ego and immediacy—seeing the larger whole: community, nature, legacy, the sacred.",
        practiceTip:
          "Practise awe and perspective weekly: nature, art, service, silence, or worship—whatever fits your path.",
        commonTrap:
          "Living only in the inbox of the self. Leadership shrinks when the world shrinks to me.",
        scenario: {
          kids: "When do you feel wonder—stars, nature, music, kindness?",
          adolescents:
            "How can you zoom out from social pressure to something larger that steadies you?",
          adults:
            "How do you reconnect to the larger purpose when organisational politics dominate?",
        },
        apply: {
          kids: "Spend 10 quiet minutes outside or with music noticing beauty.",
          adolescents:
            "Do one screen-free practice that connects you to something larger (nature, service, art, prayer).",
          adults:
            "Block one transcendence practice this week and protect it from meetings.",
        },
      },
      {
        key: "Spiritual intelligence",
        insight:
          "Spiritual intelligence is the capacity to integrate values, meaning, and wisdom into daily decisions and relationships.",
        practiceTip:
          "Before major decisions, ask the “future integrity” question: Will I respect this choice in 5 years?",
        commonTrap:
          "Splitting “spiritual life” from “work life.” Integration is the skill.",
        scenario: {
          kids: "How do your deepest values show up in how you treat people?",
          adolescents:
            "How do you keep your deepest values online and offline the same?",
          adults:
            "Where is your leadership out of integrity with your deepest values—and what is the first repair?",
        },
        apply: {
          kids: "Choose kindness on purpose when it is hard, once today.",
          adolescents:
            "Align one online behaviour with your offline values this week.",
          adults:
            "Run a values–calendar audit: remove one misaligned commitment; add one aligned action.",
        },
      },
    ],
    practiceLab: {
      challenge: {
        kids: "Live a **purpose week**: help others, keep promises, notice wonder, and say what matters to you.",
        adolescents:
          "Run a **meaning week**: season purpose sentence, one service act, one transcendence practice, one values-aligned decision.",
        adults:
          "Lead a **purpose alignment sprint**: personal purpose line, team meaning conversation, one transcendent practice, one integrity repair.",
      },
      checklist: [
        "I can state a season purpose in one sentence",
        "I made meaning from at least one hard moment",
        "I acted on a conviction, not only a task list",
        "I practised transcendence / perspective once",
        "I aligned one decision with deeper values",
      ],
    },
    quizPrompts: [
      "I can explain Spiritual leadership as purpose, meaning, faith, transcendence, and spiritual intelligence.",
      "I can state a personal purpose for this season.",
      "I have one purpose-aligned action scheduled this week.",
    ],
  },
};

/** Map programme skill labels to copy by index within construct */
export function skillCopyFor(
  constructId: ConstructId,
  skillIndex: number
) {
  const skills = COURSE_COPY[constructId].skills;
  return skills[Math.min(skillIndex, skills.length - 1)];
}
