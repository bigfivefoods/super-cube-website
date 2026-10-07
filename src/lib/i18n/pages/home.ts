/**
 * Home page copy per language (server only: imported by Server Components, never by the client
 * bundle). English is the source; other languages are MACHINE-DRAFTED and fall back to English per
 * string. "Super-Cube®" is a brand: never translated, always with ®. In Arabic it sits in
 * left-to-right isolates (U+2066…U+2069) so the ® stays on the right of the name.
 */
import type { Locale } from "../config";

export type HomeStrings = {
  metaTitle: string;
  metaDescription: string;
  heroEyebrow: string;
  heroTitle: string;
  heroLede: string;
  heroCtaBaseline: string;
  heroCtaSample: string;
  heroResearch: string;
  whatEyebrow: string;
  whatTitle: string;
  whatDescription: string;
  steps: [{ title: string; body: string }, { title: string; body: string }, { title: string; body: string }];
  facesLabel: string;
  pathEyebrow: string;
  pathTitle: string;
  pathDescription: string;
  individuals: { label: string; title: string; body: string; cta: string; kids: string; teens: string; adults: string };
  organisations: { label: string; title: string; body: string; cta: string; pilot: string; speaking: string };
  schools: { label: string; title: string; body: string; cta: string; pricing: string; sample: string };
  getEyebrow: string;
  getTitle: string;
  youGet: string[];
  exampleLabel: string;
  /** {score} → exampleScore, in bold */
  exampleBody: string;
  exampleScore: string;
  exampleLink: string;
  priceEyebrow: string;
  priceTitle: string;
  freeTitle: string;
  freeBody: string;
  fullTitle: string;
  /** {usd} → USD price */
  fullOnce: string;
  fullBody: string;
  groupsTitle: string;
  /** {pack} → smallest pack price, {seats} → its seat count */
  groupsBody: string;
  forOrganisations: string;
  forSchools: string;
  fullPricing: string;
  researchEyebrow: string;
  researchTitle: string;
  researchDescription: string;
  researchCardLabel: string;
  researchEmotional: string;
  researchOverall: string;
  researchNote: string;
  readResearch: string;
  /** Link to the FMCG case study post (the post itself is in English). */
  readCaseStudy: string;
  aboutCraig: string;
  nextEyebrow: string;
  nextTitle: string;
  nextBody: string;
  startBaseline: string;
  bookCall: string;
  /** Shown above English-only sections (testimonials) on translated pages */
  testimonialsNote: string;
};

type Draft = Partial<Omit<HomeStrings, "individuals" | "organisations" | "schools">> & {
  individuals?: Partial<HomeStrings["individuals"]>;
  organisations?: Partial<HomeStrings["organisations"]>;
  schools?: Partial<HomeStrings["schools"]>;
};

const en: HomeStrings = {
  metaTitle: "Super-Cube® leadership development: measure, practise, prove",
  metaDescription:
    "Measure your leadership in 10 minutes across six faces, practise the areas that need it most, then measure again. Built on doctoral research at UKZN.",
  heroEyebrow: "Super-Cube® leadership development",
  heroTitle: "Leadership is learnable—and we prove it.",
  heroLede:
    "Measure your leadership in 10 minutes. Practise the areas that need it most. Measure again, and see the change in a report you can share.",
  heroCtaBaseline: "Start free baseline · 10 min",
  heroCtaSample: "See a sample report",
  heroResearch: "Built on doctoral research at the University of KwaZulu-Natal (DBA, 2021).",
  whatEyebrow: "What it is",
  whatTitle: "A simple loop: measure, practise, prove.",
  whatDescription:
    "Super-Cube® looks at the whole leader, not one skill. It measures six faces: Choices, Principles, Mental, Emotional, Physical and Spiritual. Then it helps you grow the ones that matter most for you.",
  steps: [
    {
      title: "Measure",
      body: "Take a free 10-minute baseline. You get a score for each of the six faces of leadership, so you can see your strengths and gaps.",
    },
    {
      title: "Practise",
      body: "Work through short sessions for your age group, with a weekly practice plan that starts with your weakest faces.",
    },
    {
      title: "Prove",
      body: "Measure again. Your before-and-after report shows what changed, and your certificate has a public verify ID.",
    },
  ],
  facesLabel: "The six faces",
  pathEyebrow: "Choose your path",
  pathTitle: "One model for every stage of life.",
  pathDescription:
    "The six faces stay the same as you grow. The language, examples and reporting change with who you are and where you lead.",
  individuals: {
    label: "Individuals",
    title: "Grow your own leadership",
    body: "A free baseline, short courses for your age group and a before-and-after report.",
    cta: "Explore programmes",
    kids: "Kids 5–12",
    teens: "Teens 13–21",
    adults: "Adults 22+",
  },
  organisations: {
    label: "Organisations",
    title: "Develop leaders across a team",
    body: "Seat packs, cohort reporting and facilitated programmes for teams, companies and networks.",
    cta: "For organisations",
    pilot: "Pilot pack",
    speaking: "Speaking",
  },
  schools: {
    label: "Schools",
    title: "A pathway for every learner",
    body: "Age-appropriate leadership for learners, with progress views for teachers.",
    cta: "For schools",
    pricing: "Pricing",
    sample: "Sample report",
  },
  getEyebrow: "What you get",
  getTitle: "Everything you need to grow, and to show it.",
  youGet: [
    "A free six-face leadership baseline",
    "Six short courses, written for your age group",
    "A weekly practice plan focused on your weakest faces",
    "A second assessment to measure the change",
    "A before-and-after growth report (PDF)",
    "A certificate with a public verify ID",
    "Private journals: a coach sees your scores only if you agree",
  ],
  exampleLabel: "Example only, not a real learner",
  exampleBody:
    "A report might show an overall score moving from {score} (out of 100) after eight weeks. Your results will differ.",
  exampleScore: "52 to 68",
  exampleLink: "See the sample report",
  priceEyebrow: "Price",
  priceTitle: "Start free. Pay once if you continue.",
  freeTitle: "Free baseline",
  freeBody: "Your six-face scores in about 10 minutes. No card needed.",
  fullTitle: "Full programme, per person",
  fullOnce: "once (about ${usd} USD)",
  fullBody: "Courses, practice plan, second assessment, report and certificate. No subscription.",
  groupsTitle: "Groups, schools and organisations",
  groupsBody:
    "Seat packs from {pack} for {seats} learners, or ask us for a quote for a full programme with facilitation and reporting.",
  forOrganisations: "For organisations",
  forSchools: "For schools",
  fullPricing: "See full pricing",
  researchEyebrow: "The research",
  researchTitle: "Tested before it was taught.",
  researchDescription:
    "Super-Cube® came out of Dr Craig Muller’s doctoral research at the University of KwaZulu-Natal (DBA, 2021). The model was tested with a survey of 132 employees and interviews with 10 senior leaders, and published in peer-reviewed journals.",
  researchCardLabel: "12-week Super-Cube® leadership interventions",
  researchEmotional: "Emotional gain",
  researchOverall: "Overall growth across all six faces",
  researchNote:
    "Aggregated pre- and post-course results, South African and international FMCG organisations. Source: Super-Cube® company profile, Sept 2023.",
  readResearch: "Read the research and theory",
  readCaseStudy: "Read the FMCG case study",
  aboutCraig: "About Dr Craig Muller",
  nextEyebrow: "Next step",
  nextTitle: "Start with a free 10-minute baseline.",
  nextBody:
    "See your six-face scores today. Leading a team or a school? Book a short call and we’ll plan a pilot with you.",
  startBaseline: "Start free baseline",
  bookCall: "Book a call",
  testimonialsNote: "Testimonials are shown in the original English.",
};

