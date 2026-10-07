# Super-Cube® instrument v2 · item bank (draft for sign-off)

_Generated from `src/lib/lms/instruments/v2-bank.ts`. Edit the code, not this file._

- **v1 (research form)**: the original 28-item instrument, unchanged and still the live default.
- **v2 (behavioural + situational judgement, draft for sign-off)**: behind `LMS_INSTRUMENT_V2=on` (server) and `NEXT_PUBLIC_LMS_INSTRUMENT_V2=on` (browser). Default **OFF**. Admin preview: `/admin/instrument-v2` (never writes learner data).
- Observer (360) form: parallel third-person wording of every v2 Likert item, behind `LMS_360=on` / `NEXT_PUBLIC_LMS_360=on`, adults only. Results show only when at least 3 raters in a group have answered, and per face only when 3 raters observed that face.

## Design rules applied

1. Behavioural Likert items on a **frequency** scale (what you do, not what you believe about yourself).
2. Reverse-keyed items describe the opposite behaviour positively, with no "not" (van Sonderen, Sanderman & Coyne, 2013). About one-third reversed for Adults and Teens; one per face for Kids (Mellor & Moore, 2014).
3. Situational judgement items ask for the **most effective** response; each option has a **provisional** 1–4 effectiveness key (McDaniel et al., 2007) that an expert panel must confirm.
4. Face score = 70% Likert + 30% SJT when both are present (provisional weight).
5. A separate honesty (validity) item is checked before interpretation and never enters a face score.
6. Kids items use short sentences, word labels and concrete situations; a grown-up may read them aloud.

## Counts

| Programme | Items | Likert | Reverse | SJT |
|---|---:|---:|---:|---:|
| Super-Cube® Adults | 56 | 42 | 14 | 14 |
| Super-Cube® Adolescents | 50 | 36 | 12 | 14 |
| Super-Cube® Kids | 48 | 36 | 6 | 12 |

## Super-Cube® Adults

**Scale (1–5):** Never · Rarely · Sometimes · Often · Almost always. Observer form adds "I haven't seen this" (not scored).

**SJT instructions:** Read each situation and choose the response you think is MOST effective. There is no trick: pick what would work best.

### Choices

| # | Skill | Keyed | Self-report | Observer (360) |
|---|---|---|---|---|
| L1 | Decision-making intelligence | Forward | When a decision is complex, I write down the options and the criteria before I choose. | When a decision is complex, {name} sets out the options and the criteria before choosing. |
| L2 | Decision-making intelligence | **Reverse** | I put off difficult decisions until a deadline or someone else forces them. | {name} puts off difficult decisions until a deadline or someone else forces them. |
| L3 | Moral values | Forward | Before I commit to a decision, I check that it fits my values and the organisation's values. | Before committing to a decision, {name} checks that it fits their values and the organisation's values. |
| L4 | Moral values | **Reverse** | When I am under pressure to hit a target, I bend my standards and justify it afterwards. | When under pressure to hit a target, {name} bends their standards and justifies it afterwards. |
| L5 | Judgement | Forward | Before a decision that affects others, I ask for at least one view that differs from mine. | Before a decision that affects others, {name} asks for at least one view that differs from theirs. |
| L6 | Risk-taking | Forward | Before I take a risk, I weigh what could go wrong and how I would recover. | Before taking a risk, {name} weighs what could go wrong and how they would recover. |
| L7 | Risk-taking | **Reverse** | I choose the safest option even when it is likely to fail. | {name} chooses the safest option even when it is likely to fail. |

**S1 · Risk-taking.** You lead a team at a regional distributor. A big new customer wants delivery in half the usual time. Saying yes could win a major account, but it would stretch your drivers and warehouse. Your manager is away this week and has asked you to use your judgement.

| Option | Provisional key (1–4) | Feedback after the attempt |
|---|:---:|---|
| Accept straight away. The opportunity is too good to miss and the team will cope. | 1 | Takes the risk without pricing it, and puts people and safety at risk. |
| Ask your warehouse and transport leads if it is feasible, and accept if they say yes. | 3 | Good: it checks capacity with the people who know. It does not yet look at cost, recovery or a fallback. |
| Map what it would take (people, vehicles, cost, safety), offer a trial order or phased delivery, and confirm the decision to your manager in writing. | 4 (most effective) | Best: a calculated risk with a fallback, shared openly, using the authority you were given. |
| Wait until your manager is back next week. | 2 | Avoids the risk but gives up the judgement you were trusted with, and the customer may go elsewhere. |

**S2 · Moral values.** A supplier you have used for years offers you a generous gift voucher as a "thank you" just before this year's tender is decided. Your company's gift policy is unclear.

| Option | Provisional key (1–4) | Feedback after the attempt |
|---|:---:|---|
| Accept it. It is for past work and won't affect the tender. | 1 | Even if your judgement is unaffected, it creates a conflict of interest and looks like one. |
| Decline politely, tell your manager or compliance team about the offer, and suggest the policy is made clearer. | 4 (most effective) | Best: protects your integrity, keeps a record and fixes the gap for others. |
| Decline it quietly and tell no one. | 3 | Right decision, but the gap in the policy stays and there is no record if questions come later. |
| Accept it but step back from the tender decision. | 2 | Manages part of the conflict but still accepts a gift timed to influence. |

**S3 · Judgement.** In a meeting, a confident senior colleague pushes for a quick decision to switch software vendors after an impressive demo. Nobody has asked the staff who will use the system every day.

| Option | Provisional key (1–4) | Feedback after the attempt |
|---|:---:|---|
| Support the decision. The senior colleague has more experience. | 1 | Confuses confidence and seniority with sound judgement. |
| Say you are uncomfortable and block the decision. | 2 | Raises the concern but offers no way forward. |
| Suggest a short trial with a few daily users before deciding, and offer to organise it. | 4 (most effective) | Best: adds the missing perspective and keeps momentum. |
| Keep quiet in the meeting and raise your concerns with a colleague afterwards. | 1 | The decision is made without your view, and side conversations erode trust. |

