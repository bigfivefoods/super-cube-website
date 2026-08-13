/**
 * Leadership challenges — UN SOFI evidence + all 17 SDGs
 * mapped to Super-Cube® development capacity.
 */

import type { ConstructId } from "@/lib/content";

export type LeadershipFace = ConstructId;

export const leadershipChallengeThesis =
  "Development gaps are leadership capacity gaps. Food systems, poverty, health, climate, and peace all stall when leaders cannot choose wisely, govern fairly, think in systems, mobilise people, sustain energy, and stay anchored in purpose. Super-Cube® develops whole-person leaders who can close delivery gaps—from the individual outward to organisations and networks.";

export const sofiSnapshot = {
  title: "UN SOFI: food security is a leadership problem",
  summary:
    "According to the UN State of Food Security and Nutrition in the World (SOFI) report—jointly produced by FAO, IFAD, UNICEF, WFP, and WHO—global hunger has shown modest recent improvement, yet progress remains fragile, uneven, and far short of the 2030 Agenda. Food insecurity is tightly coupled to poverty, health, education, gender equity, climate, and peace. SOFI shows that food systems are not only a technical or funding challenge: they are a leadership and coordinated delivery problem across sectors.",
  keyStats: [
    {
      label: "Global hunger",
      value: "~7.8%",
      note: "About 645 million people undernourished—modest recent improvement, but fragile and uneven across regions.",
    },
    {
      label: "Food insecurity",
      value: "~2.1B",
      note: "People facing moderate or severe food insecurity—stress that undermines work, learning, and health.",
    },
    {
      label: "Healthy diets",
      value: "Billions",
      note: "Still cannot afford a healthy diet; the burden is especially acute in Africa, where a majority cannot.",
    },
    {
      label: "2030 trajectory",
      value: "Off track",
      note: "Progress is insufficient for Zero Hunger. First signs of improvement in Africa still leave deep disparities for women, young children, and rural communities.",
    },
  ],
  themes: [
    "Rising cost of healthy diets",
    "Structural economic drivers of food insecurity",
    "Need for coordinated multisectoral action",
    "Uneven recovery and leave-no-one-behind gaps",
    "Food systems as leadership and delivery infrastructure",
  ],
  sources: [
    {
      label: "FAO — The State of Food Security and Nutrition in the World (SOFI)",
      href: "https://www.fao.org/publications/sofi",
    },
    {
      label: "SOFI report (doi.org/10.4060/cd8306en)",
      href: "https://doi.org/10.4060/cd8306en",
    },
    {
      label: "WHO — State of Food Security and Nutrition in the World",
      href: "https://www.who.int/publications/m/item/the-state-of-food-security-and-nutrition-in-the-world-2025",
    },
  ],
};