const NB = "\u202f"; // French narrow no-break space before ? ! : ;
const fr: Draft = {
  metaTitle: "Super-Cube®, développement du leadership : mesurer, pratiquer, prouver",
  metaDescription:
    "Mesurez votre leadership en 10 minutes sur six faces, travaillez les points qui en ont le plus besoin, puis mesurez à nouveau. Issu d’une recherche doctorale à l’UKZN.",
  heroEyebrow: "Développement du leadership Super-Cube®",
  heroTitle: "Le leadership s’apprend, et nous le prouvons.",
  heroLede:
    "Mesurez votre leadership en 10 minutes. Travaillez les points qui en ont le plus besoin. Mesurez à nouveau et constatez les progrès dans un rapport que vous pouvez partager.",
  heroCtaBaseline: "Bilan initial gratuit · 10 min",
  heroCtaSample: "Voir un exemple de rapport",
  heroResearch: "Fondé sur une recherche doctorale menée à l’Université du KwaZulu-Natal (DBA, 2021).",
  whatEyebrow: "De quoi s’agit-il" + NB + "?",
  whatTitle: "Une boucle simple" + NB + ": mesurer, pratiquer, prouver.",
  whatDescription:
    "Super-Cube® considère le leader dans sa globalité, pas une seule compétence. Il mesure six faces" +
    NB +
    ": Choix, Principes, Mental, Émotionnel, Physique et Spirituel. Puis il vous aide à développer celles qui comptent le plus pour vous.",
  steps: [
    {
      title: "Mesurer",
      body: "Passez un bilan initial gratuit de 10 minutes. Vous obtenez un score pour chacune des six faces du leadership, pour voir vos forces et vos axes de progrès.",
    },
    {
      title: "Pratiquer",
      body: "Suivez de courtes séances adaptées à votre tranche d’âge, avec un plan de pratique hebdomadaire qui commence par vos faces les plus faibles.",
    },
    {
      title: "Prouver",
      body: "Mesurez à nouveau. Votre rapport avant-après montre ce qui a changé, et votre certificat comporte un identifiant de vérification public.",
    },
  ],
  facesLabel: "Les six faces",
  pathEyebrow: "Choisissez votre parcours",
  pathTitle: "Un seul modèle pour chaque étape de la vie.",
  pathDescription:
    "Les six faces restent les mêmes à mesure que vous grandissez. Le langage, les exemples et les rapports s’adaptent à qui vous êtes et à l’endroit où vous dirigez.",
  individuals: {
    label: "Particuliers",
    title: "Développez votre propre leadership",
    body: "Un bilan initial gratuit, des cours courts adaptés à votre âge et un rapport avant-après.",
    cta: "Découvrir les programmes",
    kids: "Enfants 5–12 ans",
    teens: "Adolescents 13–21 ans",
    adults: "Adultes 22 ans et +",
  },
  organisations: {
    label: "Organisations",
    title: "Développez les leaders de toute une équipe",
    body: "Packs de places, rapports de cohorte et programmes animés pour les équipes, les entreprises et les réseaux.",
    cta: "Pour les organisations",
    pilot: "Pack pilote",
    speaking: "Conférences",
  },
  schools: {
    label: "Écoles",
    title: "Un parcours pour chaque élève",
    body: "Un leadership adapté à l’âge des élèves, avec un suivi des progrès pour les enseignants.",
    cta: "Pour les écoles",
    pricing: "Tarifs",
    sample: "Exemple de rapport",
  },
  getEyebrow: "Ce que vous obtenez",
  getTitle: "Tout ce qu’il faut pour progresser, et le démontrer.",
  youGet: [
    "Un bilan initial gratuit de leadership sur six faces",
    "Six cours courts, rédigés pour votre tranche d’âge",
    "Un plan de pratique hebdomadaire axé sur vos faces les plus faibles",
    "Une seconde évaluation pour mesurer le changement",
    "Un rapport de progression avant-après (PDF)",
    "Un certificat avec un identifiant de vérification public",
    "Des journaux privés" + NB + ": un coach ne voit vos scores qu’avec votre accord",
  ],
  exampleLabel: "Exemple uniquement, pas un vrai participant",
  exampleBody:
    "Un rapport pourrait montrer un score global passant de {score} (sur 100) après huit semaines. Vos résultats seront différents.",
  exampleScore: "52 à 68",
  exampleLink: "Voir l’exemple de rapport",
  priceEyebrow: "Prix",
  priceTitle: "Commencez gratuitement. Payez une seule fois si vous continuez.",
  freeTitle: "Bilan initial gratuit",
  freeBody: "Vos scores sur les six faces en 10 minutes environ. Aucune carte requise.",
  fullTitle: "Programme complet, par personne",
  fullOnce: "une seule fois (environ {usd}" + NB + "USD)",
  fullBody: "Cours, plan de pratique, seconde évaluation, rapport et certificat. Sans abonnement.",
  groupsTitle: "Groupes, écoles et organisations",
  groupsBody:
    "Packs de places à partir de {pack} pour {seats} participants, ou demandez-nous un devis pour un programme complet avec animation et rapports.",
  forOrganisations: "Pour les organisations",
  forSchools: "Pour les écoles",
  fullPricing: "Voir tous les tarifs",
  researchEyebrow: "La recherche",
  researchTitle: "Testé avant d’être enseigné.",
  researchDescription:
    "Super-Cube® est issu de la recherche doctorale du Dr Craig Muller à l’Université du KwaZulu-Natal (DBA, 2021). Le modèle a été testé au moyen d’une enquête auprès de 132 employés et d’entretiens avec 10 dirigeants, puis publié dans des revues à comité de lecture.",
  researchCardLabel: "Interventions Super-Cube® de 12 semaines",
  researchEmotional: "Gain, face émotionnelle",
  researchOverall: "Croissance globale sur les six faces",
  researchNote:
    "Résultats agrégés avant et après la formation, organisations FMCG sud-africaines et internationales. Source" + NB + ": profil d’entreprise Super-Cube®, sept. 2023.",
  readResearch: "Lire la recherche et la théorie",
  readCaseStudy: "Lire l’étude de cas FMCG",
  aboutCraig: "À propos du Dr Craig Muller",
  nextEyebrow: "Prochaine étape",
  nextTitle: "Commencez par un bilan initial gratuit de 10 minutes.",
  nextBody:
    "Découvrez dès aujourd’hui vos scores sur les six faces. Vous dirigez une équipe ou une école" +
    NB +
    "? Réservez un court appel et nous planifierons un pilote avec vous.",
  startBaseline: "Bilan initial gratuit",
  bookCall: "Réserver un appel",
  testimonialsNote: "Les témoignages sont présentés dans leur version originale en anglais.",
};