### Principles

| # | Skill | Keyed | Self-report | Observer (360) |
|---|---|---|---|---|
| L1 | Ethical foundations | Forward | I tell the truth about problems and mistakes, including my own, even when it is uncomfortable. | {name} tells the truth about problems and mistakes, including their own, even when it is uncomfortable. |
| L2 | Ethical foundations | **Reverse** | I keep quiet about unethical behaviour when speaking up could cost me. | {name} keeps quiet about unethical behaviour when speaking up could cost them. |
| L3 | Contextual awareness | Forward | I adapt how I apply a rule to the people, culture and circumstances involved, while keeping the principle behind it. | {name} adapts how they apply a rule to the people, culture and circumstances involved, while keeping the principle behind it. |
| L4 | Situational judgement | Forward | In a grey-area situation, I think through who will be affected before I act. | In a grey-area situation, {name} thinks through who will be affected before acting. |
| L5 | Situational judgement | **Reverse** | I make ethical calls quickly on gut feel, without thinking through the consequences. | {name} makes ethical calls quickly on gut feel, without thinking through the consequences. |
| L6 | Governance | Forward | I follow agreed processes for approvals, conflicts of interest and record-keeping, even when no one is checking. | {name} follows agreed processes for approvals, conflicts of interest and record-keeping, even when no one is checking. |
| L7 | Governance | **Reverse** | I use my position to make exceptions for people I like. | {name} uses their position to make exceptions for people they like. |

**S1 · Ethical foundations.** You discover that a report your team sent a client last month had an error that made the results look better than they were. The client has not noticed. Correcting it may embarrass your team.

| Option | Provisional key (1–4) | Feedback after the attempt |
|---|:---:|---|
| Leave it. The client is happy, and the next report will be accurate. | 1 | The client keeps relying on wrong information; trust is lost if it comes out. |
| Tell your manager, agree how to correct it, and send the client a clear correction with what you have changed to stop it happening again. | 4 (most effective) | Best: honest, accountable and fixes the process. |
| Quietly fix the figures in the next report without pointing out the change. | 2 | Corrects the numbers but hides the mistake. |
| Send the client a correction yourself straight away, without telling your manager. | 3 | Honest and quick, but bypasses the people accountable for the client relationship. |

**S2 · Contextual awareness.** You are rolling out a new attendance policy across sites in different provinces. At one site, many staff depend on shared taxis that often arrive late because of a route problem. Applying the policy strictly would mean many warnings.

| Option | Provisional key (1–4) | Feedback after the attempt |
|---|:---:|---|
| Apply the policy exactly as written everywhere. Fairness means the same rule for all. | 2 | Consistent, but ignores a real constraint and will damage trust. |
| Exempt that site from the policy. | 1 | Drops the principle and creates resentment at other sites. |
| Keep the principle (reliable attendance), talk with staff and the site manager, and agree a practical adjustment such as a later start time, written down and reviewed. | 4 (most effective) | Best: principle kept, context respected, decision transparent. |
| Tell the site manager to use discretion and not report it. | 1 | Hidden exceptions undermine governance and fairness. |

**S3 · Governance.** A close friend applies for a role, and you sit on the interview panel. Your friend is well qualified.

| Option | Provisional key (1–4) | Feedback after the attempt |
|---|:---:|---|
| Stay on the panel. You know you can be objective. | 1 | Conflicts of interest are about how decisions look as well as how they are made. |
| Declare the relationship to the panel chair and step out of the decision for this candidate. | 4 (most effective) | Best: open declaration and recusal protect your friend, the panel and the organisation. |
| Stay on, but mention informally to the others that you know the candidate. | 2 | Partly transparent, but you still influence the outcome and nothing is recorded. |
| Withdraw from the whole panel without giving a reason. | 2 | Avoids the conflict but leaves the panel short and the reason unrecorded. |

### Mental

| # | Skill | Keyed | Self-report | Observer (360) |
|---|---|---|---|---|
| L1 | Cognitive intelligence | Forward | I set aside time each week to learn something that improves how I think or work. | {name} sets aside time each week to learn something that improves how they think or work. |
| L2 | Strategic thinking | Forward | I consider how today's decisions will play out over the next one to three years. | {name} considers how today's decisions will play out over the next one to three years. |
| L3 | Strategic thinking | **Reverse** | Urgent day-to-day tasks take up so much of my time that I rarely think ahead. | Urgent day-to-day tasks take up so much of {name}'s time that they rarely think ahead. |
| L4 | Problem-solving | Forward | When a problem keeps coming back, I look for its root cause instead of fixing the symptom again. | When a problem keeps coming back, {name} looks for its root cause instead of fixing the symptom again. |
| L5 | Problem-solving | **Reverse** | When I face a hard problem, I go with the first solution that comes to mind. | When facing a hard problem, {name} goes with the first solution that comes to mind. |
| L6 | Vision | Forward | I can explain in a few sentences where my team or work should be heading, and why. | {name} can explain in a few sentences where their team or work should be heading, and why. |
| L7 | Knowledge application | Forward | Within a week or two of learning something useful, I change how I work because of it. | Within a week or two of learning something useful, {name} changes how they work because of it. |

**S1 · Problem-solving.** Customer complaints about late deliveries have risen for three months. Each time, your team apologises and sends a voucher.

| Option | Provisional key (1–4) | Feedback after the attempt |
|---|:---:|---|
| Increase the value of the voucher to keep customers happy. | 1 | Treats the symptom and raises the cost. |
| Map where delays happen across the whole process, test a small change on the biggest cause, and track the results. | 4 (most effective) | Best: root cause, small test, evidence. |
| Ask the team to work harder on deliveries. | 1 | Effort is rarely the root cause of a process problem. |
| Hire an extra driver. | 2 | Might help, but it is a guess until you know where the delay happens. |

