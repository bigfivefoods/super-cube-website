import type { FaceContent } from "./types";

/**
 * Physical face: general wellbeing only. No diagnosis, treatment or diet plans.
 * The renderer adds a "consult a health professional" note to every Physical session.
 */
export const PHYSICAL: FaceContent = {
  overview: {
    hook: {
      adults: "You'd never run a critical system without maintenance. Yet many leaders run their own bodies on caffeine, short nights and back-to-back meetings.",
      adolescents: "Sleep, movement, food and downtime aren't extras. They're the battery that powers everything else you want to do.",
      kids: "Your body is amazing! It helps you run, play, think and learn. Let's learn how to look after it.",
    },
    core: `**Physical** is the foundation face of the cube. Super-Cube® names five skills: **physical health**, **energy management**, **fitness**, **nutrition** and **bodily resilience**.

The idea is simple: **your body is part of your leadership**. Sleep, movement, food and recovery affect focus, mood, patience and decision-making.

This course is about everyday wellbeing habits. It is **not** medical advice. If you have a health condition, an injury or concerns about eating, sleep or exercise, please speak to a doctor or another qualified health professional before making changes.

Start small: one habit at a time, practised consistently, beats a big plan that lasts a week.`,
    coreKids: `**Physical** is about looking after your **body**.

Your body needs:
- **Moving** and playing
- **Sleep** and rest
- **Water** and healthy food
- **Grown-ups** to help when you feel sick or hurt`,
    example: {
      title: "Mandela's daily exercise in prison",
      body: "In *Long Walk to Freedom*, Nelson Mandela describes keeping up an exercise routine during his long imprisonment, including running on the spot and doing push-ups and sit-ups in his small cell. He had been a keen boxer and runner as a young man. He saw looking after his body as part of keeping his mind steady and his spirit strong, even when he had almost no control over anything else.",
      source: "Nelson Mandela, *Long Walk to Freedom* (1994).",
    },
    exampleKids: {
      title: "The morning wake-up dance",
      body: "Every morning Mr Naidoo's class does a two-minute wake-up dance. They stretch up high, wiggle, jump and shake. Afterwards everyone feels ready to learn. Mr Naidoo says, \"Happy bodies help happy brains!\"",
    },
    reflect: {
      adults: "Which part of your physical wellbeing (sleep, movement, food or recovery) most affects how you lead? Which gets the least attention?",
      adolescents: "How do you feel on days after a good night's sleep compared with a short one?",
      kids: "What is your favourite way to move your body?",
    },
    practice: {
      adults: "For one week, note your energy (1–5) at 10:00 and 15:00 alongside sleep and movement. Look for one pattern.",
      adolescents: "Pick one physical habit (bedtime, water, a walk) and do it every day for seven days.",
      kids: "Move your body for fun today: dance, skip, run or play outside with a grown-up's OK.",
    },
    ifThen: {
      adults: "If I've been sitting for an hour, then I will stand up, stretch and walk for two minutes.",
      adolescents: "If it's 30 minutes before bedtime, then I will put my phone away.",
      kids: "If I feel tired and wiggly, then I will stretch up high and take a big breath.",
    },
    check: [
      { q: "Why does Super-Cube® include a Physical face?", options: ["To train athletes", "Because sleep, movement, food and recovery affect how you lead", "To give medical advice", "It's optional"], answer: 1, why: "Physical wellbeing underpins focus, mood and decisions." },
      { q: "If you have a health condition and want to change your exercise or eating, you should…", options: ["Follow an online plan", "Speak to a doctor or qualified health professional first", "Ask a friend", "Just start"], answer: 1, why: "This course is general wellbeing, not medical advice." },
      { q: "What tends to work best for building physical habits?", options: ["A big plan all at once", "One small habit practised consistently", "Waiting for motivation", "Only exercising on weekends"], answer: 1, why: "Small, consistent habits last longer." },
    ],
    checkKids: [
      { q: "What does your body need?", options: ["Moving, sleep, water and healthy food", "Only sweets", "Only TV"], answer: 0, why: "Your body needs all of these to feel good." },
      { q: "If you feel sick or hurt, you should…", options: ["Tell a grown-up", "Keep it secret", "Keep playing"], answer: 0, why: "Grown-ups can help you feel better." },
    ],
    journal: {
      adults: "Describe how you feel and lead on your best-energy days. What's different about how you looked after yourself?",
      adolescents: "What's one physical habit you're proud of? What's one you'd like to build?",
      kids: "Draw yourself doing your favourite active thing.",
    },
    guide: {
      adults: { discussion: ["How does our work culture affect people's sleep and recovery?", "What would a healthier meeting rhythm look like?"], activity: "Energy audit: each person sketches their typical daily energy curve and identifies one change to protect their peak hours.", minutes: 15 },
      adolescents: { discussion: ["How do screens affect sleep?", "What makes it hard to look after your body at school?"], activity: "Habit swap: learners list three current habits and choose one small swap to try this week. Keep it general; refer any health concerns to a school nurse or doctor.", minutes: 15 },
      kids: { discussion: ["How do you feel after playing outside?", "What helps you sleep well?"], activity: "Body-break game: \"Simon says\" with stretches, jumps and balance moves.", minutes: 10 },
    },
  },

  slots: [
    {
      skills: { adults: "Physical health", adolescents: "Health & energy", kids: null },
      hook: {
        adults: "When did you last have a routine health check? Many leaders schedule their car's service more reliably than their own.",
        adolescents: "Headaches, low energy, can't focus? Sometimes the fix is simpler than you think: sleep, water, food, movement.",
      },
      core: `**Physical health** is the everyday condition of your body: how well you sleep, move, eat, recover and look after any health needs.

Leaders with strong physical-health habits tend to:
- **Treat sleep as non-negotiable**: protect a regular bedtime and wake time.
- **Move every day**: walking counts.
- **Stay on top of check-ups**: see a health professional for routine checks and any concerns.
- **Notice early signals**: ongoing tiredness, pain or low mood deserve attention, not just more coffee.

This is general wellbeing guidance. For personal advice, speak to a doctor, nurse or clinic.`,
      example: {
        title: "parkrun in South Africa",
        body: "parkrun is a free, weekly, timed 5 km walk or run held in parks and open spaces. South Africa's first parkrun took place in Johannesburg in 2011, and the country now has one of the largest parkrun communities in the world. Many participants walk rather than run. Volunteers make it happen. It shows how a simple, social, regular habit can make physical health part of everyday community life.",
        source: "parkrun South Africa (parkrun.co.za).",
      },
      reflect: {
        adults: "Which early signals from your body do you tend to ignore when work is busy?",
        adolescents: "What's one thing that drains your energy that you could change?",
      },
      practice: {
        adults: "Book any overdue routine health check this week, and set a consistent wake-up time for seven days.",
        adolescents: "For one week, keep a simple log: bedtime, water, movement and energy level (1–5). Spot one pattern.",
      },
      ifThen: {
        adults: "If I feel unusually tired for more than a couple of weeks, then I will book a check-up rather than push through.",
        adolescents: "If I feel low on energy in the afternoon, then I will drink water and move for five minutes before reaching for sugar.",
      },
      check: [
        { q: "Which is a strong physical-health habit?", options: ["Sleeping whenever possible", "A regular bedtime and wake time", "Skipping check-ups if you feel fine", "Pushing through ongoing pain"], answer: 1, why: "Consistent sleep timing supports health and energy." },
        { q: "Ongoing tiredness or pain should be…", options: ["Ignored", "Checked by a health professional", "Treated with more coffee", "Kept secret"], answer: 1, why: "Early signals deserve professional attention." },
        { q: "What does parkrun illustrate?", options: ["Only elite athletes exercise", "Simple, social, regular habits can support health", "Running must be fast", "Exercise is expensive"], answer: 1, why: "Free, community-based, regular activity makes health habits easier." },
      ],
      journal: {
        adults: "Write about what being physically healthy enables you to do as a leader, at work and at home.",
        adolescents: "What does feeling healthy and energetic let you do that you love?",
      },
      guide: {
        adults: { discussion: ["How can we normalise taking time for health appointments?", "What signals of burnout should we watch for in each other?"], activity: "Each person picks one health \"maintenance\" action (check-up, sleep routine, daily walk) and shares it with an accountability partner.", minutes: 10 },
        adolescents: { discussion: ["What drains young people's energy most?", "Where can you get trustworthy health information?"], activity: "Energy log challenge: learners design a simple one-week log and agree to share one insight next session. Remind them to talk to a trusted adult, nurse or doctor about any health worries.", minutes: 15 },
      },
    },
    {
      skills: { adults: "Energy management", adolescents: "Stress & recovery", kids: "Rest & energy" },
      hook: {
        adults: "Time is fixed, but energy isn't. Two leaders with the same calendar can end the week in very different states. What's the difference?",
        adolescents: "Exams, sport, friends, family, part-time work: when do you actually recover?",
        kids: "How do you feel after a good night's sleep? And after a late night?",
      },
      core: `**Energy management** is planning your work and life around your energy, not just your time. Performance comes from cycles of **effort** and **recovery**.

Practical habits:
- **Know your peak**: do your hardest thinking when your energy is highest.
- **Take real breaks**: short breaks away from screens help you reset.
- **Recover on purpose**: sleep, time outdoors, hobbies, people you enjoy and faith or quiet time all count.
- **Watch the stress signals**: irritability, poor sleep and forgetfulness are signs to slow down.

If stress feels overwhelming or won't lift, speak to someone you trust or a health professional. Asking for help is a strength.`,
      coreKids: `Your body is like a **phone battery**. Playing and learning use energy. **Sleep and rest charge you up!**

Ways to recharge:
- A good night's sleep
- Quiet time with a book
- Drinking water
- A big hug`,
      example: {
        title: "Eliud Kipchoge's training camp",
        body: "Kenyan marathon runner Eliud Kipchoge, the first person to run a marathon distance in under two hours (in a special event in Vienna in 2019, not an official race record), is known for a simple, disciplined routine at his training camp in Kaptagat. Reports describe hard training balanced with rest, early nights, shared chores and quiet time. Even among elite athletes, recovery is treated as part of the work, not a break from it.",
        source: "INEOS 1:59 Challenge (2019); widely reported profiles of Kipchoge's training camp.",
      },
      exampleKids: {
        title: "Charging up",
        body: "Nomsa stayed up very late watching TV. The next day she felt grumpy and couldn't concentrate. That night she went to bed on time with a story. In the morning she felt happy and full of energy. \"My battery is charged!\" she said.",
      },
      reflect: {
        adults: "When in the day is your energy highest? Is that when you do your most important work?",
        adolescents: "What do you do to recover from stress? Does it actually recharge you, or just distract you?",
        kids: "What helps you feel rested and full of energy?",
      },
      practice: {
        adults: "Block your best-energy 90 minutes for deep work three days this week, and take a 5–10 minute screen-free break every couple of hours.",
        adolescents: "Choose one real recovery activity (walk, music, time with a friend, quiet time) and schedule it three times this week.",
        kids: "Go to bed on time every night this week and see how you feel.",
      },
      ifThen: {
        adults: "If I notice irritability or poor sleep building up, then I will plan one recovery block and review my week's load.",
        adolescents: "If I feel stressed during exams, then I will take a ten-minute walk or stretch break.",
        kids: "If I feel grumpy and tired, then I will rest or ask for quiet time.",
      },
      check: [
        { q: "Performance comes from cycles of…", options: ["Work and more work", "Effort and recovery", "Coffee and sugar", "Meetings and email"], answer: 1, why: "Recovery is what makes sustained effort possible." },
        { q: "Which is a sign you may need to slow down?", options: ["Feeling rested", "Irritability, poor sleep and forgetfulness", "Laughing a lot", "Being curious"], answer: 1, why: "These are common stress signals." },
        { q: "What does Kipchoge's routine suggest about recovery?", options: ["Only beginners need rest", "Recovery is part of the work", "Rest is lazy", "Train every hour"], answer: 1, why: "Elite performers build rest into their routines." },
      ],
      checkKids: [
        { q: "What charges your body's battery?", options: ["Sleep and rest", "Staying up late", "Skipping meals"], answer: 0, why: "Sleep and rest give you energy." },
        { q: "If you feel tired and grumpy, you can…", options: ["Rest or have quiet time", "Run around faster", "Stay up later"], answer: 0, why: "Rest helps you recharge." },
      ],
      journal: {
        adults: "Describe your ideal week from an energy point of view. What would need to change to get closer to it?",
        adolescents: "What really recharges you? How can you make more time for it?",
        kids: "Draw what you do to recharge your battery.",
      },
      guide: {
        adults: { discussion: ["Does our culture reward always being \"on\"?", "How could we protect focus time as a team?"], activity: "Energy mapping: each person plots their energy across a typical day and swaps one task to match their peak.", minutes: 15 },
        adolescents: { discussion: ["What's the difference between distraction and recovery?", "Who can you talk to if stress feels too much?"], activity: "Recovery menu: groups list 20 recovery activities (free, quick, social, solo). Each learner picks three. Share school counselling or helpline information.", minutes: 15 },
        kids: { discussion: ["Why do we need sleep?", "What helps you feel calm at bedtime?"], activity: "Battery chart: children colour a battery to show their energy at the start and end of the day and talk about what charged it.", minutes: 10 },
      },
    },
    {
      skills: { adults: "Fitness", adolescents: "Fitness habits", kids: "Moving your body" },
      hook: {
        adults: "You don't need a gym membership to lead with more energy. You need a habit you'll actually keep.",
        adolescents: "Sport isn't the only way to stay fit. What kind of movement do you actually enjoy?",
        kids: "Can you hop like a frog? Stretch like a giraffe? Moving is fun!",
      },
      core: `**Fitness** is your body's capacity to move, carry effort and recover. For leaders, it's less about performance and more about **consistent movement** that supports energy, mood and focus.

General guidance from the World Health Organization encourages adults to be physically active through the week and to sit less, and encourages children and teenagers to be active every day. Any movement is better than none.

Make it easy to keep:
- **Enjoy it**: walk, dance, play a sport, garden or cycle.
- **Stack it**: attach movement to something you already do (walking meetings, stairs, a stretch after brushing teeth).
- **Start where you are**: build up gradually.

If you have a health condition, an injury or haven't been active for a while, check with a health professional before starting something new.`,
      coreKids: `**Moving your body** makes your heart strong, your muscles happy and your brain ready to learn.

You can move by **running**, **dancing**, **skipping**, **climbing**, **swimming** or **playing games**. Try to be active every day!`,
      example: {
        title: "The Comrades Marathon",
        body: "The Comrades Marathon, first run in 1921, is an ultramarathon of roughly 90 km between Durban and Pietermaritzburg in KwaZulu-Natal, and one of the oldest and best-known ultramarathons in the world. Thousands of ordinary runners take part each year, many of whom build up over years from much shorter distances. You don't need to run Comrades. Its lesson is that fitness is built gradually and consistently, often with the support of a club or community.",
        source: "Comrades Marathon Association (comrades.com).",
      },
      exampleKids: {
        title: "Skipping champions",
        body: "At break time, Grade 3 started a skipping rope club. At first Zara could only do three skips. She practised every day with her friends. After a few weeks she could do 30 in a row! Moving together made it fun.",
      },
      reflect: {
        adults: "What kind of movement have you enjoyed in the past? What got in the way of keeping it up?",
        adolescents: "What movement do you enjoy most? How could you do more of it?",
        kids: "What is your favourite game to play outside?",
      },
      practice: {
        adults: "Add one \"movement stack\" to your day this week, such as a walking call, taking the stairs or a short walk after lunch.",
        adolescents: "Try a new kind of movement this week (a dance video, a walk with a friend, a sport you haven't tried).",
        kids: "Play an active game every day this week.",
      },
      ifThen: {
        adults: "If I have a phone call that doesn't need a screen, then I will take it walking.",
        adolescents: "If I've been on my phone for an hour, then I will get up and move for ten minutes.",
        kids: "If it's break time, then I will play an active game.",
      },
      check: [
        { q: "For leaders, fitness is mostly about…", options: ["Winning races", "Consistent movement that supports energy, mood and focus", "Expensive equipment", "Looking a certain way"], answer: 1, why: "Regular movement matters more than performance." },
        { q: "What is \"habit stacking\"?", options: ["Doing all exercise at once", "Attaching movement to something you already do", "Stacking weights", "Skipping rest days"], answer: 1, why: "Linking a new habit to an existing one makes it easier to keep." },
        { q: "Before starting something new after a long break or with a health condition, you should…", options: ["Go all out", "Check with a health professional", "Copy a celebrity's plan", "Not bother"], answer: 1, why: "Safety first: get personal advice." },
      ],
      checkKids: [
        { q: "What does moving your body help?", options: ["Your heart, muscles and brain", "Nothing", "Only your feet"], answer: 0, why: "Moving helps your whole body and brain." },
        { q: "Which is a fun way to move?", options: ["Dancing", "Sitting all day", "Sleeping in class"], answer: 0, why: "Dancing is a fun way to be active." },
      ],
      journal: {
        adults: "How does your mood or thinking change after you move? Write about a recent example.",
        adolescents: "Describe a time movement made you feel better. What were you doing?",
        kids: "Draw yourself playing your favourite active game.",
      },
      guide: {
        adults: { discussion: ["How could we build more movement into our working day?", "What would make walking meetings normal here?"], activity: "Walking pairs: run the next part of the session as a 10-minute walking discussion (offer a seated option for anyone who prefers).", minutes: 15 },
        adolescents: { discussion: ["Why do many young people stop sport in high school?", "How can movement be fun without competition?"], activity: "Movement menu: groups list ways to be active that cost nothing. Make sure options suit all abilities.", minutes: 15 },
        kids: { discussion: ["How do you feel after running?", "What games can everyone play?"], activity: "Animal moves: children move like different animals (frog jumps, bear crawls, flamingo balance). Adapt for all abilities.", minutes: 10 },
      },
    },
    {
      skills: { adults: "Nutrition", adolescents: null, kids: "Healthy food" },
      hook: {
        adults: "The 15:00 slump, the boardroom biscuits, the skipped lunch: what you eat during a working day shapes how you think through it.",
        kids: "Can you name a fruit or vegetable for every colour of the rainbow?",
      },
      core: `**Nutrition** in Super-Cube® is about everyday eating habits that support steady energy and focus. It is **not** a diet plan.

General, widely shared principles:
- **Regular meals**: skipping meals often leads to energy dips.
- **Variety**: a range of vegetables, fruit, whole grains and protein sources.
- **Water**: keep water nearby during the day.
- **Notice patterns**: which foods leave you energised, and which leave you sluggish?

Everyone's needs are different. Culture, budget, faith, health conditions and allergies all matter. For personal advice, speak to a doctor or registered dietitian. If you're worried about your relationship with food, please reach out to a health professional.`,
      coreKids: `**Healthy food** gives your body energy to play and learn.

- Try to **eat a rainbow** of fruit and vegetables.
- **Drink water** during the day.
- Treats are fine **sometimes**.
- Always ask a grown-up about allergies or food you're not sure about.`,
      example: {
        title: "South Africa's National School Nutrition Programme",
        body: "Through the National School Nutrition Programme, the Department of Basic Education provides meals to learners at many public schools, particularly in poorer communities. The programme recognises a simple truth: hungry children struggle to concentrate and learn. Many schools also run food gardens linked to the programme. It's a reminder that nutrition is about access and community as well as personal choices.",
        source: "Department of Basic Education, National School Nutrition Programme (education.gov.za).",
      },
      exampleKids: {
        title: "The school garden",
        body: "Mrs Mokoena's class planted a vegetable garden. They grew spinach, carrots and tomatoes. When the vegetables were ready, they helped make a big pot of soup. Even children who said they didn't like spinach tried some, because they had grown it themselves!",
      },
      reflect: {
        adults: "How do your eating patterns on busy days affect your energy and mood?",
        kids: "What is your favourite fruit or vegetable?",
      },
      practice: {
        adults: "For three workdays, keep water on your desk and plan a proper lunch break away from your screen. Notice your afternoon energy.",
        kids: "Try to eat three different colours of fruit or vegetables today. Ask a grown-up to help.",
      },
      ifThen: {
        adults: "If I feel the afternoon slump coming, then I will drink a glass of water and take a short walk first.",
        kids: "If I feel thirsty, then I will drink water.",
      },
      check: [
        { q: "In Super-Cube®, nutrition is about…", options: ["Strict diet plans", "Everyday habits that support steady energy", "Counting every calorie", "Cutting out food groups"], answer: 1, why: "The focus is general wellbeing habits, not diets." },
        { q: "For personal nutrition advice, you should speak to…", options: ["A social media influencer", "A doctor or registered dietitian", "Anyone at work", "Nobody"], answer: 1, why: "Personal advice should come from qualified professionals." },
        { q: "What does the National School Nutrition Programme recognise?", options: ["Food doesn't affect learning", "Hungry children struggle to concentrate and learn", "Only sport needs food", "Children should cook for themselves"], answer: 1, why: "Access to food supports learning." },
      ],
      checkKids: [
        { q: "What does \"eat a rainbow\" mean?", options: ["Eat fruit and vegetables of different colours", "Eat coloured sweets", "Eat paint"], answer: 0, why: "Different colours give your body different good things." },
        { q: "What's the best drink for your body during the day?", options: ["Water", "Fizzy drinks only", "Nothing"], answer: 0, why: "Water keeps your body working well." },
      ],
      journal: {
        adults: "Write about how food fits into your working day. What's one small change that would help your energy?",
        kids: "Draw a rainbow plate of food.",
      },
      guide: {
        adults: { discussion: ["How do our meeting schedules affect people's ability to eat properly?", "How can we make catering at events more inclusive (faith, culture, allergies)?"], activity: "Workday design: groups redesign a typical meeting-heavy day to include a real lunch break and water. Avoid discussing individual bodies or diets.", minutes: 15 },
        kids: { discussion: ["What fruit and vegetables do you know?", "Why do we drink water?"], activity: "Rainbow sort: children sort pictures of foods by colour. Be sensitive to family circumstances; avoid labelling any child's lunch as good or bad.", minutes: 10 },
      },
    },
    {
      skills: { adults: "Bodily resilience", adolescents: "Resilience under load", kids: "Feeling strong" },
      hook: {
        adults: "A crisis week, a long-haul flight, a new baby, a restructure: life will test your body. Resilience is built before the test, not during it.",
        adolescents: "Exam season, a big tournament, a tough week at home: how do you keep going without burning out?",
        kids: "When you fall down, what helps you get back up?",
      },
      core: `**Bodily resilience** is your body's ability to handle demanding periods and recover well afterwards. It's built through consistent everyday habits, so you have reserves when you need them.

Building resilience:
- **Protect the basics in hard times**: sleep, water, food and movement matter most when you're busiest.
- **Plan recovery after big efforts**: schedule lighter days after demanding weeks.
- **Use your support system**: family, friends, colleagues and community.
- **Know your limits**: pushing through illness or injury usually makes things worse. Rest and get help.

If you're struggling physically or emotionally, talk to someone you trust or a health professional.`,
      coreKids: `**Feeling strong** isn't only about muscles. It's about **getting back up** when things are hard.

Strong kids:
- **Rest** when they are tired or sick
- **Ask for help** when they need it
- **Try again** after falling down`,
      example: {
        title: "Coming back stronger: van Niekerk's return from injury",
        body: "After setting the 400m world record at Rio 2016, Wayde van Niekerk suffered a serious knee injury in 2017 during a celebrity touch rugby match. The recovery took years of rehabilitation, patience and professional support before he returned to top-level racing. His story shows bodily resilience as a long process of rest, rehab, support and gradual build-up, not just toughness.",
        source: "World Athletics; widely reported.",
      },
      exampleKids: {
        title: "Getting back on the bike",
        body: "Tumi fell off her bike and grazed her knee. It hurt, and she cried. Her dad cleaned the graze and gave her a hug. The next day she felt a bit scared, but she got back on the bike with her dad holding the seat. Soon she was riding again!",
      },
      reflect: {
        adults: "During your last very demanding period, which basics slipped first? What did it cost?",
        adolescents: "How do you look after your body during exams or busy times?",
        kids: "Tell about a time you got back up after something hard.",
      },
      practice: {
        adults: "Write your \"pressure-week plan\": the three basics you'll protect no matter what, and one recovery activity for afterwards.",
        adolescents: "Make an exam-week plan: bedtime, study breaks, meals and one activity that recharges you.",
        kids: "Next time something is hard, take a breath, ask for help if you need it, and try again.",
      },
      ifThen: {
        adults: "If I enter a high-pressure week, then I will protect my sleep and schedule one recovery block afterwards.",
        adolescents: "If I'm studying late, then I will stop at my planned bedtime and continue in the morning.",
        kids: "If I fall down, then I will take a breath and try again.",
      },
      check: [
        { q: "When should you build bodily resilience?", options: ["Only during a crisis", "Through everyday habits before the test", "After you get sick", "Never; it's genetic"], answer: 1, why: "Resilience is built in advance through consistent habits." },
        { q: "Pushing through illness or injury usually…", options: ["Shows strength", "Makes things worse", "Has no effect", "Speeds up recovery"], answer: 1, why: "Rest and professional help support recovery." },
        { q: "What does van Niekerk's comeback show?", options: ["Resilience is just toughness", "Resilience includes rest, rehab, support and gradual build-up", "Injuries don't matter", "Athletes never need help"], answer: 1, why: "Recovery took patience and professional support." },
      ],
      checkKids: [
        { q: "What does feeling strong mean?", options: ["Getting back up when things are hard", "Never crying", "Being the biggest"], answer: 0, why: "Strength means trying again and asking for help." },
        { q: "If you're sick, strong kids…", options: ["Rest and tell a grown-up", "Keep playing hard", "Hide it"], answer: 0, why: "Resting helps your body get better." },
      ],
      journal: {
        adults: "Write about a demanding period you came through well. What habits and support helped your body cope?",
        adolescents: "What does your body need most during stressful times? How can you make sure it gets it?",
        kids: "Draw a time you got back up and tried again.",
      },
      guide: {
        adults: { discussion: ["How do we plan recovery after peak periods as a team?", "Do people feel able to take sick leave when they need it?"], activity: "Each person writes a pressure-week plan and shares one item with the group. Discuss how the team can support each other's plans.", minutes: 15 },
        adolescents: { discussion: ["What happens to sleep and food during exams?", "How can friends support each other's wellbeing?"], activity: "Exam-week planner: learners design a realistic week with study blocks, breaks, sleep and recharge activities. Share where to get support.", minutes: 20 },
        kids: { discussion: ["Who helps you when you get hurt?", "What does trying again feel like?"], activity: "Bounce-back stories: children share or draw a time they tried again after a fall or mistake.", minutes: 10 },
      },
    },
  ],
};