const pt: Draft = {
  metaTitle: "Super-Cube®, desenvolvimento de liderança: medir, praticar, comprovar",
  metaDescription:
    "Meça a sua liderança em 10 minutos em seis faces, pratique as áreas que mais precisam e volte a medir. Baseado em investigação de doutoramento na UKZN.",
  heroEyebrow: "Desenvolvimento de liderança Super-Cube®",
  heroTitle: "A liderança aprende-se, e nós comprovamo-lo.",
  heroLede:
    "Meça a sua liderança em 10 minutos. Pratique as áreas que mais precisam. Volte a medir e veja a mudança num relatório que pode partilhar.",
  heroCtaBaseline: "Avaliação inicial grátis · 10 min",
  heroCtaSample: "Ver um relatório de exemplo",
  heroResearch: "Baseado em investigação de doutoramento na Universidade de KwaZulu-Natal (DBA, 2021).",
  whatEyebrow: "O que é",
  whatTitle: "Um ciclo simples: medir, praticar, comprovar.",
  whatDescription:
    "O Super-Cube® olha para o líder como um todo, não para uma única competência. Mede seis faces: Escolhas, Princípios, Mental, Emocional, Física e Espiritual. Depois, ajuda-o a desenvolver as que mais importam para si.",
  steps: [
    {
      title: "Medir",
      body: "Faça uma avaliação inicial gratuita de 10 minutos. Recebe uma pontuação para cada uma das seis faces da liderança, para ver os seus pontos fortes e lacunas.",
    },
    {
      title: "Praticar",
      body: "Faça sessões curtas para a sua faixa etária, com um plano de prática semanal que começa pelas suas faces mais fracas.",
    },
    {
      title: "Comprovar",
      body: "Volte a medir. O seu relatório de antes e depois mostra o que mudou, e o seu certificado tem um ID de verificação público.",
    },
  ],
  facesLabel: "As seis faces",
  pathEyebrow: "Escolha o seu percurso",
  pathTitle: "Um modelo para cada fase da vida.",
  pathDescription:
    "As seis faces mantêm-se à medida que cresce. A linguagem, os exemplos e os relatórios adaptam-se a quem é e ao contexto em que lidera.",
  individuals: {
    label: "Particulares",
    title: "Desenvolva a sua própria liderança",
    body: "Uma avaliação inicial gratuita, cursos curtos para a sua faixa etária e um relatório de antes e depois.",
    cta: "Explorar programas",
    kids: "Crianças 5–12",
    teens: "Jovens 13–21",
    adults: "Adultos 22+",
  },
  organisations: {
    label: "Organizações",
    title: "Desenvolva líderes em toda a equipa",
    body: "Pacotes de lugares, relatórios de grupo e programas com facilitação para equipas, empresas e redes.",
    cta: "Para organizações",
    pilot: "Pacote piloto",
    speaking: "Palestras",
  },
  schools: {
    label: "Escolas",
    title: "Um percurso para cada aluno",
    body: "Liderança adequada à idade dos alunos, com acompanhamento do progresso para os professores.",
    cta: "Para escolas",
    pricing: "Preços",
    sample: "Relatório de exemplo",
  },
  getEyebrow: "O que recebe",
  getTitle: "Tudo o que precisa para crescer, e para o demonstrar.",
  youGet: [
    "Uma avaliação inicial gratuita de liderança em seis faces",
    "Seis cursos curtos, escritos para a sua faixa etária",
    "Um plano de prática semanal centrado nas suas faces mais fracas",
    "Uma segunda avaliação para medir a mudança",
    "Um relatório de progresso de antes e depois (PDF)",
    "Um certificado com um ID de verificação público",
    "Diários privados: um coach só vê as suas pontuações se concordar",
  ],
  exampleLabel: "Apenas um exemplo, não um participante real",
  exampleBody:
    "Um relatório pode mostrar uma pontuação global a passar de {score} (em 100) após oito semanas. Os seus resultados serão diferentes.",
  exampleScore: "52 para 68",
  exampleLink: "Ver o relatório de exemplo",
  priceEyebrow: "Preço",
  priceTitle: "Comece grátis. Pague uma única vez se continuar.",
  freeTitle: "Avaliação inicial grátis",
  freeBody: "As suas pontuações nas seis faces em cerca de 10 minutos. Sem cartão.",
  fullTitle: "Programa completo, por pessoa",
  fullOnce: "uma única vez (cerca de {usd} USD)",
  fullBody: "Cursos, plano de prática, segunda avaliação, relatório e certificado. Sem subscrição.",
  groupsTitle: "Grupos, escolas e organizações",
  groupsBody:
    "Pacotes de lugares a partir de {pack} para {seats} participantes, ou peça-nos um orçamento para um programa completo com facilitação e relatórios.",
  forOrganisations: "Para organizações",
  forSchools: "Para escolas",
  fullPricing: "Ver todos os preços",
  researchEyebrow: "A investigação",
  researchTitle: "Testado antes de ser ensinado.",
  researchDescription:
    "O Super-Cube® nasceu da investigação de doutoramento do Dr. Craig Muller na Universidade de KwaZulu-Natal (DBA, 2021). O modelo foi testado com um inquérito a 132 colaboradores e entrevistas a 10 líderes seniores, e publicado em revistas com revisão por pares.",
  researchCardLabel: "Intervenções Super-Cube® de 12 semanas",
  researchEmotional: "Ganho, face emocional",
  researchOverall: "Crescimento global nas seis faces",
  researchNote:
    "Resultados agregados antes e depois do curso, organizações FMCG sul-africanas e internacionais. Fonte: perfil da empresa Super-Cube®, set. 2023.",
  readResearch: "Ler a investigação e a teoria",
  readCaseStudy: "Ler o estudo de caso FMCG",
  aboutCraig: "Sobre o Dr. Craig Muller",
  nextEyebrow: "Próximo passo",
  nextTitle: "Comece com uma avaliação inicial gratuita de 10 minutos.",
  nextBody:
    "Veja hoje as suas pontuações nas seis faces. Lidera uma equipa ou uma escola? Marque uma chamada curta e planeamos um piloto consigo.",
  startBaseline: "Avaliação inicial grátis",
  bookCall: "Marcar uma chamada",
  testimonialsNote: "Os testemunhos são apresentados no inglês original.",
};

