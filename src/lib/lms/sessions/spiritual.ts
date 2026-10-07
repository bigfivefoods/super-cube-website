import type { FaceContent } from "./types";

/**
 * Spiritual face: faith-inclusive and non-denominational. Learners of any
 * religion, or none, should find themselves in every session.
 */
export const SPIRITUAL: FaceContent = {
  overview: {
    hook: {
      adults: "When the title, the salary and the targets are stripped away, what's left that makes your work worth doing?",
      adolescents: "Who are you, really? Not your marks or your followers. What do you stand for and where do you belong?",
      kids: "What makes you feel happy deep inside, like when you look at the stars or help a friend?",
    },
    core: `**Spiritual** is the purpose face of the cube. Super-Cube® names five skills: **purpose**, **meaning**, **faith**, **transcendence** and **spiritual intelligence**.

This face is **for everyone**. For some people, it is expressed through a religious faith. For others it lives in deep values, culture, philosophy, family, community or nature. Super-Cube® doesn't tell you what to believe. It helps you connect **what you do** with **what matters most to you**.

Leaders with a strong Spiritual face tend to:
- know **why** they lead
- find **meaning** even in hard times
- draw strength from **beliefs and belonging**
- serve something **bigger than themselves**
- act with **wisdom and integrity** that others can feel`,
    coreKids: `**Spiritual** is about the things that matter most deep inside you: **love**, **hope**, **belonging** and **helping others**.

Every family has its own beliefs and traditions. They're all welcome here.`,
    example: {
      title: "Nelson Mandela at the Rivonia Trial, 1964",
      body: "Facing a possible death sentence at the Rivonia Trial in 1964, Nelson Mandela ended his statement from the dock by describing the ideal of a democratic and free society in which all people live together in harmony and with equal opportunities. He called it \"an ideal which I hope to live for and to achieve\", and added that, if needed, it was an ideal for which he was prepared to die. A clear purpose sustained him through 27 years in prison.",
      source: "Nelson Mandela, statement from the dock, Rivonia Trial, 20 April 1964 (Nelson Mandela Foundation).",
    },
    exampleKids: {
      title: "What matters most",
      body: "Ms Dlamini asked her class, \"What matters most to you?\" Lwazi said his family. Fatima said her friends and her faith. Jaco said his dog and being kind. Everyone had different answers, and they were all special.",
    },
    reflect: {
      adults: "If your colleagues described what you stand for, what would they say? Is that what you'd want them to say?",
      adolescents: "What gives you a sense of purpose or belonging right now?",
      kids: "What makes you feel happy deep inside?",
    },
    practice: {
      adults: "Write a one-sentence purpose statement: \"I lead in order to…\". Read it each morning this week.",
      adolescents: "Write down three things that matter most to you. Notice one moment each day when you live them.",
      kids: "Tell someone at home about one thing that matters a lot to you.",
    },
    ifThen: {
      adults: "If I start the workday, then I will spend one minute reading my purpose statement.",
      adolescents: "If I feel lost or unmotivated, then I will look at my three things that matter most.",
      kids: "If I feel sad, then I will think about someone who loves me.",
    },
    check: [
      { q: "The Spiritual face in Super-Cube® is…", options: ["only for religious people", "for everyone, whether expressed through faith, values, culture or nature", "about one religion", "optional for leaders"], answer: 1, why: "It's faith-inclusive and non-denominational." },
      { q: "What sustained Mandela through his imprisonment, according to his own words?", options: ["Wealth", "A clear purpose: an ideal to live for", "Fame", "Luck"], answer: 1, why: "His Rivonia statement describes the ideal he lived for." },
      { q: "What does the Spiritual face help you connect?", options: ["Work and holidays", "What you do with what matters most to you", "Money and status", "Sport and diet"], answer: 1, why: "Aligning action with deep values is the heart of this face." },
    ],
    checkKids: [
      { q: "Is everyone's \"what matters most\" the same?", options: ["No, and every answer is special", "Yes, always", "Only grown-ups have one"], answer: 0, why: "We're all different and that's OK." },
      { q: "Which is a Spiritual thing?", options: ["Helping others", "Being bossy", "Breaking things"], answer: 0, why: "Helping others is part of the Spiritual face." },
    ],
    journal: {
      adults: "Write about a moment when your work felt deeply meaningful. What was happening?",
      adolescents: "Write a letter to your future self about what you hope you'll always stand for.",
      kids: "Draw the people and things that matter most to you.",
    },
    guide: {
      adults: { discussion: ["How do people here find meaning in their work?", "How can we respect the many different faiths and worldviews in our team?"], activity: "Purpose pairs: each person drafts a purpose statement and shares it with a partner, who reflects back what they heard. Sharing is voluntary.", minutes: 15 },
      adolescents: { discussion: ["Where do young people find belonging?", "How can we respect beliefs different from our own?"], activity: "Values cards: learners choose five values from a set of 30, narrow to three and share one with the group (passing is fine). Keep the space respectful of all faiths and none.", minutes: 15 },
      kids: { discussion: ["What makes you feel happy inside?", "How are families' traditions different and special?"], activity: "Heart map: children draw a big heart and fill it with people, places and things that matter to them.", minutes: 10 },
    },
  },

  slots: [
    {
      skills: { adults: "Purpose", adolescents: "Purpose & identity", kids: "What matters to me" },
      hook: {
        adults: "Why do you lead? Not why you were promoted, but why you choose to carry responsibility for others.",
        adolescents: "If you had to describe yourself without mentioning school, sport or social media, what would you say?",
        kids: "If you could be famous for one kind thing, what would it be?",
      },
      core: `**Purpose** is your answer to \"What am I here to contribute?\" It gives direction when things get confusing and energy when things get hard.

Purpose often sits where three things meet:
- **What you care deeply about**
- **What you're good at, or can grow good at**
- **What the people around you need**

Purpose doesn't have to be grand. "I help my team grow" or "I make my community safer" can guide many daily choices. For teenagers, purpose is connected to **identity**: discovering who you are and who you want to become.`,
      coreKids: `**What matters to me** is a little compass inside you.

It helps you choose what to do. Maybe it's **family**, **friends**, **kindness**, **animals** or **learning**.`,
      example: {
        title: "Mandela's purpose, lived over a lifetime",
        body: "Nelson Mandela's statement at the Rivonia Trial in 1964 described the ideal of a free and democratic society. After his release in 1990, he worked through negotiation and reconciliation towards that same ideal, and became South Africa's first democratically elected president in 1994. A purpose stated in one moment guided decisions across decades.",
        source: "Nelson Mandela Foundation.",
      },
      exampleKids: {
        title: "Kamo's compass",
        body: "Kamo loves animals more than anything. When she saw a stray kitten, she told her mum, and they took it to the animal shelter. Kamo says, \"Looking after animals is what matters to me.\" Her compass helped her choose what to do.",
      },
      reflect: {
        adults: "Where do the three circles (what you care about, what you're good at, what others need) overlap for you?",
        adolescents: "What parts of who you are feel most \"you\"? Where do they come from?",
        kids: "What is one thing that really matters to you?",
      },
      practice: {
        adults: "Draw the three circles and write two or three things in each. Look for the overlap and draft a purpose sentence.",
        adolescents: "Ask two people who know you well: \"What do you think I'm good at, and what do I care about?\" Compare with your own view.",
        kids: "Draw your inside compass and write or draw what matters to you.",
      },
      ifThen: {
        adults: "If I'm facing a difficult choice, then I will ask which option best serves my purpose.",
        adolescents: "If I'm deciding how to spend my time, then I will choose at least one thing that fits who I want to be.",
        kids: "If I don't know what to do, then I will think about what matters to me.",
      },
      check: [
        { q: "Purpose often sits where three things meet. Which three?", options: ["Money, status, power", "What you care about, what you're good at, what others need", "Work, sleep, food", "Likes, followers, shares"], answer: 1, why: "The overlap of care, capability and need is a common way to find purpose." },
        { q: "Does purpose have to be grand?", options: ["Yes, it must change the world", "No, a simple purpose can guide many daily choices", "Only for leaders", "Only for adults"], answer: 1, why: "Everyday purposes are powerful guides." },
        { q: "For teenagers, purpose is closely linked to…", options: ["Popularity", "Identity: who you are and who you want to become", "Marks only", "Fashion"], answer: 1, why: "Discovering identity and purpose go together." },
      ],
      checkKids: [
        { q: "What is \"what matters to me\" like?", options: ["A little compass inside you", "A toy", "A test"], answer: 0, why: "It helps you choose what to do." },
        { q: "Which could matter to someone?", options: ["Family and kindness", "Nothing at all", "Only winning"], answer: 0, why: "Things like family and kindness are special to many people." },
      ],
      journal: {
        adults: "Write your purpose sentence. Then write one decision this month that it would change.",
        adolescents: "Who do you want to become? Write three words and why you chose them.",
        kids: "Draw your inside compass.",
      },
      guide: {
        adults: { discussion: ["How does individual purpose connect to our organisation's purpose?", "When has purpose helped you through a hard time?"], activity: "Three circles: each person completes the purpose diagram and shares the overlap with a partner (voluntary).", minutes: 15 },
        adolescents: { discussion: ["What shapes young people's identity?", "How is identity different online and offline?"], activity: "Identity iceberg: learners draw an iceberg with what people see above the water and what matters most below.", minutes: 15 },
        kids: { discussion: ["What matters to you?", "How is everyone's compass different?"], activity: "Compass craft: children decorate a paper compass with drawings of what matters to them.", minutes: 10 },
      },
    },
    {
      skills: { adults: "Meaning", adolescents: "Meaning", kids: "Hope & wonder" },
      hook: {
        adults: "Two people do the same job. One feels it's pointless; the other feels it matters. What's the difference?",
        adolescents: "Does what you do every day mean anything? How do you know?",
        kids: "Have you ever looked up at the stars and felt amazed?",
      },
      core: `**Meaning** is the sense that your life and work make sense and matter. Purpose points forward; meaning is often found in the present, sometimes even in difficulty.

Ways people find meaning:
- **Contribution**: seeing how your work helps someone.
- **Connection**: relationships and community.
- **Growth**: becoming a better version of yourself.
- **Perspective**: finding something to learn or give, even in hard times.

Meaning often grows when you notice the impact of ordinary work on real people.`,
      coreKids: `**Hope** is believing good things can happen.
**Wonder** is feeling amazed by the world.

You can find wonder in **stars**, **rain**, **seeds growing** and **people being kind**.`,
      example: {
        title: "Viktor Frankl, *Man's Search for Meaning*",
        body: "Austrian psychiatrist Viktor Frankl survived Nazi concentration camps during the Second World War. In *Man's Search for Meaning* (first published in 1946), he described how people could hold on to meaning (through love, through work, and through the attitude they took to unavoidable suffering) even when almost everything else had been taken away. The book has been read widely around the world and continues to influence how people think about meaning in hard times.",
        source: "Viktor E. Frankl, *Man's Search for Meaning* (1946).",
      },
      exampleKids: {
        title: "The seed that grew",
        body: "Siyabonga planted a bean seed in a cup. Every day he watered it and nothing happened. He kept hoping. On day six a tiny green shoot popped up! He felt so amazed. \"It was growing the whole time, I just couldn't see it,\" he said.",
      },
      reflect: {
        adults: "Who benefits from your work, directly or indirectly? When did you last see that impact?",
        adolescents: "What activities make you lose track of time because they feel worthwhile?",
        kids: "What is something that makes you feel amazed?",
      },
      practice: {
        adults: "This week, find out how one piece of your work helped someone (ask a customer, a colleague or a beneficiary). Write down what you learn.",
        adolescents: "Each evening this week, write one thing you did that mattered to someone, even something small.",
        kids: "Go outside with a grown-up and find one thing that makes you say \"Wow!\"",
      },
      ifThen: {
        adults: "If my work starts to feel pointless, then I will think of one person it helps.",
        adolescents: "If my day feels meaningless, then I will do one small helpful thing for someone.",
        kids: "If I feel sad, then I will think of something I'm hopeful about.",
      },
      check: [
        { q: "How is meaning different from purpose?", options: ["They are opposites", "Purpose points forward; meaning is often found in the present", "Meaning is only for religious people", "There is no difference"], answer: 1, why: "Purpose gives direction; meaning is the sense that life matters now." },
        { q: "Which is a source of meaning?", options: ["Seeing how your work helps someone", "Avoiding people", "Only getting rewards", "Being busy"], answer: 0, why: "Contribution is a powerful source of meaning." },
        { q: "What did Frankl describe?", options: ["Meaning can't be found in hardship", "People can hold on to meaning through love, work and attitude, even in suffering", "Meaning comes only from success", "Meaning is the same for everyone"], answer: 1, why: "Frankl described sources of meaning that remain even in great suffering." },
      ],
      checkKids: [
        { q: "What is hope?", options: ["Believing good things can happen", "Being scared", "Giving up"], answer: 0, why: "Hope helps us keep going." },
        { q: "Where can you find wonder?", options: ["In stars, seeds and kindness", "Nowhere", "Only on TV"], answer: 0, why: "Wonder is all around us." },
      ],
      journal: {
        adults: "Write about the most meaningful moment in your working life. What made it meaningful?",
        adolescents: "What makes your life feel meaningful right now? What would make it feel more so?",
        kids: "Draw something that makes you say \"Wow!\"",
      },
      guide: {
        adults: { discussion: ["How visible is the impact of our work to the people doing it?", "How can we bring stories of impact into team meetings?"], activity: "Impact chain: groups trace one piece of everyday work through to the person it ultimately helps.", minutes: 15 },
        adolescents: { discussion: ["Where do young people find meaning?", "Can hard times have meaning?"], activity: "Meaning moments: learners write three moments that felt meaningful this year and look for patterns in small groups.", minutes: 15 },
        kids: { discussion: ["What makes you feel amazed?", "What are you hopeful about?"], activity: "Wonder walk: a short walk around the school grounds to spot things that spark wonder, then draw one.", minutes: 15 },
      },
    },
    {
      skills: { adults: "Faith", adolescents: "Beliefs & belonging", kids: "Belonging" },
      hook: {
        adults: "What do you lean on when plans fail and certainty runs out?",
        adolescents: "Where do you feel you truly belong, where you can be yourself?",
        kids: "Where do you feel safe and loved?",
      },
      core: `**Faith** in Super-Cube® means trust in something beyond what you can prove or control. For many people this is a religious faith; for others it is trust in deeply held values, in people, in community or in the future. Super-Cube® respects every tradition and none.

How faith and belief can support leadership:
- **Steadiness**: an anchor when circumstances are uncertain.
- **Belonging**: communities of shared belief or values offer support.
- **Hope**: trust that effort and goodness are worthwhile.
- **Respect**: leaders who understand their own beliefs are often better at respecting others'.

South Africa's Bill of Rights protects everyone's freedom of conscience, religion, thought, belief and opinion. Inclusive leaders make room for that diversity at work and at school.`,
      coreKids: `**Belonging** means feeling part of a group that cares about you, like your family, class, team or community.

Everyone deserves to belong. You can help others belong by **inviting them in**.`,
      example: {
        title: "Freedom of religion, belief and opinion in South Africa",
        body: "Section 15 of South Africa's Constitution protects everyone's right to freedom of conscience, religion, thought, belief and opinion. South Africa is home to people of many faiths, including Christian, Muslim, Hindu, Jewish and African traditional religions, as well as people with no religious affiliation. During the struggle against apartheid, leaders from many faith communities often worked side by side. Respect for many beliefs is part of South Africa's constitutional foundation.",
        source: "Constitution of the Republic of South Africa, 1996, Section 15.",
      },
      exampleKids: {
        title: "Everyone is welcome",
        body: "Lindo's class made a \"Welcome Wall\". Everyone wrote \"welcome\" in their home language: isiZulu, Afrikaans, English, isiXhosa, Sesotho and more. When a new girl arrived from Malawi, she added \"takulandirani\" in Chichewa. She smiled. She knew she belonged.",
      },
      reflect: {
        adults: "What do you draw on in times of uncertainty? How does it shape the way you lead?",
        adolescents: "Where do you feel you belong? What makes it feel that way?",
        kids: "Who makes you feel like you belong?",
      },
      practice: {
        adults: "Spend ten quiet minutes this week with whatever grounds you (prayer, meditation, reflection, nature or a meaningful text). Note how you feel afterwards.",
        adolescents: "Do one thing this week to help someone else feel they belong, like inviting someone to join you.",
        kids: "Invite someone to play with you who is on their own.",
      },
      ifThen: {
        adults: "If uncertainty starts to unsettle me, then I will take ten minutes for the practice that grounds me.",
        adolescents: "If I see someone left out, then I will invite them in.",
        kids: "If someone is alone, then I will ask them to play.",
      },
      check: [
        { q: "In Super-Cube®, faith means…", options: ["Belonging to one particular religion", "Trust in something beyond what you can prove or control, religious or not", "Never questioning anything", "Certainty about the future"], answer: 1, why: "The definition is inclusive of all traditions and none." },
        { q: "What does Section 15 of South Africa's Constitution protect?", options: ["The right to vote", "Freedom of conscience, religion, thought, belief and opinion", "Property rights", "Freedom of movement"], answer: 1, why: "Section 15 protects freedom of religion, belief and opinion." },
        { q: "How can understanding your own beliefs help you lead?", options: ["It lets you convert others", "It often helps you respect others' beliefs", "It doesn't help", "It means you're always right"], answer: 1, why: "Self-understanding supports respect for diversity." },
      ],
      checkKids: [
        { q: "What does belonging mean?", options: ["Feeling part of a group that cares about you", "Being alone", "Being the boss"], answer: 0, why: "Belonging means you're part of a caring group." },
        { q: "How can you help others belong?", options: ["Invite them in", "Leave them out", "Ignore them"], answer: 0, why: "Inviting others helps everyone belong." },
      ],
      journal: {
        adults: "Write about what anchors you. How does it show up in your leadership?",
        adolescents: "Describe a place or group where you feel you belong. What makes it special?",
        kids: "Draw the people who make you feel you belong.",
      },
      guide: {
        adults: { discussion: ["How do we make people of all faiths and none feel included at work?", "What practical accommodations (prayer times, religious holidays, catering) do we offer?"], activity: "Inclusion check: groups review one team practice (meetings, events, food) for faith inclusivity and suggest one improvement. Personal sharing is voluntary.", minutes: 15 },
        adolescents: { discussion: ["What helps people feel they belong at school?", "How can we respect beliefs different from ours?"], activity: "Belonging circles: learners map the groups they belong to and discuss how to include someone new. Keep the discussion respectful of all faiths and none.", minutes: 15 },
        kids: { discussion: ["How do you feel when you're included?", "How can we welcome new friends?"], activity: "Welcome wall: children write or draw \"welcome\" in different languages, asking families for help.", minutes: 15 },
      },
    },
    {
      skills: { adults: "Transcendence", adolescents: "Transcendent goals", kids: "Helping others" },
      hook: {
        adults: "What will still matter about your leadership 20 years after you've left the role?",
        adolescents: "What's something bigger than yourself that you'd like to be part of?",
        kids: "How does it feel when you help someone?",
      },
      core: `**Transcendence** is going beyond your own interests to serve something larger: other people, future generations, your community or the planet.

It shows up as:
- **Service**: giving time and skill to others.
- **Legacy**: thinking about the long-term impact of your choices.
- **Humility**: seeing yourself as part of something bigger.
- **Gratitude**: recognising what others have given you.

Transcendent goals can be huge or small: mentoring one young person, cleaning up a local river, or building an organisation that outlasts you.`,
      coreKids: `**Helping others** means doing something kind to make someone's day better.

You can help at **home**, at **school** and in your **community**. Even small helps make a big difference!`,
      example: {
        title: "Nelson Mandela International Day",
        body: "In 2009 the United Nations declared 18 July, Mandela's birthday, as Nelson Mandela International Day. People are encouraged to spend 67 minutes in service of others, one minute for each of the 67 years Mandela gave to public service. Schools, companies and communities across South Africa and beyond use the day to volunteer: painting schools, cleaning parks, collecting food and more. It turns a legacy into a shared act of service.",
        source: "United Nations, Nelson Mandela International Day (un.org); Nelson Mandela Foundation.",
      },
      exampleKids: {
        title: "67 minutes of helping",
        body: "On Mandela Day, Grade 2 spent 67 minutes helping. They picked up litter around the school, made cards for an old-age home and planted flowers. When they finished, everyone felt proud and happy. Their teacher said, \"Helping others makes the world brighter.\"",
      },
      reflect: {
        adults: "What legacy do you want your leadership to leave? What are you doing now that builds it?",
        adolescents: "What cause or community do you care about enough to give your time to?",
        kids: "Who could you help this week?",
      },
      practice: {
        adults: "Commit to one act of service this month outside your job description, such as mentoring, volunteering or sharing your skills.",
        adolescents: "Give one hour this month to something bigger than yourself: a community project, helping a neighbour or tutoring a younger learner.",
        kids: "Do one helpful job at home without being asked.",
      },
      ifThen: {
        adults: "If I get caught up in my own pressures, then I will ask, \"Who could I help today?\"",
        adolescents: "If I have free time on a weekend, then I will spend some of it helping someone.",
        kids: "If I see someone who needs help, then I will offer to help.",
      },
      check: [
        { q: "Transcendence means…", options: ["Focusing on your own success", "Going beyond your own interests to serve something larger", "Floating in the air", "Avoiding responsibility"], answer: 1, why: "Transcendence is about serving beyond yourself." },
        { q: "Why 67 minutes on Mandela Day?", options: ["It's a random number", "One minute for each of the 67 years Mandela gave to public service", "It's an hour plus a break", "It was his age"], answer: 1, why: "The 67 minutes honour his years of public service." },
        { q: "Transcendent goals must be…", options: ["Huge and global", "Huge or small; mentoring one person counts", "Paid", "Famous"], answer: 1, why: "Service at any scale counts." },
      ],
      checkKids: [
        { q: "What is helping others?", options: ["Doing something kind to make someone's day better", "Taking things", "Being bossy"], answer: 0, why: "Helping makes others feel cared for." },
        { q: "Where can you help?", options: ["At home, school and in your community", "Nowhere", "Only on holidays"], answer: 0, why: "There are chances to help everywhere." },
      ],
      journal: {
        adults: "Write the paragraph you'd want someone to say about your leadership at your retirement. What would make it true?",
        adolescents: "What's a problem in your community you'd like to help solve? What could you start doing?",
        kids: "Draw yourself helping someone.",
      },
      guide: {
        adults: { discussion: ["How does our organisation contribute beyond its core business?", "What would we want our legacy to be?"], activity: "Legacy letters: each person writes a short letter from the future describing the impact of their leadership. Sharing is voluntary.", minutes: 15 },
        adolescents: { discussion: ["What causes matter to young South Africans?", "How can young people make a difference now?"], activity: "Service sprint: groups plan a 67-minute service activity for the school or community and pick one to do.", minutes: 20 },
        kids: { discussion: ["How does helping make you feel?", "Who helps us at school?"], activity: "Helping hands: each child traces their hand and writes or draws a way they'll help this week.", minutes: 10 },
      },
    },
    {
      skills: { adults: "Spiritual intelligence", adolescents: null, kids: null },
      hook: {
        adults: "Some leaders bring a calm, grounded wisdom into the room. People trust them in a crisis. What are they drawing on?",
      },
      core: `**Spiritual intelligence** is the ability to draw on your deepest values, sense of meaning and wider perspective to act wisely, especially in complex or difficult situations.

It often shows up as:
- **Self-awareness**: knowing your values and noticing when you drift from them.
- **Big-picture perspective**: seeing beyond the immediate crisis.
- **Compassion**: holding high standards with care for people.
- **Integrity under pressure**: staying aligned with your values when it's costly.
- **Reflection**: regular time to step back, whether through prayer, meditation, journalling or quiet thought.`,
      example: {
        title: "Chief Albert Luthuli",
        body: "Chief Albert Luthuli, President-General of the African National Congress from 1952, was awarded the Nobel Peace Prize for 1960, the first African to receive the Peace Prize. He led a non-violent struggle against apartheid while under banning orders that restricted where he could go. He described how his deeply held convictions shaped his commitment to non-violence and to the dignity of all people. His example shows values, perspective and integrity combined under severe pressure.",
        source: "The Nobel Prize (nobelprize.org), Albert Lutuli, Nobel Peace Prize 1960; Albert Luthuli, *Let My People Go* (1962).",
      },
      reflect: {
        adults: "In your hardest leadership moments, what helped you stay grounded and wise?",
      },
      practice: {
        adults: "Set aside 15 minutes at the end of this week for a reflection: Where did I live my values? Where did I drift? What will I do differently?",
      },
      ifThen: {
        adults: "If I face a high-stakes decision, then I will take time to reflect on my values before deciding.",
      },
      check: [
        { q: "Spiritual intelligence is…", options: ["Knowing a lot about religion", "Drawing on deep values, meaning and perspective to act wisely", "Being calm all the time", "Avoiding hard decisions"], answer: 1, why: "It's about wise action rooted in deep values." },
        { q: "Which practice supports spiritual intelligence?", options: ["Never stopping to think", "Regular reflection: prayer, meditation, journalling or quiet thought", "Reacting quickly to everything", "Avoiding values"], answer: 1, why: "Reflection helps you notice drift and realign." },
        { q: "What does Luthuli's example show?", options: ["Values don't matter under pressure", "Values, perspective and integrity combined under severe pressure", "Leaders should avoid conviction", "Peace is easy"], answer: 1, why: "He led with conviction and integrity despite heavy restrictions." },
      ],
      journal: {
        adults: "Write about a leader you've known who showed deep wisdom. What did they do that you'd like to grow in yourself?",
      },
      guide: {
        adults: { discussion: ["How do we make room for reflection in a busy organisation?", "What does wise leadership look like in a crisis?"], activity: "Silent reflection: 5 minutes of guided quiet reflection on the week's values (any approach welcome), followed by optional sharing in pairs.", minutes: 15 },
      },
    },
  ],
};
