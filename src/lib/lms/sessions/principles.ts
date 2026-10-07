import type { FaceContent } from "./types";

export const PRINCIPLES: FaceContent = {
  overview: {
    hook: {
      adults: "People rarely remember a leader's strategy deck. They remember whether that leader was fair, honest and kept their word.",
      adolescents: "Who do you trust most, and why? Usually it's not the most popular person. It's the one who is the same when nobody is watching.",
      kids: "Who is someone you trust? What do they do that makes you feel safe with them?",
    },
    core: `**Principles** is the bedrock of trustworthy leadership: acting on clear ethical standards, reading the context you're in, judging what each situation needs, and building structures that keep everyone honest.

Super-Cube® groups this into four skills: **ethical foundations**, **contextual awareness**, **situational judgement** and **governance**. The model also names everyday character strengths that bring ethics to life, including honesty, integrity, kindness, patience, fairness, self-control, gratefulness, forgiveness and a commitment to keep improving.

A useful question for any situation: *"What would a fair, honest person do here, given everything I know about this context?"*`,
    coreKids: `**Principles** are the rules you live by, like **being honest**, **being fair** and **keeping promises**.

When you live by good principles, people know they can trust you.`,
    example: {
      title: "Archbishop Desmond Tutu and the Truth and Reconciliation Commission",
      body: "After apartheid ended, South Africa set up the Truth and Reconciliation Commission (TRC), chaired by Archbishop Desmond Tutu, which began work in 1996. It heard testimony from victims and perpetrators of human rights violations. Its principles of telling the truth, acknowledging harm and seeking restoration were applied in a deeply painful context. People still debate its outcomes, but it remains a widely studied example of a nation choosing an explicit ethical framework for a very hard situation.",
      source: "Truth and Reconciliation Commission of South Africa Report (1998).",
    },
    exampleKids: {
      title: "The trusty class monitor",
      body: "Lerato was chosen as class monitor. One day her best friend talked during quiet time. Lerato reminded her kindly, just like she would remind anyone else. Her friend was a bit grumpy, but later said, \"You're fair to everyone. That's why we chose you.\"",
    },
    reflect: {
      adults: "Which principle do you hold most strongly? Which one is most likely to slip when you're busy?",
      adolescents: "Think of someone you trust completely. What principles do you see in how they act?",
      kids: "What is one rule you always try to follow?",
    },
    practice: {
      adults: "Write a one-sentence personal leadership principle (for example: \"I tell people the truth early, even when it's uncomfortable\"). Share it with one colleague and ask them to hold you to it.",
      adolescents: "Write three \"I will always…\" statements. Keep them on your phone lock screen for a week.",
      kids: "Make a \"my promise\" card with one promise you will keep this week.",
    },
    ifThen: {
      adults: "If I notice I'm tempted to soften the truth to avoid discomfort, then I will say the honest version kindly within 24 hours.",
      adolescents: "If someone asks me to keep a secret that could hurt someone, then I will talk to a trusted adult.",
      kids: "If I make a promise, then I will do what I said.",
    },
    check: [
      { q: "Which four skills make up the Principles face?", options: ["Speed, profit, growth, control", "Ethical foundations, contextual awareness, situational judgement, governance", "Fitness, nutrition, rest, energy", "Purpose, meaning, faith, transcendence"], answer: 1, why: "These four skills together build trustworthy, principled leadership." },
      { q: "Why does context matter for principled leadership?", options: ["Principles change with every situation", "Applying the same principles well needs an understanding of the setting", "It doesn't matter", "So you can make exceptions for friends"], answer: 1, why: "Principles stay steady; how you apply them depends on reading the context." },
      { q: "What did the TRC illustrate?", options: ["That ethics are easy", "A nation choosing an explicit ethical framework for a hard situation", "That the past should be forgotten", "That rules don't matter"], answer: 1, why: "The TRC applied explicit principles of truth and restoration in a painful context." },
    ],
    checkKids: [
      { q: "What are principles?", options: ["Rules you live by, like being honest", "Games", "Homework"], answer: 0, why: "Principles guide how you act every day." },
      { q: "Why do people trust someone who keeps promises?", options: ["Because they do what they say", "Because they are tall", "Because they are loud"], answer: 0, why: "Keeping promises shows you can be trusted." },
    ],
    journal: {
      adults: "Write about a leader you've worked with whose principles you admired. What did they do that you want to copy?",
      adolescents: "What kind of person do you want people to say you are when you're not in the room?",
      kids: "Draw someone you trust and write one word about them.",
    },
    guide: {
      adults: { discussion: ["Which of our stated organisational values are visible in everyday decisions, and which aren't?", "Where do we bend principles for convenience?"], activity: "Each person writes their one-sentence leadership principle; share in trios and give each other one example of when it will be tested.", minutes: 15 },
      adolescents: { discussion: ["What makes someone trustworthy?", "Is it ever OK to break a promise?"], activity: "Trust walk (talking version): pairs list behaviours that build trust and ones that break it, then sort them on the board.", minutes: 15 },
      kids: { discussion: ["What does fair mean?", "How do you feel when someone keeps a promise to you?"], activity: "Promise chain: each learner writes or draws a class promise on a paper strip; link them into a chain for the classroom.", minutes: 10 },
    },
  },

  slots: [
    {
      skills: { adults: "Ethical foundations", adolescents: "Integrity & trust", kids: "Being honest" },
      hook: {
        adults: "A supplier offers you an expensive \"thank you\" gift just before a tender closes. It's within the letter of the policy. Does it feel right?",
        adolescents: "You find the answers to tomorrow's test in a group chat. Half the class has seen them. What now?",
        kids: "You find R20 on the playground. Nobody saw. What would an honest person do?",
      },
      core: `**Ethical foundations** are the clear standards you return to when rules are unclear or pressure is high. Integrity literally means being *whole*: the same person in public and private.

Three tests you can use in seconds:
- **The front-page test**: would I be comfortable if this were reported fairly in the news?
- **The mirror test**: can I explain this to the people I respect most?
- **The fairness test**: would I accept this if I were on the other side?

If a choice fails any test, slow down and talk to someone you trust.`,
      coreKids: `**Being honest** means telling the truth and not taking what isn't yours.

Sometimes honesty feels scary. But the truth makes trust grow, like watering a plant.`,
      example: {
        title: "Integrity in public office",
        body: "South Africa's Constitution sets up independent \"Chapter 9\" institutions, such as the Public Protector and the Auditor-General, to support democracy. Each year the Auditor-General reports on how national, provincial and municipal bodies have used public money, and names where audits found problems. The reports depend on auditors applying the same standard to everyone, whatever the political pressure. This is ethical foundations built into an institution, not left to individual willpower.",
        source: "Constitution of the Republic of South Africa, 1996, Chapter 9; Auditor-General of South Africa public reports.",
      },
      exampleKids: {
        title: "The found money",
        body: "Kagiso found some money on the school field. He really wanted to buy sweets. But he thought, \"Someone might be sad they lost it.\" He gave it to his teacher. Later a little girl came looking for her lunch money. Kagiso felt proud.",
      },
      reflect: {
        adults: "Where in your work are the ethical lines least clear? What standard do you use there?",
        adolescents: "Is it harder to be honest with friends, family or teachers? Why?",
        kids: "How do you feel inside when you tell the truth?",
      },
      practice: {
        adults: "Run one current decision through the front-page, mirror and fairness tests. Note which test was hardest to pass.",
        adolescents: "For one week, notice every time you're tempted to tell a small lie. Count them, then try halving the number.",
        kids: "Today, tell the truth about something small, even if it's hard.",
      },
      ifThen: {
        adults: "If a choice is legal but I wouldn't want it reported, then I will pause and discuss it with someone I trust.",
        adolescents: "If I'm offered a shortcut that isn't honest, then I will say \"Not for me\" and walk away.",
        kids: "If I find something that isn't mine, then I will give it to a grown-up.",
      },
      check: [
        { q: "What does integrity mean at its root?", options: ["Being strict", "Being whole: the same in public and in private", "Being popular", "Following every order"], answer: 1, why: "Integrity comes from the idea of wholeness." },
        { q: "The front-page test asks…", options: ["Would this make me famous?", "Would I be comfortable if it were fairly reported?", "Is this on the front of the policy?", "Has it been done before?"], answer: 1, why: "Imagining fair public reporting helps you spot weak ethical choices." },
        { q: "Why do institutions like the Auditor-General matter for ethics?", options: ["They replace personal ethics", "They build ethical standards into systems, not just willpower", "They are only for accountants", "They make decisions for leaders"], answer: 1, why: "Good systems make ethical behaviour the normal path." },
      ],
      checkKids: [
        { q: "What does being honest mean?", options: ["Telling the truth", "Keeping secrets", "Winning games"], answer: 0, why: "Honesty means telling the truth." },
        { q: "What grows when you are honest?", options: ["Trust", "Your shoes", "Homework"], answer: 0, why: "People trust you more when you're honest." },
      ],
      journal: {
        adults: "Describe an ethical grey area you've faced. What helped you decide, and what would you add to your toolkit now?",
        adolescents: "Write about a time honesty was hard but worth it.",
        kids: "Draw yourself telling the truth.",
      },
      guide: {
        adults: { discussion: ["Which of our processes make the ethical choice the easy choice?", "What grey areas come up most in our roles?"], activity: "Groups get two realistic grey-area cases (gifts, conflicts of interest) and apply the three tests, then agree a team guideline.", minutes: 20 },
        adolescents: { discussion: ["Why do people cheat?", "What does trust feel like when it's broken?"], activity: "Honesty dilemmas: groups discuss three school scenarios and present the most honest workable response.", minutes: 15 },
        kids: { discussion: ["When is it hard to be honest?", "What does honesty sound like?"], activity: "Read *The Boy Who Cried Wolf* (or a local story). Discuss why the villagers stopped believing him.", minutes: 10 },
      },
    },
    {
      skills: { adults: "Contextual awareness", adolescents: "Reading the room", kids: "Understanding others" },
      hook: {
        adults: "A policy that works brilliantly in Sandton lands badly in a rural clinic. Same rule, different world. What did the policy-makers miss?",
        adolescents: "A joke that kills in your friend group falls flat with your gran. Same joke. What changed?",
        kids: "Your friend is quiet today and not smiling. What could be going on for them?",
      },
      core: `**Contextual awareness** is noticing the setting you're in (people, culture, history, power and pressure) before acting. The same principle can look different in different contexts.

Habits that build it:
- **Ask before you assume.** "How do things work here?" is a leadership question, not a weakness.
- **Notice who isn't in the room.** Whose experience is missing from this decision?
- **Avoid the single story.** One story about a group of people is never the whole picture.

In a country as diverse as South Africa, with many languages, cultures, faiths and histories, this is a core leadership skill.`,
      coreKids: `**Understanding others** means remembering that everyone has their own feelings, family and story.

Before you decide what someone is like, **ask** and **listen**.`,
      example: {
        title: "Chimamanda Ngozi Adichie, \"The danger of a single story\"",
        body: "In her widely viewed 2009 TED talk, Nigerian author Chimamanda Ngozi Adichie describes how her American university roommate assumed things about her and about Africa from a single, narrow story. Adichie also admits making the same mistake about others. Her point is that a single story creates stereotypes: \"not that they are untrue, but that they are incomplete.\" Leaders who look for many stories see context more accurately.",
        source: "Chimamanda Ngozi Adichie, \"The danger of a single story\", TEDGlobal 2009.",
      },
      exampleKids: {
        title: "The new learner",
        body: "A new boy, Pieter, joined the class. He didn't talk much, and some children thought he was unfriendly. Ayanda sat with him and asked about his old school. Pieter said he had just moved from a farm far away and missed his dog. They became friends.",
      },
      reflect: {
        adults: "Where might you be working from a \"single story\" about a team, client or community?",
        adolescents: "Think of a time someone misjudged you. What did they not know about your context?",
        kids: "Have you ever thought someone was one way, and then found out they were different?",
      },
      practice: {
        adults: "Before your next decision that affects another group, have a 15-minute conversation with someone from that group and ask: \"What would I need to understand about how this lands for you?\"",
        adolescents: "This week, ask one person whose life is different from yours a curious question about their world, and just listen.",
        kids: "Ask a classmate one question about their family or favourite thing.",
      },
      ifThen: {
        adults: "If I'm about to roll out a change to people whose context I don't know well, then I will ask two of them first.",
        adolescents: "If I'm about to judge someone quickly, then I will ask myself what I might not know about them.",
        kids: "If someone seems sad or quiet, then I will ask them if they are OK.",
      },
      check: [
        { q: "What is contextual awareness?", options: ["Knowing the rules by heart", "Noticing the setting, people and history before acting", "Avoiding new places", "Doing what the majority wants"], answer: 1, why: "Reading the context helps you apply principles well." },
        { q: "What did Adichie say is the problem with a single story?", options: ["It is always untrue", "It is incomplete", "It is too long", "It is boring"], answer: 1, why: "A single story creates stereotypes because it is incomplete." },
        { q: "Which question builds contextual awareness?", options: ["\"Why don't they just do it our way?\"", "\"How do things work here?\"", "\"Who's to blame?\"", "\"How fast can we finish?\""], answer: 1, why: "Asking how things work locally shows respect and gathers vital context." },
      ],
      checkKids: [
        { q: "What helps you understand someone?", options: ["Asking and listening", "Guessing", "Ignoring them"], answer: 0, why: "Asking and listening help you learn their story." },
        { q: "Everyone has their own…", options: ["feelings and story", "same family", "same favourite food"], answer: 0, why: "We're all different, and that's OK." },
      ],
      journal: {
        adults: "Write about a time a different context changed how you understood a problem.",
        adolescents: "What's one thing people often get wrong about people your age or from your community?",
        kids: "Write or draw something special about a friend's family.",
      },
      guide: {
        adults: { discussion: ["Whose context do we consistently overlook in our decisions?", "Where have we rolled out a \"one size fits all\" solution that didn't fit?"], activity: "Watch the first 6 minutes of Adichie's talk together. Each person names one \"single story\" they have about a stakeholder group.", minutes: 20 },
        adolescents: { discussion: ["What single stories exist about South African young people?", "How can social media create single stories?"], activity: "Identity web: each learner maps the different groups they belong to, then shares one thing others wouldn't guess.", minutes: 15 },
        kids: { discussion: ["How are we the same? How are we different?", "How can we make a new friend feel welcome?"], activity: "\"Find someone who…\" bingo (speaks another language, has a pet, likes maths) to discover classmates' stories.", minutes: 10 },
      },
    },
    {
      skills: { adults: "Situational judgement", adolescents: "Situational judgement", kids: "Fair play" },
      hook: {
        adults: "A star performer is rude to junior staff. A customer crisis needs them today. What do you do first, and what do you do next week?",
        adolescents: "Your team captain is being unfair to a younger player, but it's the final tomorrow. Do you say something now?",
        kids: "In a game, your friend keeps changing the rules so they always win. What could you do?",
      },
      core: `**Situational judgement** is choosing the *most effective* response to a real situation, one that keeps to your principles and fits the moment.

Situational-judgement thinking usually considers:
- **What's urgent and what's important**: sometimes you deal with the crisis now and the behaviour later. You still deal with it.
- **Who is affected**: think about everyone, not just the loudest or most senior.
- **Range of responses**: there is usually something between doing nothing and a dramatic reaction.

Effective leaders rarely choose the extremes. They choose the response that solves the problem *and* protects trust.`,
      coreKids: `**Fair play** means everyone gets a fair turn and the rules are the same for everybody.

If a game isn't fair, you can say calmly: **"Let's keep the same rules for everyone."**`,
      example: {
        title: "Gift of the Givers",
        body: "Gift of the Givers, founded in South Africa in 1992 by Dr Imtiaz Sooliman, has responded to disasters in South Africa and in many other countries, from droughts and floods to conflicts. Each response looks different: water tankers in one place, medical teams or food parcels in another. The organisation says it serves people regardless of race, religion or politics. The principle stays the same while the response is fitted to each situation. That is situational judgement in action.",
        source: "Gift of the Givers Foundation (giftofthegivers.org).",
      },
      exampleKids: {
        title: "Fair turns on the swing",
        body: "There was only one swing at break time, and everyone wanted a go. Naledi had an idea: \"Let's each count to 50, then swap.\" Everyone got a turn, even the youngest. The teacher said it was a very fair idea.",
      },
      reflect: {
        adults: "Do you tend to respond too softly or too strongly when someone breaks a standard? What's the cost?",
        adolescents: "When you see something unfair, do you usually speak up, stay quiet or tell someone else? Why?",
        kids: "How do you feel when a game isn't fair?",
      },
      practice: {
        adults: "Take one live people issue. Write four possible responses from soft to strong, and pick the most effective one. Act on it this week.",
        adolescents: "Next time you see something unfair, think of three possible responses before you react.",
        kids: "In your next game, help make sure everyone gets a fair turn.",
      },
      ifThen: {
        adults: "If someone's results are strong but their behaviour isn't, then I will raise the behaviour privately within a week.",
        adolescents: "If I see someone being treated unfairly, then I will check on them and decide who to tell.",
        kids: "If a game isn't fair, then I will say, \"Let's keep the same rules for everyone.\"",
      },
      check: [
        { q: "Situational judgement means choosing the…", options: ["fastest response", "most effective response that keeps to your principles", "response your boss would like", "most dramatic response"], answer: 1, why: "The goal is effectiveness and principle together." },
        { q: "If there's a crisis and a behaviour problem, a strong leader…", options: ["ignores the behaviour", "handles the crisis, then deals with the behaviour", "fires the person immediately", "waits for HR"], answer: 1, why: "Sequence matters, but the behaviour still gets addressed." },
        { q: "Effective responses are usually…", options: ["at the extremes", "somewhere between doing nothing and overreacting", "whatever's easiest", "decided by votes"], answer: 1, why: "The most effective option is often a measured middle path." },
      ],
      checkKids: [
        { q: "What is fair play?", options: ["Same rules for everyone", "Always winning", "Only playing with friends"], answer: 0, why: "Fair play means everybody gets the same chance." },
        { q: "If a game isn't fair, you can…", options: ["calmly suggest the same rules for everyone", "shout", "cheat too"], answer: 0, why: "A calm suggestion helps everyone have fun." },
      ],
      journal: {
        adults: "Write about a situation where your first instinct would have been the wrong response. What did you do instead?",
        adolescents: "Describe a time you handled something unfair well. What did you do?",
        kids: "Draw a game where everyone plays fair.",
      },
      guide: {
        adults: { discussion: ["Which behaviours do we tolerate from high performers?", "What does \"measured response\" look like in our culture?"], activity: "Response ladder: groups take a scenario and write responses from 1 (do nothing) to 5 (strongest), then agree the most effective and why.", minutes: 15 },
        adolescents: { discussion: ["What stops people speaking up about unfairness?", "When should you involve an adult?"], activity: "Role-play in trios: one learner is treated unfairly, one sees it, one observes. Try two different responses and compare.", minutes: 20 },
        kids: { discussion: ["What makes a game fun for everyone?", "How can we share fairly?"], activity: "Play a simple game where the teacher \"accidentally\" changes the rules; learners practise saying the fair-play sentence.", minutes: 10 },
      },
    },
    {
      skills: { adults: "Governance", adolescents: "Accountability", kids: "Keeping promises" },
      hook: {
        adults: "Everyone agreed the project was a priority. Six weeks later nobody owns the delay. Sound familiar?",
        adolescents: "The group assignment went badly. Everyone is blaming someone else. Who will say \"I could have done better\" first?",
        kids: "You promised to feed the class fish this week. It's Friday. Did you remember every day?",
      },
      core: `**Governance** is the set of structures that keeps power honest: clear roles, transparent decisions, checks and balances, and accountability for results. On a personal level, it means **owning what you said you'd do**.

South Africa has helped shape corporate governance thinking through the King Reports. **King V**, released in October 2025, replaces King IV. Like earlier King codes it takes an \"apply and explain\" approach, focused on ethical leadership and good outcomes rather than box-ticking.

Practical governance for any leader:
- **Clear owners**: every action has one named person and a date.
- **Transparent decisions**: write down what was decided and why.
- **Own it**: when something goes wrong, start with your part.`,
      coreKids: `**Keeping promises** means doing what you said you would do.

If you can't keep a promise, tell the person **early** and say sorry. That's being responsible.`,
      example: {
        title: "The King Reports on Corporate Governance",
        body: "Since 1994, the Institute of Directors in South Africa has published the King Reports, named after Professor Mervyn King, who chaired the committees. They set out principles for ethical, effective governance and are referred to well beyond South Africa. King V (October 2025) updates King IV for today's challenges. The core idea has stayed the same for three decades: governing bodies should lead ethically and effectively, and should be transparent about how they do it.",
        source: "Institute of Directors in South Africa (iodsa.co.za), King V Code (2025).",
      },
      exampleKids: {
        title: "The class plant",
        body: "Zinhle promised to water the class plant every morning. On Wednesday she forgot. On Thursday she told her teacher, \"I forgot yesterday, sorry. I'll set a reminder.\" She drew a little water drop on her hand each morning after that. The plant grew tall.",
      },
      reflect: {
        adults: "On your team, where is ownership unclear? What is that costing?",
        adolescents: "When something goes wrong, is your first reaction to explain, blame or own it?",
        kids: "Is there a promise you find hard to keep?",
      },
      practice: {
        adults: "At your next meeting, end with a 3-minute round of \"who does what by when\" and send it in writing within the hour.",
        adolescents: "This week, when something doesn't go to plan, start with \"My part in this was…\" before anything else.",
        kids: "Make one small promise today and keep it.",
      },
      ifThen: {
        adults: "If a meeting ends without named owners and dates, then I will ask for them before people leave.",
        adolescents: "If I let my group down, then I will say so first and offer a fix.",
        kids: "If I can't keep a promise, then I will tell the person and say sorry.",
      },
      check: [
        { q: "What does governance mean for an individual leader?", options: ["Avoiding blame", "Owning what you said you'd do and being transparent", "Having a big title", "Writing long policies"], answer: 1, why: "Personal governance is accountability and transparency." },
        { q: "Which code replaced King IV in South Africa?", options: ["King III", "King V (2025)", "The Companies Act", "No code replaced it"], answer: 1, why: "King V was released in October 2025 and replaces King IV." },
        { q: "What makes an action item clear?", options: ["A good title", "One named owner and a date", "Many people sharing it", "Being urgent"], answer: 1, why: "Shared ownership often means no ownership." },
      ],
      checkKids: [
        { q: "What does keeping a promise mean?", options: ["Doing what you said", "Forgetting", "Saying it louder"], answer: 0, why: "Keeping promises shows people they can count on you." },
        { q: "If you can't keep a promise, you should…", options: ["tell the person early and say sorry", "hide", "pretend you never promised"], answer: 0, why: "Telling the truth early is responsible and kind." },
      ],
      journal: {
        adults: "Write about a time you owned a mistake publicly. What happened to trust afterwards?",
        adolescents: "What does being accountable look like for you at school, at home or in sport?",
        kids: "Draw a promise you kept.",
      },
      guide: {
        adults: { discussion: ["Where are decisions made in our organisation without a record of why?", "How do we respond when someone owns a mistake?"], activity: "Audit one recent project: list decisions, owners and dates. Identify one gap in accountability and agree a fix.", minutes: 20 },
        adolescents: { discussion: ["Why is blaming easier than owning?", "What's a fair way to divide group work?"], activity: "Groups create a one-page \"team charter\" for their next group project: roles, deadlines and what happens if someone falls behind.", minutes: 15 },
        kids: { discussion: ["How do you remember your promises?", "How do you feel when someone keeps a promise to you?"], activity: "Class jobs chart: each learner picks a small class job for the week and ticks it off daily.", minutes: 10 },
      },
    },
  ],
};