const sw: Draft = {
  metaTitle: "Super-Cube®, kukuza uongozi: pima, fanya mazoezi, thibitisha",
  metaDescription:
    "Pima uongozi wako kwa dakika 10 katika pande sita, fanyia mazoezi maeneo yanayohitaji zaidi, kisha upime tena. Umejengwa juu ya utafiti wa uzamivu katika UKZN.",
  heroEyebrow: "Kukuza uongozi kwa Super-Cube®",
  heroTitle: "Uongozi unaweza kujifunzwa, na tunauthibitisha.",
  heroLede:
    "Pima uongozi wako kwa dakika 10. Fanyia mazoezi maeneo yanayohitaji zaidi. Pima tena, na uone mabadiliko katika ripoti unayoweza kushiriki.",
  heroCtaBaseline: "Anza tathmini ya bure · dak. 10",
  heroCtaSample: "Tazama mfano wa ripoti",
  heroResearch: "Umejengwa juu ya utafiti wa uzamivu katika Chuo Kikuu cha KwaZulu-Natal (DBA, 2021).",
  whatEyebrow: "Ni nini",
  whatTitle: "Mzunguko rahisi: pima, fanya mazoezi, thibitisha.",
  whatDescription:
    "Super-Cube® humwangalia kiongozi mzima, si ujuzi mmoja tu. Hupima pande sita: Maamuzi, Kanuni, Akili, Hisia, Mwili na Roho. Kisha hukusaidia kukuza zile zenye umuhimu zaidi kwako.",
  steps: [
    {
      title: "Pima",
      body: "Fanya tathmini ya awali ya bure ya dakika 10. Unapata alama kwa kila moja ya pande sita za uongozi, ili uone uwezo wako na mapungufu yako.",
    },
    {
      title: "Fanya mazoezi",
      body: "Pitia vipindi vifupi vya kundi lako la umri, pamoja na mpango wa mazoezi wa kila wiki unaoanza na pande zako dhaifu zaidi.",
    },
    {
      title: "Thibitisha",
      body: "Pima tena. Ripoti yako ya kabla na baada inaonyesha kilichobadilika, na cheti chako kina namba ya uthibitisho ya umma.",
    },
  ],
  facesLabel: "Pande sita",
  pathEyebrow: "Chagua njia yako",
  pathTitle: "Modeli moja kwa kila hatua ya maisha.",
  pathDescription:
    "Pande sita hubaki zile zile unapokua. Lugha, mifano na ripoti hubadilika kulingana na wewe ni nani na unaongoza wapi.",
  individuals: {
    label: "Watu binafsi",
    title: "Kuza uongozi wako mwenyewe",
    body: "Tathmini ya awali ya bure, kozi fupi za kundi lako la umri na ripoti ya kabla na baada.",
    cta: "Gundua programu",
    kids: "Watoto 5–12",
    teens: "Vijana 13–21",
    adults: "Watu wazima 22+",
  },
  organisations: {
    label: "Mashirika",
    title: "Kuza viongozi katika timu nzima",
    body: "Vifurushi vya nafasi, ripoti za vikundi na programu zinazoongozwa na wawezeshaji kwa timu, makampuni na mitandao.",
    cta: "Kwa mashirika",
    pilot: "Kifurushi cha majaribio",
    speaking: "Hotuba",
  },
  schools: {
    label: "Shule",
    title: "Njia kwa kila mwanafunzi",
    body: "Uongozi unaofaa umri wa wanafunzi, pamoja na mwonekano wa maendeleo kwa walimu.",
    cta: "Kwa shule",
    pricing: "Bei",
    sample: "Mfano wa ripoti",
  },
  getEyebrow: "Unachopata",
  getTitle: "Kila kitu unachohitaji kukua, na kukionyesha.",
  youGet: [
    "Tathmini ya awali ya bure ya uongozi katika pande sita",
    "Kozi sita fupi, zilizoandikwa kwa kundi lako la umri",
    "Mpango wa mazoezi wa kila wiki unaolenga pande zako dhaifu zaidi",
    "Tathmini ya pili ya kupima mabadiliko",
    "Ripoti ya ukuaji ya kabla na baada (PDF)",
    "Cheti chenye namba ya uthibitisho ya umma",
    "Shajara za faragha: kocha huona alama zako tu ukikubali",
  ],
  exampleLabel: "Mfano tu, si mwanafunzi halisi",
  exampleBody:
    "Ripoti inaweza kuonyesha alama ya jumla ikipanda kutoka {score} (kati ya 100) baada ya wiki nane. Matokeo yako yatatofautiana.",
  exampleScore: "52 hadi 68",
  exampleLink: "Tazama mfano wa ripoti",
  priceEyebrow: "Bei",
  priceTitle: "Anza bure. Lipa mara moja ukiendelea.",
  freeTitle: "Tathmini ya awali ya bure",
  freeBody: "Alama zako za pande sita kwa takriban dakika 10. Hakuna kadi inayohitajika.",
  fullTitle: "Programu kamili, kwa kila mtu",
  fullOnce: "mara moja (takriban USD {usd})",
  fullBody: "Kozi, mpango wa mazoezi, tathmini ya pili, ripoti na cheti. Hakuna usajili wa kila mwezi.",
  groupsTitle: "Vikundi, shule na mashirika",
  groupsBody:
    "Vifurushi vya nafasi kuanzia {pack} kwa wanafunzi {seats}, au tuombe makadirio ya bei ya programu kamili yenye uwezeshaji na ripoti.",
  forOrganisations: "Kwa mashirika",
  forSchools: "Kwa shule",
  fullPricing: "Tazama bei zote",
  researchEyebrow: "Utafiti",
  researchTitle: "Ulijaribiwa kabla ya kufundishwa.",
  researchDescription:
    "Super-Cube® ulitokana na utafiti wa uzamivu wa Dkt. Craig Muller katika Chuo Kikuu cha KwaZulu-Natal (DBA, 2021). Modeli ilijaribiwa kwa utafiti wa wafanyakazi 132 na mahojiano na viongozi wakuu 10, na ikachapishwa katika majarida yanayokaguliwa na wataalamu.",
  researchCardLabel: "Mafunzo ya uongozi ya Super-Cube® ya wiki 12",
  researchEmotional: "Ongezeko, upande wa hisia",
  researchOverall: "Ukuaji wa jumla katika pande zote sita",
  researchNote:
    "Matokeo ya jumla kabla na baada ya kozi, mashirika ya FMCG ya Afrika Kusini na ya kimataifa. Chanzo: wasifu wa kampuni ya Super-Cube®, Sept 2023.",
  readResearch: "Soma utafiti na nadharia",
  readCaseStudy: "Soma uchunguzi kifani wa FMCG",
  aboutCraig: "Kuhusu Dkt. Craig Muller",
  nextEyebrow: "Hatua inayofuata",
  nextTitle: "Anza na tathmini ya awali ya bure ya dakika 10.",
  nextBody:
    "Ona alama zako za pande sita leo. Unaongoza timu au shule? Panga simu fupi nasi tutapanga majaribio pamoja nawe.",
  startBaseline: "Anza tathmini ya bure",
  bookCall: "Panga simu",
  testimonialsNote: "Shuhuda zinaonyeshwa kwa Kiingereza asilia.",
};

