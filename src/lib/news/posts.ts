import type { NewsPost } from "./types";

/*
 * Seeded posts. Every fact here is already on super-cube.me (pricing, programmes, the six faces,
 * the 21-day re-measure, verify IDs) or in the published UKZN research (+39.5% Emotional).
 * The LMS post matches the bigfivegroup.africa update of 7 October 2026.
 */

const LMS_BODY = `*By Dr Craig R. Muller, author of the Super-Cube® Leadership Model*

For much of my working life I have asked one question: can leadership be developed on purpose? My doctoral research at the University of KwaZulu-Natal (DBA, 2021) said yes, and it gave us the **Super-Cube®** model. Today I am proud to share the next step: the new **Super-Cube® LMS** here at super-cube.me, built so that anyone, from a child in primary school to a senior executive, can grow as a leader and see the change.

![The Super-Cube® home page on a laptop beside the Super-Cube® LMS Today screen on a phone](/news/super-cube-lms-screens.jpg)

## Six faces, with you at the centre

Super-Cube® looks at the whole person, not one skill. It has six developable faces: **Choices**, **Principles**, **Mental**, **Emotional**, **Physical** and **Spiritual**, with the individual at the centre. Each face can be practised and strengthened. In the published research, the Emotional face improved by **+39.5% (UKZN)** from the first assessment to the second. That is a research result, not a promise for every learner, and it is why we built a platform that measures before it teaches.

## The learning journey

- **A free baseline**: about ten minutes gives you a score for each of the six faces, so you can see your strengths and your gaps.
- **Programmes for every stage of life**: Super-Cube® Kids, Adolescents and Adults share the same six faces, with language, examples and practice that fit the learner.
- **A re-measure after 21 days**: once your sessions are done, you measure again.
- **A growth report**: your report shows before and after, face by face.
- **A verifiable certificate**: every certificate carries a public verify ID.

## Built for schools and organisations

Leadership grows faster together. Coach and cohort dashboards let schools and organisations follow progress across a class, a team or a whole company, while learners keep private journals: a coach sees scores only when the learner agrees. Streaks and badges help people keep going, and the whole experience is mobile-first, because for many learners across Africa the phone is where learning happens.

## Pay once, keep it for life

The baseline is free. If you continue, each programme is **R99 once**, with lifetime access to the full programme, your report and your certificate. There is no subscription.

## Start today

Take your free baseline, and if you lead a school, a company or a public-sector team, talk to us about a pilot.

[Start your free baseline](/learn/start) · [Organisations and pilots](/organisations) · [See a sample report](/sample-report)`;

const PRICING_BODY = `Leadership development should not be a luxury. That is why every Super-Cube® programme starts free and, if you continue, costs **R99 once** (about $6 USD), with **lifetime access**. There is no monthly fee and no subscription.

![The Super-Cube® pricing page on a laptop and a phone: Kids, Adolescents and Adults, each R99 with lifetime access](/news/lifetime-access-r99-cover-wide.jpg)

## Start free

Your first step costs nothing. A short orientation and the free six-face baseline show where you are today on **Choices**, **Principles**, **Mental**, **Emotional**, **Physical** and **Spiritual**.

## One price for every programme

- **Super-Cube® Kids** (ages 5–12): growing character, curiosity and kindness.
- **Super-Cube® Adolescents** (ages 13–21): identity, influence and wise decisions.
- **Super-Cube® Adults** (ages 22+): human-centric leadership for work and life.

Each programme is R99 once and includes:

- Lifetime access
- The pre-assessment baseline
- Six construct courses, adapted to the learner's age
- Practice labs and checks
- The post-assessment and a personal report

Payment is a single checkout with **Paystack**.

## For schools and organisations

Developing a whole class, team or company? Seat packs of **10, 20 or 50 learner seats** come with a volume discount, and each seat is lifetime access for one learner. Cohort reporting shows progress across the group, with learners' consent.

[See pricing](/pricing) · [Start your free baseline](/learn/start) · [Plan a pilot](/pilot-pack)`;

export const codeNewsPosts: NewsPost[] = [
  {
    id: "code_lifetime_access_r99",
    slug: "start-free-pay-once-lifetime-access-r99",
    title: "Start free, pay once: lifetime access to every Super-Cube® programme for R99",
    excerpt:
      "Every Super-Cube® programme starts with a free baseline. If you continue, Kids, Adolescents and Adults are R99 once each, with lifetime access and no subscription.",
    body: PRICING_BODY,
    tag: "Pricing · Lifetime access",
    status: "published",
    coverImage: "/news/lifetime-access-r99-cover.jpg",
    coverWide: "/news/lifetime-access-r99-cover-wide.jpg",
    coverAlt:
      "The Super-Cube® pricing page on a laptop and a phone: Kids, Adolescents and Adults programmes, each R99 with lifetime access",
    shareImage: "/images/og/news/lifetime-access-r99.jpg",
    publishedAt: "2026-10-07T08:00:00.000Z",
    updatedAt: "2026-10-07T08:00:00.000Z",
    source: "code",
  },
  {
    id: "code_super_cube_lms_2026",
    slug: "super-cube-lms-accelerating-leadership-development",
    title: "Accelerating leadership development with the new Super-Cube® LMS",
    excerpt:
      "The Super-Cube® LMS is live: a free baseline, programmes for Kids, Adolescents and Adults, a re-measure after 21 days and a growth report you can verify.",
    body: LMS_BODY,
    tag: "Learn · Super-Cube® LMS",
    status: "published",
    coverImage: "/news/super-cube-lms-cover.jpg",
    coverWide: "/news/super-cube-lms-cover-wide.jpg",
    coverAlt:
      "The super-cube.me home page with the six-face Super-Cube® on a laptop browser, beside the Super-Cube® LMS Today screen on a phone",
    shareImage: "/images/og/news/super-cube-lms.jpg",
    author: "Dr Craig R. Muller",
    publishedAt: "2026-10-07T09:00:00.000Z",
    updatedAt: "2026-10-07T09:00:00.000Z",
    source: "code",
  },
];
