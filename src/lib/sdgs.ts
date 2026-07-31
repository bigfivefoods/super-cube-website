/**
 * UN Sustainable Development Goals — colours follow the official UN palette.
 * Headline stats from UN Sustainable Development Goals Reports (2024 & 2025).
 */

export interface SdgGoal {
  id: number;
  short: string;
  title: string;
  color: string;
  /** Soft tint for cards */
  soft: string;
  focus: string;
  /** Official UN SDG icon (local copy) */
  icon: string;
}

function iconPath(id: number) {
  return `/images/sdgs/goal-${String(id).padStart(2, "0")}.jpg`;
}

export const sdgGoals: SdgGoal[] = [
  {
    id: 1,
    short: "No Poverty",
    title: "End poverty in all its forms everywhere",
    color: "#E5243B",
    soft: "#FCE8EB",
    focus: "Dignity, safety nets, and inclusive growth",
    icon: iconPath(1),
  },
  {
    id: 2,
    short: "Zero Hunger",
    title: "End hunger, achieve food security and improved nutrition",
    color: "#DDA63A",
    soft: "#FBF3E3",
    focus: "Food systems, nutrition, and resilient agriculture",
    icon: iconPath(2),
  },
  {
    id: 3,
    short: "Good Health",
    title: "Ensure healthy lives and promote well-being for all",
    color: "#4C9F38",
    soft: "#E8F5E4",
    focus: "Health systems, equity, and care leadership",
    icon: iconPath(3),
  },
  {
    id: 4,
    short: "Quality Education",
    title: "Ensure inclusive and equitable quality education",
    color: "#C5192D",
    soft: "#F9E4E7",
    focus: "Learning, skills, and human capital",
    icon: iconPath(4),
  },
  {
    id: 5,
    short: "Gender Equality",
    title: "Achieve gender equality and empower all women and girls",
    color: "#FF3A21",
    soft: "#FFE8E4",
    focus: "Rights, voice, and fair opportunity",
    icon: iconPath(5),
  },
  {
    id: 6,
    short: "Clean Water",
    title: "Ensure availability and sustainable management of water",
    color: "#26BDE2",
    soft: "#E4F6FB",
    focus: "Water stewardship and public infrastructure",
    icon: iconPath(6),
  },
  {
    id: 7,
    short: "Clean Energy",
    title: "Ensure access to affordable, reliable, sustainable energy",
    color: "#FCC30B",
    soft: "#FEF7DF",
    focus: "Energy transition and just access",
    icon: iconPath(7),
  },
  {
    id: 8,
    short: "Decent Work",
    title: "Promote sustained, inclusive economic growth and decent work",
    color: "#A21942",
    soft: "#F5E3E9",
    focus: "Jobs, enterprise, and fair workplaces",
    icon: iconPath(8),
  },
  {
    id: 9,
    short: "Industry & Innovation",
    title: "Build resilient infrastructure and foster innovation",
    color: "#FD6925",
    soft: "#FFF0E8",
    focus: "Infrastructure, industry, and R&D",
    icon: iconPath(9),
  },
  {
    id: 10,
    short: "Reduced Inequalities",
    title: "Reduce inequality within and among countries",
    color: "#DD1367",
    soft: "#FBE3EE",
    focus: "Inclusion, mobility, and fair systems",
    icon: iconPath(10),
  },
  {
    id: 11,
    short: "Sustainable Cities",
    title: "Make cities and human settlements inclusive and sustainable",
    color: "#FD9D24",
    soft: "#FFF4E5",
    focus: "Urban leadership and community design",
    icon: iconPath(11),
  },
  {
    id: 12,
    short: "Responsible Consumption",
    title: "Ensure sustainable consumption and production patterns",
    color: "#BF8B2E",
    soft: "#F7F0E2",
    focus: "Circular value chains and stewardship",
    icon: iconPath(12),
  },
  {
    id: 13,
    short: "Climate Action",
    title: "Take urgent action to combat climate change and its impacts",
    color: "#3F7E44",
    soft: "#E6F0E7",
    focus: "Mitigation, adaptation, and resilience",
    icon: iconPath(13),
  },
  {
    id: 14,
    short: "Life Below Water",
    title: "Conserve and sustainably use the oceans, seas and marine resources",
    color: "#0A97D9",
    soft: "#E0F2FA",
    focus: "Oceans, coasts, and blue economy",
    icon: iconPath(14),
  },
  {
    id: 15,
    short: "Life on Land",
    title: "Protect, restore and promote sustainable use of terrestrial ecosystems",
    color: "#56C02B",
    soft: "#EBF8E5",
    focus: "Biodiversity, forests, and land health",
    icon: iconPath(15),
  },
  {
    id: 16,
    short: "Peace & Justice",
    title: "Promote peaceful and inclusive societies and accountable institutions",
    color: "#00689D",
    soft: "#DFEEF5",
    focus: "Institutions, trust, and rule of law",
    icon: iconPath(16),
  },
  {
    id: 17,
    short: "Partnerships",
    title: "Strengthen the means of implementation and global partnership",
    color: "#19486A",
    soft: "#E3EAEE",
    focus: "Collaboration across sectors and borders",
    icon: iconPath(17),
  },
];