const SC = "\u2066Super-Cube®\u2069";
const ar: Draft = {
  metaTitle: `${SC}، تطوير القيادة: قِس، تدرّب، أثبِت`,
  metaDescription:
    "قِس قيادتك في 10 دقائق عبر ستة أوجه، وتدرّب على الجوانب الأكثر حاجة، ثم قِس من جديد. مبني على بحث دكتوراه في جامعة كوازولو-ناتال.",
  heroEyebrow: `تطوير القيادة مع ${SC}`,
  heroTitle: "القيادة مهارة يمكن تعلّمها، ونحن نثبت ذلك.",
  heroLede:
    "قِس قيادتك في 10 دقائق. تدرّب على الجوانب الأكثر حاجة. ثم قِس من جديد وشاهد التغيير في تقرير يمكنك مشاركته.",
  heroCtaBaseline: "ابدأ التقييم المجاني · 10 دقائق",
  heroCtaSample: "اطّلع على نموذج تقرير",
  heroResearch: "مبني على بحث دكتوراه في جامعة كوازولو-ناتال (DBA، 2021).",
  whatEyebrow: "ما هو",
  whatTitle: "حلقة بسيطة: قِس، تدرّب، أثبِت.",
  whatDescription: `ينظر ${SC} إلى القائد ككل، لا إلى مهارة واحدة. فهو يقيس ستة أوجه: الخيارات، والمبادئ، والعقلي، والعاطفي، والجسدي، والروحي. ثم يساعدك على تنمية الأوجه الأهم بالنسبة إليك.`,
  steps: [
    {
      title: "قِس",
      body: "أجرِ تقييمًا أوليًا مجانيًا مدته 10 دقائق. تحصل على درجة لكل وجه من أوجه القيادة الستة، فترى نقاط قوتك وفجواتك.",
    },
    {
      title: "تدرّب",
      body: "تابع جلسات قصيرة مصممة لفئتك العمرية، مع خطة تدريب أسبوعية تبدأ بأضعف أوجهك.",
    },
    {
      title: "أثبِت",
      body: "قِس من جديد. يُظهر تقرير «قبل وبعد» ما تغيّر، وتحمل شهادتك رمز تحقق علنيًا.",
    },
  ],
  facesLabel: "الأوجه الستة",
  pathEyebrow: "اختر مسارك",
  pathTitle: "نموذج واحد لكل مرحلة من مراحل الحياة.",
  pathDescription: "تبقى الأوجه الستة نفسها مع نموّك. أما اللغة والأمثلة والتقارير فتتغير بحسب هويتك والمكان الذي تقود فيه.",
  individuals: {
    label: "الأفراد",
    title: "طوّر قيادتك الشخصية",
    body: "تقييم أولي مجاني، ودورات قصيرة لفئتك العمرية، وتقرير «قبل وبعد».",
    cta: "استكشف البرامج",
    kids: "الأطفال 5–12",
    teens: "اليافعون 13–21",
    adults: "البالغون 22+",
  },
  organisations: {
    label: "المؤسسات",
    title: "طوّر القادة في فريق كامل",
    body: "باقات مقاعد، وتقارير للمجموعات، وبرامج بإشراف ميسّرين للفرق والشركات والشبكات.",
    cta: "للمؤسسات",
    pilot: "الباقة التجريبية",
    speaking: "المحاضرات",
  },
  schools: {
    label: "المدارس",
    title: "مسار لكل متعلّم",
    body: "قيادة مناسبة لأعمار المتعلّمين، مع متابعة التقدّم للمعلّمين.",
    cta: "للمدارس",
    pricing: "الأسعار",
    sample: "نموذج تقرير",
  },
  getEyebrow: "ما الذي تحصل عليه",
  getTitle: "كل ما تحتاجه لتنمو، ولتُظهر نموّك.",
  youGet: [
    "تقييم أولي مجاني للقيادة عبر الأوجه الستة",
    "ست دورات قصيرة مكتوبة لفئتك العمرية",
    "خطة تدريب أسبوعية تركّز على أضعف أوجهك",
    "تقييم ثانٍ لقياس التغيير",
    "تقرير نموّ «قبل وبعد» (PDF)",
    "شهادة تحمل رمز تحقق علنيًا",
    "يوميات خاصة: لا يرى المدرّب درجاتك إلا بموافقتك",
  ],
  exampleLabel: "مثال فقط، وليس متعلّمًا حقيقيًا",
  exampleBody: "قد يُظهر التقرير ارتفاع الدرجة الإجمالية من {score} (من 100) بعد ثمانية أسابيع. ستختلف نتائجك.",
  exampleScore: "52 إلى 68",
  exampleLink: "اطّلع على نموذج التقرير",
  priceEyebrow: "السعر",
  priceTitle: "ابدأ مجانًا. وادفع مرة واحدة إن تابعت.",
  freeTitle: "التقييم الأولي المجاني",
  freeBody: "درجاتك في الأوجه الستة خلال 10 دقائق تقريبًا. لا حاجة إلى بطاقة.",
  fullTitle: "البرنامج الكامل، للشخص الواحد",
  fullOnce: "مرة واحدة (نحو {usd} دولار أمريكي)",
  fullBody: "دورات، وخطة تدريب، وتقييم ثانٍ، وتقرير، وشهادة. دون اشتراك.",
  groupsTitle: "المجموعات والمدارس والمؤسسات",
  groupsBody:
    "باقات مقاعد تبدأ من {pack} لـ{seats} متعلّمين، أو اطلب منا عرض سعر لبرنامج كامل مع التيسير والتقارير.",
  forOrganisations: "للمؤسسات",
  forSchools: "للمدارس",
  fullPricing: "اطّلع على جميع الأسعار",
  researchEyebrow: "البحث",
  researchTitle: "اختُبر قبل أن يُدرَّس.",
  researchDescription: `انبثق ${SC} من بحث الدكتوراه الذي أجراه الدكتور كريغ مولر في جامعة كوازولو-ناتال (DBA، 2021). اختُبر النموذج عبر استطلاع شمل 132 موظفًا ومقابلات مع 10 من كبار القادة، ونُشر في مجلات علمية محكّمة.`,
  researchCardLabel: `تدخلات ${SC} القيادية لمدة 12 أسبوعًا`,
  researchEmotional: "المكسب في الوجه العاطفي",
  researchOverall: "النمو الإجمالي عبر الأوجه الستة كلها",
  researchNote:
    `نتائج مجمّعة قبل الدورة وبعدها، من مؤسسات السلع الاستهلاكية سريعة التداول (FMCG) في جنوب أفريقيا وخارجها. المصدر: الملف التعريفي لشركة ${SC}، سبتمبر 2023.`,
  readResearch: "اقرأ البحث والنظرية",
  readCaseStudy: "اقرأ دراسة حالة قطاع السلع الاستهلاكية (FMCG)",
  aboutCraig: "عن الدكتور كريغ مولر",
  nextEyebrow: "الخطوة التالية",
  nextTitle: "ابدأ بتقييم أولي مجاني مدته 10 دقائق.",
  nextBody: "اطّلع على درجاتك في الأوجه الستة اليوم. هل تقود فريقًا أو مدرسة؟ احجز مكالمة قصيرة وسنخطط معك لبرنامج تجريبي.",
  startBaseline: "ابدأ التقييم المجاني",
  bookCall: "احجز مكالمة",
  testimonialsNote: "تُعرض الشهادات بلغتها الإنجليزية الأصلية.",
};

