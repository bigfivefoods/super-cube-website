export const site = {
  name: "Super-Cube®",
  tagline: "Human-centric leadership, developed from the core outward.",
  description:
    "The Super-Cube® Leadership Model is an empirically validated, multidimensional framework for developing leadership capacity at personal, organisational, and network levels.",
  url: "https://www.super-cube.com",
  email: "hello@super-cube.com",
};

export const nav = [
  { href: "/the-model", label: "The Model" },
  { href: "/constructs", label: "Six Constructs" },
  { href: "/programs", label: "Programs" },
  { href: "/pricing", label: "Pricing" },
  { href: "/learn", label: "Learn" },
  { href: "/research", label: "Research" },
  { href: "/about", label: "About" },
];

export type ConstructId =
  | "choices"
  | "principles"
  | "mental"
  | "emotional"
  | "physical"
  | "spiritual";

export interface Construct {
  id: ConstructId;
  name: string;
  shortName: string;
  tagline: string;
  summary: string;
  description: string;
  elements: string[];
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
      "Lead with integrity, contextual awareness, situational judgement, and accountable governance.",
    description:
      "Principles positions ethical and principled guidance as the bedrock of trustworthy leadership. Leaders learn to act according to established standards—integrating social, economic, and natural-law principles—so decisions remain moral, contextual, and sustainable, especially where ethical lapses can undermine organisational health.",
    elements: [
      "Ethical foundations",
      "Contextual awareness",
      "Situational judgement",
      "Governance",
    ],
    theory:
      "Draws on principle-centred leadership and Principle Theory (Caldwell, Karri & Vollmar), emphasising ethical duties to followers and fair, trust-building governance.",
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
    value: "70–76%",
    label: "Leadership developable",
    detail: "Through deliberate practice—not fixed by heredity alone",
  },
  {
    value: "6",
    label: "Human-centric constructs",
    detail: "Choices · Principles · Mental · Emotional · Physical · Spiritual",
  },
  {
    value: "5",
    label: "Progressive levels",
    detail: "From personal plans to industry-wide application",
  },
  {
    value: "2020",
    label: "Empirically validated",
    detail: "DBA research, University of KwaZulu-Natal",
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

export const theories = [
  {
    name: "Trait theory",
    note: "Attributes that contribute to effective leadership",
  },
  {
    name: "Relational theory",
    note: "Leader–follower dynamics and mutual influence",
  },
  {
    name: "Charismatic theory",
    note: "Inspirational and visionary qualities",
  },
  {
    name: "Evolutionary theory",
    note: "Leadership as adaptive to environmental change",
  },
  {
    name: "Entrepreneurial leadership",
    note: "Innovation, opportunity, and calculated risk",
  },
];

export function getConstruct(id: string): Construct | undefined {
  return constructs.find((c) => c.id === id);
}