**S2 · Strategic thinking.** Your organisation's main product is still profitable, but a new mobile-based competitor is growing fast among younger customers.

| Option | Provisional key (1–4) | Feedback after the attempt |
|---|:---:|---|
| Carry on as normal. Your customers are loyal. | 1 | Ignores a clear signal about where the market is going. |
| Copy the competitor's product as fast as possible. | 2 | Reacts quickly but without understanding what customers value. |
| Find out what those customers value, run a small experiment to test a response, and set out a one-to-three-year view of the market. | 4 (most effective) | Best: learns, tests and thinks ahead. |
| Cut prices to protect market share. | 2 | May buy time but erodes margin without addressing the shift. |

### Emotional

| # | Skill | Keyed | Self-report | Observer (360) |
|---|---|---|---|---|
| L1 | Emotional intelligence | Forward | I notice my emotions as they rise and can name them before I react. | {name} notices their emotions as they rise and stays composed before reacting. |
| L2 | Emotional intelligence | **Reverse** | When I am stressed, I snap at people and regret it later. | When stressed, {name} snaps at people. |
| L3 | Empathy | Forward | When someone disagrees with me, I can explain their point of view in a way they would accept. | When someone disagrees with {name}, {name} can explain that person's point of view fairly. |
| L4 | Empathy | **Reverse** | I get so focused on the task that I miss how the people around me are feeling. | {name} gets so focused on the task that they miss how the people around them are feeling. |
| L5 | Social relationships | Forward | I make time to build relationships with people beyond my immediate team. | {name} makes time to build relationships with people beyond their immediate team. |
| L6 | Motivation | Forward | After a setback on important work, I keep going without needing outside pressure. | After a setback on important work, {name} keeps going without needing outside pressure. |
| L7 | Inspiration | Forward | I help others see how their work contributes to something that matters. | {name} helps others see how their work contributes to something that matters. |

**S1 · Emotional intelligence.** A usually reliable team member snaps at a colleague in a meeting, then goes quiet for the rest of it.

| Option | Provisional key (1–4) | Feedback after the attempt |
|---|:---:|---|
| Call out the behaviour in front of the team so that standards are clear. | 1 | Public correction usually escalates and shames. |
| Let it go. Everyone has a bad day. | 2 | Kind, but misses a signal and leaves the colleague unsupported. |
| After the meeting, check in privately: say what you noticed, ask how they are, and listen before discussing the effect on the colleague. | 4 (most effective) | Best: curiosity first, then accountability, in private. |
| Report it to HR. | 1 | Escalates a one-off before any conversation has happened. |

**S2 · Motivation.** After months of effort, your team has just missed an important target. Morale is low.

| Option | Provisional key (1–4) | Feedback after the attempt |
|---|:---:|---|
| Tell the team you are disappointed and expect better next quarter. | 1 | Adds pressure without learning or support. |
| Acknowledge the effort and the disappointment, work out together what got in the way, and agree one or two realistic next steps. | 4 (most effective) | Best: honest about feelings, focused on learning and the next step. |
| Move straight on to the next target to keep momentum. | 2 | Keeps moving but skips the learning and the feelings. |
| Organise a team lunch to lift spirits, without discussing the result. | 2 | Builds connection but avoids the conversation the team needs. |

### Physical

| # | Skill | Keyed | Self-report | Observer (360) |
|---|---|---|---|---|
| L1 | Physical health | Forward | I keep up routine health check-ups and act on professional advice when something feels wrong. | {name} looks after their health and takes time off to recover when they are unwell. |
| L2 | Energy management | Forward | I plan demanding work for the times of day when my energy is best. | {name} plans demanding work for the times of day when they are at their best. |
| L3 | Energy management | **Reverse** | I work through long stretches without breaks until I am exhausted. | {name} works through long stretches without breaks until they are exhausted. |
| L4 | Fitness | Forward | Most days, I include some physical activity that suits my body and circumstances. | {name} makes time for physical activity that suits them. |
| L5 | Nutrition | Forward | On busy days, I still make time for regular meals and water. | On busy days, {name} still makes time for regular breaks to eat and drink. |
| L6 | Bodily resilience | Forward | After a very demanding period, I deliberately recover (sleep, rest, time outdoors) before the next push. | After a very demanding period, {name} deliberately recovers before the next push. |
| L7 | Bodily resilience | **Reverse** | I cut back on sleep to fit more work in. | {name} cuts back on sleep to fit more work in (for example, late-night messages). |

**S1 · Energy management.** You have three weeks of heavy deadlines ahead. In the past, periods like this left you exhausted and short-tempered.

| Option | Provisional key (1–4) | Feedback after the attempt |
|---|:---:|---|
| Push through. You can rest when it is over. | 1 | Repeats the pattern that left you exhausted last time. |
| Plan the weeks with set breaks, protected sleep and short movement breaks, and tell your team which deadlines come first. | 4 (most effective) | Best: protects energy and sets clear priorities. |
| Cancel all exercise and personal commitments until it is over. | 1 | Removes the very things that sustain you. |
| Plan a long weekend once the deadlines are over. | 2 | Recovery helps, but only after the strain. |

**S2 · Physical health.** For a few weeks you have felt unusually tired and had headaches most afternoons. You are very busy.

| Option | Provisional key (1–4) | Feedback after the attempt |
|---|:---:|---|
| Ignore it until things quieten down. | 1 | Delays help for something that may need attention. |
| Book a check-up with a health professional and, in the meantime, look at your sleep, water, meals and breaks. | 4 (most effective) | Best: get professional advice and look after the basics. |
| Search online and treat it yourself. | 2 | Online information is no substitute for a professional's advice. |
| Ask a colleague whether they feel the same. | 1 | Doesn't get you the advice you need. |

### Spiritual