const zu: Draft = {
  metaTitle: "I-Super-Cube®, ukuthuthukisa ubuholi: linganisa, zilolonge, fakazela",
  metaDescription:
    "Linganisa ubuholi bakho emizuzwini eyi-10 ezinhlangothini eziyisithupha, zilolonge ezindaweni ezidinga kakhulu, bese uphinda ulinganise. Kusekelwe ocwaningweni lobudokotela e-UKZN.",
  heroEyebrow: "Ukuthuthukisa ubuholi nge-Super-Cube®",
  heroTitle: "Ubuholi buyafundeka, futhi siyakufakazela.",
  heroLede:
    "Linganisa ubuholi bakho emizuzwini eyi-10. Zilolonge ezindaweni ezidinga ukuthuthukiswa kakhulu. Phinda ulinganise, ubone ushintsho embikweni ongawabelana nabanye.",
  heroCtaBaseline: "Qala isisekelo samahhala · imiz. 10",
  heroCtaSample: "Bona umbiko wesampula",
  heroResearch: "Kusekelwe ocwaningweni lobudokotela eNyuvesi yaKwaZulu-Natali (DBA, 2021).",
  whatEyebrow: "Kuyini",
  whatTitle: "Umjikelezo olula: linganisa, zilolonge, fakazela.",
  whatDescription:
    "I-Super-Cube® ibheka umholi wonke, hhayi ikhono elilodwa. Ilinganisa izinhlangothi eziyisithupha: Izinketho, Izimiso, Ingqondo, Imizwa, Umzimba kanye noMoya. Bese ikusiza ukuthi ukhulise lezo ezibaluleke kakhulu kuwe.",
  steps: [
    {
      title: "Linganisa",
      body: "Yenza isisekelo samahhala semizuzu eyi-10. Uthola amaphuzu ohlangothini ngalunye lobuholi oluyisithupha, ukuze ubone amandla akho nalapho kusweleka khona.",
    },
    {
      title: "Zilolonge",
      body: "Sebenza ngezifundo ezimfushane zeqembu lakho leminyaka, ngohlelo lokuzilolonga lwamasonto onke oluqala ngezinhlangothi zakho ezibuthaka kakhulu.",
    },
    {
      title: "Fakazela",
      body: "Phinda ulinganise. Umbiko wakho wangaphambili nangemuva ubonisa okushintshile, futhi isitifiketi sakho sinenombolo yokuqinisekisa yomphakathi.",
    },
  ],
  facesLabel: "Izinhlangothi eziyisithupha",
  pathEyebrow: "Khetha indlela yakho",
  pathTitle: "Imodeli eyodwa yaso sonke isigaba sempilo.",
  pathDescription:
    "Izinhlangothi eziyisithupha zihlala zinjalo njengoba ukhula. Ulimi, izibonelo nemibiko kushintsha ngokuthi ungubani nokuthi uhola kuphi.",
  individuals: {
    label: "Abantu ngabanye",
    title: "Khulisa ubuholi bakho",
    body: "Isisekelo samahhala, izifundo ezimfushane zeqembu lakho leminyaka kanye nombiko wangaphambili nangemuva.",
    cta: "Hlola izinhlelo",
    kids: "Izingane 5–12",
    teens: "Intsha 13–21",
    adults: "Abadala 22+",
  },
  organisations: {
    label: "Izinhlangano",
    title: "Thuthukisa abaholi kulo lonke ithimba",
    body: "Amaphakethe ezihlalo, imibiko yamaqembu nezinhlelo eziqhutshwa ngabagqugquzeli bamathimba, izinkampani namanethiwekhi.",
    cta: "Okwezinhlangano",
    pilot: "Iphakethe le-pilot",
    speaking: "Izinkulumo",
  },
  schools: {
    label: "Izikole",
    title: "Indlela yawo wonke umfundi",
    body: "Ubuholi obufanele iminyaka yabafundi, nokubuka inqubekela phambili kothisha.",
    cta: "Okwezikole",
    pricing: "Amanani",
    sample: "Umbiko wesampula",
  },
  getEyebrow: "Okutholayo",
  getTitle: "Konke okudingayo ukuze ukhule, futhi ukubonise.",
  youGet: [
    "Isisekelo samahhala sobuholi sezinhlangothi eziyisithupha",
    "Izifundo eziyisithupha ezimfushane, ezibhalelwe iqembu lakho leminyaka",
    "Uhlelo lokuzilolonga lwamasonto onke olugxile ezinhlangothini zakho ezibuthaka",
    "Ukuhlolwa kwesibili ukuze kulinganiswe ushintsho",
    "Umbiko wokukhula wangaphambili nangemuva (PDF)",
    "Isitifiketi esinenombolo yokuqinisekisa yomphakathi",
    "Amajenali angasese: umqeqeshi ubona amaphuzu akho kuphela uma uvuma",
  ],
  exampleLabel: "Isibonelo kuphela, akusiye umfundi wangempela",
  exampleBody:
    "Umbiko ungabonisa amaphuzu esewonke esuka ku-{score} (kwali-100) emva kwamasonto ayisishiyagalombili. Imiphumela yakho izohluka.",
  exampleScore: "52 aye ku-68",
  exampleLink: "Bona umbiko wesampula",
  priceEyebrow: "Intengo",
  priceTitle: "Qala mahhala. Khokha kanye uma uqhubeka.",
  freeTitle: "Isisekelo samahhala",
  freeBody: "Amaphuzu akho ezinhlangothi eziyisithupha emizuzwini ecishe ibe yi-10. Akudingeki ikhadi.",
  fullTitle: "Uhlelo oluphelele, umuntu ngamunye",
  fullOnce: "kanye (cishe u-{usd} USD)",
  fullBody: "Izifundo, uhlelo lokuzilolonga, ukuhlolwa kwesibili, umbiko nesitifiketi. Akukho ukubhalisa kwanyanga zonke.",
  groupsTitle: "Amaqembu, izikole nezinhlangano",
  groupsBody:
    "Amaphakethe ezihlalo kusukela ku-{pack} wabafundi abangu-{seats}, noma usicele isilinganiso sentengo sohlelo oluphelele olunokugqugquzela nemibiko.",
  forOrganisations: "Okwezinhlangano",
  forSchools: "Okwezikole",
  fullPricing: "Bona wonke amanani",
  researchEyebrow: "Ucwaningo",
  researchTitle: "Kwahlolwa ngaphambi kokuba kufundiswe.",
  researchDescription:
    "I-Super-Cube® yavela ocwaningweni lobudokotela lukaDkt Craig Muller eNyuvesi yaKwaZulu-Natali (DBA, 2021). Imodeli yahlolwa ngenhlolovo yabasebenzi abayi-132 nezingxoxo nabaholi abaphezulu abayi-10, futhi yashicilelwa kumajenali abuyekezwa ngontanga.",
  researchCardLabel: "Izinhlelo zobuholi ze-Super-Cube® zamasonto ayi-12",
  researchEmotional: "Inzuzo, uhlangothi lwemizwa",
  researchOverall: "Ukukhula okuphelele kuzo zonke izinhlangothi eziyisithupha",
  researchNote:
    "Imiphumela ehlanganisiwe ngaphambi nangemva kwesifundo, ezinhlanganweni ze-FMCG zaseNingizimu Afrika nezamazwe ngamazwe. Umthombo: iphrofayela yenkampani ye-Super-Cube®, Sept 2023.",
  readResearch: "Funda ucwaningo nethiyori",
  readCaseStudy: "Funda ucwaningo lwesimo lwe-FMCG",
  aboutCraig: "Mayelana noDkt Craig Muller",
  nextEyebrow: "Isinyathelo esilandelayo",
  nextTitle: "Qala ngesisekelo samahhala semizuzu eyi-10.",
  nextBody:
    "Bona amaphuzu akho ezinhlangothi eziyisithupha namuhla. Uhola ithimba noma isikole? Bhuka ucingo olufushane futhi sizohlela i-pilot nawe.",
  startBaseline: "Qala isisekelo samahhala",
  bookCall: "Bhuka ucingo",
  testimonialsNote: "Ubufakazi bukhonjiswa ngesiNgisi sokuqala.",
};

