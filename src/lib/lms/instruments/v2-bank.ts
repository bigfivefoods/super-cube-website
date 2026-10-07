/**
 * Super-Cube® instrument v2: DRAFT item bank for Dr Craig R. Muller's sign-off.
 *
 * - Behaviourally anchored Likert items, rated on a FREQUENCY scale
 *   (Never · Rarely · Sometimes · Often · Almost always).
 * - About one-third reverse-keyed for Adults and Teens, written as a positive
 *   description of the opposite behaviour (no "not"), following van Sonderen,
 *   Sanderman & Coyne (2013). The Kids form keeps one reverse item per face
 *   (Mellor & Moore, 2014: children find reversed and abstract items hard).
 * - Situational judgement items (SJTs) with "most effective" instructions and a
 *   PROVISIONAL 1–4 effectiveness key per option. The key must be confirmed by an
 *   expert panel (see docs) before v2 results are used for decisions.
 * - Every self-report item has a parallel third-person observer version for the
 *   360 form ({name} is replaced with the learner's first name).
 *
 * Item content is Dr Muller's academic model: change wording here only with his approval.
 * v1 (research form) is untouched and still lives in curriculum.ts.
 */
import type { ConstructId } from "@/lib/content";
import type { ProgrammeId } from "@/lib/programmes";

export type LikertDef = {
  /** Skill (element) on the face this item samples; must match programmes.ts names */
  skill: string;
  reverse: boolean;
  self: string;
  observer: string;
};

export type SjtOptionDef = { text: string; key: 1 | 2 | 3 | 4; why: string };

export type SjtDef = {
  skill: string;
  scenario: string;
  /** Third-person version for observers is not used: SJTs are self-only. */
  options: SjtOptionDef[];
};

export type FaceBank = { likert: LikertDef[]; sjt: SjtDef[] };

const L = (skill: string, reverse: boolean, self: string, observer: string): LikertDef => ({
  skill,
  reverse,
  self,
  observer,
});
const o = (text: string, key: 1 | 2 | 3 | 4, why: string): SjtOptionDef => ({ text, key, why });

/* ========================================================================== */
/* ADULTS                                                                      */
/* ========================================================================== */