| # | Skill | Keyed | Self-report | Observer (360) |
|---|---|---|---|---|
| L1 | Purpose | Forward | I can say what I am trying to contribute through my work and life. | {name} can say what they are trying to contribute through their work. |
| L2 | Purpose | **Reverse** | My work feels like going through the motions, with no larger point. | {name} seems to be going through the motions at work, with no larger point. |
| L3 | Meaning | Forward | I connect everyday tasks to the people or causes they ultimately serve. | {name} connects everyday tasks to the people or causes they ultimately serve. |
| L4 | Faith | Forward | When things are hard, I draw strength from my faith, beliefs or deeply held values. | When things are hard, {name} stays anchored in their values. |
| L5 | Transcendence | Forward | I make decisions with people beyond myself in mind, such as my community or future generations. | {name} makes decisions with people beyond themselves in mind, such as the community or future generations. |
| L6 | Spiritual intelligence | Forward | I take regular time for reflection, prayer, meditation or quiet thought about how I am living. | {name} takes time to reflect and learn from experience. |
| L7 | Spiritual intelligence | **Reverse** | I get so busy that I lose sight of what matters most to me. | {name} gets so busy that they lose sight of what matters most. |

**S1 · Meaning.** A team member tells you their work feels pointless: "I just process forms all day."

| Option | Provisional key (1–4) | Feedback after the attempt |
|---|:---:|---|
| Tell them every job has boring parts. | 1 | True, but dismissive. |
| Help them trace how their work affects real people (for example, a family whose claim is paid on time) and ask which part of the work matters most to them. | 4 (most effective) | Best: connects tasks to the people they serve and listens. |
| Offer them a different role straight away. | 2 | May help later, but skips the conversation about meaning. |
| Suggest they find meaning outside work instead. | 2 | Gives up on meaning at work, where they spend much of their time. |

**S2 · Faith.** Your team includes people of different faiths and some with no religious belief. A colleague suggests opening every team meeting with a prayer from their own tradition.

| Option | Provisional key (1–4) | Feedback after the attempt |
|---|:---:|---|
| Agree. Most of the team share that faith. | 1 | Leaves out colleagues of other faiths or none. |
| Refuse and ban any mention of faith at work. | 1 | Shuts down something that matters deeply to many people. |
| Thank them, and agree an inclusive option with the team, such as a moment of quiet reflection that people can use in their own way, with no pressure to take part. | 4 (most effective) | Best: honours faith and respects everyone, including those with no faith. |
| Leave it to the colleague to decide. | 2 | Avoids the leadership question and may exclude people. |

**Honesty item** (`super_cube_adults_v2-honesty-1`): Last one: how much did your answers describe what you actually do, rather than what you would like to do? (Not at all · A little · Partly · Mostly · Completely). Answers at or below "Partly" flag the attempt for cautious interpretation.

## Super-Cube® Adolescents

**Scale (1–5):** Never · Rarely · Sometimes · Often · Almost always. Observer form adds "I haven't seen this" (not scored).

**SJT instructions:** Read each situation and choose what you think is the BEST thing to do.

### Choices

| # | Skill | Keyed | Self-report | Observer (360) |
|---|---|---|---|---|
| L1 | Decision-making under pressure | Forward | Before a big choice, I think about at least two options and what could happen with each. | Before a big choice, {name} thinks about more than one option and what could happen. |
| L2 | Decision-making under pressure | **Reverse** | I let my friends make my choices for me. | {name} lets friends make their choices for them. |
| L3 | Personal values | Forward | When friends pressure me, I stick with what I believe is right. | When friends pressure {name}, they stick with what they believe is right. |
| L4 | Judgement online & offline | Forward | Before I share or post something, I check whether it is true and who it could hurt. | Before sharing or posting something, {name} checks whether it is true and who it could hurt. |
| L5 | Healthy risk-taking | Forward | I try things that stretch me, like a new subject, sport or role, even if I might fail at first. | {name} tries things that stretch them, even if they might fail at first. |
| L6 | Healthy risk-taking | **Reverse** | I do risky things to impress people, without thinking about what could go wrong. | {name} does risky things to impress people, without thinking about what could go wrong. |

**S1 · Decision-making under pressure.** It's Friday night. Your friends are going to a party at a house where you don't know anyone and no adults will be home. You have a sports final early tomorrow, and you told your family you'd be home by 10.

| Option | Provisional key (1–4) | Feedback after the attempt |
|---|:---:|---|
| Go and stay as late as everyone else. You can still play tomorrow. | 1 | Breaks your word and puts your safety and the final at risk. |
| Tell your friends you'll skip this one because of the final, and suggest doing something together after the game. | 4 (most effective) | Best: keeps your word and your friendships. |
| Go for a short while without telling your family where you are. | 1 | No one who cares about you knows where you are. |
| Make up an excuse so you don't have to explain. | 2 | Avoids the party, but you didn't stand by your real reason. |

**S2 · Judgement online & offline.** Someone in your class group chat shares an embarrassing photo of another learner and asks everyone to forward it.

| Option | Provisional key (1–4) | Feedback after the attempt |
|---|:---:|---|
| Forward it. Everyone else is. | 1 | Spreads harm, and sharing images of others without consent can break the law. |
| Don't forward it, and ignore the chat. | 2 | You didn't add harm, but the photo keeps spreading. |
| Don't forward it, say in the group that it's not okay, and tell a trusted adult or teacher so it can be taken down. | 4 (most effective) | Best: stops the harm and gets help. |
| Leave the group chat. | 2 | Protects you, but doesn't help the learner in the photo. |

**S3 · Healthy risk-taking.** Your teacher asks for volunteers to represent your class in a debate. You're interested, but nervous about speaking in front of people.

| Option | Provisional key (1–4) | Feedback after the attempt |
|---|:---:|---|
| Say nothing. Someone else will do it. | 1 | Misses a chance to grow. |
| Volunteer, and prepare by practising with a friend or family member first. | 4 (most effective) | Best: a healthy risk with preparation. |
| Volunteer but don't prepare. You work best under pressure. | 2 | Brave, but skipping preparation makes a bad experience more likely. |
| Offer to do the research for the team instead of speaking. | 3 | A good step that still stretches you a little. |

