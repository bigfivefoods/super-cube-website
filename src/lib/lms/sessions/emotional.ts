import type { FaceContent } from "./types";

export const EMOTIONAL: FaceContent = {
  overview: {
    hook: {
      adults: "Think of the best leader you've worked for. Chances are you remember how they made you feel more than anything they said.",
      adolescents: "Feelings aren't a weakness. Knowing what you feel, and what to do with it, is one of the strongest skills you can build.",
      kids: "Happy, sad, cross, scared, excited: everybody has lots of feelings. Feelings are OK! Let's learn what to do with them.",
    },
    core: `**Emotional** is the heart face of the cube. Super-Cube® names five skills: **emotional intelligence**, **empathy**, **social relationships**, **motivation** and **inspiration**.

The model draws on the *ability* view of emotional intelligence (Mayer, Salovey and Caruso): **perceiving**, **using**, **understanding** and **managing** emotions, as skills that can be trained.

In the 12-week, accredited Super-Cube® leadership intervention with Imana Foods and Kerry Foods, leaders' average Emotional score rose by **+39.5 percentage points** (pre- to post-assessment).

A starting habit: **name it to tame it**. Putting a precise word to a feeling (\"frustrated\", not just \"bad\") helps you choose a response instead of reacting.`,
    coreKids: `**Emotional** is about your **feelings** and other people's feelings.

All feelings are OK. What matters is what we **do** with them.
1. **Notice** the feeling in your body.
2. **Name** it: \"I feel…\"
3. **Choose** a kind way to handle it.`,
    example: {
      title: "The Book of Joy: Desmond Tutu and the Dalai Lama",
      body: "In 2015 Archbishop Desmond Tutu visited the Dalai Lama in Dharamsala, India, and the two spent a week talking about how to find joy despite suffering. Both had lived through great hardship: apartheid and exile. Their conversations became *The Book of Joy* (2016, with Douglas Abrams). They described practices such as perspective, humour, gratitude and compassion. It's a reminder that emotional skill is not about avoiding hard feelings, but working with them.",
      source: "Dalai Lama, Desmond Tutu and Douglas Abrams, *The Book of Joy* (2016).",
    },
    exampleKids: {
      title: "The feelings jar",
      body: "Mia's class has a feelings jar. Each morning, everyone puts a coloured bead in the jar for how they feel: yellow for happy, blue for sad, red for cross. One day Mia put in a blue bead. Her teacher noticed and asked if she was OK. Mia said her grandad was sick. Talking about it helped her feel a little better.",
    },
    reflect: {
      adults: "Which emotions do you find easiest to notice in yourself? Which ones do you tend to miss until they spill over?",
      adolescents: "How many different feeling words do you use in a normal week? Is \"fine\" doing a lot of work?",
      kids: "How are you feeling right now? Where do you feel it in your body?",
    },
    practice: {
      adults: "Three times a day for a week, pause and name your emotion in one precise word. Notice any pattern.",
      adolescents: "Set three random phone reminders today. Each time, name your feeling in one word (not \"fine\").",
      kids: "Tonight, tell someone at home one feeling you had today and why.",
    },
    ifThen: {
      adults: "If I notice tension in my body before a hard conversation, then I will name the emotion silently and take one slow breath.",
      adolescents: "If I'm about to react angrily, then I will name the feeling in my head and wait ten seconds.",
      kids: "If I have a big feeling, then I will say \"I feel…\" and take a deep breath.",
    },
    check: [
      { q: "Which model of emotional intelligence does Super-Cube® draw on?", options: ["A personality type model", "The ability model (Mayer, Salovey & Caruso)", "An IQ test", "A fitness model"], answer: 1, why: "The ability model treats perceiving, using, understanding and managing emotions as trainable skills." },
      { q: "What does \"name it to tame it\" mean?", options: ["Ignore feelings", "Putting a precise word to a feeling helps you manage it", "Blame someone", "Give your feelings a nickname"], answer: 1, why: "Precise labelling helps you respond rather than react." },
      { q: "What Emotional result did the 12-week Imana Foods and Kerry Foods intervention report?", options: ["No change", "An average gain of +39.5 percentage points, pre to post", "A small decline", "It wasn't measured"], answer: 1, why: "Leaders in the 12-week Super-Cube® intervention raised their average Emotional score by +39.5 percentage points, pre to post." },
    ],
    checkKids: [
      { q: "Are all feelings OK?", options: ["Yes, what matters is what we do with them", "No, only happy ones", "Only on weekends"], answer: 0, why: "Every feeling is OK. We choose kind ways to handle them." },
      { q: "What's the first step with a big feeling?", options: ["Notice it", "Hide it", "Shout"], answer: 0, why: "Noticing helps you know what you feel." },
    ],
    journal: {
      adults: "Write about a time you handled a strong emotion well at work. What did you do?",
      adolescents: "Which feeling is hardest for you to deal with? What helps?",
      kids: "Draw your face showing a feeling you had today.",
    },
    guide: {
      adults: { discussion: ["How are emotions talked about, or not, in our team?", "What does a good emotional response look like under pressure?"], activity: "Emotion vocabulary: groups list as many emotion words as they can in 3 minutes, sorted into families (anger, fear, sadness, joy). Discuss which ones show up at work.", minutes: 15 },
      adolescents: { discussion: ["Why do people say \"I'm fine\" when they're not?", "Where can young people get support when feelings are big?"], activity: "Feelings wheel: each learner circles three emotions they felt this week and shares one with a partner (pass is allowed).", minutes: 15 },
      kids: { discussion: ["What makes you happy? What makes you sad?", "What can we do when we feel cross?"], activity: "Feelings faces: show picture cards and learners name the feeling and act it out, then share one calm-down idea.", minutes: 10 },
    },
  },

  slots: [
    {
      skills: { adults: "Emotional intelligence", adolescents: "Emotional intelligence", kids: "Naming feelings" },
      hook: {
        adults: "In a tense meeting, you can feel the room change before anyone speaks. What are you noticing, and what do you do with it?",
        adolescents: "Someone sends a message that's \"just a joke\". You feel your stomach drop. What's going on?",
        kids: "Your tummy feels funny before a test. What feeling might that be?",
      },
      core: `**Emotional intelligence** is the ability to perceive, use, understand and manage emotions, in yourself and others.

Four practical steps:
- **Perceive**: notice the signals (body, tone, facial expression).
- **Understand**: what triggered this? What might it turn into?
- **Use**: some feelings help certain tasks (calm for detail, energy for brainstorming).
- **Manage**: choose a response that fits your goals and values. Breathe, reframe, pause or speak up.

Emotions are information, not instructions.`,
      coreKids: `**Naming feelings** helps you understand yourself.

Try finding the **exact** word:
- Not just \"bad\", maybe **worried**, **cross** or **disappointed**.
- Not just \"good\", maybe **proud**, **excited** or **calm**.`,
      example: {
        title: "Staying composed under pressure: the TRC hearings",
        body: "During the Truth and Reconciliation Commission hearings, commissioners listened to extremely painful testimony, day after day. Archbishop Tutu was sometimes seen weeping openly at the hearings, then continuing to chair the proceedings. His example shows that emotional intelligence doesn't mean hiding emotion. It means feeling it honestly while still choosing how to act.",
        source: "Truth and Reconciliation Commission public hearings, 1996–1998; widely reported.",
      },
      exampleKids: {
        title: "Finding the right word",
        body: "Thabo said he felt \"bad\" after soccer practice. His mum asked, \"Bad like sad, or bad like cross?\" Thabo thought hard. \"Disappointed, because I didn't score.\" Once he knew the word, they could talk about it, and he felt much better.",
      },
      reflect: {
        adults: "When you're stressed, what are the first signals in your body? How quickly do you notice them?",
        adolescents: "Think of a time a feeling took over and you did something you regretted. What were the early signs?",
        kids: "What does your body do when you feel worried?",
      },
      practice: {
        adults: "After each meeting today, jot down the emotion you felt most strongly and what triggered it.",
        adolescents: "When you feel a strong emotion this week, try the 3-step check: notice it, name it, choose your move.",
        kids: "Find three new feeling words today and use one of them.",
      },
      ifThen: {
        adults: "If I feel triggered in a meeting, then I will take one breath and ask a question before responding.",
        adolescents: "If a message makes me angry, then I will wait ten minutes before replying.",
        kids: "If I feel \"bad\", then I will find a more exact feeling word.",
      },
      check: [
        { q: "\"Emotions are information, not instructions\" means…", options: ["Ignore emotions", "Emotions tell you something but you choose what to do", "Always follow your emotions", "Emotions are wrong"], answer: 1, why: "Emotions carry useful signals; the response is your choice." },
        { q: "Which is an example of managing emotion?", options: ["Shouting immediately", "Pausing and choosing a response that fits your goals", "Pretending to feel nothing", "Leaving every hard meeting"], answer: 1, why: "Managing means choosing a response, not suppressing or exploding." },
        { q: "What does Tutu's example show?", options: ["Leaders should never show emotion", "You can feel emotion honestly and still choose how to act", "Crying means weakness", "Emotions don't matter"], answer: 1, why: "Emotional intelligence includes honest feeling and wise action." },
      ],
      checkKids: [
        { q: "Instead of \"bad\", which is a more exact word?", options: ["Disappointed", "Thing", "Blue"], answer: 0, why: "Exact words help you understand your feelings." },
        { q: "Why is naming feelings helpful?", options: ["It helps you understand and talk about them", "It makes them disappear forever", "It's a game rule"], answer: 0, why: "When you know the feeling, you can handle it." },
      ],
      journal: {
        adults: "Write about an emotion that often shows up at work for you. What is it telling you?",
        adolescents: "List five feeling words you'd like to use more often. When might you use them?",
        kids: "Draw a feeling and give it a name.",
      },
      guide: {
        adults: { discussion: ["How do emotions affect decisions in our meetings?", "What signals tell you a colleague is stressed?"], activity: "Body-scan check-in: a 2-minute guided pause, then each person names (privately or aloud) one emotion they noticed.", minutes: 10 },
        adolescents: { discussion: ["What triggers big emotions for young people?", "Which calm-down strategies actually work?"], activity: "Trigger map: learners map one common trigger, the body signals, and two better response options.", minutes: 15 },
        kids: { discussion: ["How do you know when you're cross?", "What helps you feel calm?"], activity: "Feelings charades: children act out a feeling and classmates guess the exact word.", minutes: 10 },
      },
    },
    {
      skills: { adults: "Empathy", adolescents: "Empathy", kids: "Kindness" },
      hook: {
        adults: "A team member's work has slipped for three weeks. Before you manage the performance, do you know what's going on in their life?",
        adolescents: "A classmate snaps at you for no reason. Could something else be going on for them?",
        kids: "Your friend dropped their ice cream and is crying. How could you help?",
      },
      core: `**Empathy** is understanding what someone else is feeling and seeing the world from their point of view, and letting that shape how you act.

Empathy has three parts:
- **Thinking empathy**: understanding someone's perspective.
- **Feeling empathy**: sensing their emotion.
- **Caring action**: doing something helpful about it.

Many Southern African languages express this with **ubuntu**, often explained through the isiZulu saying *umuntu ngumuntu ngabantu*: a person is a person through other people.

Empathy doesn't mean agreeing with everyone. It means understanding first.`,
      coreKids: `**Kindness** means helping others and caring how they feel.

Ask yourself: **\"How would I feel if that happened to me?\"** Then do something kind.`,
      example: {
        title: "Ubuntu in leadership",
        body: "Archbishop Desmond Tutu often explained ubuntu as the idea that \"my humanity is caught up, is inextricably bound up, in yours\". He described a person with ubuntu as open and available to others, affirming of others, and not threatened by others' abilities. Many South African leaders and organisations use ubuntu as a guide for leading with empathy: seeing each person as part of a shared humanity.",
        source: "Desmond Tutu, *No Future Without Forgiveness* (1999).",
      },
      exampleKids: {
        title: "Lunch for two",
        body: "Kabelo saw that a boy in his class had no lunch. He thought, \"I'd feel hungry and sad.\" He shared half of his sandwich. The boy smiled. The next day they sat together at break and became friends.",
      },
      reflect: {
        adults: "Think of someone you find difficult. What might their day, pressures or worries look like from their side?",
        adolescents: "When did someone show you empathy when you needed it? What did they do?",
        kids: "When did someone do something kind for you?",
      },
      practice: {
        adults: "In your next one-on-one, ask \"How are you, really?\" and listen for two minutes without fixing or advising.",
        adolescents: "This week, when someone is upset, try saying \"That sounds hard\" before giving any advice.",
        kids: "Do one kind thing for someone today without being asked.",
      },
      ifThen: {
        adults: "If someone's performance or mood changes, then I will ask how they are before discussing the work.",
        adolescents: "If someone seems upset, then I will ask \"Are you OK?\" and really listen.",
        kids: "If someone is sad, then I will ask them, \"Are you OK?\"",
      },
      check: [
        { q: "What are the three parts of empathy?", options: ["Talking, walking, sitting", "Thinking, feeling and caring action", "Listening, fixing, judging", "Agreeing, nodding, smiling"], answer: 1, why: "Understanding, sensing and acting together make empathy complete." },
        { q: "What does umuntu ngumuntu ngabantu express?", options: ["Every person for themselves", "A person is a person through other people", "Hard work pays", "Leaders are born"], answer: 1, why: "This isiZulu saying captures the spirit of ubuntu." },
        { q: "Empathy means…", options: ["Always agreeing", "Understanding someone first, even if you disagree", "Feeling sorry for people", "Fixing everyone's problems"], answer: 1, why: "Empathy is about understanding, not necessarily agreement." },
      ],
      checkKids: [
        { q: "What question helps you be kind?", options: ["How would I feel if that happened to me?", "What do I get?", "Who's watching?"], answer: 0, why: "Imagining how others feel helps you be kind." },
        { q: "What is kindness?", options: ["Helping others and caring how they feel", "Being bossy", "Winning"], answer: 0, why: "Kindness makes people feel cared for." },
      ],
      journal: {
        adults: "Write about a time understanding someone's perspective changed how you led them.",
        adolescents: "Who in your life might need more empathy from you right now? What could you do?",
        kids: "Draw yourself being kind to someone.",
      },
      guide: {
        adults: { discussion: ["How does empathy fit with high performance standards?", "What gets in the way of listening at work?"], activity: "Listening triads: one speaks about a work challenge for 2 minutes, one listens without interrupting and reflects back, one observes. Rotate.", minutes: 20 },
        adolescents: { discussion: ["What does ubuntu look like at school?", "Why is it hard to listen without giving advice?"], activity: "Perspective cards: groups read a scenario from three different characters' points of view and discuss how each feels.", minutes: 15 },
        kids: { discussion: ["How can we be kind at break time?", "How does kindness feel?"], activity: "Kindness tree: each child adds a paper leaf with a kind act they did or saw this week.", minutes: 10 },
      },
    },
    {
      skills: { adults: "Social relationships", adolescents: "Relationships & peer influence", kids: "Friends & family" },
      hook: {
        adults: "Who in your organisation would you call at 10pm in a crisis, and who would call you? That network is a leadership asset.",
        adolescents: "Your friends shape your habits more than almost anything else. Are your friendships helping you grow?",
        kids: "Who are the special people in your life? How do you show them you care?",
      },
      core: `**Social relationships** are the trust-based connections that help people work, learn and live well together. Strong relationships are built deliberately, through small, consistent actions.

What builds trust over time:
- **Reliability**: do what you say.
- **Small moments of care**: remembering what matters to someone.
- **Repair**: when things go wrong, address it quickly and honestly.
- **Healthy boundaries**: being able to say no respectfully, and to accept others' no.

For young people, **peer influence** is powerful. It can push you towards your best self or away from it. Choosing who you spend time with is a leadership decision.`,
      coreKids: `**Friends and family** are people who care about us, and we care about them.

Good friends **share**, **listen**, **take turns** and **say sorry** when they make a mistake.`,
      example: {
        title: "Banyana Banyana win the 2022 Women's Africa Cup of Nations",
        body: "In July 2022, South Africa's national women's football team, Banyana Banyana, coached by Desiree Ellis, won the Women's Africa Cup of Nations for the first time, beating hosts Morocco 2–1 in the final in Rabat. Players and coaches spoke about the team's strong bonds and belief in one another. It's a reminder that great performance is often built on strong relationships.",
        source: "Confederation of African Football (CAF) and SAFA match reports, July 2022.",
      },
      exampleKids: {
        title: "Saying sorry",
        body: "Lebo and Anika had a fight about who would be the leader in their game. Both felt cross. The next day Lebo said, \"Sorry I was bossy. Let's take turns.\" Anika smiled. \"Sorry too.\" Now they take turns being the leader.",
      },
      reflect: {
        adults: "Which important working relationship needs repair or investment right now?",
        adolescents: "Do your closest friends bring out your best? What makes you say that?",
        kids: "Who is a good friend to you? What do they do?",
      },
      practice: {
        adults: "Send one message this week thanking someone specifically for something they did. Reconnect with one person you've lost touch with.",
        adolescents: "Do one thing this week to strengthen a friendship that's good for you, like checking in or making plans.",
        kids: "Do something kind for someone in your family today.",
      },
      ifThen: {
        adults: "If tension builds with a colleague, then I will suggest a conversation within two days rather than letting it grow.",
        adolescents: "If friends pressure me to do something I don't want to, then I will say no and suggest something else.",
        kids: "If I have a fight with a friend, then I will say sorry for my part.",
      },
      check: [
        { q: "Which builds trust over time?", options: ["Big gestures once a year", "Reliability and small, consistent moments of care", "Avoiding conflict", "Agreeing with everything"], answer: 1, why: "Trust grows from consistent, everyday behaviour." },
        { q: "What should you do when a relationship is damaged?", options: ["Wait for it to fix itself", "Address it quickly and honestly", "Avoid the person", "Complain to others"], answer: 1, why: "Prompt, honest repair keeps relationships strong." },
        { q: "Why is choosing friends a leadership decision?", options: ["Friends don't matter", "Peers strongly influence your habits and growth", "Leaders shouldn't have friends", "To be popular"], answer: 1, why: "Peer influence can push you towards or away from your best self." },
      ],
      checkKids: [
        { q: "What do good friends do?", options: ["Share, listen and take turns", "Always win", "Leave others out"], answer: 0, why: "Good friends care about each other." },
        { q: "After a fight with a friend, you can…", options: ["Say sorry for your part", "Never talk again", "Tell everyone"], answer: 0, why: "Saying sorry helps fix friendships." },
      ],
      journal: {
        adults: "Map your key relationships at work. Which are strong, which need attention, and what's one step for each?",
        adolescents: "Write about a friend who makes you better. What do they do?",
        kids: "Draw your family or friends and write one thing you love about them.",
      },
      guide: {
        adults: { discussion: ["How do we repair relationships after conflict in this team?", "Which relationships across teams would make our work easier?"], activity: "Relationship map: each person maps 8–10 key relationships, rates the strength and picks one to invest in this month.", minutes: 15 },
        adolescents: { discussion: ["What does healthy peer pressure look like?", "How do you say no and keep the friendship?"], activity: "Role-play saying no: pairs practise three different ways to say no to peer pressure and keep it friendly.", minutes: 15 },
        kids: { discussion: ["What makes a good friend?", "How can we include someone who's alone?"], activity: "Friendship recipe: groups write or draw the ingredients of a good friend (sharing, listening, kindness).", minutes: 10 },
      },
    },
    {
      skills: { adults: "Motivation", adolescents: "Motivation & confidence", kids: "Staying calm" },
      hook: {
        adults: "On the hardest Monday of the year, what actually gets you out of bed: fear, money or something deeper?",
        adolescents: "You start strong, then lose steam by week three. Sound familiar? Motivation isn't magic. It can be built.",
        kids: "When you're cross or upset, what helps you calm down?",
      },
      core: `**Motivation** is the energy and direction behind sustained effort. Lasting motivation usually comes from inside: from **purpose**, **growth** and a sense of **ownership**, not only from rewards or pressure.

Ways to build it:
- **Connect to why**: link today's task to something you care about.
- **Make progress visible**: small wins fuel more effort.
- **Plan for obstacles**: decide in advance what you'll do when motivation dips.
- **Talk to yourself like a coach**: \"I can't do this *yet*.\"

Confidence grows from evidence: doing hard things, a little at a time.`,
      coreKids: `**Staying calm** helps you think clearly when you have a big feeling.

Try **balloon breathing**:
- Breathe in slowly through your nose, like filling a balloon.
- Breathe out slowly through your mouth.
- Do it **three times**.`,
      example: {
        title: "Wayde van Niekerk and Ans Botha",
        body: "At the Rio 2016 Olympics, South African sprinter Wayde van Niekerk won the 400m from lane 8 in a world-record time of 43.03 seconds. His coach, Ans Botha, was then in her seventies, and their partnership drew wide attention. In 2017 van Niekerk suffered a serious knee injury and spent a long time working his way back to elite competition. His story shows motivation both as a peak moment and as the quieter discipline of coming back.",
        source: "World Athletics records; widely reported.",
      },
      exampleKids: {
        title: "Balloon breathing",
        body: "Aisha felt so cross when her little brother broke her drawing that she wanted to shout. She remembered her balloon breathing. In… out… in… out… in… out. Her body felt calmer. Then she said, \"I feel cross that my drawing broke. Can you help me fix it?\"",
      },
      reflect: {
        adults: "What motivates you most at work right now? Is it enough to sustain you?",
        adolescents: "When does your motivation dip? What's usually going on?",
        kids: "What helps you feel calm when you are upset?",
      },
      practice: {
        adults: "Write down why your most important current goal matters to you. Track one small win each day this week.",
        adolescents: "Pick one goal. Write the obstacle most likely to stop you and your plan for it (WOOP: wish, outcome, obstacle, plan).",
        kids: "Practise balloon breathing three times today, even when you feel fine.",
      },
      ifThen: {
        adults: "If my energy for an important goal drops, then I will reread my \"why\" and do the smallest next step.",
        adolescents: "If I think \"I can't do this\", then I will add the word \"yet\".",
        kids: "If I feel upset, then I will do three balloon breaths.",
      },
      check: [
        { q: "Lasting motivation usually comes from…", options: ["Only rewards", "Purpose, growth and ownership", "Pressure from others", "Luck"], answer: 1, why: "Internal sources of motivation tend to last longer." },
        { q: "Why plan for obstacles in advance?", options: ["It's pessimistic", "Deciding ahead makes it easier to keep going when motivation dips", "It isn't useful", "To have excuses ready"], answer: 1, why: "Planning for obstacles (as in WOOP) supports follow-through." },
        { q: "Where does confidence come from?", options: ["Being told you're great", "Evidence from doing hard things a little at a time", "Avoiding failure", "Natural talent only"], answer: 1, why: "Confidence is built on experience." },
      ],
      checkKids: [
        { q: "What is balloon breathing?", options: ["Slow breaths in and out", "Blowing up a real balloon", "Holding your breath"], answer: 0, why: "Slow breaths help your body calm down." },
        { q: "Why stay calm?", options: ["So you can think clearly", "So you can shout louder", "It doesn't matter"], answer: 0, why: "A calm body helps your brain think." },
      ],
      journal: {
        adults: "Write about a time you kept going when you wanted to give up. What kept you going?",
        adolescents: "What's one goal you care about? Write your WOOP plan.",
        kids: "Draw what you do to feel calm.",
      },
      guide: {
        adults: { discussion: ["What motivates people in our team beyond pay?", "How do we celebrate small wins?"], activity: "WOOP in pairs: each person works through Wish, Outcome, Obstacle, Plan for one current goal and shares the if-then plan.", minutes: 15 },
        adolescents: { discussion: ["What kills motivation for young people?", "How does \"yet\" change things?"], activity: "Each learner writes a WOOP card for a school or sport goal; pairs swap and check the plan is specific.", minutes: 15 },
        kids: { discussion: ["What makes you feel calm?", "What can we do when we feel cross?"], activity: "Calm corner ideas: practise balloon breathing together and make a class list of calm-down ideas.", minutes: 10 },
      },
    },
    {
      skills: { adults: "Inspiration", adolescents: null, kids: null },
      hook: {
        adults: "People comply with authority. They give their best to leaders who inspire them. What's the difference in how those leaders behave?",
      },
      core: `**Inspiration** is the ability to lift others: to help people believe in a shared goal and in their own ability to reach it.

Inspiring leaders tend to:
- **Tell a story** that connects people's work to something bigger.
- **Model the behaviour** they ask for, especially when it's hard.
- **Believe in people out loud**: specific, sincere encouragement.
- **Share credit** generously and take responsibility personally.

Inspiration isn't about charisma or volume. Quiet, consistent leaders can be deeply inspiring.`,
      example: {
        title: "Siya Kolisi",
        body: "In 2018 Siya Kolisi became the first Black Test captain of the Springboks. He grew up in Zwide, a township near Gqeberha, and has spoken openly about the hardships of his childhood. He captained South Africa to Rugby World Cup wins in 2019 and 2023. After the 2019 final he spoke about how people of different backgrounds had come together and what that could mean for the country. His leadership is often described as inspiring because of humility, hard work and a story many South Africans see themselves in.",
        source: "SA Rugby; World Rugby; widely reported.",
      },
      reflect: {
        adults: "Who has inspired you most in your career? What exactly did they do?",
      },
      practice: {
        adults: "This week, tell one team member specifically what you believe they're capable of, and why.",
      },
      ifThen: {
        adults: "If my team faces a setback, then I will remind them of our purpose and one strength I've seen in them.",
      },
      check: [
        { q: "Inspiring leaders tend to…", options: ["Speak loudest", "Model the behaviour they ask for and believe in people out loud", "Keep the credit", "Avoid stories"], answer: 1, why: "Modelling, encouragement and shared credit are core to inspiration." },
        { q: "Is charisma required to inspire?", options: ["Yes, always", "No, quiet, consistent leaders can be deeply inspiring", "Only in sport", "Only for CEOs"], answer: 1, why: "Consistency and sincerity matter more than volume." },
        { q: "Why is Siya Kolisi often described as inspiring?", options: ["Only because of trophies", "Humility, hard work and a story many South Africans relate to", "Because he is the loudest player", "Because he avoids the media"], answer: 1, why: "His example connects personal story, humility and shared purpose." },
      ],
      journal: {
        adults: "Write the story you'd tell your team about why your work matters. Read it aloud. Does it inspire you?",
      },
      guide: {
        adults: { discussion: ["When has a leader here inspired you, and what did they do?", "How do we share credit as a team?"], activity: "Each person writes a 60-second \"why our work matters\" story and tells it to a partner, who gives one piece of feedback.", minutes: 20 },
      },
    },
  ],
};
