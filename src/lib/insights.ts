export interface InsightPost {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  tags: string[];
  readingMinutes: number;
  body: string[];
}

export const insightPosts: InsightPost[] = [
  {
    slug: "leadership-is-learnable",
    title: "Leadership is largely learnable—so measure it",
    excerpt:
      "If ~70% of leadership capacity is developable, activity theatre is not enough. Pre → post measurement becomes the product.",
    date: "2026-03-01",
    tags: ["research", "measurement"],
    readingMinutes: 6,
    body: [
      "Super-Cube® starts from a clear thesis: leadership is substantially developable through deliberate practice, structured learning, and reflective experience—not fixed by heredity alone.",
      "That claim only becomes operational when you measure. A six-face baseline before practice, and the same instrument after, turns development into evidence rather than hope.",
      "In African FMCG networks—and in any complex organisation—leaders need more than content hours. They need a map of Choices, Principles, Mental, Emotional, Physical, and Spiritual capacity, and a weekly plan that attacks the weakest faces first.",
      "World-class leadership development is therefore a loop: orient → baseline → practice → re-measure → certify. Everything else is optional decoration.",
    ],
  },
  {
    slug: "six-faces-not-one-fad",
    title: "Six faces, not one leadership fad",
    excerpt:
      "Single-skill programmes create lopsided leaders. The Super-Cube® keeps the whole person in view.",
    date: "2026-03-12",
    tags: ["model", "constructs"],
    readingMinutes: 5,
    body: [
      "Emotional intelligence alone does not make a leader. Neither does grit, purpose theatre, or decision frameworks in isolation.",
      "The Super-Cube® holds six developable constructs as faces of one system, with the person at the centre. Growth on one face without the others often produces brittle leadership—clever but unprincipled, driven but exhausted, visionary but unkind.",
      "For schools and companies, that means curriculum and assessment must stay multidimensional. Your weakest face this quarter is the product priority—not the face that already feels comfortable.",
    ],
  },
  {
    slug: "i-thou-in-the-workplace",
    title: "I–Thou in the workplace",
    excerpt:
      "Martin Buber’s philosophy is not soft idealism—it is a practical standard for how leaders meet people under pressure.",
    date: "2026-04-02",
    tags: ["philosophy", "practice"],
    readingMinutes: 7,
    body: [
      "I–It treats people as means: roles, headcount, blockers. I–Thou meets the other as a full subject. Super-Cube® is philosophically grounded in that distinction.",
      "In practice: name emotion before solving; credit contribution specifically; decide with moral risk visible; protect recovery so presence stays real.",
      "African business networks under growth pressure are exactly where I–It shortcuts feel efficient—and where they destroy trust. Relational micro-practices are not extras; they are the transfer mechanism from course content to culture.",
    ],
  },
  {
    slug: "sdgs-and-leadership-education",
    title: "Why leadership education is an SDG intervention",
    excerpt:
      "Sustainable Development Goals stall without developable human capacity at every level—kids through executives.",
    date: "2026-04-18",
    tags: ["sdgs", "impact"],
    readingMinutes: 5,
    body: [
      "Goals on education, gender equality, decent work, and strong institutions all assume people who can decide wisely, act with principle, regulate emotion, and hold purpose under stress.",
      "Super-Cube® programmes for kids, adolescents, and adults share one model with age-appropriate depth—so a school cohort and a corporate pilot speak the same language of growth.",
      "Impact reporting then becomes more than attendance: consented pre → post deltas by face, certificates with public verify IDs, and cohort heat maps for facilitators.",
    ],
  },
];

export function getInsight(slug: string) {
  return insightPosts.find((p) => p.slug === slug) ?? null;
}