### Principles

| # | Skill | Keyed | Self-report | Observer (360) |
|---|---|---|---|---|
| L1 | Integrity & trust | Forward | I keep my promises, even small ones. | {name} keeps their promises, even small ones. |
| L2 | Integrity & trust | **Reverse** | I copy work or cheat when I think I can get away with it. | {name} copies work or cheats when they think they can get away with it. |
| L3 | Reading the room | Forward | I notice how the people around me are feeling and adjust what I say or do. | {name} notices how people around them are feeling and adjusts what they say or do. |
| L4 | Situational judgement | Forward | When a situation is tricky, I think about what is fair to everyone before I act. | When a situation is tricky, {name} thinks about what is fair to everyone before acting. |
| L5 | Accountability | Forward | I own up when I've broken a rule or let someone down, and I try to put it right. | {name} owns up when they've broken a rule or let someone down, and tries to put it right. |
| L6 | Accountability | **Reverse** | When I make a mistake, I blame someone or something else. | When {name} makes a mistake, they blame someone or something else. |

**S1 · Integrity & trust.** During a test, you notice the learner next to you has answers written on their hand. They see you looking and whisper, "Please don't tell."

| Option | Provisional key (1–4) | Feedback after the attempt |
|---|:---:|---|
| Copy a few answers, since they're right there. | 1 | Now two people are cheating. |
| Keep your eyes on your own work, and afterwards encourage your classmate to own up, or speak to the teacher privately. | 4 (most effective) | Best: your integrity stays intact and you handle it calmly. |
| Tell the teacher loudly during the test. | 2 | Honest, but humiliating and disruptive for everyone. |
| Ignore it. It's not your problem. | 2 | You stayed honest, but unfairness to the class continues. |

**S2 · Reading the room.** Your friends are joking loudly about another learner's accent. That learner is sitting nearby and looks upset.

| Option | Provisional key (1–4) | Feedback after the attempt |
|---|:---:|---|
| Laugh along so you're not left out. | 1 | Adds to the hurt. |
| Say "Guys, not cool" and change the subject, then check in with the learner later. | 4 (most effective) | Best: stops it and shows care. |
| Walk away. | 2 | You didn't join in, but the learner is still being hurt. |
| Tell the learner to just ignore them. | 2 | Puts the problem on the person being hurt. |

**S3 · Accountability.** You borrowed a friend's calculator and lost it. They haven't asked for it back yet.

| Option | Provisional key (1–4) | Feedback after the attempt |
|---|:---:|---|
| Wait and hope they forget. | 1 | Avoids the problem and damages trust. |
| Tell them straight away, apologise, and offer to replace it or agree a fair plan. | 4 (most effective) | Best: honest and takes responsibility. |
| Say someone took it from your bag. | 1 | A lie that shifts blame. |
| Tell them only if they ask. | 2 | Honest if asked, but not taking ownership. |

### Mental

| # | Skill | Keyed | Self-report | Observer (360) |
|---|---|---|---|---|
| L1 | Strategic thinking | Forward | I plan ahead for tests and projects instead of leaving them to the last minute. | {name} plans ahead for tests and projects instead of leaving them to the last minute. |
| L2 | Problem-solving | Forward | When I'm stuck, I break the problem into smaller steps or try a different approach. | When stuck, {name} breaks the problem into smaller steps or tries a different approach. |
| L3 | Problem-solving | **Reverse** | When something is hard, I give up quickly. | When something is hard, {name} gives up quickly. |
| L4 | Vision for your future | Forward | I have an idea of what I want for my future and some steps to get there. | {name} has an idea of what they want for their future and some steps to get there. |
| L5 | Vision for your future | **Reverse** | I only think about today, and ignore how my choices now affect my future. | {name} only thinks about today, and ignores how choices now affect their future. |
| L6 | Applying knowledge | Forward | I use what I learn in class in real life, for example with money, sport or helping at home. | {name} uses what they learn in class in real life. |

**S1 · Problem-solving.** You've failed two maths tests in a row, even though you studied the night before each one.

| Option | Provisional key (1–4) | Feedback after the attempt |
|---|:---:|---|
| Decide you're just not a maths person. | 1 | A fixed label stops you trying new approaches. |
| Study for longer the night before the next test. | 2 | More of the same approach that hasn't worked. |
| Look at which questions you got wrong, ask your teacher or a friend to explain one topic, and practise a little every day before the next test. | 4 (most effective) | Best: find the real gap and use spaced practice. |
| Copy a friend's homework so your marks go up. | 1 | Marks may rise for a while, but you still can't do the maths. |

**S2 · Vision for your future.** You need to choose subjects for next year, and your friends are all choosing the same ones.

| Option | Provisional key (1–4) | Feedback after the attempt |
|---|:---:|---|
| Choose the same subjects so you stay together. | 1 | Your future is decided by someone else's choices. |
| Think about what you enjoy, what you're good at and which future paths interest you, then talk to a teacher or family member before choosing. | 4 (most effective) | Best: a thought-through choice with good advice. |
| Choose the subjects that sound easiest. | 2 | Easy now may close doors later. |
| Let your family decide for you. | 2 | Their advice matters, but your own view counts too. |

### Emotional

| # | Skill | Keyed | Self-report | Observer (360) |
|---|---|---|---|---|
| L1 | Emotional intelligence | Forward | I can name what I am feeling, for example angry, worried or excited. | {name} can talk about how they are feeling. |
| L2 | Emotional intelligence | **Reverse** | When I'm upset, I say or post things I regret later. | When upset, {name} says or posts things they regret later. |
| L3 | Empathy | Forward | I try to understand how others feel, even when I don't agree with them. | {name} tries to understand how others feel, even when they don't agree. |
| L4 | Relationships & peer influence | Forward | I choose friends who are good for me and treat me well. | {name} chooses friends who are a good influence. |
| L5 | Relationships & peer influence | **Reverse** | I go along with it when people in my group are unkind to someone. | {name} goes along with it when people in their group are unkind to someone. |
| L6 | Motivation & confidence | Forward | I keep working towards my goals, even when it is hard. | {name} keeps working towards their goals, even when it is hard. |