const ADULTS: Record<ConstructId, FaceBank> = {
  choices: {
    likert: [
      L("Decision-making intelligence", false,
        "When a decision is complex, I write down the options and the criteria before I choose.",
        "When a decision is complex, {name} sets out the options and the criteria before choosing."),
      L("Decision-making intelligence", true,
        "I put off difficult decisions until a deadline or someone else forces them.",
        "{name} puts off difficult decisions until a deadline or someone else forces them."),
      L("Moral values", false,
        "Before I commit to a decision, I check that it fits my values and the organisation's values.",
        "Before committing to a decision, {name} checks that it fits their values and the organisation's values."),
      L("Moral values", true,
        "When I am under pressure to hit a target, I bend my standards and justify it afterwards.",
        "When under pressure to hit a target, {name} bends their standards and justifies it afterwards."),
      L("Judgement", false,
        "Before a decision that affects others, I ask for at least one view that differs from mine.",
        "Before a decision that affects others, {name} asks for at least one view that differs from theirs."),
      L("Risk-taking", false,
        "Before I take a risk, I weigh what could go wrong and how I would recover.",
        "Before taking a risk, {name} weighs what could go wrong and how they would recover."),
      L("Risk-taking", true,
        "I choose the safest option even when it is likely to fail.",
        "{name} chooses the safest option even when it is likely to fail."),
    ],
    sjt: [
      {
        skill: "Risk-taking",
        scenario:
          "You lead a team at a regional distributor. A big new customer wants delivery in half the usual time. Saying yes could win a major account, but it would stretch your drivers and warehouse. Your manager is away this week and has asked you to use your judgement.",
        options: [
          o("Accept straight away. The opportunity is too good to miss and the team will cope.", 1, "Takes the risk without pricing it, and puts people and safety at risk."),
          o("Ask your warehouse and transport leads if it is feasible, and accept if they say yes.", 3, "Good: it checks capacity with the people who know. It does not yet look at cost, recovery or a fallback."),
          o("Map what it would take (people, vehicles, cost, safety), offer a trial order or phased delivery, and confirm the decision to your manager in writing.", 4, "Best: a calculated risk with a fallback, shared openly, using the authority you were given."),
          o("Wait until your manager is back next week.", 2, "Avoids the risk but gives up the judgement you were trusted with, and the customer may go elsewhere."),
        ],
      },
      {
        skill: "Moral values",
        scenario:
          "A supplier you have used for years offers you a generous gift voucher as a \"thank you\" just before this year's tender is decided. Your company's gift policy is unclear.",
        options: [
          o("Accept it. It is for past work and won't affect the tender.", 1, "Even if your judgement is unaffected, it creates a conflict of interest and looks like one."),
          o("Decline politely, tell your manager or compliance team about the offer, and suggest the policy is made clearer.", 4, "Best: protects your integrity, keeps a record and fixes the gap for others."),
          o("Decline it quietly and tell no one.", 3, "Right decision, but the gap in the policy stays and there is no record if questions come later."),
          o("Accept it but step back from the tender decision.", 2, "Manages part of the conflict but still accepts a gift timed to influence."),
        ],
      },
      {
        skill: "Judgement",
        scenario:
          "In a meeting, a confident senior colleague pushes for a quick decision to switch software vendors after an impressive demo. Nobody has asked the staff who will use the system every day.",
        options: [
          o("Support the decision. The senior colleague has more experience.", 1, "Confuses confidence and seniority with sound judgement."),
          o("Say you are uncomfortable and block the decision.", 2, "Raises the concern but offers no way forward."),
          o("Suggest a short trial with a few daily users before deciding, and offer to organise it.", 4, "Best: adds the missing perspective and keeps momentum."),
          o("Keep quiet in the meeting and raise your concerns with a colleague afterwards.", 1, "The decision is made without your view, and side conversations erode trust."),
        ],
      },
    ],
  },

  principles: {
    likert: [
      L("Ethical foundations", false,
        "I tell the truth about problems and mistakes, including my own, even when it is uncomfortable.",
        "{name} tells the truth about problems and mistakes, including their own, even when it is uncomfortable."),
      L("Ethical foundations", true,
        "I keep quiet about unethical behaviour when speaking up could cost me.",
        "{name} keeps quiet about unethical behaviour when speaking up could cost them."),
      L("Contextual awareness", false,
        "I adapt how I apply a rule to the people, culture and circumstances involved, while keeping the principle behind it.",
        "{name} adapts how they apply a rule to the people, culture and circumstances involved, while keeping the principle behind it."),
      L("Situational judgement", false,
        "In a grey-area situation, I think through who will be affected before I act.",
        "In a grey-area situation, {name} thinks through who will be affected before acting."),
      L("Situational judgement", true,
        "I make ethical calls quickly on gut feel, without thinking through the consequences.",
        "{name} makes ethical calls quickly on gut feel, without thinking through the consequences."),
      L("Governance", false,
        "I follow agreed processes for approvals, conflicts of interest and record-keeping, even when no one is checking.",
        "{name} follows agreed processes for approvals, conflicts of interest and record-keeping, even when no one is checking."),
      L("Governance", true,
        "I use my position to make exceptions for people I like.",
        "{name} uses their position to make exceptions for people they like."),
    ],
    sjt: [
      {
        skill: "Ethical foundations",
        scenario:
          "You discover that a report your team sent a client last month had an error that made the results look better than they were. The client has not noticed. Correcting it may embarrass your team.",
        options: [
          o("Leave it. The client is happy, and the next report will be accurate.", 1, "The client keeps relying on wrong information; trust is lost if it comes out."),
          o("Tell your manager, agree how to correct it, and send the client a clear correction with what you have changed to stop it happening again.", 4, "Best: honest, accountable and fixes the process."),
          o("Quietly fix the figures in the next report without pointing out the change.", 2, "Corrects the numbers but hides the mistake."),
          o("Send the client a correction yourself straight away, without telling your manager.", 3, "Honest and quick, but bypasses the people accountable for the client relationship."),
        ],
      },
      {
        skill: "Contextual awareness",
        scenario:
          "You are rolling out a new attendance policy across sites in different provinces. At one site, many staff depend on shared taxis that often arrive late because of a route problem. Applying the policy strictly would mean many warnings.",
        options: [
          o("Apply the policy exactly as written everywhere. Fairness means the same rule for all.", 2, "Consistent, but ignores a real constraint and will damage trust."),
          o("Exempt that site from the policy.", 1, "Drops the principle and creates resentment at other sites."),
          o("Keep the principle (reliable attendance), talk with staff and the site manager, and agree a practical adjustment such as a later start time, written down and reviewed.", 4, "Best: principle kept, context respected, decision transparent."),
          o("Tell the site manager to use discretion and not report it.", 1, "Hidden exceptions undermine governance and fairness."),
        ],
      },
      {
        skill: "Governance",
        scenario:
          "A close friend applies for a role, and you sit on the interview panel. Your friend is well qualified.",
        options: [
          o("Stay on the panel. You know you can be objective.", 1, "Conflicts of interest are about how decisions look as well as how they are made."),
          o("Declare the relationship to the panel chair and step out of the decision for this candidate.", 4, "Best: open declaration and recusal protect your friend, the panel and the organisation."),
          o("Stay on, but mention informally to the others that you know the candidate.", 2, "Partly transparent, but you still influence the outcome and nothing is recorded."),
          o("Withdraw from the whole panel without giving a reason.", 2, "Avoids the conflict but leaves the panel short and the reason unrecorded."),
        ],
      },
    ],
  },

  mental: {
    likert: [
      L("Cognitive intelligence", false,
        "I set aside time each week to learn something that improves how I think or work.",
        "{name} sets aside time each week to learn something that improves how they think or work."),
      L("Strategic thinking", false,
        "I consider how today's decisions will play out over the next one to three years.",
        "{name} considers how today's decisions will play out over the next one to three years."),
      L("Strategic thinking", true,
        "Urgent day-to-day tasks take up so much of my time that I rarely think ahead.",
        "Urgent day-to-day tasks take up so much of {name}'s time that they rarely think ahead."),
      L("Problem-solving", false,
        "When a problem keeps coming back, I look for its root cause instead of fixing the symptom again.",
        "When a problem keeps coming back, {name} looks for its root cause instead of fixing the symptom again."),
      L("Problem-solving", true,
        "When I face a hard problem, I go with the first solution that comes to mind.",
        "When facing a hard problem, {name} goes with the first solution that comes to mind."),
      L("Vision", false,
        "I can explain in a few sentences where my team or work should be heading, and why.",
        "{name} can explain in a few sentences where their team or work should be heading, and why."),
      L("Knowledge application", false,
        "Within a week or two of learning something useful, I change how I work because of it.",
        "Within a week or two of learning something useful, {name} changes how they work because of it."),
    ],
    sjt: [
      {
        skill: "Problem-solving",
        scenario:
          "Customer complaints about late deliveries have risen for three months. Each time, your team apologises and sends a voucher.",
        options: [
          o("Increase the value of the voucher to keep customers happy.", 1, "Treats the symptom and raises the cost."),
          o("Map where delays happen across the whole process, test a small change on the biggest cause, and track the results.", 4, "Best: root cause, small test, evidence."),
          o("Ask the team to work harder on deliveries.", 1, "Effort is rarely the root cause of a process problem."),
          o("Hire an extra driver.", 2, "Might help, but it is a guess until you know where the delay happens."),
        ],
      },
      {
        skill: "Strategic thinking",
        scenario:
          "Your organisation's main product is still profitable, but a new mobile-based competitor is growing fast among younger customers.",
        options: [
          o("Carry on as normal. Your customers are loyal.", 1, "Ignores a clear signal about where the market is going."),
          o("Copy the competitor's product as fast as possible.", 2, "Reacts quickly but without understanding what customers value."),
          o("Find out what those customers value, run a small experiment to test a response, and set out a one-to-three-year view of the market.", 4, "Best: learns, tests and thinks ahead."),
          o("Cut prices to protect market share.", 2, "May buy time but erodes margin without addressing the shift."),
        ],
      },
    ],
  },

  emotional: {
    likert: [
      L("Emotional intelligence", false,
        "I notice my emotions as they rise and can name them before I react.",
        "{name} notices their emotions as they rise and stays composed before reacting."),
      L("Emotional intelligence", true,
        "When I am stressed, I snap at people and regret it later.",
        "When stressed, {name} snaps at people."),
      L("Empathy", false,
        "When someone disagrees with me, I can explain their point of view in a way they would accept.",
        "When someone disagrees with {name}, {name} can explain that person's point of view fairly."),
      L("Empathy", true,
        "I get so focused on the task that I miss how the people around me are feeling.",
        "{name} gets so focused on the task that they miss how the people around them are feeling."),
      L("Social relationships", false,
        "I make time to build relationships with people beyond my immediate team.",
        "{name} makes time to build relationships with people beyond their immediate team."),
      L("Motivation", false,
        "After a setback on important work, I keep going without needing outside pressure.",
        "After a setback on important work, {name} keeps going without needing outside pressure."),
      L("Inspiration", false,
        "I help others see how their work contributes to something that matters.",
        "{name} helps others see how their work contributes to something that matters."),
    ],
    sjt: [
      {
        skill: "Emotional intelligence",
        scenario:
          "A usually reliable team member snaps at a colleague in a meeting, then goes quiet for the rest of it.",
        options: [
          o("Call out the behaviour in front of the team so that standards are clear.", 1, "Public correction usually escalates and shames."),
          o("Let it go. Everyone has a bad day.", 2, "Kind, but misses a signal and leaves the colleague unsupported."),
          o("After the meeting, check in privately: say what you noticed, ask how they are, and listen before discussing the effect on the colleague.", 4, "Best: curiosity first, then accountability, in private."),
          o("Report it to HR.", 1, "Escalates a one-off before any conversation has happened."),
        ],
      },
      {
        skill: "Motivation",
        scenario:
          "After months of effort, your team has just missed an important target. Morale is low.",
        options: [
          o("Tell the team you are disappointed and expect better next quarter.", 1, "Adds pressure without learning or support."),
          o("Acknowledge the effort and the disappointment, work out together what got in the way, and agree one or two realistic next steps.", 4, "Best: honest about feelings, focused on learning and the next step."),
          o("Move straight on to the next target to keep momentum.", 2, "Keeps moving but skips the learning and the feelings."),
          o("Organise a team lunch to lift spirits, without discussing the result.", 2, "Builds connection but avoids the conversation the team needs."),
        ],
      },
    ],
  },

  physical: {
    likert: [
      L("Physical health", false,
        "I keep up routine health check-ups and act on professional advice when something feels wrong.",
        "{name} looks after their health and takes time off to recover when they are unwell."),
      L("Energy management", false,
        "I plan demanding work for the times of day when my energy is best.",
        "{name} plans demanding work for the times of day when they are at their best."),
      L("Energy management", true,
        "I work through long stretches without breaks until I am exhausted.",
        "{name} works through long stretches without breaks until they are exhausted."),
      L("Fitness", false,
        "Most days, I include some physical activity that suits my body and circumstances.",
        "{name} makes time for physical activity that suits them."),
      L("Nutrition", false,
        "On busy days, I still make time for regular meals and water.",
        "On busy days, {name} still makes time for regular breaks to eat and drink."),
      L("Bodily resilience", false,
        "After a very demanding period, I deliberately recover (sleep, rest, time outdoors) before the next push.",
        "After a very demanding period, {name} deliberately recovers before the next push."),
      L("Bodily resilience", true,
        "I cut back on sleep to fit more work in.",
        "{name} cuts back on sleep to fit more work in (for example, late-night messages)."),
    ],
    sjt: [
      {
        skill: "Energy management",
        scenario:
          "You have three weeks of heavy deadlines ahead. In the past, periods like this left you exhausted and short-tempered.",
        options: [
          o("Push through. You can rest when it is over.", 1, "Repeats the pattern that left you exhausted last time."),
          o("Plan the weeks with set breaks, protected sleep and short movement breaks, and tell your team which deadlines come first.", 4, "Best: protects energy and sets clear priorities."),
          o("Cancel all exercise and personal commitments until it is over.", 1, "Removes the very things that sustain you."),
          o("Plan a long weekend once the deadlines are over.", 2, "Recovery helps, but only after the strain."),
        ],
      },
      {
        skill: "Physical health",
        scenario:
          "For a few weeks you have felt unusually tired and had headaches most afternoons. You are very busy.",
        options: [
          o("Ignore it until things quieten down.", 1, "Delays help for something that may need attention."),
          o("Book a check-up with a health professional and, in the meantime, look at your sleep, water, meals and breaks.", 4, "Best: get professional advice and look after the basics."),
          o("Search online and treat it yourself.", 2, "Online information is no substitute for a professional's advice."),
          o("Ask a colleague whether they feel the same.", 1, "Doesn't get you the advice you need."),
        ],
      },
    ],
  },

  spiritual: {
    likert: [
      L("Purpose", false,
        "I can say what I am trying to contribute through my work and life.",
        "{name} can say what they are trying to contribute through their work."),
      L("Purpose", true,
        "My work feels like going through the motions, with no larger point.",
        "{name} seems to be going through the motions at work, with no larger point."),
      L("Meaning", false,
        "I connect everyday tasks to the people or causes they ultimately serve.",
        "{name} connects everyday tasks to the people or causes they ultimately serve."),
      L("Faith", false,
        "When things are hard, I draw strength from my faith, beliefs or deeply held values.",
        "When things are hard, {name} stays anchored in their values."),
      L("Transcendence", false,
        "I make decisions with people beyond myself in mind, such as my community or future generations.",
        "{name} makes decisions with people beyond themselves in mind, such as the community or future generations."),
      L("Spiritual intelligence", false,
        "I take regular time for reflection, prayer, meditation or quiet thought about how I am living.",
        "{name} takes time to reflect and learn from experience."),
      L("Spiritual intelligence", true,
        "I get so busy that I lose sight of what matters most to me.",
        "{name} gets so busy that they lose sight of what matters most."),
    ],
    sjt: [
      {
        skill: "Meaning",
        scenario:
          "A team member tells you their work feels pointless: \"I just process forms all day.\"",
        options: [
          o("Tell them every job has boring parts.", 1, "True, but dismissive."),
          o("Help them trace how their work affects real people (for example, a family whose claim is paid on time) and ask which part of the work matters most to them.", 4, "Best: connects tasks to the people they serve and listens."),
          o("Offer them a different role straight away.", 2, "May help later, but skips the conversation about meaning."),
          o("Suggest they find meaning outside work instead.", 2, "Gives up on meaning at work, where they spend much of their time."),
        ],
      },
      {
        skill: "Faith",
        scenario:
          "Your team includes people of different faiths and some with no religious belief. A colleague suggests opening every team meeting with a prayer from their own tradition.",
        options: [
          o("Agree. Most of the team share that faith.", 1, "Leaves out colleagues of other faiths or none."),
          o("Refuse and ban any mention of faith at work.", 1, "Shuts down something that matters deeply to many people."),
          o("Thank them, and agree an inclusive option with the team, such as a moment of quiet reflection that people can use in their own way, with no pressure to take part.", 4, "Best: honours faith and respects everyone, including those with no faith."),
          o("Leave it to the colleague to decide.", 2, "Avoids the leadership question and may exclude people."),
        ],
      },
    ],
  },
};