export const sdgChallenges: {
  id: number;
  issue: string;
  sofiLink?: string;
  leadershipNeed: string;
  superCubeHelp: string;
  faces: LeadershipFace[];
}[] = [
  {
    id: 1,
    issue:
      "Extreme poverty has rebounded under shocks—conflict, climate, and price spikes—while safety nets and inclusive growth remain incomplete. Millions lack the income, assets, and social protection needed for dignity and mobility.",
    sofiLink:
      "According to the UN SOFI report, food insecurity and the unaffordability of healthy diets trap households in poverty cycles: hunger reduces productivity, while poverty blocks access to nutritious food.",
    leadershipNeed:
      "Leaders who design fair systems, target leave-no-one-behind populations, and make hard trade-offs between short-term relief and long-term economic inclusion.",
    superCubeHelp:
      "Super-Cube® builds decision intelligence and moral judgement (Choices), principled governance (Principles), and purpose beyond self (Spiritual) so poverty responses serve people—not only programmes. Emotional and mental capacity help leaders mobilise communities and hold complex multi-actor strategies.",
    faces: ["choices", "principles", "mental", "emotional", "spiritual"],
  },
  {
    id: 2,
    issue:
      "Zero Hunger is far off track. Undernourishment, food insecurity, and the rising cost of healthy diets leave hundreds of millions hungry and billions without access to adequate nutrition—with women, young children, and rural communities hardest hit.",
    sofiLink:
      "SOFI estimates global hunger near 7.8% of the population (~645 million people) and ~2.1 billion facing moderate or severe food insecurity. Healthy diets remain unaffordable for billions—especially acute in Africa. Progress is fragile; coordinated multisectoral action is essential.",
    leadershipNeed:
      "Leaders who can align agriculture, health, trade, social protection, and local markets—holding structural economic drivers, not only emergency food aid.",
    superCubeHelp:
      "Food systems fail when delivery leadership fails. Super-Cube® develops systems thinking and vision (Mental), ethical stewardship (Principles), resilient energy for long campaigns (Physical), and coalition skill (Emotional) so leaders can redesign how food is produced, priced, and shared.",
    faces: ["choices", "principles", "mental", "emotional", "physical"],
  },
  {
    id: 3,
    issue:
      "Health systems face workforce shortages, inequitable access, and rising non-communicable disease—while mental health and wellbeing remain under-prioritised. Progress is uneven within and between countries.",
    sofiLink:
      "SOFI links nutrition directly to health outcomes: undernutrition, micronutrient gaps, and unaffordable healthy diets drive stunting, wasting, obesity, and lifelong health costs—especially for mothers and young children.",
    leadershipNeed:
      "Care leadership that integrates prevention, equity, and workforce wellbeing—not only acute clinical response.",
    superCubeHelp:
      "Physical leadership anchors energy and health modelling; Emotional capacity builds empathy and team care; Principles secure ethical allocation of scarce resources; Mental and Choices faces support evidence-based strategy under uncertainty.",
    faces: ["physical", "emotional", "principles", "mental", "choices"],
  },
  {
    id: 4,
    issue:
      "Hundreds of millions of children and youth remain out of school; learning poverty persists even among enrolled learners. Completion rates have improved since 2015 but progress has slowed, and skills for work and citizenship lag.",
    leadershipNeed:
      "Educators, school leaders, and policymakers who can improve teaching quality, inclusion, and lifelong learning pathways—especially for girls and rural learners.",
    superCubeHelp:
      "Mental leadership strengthens vision and knowledge application for curriculum and system reform. Emotional and Spiritual faces develop the relational trust and purpose that keep learners engaged. Choices and Principles support fair resource decisions and safeguarding cultures.",
    faces: ["mental", "emotional", "spiritual", "choices", "principles"],
  },
  {
    id: 5,
    issue:
      "Gender equality remains unfinished: gaps in leadership representation, unpaid care, violence, legal rights, and economic opportunity persist in every region.",
    sofiLink:
      "SOFI highlights disparities affecting women and girls in food security and nutrition—care burdens, limited land and finance access, and higher risk when healthy diets cost more than households can pay.",
    leadershipNeed:
      "Leaders who redesign norms, policies, and workplaces so women and girls hold equal voice, safety, and opportunity.",
    superCubeHelp:
      "Principles and Emotional faces build integrity, empathy, and courage to challenge bias. Choices develops moral decision-making when power is unequally held. Spiritual purpose anchors leave-no-one-behind commitment beyond compliance.",
    faces: ["principles", "emotional", "choices", "spiritual"],
  },
  {
    id: 6,
    issue:
      "Billions still lack safely managed drinking water, sanitation, and hygiene. Water stress, pollution, and weak infrastructure threaten health, agriculture, and peace in water-scarce basins.",
    leadershipNeed:
      "Stewardship that balances household needs, agriculture, industry, and ecosystems—with transparent institutions and long-horizon investment.",
    superCubeHelp:
      "Mental systems thinking maps basin trade-offs; Principles and Choices govern fair allocation under scarcity; Physical and Emotional capacity sustain the hard delivery work of infrastructure and community trust.",
    faces: ["mental", "principles", "choices", "physical", "emotional"],
  },
  {
    id: 7,
    issue:
      "Energy access gaps and fossil dependence collide: many communities still lack reliable electricity, while the transition must accelerate without abandoning workers and the poor.",
    leadershipNeed:
      "Just-transition leadership—technical, political, and community-facing—that delivers affordable, clean energy at scale.",
    superCubeHelp:
      "Choices and Mental faces support complex trade-off decisions and strategy. Principles secure fair transition deals. Physical resilience and Emotional coalition skill keep multi-year energy programmes on track.",
    faces: ["choices", "mental", "principles", "physical", "emotional"],
  },
  {
    id: 8,
    issue:
      "Inclusive growth is uneven; youth unemployment, informal work, and insecure livelihoods limit decent work. Productivity and rights often diverge.",
    sofiLink:
      "Food-system jobs and rural livelihoods are central to SOFI’s structural story: when healthy diets and stable markets fail, decent work and local economies fray.",
    leadershipNeed:
      "Enterprise and public leaders who create fair jobs, invest in skills, and treat workplace dignity as a performance system—not a slogan.",
    superCubeHelp:
      "Super-Cube® develops workplace culture through Principles (integrity, fairness), Emotional (motivation, trust), Mental (strategy and problem-solving), and Choices (judgement under risk)—so growth does not come at the cost of people.",
    faces: ["principles", "emotional", "mental", "choices", "physical"],
  },
  {
    id: 9,
    issue:
      "Infrastructure deficits, weak industrial bases, and underfunded innovation leave many regions unable to compete or adapt. Digital and physical divides reinforce inequality.",
    leadershipNeed:
      "Leaders who pair technical vision with inclusive access—building resilient infrastructure and R&D that serve communities, not only capital.",
    superCubeHelp:
      "Mental leadership drives strategic vision and knowledge application. Choices supports calculated innovation risk. Principles and Emotional capacity keep partnerships and public trust intact as systems modernise.",
    faces: ["mental", "choices", "principles", "emotional"],
  },
  {
    id: 10,
    issue:
      "Inequality within and among countries remains extreme—by income, geography, disability, migration status, and identity—undermining social cohesion and SDG delivery overall.",
    sofiLink:
      "SOFI’s disparities—women, young children, rural communities, and regions where healthy diets are unaffordable—are inequality in nutritional form.",
    leadershipNeed:
      "Leaders who redesign systems for inclusion: progressive policy, fair markets, and institutions that hear the least powerful.",
    superCubeHelp:
      "Principles and Spiritual faces anchor justice and purpose. Emotional intelligence builds coalitions across difference. Mental and Choices capacity turn equity goals into implementable strategy and hard budget decisions.",
    faces: ["principles", "spiritual", "emotional", "mental", "choices"],
  },
  {
    id: 11,
    issue:
      "Cities concentrate opportunity and risk: housing shortages, unsafe informal settlements, congestion, pollution, and disaster vulnerability—especially for the urban poor.",
    leadershipNeed:
      "Urban leadership that designs inclusive settlements, safe public space, and climate-ready infrastructure with communities at the table.",
    superCubeHelp:
      "Mental systems thinking for city-scale strategy; Emotional and Principles for participatory governance; Choices for trade-offs between density, mobility, and green space; Physical for sustained delivery capacity.",
    faces: ["mental", "emotional", "principles", "choices", "physical"],
  },
  {
    id: 12,
    issue:
      "Unsustainable production and consumption drive waste, resource depletion, and pollution. Circular practice is still the exception; externalities are socialised onto the vulnerable.",
    sofiLink:
      "SOFI’s focus on the cost and structure of healthy diets sits inside broader food-system production and consumption patterns—from farm practices to retail and household waste.",
    leadershipNeed:
      "Stewards of value chains who redesign incentives, procurement, and culture toward circular, responsible patterns.",
    superCubeHelp:
      "Choices develops moral and strategic decision-making under commercial pressure. Principles and Spiritual faces sustain stewardship when short-term profit pulls the wrong way. Mental capacity maps system redesign across suppliers and customers.",
    faces: ["choices", "principles", "spiritual", "mental"],
  },
  {
    id: 13,
    issue:
      "Climate impacts are accelerating—extreme weather, loss and damage, and transition risk—while mitigation and adaptation finance and political will remain inadequate for 1.5°C pathways.",
    sofiLink:
      "Climate shocks disrupt harvests, prices, and food access. SOFI frames food security as inseparable from climate resilience and coordinated economic policy.",
    leadershipNeed:
      "Leaders who hold long horizons, communicate urgency without despair, and implement adaptation and mitigation together.",
    superCubeHelp:
      "Mental vision and problem-solving for climate strategy; Choices for high-stakes trade-offs; Emotional courage for public mobilisation; Physical resilience for sustained campaigning; Spiritual purpose for intergenerational duty.",
    faces: ["mental", "choices", "emotional", "physical", "spiritual"],
  },
  {
    id: 14,
    issue:
      "Oceans face overfishing, plastic and nutrient pollution, acidification, and habitat loss. Coastal communities and marine biodiversity pay the price of weak stewardship.",
    leadershipNeed:
      "Blue-economy leadership that enforces science-based limits, protects marine ecosystems, and sustains coastal livelihoods fairly.",
    superCubeHelp:
      "Principles and Choices build accountable governance of common-pool resources. Mental capacity applies ecological knowledge. Emotional and Spiritual faces connect communities to long-term care of seas beyond quarterly metrics.",
    faces: ["principles", "choices", "mental", "emotional", "spiritual"],
  },
  {
    id: 15,
    issue:
      "Deforestation, land degradation, and biodiversity loss continue at rates incompatible with planetary boundaries. Restoration is underfunded relative to destruction incentives.",
    leadershipNeed:
      "Land stewards—public and private—who align livelihoods with ecosystem health and enforce rights for Indigenous and local communities.",
    superCubeHelp:
      "Spiritual and Principles faces ground respect for life and fair land governance. Mental systems thinking links forests, soils, and economies. Choices and Emotional capacity help leaders renegotiate extractive norms with courage and coalition.",
    faces: ["spiritual", "principles", "mental", "choices", "emotional"],
  },
  {
    id: 16,
    issue:
      "Conflict, corruption, weak rule of law, and exclusion erode trust. Peaceful, inclusive institutions are both a goal and a precondition for every other SDG.",
    sofiLink:
      "Conflict and fragile institutions drive food crises. SOFI’s picture of uneven recovery is inseparable from peace, rights, and accountable delivery systems.",
    leadershipNeed:
      "Leaders who build trust infrastructure—transparent institutions, access to justice, and inclusive political voice.",
    superCubeHelp:
      "Principles is core: integrity, governance, and contextual ethics. Emotional intelligence de-escalates and repairs relationships. Choices and Spiritual faces support moral courage and purpose when power is contested. Mental capacity designs institutions that last.",
    faces: ["principles", "emotional", "choices", "spiritual", "mental"],
  },
  {
    id: 17,
    issue:
      "Partnerships, finance, technology transfer, and data capacity lag the 2030 Agenda’s ambition. Siloed sectors and short funding cycles fracture delivery.",
    sofiLink:
      "SOFI explicitly calls for coordinated multisectoral action—food, health, social protection, trade, and climate—exactly the partnership problem Goal 17 names.",
    leadershipNeed:
      "Boundary-spanning leaders who convene governments, business, civil society, and communities around shared outcomes and honest metrics.",
    superCubeHelp:
      "Emotional and Principles faces earn trust across sectors. Mental strategy aligns shared targets. Choices navigates competing interests. Spiritual purpose keeps coalitions oriented to leave-no-one-behind when deals get hard. Super-Cube® levels scale that capacity from individuals to networks.",
    faces: ["emotional", "principles", "mental", "choices", "spiritual"],
  },
];