**S1 · Empathy.** For a week, your friend has been quiet and withdrawn. When you ask, they say "I'm fine."

| Option | Provisional key (1–4) | Feedback after the attempt |
|---|:---:|---|
| Leave them alone. They said they're fine. | 2 | Respects their words but may miss that they need support. |
| Tell them to cheer up. | 1 | Dismisses what they might be feeling. |
| Let them know you've noticed, that you care and that you're there if they want to talk. If you're worried about their safety, tell a trusted adult. | 4 (most effective) | Best: caring, patient and safe. |
| Tell others in the group that something is wrong with them. | 1 | Breaks trust and can embarrass them. |

**S2 · Motivation & confidence.** You didn't get picked for the team you really wanted to be in.

| Option | Provisional key (1–4) | Feedback after the attempt |
|---|:---:|---|
| Quit the sport altogether. | 1 | One setback ends something you love. |
| Let yourself feel disappointed, then ask the coach what to work on and make a practice plan. | 4 (most effective) | Best: feel it, learn from it, keep going. |
| Tell everyone the coach is unfair. | 1 | Blaming doesn't help you improve. |
| Pretend you don't care. | 2 | Protects you for now but hides what matters to you. |

### Physical

| # | Skill | Keyed | Self-report | Observer (360) |
|---|---|---|---|---|
| L1 | Health & energy | Forward | I get enough sleep on school nights to feel rested. | {name} seems rested and ready for the day. |
| L2 | Health & energy | **Reverse** | I stay up late on my phone or other screens even when I'm tired. | {name} stays up late on screens even when tired. |
| L3 | Fitness habits | Forward | Most days, I'm physically active in a way that suits me, like walking, sport, dancing or playing. | {name} is physically active most days, in a way that suits them. |
| L4 | Stress & recovery | Forward | When I feel stressed, I do something that helps me calm down, like moving, breathing slowly or talking to someone. | When stressed, {name} does something that helps them calm down. |
| L5 | Resilience under load | Forward | In busy weeks, like exams, I keep up regular meals, water and some rest. | In busy weeks, {name} keeps up healthy routines like regular meals and rest. |
| L6 | Resilience under load | **Reverse** | When things get busy, I drop the habits that keep me healthy. | When things get busy, {name} drops the habits that keep them healthy. |

**S1 · Resilience under load.** Exams start in two weeks. You've been studying until 1 a.m. and feel exhausted at school.

| Option | Provisional key (1–4) | Feedback after the attempt |
|---|:---:|---|
| Keep going. Sleep can wait until after exams. | 1 | Tiredness makes learning and remembering harder. |
| Make a study timetable that includes enough sleep, short breaks and some movement. | 4 (most effective) | Best: rested brains learn and remember better. |
| Use energy drinks to stay awake longer. | 1 | Masks tiredness instead of fixing it. |
| Stop studying for a few days to rest. | 2 | Rest helps, but stopping completely adds pressure later. |

**S2 · Health & energy.** You hurt your ankle at practice. It's sore and swollen, and there's a match on Saturday.

| Option | Provisional key (1–4) | Feedback after the attempt |
|---|:---:|---|
| Play anyway. The team needs you. | 1 | Could make the injury worse. |
| Tell your coach and a parent or guardian, get it checked by a health professional, and follow their advice about playing. | 4 (most effective) | Best: get proper advice and let the adults responsible for you know. |
| Look up a fix online and strap it yourself. | 2 | Online tips are no substitute for a professional. |
| Rest it for a day, then play. | 2 | Rest helps, but you still don't know how bad it is. |

### Spiritual

| # | Skill | Keyed | Self-report | Observer (360) |
|---|---|---|---|---|
| L1 | Purpose & identity | Forward | I know what matters most to me. | {name} seems to know what matters most to them. |
| L2 | Purpose & identity | **Reverse** | I act against my values just to fit in. | {name} acts against their values just to fit in. |
| L3 | Meaning | Forward | I spend some time reflecting on my life in a way that suits me, such as prayer, quiet time, journaling or time in nature. | {name} takes time to reflect on their life and choices. |
| L4 | Meaning | **Reverse** | Most days, what I do feels pointless. | {name} seems to feel that what they do is pointless. |
| L5 | Beliefs & belonging | Forward | I belong to a family, community, faith or group that gives me strength. | {name} has a family, community, faith or group that gives them strength. |
| L6 | Transcendent goals | Forward | I want to make a positive difference to other people or my community, and I do something about it. | {name} makes a positive difference to other people or the community. |

**S1 · Transcendent goals.** Your class is planning a community project. Some classmates just want to do the easiest thing to get the marks.

| Option | Provisional key (1–4) | Feedback after the attempt |
|---|:---:|---|
| Go with the easiest option. | 2 | Gets the marks, but may not help anyone. |
| Suggest asking the community what they actually need, and choosing a project that helps and that the group can manage. | 4 (most effective) | Best: real contribution that is also achievable. |
| Do the project alone, your way. | 1 | Loses the team and the learning. |
| Let the teacher choose. | 2 | Avoids conflict but gives up your voice. |

**S2 · Beliefs & belonging.** A new learner joins your class. They follow a different faith from most of the class, and some learners make jokes about it.

| Option | Provisional key (1–4) | Feedback after the attempt |
|---|:---:|---|
| Join in the jokes. | 1 | Makes them feel they don't belong. |
| Stay out of it. | 2 | You didn't add to it, but they are still left alone. |
| Make the new learner feel welcome, and ask the others to respect their beliefs. | 4 (most effective) | Best: belonging and respect for every faith, or none. |
| Ask the new learner to explain their religion to the class. | 2 | Well meant, but puts them on the spot. |