/* ========================================================================== */
/* TEENS (programme id "adolescents")                                          */
/* ========================================================================== */

const TEENS: Record<ConstructId, FaceBank> = {
  choices: {
    likert: [
      L("Decision-making under pressure", false,
        "Before a big choice, I think about at least two options and what could happen with each.",
        "Before a big choice, {name} thinks about more than one option and what could happen."),
      L("Decision-making under pressure", true,
        "I let my friends make my choices for me.",
        "{name} lets friends make their choices for them."),
      L("Personal values", false,
        "When friends pressure me, I stick with what I believe is right.",
        "When friends pressure {name}, they stick with what they believe is right."),
      L("Judgement online & offline", false,
        "Before I share or post something, I check whether it is true and who it could hurt.",
        "Before sharing or posting something, {name} checks whether it is true and who it could hurt."),
      L("Healthy risk-taking", false,
        "I try things that stretch me, like a new subject, sport or role, even if I might fail at first.",
        "{name} tries things that stretch them, even if they might fail at first."),
      L("Healthy risk-taking", true,
        "I do risky things to impress people, without thinking about what could go wrong.",
        "{name} does risky things to impress people, without thinking about what could go wrong."),
    ],
    sjt: [
      {
        skill: "Decision-making under pressure",
        scenario:
          "It's Friday night. Your friends are going to a party at a house where you don't know anyone and no adults will be home. You have a sports final early tomorrow, and you told your family you'd be home by 10.",
        options: [
          o("Go and stay as late as everyone else. You can still play tomorrow.", 1, "Breaks your word and puts your safety and the final at risk."),
          o("Tell your friends you'll skip this one because of the final, and suggest doing something together after the game.", 4, "Best: keeps your word and your friendships."),
          o("Go for a short while without telling your family where you are.", 1, "No one who cares about you knows where you are."),
          o("Make up an excuse so you don't have to explain.", 2, "Avoids the party, but you didn't stand by your real reason."),
        ],
      },
      {
        skill: "Judgement online & offline",
        scenario:
          "Someone in your class group chat shares an embarrassing photo of another learner and asks everyone to forward it.",
        options: [
          o("Forward it. Everyone else is.", 1, "Spreads harm, and sharing images of others without consent can break the law."),
          o("Don't forward it, and ignore the chat.", 2, "You didn't add harm, but the photo keeps spreading."),
          o("Don't forward it, say in the group that it's not okay, and tell a trusted adult or teacher so it can be taken down.", 4, "Best: stops the harm and gets help."),
          o("Leave the group chat.", 2, "Protects you, but doesn't help the learner in the photo."),
        ],
      },
      {
        skill: "Healthy risk-taking",
        scenario:
          "Your teacher asks for volunteers to represent your class in a debate. You're interested, but nervous about speaking in front of people.",
        options: [
          o("Say nothing. Someone else will do it.", 1, "Misses a chance to grow."),
          o("Volunteer, and prepare by practising with a friend or family member first.", 4, "Best: a healthy risk with preparation."),
          o("Volunteer but don't prepare. You work best under pressure.", 2, "Brave, but skipping preparation makes a bad experience more likely."),
          o("Offer to do the research for the team instead of speaking.", 3, "A good step that still stretches you a little."),
        ],
      },
    ],
  },

  principles: {
    likert: [
      L("Integrity & trust", false,
        "I keep my promises, even small ones.",
        "{name} keeps their promises, even small ones."),
      L("Integrity & trust", true,
        "I copy work or cheat when I think I can get away with it.",
        "{name} copies work or cheats when they think they can get away with it."),
      L("Reading the room", false,
        "I notice how the people around me are feeling and adjust what I say or do.",
        "{name} notices how people around them are feeling and adjusts what they say or do."),
      L("Situational judgement", false,
        "When a situation is tricky, I think about what is fair to everyone before I act.",
        "When a situation is tricky, {name} thinks about what is fair to everyone before acting."),
      L("Accountability", false,
        "I own up when I've broken a rule or let someone down, and I try to put it right.",
        "{name} owns up when they've broken a rule or let someone down, and tries to put it right."),
      L("Accountability", true,
        "When I make a mistake, I blame someone or something else.",
        "When {name} makes a mistake, they blame someone or something else."),
    ],
    sjt: [
      {
        skill: "Integrity & trust",
        scenario:
          "During a test, you notice the learner next to you has answers written on their hand. They see you looking and whisper, \"Please don't tell.\"",
        options: [
          o("Copy a few answers, since they're right there.", 1, "Now two people are cheating."),
          o("Keep your eyes on your own work, and afterwards encourage your classmate to own up, or speak to the teacher privately.", 4, "Best: your integrity stays intact and you handle it calmly."),
          o("Tell the teacher loudly during the test.", 2, "Honest, but humiliating and disruptive for everyone."),
          o("Ignore it. It's not your problem.", 2, "You stayed honest, but unfairness to the class continues."),
        ],
      },
      {
        skill: "Reading the room",
        scenario:
          "Your friends are joking loudly about another learner's accent. That learner is sitting nearby and looks upset.",
        options: [
          o("Laugh along so you're not left out.", 1, "Adds to the hurt."),
          o("Say \"Guys, not cool\" and change the subject, then check in with the learner later.", 4, "Best: stops it and shows care."),
          o("Walk away.", 2, "You didn't join in, but the learner is still being hurt."),
          o("Tell the learner to just ignore them.", 2, "Puts the problem on the person being hurt."),
        ],
      },
      {
        skill: "Accountability",
        scenario:
          "You borrowed a friend's calculator and lost it. They haven't asked for it back yet.",
        options: [
          o("Wait and hope they forget.", 1, "Avoids the problem and damages trust."),
          o("Tell them straight away, apologise, and offer to replace it or agree a fair plan.", 4, "Best: honest and takes responsibility."),
          o("Say someone took it from your bag.", 1, "A lie that shifts blame."),
          o("Tell them only if they ask.", 2, "Honest if asked, but not taking ownership."),
        ],
      },
    ],
  },

  mental: {
    likert: [
      L("Strategic thinking", false,
        "I plan ahead for tests and projects instead of leaving them to the last minute.",
        "{name} plans ahead for tests and projects instead of leaving them to the last minute."),
      L("Problem-solving", false,
        "When I'm stuck, I break the problem into smaller steps or try a different approach.",
        "When stuck, {name} breaks the problem into smaller steps or tries a different approach."),
      L("Problem-solving", true,
        "When something is hard, I give up quickly.",
        "When something is hard, {name} gives up quickly."),
      L("Vision for your future", false,
        "I have an idea of what I want for my future and some steps to get there.",
        "{name} has an idea of what they want for their future and some steps to get there."),
      L("Vision for your future", true,
        "I only think about today, and ignore how my choices now affect my future.",
        "{name} only thinks about today, and ignores how choices now affect their future."),
      L("Applying knowledge", false,
        "I use what I learn in class in real life, for example with money, sport or helping at home.",
        "{name} uses what they learn in class in real life."),
    ],
    sjt: [
      {
        skill: "Problem-solving",
        scenario:
          "You've failed two maths tests in a row, even though you studied the night before each one.",
        options: [
          o("Decide you're just not a maths person.", 1, "A fixed label stops you trying new approaches."),
          o("Study for longer the night before the next test.", 2, "More of the same approach that hasn't worked."),
          o("Look at which questions you got wrong, ask your teacher or a friend to explain one topic, and practise a little every day before the next test.", 4, "Best: find the real gap and use spaced practice."),
          o("Copy a friend's homework so your marks go up.", 1, "Marks may rise for a while, but you still can't do the maths."),
        ],
      },
      {
        skill: "Vision for your future",
        scenario:
          "You need to choose subjects for next year, and your friends are all choosing the same ones.",
        options: [
          o("Choose the same subjects so you stay together.", 1, "Your future is decided by someone else's choices."),
          o("Think about what you enjoy, what you're good at and which future paths interest you, then talk to a teacher or family member before choosing.", 4, "Best: a thought-through choice with good advice."),
          o("Choose the subjects that sound easiest.", 2, "Easy now may close doors later."),
          o("Let your family decide for you.", 2, "Their advice matters, but your own view counts too."),
        ],
      },
    ],
  },

  emotional: {
    likert: [
      L("Emotional intelligence", false,
        "I can name what I am feeling, for example angry, worried or excited.",
        "{name} can talk about how they are feeling."),
      L("Emotional intelligence", true,
        "When I'm upset, I say or post things I regret later.",
        "When upset, {name} says or posts things they regret later."),
      L("Empathy", false,
        "I try to understand how others feel, even when I don't agree with them.",
        "{name} tries to understand how others feel, even when they don't agree."),
      L("Relationships & peer influence", false,
        "I choose friends who are good for me and treat me well.",
        "{name} chooses friends who are a good influence."),
      L("Relationships & peer influence", true,
        "I go along with it when people in my group are unkind to someone.",
        "{name} goes along with it when people in their group are unkind to someone."),
      L("Motivation & confidence", false,
        "I keep working towards my goals, even when it is hard.",
        "{name} keeps working towards their goals, even when it is hard."),
    ],
    sjt: [
      {
        skill: "Empathy",
        scenario:
          "For a week, your friend has been quiet and withdrawn. When you ask, they say \"I'm fine.\"",
        options: [
          o("Leave them alone. They said they're fine.", 2, "Respects their words but may miss that they need support."),
          o("Tell them to cheer up.", 1, "Dismisses what they might be feeling."),
          o("Let them know you've noticed, that you care and that you're there if they want to talk. If you're worried about their safety, tell a trusted adult.", 4, "Best: caring, patient and safe."),
          o("Tell others in the group that something is wrong with them.", 1, "Breaks trust and can embarrass them."),
        ],
      },
      {
        skill: "Motivation & confidence",
        scenario:
          "You didn't get picked for the team you really wanted to be in.",
        options: [
          o("Quit the sport altogether.", 1, "One setback ends something you love."),
          o("Let yourself feel disappointed, then ask the coach what to work on and make a practice plan.", 4, "Best: feel it, learn from it, keep going."),
          o("Tell everyone the coach is unfair.", 1, "Blaming doesn't help you improve."),
          o("Pretend you don't care.", 2, "Protects you for now but hides what matters to you."),
        ],
      },
    ],
  },

  physical: {
    likert: [
      L("Health & energy", false,
        "I get enough sleep on school nights to feel rested.",
        "{name} seems rested and ready for the day."),
      L("Health & energy", true,
        "I stay up late on my phone or other screens even when I'm tired.",
        "{name} stays up late on screens even when tired."),
      L("Fitness habits", false,
        "Most days, I'm physically active in a way that suits me, like walking, sport, dancing or playing.",
        "{name} is physically active most days, in a way that suits them."),
      L("Stress & recovery", false,
        "When I feel stressed, I do something that helps me calm down, like moving, breathing slowly or talking to someone.",
        "When stressed, {name} does something that helps them calm down."),
      L("Resilience under load", false,
        "In busy weeks, like exams, I keep up regular meals, water and some rest.",
        "In busy weeks, {name} keeps up healthy routines like regular meals and rest."),
      L("Resilience under load", true,
        "When things get busy, I drop the habits that keep me healthy.",
        "When things get busy, {name} drops the habits that keep them healthy."),
    ],
    sjt: [
      {
        skill: "Resilience under load",
        scenario:
          "Exams start in two weeks. You've been studying until 1 a.m. and feel exhausted at school.",
        options: [
          o("Keep going. Sleep can wait until after exams.", 1, "Tiredness makes learning and remembering harder."),
          o("Make a study timetable that includes enough sleep, short breaks and some movement.", 4, "Best: rested brains learn and remember better."),
          o("Use energy drinks to stay awake longer.", 1, "Masks tiredness instead of fixing it."),
          o("Stop studying for a few days to rest.", 2, "Rest helps, but stopping completely adds pressure later."),
        ],
      },
      {
        skill: "Health & energy",
        scenario:
          "You hurt your ankle at practice. It's sore and swollen, and there's a match on Saturday.",
        options: [
          o("Play anyway. The team needs you.", 1, "Could make the injury worse."),
          o("Tell your coach and a parent or guardian, get it checked by a health professional, and follow their advice about playing.", 4, "Best: get proper advice and let the adults responsible for you know."),
          o("Look up a fix online and strap it yourself.", 2, "Online tips are no substitute for a professional."),
          o("Rest it for a day, then play.", 2, "Rest helps, but you still don't know how bad it is."),
        ],
      },
    ],
  },

  spiritual: {
    likert: [
      L("Purpose & identity", false,
        "I know what matters most to me.",
        "{name} seems to know what matters most to them."),
      L("Purpose & identity", true,
        "I act against my values just to fit in.",
        "{name} acts against their values just to fit in."),
      L("Meaning", false,
        "I spend some time reflecting on my life in a way that suits me, such as prayer, quiet time, journaling or time in nature.",
        "{name} takes time to reflect on their life and choices."),
      L("Meaning", true,
        "Most days, what I do feels pointless.",
        "{name} seems to feel that what they do is pointless."),
      L("Beliefs & belonging", false,
        "I belong to a family, community, faith or group that gives me strength.",
        "{name} has a family, community, faith or group that gives them strength."),
      L("Transcendent goals", false,
        "I want to make a positive difference to other people or my community, and I do something about it.",
        "{name} makes a positive difference to other people or the community."),
    ],
    sjt: [
      {
        skill: "Transcendent goals",
        scenario:
          "Your class is planning a community project. Some classmates just want to do the easiest thing to get the marks.",
        options: [
          o("Go with the easiest option.", 2, "Gets the marks, but may not help anyone."),
          o("Suggest asking the community what they actually need, and choosing a project that helps and that the group can manage.", 4, "Best: real contribution that is also achievable."),
          o("Do the project alone, your way.", 1, "Loses the team and the learning."),
          o("Let the teacher choose.", 2, "Avoids conflict but gives up your voice."),
        ],
      },
      {
        skill: "Beliefs & belonging",
        scenario:
          "A new learner joins your class. They follow a different faith from most of the class, and some learners make jokes about it.",
        options: [
          o("Join in the jokes.", 1, "Makes them feel they don't belong."),
          o("Stay out of it.", 2, "You didn't add to it, but they are still left alone."),
          o("Make the new learner feel welcome, and ask the others to respect their beliefs.", 4, "Best: belonging and respect for every faith, or none."),
          o("Ask the new learner to explain their religion to the class.", 2, "Well meant, but puts them on the spot."),
        ],
      },
    ],
  },
};

