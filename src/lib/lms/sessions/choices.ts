import type { FaceContent } from "./types";

export const CHOICES: FaceContent = {
  overview: {
    hook: {
      adults: "Think back over yesterday. How many decisions did you make? Most of them happened without you noticing. Leadership is the habit of noticing the ones that matter.",
      adolescents: "From what to post, to who to sit with, to whether to study tonight: you make many choices every day. A few of them shape who you become.",
      kids: "Every day you choose things. What to play. What to say. Whether to share. Choices are like little steering wheels for your day.",
    },
    core: `**Choices** is the face of the cube that sits on top. It is about how you decide when things are unclear. Super-Cube® treats four skills as learnable, not fixed: **decision-making intelligence**, **moral values**, **judgement** and **risk-taking**.

A simple way to hold them together is the *Choices stack*:
1. **Clarify**: what is the real decision?
2. **Values**: what must not be traded away?
3. **Judgement**: what do the facts, the context and other people tell me?
4. **Risk**: what is the smartest step forward, and how would I recover if it goes wrong?

Good leaders don't remove risk. They price it honestly and act with integrity.`,
    coreKids: `**Choices** is the top of the cube. It is about **choosing well**.

Here is a trick for a big choice:
1. **Stop.** Take a breath.
2. **Think.** What could happen?
3. **Check.** Is it kind? Is it fair? Is it true?
4. **Go.** Make your choice, and be brave.`,
    example: {
      title: "Nelson Mandela and the Springbok jersey, 1995",
      body: "Many people expected South Africa's first democratically elected president to keep his distance from rugby, a sport strongly linked to the old order. Instead, Mandela backed the Springboks and walked onto the field at the 1995 Rugby World Cup final wearing the captain's number 6 jersey. It was a calculated risk: some of his own supporters disagreed. He weighed the values at stake (reconciliation, one nation) against the risk, and chose a bold, symbolic act. It is still remembered as a turning point in nation-building.",
      source: "Widely reported; see e.g. John Carlin, *Playing the Enemy* (2008).",
    },
    exampleKids: {
      title: "A big, brave choice",
      body: "Long ago, South Africa's President Nelson Mandela wanted people who had been unfair to each other to become one team. At a big rugby match he wore the team's jersey to show everyone they belonged together. Some people didn't like it. He thought about it carefully and chose to be brave and kind.",
    },
    reflect: {
      adults: "Which of the four steps (clarify, values, judgement, risk) do you tend to skip when you are under pressure?",
      adolescents: "Think of a choice you made this week that you'd make differently now. Which step did you skip?",
      kids: "Think of a good choice you made this week. How did it make you feel?",
    },
    practice: {
      adults: "Pick one decision you are facing this week. Write one line for each step of the Choices stack before you act.",
      adolescents: "Before one choice today (big or small), run the four steps in your head. It takes 30 seconds.",
      kids: "Today, before one choice, say \"Stop, think, check, go\" to yourself.",
    },
    ifThen: {
      adults: "If I notice I'm about to decide something that affects other people, then I will pause for 90 seconds and run the Choices stack.",
      adolescents: "If I feel rushed to decide, then I will say \"Give me a minute\" and run the four steps.",
      kids: "If I have a big choice, then I will say \"Stop, think, check, go.\"",
    },
    check: [
      { q: "What is the first step of the Choices stack?", options: ["Take the risk", "Clarify the real decision", "Ask your manager", "Check your values"], answer: 1, why: "Clarify comes first: many poor decisions answer the wrong question." },
      { q: "In Super-Cube®, decision-making skills are…", options: ["fixed personality traits", "learnable and can be developed", "only for senior leaders", "the same as intelligence"], answer: 1, why: "All four Choices skills are treated as developable capabilities." },
      { q: "What do good leaders do with risk?", options: ["Avoid it completely", "Ignore it", "Price it honestly and plan how to recover", "Leave it to others"], answer: 2, why: "Calculated risk means weighing what could go wrong and how you would recover." },
    ],
    checkKids: [
      { q: "What is the first step for a big choice?", options: ["Go!", "Stop and take a breath", "Ask a friend to choose"], answer: 1, why: "Stopping first gives your brain time to think." },
      { q: "Which question helps you check a choice?", options: ["Is it kind and fair?", "Is it the fastest?", "Will I get a prize?"], answer: 0, why: "Kind, fair and true choices are good choices." },
    ],
    journal: {
      adults: "Describe a decision you're proud of. What made it a good decision, apart from how it turned out?",
      adolescents: "What's one choice you want to get better at making? Why does it matter to you?",
      kids: "Draw or write about a good choice you made.",
    },
    guide: {
      adults: { discussion: ["Which recent team decision would have benefited from the Choices stack?", "Where does our organisation reward speed over good judgement?"], activity: "In pairs, take one live decision and run the four steps aloud, 3 minutes each. Debrief what changed.", minutes: 15 },
      adolescents: { discussion: ["When do young people feel most rushed into choices?", "Who helps you think before a big decision?"], activity: "Groups of three get a scenario card (party, group chat, subject choice) and walk it through the four steps on a poster.", minutes: 15 },
      kids: { discussion: ["What is a hard choice you have had to make?", "What helps you choose kindly?"], activity: "Play \"Stop, think, check, go\": the teacher reads simple choices and learners act out each step.", minutes: 10 },
    },
  },

  slots: [
    {
      skills: { adults: "Decision-making intelligence", adolescents: "Decision-making under pressure", kids: "Making good decisions" },
      hook: {
        adults: "Two senior people want opposite things by Friday. Everyone is looking at you. What do you do in the next ten minutes?",
        adolescents: "Two assignments are due on the same day as a friend's birthday. You can't do everything. How do you choose without letting people down?",
        kids: "You can play outside or finish your puzzle before supper. You can't do both. How do you choose?",
      },
      core: `**Decision-making intelligence** is the skill of turning a messy situation into clear options, criteria and a next step, without freezing or rushing.

A quick method:
- **Options**: write at least three (A, B, C). The best answer is often not the first one.
- **Criteria**: choose two or three things that matter most (for example impact, fit with values, and how easy it is to undo).
- **Score and decide**: compare the options against the criteria, then decide and say why.

Most decisions improve with a short, structured pause. Very few are as urgent as they feel.`,
      coreKids: `A good decision has three parts:
- **Choices**: what can I do? Try to think of more than one thing.
- **What matters**: what is most important here?
- **Pick**: choose, and say why.`,
      example: {
        title: "Cape Town's \"Day Zero\" water crisis, 2017–2018",
        body: "After years of drought, Cape Town warned that taps could run dry on a so-called \"Day Zero\". City leaders, businesses and households faced hard trade-offs: strict water limits, pressure management, new supply projects and a public campaign that made the risk visible to everyone. Clear criteria (keep water flowing for essential needs, share the burden fairly) and options that could be adjusted as rain came helped the city avoid Day Zero. Many residents changed daily habits fast because the choices were explained plainly.",
        source: "City of Cape Town water crisis communications, 2018; widely reported.",
      },
      exampleKids: {
        title: "A city that saved water",
        body: "A few years ago, the city of Cape Town almost ran out of water. People had to choose carefully. Families took short showers and saved bath water for the toilet. Because everyone made small good choices, the taps kept running.",
      },
      reflect: {
        adults: "Think of a decision you have been putting off. What is stopping you: too few options, unclear criteria, or fear of being wrong?",
        adolescents: "When you have too much to do, how do you usually choose what comes first? Does it work?",
        kids: "What is a choice you find hard? What makes it hard?",
      },
      practice: {
        adults: "Take one live decision. On one page write three options, three criteria and a score for each. Decide, and send a five-line decision note to the people affected.",
        adolescents: "Make a quick table for one choice this week: options down the side, \"what matters\" across the top. Show it to someone you trust.",
        kids: "Today, when you choose between two things, say your reason out loud in one sentence.",
      },
      ifThen: {
        adults: "If a decision feels urgent and messy, then I will write three options and two criteria before I reply.",
        adolescents: "If I have two things due at once, then I will list my options before I panic.",
        kids: "If I can't decide, then I will think of two choices and pick the kinder or wiser one.",
      },
      check: [
        { q: "What is the main risk of going with the first option that comes to mind?", options: ["It is always wrong", "Better options may never be considered", "It takes too long", "Other people will disagree"], answer: 1, why: "Writing at least three options often reveals a better path." },
        { q: "Which is a useful decision criterion?", options: ["Whatever my boss prefers", "How easy it is to undo if it goes wrong", "The option with the most words", "What I decided last time"], answer: 1, why: "Reversibility is a strong criterion: easy-to-undo decisions can be made faster." },
        { q: "After deciding, why send a short decision note?", options: ["To cover yourself", "So people understand the reasons and can act", "It is a legal requirement", "To end discussion forever"], answer: 1, why: "Explaining the why builds trust and helps people act on the decision." },
      ],
      checkKids: [
        { q: "What helps you make a good decision?", options: ["Thinking of more than one choice", "Choosing the first thing", "Letting someone else choose"], answer: 0, why: "More than one choice gives you a chance to find the best one." },
        { q: "After you choose, what can you do?", options: ["Say why you chose it", "Forget about it", "Hide it"], answer: 0, why: "Saying why helps you learn and helps others understand." },
      ],
      journal: {
        adults: "Write down one decision you made this week using the options-criteria method. What did the structure change?",
        adolescents: "What's a decision coming up for you? Write your options and what matters most.",
        kids: "Write or draw two choices you had today, and which one you picked.",
      },
      guide: {
        adults: { discussion: ["Which of our recurring decisions would benefit from agreed criteria?", "How do we usually record why we decided something?"], activity: "Teams take one real backlog decision and complete an options-criteria grid on a whiteboard in 10 minutes, then compare with how it would normally be decided.", minutes: 15 },
        adolescents: { discussion: ["What do you do when everything feels urgent?", "Who decides your priorities: you, your friends or your phone?"], activity: "Each learner lists this week's tasks and ranks them with two criteria (due date, importance). Share one surprise with a partner.", minutes: 15 },
        kids: { discussion: ["What choices do you make in the morning?", "How can we choose fairly when friends want different games?"], activity: "Pairs get two picture cards (e.g. play or tidy up) and practise saying \"I choose __ because __.\"", minutes: 10 },
      },
    },
    {
      skills: { adults: "Moral values", adolescents: "Personal values", kids: "Knowing right from wrong" },
      hook: {
        adults: "A small shortcut would hit the target. It would also stretch the truth to a client. Nobody would ever know. Would you?",
        adolescents: "A friend asks you to back up a story that isn't quite true. It's no big deal, they say. Is it?",
        kids: "Your friend asks you to hide a broken toy so nobody gets into trouble. What would you do?",
      },
      core: `**Moral values** are your non-negotiables: the lines you will not cross, even when crossing them would be easier. Without them, clever choices can still do harm.

Three practical habits:
- **Name them.** Pick your top three values (for example honesty, fairness and care). Vague values bend easily.
- **Check before, not after.** Ask "Which value is at stake here?" before you decide, not when you're justifying the decision.
- **Notice the pressure.** Values are tested under time pressure, targets and wanting to belong. That is exactly when the check matters most.`,
      coreKids: `**Values** are the things you believe are right, like being honest, kind and fair.

When something feels wrong in your tummy, stop and ask: **"Is this honest? Is it kind? Is it fair?"** If not, choose differently, or ask a grown-up for help.`,
      example: {
        title: "Thuli Madonsela, Public Protector (2009–2016)",
        body: "As South Africa's Public Protector, Advocate Thuli Madonsela investigated the use of public money at the then president's private home and released her report, *Secure in Comfort*, in 2014. She faced heavy political pressure and public attacks. She kept to her mandate and the evidence. In 2016 the Constitutional Court ruled that the Public Protector's remedial action is binding. Her example shows values held steady under pressure, by an official doing exactly what her role required.",
        source: "Public Protector report *Secure in Comfort* (2014); Constitutional Court, *EFF v Speaker of the National Assembly* (2016).",
      },
      exampleKids: {
        title: "Telling the truth when it is hard",
        body: "Thandeka knocked over her classmate's paint by accident. Nobody saw. She felt a wobble inside. She went to her classmate, said \"I'm sorry, it was me,\" and helped clean up. Her classmate said, \"Thanks for telling me.\" They painted a new picture together.",
      },
      reflect: {
        adults: "When did you last feel pressure to bend one of your values at work? What made it hard?",
        adolescents: "Which value do you find hardest to stick to around friends? Why?",
        kids: "When is it hard to tell the truth?",
      },
      practice: {
        adults: "Write your top three values on a card. Before your next significant decision, write: \"This choice protects ___.\"",
        adolescents: "Pick one value and live it on purpose for 48 hours. Note one win and one slip.",
        kids: "Write or draw your three \"always true for me\" rules and put them where you can see them.",
      },
      ifThen: {
        adults: "If I feel myself justifying a choice before I've made it, then I will ask which value is at stake and say it out loud.",
        adolescents: "If friends push me to do something that feels wrong, then I will say \"Nah, I'm good\" and suggest something else.",
        kids: "If something feels wrong in my tummy, then I will stop and ask a grown-up.",
      },
      check: [
        { q: "When should you check your values in a decision?", options: ["After, to explain it", "Before you decide", "Only if someone complains", "Once a year"], answer: 1, why: "Checking before deciding stops values becoming after-the-fact justifications." },
        { q: "Why name specific values, not just \"being good\"?", options: ["It sounds more professional", "Vague values bend easily under pressure", "It's required by law", "So others can copy them"], answer: 1, why: "Specific values give you a clear test to use in the moment." },
        { q: "When are values most often tested?", options: ["On quiet days", "Under time pressure, targets or the wish to belong", "During training", "On holiday"], answer: 1, why: "Pressure is exactly when the values check matters most." },
      ],
      checkKids: [
        { q: "What are values?", options: ["Things we believe are right, like being honest", "Toys we like", "Rules for games only"], answer: 0, why: "Values help us choose what's right." },
        { q: "If something feels wrong, what can you do?", options: ["Stop and ask a grown-up", "Do it fast", "Keep it a secret"], answer: 0, why: "Stopping and asking for help is brave and wise." },
      ],
      journal: {
        adults: "Write about a time you kept to your values when it cost you something. What helped?",
        adolescents: "Which three values do you want people to see in you? Where do they come from (family, faith, culture, experience)?",
        kids: "Draw a time you were honest or kind.",
      },
      guide: {
        adults: { discussion: ["Where might our targets or incentives quietly pressure people's values?", "How do we make it safe to say \"this doesn't feel right\"?"], activity: "Each person writes their top three values privately, then the group identifies shared values and one situation where they clash with a target.", minutes: 15 },
        adolescents: { discussion: ["Where do your values come from?", "Is it harder to keep values online or in person?"], activity: "Values auction: each learner gets R100 of pretend money to bid on values. Discuss why they chose what they did.", minutes: 15 },
        kids: { discussion: ["What does honest mean?", "How do you feel after telling the truth?"], activity: "Read a short story with a hard choice. Learners hold up a smiley or thinking face for each option and explain.", minutes: 10 },
      },
    },
    {
      skills: { adults: "Judgement", adolescents: "Judgement online & offline", kids: "Thinking before acting" },
      hook: {
        adults: "The most confident person in the room has already decided. The data is thin. What do you notice that they might be missing?",
        adolescents: "A post says a famous person has died. It looks real and it's everywhere. Do you share it?",
        kids: "Two friends tell you different stories about who started an argument. How can you find out what really happened?",
      },
      core: `**Judgement** combines experience, context and evidence. It is slower than instinct and faster than endless analysis.

Signs of sound judgement:
- **Look for the missing view.** Ask, "Who sees this differently, and what would they notice?"
- **Separate confidence from evidence.** Loud certainty is not the same as good sense.
- **Check the source.** Who is telling me this, how do they know, and what do they gain?
- **Decide at the right speed.** Big, hard-to-undo decisions deserve more care; small, reversible ones can move quickly.`,
      coreKids: `**Think before you act.** Your brain needs a moment to catch up with your feelings.

Try **"Pause, ask, act"**:
- **Pause**: count to five.
- **Ask**: what could happen? Who could get hurt?
- **Act**: then choose.`,
      example: {
        title: "Ushahidi: crisis mapping in Kenya, 2008",
        body: "During the violence after Kenya's 2007 election, reliable information was hard to find. A small group of Kenyan technologists, including Ory Okolloh, built Ushahidi (\"testimony\" in Swahili), a website where people could report incidents by text message and see them on a map. The team had to judge which reports to trust, and they built in ways to check and cross-reference them. The tool has since been used in crises around the world. Good judgement here meant gathering many views quickly while still checking sources.",
        source: "Ushahidi history (ushahidi.com); widely reported.",
      },
      exampleKids: {
        title: "Checking the story",
        body: "Sipho heard that his friend had taken his pencil case. He felt cross. But he paused and asked his friend first. His friend said, \"I found it on the floor and was keeping it safe for you!\" Sipho was glad he asked before shouting.",
      },
      reflect: {
        adults: "Think of a decision that went wrong. Was the problem the information, the perspectives you heard, or the speed you decided at?",
        adolescents: "Have you ever shared or believed something online that turned out to be false? What would have helped you spot it?",
        kids: "When did you do something too fast and wish you had waited?",
      },
      practice: {
        adults: "Before your next important decision, ask one person who usually disagrees with you: \"What am I missing?\" Listen without defending.",
        adolescents: "For the next three things you're about to share, check: who made this, how do they know, and who could it hurt?",
        kids: "Next time you feel cross, count to five before you speak.",
      },
      ifThen: {
        adults: "If everyone in the room agrees quickly, then I will ask, \"What would make this a bad decision?\"",
        adolescents: "If a post makes me feel shocked or angry, then I will check where it came from before I share it.",
        kids: "If I feel like shouting, then I will count to five first.",
      },
      check: [
        { q: "Which is a sign of good judgement?", options: ["Deciding as fast as possible every time", "Seeking a view that differs from yours", "Following the most confident person", "Waiting until you are completely sure"], answer: 1, why: "Looking for the missing perspective is the heart of sound judgement." },
        { q: "Before sharing a surprising post, the best first check is…", options: ["How many likes it has", "Who made it and how they know", "Whether it's funny", "Whether your friends shared it"], answer: 1, why: "Checking the source comes before deciding to trust or share." },
        { q: "Which decisions deserve the most care?", options: ["Small and easy to undo", "Big and hard to undo", "Ones your friends make", "Ones about lunch"], answer: 1, why: "Match the speed of your decision to how hard it is to reverse." },
      ],
      checkKids: [
        { q: "What does \"pause\" mean?", options: ["Stop for a moment before acting", "Run away", "Shout loudly"], answer: 0, why: "Pausing gives your brain time to think." },
        { q: "Before you act, what can you ask?", options: ["Could someone get hurt?", "Is it the quickest?", "Will I win?"], answer: 0, why: "Thinking about others helps you choose well." },
      ],
      journal: {
        adults: "Write about a time a different perspective changed your mind. What made you able to hear it?",
        adolescents: "How do you decide what's true online? Write your own three-step check.",
        kids: "Draw yourself pausing before you act.",
      },
      guide: {
        adults: { discussion: ["Whose voices are usually missing from our decisions?", "Which decisions do we over-analyse and which do we rush?"], activity: "Pre-mortem: imagine a current project failed a year from now. In 8 minutes each person writes why. Share and pick two risks to act on.", minutes: 15 },
        adolescents: { discussion: ["How do fake stories spread so fast?", "What makes a source trustworthy?"], activity: "Fact-check race: groups get three headlines (one real, two false) and use a checklist to judge them. Discuss what gave the false ones away.", minutes: 20 },
        kids: { discussion: ["What happens when we act too fast?", "How does pausing help?"], activity: "Traffic-light game: red = pause, amber = think, green = act. Learners move on each colour as the teacher reads simple situations.", minutes: 10 },
      },
    },
    {
      skills: { adults: "Risk-taking", adolescents: "Healthy risk-taking", kids: "Trying bravely" },
      hook: {
        adults: "What's one opportunity you've passed up in the last year because it felt too risky? What did playing it safe cost?",
        adolescents: "There's a role you'd love: class rep, team captain, the lead in the play. What's stopping you from putting your hand up?",
        kids: "Have you ever wanted to try something new but felt a little scared? What happened?",
      },
      core: `**Risk-taking** in Super-Cube® means *calculated* risk: acting boldly when the upside matters, after honestly weighing what could go wrong and how you'd recover.

Two traps sit on either side:
- **Reckless risk**: acting for excitement or approval, without thinking about the downside.
- **Hidden risk of playing safe**: sticking with the "safe" option even when it's likely to fail.

A simple test: *What's the smallest bold step that moves us forward? If it goes wrong, how bad is it, and what would we do?* Try it on a small scale first.`,
      coreKids: `Being **brave** doesn't mean not being scared. It means trying even when you feel a bit scared.

A **good brave** choice is safe and helps you grow, like reading aloud or trying a new sport.
A **not-good risk** could hurt you or others. Ask a grown-up if you're not sure.`,
      example: {
        title: "M-Pesa: mobile money in Kenya, 2007",
        body: "In 2007 Safaricom and Vodafone launched M-Pesa, which let people send and receive money by basic mobile phone, without a bank account. It was a real risk: it needed new agent networks, regulator confidence and public trust. The team started with pilots, learned what customers actually used it for (sending money home to family), and adjusted. M-Pesa grew into a widely used way to move money in Kenya and beyond. Calculated risk here meant testing small, learning fast and scaling what worked.",
        source: "Safaricom and Vodafone public history of M-Pesa; widely reported.",
      },
      exampleKids: {
        title: "The boy who built a windmill",
        body: "In Malawi, a boy called William Kamkwamba read a library book about windmills. People laughed at him for collecting old bicycle parts. He felt nervous but kept trying. He built a windmill that made electricity for his family's home. His brave try helped his whole village.",
      },
      reflect: {
        adults: "Do you lean more towards reckless risk or the hidden risk of playing safe? Where did that habit come from?",
        adolescents: "Think of a healthy risk you took that helped you grow. How did you feel before and after?",
        kids: "What is something new you would like to try?",
      },
      practice: {
        adults: "Choose one stalled opportunity. Design the smallest bold step you could take this week, with a written fallback if it goes wrong.",
        adolescents: "Do one healthy-risk thing this week: ask a question in class, try out for something or start a conversation. Note how it went.",
        kids: "This week, try one new thing: a new food, a new game or saying hello to someone new.",
      },
      ifThen: {
        adults: "If I catch myself saying \"too risky\", then I will ask what the smallest safe-to-fail step would be.",
        adolescents: "If I want to try something but feel nervous, then I will prepare once and then go for it.",
        kids: "If I feel scared to try, then I will take a big breath and try a little bit.",
      },
      check: [
        { q: "What makes a risk \"calculated\"?", options: ["It feels exciting", "You've weighed the downside and how you'd recover", "Someone else approved it", "It is guaranteed to work"], answer: 1, why: "Calculated risk means honestly pricing what could go wrong and having a fallback." },
        { q: "What is the hidden risk of always playing safe?", options: ["There isn't one", "The safe option may be likely to fail", "You will get bored", "It costs more money"], answer: 1, why: "Avoiding risk can itself be risky when the cautious path is likely to fail." },
        { q: "What did the M-Pesa team do to manage risk?", options: ["Launched everywhere at once", "Tested with pilots and adjusted", "Waited for competitors", "Avoided regulators"], answer: 1, why: "Starting small and learning fast reduces the cost of being wrong." },
      ],
      checkKids: [
        { q: "What does being brave mean?", options: ["Trying even when you feel a bit scared", "Never feeling scared", "Doing dangerous things"], answer: 0, why: "Brave people feel scared sometimes too, and try anyway." },
        { q: "If you're not sure something is safe, what should you do?", options: ["Ask a grown-up", "Do it anyway", "Dare a friend to do it"], answer: 0, why: "Grown-ups can help you work out if it is a good brave choice." },
      ],
      journal: {
        adults: "Write about a calculated risk that paid off, or one you wish you had taken. What did you learn about your relationship with risk?",
        adolescents: "What's one healthy risk you want to take this term? What's your plan if it doesn't go perfectly?",
        kids: "Draw yourself trying something new and brave.",
      },
      guide: {
        adults: { discussion: ["Does our culture punish failed experiments or learn from them?", "Where are we playing too safe?"], activity: "Each team member names one \"safe-to-fail\" experiment for next month with a cost cap and a fallback. The group picks two to support.", minutes: 15 },
        adolescents: { discussion: ["What's the difference between a healthy and an unhealthy risk?", "Why do people take risks to impress others?"], activity: "Risk line: learners stand along a line from \"healthy risk\" to \"unhealthy risk\" as the teacher reads scenarios, then explain their spot.", minutes: 15 },
        kids: { discussion: ["What new thing have you tried?", "How did you feel after?"], activity: "Brave jar: each learner writes or draws one brave thing they will try this week and puts it in a class jar. Celebrate next week.", minutes: 10 },
      },
    },
  ],
};