**Honesty item** (`super_cube_adolescents_v2-honesty-1`): Last one: how honestly did you answer, describing what you really do (not what you wish you did)? (Not at all · A little · Partly · Mostly · Completely). Answers at or below "Partly" flag the attempt for cautious interpretation.

## Super-Cube® Kids

**Scale (1–5):** Never · Not often · Sometimes · Often · Always. Observer form adds "I haven't seen this" (not scored).

**SJT instructions:** Read the story (or ask a grown-up to read it with you). Choose what you think is the best thing to do.

### Choices

| # | Skill | Keyed | Self-report | Observer (360) |
|---|---|---|---|---|
| L1 | Making good decisions | Forward | I stop and think before I choose what to do. | {name} stops and thinks before choosing what to do. |
| L2 | Making good decisions | Forward | When I have two choices, I think about what will happen with each one. | When {name} has two choices, they think about what will happen with each one. |
| L3 | Knowing right from wrong | Forward | I choose the right thing, even when it is hard. | {name} chooses the right thing, even when it is hard. |
| L4 | Thinking before acting | Forward | I can say why I made a choice. | {name} can say why they made a choice. |
| L5 | Thinking before acting | **Reverse** | I do things without thinking and then get into trouble. | {name} does things without thinking and then gets into trouble. |
| L6 | Trying bravely | Forward | I try new things, even if I feel a bit scared. | {name} tries new things, even if they feel a bit scared. |

**S1 · Making good decisions.** Your friend wants you to play outside. But you said you would finish your homework first.

| Option | Provisional key (1–4) | Feedback after the attempt |
|---|:---:|---|
| Go and play and forget the homework. | 1 | You broke your promise. |
| Finish your homework, then go and play. | 4 (most effective) | Great choice! You kept your promise and still get to play. |
| Play first and do homework later, even if it gets late. | 2 | You might run out of time or be too tired. |

**S2 · Trying bravely.** Your teacher asks who wants to read aloud to the class. You want to, but you feel shy.

| Option | Provisional key (1–4) | Feedback after the attempt |
|---|:---:|---|
| Hide so the teacher doesn't see you. | 1 | You miss a chance to grow. |
| Put up your hand and give it a try. | 4 (most effective) | Brave! Trying is how we get better. |
| Ask if you can practise first and read next time. | 3 | A good plan. Getting ready is brave too. |

### Principles

| # | Skill | Keyed | Self-report | Observer (360) |
|---|---|---|---|---|
| L1 | Being honest | Forward | I tell the truth, even when I made a mistake. | {name} tells the truth, even after making a mistake. |
| L2 | Understanding others | Forward | I think about how others feel when I play or work with them. | {name} thinks about how others feel when playing or working with them. |
| L3 | Fair play | Forward | I take turns and play fair. | {name} takes turns and plays fair. |
| L4 | Fair play | **Reverse** | I change the rules of a game so that I win. | {name} changes the rules of a game so that they win. |
| L5 | Keeping promises | Forward | I keep my promises. | {name} keeps their promises. |
| L6 | Keeping promises | Forward | I say sorry when I hurt someone, and I try to fix it. | {name} says sorry when they hurt someone, and tries to fix it. |

**S1 · Being honest.** You break your friend's pencil by accident. Nobody saw.

| Option | Provisional key (1–4) | Feedback after the attempt |
|---|:---:|---|
| Put it back and say nothing. | 1 | Your friend will find a broken pencil and not know why. |
| Tell your friend, say sorry and offer to share your pencil. | 4 (most effective) | Honest and kind. That's how trust grows. |
| Say someone else did it. | 1 | Now someone else gets blamed. |

**S2 · Fair play.** In a game at break, you see that your team scored by cheating.

| Option | Provisional key (1–4) | Feedback after the attempt |
|---|:---:|---|
| Keep quiet because your team is winning. | 1 | Winning by cheating isn't really winning. |
| Tell your team it's not fair and play that point again. | 4 (most effective) | Fair play! Everyone can enjoy the game. |
| Run and tell the teacher straight away. | 3 | Honest. Talking to your team first can fix it faster. |

### Mental

| # | Skill | Keyed | Self-report | Observer (360) |
|---|---|---|---|---|
| L1 | Curious thinking | Forward | I ask questions about things I want to understand. | {name} asks questions about things they want to understand. |
| L2 | Solving puzzles | Forward | When something is hard, I try a different way. | When something is hard, {name} tries a different way. |
| L3 | Solving puzzles | **Reverse** | I give up when something is hard. | {name} gives up when something is hard. |
| L4 | Big ideas | Forward | I like to think up new ideas. | {name} likes to think up new ideas. |
| L5 | Learning new things | Forward | I use what I learn at school to help me at home or when I play. | {name} uses what they learn at school at home or when playing. |
| L6 | Learning new things | Forward | I keep practising until I get better at something. | {name} keeps practising until they get better at something. |

**S1 · Solving puzzles.** You're building a tower with blocks, and it keeps falling down.

| Option | Provisional key (1–4) | Feedback after the attempt |
|---|:---:|---|
| Give up and do something else. | 1 | You won't find out how to make it stand. |
| Look at why it falls, and try making the bottom wider. | 4 (most effective) | Smart thinking! Finding the reason helps you fix it. |
| Ask someone else to build it for you. | 2 | Asking for help is fine, but try to learn how too. |

**S2 · Learning new things.** You get a sum wrong in your homework.

| Option | Provisional key (1–4) | Feedback after the attempt |
|---|:---:|---|
| Copy a friend's answer. | 1 | Then you won't learn how to do it. |
| Look at where it went wrong and try again, or ask your teacher to show you. | 4 (most effective) | Great! Mistakes help you learn. |
| Leave it and hope nobody notices. | 2 | It's better to find out what went wrong. |

### Emotional