/* ========================================================================== */
/* KIDS                                                                        */
/* ========================================================================== */

const KIDS: Record<ConstructId, FaceBank> = {
  choices: {
    likert: [
      L("Making good decisions", false, "I stop and think before I choose what to do.", "{name} stops and thinks before choosing what to do."),
      L("Making good decisions", false, "When I have two choices, I think about what will happen with each one.", "When {name} has two choices, they think about what will happen with each one."),
      L("Knowing right from wrong", false, "I choose the right thing, even when it is hard.", "{name} chooses the right thing, even when it is hard."),
      L("Thinking before acting", false, "I can say why I made a choice.", "{name} can say why they made a choice."),
      L("Thinking before acting", true, "I do things without thinking and then get into trouble.", "{name} does things without thinking and then gets into trouble."),
      L("Trying bravely", false, "I try new things, even if I feel a bit scared.", "{name} tries new things, even if they feel a bit scared."),
    ],
    sjt: [
      {
        skill: "Making good decisions",
        scenario: "Your friend wants you to play outside. But you said you would finish your homework first.",
        options: [
          o("Go and play and forget the homework.", 1, "You broke your promise."),
          o("Finish your homework, then go and play.", 4, "Great choice! You kept your promise and still get to play."),
          o("Play first and do homework later, even if it gets late.", 2, "You might run out of time or be too tired."),
        ],
      },
      {
        skill: "Trying bravely",
        scenario: "Your teacher asks who wants to read aloud to the class. You want to, but you feel shy.",
        options: [
          o("Hide so the teacher doesn't see you.", 1, "You miss a chance to grow."),
          o("Put up your hand and give it a try.", 4, "Brave! Trying is how we get better."),
          o("Ask if you can practise first and read next time.", 3, "A good plan. Getting ready is brave too."),
        ],
      },
    ],
  },
  principles: {
    likert: [
      L("Being honest", false, "I tell the truth, even when I made a mistake.", "{name} tells the truth, even after making a mistake."),
      L("Understanding others", false, "I think about how others feel when I play or work with them.", "{name} thinks about how others feel when playing or working with them."),
      L("Fair play", false, "I take turns and play fair.", "{name} takes turns and plays fair."),
      L("Fair play", true, "I change the rules of a game so that I win.", "{name} changes the rules of a game so that they win."),
      L("Keeping promises", false, "I keep my promises.", "{name} keeps their promises."),
      L("Keeping promises", false, "I say sorry when I hurt someone, and I try to fix it.", "{name} says sorry when they hurt someone, and tries to fix it."),
    ],
    sjt: [
      {
        skill: "Being honest",
        scenario: "You break your friend's pencil by accident. Nobody saw.",
        options: [
          o("Put it back and say nothing.", 1, "Your friend will find a broken pencil and not know why."),
          o("Tell your friend, say sorry and offer to share your pencil.", 4, "Honest and kind. That's how trust grows."),
          o("Say someone else did it.", 1, "Now someone else gets blamed."),
        ],
      },
      {
        skill: "Fair play",
        scenario: "In a game at break, you see that your team scored by cheating.",
        options: [
          o("Keep quiet because your team is winning.", 1, "Winning by cheating isn't really winning."),
          o("Tell your team it's not fair and play that point again.", 4, "Fair play! Everyone can enjoy the game."),
          o("Run and tell the teacher straight away.", 3, "Honest. Talking to your team first can fix it faster."),
        ],
      },
    ],
  },
  mental: {
    likert: [
      L("Curious thinking", false, "I ask questions about things I want to understand.", "{name} asks questions about things they want to understand."),
      L("Solving puzzles", false, "When something is hard, I try a different way.", "When something is hard, {name} tries a different way."),
      L("Solving puzzles", true, "I give up when something is hard.", "{name} gives up when something is hard."),
      L("Big ideas", false, "I like to think up new ideas.", "{name} likes to think up new ideas."),
      L("Learning new things", false, "I use what I learn at school to help me at home or when I play.", "{name} uses what they learn at school at home or when playing."),
      L("Learning new things", false, "I keep practising until I get better at something.", "{name} keeps practising until they get better at something."),
    ],
    sjt: [
      {
        skill: "Solving puzzles",
        scenario: "You're building a tower with blocks, and it keeps falling down.",
        options: [
          o("Give up and do something else.", 1, "You won't find out how to make it stand."),
          o("Look at why it falls, and try making the bottom wider.", 4, "Smart thinking! Finding the reason helps you fix it."),
          o("Ask someone else to build it for you.", 2, "Asking for help is fine, but try to learn how too."),
        ],
      },
      {
        skill: "Learning new things",
        scenario: "You get a sum wrong in your homework.",
        options: [
          o("Copy a friend's answer.", 1, "Then you won't learn how to do it."),
          o("Look at where it went wrong and try again, or ask your teacher to show you.", 4, "Great! Mistakes help you learn."),
          o("Leave it and hope nobody notices.", 2, "It's better to find out what went wrong."),
        ],
      },
    ],
  },
  emotional: {
    likert: [
      L("Naming feelings", false, "I can say how I feel (happy, sad, angry or scared).", "{name} can say how they feel."),
      L("Kindness", false, "I am kind to others, even when they are not my friends.", "{name} is kind to others, even when they are not friends."),
      L("Kindness", false, "I notice when someone is sad, and I try to help.", "{name} notices when someone is sad and tries to help."),
      L("Friends & family", false, "I help my family and friends.", "{name} helps family and friends."),
      L("Staying calm", false, "When I am upset, I can calm down, for example by breathing slowly or asking for help.", "When upset, {name} can calm down or ask for help."),
      L("Staying calm", true, "When I am angry, I shout or throw things.", "When angry, {name} shouts or throws things."),
    ],
    sjt: [
      {
        skill: "Kindness",
        scenario: "A child in your class is sitting alone at break and looks sad.",
        options: [
          o("Leave them alone.", 2, "Maybe they want space, but they may feel lonely."),
          o("Ask them to join you, or tell a teacher if they seem very upset.", 4, "Kind and caring!"),
          o("Laugh about it with your friends.", 1, "That would hurt their feelings even more."),
        ],
      },
      {
        skill: "Staying calm",
        scenario: "Someone knocks over the picture you were drawing, and you feel very angry.",
        options: [
          o("Push them.", 1, "Pushing can hurt someone and makes things worse."),
          o("Take a few slow breaths, then say, \"I feel cross. Please be careful.\"", 4, "Well done! You calmed down and used your words."),
          o("Walk away and tell a grown-up how you feel.", 3, "Good choice. Getting help is a smart way to calm down."),
        ],
      },
    ],
  },
  physical: {
    likert: [
      L("Moving your body", false, "I play or move my body every day.", "{name} plays or moves every day."),
      L("Rest & energy", false, "I go to bed on time so I feel ready for the next day.", "{name} seems rested and ready for the day."),
      L("Rest & energy", true, "I stay up late watching screens.", "{name} stays up late watching screens."),
      L("Healthy food", false, "I drink water during the day.", "{name} drinks water during the day."),
      L("Healthy food", false, "I try different healthy foods, like fruit and vegetables.", "{name} tries different healthy foods."),
      L("Feeling strong", false, "When I feel tired or sore, I tell a grown-up or take a rest.", "When tired or sore, {name} tells a grown-up or takes a rest."),
    ],
    sjt: [
      {
        skill: "Rest & energy",
        scenario: "You feel very tired at school because you went to bed late.",
        options: [
          o("Tonight, go to bed on time.", 4, "Good plan! Sleep gives you energy for tomorrow."),
          o("Eat lots of sweets to get energy.", 1, "Sweets don't fix being tired."),
          o("Say nothing and stay up late again tonight.", 1, "You'll feel tired again tomorrow."),
        ],
      },
      {
        skill: "Moving your body",
        scenario: "It's a rainy day and you can't play outside.",
        options: [
          o("Watch screens all afternoon.", 1, "Your body needs to move every day."),
          o("Dance, stretch or play an active game inside, with a grown-up's OK.", 4, "Great! You found a way to keep moving."),
          o("Sit and wait for the rain to stop.", 2, "Waiting is fine for a bit, but moving helps you feel good."),
        ],
      },
    ],
  },
  spiritual: {
    likert: [
      L("What matters to me", false, "I know what is important to me.", "{name} knows what is important to them."),
      L("Hope & wonder", false, "I feel wonder at nature and the world around me.", "{name} shows wonder at nature and the world."),
      L("Hope & wonder", false, "I have quiet time to think, pray or be calm, in my own way.", "{name} has quiet time to think or be calm."),
      L("Belonging", false, "I feel that I belong in my family, class or community.", "{name} seems to feel they belong."),
      L("Helping others", false, "I help other people without being asked.", "{name} helps other people without being asked."),
      L("Helping others", true, "I only help when I get something back.", "{name} only helps when they get something back."),
    ],
    sjt: [
      {
        skill: "Helping others",
        scenario: "Your class is collecting food for families who need help.",
        options: [
          o("Bring something to share if your family can, or help pack the boxes.", 4, "Kind! Everyone can help in some way."),
          o("Say it's not your problem.", 1, "Helping others makes our community stronger."),
          o("Wait and see what your friends do.", 2, "You can decide to help yourself."),
        ],
      },
      {
        skill: "Belonging",
        scenario: "A new child joins your class. They don't know anyone yet.",
        options: [
          o("Say hello, tell them your name and show them where things are.", 4, "Kind! You helped them feel they belong."),
          o("Wait for them to talk to you first.", 2, "They may feel too shy to start."),
          o("Tell your friends not to play with them.", 1, "That would make them feel left out and sad."),
        ],
      },
    ],
  },
};

