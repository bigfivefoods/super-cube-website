export const site = {
  name: "Super-Cube®",
  tagline: "Human-centric leadership, developed from the core outward.",
  description:
    "The Super-Cube® Leadership Model is an empirically validated, multidimensional framework for developing leadership capacity at personal, organisational, and network levels.",
  url: "https://www.super-cube.me",
  email: "hello@super-cube.me",
};

/**
 * Simple main header links — always visible, plain labels.
 * “Six faces” is /constructs (Principles, Choices, etc. on that page).
 */
export const mainNav = [
  { href: "/the-model", label: "The model" },
  { href: "/constructs", label: "Six faces" },
  { href: "/what", label: "Programmes" },
  { href: "/pricing", label: "Pricing" },
  { href: "/learn/start", label: "Learn" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

/** Extra links — mobile “More”, footer, optional desktop overflow */
export const moreNav = [
  { href: "/why", label: "Why leadership" },
  { href: "/how", label: "How it works" },
  { href: "/research", label: "Research" },
  { href: "/sample-report", label: "Sample report" },
  { href: "/impact", label: "Impact" },
  { href: "/insights", label: "Insights" },
  { href: "/practices", label: "Practices" },
  { href: "/facilitator", label: "Facilitator kit" },
  { href: "/team", label: "Team cube" },
  { href: "/media", label: "Media kit" },
  { href: "/certify", label: "Certification" },
  { href: "/community", label: "Community" },
] as const;

/** Story strip (Why → How → What) — footer / homepage narrative only */
export const primaryNav = [
  {
    href: "/why",
    label: "Why",
    blurb: "Why leadership matters for the UN SDGs",
  },
  {
    href: "/how",
    label: "How",
    blurb: "How leadership education works",
  },
  {
    href: "/what",
    label: "What",
    blurb: "Kids · Adolescents · Adults programmes",
  },
] as const;

/** @deprecated Prefer mainNav + moreNav */
export const secondaryNav = [
  { href: "/the-model", label: "The Model" },
  { href: "/constructs", label: "Six faces" },
  { href: "/learn/start", label: "Learn" },
  { href: "/sample-report", label: "Sample report" },
  { href: "/impact", label: "Impact" },
  { href: "/insights", label: "Insights" },
  { href: "/practices", label: "Practices" },
  { href: "/facilitator", label: "Facilitator" },
  { href: "/research", label: "Research" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

/** @deprecated Prefer mainNav */
export const nav = [
  ...mainNav.map(({ href, label }) => ({ href, label })),
];

export type ConstructId =
  | "choices"
  | "principles"
  | "mental"
  | "emotional"
  | "physical"
  | "spiritual";

export interface ConstructComponent {
  name: string;
  definition: string;
}

export interface Construct {
  id: ConstructId;
  name: string;
  shortName: string;
  tagline: string;
  summary: string;
  description: string;
  /** High-level capability labels (shown on cube / chips) */
  elements: string[];
  /**
   * Optional detailed key components with definitions
   * (e.g. Principles virtues). Shown on constructs page.
   */
  keyComponents?: ConstructComponent[];
  theory: string;
  color: string;
  colorSoft: string;
  accent: string;
  qualitativeShare?: string;
}

export const constructs: Construct[] = [
  {
    id: "choices",
    name: "Choices",
    shortName: "Choices",
    tagline: "Decision-making intelligence under complexity",
    summary:
      "Select wise action amid ambiguity—balancing moral values, judgement, and calculated risk.",
    description:
      "The Choices construct develops a leader’s capacity for effective decision-making in complex, dynamic contexts. It integrates decision-making intelligence, moral values, judgement, and risk-taking so leaders can navigate ambiguity, exercise sound judgement, and take calculated risks that advance both individual and organisational progress.",
    elements: [
      "Decision-making intelligence",
      "Moral values",
      "Judgement",
      "Risk-taking",
    ],
    theory:
      "Grounded in choice theory, addressing decision-making intelligence, moral judgment, and risk assessment as developable leadership capabilities.",
    // Colours sampled from public/images/constructs/*-icon.png
    color: "#B32026",
    colorSoft: "#FEE2E2",
    accent: "from-red-700 to-red-500",
    qualitativeShare: "9%",
  },
  {
    id: "principles",
    name: "Principles",
    shortName: "Principles",
    tagline: "Ethical foundations that earn lasting trust",
    summary:
      "Lead with integrity, contextual awareness, situational judgement, and accountable governance—lived through virtues from love and honesty to forgiveness and improvement.",
    description:
      "Principles positions ethical and principled guidance as the bedrock of trustworthy leadership. Leaders learn to act according to established standards—integrating social, economic, and natural-law principles—so decisions remain moral, contextual, and sustainable, especially where ethical lapses can undermine organisational health. The construct is expressed through key character components (love, joy, peace, patience, mercy, kindness, goodness, faithfulness, gentleness, self-control, gratefulness, honesty, integrity, authenticity, forgiveness, and improvement) that turn abstract ethics into everyday leadership behaviour.",
    elements: [
      "Ethical foundations",
      "Contextual awareness",
      "Situational judgement",
      "Governance",
    ],
    keyComponents: [
      {
        name: "Love",
        definition:
          "The unselfish, loyal, and benevolent concern for the good of another.",
      },
      {
        name: "Joy",
        definition:
          "The state of well-being characterised by positive or pleasant emotions.",
      },
      {
        name: "Peace",
        definition:
          "A state of harmony characterised by the lack of violent, conflict behaviours and freedom from fear of violence.",
      },
      {
        name: "Patience",
        definition: "The level of endurance before negativity.",
      },
      {
        name: "Mercy",
        definition: "Compassionate behaviour by those in power.",
      },
      {
        name: "Kindness",
        definition:
          "Being marked by good and charitable behaviour, pleasant disposition, and concern for others.",
      },
      {
        name: "Goodness",
        definition:
          "Do what is morally right and be an advantage to someone or something.",
      },
      {
        name: "Faithfulness",
        definition: "Unwavering commitment to someone or something.",
      },
      {
        name: "Gentleness",
        definition: "To ensure power and strength are controlled.",
      },
      {
        name: "Self-control",
        definition:
          "The ability to control one’s emotions, behaviour, and desire.",
      },
      {
        name: "Gratefulness",
        definition:
          "Attitude of acknowledgment of a benefit that one has received or will receive.",
      },
      {
        name: "Honesty",
        definition:
          "Being truthful, trustworthy, loyal, fair, sincere, and straightforward.",
      },
      {
        name: "Integrity",
        definition:
          "The truthfulness or accuracy of one’s intent and actions.",
      },
      {
        name: "Authenticity",
        definition:
          "The degree to which one is true to one’s own personality, spirit, or character, despite external pressures.",
      },
      {
        name: "Forgiveness",
        definition:
          "To grant free pardon and to give up all claim on account of an offense or debt.",
      },
      {
        name: "Improvement",
        definition: "To make or become better.",
      },
    ],
    theory:
      "Draws on principle-centred leadership and Principle Theory (Caldwell, Karri & Vollmar), emphasising ethical duties to followers and fair, trust-building governance—expressed through developable character virtues that operationalise principled leadership in daily practice.",
    color: "#5D1F5E",
    colorSoft: "#F3E8FF",
    accent: "from-purple-900 to-fuchsia-700",
    qualitativeShare: "18%",
  },
  {
    id: "mental",
    name: "Mental",
    shortName: "Mental",
    tagline: "Cognitive power for strategy and vision",
    summary:
      "Think strategically, solve complex problems, set vision, and apply knowledge in context.",
    description:
      "The Mental construct addresses the cognitive dimension of human-centric leadership: cognitive intelligence, strategic thinking, problem-solving, vision, and knowledge application. Leaders learn to process complex information, anticipate challenges, formulate strategy, and apply knowledge in context-specific ways.",
    elements: [
      "Cognitive intelligence",
      "Strategic thinking",
      "Problem-solving",
      "Vision",
      "Knowledge application",
    ],
    theory:
      "Supported by cognition theory and research on cognitive skills for creative problem-solving and strategic leadership (Prinsloo & Barrett; Mumford et al.).",
    color: "#ED8F20",
    colorSoft: "#FEF3C7",
    accent: "from-amber-500 to-orange-400",
    qualitativeShare: "31%",
  },
  {
    id: "emotional",
    name: "Emotional",
    shortName: "Emotional",
    tagline: "Intelligence that builds trust and inspires action",
    summary:
      "Perceive, understand, and manage emotions to strengthen relationships and collective performance.",
    description:
      "The Emotional construct develops the capacity to perceive, understand, use, and manage emotions in oneself and others. Through emotional intelligence, empathy, social relationships, motivation, and inspiration, leaders build trust, navigate interpersonal complexity, and drive collective effort.",
    elements: [
      "Emotional intelligence",
      "Empathy",
      "Social relationships",
      "Motivation",
      "Inspiration",
    ],
    theory:
      "Anchored in the ability model of emotional intelligence (Mayer, Salovey & Caruso)—perceiving, facilitating, understanding, and managing emotions as trainable competencies.",
    color: "#367638",
    colorSoft: "#DCFCE7",
    accent: "from-green-700 to-green-500",
    qualitativeShare: "29%",
  },
  {
    id: "physical",
    name: "Physical",
    shortName: "Physical",
    tagline: "Energy and resilience for sustained leadership",
    summary:
      "Protect health, manage energy, and build the bodily resilience leadership demands.",
    description:
      "Physical wellbeing is foundational to human-centric leadership. This construct encompasses physical health, energy management, fitness, nutrition, and bodily resilience—recognising that leaders need sustained physiological vitality to perform amid complex, high-demand environments.",
    elements: [
      "Physical health",
      "Energy management",
      "Fitness",
      "Nutrition",
      "Bodily resilience",
    ],
    theory:
      "Informed by the physical wellbeing dimension of the Wheel of Wellness and holistic models that treat physiological vitality as essential to long-term effectiveness.",
    color: "#16979A",
    colorSoft: "#CCFBF1",
    accent: "from-teal-600 to-cyan-500",
    qualitativeShare: "1%",
  },
  {
    id: "spiritual",
    name: "Spiritual",
    shortName: "Spiritual",
    tagline: "Purpose, meaning, and transcendent motivation",
    summary:
      "Align leadership with purpose, meaning, faith, and spiritual intelligence.",
    description:
      "The Spiritual construct integrates a leader’s aptitudes toward meaningful goals, strengthens commitment to shared objectives, and supports personal fulfilment. It helps leaders align action with broader values and purpose—fostering motivation, transcendence, and holistic practice.",
    elements: [
      "Purpose",
      "Meaning",
      "Faith",
      "Transcendence",
      "Spiritual intelligence",
    ],
    theory:
      "Informed by theories of spiritual intelligence and transcendence, connecting purpose and meaning to motivation, commitment, and integrated leadership practice.",
    color: "#26408C",
    colorSoft: "#DBEAFE",
    accent: "from-blue-800 to-blue-600",
    qualitativeShare: "12%",
  },
];

export const levels = [
  {
    level: 1,
    title: "Individual",
    subtitle: "Personal development plans",
    description:
      "Leaders engage in structured self-improvement with pre- and post-assessments across all six constructs. Deliberate practice begins with you at the centre of the cube.",
  },
  {
    level: 2,
    title: "Single Business",
    subtitle: "Leadership pipelines",
    description:
      "Systematic talent development within one organisation—building consistent leadership capacity through construct-aligned interventions.",
  },
  {
    level: 3,
    title: "Business Group",
    subtitle: "Coordinated organisational scale",
    description:
      "Coordinated leadership enhancement across a multi-entity group, aligning language, standards, and development pathways.",
  },
  {
    level: 4,
    title: "Supply Network",
    subtitle: "Alliance & value-chain capacity",
    description:
      "Leadership development across interconnected entities—strengthening network-wide capacity and interdependencies in the value chain.",
  },
  {
    level: 5,
    title: "Industry",
    subtitle: "Sector-wide impact",
    description:
      "A framework for broader adoption—addressing growth, skills gaps, and institutional complexity at industry scale.",
  },
];

export const stats = [
  {
    value: "+32.2%",
    label: "Overall intervention gain",
    detail: "Average improvement across all six constructs after Super-Cube® development",
  },
  {
    value: "+45.1%",
    label: "Principles (highest)",
    detail: "Largest construct gain—integrity, context, and accountable practice",
  },
  {
    value: "6",
    label: "Human-centric constructs",
    detail: "Choices · Principles · Mental · Emotional · Physical · Spiritual",
  },
  {
    value: "70–76%",
    label: "Leadership developable",
    detail: "Through deliberate practice—not fixed by heredity alone",
  },
];

export const researchHighlights = [
  {
    title: "Mixed-methods design",
    body: "Pragmatic explanatory sequential design: quantitative survey first, then qualitative interviews to explain and deepen the findings.",
  },
  {
    title: "132 survey respondents",
    body: "Online survey of Kwaden Group employees tested structural validity and reliability across the six constructs.",
  },
  {
    title: "Acceptable model fit",
    body: "Confirmatory factor analysis: CMIN/DF 2.232, CFI 0.86, RMSEA 0.097—collectively indicating acceptable structural fit.",
  },
  {
    title: "10 senior interviews",
    body: "Thematic analysis of decision-maker interviews validated all six constructs in lived leadership practice.",
  },
];

/**
 * Literature map under the “Theory” abstraction level of the Super-Cube®
 * conceptual model (leadership skills development). Moves from classical
 * trait/behavioural/contingency schools through relational, shared,
 * biological/evolutionary and neuroscientific perspectives, into contemporary
 * topics, skills-development debates, and higher-order integral/philosophical
 * frames (AQAL, I–Thou, Ubuntu). These collectively underpin the six-dimensional
 * Super-Cube® model.
 */
export const theoryLiteratureOverview =
  "The Super-Cube® literature map moves from classical trait, behavioural, and contingency theories, through relational, shared, biological/evolutionary, and neuroscientific perspectives, into contemporary topics (identity, culture, globalisation, entrepreneurial leadership), skills-development debates, and higher-order integral and philosophical frames (AQAL and I–Thou). It is also grounded in the African philosophical perspective of Ubuntu. Together these strands underpin the six-dimensional Super-Cube® model.";

export type TheoryItem = {
  name: string;
  note: string;
};

export type TheoryCategory = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  items: TheoryItem[];
};

/** Full Theory-level map from the conceptual model table */
export const theoryCategories: TheoryCategory[] = [
  {
    id: "major-schools",
    title: "Historical and major schools",
    subtitle: "Classic and evolving major schools of leadership",
    description:
      "The established and evolving “major schools” of leadership research and practice—trait through neuroscience—often read as leadership past, present, and future.",
    items: [
      {
        name: "Trait approach",
        note: "Traits and attitudes associated with effective leadership",
      },
      {
        name: "Behavioural approach",
        note: "What leaders do—styles and observable behaviours",
      },
      {
        name: "Contingency / situational approaches",
        note: "Contingencies, context, and situation as conditions for effectiveness",
      },
      {
        name: "Charisma and new leadership",
        note: "Inspirational, visionary, and transformational “new leadership” traditions",
      },
      {
        name: "Follower-centric approaches",
        note: "Followers as active co-constructors of leadership",
      },
      {
        name: "Relational approaches",
        note: "Leader–follower dynamics, mutual influence, and relatedness",
      },
      {
        name: "Shared leadership",
        note: "Distributed influence across teams and networks",
      },
      {
        name: "Biological and evolutionary schools",
        note: "Leadership as adaptive to environmental and evolutionary pressures",
      },
      {
        name: "Neuroscience perspectives",
        note: "Brain-based and neuroscientific accounts of leading and following",
      },
    ],
  },
  {
    id: "past-present-future",
    title: "Leadership: past, present and future",
    subtitle: "Additional framing in the conceptual table",
    description:
      "Complementary labels that sit alongside the major schools—context, relation, critique, cognition, and emerging agendas.",
    items: [
      {
        name: "Contextual leadership",
        note: "How place, institution, and moment shape leadership",
      },
      {
        name: "Relational leadership",
        note: "Leadership as process between people, not only a person",
      },
      {
        name: "Sceptics",
        note: "Critical and sceptical readings of leadership claims and fads",
      },
      {
        name: "Information-processing approaches",
        note: "How leaders and followers process information and make sense",
      },
      {
        name: "Emerging issues",
        note: "Open and evolving questions at the frontier of the field",
      },
    ],
  },
  {
    id: "contemporary",
    title: "Contemporary / current topics",
    subtitle: "Live agendas in leadership research and practice",
    description:
      "Current topics that sit on top of the classical schools and shape how Super-Cube® is applied in complex, global, and entrepreneurial settings.",
    items: [
      {
        name: "Socio-cognition and social perception",
        note: "How people perceive, categorise, and make sense of leaders and followers",
      },
      {
        name: "Gender",
        note: "Gendered expectations, equity, and leadership opportunity",
      },
      {
        name: "Power",
        note: "Power, influence, and the ethics of its use",
      },
      {
        name: "Identity",
        note: "Leader and follower identity work and self-concept",
      },
      {
        name: "Culture",
        note: "Cultural values, meaning systems, and organisational culture",
      },
      {
        name: "Globalisation",
        note: "Cross-border, multi-stakeholder, and planetary-scale leadership",
      },
      {
        name: "Entrepreneurial leadership",
        note: "Innovation, opportunity recognition, and calculated risk",
      },
    ],
  },
  {
    id: "skills-development",
    title: "Leadership skills development literature",
    subtitle: "How capacity is built over time",
    description:
      "The development literature that justifies deliberate practice, measurement, and progressive pathways in Super-Cube® Learn.",
    items: [
      {
        name: "Nature versus nurture debate",
        note: "How much leadership capacity is fixed versus developable",
      },
      {
        name: "Longitudinal perspectives",
        note: "Growth tracked over time—not one-off training events",
      },
      {
        name: "Knowledge, skills and abilities (KSAs)",
        note: "What can be taught, practised, and assessed as leadership capability",
      },
      {
        name: "Theory, research and practice of leadership development",
        note: "Integrating explanation, evidence, and lived developmental practice",
      },
    ],
  },
  {
    id: "philosophical",
    title: "Broader theoretical / philosophical perspectives",
    subtitle: "Higher-order frames for the whole person",
    description:
      "Integral and dialogical philosophies that hold the Super-Cube® as a human-centric system—with African Ubuntu as a foundational stance alongside Western integral and dialogical thought.",
    items: [
      {
        name: "All Quadrant All Level (AQAL)",
        note: "Ken Wilber’s integral approach—interior/exterior, individual/collective",
      },
      {
        name: "I–Thou theory (Martin Buber)",
        note: "Mutual respect; people as full subjects, never mere objects of control",
      },
      {
        name: "Ubuntu",
        note: "African philosophy of personhood-in-relation: I am because we are—humanity, dignity, and shared becoming",
      },
    ],
  },
];

/**
 * Compact highlight list for homepage / narrow UI.
 * Full map: theoryCategories.
 */
export const theories: TheoryItem[] = [
  {
    name: "Major schools",
    note: "Trait · behavioural · contingency · charisma · follower · relational · shared · evolutionary · neuroscience",
  },
  {
    name: "Contemporary topics",
    note: "Socio-cognition · gender · power · identity · culture · globalisation · entrepreneurial leadership",
  },
  {
    name: "Skills development",
    note: "Nature–nurture · longitudinal growth · KSAs · theory–research–practice",
  },
  {
    name: "Integral & philosophical frames",
    note: "AQAL · I–Thou (Buber) · Ubuntu",
  },
  {
    name: "Past, present & future",
    note: "Contextual · relational · sceptics · information-processing · emerging issues",
  },
];

export function getConstruct(id: string): Construct | undefined {
  return constructs.find((c) => c.id === id);
}