| # | Skill | Keyed | Self-report | Observer (360) |
|---|---|---|---|---|
| L1 | Naming feelings | Forward | I can say how I feel (happy, sad, angry or scared). | {name} can say how they feel. |
| L2 | Kindness | Forward | I am kind to others, even when they are not my friends. | {name} is kind to others, even when they are not friends. |
| L3 | Kindness | Forward | I notice when someone is sad, and I try to help. | {name} notices when someone is sad and tries to help. |
| L4 | Friends & family | Forward | I help my family and friends. | {name} helps family and friends. |
| L5 | Staying calm | Forward | When I am upset, I can calm down, for example by breathing slowly or asking for help. | When upset, {name} can calm down or ask for help. |
| L6 | Staying calm | **Reverse** | When I am angry, I shout or throw things. | When angry, {name} shouts or throws things. |

**S1 · Kindness.** A child in your class is sitting alone at break and looks sad.

| Option | Provisional key (1–4) | Feedback after the attempt |
|---|:---:|---|
| Leave them alone. | 2 | Maybe they want space, but they may feel lonely. |
| Ask them to join you, or tell a teacher if they seem very upset. | 4 (most effective) | Kind and caring! |
| Laugh about it with your friends. | 1 | That would hurt their feelings even more. |

**S2 · Staying calm.** Someone knocks over the picture you were drawing, and you feel very angry.

| Option | Provisional key (1–4) | Feedback after the attempt |
|---|:---:|---|
| Push them. | 1 | Pushing can hurt someone and makes things worse. |
| Take a few slow breaths, then say, "I feel cross. Please be careful." | 4 (most effective) | Well done! You calmed down and used your words. |
| Walk away and tell a grown-up how you feel. | 3 | Good choice. Getting help is a smart way to calm down. |

### Physical

| # | Skill | Keyed | Self-report | Observer (360) |
|---|---|---|---|---|
| L1 | Moving your body | Forward | I play or move my body every day. | {name} plays or moves every day. |
| L2 | Rest & energy | Forward | I go to bed on time so I feel ready for the next day. | {name} seems rested and ready for the day. |
| L3 | Rest & energy | **Reverse** | I stay up late watching screens. | {name} stays up late watching screens. |
| L4 | Healthy food | Forward | I drink water during the day. | {name} drinks water during the day. |
| L5 | Healthy food | Forward | I try different healthy foods, like fruit and vegetables. | {name} tries different healthy foods. |
| L6 | Feeling strong | Forward | When I feel tired or sore, I tell a grown-up or take a rest. | When tired or sore, {name} tells a grown-up or takes a rest. |

**S1 · Rest & energy.** You feel very tired at school because you went to bed late.

| Option | Provisional key (1–4) | Feedback after the attempt |
|---|:---:|---|
| Tonight, go to bed on time. | 4 (most effective) | Good plan! Sleep gives you energy for tomorrow. |
| Eat lots of sweets to get energy. | 1 | Sweets don't fix being tired. |
| Say nothing and stay up late again tonight. | 1 | You'll feel tired again tomorrow. |

**S2 · Moving your body.** It's a rainy day and you can't play outside.

| Option | Provisional key (1–4) | Feedback after the attempt |
|---|:---:|---|
| Watch screens all afternoon. | 1 | Your body needs to move every day. |
| Dance, stretch or play an active game inside, with a grown-up's OK. | 4 (most effective) | Great! You found a way to keep moving. |
| Sit and wait for the rain to stop. | 2 | Waiting is fine for a bit, but moving helps you feel good. |

### Spiritual

| # | Skill | Keyed | Self-report | Observer (360) |
|---|---|---|---|---|
| L1 | What matters to me | Forward | I know what is important to me. | {name} knows what is important to them. |
| L2 | Hope & wonder | Forward | I feel wonder at nature and the world around me. | {name} shows wonder at nature and the world. |
| L3 | Hope & wonder | Forward | I have quiet time to think, pray or be calm, in my own way. | {name} has quiet time to think or be calm. |
| L4 | Belonging | Forward | I feel that I belong in my family, class or community. | {name} seems to feel they belong. |
| L5 | Helping others | Forward | I help other people without being asked. | {name} helps other people without being asked. |
| L6 | Helping others | **Reverse** | I only help when I get something back. | {name} only helps when they get something back. |

**S1 · Helping others.** Your class is collecting food for families who need help.

| Option | Provisional key (1–4) | Feedback after the attempt |
|---|:---:|---|
| Bring something to share if your family can, or help pack the boxes. | 4 (most effective) | Kind! Everyone can help in some way. |
| Say it's not your problem. | 1 | Helping others makes our community stronger. |
| Wait and see what your friends do. | 2 | You can decide to help yourself. |

**S2 · Belonging.** A new child joins your class. They don't know anyone yet.

| Option | Provisional key (1–4) | Feedback after the attempt |
|---|:---:|---|
| Say hello, tell them your name and show them where things are. | 4 (most effective) | Kind! You helped them feel they belong. |
| Wait for them to talk to you first. | 2 | They may feel too shy to start. |
| Tell your friends not to play with them. | 1 | That would make them feel left out and sad. |

**Honesty item** (`super_cube_kids_v2-honesty-1`): Last one: did you answer like you really are? (No · A little · Some of it · Mostly · Yes, all of it). Answers at or below "Partly" flag the attempt for cautious interpretation.

## Sign-off checklist for Dr Craig R. Muller

- [ ] Item wording approved per face and programme (or edits marked).
- [ ] SJT keys confirmed by an expert panel (suggest 5+ experienced leaders/educators rating each option independently; keep options with clear agreement).
- [ ] Kids form length and parent/guardian read-aloud guidance approved.
- [ ] SJT weight (30%) approved, or a different weight chosen.
- [ ] Native-speaker translation (isiZulu, Afrikaans) commissioned following ITC guidelines; no machine translation.
- [ ] Pilot and norming plan agreed before v2 is switched on for learners.