export const V2_BANK: Record<ProgrammeId, Record<ConstructId, FaceBank>> = {
  adults: ADULTS,
  adolescents: TEENS,
  kids: KIDS,
};

/** Frequency scale for v2 Likert items (1..5). */
export const V2_SCALE: Record<ProgrammeId, readonly string[]> = {
  adults: ["Never", "Rarely", "Sometimes", "Often", "Almost always"],
  adolescents: ["Never", "Rarely", "Sometimes", "Often", "Almost always"],
  kids: ["Never", "Not often", "Sometimes", "Often", "Always"],
};

/** Observer scale adds "Don't know" (stored as 0 and not scored). */
export const OBSERVER_DONT_KNOW = "I haven't seen this";

/** Weight of the SJT part in a face score when a face has both parts. */
export const SJT_WEIGHT = 0.3;

/** Instructions shown before SJTs. */
export const SJT_INSTRUCTIONS: Record<ProgrammeId, string> = {
  adults: "Read each situation and choose the response you think is MOST effective. There is no trick: pick what would work best.",
  adolescents: "Read each situation and choose what you think is the BEST thing to do.",
  kids: "Read the story (or ask a grown-up to read it with you). Choose what you think is the best thing to do.",
};

/** Honesty (validity) item, scored separately and never part of a face score. */
export const HONESTY_ITEM: Record<ProgrammeId, { prompt: string; labels: readonly string[] }> = {
  adults: {
    prompt: "Last one: how much did your answers describe what you actually do, rather than what you would like to do?",
    labels: ["Not at all", "A little", "Partly", "Mostly", "Completely"],
  },
  adolescents: {
    prompt: "Last one: how honestly did you answer, describing what you really do (not what you wish you did)?",
    labels: ["Not at all", "A little", "Partly", "Mostly", "Completely"],
  },
  kids: {
    prompt: "Last one: did you answer like you really are?",
    labels: ["No", "A little", "Some of it", "Mostly", "Yes, all of it"],
  },
};