export const howSuperCubeAddresses: { title: string; body: string }[] = [
  {
    title: "Whole-person capacity, not single-skill training",
    body: "SDG delivery needs decision quality, ethics, cognition, relationship skill, energy, and purpose together. Super-Cube® develops all six faces so leaders do not optimise one dimension while the others fail under pressure.",
  },
  {
    title: "From self to systems",
    body: "The model scales through five levels—individual, single business, business group, supply network, and industry—so personal growth becomes organisational and network capacity where food systems and SDG partnerships actually operate.",
  },
  {
    title: "Food systems as a leadership test case",
    body: "SOFI shows hunger and healthy-diet access are stuck on coordination, equity, and structural choices. Super-Cube® equips leaders to hold multisector trade-offs—exactly the muscle Goals 1, 2, 3, 12, 13, and 17 demand.",
  },
  {
    title: "Trust as delivery infrastructure",
    body: "Where institutions are thin or coalitions fray, capital and policy stall. Principles and Emotional development rebuild the social infrastructure SDG implementation depends on.",
  },
  {
    title: "Sustained effort to 2030 and beyond",
    body: "Long-horizon missions burn people out. Physical and Spiritual leadership protect energy and meaning so teams stay in the work when headlines move on.",
  },
  {
    title: "Measurable practice, not slogans",
    body: "Baseline assessment, deliberate practice across constructs, and longitudinal tracking turn “leadership for the SDGs” into developable capability—aligned with research that most leadership capacity can be built through practice.",
  },
];

export const leadershipChallengeSources = [
  ...sofiSnapshot.sources,
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
