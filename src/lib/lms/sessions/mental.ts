import type { FaceContent } from "./types";

export const MENTAL: FaceContent = {
  overview: {
    hook: {
      adults: "Your inbox, your calendar and your team all compete for the same limited thing: your attention. How you think matters more than how much you know.",
      adolescents: "School tests what you know. Life tests how you think: how you plan, solve problems and picture your future.",
      kids: "Your brain is like a muscle. The more you use it in fun, curious ways, the stronger it grows!",
    },
    core: `**Mental** is the thinking face of the cube. Super-Cube® names five skills: **cognitive intelligence** (taking in and making sense of complex information), **strategic thinking**, **problem-solving**, **vision** and **knowledge application**.

Thinking skills grow with the right kind of practice:
- **Learn actively.** Explaining an idea in your own words or testing yourself works better than re-reading.
- **Zoom out, then zoom in.** Start with the big picture and long-term goal, then plan the next concrete step.
- **Use what you learn.** Knowledge only helps when you apply it to a real problem.`,
    coreKids: `**Mental** is about your **thinking brain**: being curious, solving puzzles, dreaming big and learning new things.

Mistakes help your brain grow. Every time you try something hard, you get a little smarter.`,
    example: {
      title: "Learning behind bars: Mandela's law degree",
      body: "Nelson Mandela studied for years while imprisoned, often in very difficult conditions. He completed his LLB through the University of South Africa (UNISA) in 1989, shortly before his release. He later described education as a powerful tool for change. His example shows that thinking and learning are habits you can keep building, whatever your circumstances.",
      source: "Nelson Mandela Foundation; University of South Africa.",
    },
    exampleKids: {
      title: "The library detective",
      body: "Amahle wondered why the moon changes shape. She asked her teacher, found a library book and drew the moon every night for a month. She made a chart and showed the class. Asking \"why?\" made her a real scientist!",
    },
    reflect: {
      adults: "Which of the five thinking skills do you rely on most? Which do you use least?",
      adolescents: "How do you usually study: re-reading, or testing yourself? Which actually sticks?",
      kids: "What is something you are curious about?",
    },
    practice: {
      adults: "After your next meeting or article, close it and write the three key points from memory. Then check what you missed.",
      adolescents: "Tonight, instead of re-reading notes, cover them and write down everything you remember. Then check.",
      kids: "Ask three \"why?\" questions today and try to find one answer.",
    },
    ifThen: {
      adults: "If I finish reading something important, then I will write three takeaways from memory before moving on.",
      adolescents: "If I sit down to study, then I will start by testing myself for five minutes.",
      kids: "If I wonder about something, then I will ask \"why?\" and look for the answer.",
    },
    check: [
      { q: "Which study habit tends to help learning stick best?", options: ["Re-reading notes many times", "Testing yourself and explaining in your own words", "Highlighting everything", "Studying only the night before"], answer: 1, why: "Retrieval practice and self-explanation are among the most effective learning strategies." },
      { q: "\"Zoom out, then zoom in\" means…", options: ["Use a camera", "See the big picture, then plan the next concrete step", "Ignore details", "Only plan long-term"], answer: 1, why: "Strategic thinkers connect the long-term goal to the next action." },
      { q: "What makes knowledge valuable for leaders?", options: ["Having lots of certificates", "Applying it to real problems", "Memorising facts", "Keeping it to yourself"], answer: 1, why: "Knowledge application turns learning into results." },
    ],
    checkKids: [
      { q: "What helps your brain grow?", options: ["Trying hard things and learning from mistakes", "Never trying", "Only doing easy things"], answer: 0, why: "Hard things help your brain grow stronger." },
      { q: "What is a great question for a curious thinker?", options: ["Why?", "Are we done yet?", "Can I stop?"], answer: 0, why: "Asking why helps you learn new things." },
    ],
    journal: {
      adults: "Write about the best learner you know. What do they do differently?",
      adolescents: "What do you want your brain to be really good at in five years?",
      kids: "Draw something you learned this week.",
    },
    guide: {
      adults: { discussion: ["How much time does our team spend thinking versus reacting?", "How do we share what we learn?"], activity: "Teach-back: each person explains one idea from their recent work to a partner in 2 minutes; partner asks one clarifying question.", minutes: 15 },
      adolescents: { discussion: ["What study methods do you use?", "Why might testing yourself feel harder but work better?"], activity: "Quick-quiz each other: pairs write three questions on today's topic and test each other without notes.", minutes: 15 },
      kids: { discussion: ["What are you curious about?", "What do you do when something is hard?"], activity: "Wonder wall: each learner writes or draws a \"why?\" question on a sticky note. Pick one to explore together.", minutes: 10 },
    },
  },

  slots: [
    {
      skills: { adults: "Cognitive intelligence", adolescents: null, kids: "Curious thinking" },
      hook: {
        adults: "You've got 20 minutes to understand a 60-page report before a board meeting. Where do you start?",
        kids: "Have you ever looked at a bug, a cloud or a car and thought, \"How does that work?\"",
      },
      core: `**Cognitive intelligence** in Super-Cube® is your ability to take in complex information, make sense of it and reason clearly. It is not a fixed number. It improves with good thinking habits.

Practical habits:
- **Skim for structure first**: headings, summary, conclusions. Then read the parts that matter.
- **Ask \"so what?\"** after each section: why does this matter for my decision?
- **Look for patterns and gaps**: what's surprising, missing or inconsistent?
- **Protect focus**: one task at a time beats constant switching for complex thinking.`,
      coreKids: `**Curious thinking** means wondering, asking questions and looking closely.

Great thinkers say:
- **"I wonder…"**
- **"Why does that happen?"**
- **"Let me look more closely."**`,
      example: {
        title: "Learning agility: Mandela's long study",
        body: "Mandela's decades of study in prison, including the LLB he completed through UNISA in 1989, are a reminder that making sense of complex ideas is a practised habit. Fellow prisoners organised study groups on Robben Island, sometimes informally called \"the university\", where they debated history, law and politics. They kept their minds sharp in very hard conditions.",
        source: "Nelson Mandela Foundation; Robben Island Museum.",
      },
      exampleKids: {
        title: "The ant watcher",
        body: "Bongani watched ants carrying crumbs in a long line. He wondered, \"How do they know where to go?\" He asked his gran and looked it up with his teacher. Ants leave a smell trail for their friends to follow! Being curious taught him something amazing.",
      },
      reflect: {
        adults: "When you're overloaded with information, what do you do? Does it help you think clearly?",
        kids: "What is something you wonder about?",
      },
      practice: {
        adults: "Take one long document this week. Spend 3 minutes on structure, then write your \"so what?\" in two sentences before reading in detail.",
        kids: "Look closely at something outside for one minute. Say three things you notice.",
      },
      ifThen: {
        adults: "If I need to think deeply, then I will close my email and phone notifications for 25 minutes.",
        kids: "If I see something interesting, then I will say \"I wonder…\" and ask a question.",
      },
      check: [
        { q: "When facing a long report, a smart first step is to…", options: ["Read every word in order", "Skim the structure and summary first", "Skip it", "Ask someone else to read it"], answer: 1, why: "Structure first helps you find what matters quickly." },
        { q: "Which habit helps complex thinking?", options: ["Constant multitasking", "Focusing on one task at a time", "Checking messages every minute", "Working without breaks for hours"], answer: 1, why: "Switching tasks costs attention; focus helps deep thinking." },
        { q: "Cognitive intelligence in Super-Cube® is…", options: ["a fixed IQ number", "making sense of complex information, and improvable with habits", "only about maths", "the same as memory"], answer: 1, why: "It's treated as a developable capability." },
      ],
      checkKids: [
        { q: "What do curious thinkers say?", options: ["I wonder…", "Boring!", "I don't care"], answer: 0, why: "Wondering starts learning." },
        { q: "How can you learn more about something?", options: ["Look closely and ask questions", "Close your eyes", "Run away"], answer: 0, why: "Looking and asking help you discover." },
      ],
      journal: {
        adults: "Describe how you make sense of complex information best. What conditions help you think clearly?",
        kids: "Draw something you looked at closely today.",
      },
      guide: {
        adults: { discussion: ["How do information overload and constant messaging affect our thinking?", "What focus norms could we agree as a team?"], activity: "Give everyone the same short article. 3 minutes to skim, then each person writes their \"so what?\". Compare and discuss differences.", minutes: 15 },
        kids: { discussion: ["What makes you curious?", "Where can we find answers?"], activity: "Mystery bag: learners feel an object in a bag and ask yes/no questions to guess what it is.", minutes: 10 },
      },
    },
    {
      skills: { adults: "Strategic thinking", adolescents: "Strategic thinking", kids: null },
      hook: {
        adults: "If your organisation kept doing exactly what it does today, where would it be in five years? Is that where it needs to be?",
        adolescents: "Matric, a job, university, a gap year: which choices now open the most doors later?",
      },
      core: `**Strategic thinking** is connecting where you are, where you want to be and the few choices that matter most to get there. Strategy is as much about what you *won't* do as what you will.

A simple frame:
1. **Where are we now?** Be honest about strengths and weaknesses.
2. **What's changing around us?** Look at trends, risks and opportunities.
3. **Where do we want to be?** Pick a clear direction.
4. **What are the two or three big bets?** And what will we stop doing to make room?`,
      example: {
        title: "Zipline and Rwanda: starting with the hardest, most valuable problem",
        body: "In 2016, Rwanda's government partnered with the company Zipline to deliver blood to hospitals by drone, among the first national drone delivery services of its kind. Blood is urgent, perishable and hard to transport on difficult roads, so it was a strategic place to start: if the system worked for blood, it could work for other medical supplies. The service later expanded to other products and countries. A focused first bet built the case for growth.",
        source: "Zipline and Government of Rwanda announcements (2016); widely reported.",
      },
      reflect: {
        adults: "What's one thing your team should stop doing to make room for what matters most?",
        adolescents: "What's one choice you're making now that will matter in five years?",
      },
      practice: {
        adults: "Draw the four-step frame for your team on one page. Share it and ask: \"What did I miss?\"",
        adolescents: "Write your five-year goal and the three most important steps this year. Cross out one thing that doesn't help.",
      },
      ifThen: {
        adults: "If a new opportunity appears, then I will ask whether it serves our top two priorities before saying yes.",
        adolescents: "If I'm tempted to say yes to everything, then I will check it against my top goal first.",
      },
      check: [
        { q: "Strategy is as much about…", options: ["what you won't do as what you will", "having long documents", "copying competitors", "being busy"], answer: 0, why: "Saying no makes room for the big bets." },
        { q: "Why was blood delivery a strategic starting point for Zipline in Rwanda?", options: ["It was cheap", "It was urgent, valuable and hard to transport, so success proved the model", "Nobody else wanted it", "It was required by law"], answer: 1, why: "Solving a hard, high-value problem first built the case to expand." },
        { q: "Which question is part of the four-step frame?", options: ["Who can we blame?", "What's changing around us?", "How can we look busy?", "What did we do last year?"], answer: 1, why: "Scanning trends and risks is a core strategic step." },
      ],
      journal: {
        adults: "Write the one-paragraph strategy for your role for the next year. What will you deliberately not do?",
        adolescents: "Write a letter to yourself five years from now. What choices did you make to get there?",
      },
      guide: {
        adults: { discussion: ["What would we stop if we were serious about our top priority?", "Which trends could make our current approach obsolete?"], activity: "Stop/start/continue: each person writes one of each for the team; cluster and vote on the top \"stop\".", minutes: 20 },
        adolescents: { discussion: ["How do subject choices shape future options?", "Who can help you plan?"], activity: "Future map: learners draw a path from today to a five-year goal with three milestones and one possible obstacle.", minutes: 15 },
      },
    },
    {
      skills: { adults: "Problem-solving", adolescents: "Problem-solving", kids: "Solving puzzles" },
      hook: {
        adults: "The same problem keeps coming back every quarter. Are you solving the problem, or the symptom?",
        adolescents: "Your group project is stuck. Everyone has an opinion, nobody has a plan. Where do you start?",
        kids: "Your tower of blocks keeps falling down. What could you try differently?",
      },
      core: `**Problem-solving** is defining a problem clearly, finding root causes, creating options and testing solutions.

A practical cycle:
1. **Define**: write the problem in one sentence. Many teams solve the wrong problem.
2. **Dig**: ask \"why?\" several times to find the root cause, not just the symptom.
3. **Diverge**: generate several options before judging any.
4. **Test small**: try the best option on a small scale, learn and adjust.

Use what you have. Some of the best solutions come from limited resources and fresh eyes.`,
      coreKids: `To **solve a puzzle**:
1. **What's the problem?** Say it out loud.
2. **Try an idea.**
3. **Didn't work?** Try another one! Every try teaches you something.`,
      example: {
        title: "William Kamkwamba's windmill, Malawi",
        body: "During a severe famine in Malawi in the early 2000s, teenager William Kamkwamba had to leave school because his family couldn't pay the fees. Using a library book and scrap materials such as bicycle parts and a broken fan, he built a windmill that generated electricity for his family's home and later helped pump water. He defined the problem (no power, no water for crops), learned what he needed, and tested and improved his design. His story is told in the book *The Boy Who Harnessed the Wind*.",
        source: "William Kamkwamba and Bryan Mealer, *The Boy Who Harnessed the Wind* (2009).",
      },
      exampleKids: {
        title: "The wobbly bridge",
        body: "Lindiwe's class had to build a bridge from paper that could hold a toy car. Her first bridge flopped. She tried folding the paper into a zigzag and it got stronger! She tried again and again until her bridge held three cars.",
      },
      reflect: {
        adults: "Which step do you rush: define, dig, diverge or test?",
        adolescents: "When you're stuck, do you keep trying the same thing, give up, or try something new?",
        kids: "What is a puzzle or problem you solved by trying again?",
      },
      practice: {
        adults: "Pick a recurring problem. Write it in one sentence, then ask \"why?\" five times. Share the root cause with your team.",
        adolescents: "Take one problem (study, sport, money) and write five possible solutions before choosing one to test this week.",
        kids: "Try a puzzle, maze or building challenge. If it doesn't work, try a new idea.",
      },
      ifThen: {
        adults: "If a problem comes back a second time, then I will ask \"why?\" five times before fixing it again.",
        adolescents: "If I'm stuck, then I will write three different ideas before asking for help.",
        kids: "If something doesn't work, then I will say \"Let me try another way.\"",
      },
      check: [
        { q: "Why ask \"why?\" several times?", options: ["To annoy people", "To find the root cause, not just the symptom", "To delay decisions", "Because it's a rule"], answer: 1, why: "Repeated whys dig beneath symptoms to the root cause." },
        { q: "What should you do before judging options?", options: ["Pick the first one", "Generate several options", "Ask the boss", "Vote immediately"], answer: 1, why: "Diverging first leads to better solutions." },
        { q: "What did Kamkwamba's windmill show about problem-solving?", options: ["You need lots of money", "Learning and testing with limited resources can solve real problems", "Only experts can solve problems", "Problems solve themselves"], answer: 1, why: "He defined the problem, learned, built and improved with what he had." },
      ],
      checkKids: [
        { q: "If your idea doesn't work, you can…", options: ["try another idea", "give up forever", "cry and stop"], answer: 0, why: "Every try teaches you something." },
        { q: "What's the first step in solving a problem?", options: ["Say what the problem is", "Run away", "Blame someone"], answer: 0, why: "Knowing the problem helps you solve it." },
      ],
      journal: {
        adults: "Write about a problem you solved creatively. What helped you see it differently?",
        adolescents: "What problem in your community would you love to solve? What's one first step?",
        kids: "Draw a problem you solved.",
      },
      guide: {
        adults: { discussion: ["Which recurring problems do we keep patching?", "How do we make it safe to test small and fail?"], activity: "5 Whys in pairs on a real recurring issue, then share root causes and one small test for next week.", minutes: 20 },
        adolescents: { discussion: ["What problems matter to young people in your area?", "What's the difference between a symptom and a cause?"], activity: "Design challenge: groups use scrap paper and tape to build the tallest free-standing tower in 10 minutes, then reflect on how they solved problems.", minutes: 20 },
        kids: { discussion: ["What do you do when something is tricky?", "How does trying again help?"], activity: "Paper bridge challenge: build a bridge from one sheet of paper to hold coins. Try, test, improve.", minutes: 15 },
      },
    },
    {
      skills: { adults: "Vision", adolescents: "Vision for your future", kids: "Big ideas" },
      hook: {
        adults: "Can every person on your team describe, in one sentence, what you're building together and why?",
        adolescents: "If nothing could stop you, what would your life look like at 30?",
        kids: "If you could make one thing in the world better, what would it be?",
      },
      core: `**Vision** is a clear, compelling picture of a better future that guides today's choices. A good vision is **specific enough to steer by** and **meaningful enough to care about**.

A vision becomes powerful when:
- **It's shared**: people see themselves in it.
- **It's concrete**: you can picture it.
- **It connects to action**: there's a first step people can take now.

Visionary leaders keep telling the story of where we're going, and keep linking small wins back to it.`,
      coreKids: `A **big idea** is a dream for how things could be better.

Big ideas start small: **dream it**, **draw it**, **take one step**.`,
      example: {
        title: "Wangari Maathai and the Green Belt Movement",
        body: "In 1977 Kenyan environmentalist Wangari Maathai founded the Green Belt Movement, which encouraged women to plant trees to restore land, protect water sources and earn an income. What started with a few seedlings grew into a movement that has planted millions of trees. In 2004 she became the first African woman to receive the Nobel Peace Prize. Her vision linked the environment, livelihoods and democracy, and gave ordinary people a first step they could take: plant a tree.",
        source: "Green Belt Movement (greenbeltmovement.org); The Nobel Prize (nobelprize.org), 2004.",
      },
      exampleKids: {
        title: "One tree at a time",
        body: "A woman in Kenya called Wangari Maathai saw that trees were being cut down and the land was getting dry. She had a big idea: plant trees! She started with a few seedlings. Lots of people joined her, and together they planted millions of trees.",
      },
      reflect: {
        adults: "If you asked five people on your team to describe the vision, would you get the same answer?",
        adolescents: "What future do you want? What's one thing you're doing now that moves you towards it?",
        kids: "What is your big idea to make the world better?",
      },
      practice: {
        adults: "Write your team's vision in one sentence a 12-year-old would understand. Test it on three people.",
        adolescents: "Make a simple vision board (on paper or your phone) with three images of your future and one first step.",
        kids: "Draw your big idea and one small step you can take this week.",
      },
      ifThen: {
        adults: "If I announce a team win, then I will link it back to our vision in one sentence.",
        adolescents: "If I lose motivation, then I will look at my vision board and do one small step.",
        kids: "If I have a big idea, then I will draw it and share it with someone.",
      },
      check: [
        { q: "A good vision is…", options: ["long and complicated", "specific enough to steer by and meaningful enough to care about", "secret", "only for the CEO"], answer: 1, why: "Clarity and meaning make a vision useful." },
        { q: "What made the Green Belt Movement's vision powerful?", options: ["It was very expensive", "It linked a big goal to a simple first step people could take", "It was only for scientists", "It happened overnight"], answer: 1, why: "Planting a tree gave everyone a way to act on the vision." },
        { q: "How do leaders keep a vision alive?", options: ["Mention it once a year", "Keep linking small wins back to it", "Change it monthly", "Keep it on a poster only"], answer: 1, why: "Repeatedly linking actions to the vision builds momentum." },
      ],
      checkKids: [
        { q: "How do big ideas start?", options: ["With one small step", "All at once", "Only when you're grown up"], answer: 0, why: "Every big idea starts with a small step." },
        { q: "What did Wangari Maathai do?", options: ["Planted trees with many people", "Built a rocket", "Painted a house"], answer: 0, why: "Her big idea was planting trees to help the land." },
      ],
      journal: {
        adults: "Describe the future you want your leadership to create. What would people say about it in ten years?",
        adolescents: "Write a one-sentence vision for your life. What's one thing you'll do this month?",
        kids: "Draw the world with your big idea in it.",
      },
      guide: {
        adults: { discussion: ["How consistently do we describe our vision?", "Where do people lose sight of it in daily work?"], activity: "Each person writes the team vision in one sentence without looking. Compare and craft a shared version together.", minutes: 20 },
        adolescents: { discussion: ["What does success mean to you, beyond money?", "Who inspires your vision?"], activity: "Vision boards: learners create a one-page collage or sketch of their future with three milestones.", minutes: 20 },
        kids: { discussion: ["What would you change to make your school better?", "How can we start?"], activity: "Big idea posters: small groups draw a big idea for the classroom and choose one step to do this week.", minutes: 15 },
      },
    },
    {
      skills: { adults: "Knowledge application", adolescents: "Applying knowledge", kids: "Learning new things" },
      hook: {
        adults: "You've done the course and read the book. Six weeks later, what are you actually doing differently?",
        adolescents: "When will you ever use this? It's a fair question, and a good one to answer for yourself.",
        kids: "What's something you learned that you now use every day, like tying your shoes?",
      },
      core: `**Knowledge application** is turning what you know into action in a specific, real context. Knowing isn't the same as doing.

Ways to close the knowing–doing gap:
- **Translate**: after learning something, write \"This means I will…\"
- **Apply within 48 hours**: use one idea quickly, while it's fresh.
- **Adapt to context**: what works elsewhere may need adjusting here.
- **Teach it**: explaining to someone else deepens your understanding.`,
      coreKids: `**Learning new things** is like adding tools to your toolbox.

The best way to keep a new skill is to **use it**, **practise it** and **teach it** to someone else.`,
      example: {
        title: "South Africa's genomic scientists and the Omicron variant, 2021",
        body: "In November 2021, scientists in South Africa's Network for Genomic Surveillance, together with colleagues in Botswana, detected and reported a new coronavirus variant, later named Omicron by the World Health Organization. Years of investment in genomic knowledge and lab networks were applied quickly to a real-world emergency, and the findings were shared openly with the world. It's a strong example of expertise turned into timely, transparent action.",
        source: "World Health Organization statement on Omicron (26 November 2021); Network for Genomic Surveillance in South Africa.",
      },
      exampleKids: {
        title: "Teaching gogo",
        body: "Sizwe learned how to make video calls at school. At home he taught his gogo how to call her sister in Durban. She was so happy! Sizwe found that teaching his gogo helped him remember the steps too.",
      },
      reflect: {
        adults: "What's one thing you learned in the last year that you still haven't applied?",
        adolescents: "Which school subject could help you with something in your life right now?",
        kids: "What new thing did you learn recently?",
      },
      practice: {
        adults: "Choose one idea from this course. Write \"This means I will…\" and apply it within 48 hours. Note what happened.",
        adolescents: "Use one thing from class in real life this week (maths for budgeting, science in the kitchen, history in the news).",
        kids: "Teach someone at home one new thing you learned.",
      },
      ifThen: {
        adults: "If I learn a useful idea, then I will write \"This means I will…\" and schedule it within 48 hours.",
        adolescents: "If I learn something new in class, then I will look for one way to use it that week.",
        kids: "If I learn something new, then I will teach it to someone at home.",
      },
      check: [
        { q: "What is the knowing–doing gap?", options: ["Not knowing enough", "Knowing something but not acting on it", "Doing without thinking", "Forgetting names"], answer: 1, why: "The gap is between understanding and action." },
        { q: "Why apply a new idea within 48 hours?", options: ["It's a legal rule", "While it's fresh, it's more likely to become a habit", "Ideas expire", "To impress others"], answer: 1, why: "Quick application helps learning stick." },
        { q: "What does the Omicron detection show?", options: ["Science is slow", "Expertise applied quickly and shared openly can help the world", "Only big countries do science", "Knowledge should be kept secret"], answer: 1, why: "Years of knowledge were put to work fast and transparently." },
      ],
      checkKids: [
        { q: "What's a great way to remember something new?", options: ["Teach it to someone", "Forget it", "Hide it"], answer: 0, why: "Teaching helps you remember." },
        { q: "New skills are like…", options: ["tools in your toolbox", "rubbish", "rain"], answer: 0, why: "You can use them whenever you need them." },
      ],
      journal: {
        adults: "Write about a time you successfully applied something you learned. What made it work?",
        adolescents: "What's the most useful thing you've learned this year, in or out of school?",
        kids: "Draw yourself teaching someone something new.",
      },
      guide: {
        adults: { discussion: ["What stops learning turning into action in our team?", "How could we share applied learning more often?"], activity: "Each person writes one \"This means I will…\" from the session and pairs up as accountability partners for 48 hours.", minutes: 10 },
        adolescents: { discussion: ["When have you used school learning in real life?", "Why does teaching help you learn?"], activity: "Mini-teach: learners teach a partner a skill in 3 minutes (a game, a recipe, a maths trick).", minutes: 15 },
        kids: { discussion: ["What can you do now that you couldn't do last year?", "Who taught you?"], activity: "Skill swap: in pairs, each child teaches the other something simple (a clap pattern, a word in another language).", minutes: 10 },
      },
    },
  ],
};