const af: Draft = {
  metaTitle: "Super-Cube®-leierskapsontwikkeling: meet, oefen, bewys",
  metaDescription:
    "Meet jou leierskap in 10 minute oor ses vlakke, oefen die areas wat dit die meeste nodig het, en meet dan weer. Gebou op doktorale navorsing aan UKZN.",
  heroEyebrow: "Super-Cube®-leierskapsontwikkeling",
  heroTitle: "Leierskap is aanleerbaar, en ons bewys dit.",
  heroLede:
    "Meet jou leierskap in 10 minute. Oefen die areas wat dit die meeste nodig het. Meet weer, en sien die verandering in ’n verslag wat jy kan deel.",
  heroCtaBaseline: "Begin gratis basislyn · 10 min",
  heroCtaSample: "Sien ’n voorbeeldverslag",
  heroResearch: "Gebou op doktorale navorsing aan die Universiteit van KwaZulu-Natal (DBA, 2021).",
  whatEyebrow: "Wat dit is",
  whatTitle: "’n Eenvoudige kringloop: meet, oefen, bewys.",
  whatDescription:
    "Super-Cube® kyk na die hele leier, nie na een vaardigheid nie. Dit meet ses vlakke: Keuses, Beginsels, Verstandelik, Emosioneel, Fisies en Geestelik. Dan help dit jou om dié te laat groei wat vir jou die belangrikste is.",
  steps: [
    {
      title: "Meet",
      body: "Doen ’n gratis basislyn van 10 minute. Jy kry ’n telling vir elk van die ses vlakke van leierskap, sodat jy jou sterk punte en gapings kan sien.",
    },
    {
      title: "Oefen",
      body: "Werk deur kort sessies vir jou ouderdomsgroep, met ’n weeklikse oefenplan wat by jou swakste vlakke begin.",
    },
    {
      title: "Bewys",
      body: "Meet weer. Jou voor-en-ná-verslag wys wat verander het, en jou sertifikaat het ’n openbare verifikasie-ID.",
    },
  ],
  facesLabel: "Die ses vlakke",
  pathEyebrow: "Kies jou pad",
  pathTitle: "Een model vir elke lewensfase.",
  pathDescription:
    "Die ses vlakke bly dieselfde soos jy groei. Die taal, voorbeelde en verslae verander na gelang van wie jy is en waar jy lei.",
  individuals: {
    label: "Individue",
    title: "Laat jou eie leierskap groei",
    body: "’n Gratis basislyn, kort kursusse vir jou ouderdomsgroep en ’n voor-en-ná-verslag.",
    cta: "Verken programme",
    kids: "Kinders 5–12",
    teens: "Tieners 13–21",
    adults: "Volwassenes 22+",
  },
  organisations: {
    label: "Organisasies",
    title: "Ontwikkel leiers regoor ’n span",
    body: "Plekpakkette, groepverslae en gefasiliteerde programme vir spanne, maatskappye en netwerke.",
    cta: "Vir organisasies",
    pilot: "Loodspakket",
    speaking: "Toesprake",
  },
  schools: {
    label: "Skole",
    title: "’n Pad vir elke leerder",
    body: "Ouderdomsgepaste leierskap vir leerders, met vorderingsoorsigte vir onderwysers.",
    cta: "Vir skole",
    pricing: "Pryse",
    sample: "Voorbeeldverslag",
  },
  getEyebrow: "Wat jy kry",
  getTitle: "Alles wat jy nodig het om te groei, en om dit te wys.",
  youGet: [
    "’n Gratis leierskapsbasislyn oor ses vlakke",
    "Ses kort kursusse, geskryf vir jou ouderdomsgroep",
    "’n Weeklikse oefenplan wat op jou swakste vlakke fokus",
    "’n Tweede assessering om die verandering te meet",
    "’n Voor-en-ná-groeiverslag (PDF)",
    "’n Sertifikaat met ’n openbare verifikasie-ID",
    "Privaat joernale: ’n afrigter sien jou tellings net as jy instem",
  ],
  exampleLabel: "Slegs ’n voorbeeld, nie ’n regte leerder nie",
  exampleBody:
    "’n Verslag kan wys dat ’n algehele telling ná agt weke van {score} (uit 100) styg. Jou resultate sal verskil.",
  exampleScore: "52 tot 68",
  exampleLink: "Sien die voorbeeldverslag",
  priceEyebrow: "Prys",
  priceTitle: "Begin gratis. Betaal een keer as jy voortgaan.",
  freeTitle: "Gratis basislyn",
  freeBody: "Jou tellings oor ses vlakke in sowat 10 minute. Geen kaart nodig nie.",
  fullTitle: "Volledige program, per persoon",
  fullOnce: "een keer (sowat ${usd} USD)",
  fullBody: "Kursusse, oefenplan, tweede assessering, verslag en sertifikaat. Geen intekening nie.",
  groupsTitle: "Groepe, skole en organisasies",
  groupsBody:
    "Plekpakkette vanaf {pack} vir {seats} leerders, of vra ons vir ’n kwotasie vir ’n volledige program met fasilitering en verslagdoening.",
  forOrganisations: "Vir organisasies",
  forSchools: "Vir skole",
  fullPricing: "Sien alle pryse",
  researchEyebrow: "Die navorsing",
  researchTitle: "Getoets voordat dit geleer is.",
  researchDescription:
    "Super-Cube® het uit dr. Craig Muller se doktorale navorsing aan die Universiteit van KwaZulu-Natal (DBA, 2021) voortgespruit. Die model is getoets met ’n opname onder 132 werknemers en onderhoude met 10 senior leiers, en is in eweknie-beoordeelde vaktydskrifte gepubliseer.",
  researchCardLabel: "12-week Super-Cube®-leierskapsintervensies",
  researchEmotional: "Groei, emosionele vlak",
  researchOverall: "Algehele groei oor al ses vlakke",
  researchNote:
    "Saamgestelde voor- en ná-kursusresultate, Suid-Afrikaanse en internasionale FMCG-organisasies. Bron: Super-Cube®-maatskappyprofiel, Sept. 2023.",
  readResearch: "Lees die navorsing en teorie",
  readCaseStudy: "Lees die FMCG-gevallestudie",
  aboutCraig: "Oor dr. Craig Muller",
  nextEyebrow: "Volgende stap",
  nextTitle: "Begin met ’n gratis basislyn van 10 minute.",
  nextBody:
    "Sien vandag jou tellings oor ses vlakke. Lei jy ’n span of ’n skool? Bespreek ’n kort oproep en ons beplan saam met jou ’n loodsprojek.",
  startBaseline: "Begin gratis basislyn",
  bookCall: "Bespreek ’n oproep",
  testimonialsNote: "Getuigskrifte word in die oorspronklike Engels gewys.",
};

const DRAFTS: Partial<Record<Locale, Draft>> = { fr, pt, sw, ar, zu, af };

/** This language's home copy, English per string where a translation is missing. */
export function homeStrings(locale: Locale): HomeStrings {
  const d = DRAFTS[locale];
  if (!d) return en;
  return {
    ...en,
    ...d,
    individuals: { ...en.individuals, ...d.individuals },
    organisations: { ...en.organisations, ...d.organisations },
    schools: { ...en.schools, ...d.schools },
  } as HomeStrings;
}