/** Headline figures for the page (UN SDG Reports 2024 & 2025) */
export const sdgHeadlineStats = [
  {
    value: "18%",
    label: "Targets on track",
    detail:
      "Of assessable SDG targets with trend data, only about 18% are on track (SDG Report 2025). Another ~17% show moderate progress.",
    source: "UN SDG Report 2025",
  },
  {
    value: "35%",
    label: "Adequate progress",
    detail:
      "Combined, only about 35% of assessable targets are on track or making moderate progress toward 2030.",
    source: "UN SDG Report 2025",
  },
  {
    value: "18%",
    label: "In reverse",
    detail:
      "Roughly one in six assessable targets show regression—progress going backwards against the 2015 baseline.",
    source: "UN SDG Report 2025",
  },
  {
    value: "2030",
    label: "Deadline",
    detail:
      "Fewer than five years remain of this decade of action. Current trajectories fall far short of the 2030 Agenda promise.",
    source: "UN 2030 Agenda",
  },
];

export const sdgPressurePoints = [
  {
    title: "Poverty & hunger shocks",
    body: "Compared with 2019, millions more people were pushed into extreme poverty and over 100 million more were suffering from hunger by 2022—setbacks driven by pandemic aftershocks, conflict, and price spikes.",
    source: "UN SDG Report 2024",
  },
  {
    title: "Education still uneven",
    body: "In 2024, completion rates reached about 88% (primary), 78% (lower secondary), and 60% (upper secondary)—gains since 2015, but progress has slowed. Around 272 million children and youth remain out of school.",
    source: "UN SDG Report 2025",
  },
  {
    title: "Climate & conflict pressure",
    body: "Escalating climate impacts, geopolitical tension, and conflict continue to undermine development gains—raising civilian harm, disrupting food systems, and diverting resources from long-term investment.",
    source: "UN SDG Report 2024",
  },
  {
    title: "Delivery gap is a leadership gap",
    body: "The goals are agreed. What lags is coordinated execution—across governments, business, civil society, and communities. That is a leadership problem as much as a technical or financial one.",
    source: "Super-Cube® framing",
  },
];

/** How Super-Cube® constructs equip leaders for SDG work */
export const leadershipForSdgs = [
  {
    constructId: "choices" as const,
    sdgHook: "Decisions under complexity",
    body: "SDG trade-offs are real: growth vs. climate, speed vs. inclusion. Leaders need decision intelligence, moral judgement, and calculated risk—not paralysis or shortcuts.",
    sdgs: [1, 8, 12, 13],
  },
  {
    constructId: "principles" as const,
    sdgHook: "Trust & fair institutions",
    body: "Goals 16 and 17 depend on integrity, contextual awareness, and accountable governance. Without principled leadership, partnerships collapse and inequality deepens.",
    sdgs: [5, 10, 16, 17],
  },
  {
    constructId: "mental" as const,
    sdgHook: "Systems thinking & vision",
    body: "The 2030 Agenda is a systems map. Strategic thinking, problem-solving, and applied knowledge turn global targets into local strategies that can actually be delivered.",
    sdgs: [4, 9, 11, 13],
  },
  {
    constructId: "emotional" as const,
    sdgHook: "Coalition & courage",
    body: "SDG progress is multi-stakeholder work. Empathy, relationship skill, and the ability to motivate across difference keep coalitions alive when pressure rises.",
    sdgs: [3, 5, 10, 17],
  },
  {
    constructId: "physical" as const,
    sdgHook: "Sustained capacity",
    body: "Long-horizon missions need leaders who manage energy and resilience—personally and organisationally—so delivery does not burn out before 2030.",
    sdgs: [3, 7, 8],
  },
  {
    constructId: "spiritual" as const,
    sdgHook: "Purpose beyond self",
    body: "Leave-no-one-behind is a purpose statement. Meaning, transcendence, and spiritual intelligence anchor leaders when short-term incentives pull the wrong way.",
    sdgs: [1, 4, 16, 17],
  },
];

export const sdgSources = [
  {
    label: "The Sustainable Development Goals Report 2025",
    href: "https://unstats.un.org/sdgs/report/2025/",
  },
  {
    label: "The Sustainable Development Goals Report 2024",
    href: "https://unstats.un.org/sdgs/report/2024/",
  },
  {
    label: "United Nations — 2030 Agenda for Sustainable Development",
    href: "https://sdgs.un.org/2030agenda",
  },
];
