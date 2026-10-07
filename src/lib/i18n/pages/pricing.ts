/**
 * Pricing page copy per language. Server only: the page resolves one language and passes it to the
 * client view as props, so the browser never downloads the other languages. English is the source;
 * other languages are MACHINE-DRAFTED and fall back to English per string.
 *
 * Price meaning is fixed in every language: R99 once, lifetime access (paid access never expires),
 * no subscription. "Super-Cube®" and "Paystack" are names and stay as they are.
 */
import type { Locale } from "../config";
import type { ProgrammeId } from "@/lib/programmes";
import { CHECKOUT_FORM_EN, type CheckoutFormStrings } from "./checkout-form";

type ProgrammeCopy = { name: string; ageLabel: string; tagline: string; description: string };

export type PricingStrings = {
  metaTitle: string;
  metaDescription: string;
  eyebrow: string;
  title: string;
  /** {zar} {usd} */
  description: string;
  alreadyPaid: string;
  openLearn: string;
  termsLabel: string;
  termFree: string;
  termFreeRest: string;
  /** {zar} {usd} */
  termOnce: string;
  termOnceRest: string;
  termNoFee: string;
  termNoFeeRest: string;
  launchLabel: string;
  /** {usd} */
  orUsd: string;
  programmes: Record<ProgrammeId, ProgrammeCopy>;
  /** after the price: "R99 · lifetime access" */
  lifetimeAccess: string;
  features: string[];
  /** {zar} */
  buy: string;
  startFree: string;
  pilotLabel: string;
  pilotTitle: string;
  pilotBody: string;
  /** {signin} → tipSignin in bold */
  tip: string;
  tipSignin: string;
  coachTools: string;
  facilitatorKit: string;
  createCoach: string;
  pilotCall: string;
  /** {paystack} → "Paystack" in bold */
  paymentsNote: string;
  learnDashboard: string;
  startBaseline: string;
  seatPackNote: string;
  checkout: string;
  closeCheckout: string;
  startFreeInstead: string;
  form: CheckoutFormStrings;
};

const en: PricingStrings = {
  metaTitle: "Pricing: free baseline, R99 programmes and seat packs",
  metaDescription:
    "Start free, then unlock a full Super-Cube® programme for kids, teens or adults with one R99 payment for lifetime access. Seat packs for schools and companies. No subscription.",
  eyebrow: "Pricing",
  title: "Start free. Unlock the full pathway once.",
  description:
    "Kids (5–12), Adolescents (13–21), and Adults (22+). Free baseline on this device—then pay once with Paystack (R{zar} / ${usd} USD) for lifetime access. No subscription.",
  alreadyPaid: "You already have paid access on this device.",
  openLearn: "Open Learn",
  termsLabel: "Simple terms",
  termFree: "Free baseline",
  termFreeRest: "— orient + six-face measure without paying.",
  termOnce: "R{zar} once (≈ ${usd} USD)",
  termOnceRest: "— lifetime access to the full programme, report and certificate via Paystack.",
  termNoFee: "No monthly fee",
  termNoFeeRest: "— one payment per programme on this path.",
  launchLabel: "Launch price · one-time · Paystack",
  orUsd: "or ${usd} USD",
  programmes: {
    kids: {
      name: "Super-Cube® Kids",
      ageLabel: "Ages 5–12",
      tagline: "Growing character, curiosity, and kindness.",
      description:
        "A guided Super-Cube® journey for younger learners—simple language, stories, play-based practice, and parent/teacher support. Builds the six faces of leadership as everyday strengths.",
    },
    adolescents: {
      name: "Super-Cube® Adolescents",
      ageLabel: "Ages 13–21",
      tagline: "Identity, influence, and wise decisions.",
      description:
        "For teens and young adults navigating school, sport, first jobs, and digital life. Develops choices, principles, mindset, emotions, body, and purpose—with real-world scenarios.",
    },
    adults: {
      name: "Super-Cube® Adults",
      ageLabel: "Ages 22+",
      tagline: "Human-centric leadership for work and life.",
      description:
        "The full professional Super-Cube® pathway: pre-assessment, six construct courses, deliberate practice, post-assessment, and a personal development report for workplace leaders.",
    },
  },
  lifetimeAccess: "lifetime access",
  features: [
    "Lifetime access",
    "Pre-assessment baseline",
    "6 construct courses (age-adapted)",
    "Practice labs & checks",
    "Post-assessment & personal report",
  ],
  buy: "Buy with Paystack · R{zar}",
  startFree: "Start free on this device (no payment)",
  pilotLabel: "Schools · companies · cohorts · Phase 2",
  pilotTitle: "Seat packs — pay once, get a cohort code",
  pilotBody:
    "Buy 10, 20, or 50 learner seats. Each seat is lifetime access to the programme for that learner. We create a cohort code after payment. Learners join under Learn → Org. Coaches see scores and completion only when learners consent—never journal text.",
  tip: "Tip: {signin} with the same email before paying so admin rights attach to your account. Then open Learn → Coach tools.",
  tipSignin: "sign up / sign in",
  coachTools: "Coach tools",
  facilitatorKit: "Facilitator kit",
  createCoach: "Create coach account",
  pilotCall: "Prefer a guided pilot call",
  paymentsNote: "Payments are processed securely by {paystack}. We never see or store your full card details.",
  learnDashboard: "Learning dashboard",
  startBaseline: "Start free baseline",
  seatPackNote: "The seat-pack checkout is in English.",
  checkout: "Checkout",
  closeCheckout: "Close checkout",
  startFreeInstead: "Start free on this device instead (no payment)",
  form: CHECKOUT_FORM_EN,
};

type Draft = Partial<Omit<PricingStrings, "programmes" | "form">> & {
  programmes?: Partial<Record<ProgrammeId, Partial<ProgrammeCopy>>>;
  form?: Partial<CheckoutFormStrings>;
};

const NB = "\u202f";
const fr: Draft = {
  metaTitle: "Tarifs" + NB + ": bilan initial gratuit, programmes à R99 et packs de places",
  metaDescription:
    "Commencez gratuitement, puis débloquez un programme Super-Cube® complet pour enfants, adolescents ou adultes avec un paiement unique de R99 pour un accès à vie. Packs de places pour écoles et entreprises. Sans abonnement.",
  eyebrow: "Tarifs",
  title: "Commencez gratuitement. Débloquez le parcours complet en une fois.",
  description:
    "Enfants (5–12 ans), adolescents (13–21 ans) et adultes (22 ans et +). Bilan initial gratuit sur cet appareil, puis un paiement unique via Paystack (R{zar} / {usd}" +
    NB +
    "USD) pour un accès à vie. Sans abonnement.",
  alreadyPaid: "Vous disposez déjà d’un accès payant sur cet appareil.",
  openLearn: "Ouvrir Learn",
  termsLabel: "Conditions simples",
  termFree: "Bilan initial gratuit",
  termFreeRest: "— orientation et mesure des six faces sans payer.",
  termOnce: "R{zar} une seule fois (≈ {usd}" + NB + "USD)",
  termOnceRest: "— accès à vie au programme complet, au rapport et au certificat via Paystack.",
  termNoFee: "Aucun frais mensuel",
  termNoFeeRest: "— un seul paiement par programme sur ce parcours.",
  launchLabel: "Prix de lancement · paiement unique · Paystack",
  orUsd: "ou {usd}" + NB + "USD",
  programmes: {
    kids: {
      name: "Super-Cube® Enfants",
      ageLabel: "5 à 12 ans",
      tagline: "Développer le caractère, la curiosité et la bienveillance.",
      description:
        "Un parcours Super-Cube® guidé pour les plus jeunes" +
        NB +
        ": langage simple, histoires, pratique par le jeu et soutien des parents et enseignants. Il développe les six faces du leadership comme des forces du quotidien.",
    },
    adolescents: {
      name: "Super-Cube® Adolescents",
      ageLabel: "13 à 21 ans",
      tagline: "Identité, influence et décisions éclairées.",
      description:
        "Pour les adolescents et jeunes adultes qui naviguent entre école, sport, premiers emplois et vie numérique. Il développe les choix, les principes, l’état d’esprit, les émotions, le corps et le sens, à partir de situations réelles.",
    },
    adults: {
      name: "Super-Cube® Adultes",
      ageLabel: "22 ans et +",
      tagline: "Un leadership centré sur l’humain, au travail comme dans la vie.",
      description:
        "Le parcours professionnel Super-Cube® complet" +
        NB +
        ": évaluation initiale, six cours thématiques, pratique délibérée, évaluation finale et rapport de développement personnel pour les leaders en entreprise.",
    },
  },
  lifetimeAccess: "accès à vie",
  features: [
    "Accès à vie",
    "Bilan d’évaluation initial",
    "6 cours thématiques (adaptés à l’âge)",
    "Ateliers pratiques et vérifications",
    "Évaluation finale et rapport personnel",
  ],
  buy: "Acheter avec Paystack · R{zar}",
  startFree: "Commencer gratuitement sur cet appareil (sans paiement)",
  pilotLabel: "Écoles · entreprises · cohortes · Phase 2",
  pilotTitle: "Packs de places : payez une fois, recevez un code de cohorte",
  pilotBody:
    "Achetez 10, 20 ou 50 places. Chaque place donne à un participant un accès à vie au programme. Nous créons un code de cohorte après le paiement. Les participants rejoignent la cohorte dans Learn → Org. Les coachs ne voient les scores et la progression qu’avec le consentement des participants, jamais le contenu des journaux.",
  tip: "Astuce" + NB + ": {signin} avec la même adresse e-mail avant de payer, afin que les droits d’administration soient associés à votre compte. Ouvrez ensuite Learn → Outils du coach.",
  tipSignin: "créez un compte ou connectez-vous",
  coachTools: "Outils du coach",
  facilitatorKit: "Kit d’animation",
  createCoach: "Créer un compte coach",
  pilotCall: "Préférer un appel pilote accompagné",
  paymentsNote:
    "Les paiements sont traités de manière sécurisée par {paystack}. Nous ne voyons ni ne conservons jamais les données complètes de votre carte.",
  learnDashboard: "Tableau de bord Learn",
  startBaseline: "Bilan initial gratuit",
  seatPackNote: "Le paiement des packs de places est en anglais.",
  checkout: "Paiement",
  closeCheckout: "Fermer le paiement",
  startFreeInstead: "Commencer plutôt gratuitement sur cet appareil (sans paiement)",
  form: {
    email: "E-mail (obligatoire pour le reçu)",
    emailPlaceholder: "vous@ecole.fr",
    name: "Nom (facultatif)",
    namePlaceholder: "Votre nom",
    pay: "Payer {price} · débloquer {programme}",
    redirecting: "Redirection vers Paystack…",
    unavailable:
      "Le paiement en ligne est temporairement indisponible. Vous pouvez tout de même commencer gratuitement sur cet appareil, ou nous contacter pour organiser votre accès.",
    unavailableShort:
      "Le paiement en ligne est temporairement indisponible. Commencez gratuitement sur cet appareil ou contactez-nous.",
    secure: "Paiement sécurisé via Paystack · {price} en une fois · accès à vie · sans abonnement",
    invalidEmail: "Saisissez une adresse e-mail valide pour votre reçu de paiement.",
    couldNotStart: "Le paiement n’a pas pu démarrer. Réessayez.",
    network: "Erreur réseau. Vérifiez votre connexion et réessayez.",
  },
};

const pt: Draft = {
  metaTitle: "Preços: avaliação inicial grátis, programas a R99 e pacotes de lugares",
  metaDescription:
    "Comece grátis e depois desbloqueie um programa Super-Cube® completo para crianças, jovens ou adultos com um único pagamento de R99 para acesso vitalício. Pacotes de lugares para escolas e empresas. Sem subscrição.",
  eyebrow: "Preços",
  title: "Comece grátis. Desbloqueie o percurso completo de uma só vez.",
  description:
    "Crianças (5–12), jovens (13–21) e adultos (22+). Avaliação inicial grátis neste dispositivo e, depois, um único pagamento com Paystack (R{zar} / {usd} USD) para acesso vitalício. Sem subscrição.",
  alreadyPaid: "Já tem acesso pago neste dispositivo.",
  openLearn: "Abrir o Learn",
  termsLabel: "Condições simples",
  termFree: "Avaliação inicial grátis",
  termFreeRest: "— orientação e medição das seis faces sem pagar.",
  termOnce: "R{zar} uma única vez (≈ {usd} USD)",
  termOnceRest: "— acesso vitalício ao programa completo, relatório e certificado através da Paystack.",
  termNoFee: "Sem mensalidade",
  termNoFeeRest: "— um único pagamento por programa neste percurso.",
  launchLabel: "Preço de lançamento · pagamento único · Paystack",
  orUsd: "ou {usd} USD",
  programmes: {
    kids: {
      name: "Super-Cube® Crianças",
      ageLabel: "5–12 anos",
      tagline: "Desenvolver o carácter, a curiosidade e a bondade.",
      description:
        "Um percurso Super-Cube® guiado para os mais novos: linguagem simples, histórias, prática através do jogo e apoio de pais e professores. Desenvolve as seis faces da liderança como forças do dia a dia.",
    },
    adolescents: {
      name: "Super-Cube® Jovens",
      ageLabel: "13–21 anos",
      tagline: "Identidade, influência e decisões sensatas.",
      description:
        "Para adolescentes e jovens adultos entre a escola, o desporto, os primeiros empregos e a vida digital. Desenvolve escolhas, princípios, mentalidade, emoções, corpo e propósito, com cenários reais.",
    },
    adults: {
      name: "Super-Cube® Adultos",
      ageLabel: "22+ anos",
      tagline: "Liderança centrada nas pessoas, no trabalho e na vida.",
      description:
        "O percurso profissional Super-Cube® completo: avaliação inicial, seis cursos temáticos, prática deliberada, avaliação final e um relatório de desenvolvimento pessoal para líderes no local de trabalho.",
    },
  },
  lifetimeAccess: "acesso vitalício",
  features: [
    "Acesso vitalício",
    "Avaliação inicial de referência",
    "6 cursos temáticos (adaptados à idade)",
    "Laboratórios de prática e verificações",
    "Avaliação final e relatório pessoal",
  ],
  buy: "Comprar com Paystack · R{zar}",
  startFree: "Começar grátis neste dispositivo (sem pagamento)",
  pilotLabel: "Escolas · empresas · grupos · Fase 2",
  pilotTitle: "Pacotes de lugares: pague uma vez e receba um código de grupo",
  pilotBody:
    "Compre 10, 20 ou 50 lugares. Cada lugar dá a um participante acesso vitalício ao programa. Criamos um código de grupo após o pagamento. Os participantes juntam-se em Learn → Org. Os coaches só veem pontuações e conclusão com o consentimento dos participantes, nunca o texto dos diários.",
  tip: "Dica: {signin} com o mesmo e-mail antes de pagar, para que os direitos de administração fiquem associados à sua conta. Depois abra Learn → Ferramentas do coach.",
  tipSignin: "registe-se ou inicie sessão",
  coachTools: "Ferramentas do coach",
  facilitatorKit: "Kit do facilitador",
  createCoach: "Criar conta de coach",
  pilotCall: "Prefere uma chamada piloto acompanhada",
  paymentsNote:
    "Os pagamentos são processados em segurança pela {paystack}. Nunca vemos nem guardamos os dados completos do seu cartão.",
  learnDashboard: "Painel do Learn",
  startBaseline: "Avaliação inicial grátis",
  seatPackNote: "O pagamento dos pacotes de lugares está em inglês.",
  checkout: "Pagamento",
  closeCheckout: "Fechar pagamento",
  startFreeInstead: "Em vez disso, começar grátis neste dispositivo (sem pagamento)",
  form: {
    email: "E-mail (obrigatório para o recibo)",
    emailPlaceholder: "voce@escola.pt",
    name: "Nome (opcional)",
    namePlaceholder: "O seu nome",
    pay: "Pagar {price} · desbloquear {programme}",
    redirecting: "A redirecionar para a Paystack…",
    unavailable:
      "O pagamento online está temporariamente indisponível. Pode começar grátis neste dispositivo ou contactar-nos para combinar o acesso.",
    unavailableShort: "O pagamento online está temporariamente indisponível. Comece grátis neste dispositivo ou contacte-nos.",
    secure: "Pagamento seguro através da Paystack · {price} uma única vez · acesso vitalício · sem subscrição",
    invalidEmail: "Introduza um e-mail válido para o recibo de pagamento.",
    couldNotStart: "Não foi possível iniciar o pagamento. Tente novamente.",
    network: "Erro de rede. Verifique a sua ligação e tente novamente.",
  },
};

const sw: Draft = {
  metaTitle: "Bei: tathmini ya awali ya bure, programu za R99 na vifurushi vya nafasi",
  metaDescription:
    "Anza bure, kisha fungua programu kamili ya Super-Cube® kwa watoto, vijana au watu wazima kwa malipo moja ya R99 kwa ufikiaji wa maisha yote. Vifurushi vya nafasi kwa shule na makampuni. Hakuna usajili wa kila mwezi.",
  eyebrow: "Bei",
  title: "Anza bure. Fungua njia kamili mara moja.",
  description:
    "Watoto (5–12), Vijana (13–21) na Watu wazima (22+). Tathmini ya awali ya bure kwenye kifaa hiki, kisha lipa mara moja kupitia Paystack (R{zar} / USD {usd}) kwa ufikiaji wa maisha yote. Hakuna usajili wa kila mwezi.",
  alreadyPaid: "Tayari una ufikiaji uliolipiwa kwenye kifaa hiki.",
  openLearn: "Fungua Learn",
  termsLabel: "Masharti rahisi",
  termFree: "Tathmini ya awali ya bure",
  termFreeRest: "— maelekezo na kipimo cha pande sita bila kulipa.",
  termOnce: "R{zar} mara moja (≈ USD {usd})",
  termOnceRest: "— ufikiaji wa maisha yote kwa programu kamili, ripoti na cheti kupitia Paystack.",
  termNoFee: "Hakuna ada ya kila mwezi",
  termNoFeeRest: "— malipo moja kwa kila programu katika njia hii.",
  launchLabel: "Bei ya uzinduzi · malipo moja · Paystack",
  orUsd: "au USD {usd}",
  programmes: {
    kids: {
      name: "Super-Cube® Watoto",
      ageLabel: "Umri 5–12",
      tagline: "Kukuza tabia njema, udadisi na wema.",
      description:
        "Safari ya Super-Cube® inayoongozwa kwa wanafunzi wadogo: lugha rahisi, hadithi, mazoezi kupitia michezo, na msaada wa wazazi na walimu. Hujenga pande sita za uongozi kama nguvu za kila siku.",
    },
    adolescents: {
      name: "Super-Cube® Vijana",
      ageLabel: "Umri 13–21",
      tagline: "Utambulisho, ushawishi na maamuzi ya busara.",
      description:
        "Kwa vijana wanaopitia shule, michezo, kazi za kwanza na maisha ya kidijitali. Hukuza maamuzi, kanuni, mtazamo, hisia, mwili na kusudi, kwa kutumia hali halisi za maisha.",
    },
    adults: {
      name: "Super-Cube® Watu wazima",
      ageLabel: "Umri 22+",
      tagline: "Uongozi unaomzingatia binadamu kazini na maishani.",
      description:
        "Njia kamili ya kitaaluma ya Super-Cube®: tathmini ya awali, kozi sita za mada, mazoezi ya makusudi, tathmini ya mwisho na ripoti ya maendeleo binafsi kwa viongozi wa kazini.",
    },
  },
  lifetimeAccess: "ufikiaji wa maisha yote",
  features: [
    "Ufikiaji wa maisha yote",
    "Tathmini ya awali ya msingi",
    "Kozi 6 za mada (kulingana na umri)",
    "Maabara za mazoezi na ukaguzi",
    "Tathmini ya mwisho na ripoti binafsi",
  ],
  buy: "Nunua kwa Paystack · R{zar}",
  startFree: "Anza bure kwenye kifaa hiki (bila malipo)",
  pilotLabel: "Shule · makampuni · vikundi · Awamu ya 2",
  pilotTitle: "Vifurushi vya nafasi: lipa mara moja, pata msimbo wa kikundi",
  pilotBody:
    "Nunua nafasi 10, 20 au 50 za wanafunzi. Kila nafasi ni ufikiaji wa maisha yote wa programu kwa mwanafunzi huyo. Tunaunda msimbo wa kikundi baada ya malipo. Wanafunzi hujiunga kupitia Learn → Org. Makocha huona alama na ukamilishaji tu wanafunzi wakikubali, kamwe si maandishi ya shajara.",
  tip: "Kidokezo: {signin} kwa barua pepe ile ile kabla ya kulipa ili haki za msimamizi ziunganishwe na akaunti yako. Kisha fungua Learn → Zana za kocha.",
  tipSignin: "jisajili au ingia",
  coachTools: "Zana za kocha",
  facilitatorKit: "Kifaa cha mwezeshaji",
  createCoach: "Fungua akaunti ya kocha",
  pilotCall: "Ungependa simu ya majaribio inayoongozwa",
  paymentsNote:
    "Malipo yanachakatwa kwa usalama na {paystack}. Hatuoni wala kuhifadhi maelezo kamili ya kadi yako.",
  learnDashboard: "Dashibodi ya Learn",
  startBaseline: "Anza tathmini ya bure",
  seatPackNote: "Malipo ya vifurushi vya nafasi yako kwa Kiingereza.",
  checkout: "Malipo",
  closeCheckout: "Funga malipo",
  startFreeInstead: "Badala yake anza bure kwenye kifaa hiki (bila malipo)",
  form: {
    email: "Barua pepe (inahitajika kwa risiti)",
    emailPlaceholder: "wewe@shule.ac.ke",
    name: "Jina (si lazima)",
    namePlaceholder: "Jina lako",
    pay: "Lipa {price} · fungua {programme}",
    redirecting: "Inakupeleka Paystack…",
    unavailable:
      "Malipo ya mtandaoni hayapatikani kwa sasa. Bado unaweza kuanza bure kwenye kifaa hiki, au wasiliana nasi ili kupanga ufikiaji.",
    unavailableShort: "Malipo ya mtandaoni hayapatikani kwa sasa. Anza bure kwenye kifaa hiki au wasiliana nasi.",
    secure: "Malipo salama kupitia Paystack · {price} mara moja · ufikiaji wa maisha yote · hakuna usajili",
    invalidEmail: "Weka barua pepe sahihi kwa risiti yako ya malipo.",
    couldNotStart: "Malipo hayakuweza kuanza. Jaribu tena.",
    network: "Hitilafu ya mtandao. Angalia muunganisho wako na ujaribu tena.",
  },
};

const SC = "\u2066Super-Cube®\u2069";
const ar: Draft = {
  metaTitle: "الأسعار: تقييم أولي مجاني، وبرامج بسعر R99، وباقات مقاعد",
  metaDescription: `ابدأ مجانًا، ثم افتح برنامج ${SC} كاملًا للأطفال أو اليافعين أو البالغين بدفعة واحدة قدرها R99 مقابل وصول مدى الحياة. باقات مقاعد للمدارس والشركات. دون اشتراك.`,
  eyebrow: "الأسعار",
  title: "ابدأ مجانًا. وافتح المسار الكامل مرة واحدة.",
  description:
    "الأطفال (5–12)، واليافعون (13–21)، والبالغون (22+). تقييم أولي مجاني على هذا الجهاز، ثم دفعة واحدة عبر Paystack ‏(R{zar} / {usd} دولار أمريكي) مقابل وصول مدى الحياة. دون اشتراك.",
  alreadyPaid: "لديك بالفعل وصول مدفوع على هذا الجهاز.",
  openLearn: "افتح Learn",
  termsLabel: "شروط بسيطة",
  termFree: "التقييم الأولي المجاني",
  termFreeRest: "— تعريف وقياس للأوجه الستة دون دفع.",
  termOnce: "R{zar} مرة واحدة (≈ {usd} دولار أمريكي)",
  termOnceRest: "— وصول مدى الحياة إلى البرنامج الكامل والتقرير والشهادة عبر Paystack.",
  termNoFee: "لا رسوم شهرية",
  termNoFeeRest: "— دفعة واحدة لكل برنامج في هذا المسار.",
  launchLabel: "سعر الإطلاق · دفعة واحدة · Paystack",
  orUsd: "أو {usd} دولار أمريكي",
  programmes: {
    kids: {
      name: `${SC} للأطفال`,
      ageLabel: "من 5 إلى 12 عامًا",
      tagline: "تنمية الشخصية وحب الاستطلاع واللطف.",
      description: `رحلة ${SC} موجّهة للمتعلّمين الصغار: لغة بسيطة، وقصص، وتدريب قائم على اللعب، ودعم من الأهل والمعلّمين. تبني أوجه القيادة الستة كنقاط قوة يومية.`,
    },
    adolescents: {
      name: `${SC} لليافعين`,
      ageLabel: "من 13 إلى 21 عامًا",
      tagline: "الهوية والتأثير والقرارات الحكيمة.",
      description:
        "لليافعين والشباب بين المدرسة والرياضة وأول وظيفة والحياة الرقمية. ينمّي الخيارات والمبادئ والعقلية والمشاعر والجسد والهدف، من خلال مواقف واقعية.",
    },
    adults: {
      name: `${SC} للبالغين`,
      ageLabel: "22 عامًا فأكثر",
      tagline: "قيادة تتمحور حول الإنسان في العمل والحياة.",
      description: `مسار ${SC} المهني الكامل: تقييم أولي، وست دورات موضوعية، وتدريب مقصود، وتقييم نهائي، وتقرير تطوير شخصي لقادة بيئة العمل.`,
    },
  },
  lifetimeAccess: "وصول مدى الحياة",
  features: [
    "وصول مدى الحياة",
    "تقييم أولي مرجعي",
    "6 دورات موضوعية (مكيّفة حسب العمر)",
    "مختبرات تدريب واختبارات قصيرة",
    "تقييم نهائي وتقرير شخصي",
  ],
  buy: "اشترِ عبر Paystack · R{zar}",
  startFree: "ابدأ مجانًا على هذا الجهاز (دون دفع)",
  pilotLabel: "المدارس · الشركات · المجموعات · المرحلة 2",
  pilotTitle: "باقات المقاعد: ادفع مرة واحدة واحصل على رمز مجموعة",
  pilotBody:
    "اشترِ 10 أو 20 أو 50 مقعدًا للمتعلّمين. كل مقعد يمنح متعلّمًا واحدًا وصولًا مدى الحياة إلى البرنامج. ننشئ رمز المجموعة بعد الدفع. ينضم المتعلّمون من Learn ← Org. لا يرى المدرّبون الدرجات ونسب الإنجاز إلا بموافقة المتعلّمين، ولا يرون نصوص اليوميات أبدًا.",
  tip: "نصيحة: {signin} بالبريد الإلكتروني نفسه قبل الدفع لكي ترتبط صلاحيات الإدارة بحسابك. ثم افتح Learn ← أدوات المدرّب.",
  tipSignin: "أنشئ حسابًا أو سجّل الدخول",
  coachTools: "أدوات المدرّب",
  facilitatorKit: "حقيبة الميسّر",
  createCoach: "أنشئ حساب مدرّب",
  pilotCall: "تفضّل مكالمة تجريبية موجّهة",
  paymentsNote: "تُعالَج المدفوعات بأمان عبر {paystack}. لا نرى بيانات بطاقتك كاملة ولا نخزّنها أبدًا.",
  learnDashboard: "لوحة Learn",
  startBaseline: "ابدأ التقييم المجاني",
  seatPackNote: "الدفع لباقات المقاعد باللغة الإنجليزية.",
  checkout: "الدفع",
  closeCheckout: "أغلق نافذة الدفع",
  startFreeInstead: "ابدأ مجانًا على هذا الجهاز بدلًا من ذلك (دون دفع)",
  form: {
    email: "البريد الإلكتروني (مطلوب للإيصال)",
    name: "الاسم (اختياري)",
    namePlaceholder: "اسمك",
    pay: "ادفع {price} · افتح {programme}",
    redirecting: "جارٍ التحويل إلى Paystack…",
    unavailable: "الدفع الإلكتروني غير متاح مؤقتًا. ما زال بإمكانك البدء مجانًا على هذا الجهاز، أو التواصل معنا لترتيب الوصول.",
    unavailableShort: "الدفع الإلكتروني غير متاح مؤقتًا. ابدأ مجانًا على هذا الجهاز أو تواصل معنا.",
    secure: "دفع آمن عبر Paystack · ‏{price} مرة واحدة · وصول مدى الحياة · دون اشتراك",
    invalidEmail: "أدخل بريدًا إلكترونيًا صالحًا لإيصال الدفع.",
    couldNotStart: "تعذّر بدء الدفع. حاول مرة أخرى.",
    network: "خطأ في الشبكة. تحقّق من اتصالك وحاول مرة أخرى.",
  },
};

const zu: Draft = {
  metaTitle: "Amanani: isisekelo samahhala, izinhlelo ze-R99 namaphakethe ezihlalo",
  metaDescription:
    "Qala mahhala, bese uvula uhlelo oluphelele lwe-Super-Cube® lwezingane, intsha noma abadala ngenkokhelo eyodwa ye-R99 yokufinyelela impilo yonke. Amaphakethe ezihlalo ezikole nezinkampani. Akukho ukubhalisa kwanyanga zonke.",
  eyebrow: "Amanani",
  title: "Qala mahhala. Vula yonke indlela kanye.",
  description:
    "Izingane (5–12), Intsha (13–21) kanye Nabadala (22+). Isisekelo samahhala kule divayisi, bese ukhokha kanye nge-Paystack (R{zar} / {usd} USD) ukuze ufinyelele impilo yonke. Akukho ukubhalisa kwanyanga zonke.",
  alreadyPaid: "Usuvele unokufinyelela okukhokhelwe kule divayisi.",
  openLearn: "Vula i-Learn",
  termsLabel: "Imigomo elula",
  termFree: "Isisekelo samahhala",
  termFreeRest: "— ukuqondiswa nokulinganiswa kwezinhlangothi eziyisithupha ngaphandle kokukhokha.",
  termOnce: "R{zar} kanye (≈ {usd} USD)",
  termOnceRest: "— ukufinyelela impilo yonke ohlelweni oluphelele, embikweni nasesitifiketini nge-Paystack.",
  termNoFee: "Ayikho imali yanyanga zonke",
  termNoFeeRest: "— inkokhelo eyodwa ohlelweni ngalunye kule ndlela.",
  launchLabel: "Intengo yokwethula · inkokhelo eyodwa · Paystack",
  orUsd: "noma {usd} USD",
  programmes: {
    kids: {
      name: "I-Super-Cube® Yezingane",
      ageLabel: "Iminyaka 5–12",
      tagline: "Ukukhulisa isimilo, ilukuluku nomusa.",
      description:
        "Uhambo lwe-Super-Cube® oluqondisiwe lwabafundi abancane: ulimi olulula, izindaba, ukuzilolonga ngokudlala, nokwesekwa ngabazali nothisha. Lwakha izinhlangothi eziyisithupha zobuholi njengamandla ansuku zonke.",
    },
    adolescents: {
      name: "I-Super-Cube® Yentsha",
      ageLabel: "Iminyaka 13–21",
      tagline: "Ubuwena, umthelela nezinqumo ezihlakaniphile.",
      description:
        "Kwentsha nabantu abadala abasebasha abaphila phakathi kwesikole, ezemidlalo, imisebenzi yokuqala nempilo yedijithali. Kuthuthukisa izinketho, izimiso, umqondo, imizwa, umzimba nenhloso, ngezimo zangempela.",
    },
    adults: {
      name: "I-Super-Cube® Yabadala",
      ageLabel: "Iminyaka 22+",
      tagline: "Ubuholi obugxile kubantu emsebenzini nasempilweni.",
      description:
        "Indlela ephelele yobungcweti ye-Super-Cube®: ukuhlolwa kokuqala, izifundo eziyisithupha, ukuzilolonga ngenhloso, ukuhlolwa kokugcina, kanye nombiko wokuzithuthukisa wabaholi basemsebenzini.",
    },
  },
  lifetimeAccess: "ukufinyelela impilo yonke",
  features: [
    "Ukufinyelela impilo yonke",
    "Isisekelo sokuhlolwa kokuqala",
    "Izifundo eziyisi-6 (ezivumelaniswe neminyaka)",
    "Amalebhu okuzilolonga nokuhlola",
    "Ukuhlolwa kokugcina nombiko womuntu siqu",
  ],
  buy: "Thenga nge-Paystack · R{zar}",
  startFree: "Qala mahhala kule divayisi (ngaphandle kokukhokha)",
  pilotLabel: "Izikole · izinkampani · amaqembu · Isigaba 2",
  pilotTitle: "Amaphakethe ezihlalo: khokha kanye, uthole ikhodi yeqembu",
  pilotBody:
    "Thenga izihlalo zabafundi eziyi-10, 20 noma 50. Isihlalo ngasinye siwukufinyelela kwempilo yonke ohlelweni kulowo mfundi. Sakha ikhodi yeqembu ngemuva kokukhokha. Abafundi bajoyina ku-Learn → Org. Abaqeqeshi babona amaphuzu nokuqedwa kuphela uma abafundi bevuma, hhayi umbhalo wejenali.",
  tip: "Iseluleko: {signin} nge-imeyili efanayo ngaphambi kokukhokha ukuze amalungelo okuphatha axhunywe ne-akhawunti yakho. Bese uvula i-Learn → Amathuluzi omqeqeshi.",
  tipSignin: "bhalisa noma ungene",
  coachTools: "Amathuluzi omqeqeshi",
  facilitatorKit: "Ikhithi yomgqugquzeli",
  createCoach: "Vula i-akhawunti yomqeqeshi",
  pilotCall: "Ukhetha ucingo lwe-pilot oluqondisiwe",
  paymentsNote: "Izinkokhelo zicutshungulwa ngokuphephile yi-{paystack}. Asiyiboni futhi asiyigcini imininingwane ephelele yekhadi lakho.",
  learnDashboard: "Ideshibhodi ye-Learn",
  startBaseline: "Qala isisekelo samahhala",
  seatPackNote: "Ukukhokhela amaphakethe ezihlalo kungesiNgisi.",
  checkout: "Ukukhokha",
  closeCheckout: "Vala ukukhokha",
  startFreeInstead: "Kunalokho qala mahhala kule divayisi (ngaphandle kokukhokha)",
  form: {
    email: "I-imeyili (iyadingeka ukuze uthole irisidi)",
    name: "Igama (akuphoqelekile)",
    namePlaceholder: "Igama lakho",
    pay: "Khokha {price} · vula {programme}",
    redirecting: "Iyakuthumela ku-Paystack…",
    unavailable:
      "Ukukhokha ku-inthanethi akutholakali okwesikhashana. Usengaqala mahhala kule divayisi, noma uxhumane nathi ukuze sihlele ukufinyelela.",
    unavailableShort: "Ukukhokha ku-inthanethi akutholakali okwesikhashana. Qala mahhala kule divayisi noma uxhumane nathi.",
    secure: "Ukukhokha okuphephile nge-Paystack · {price} kanye · ukufinyelela impilo yonke · akukho ukubhalisa",
    invalidEmail: "Faka i-imeyili evumelekile yerisidi yakho yokukhokha.",
    couldNotStart: "Ukukhokha akukwazanga ukuqala. Zama futhi.",
    network: "Iphutha lenethiwekhi. Hlola uxhumano lwakho bese uzama futhi.",
  },
};

const af: Draft = {
  metaTitle: "Pryse: gratis basislyn, R99-programme en plekpakkette",
  metaDescription:
    "Begin gratis en ontsluit dan ’n volledige Super-Cube®-program vir kinders, tieners of volwassenes met een betaling van R99 vir lewenslange toegang. Plekpakkette vir skole en maatskappye. Geen intekening nie.",
  eyebrow: "Pryse",
  title: "Begin gratis. Ontsluit die volle pad een keer.",
  description:
    "Kinders (5–12), tieners (13–21) en volwassenes (22+). Gratis basislyn op hierdie toestel, betaal dan een keer met Paystack (R{zar} / ${usd} USD) vir lewenslange toegang. Geen intekening nie.",
  alreadyPaid: "Jy het reeds betaalde toegang op hierdie toestel.",
  openLearn: "Maak Learn oop",
  termsLabel: "Eenvoudige voorwaardes",
  termFree: "Gratis basislyn",
  termFreeRest: "— oriëntering en meting oor ses vlakke sonder om te betaal.",
  termOnce: "R{zar} een keer (≈ ${usd} USD)",
  termOnceRest: "— lewenslange toegang tot die volledige program, verslag en sertifikaat via Paystack.",
  termNoFee: "Geen maandelikse fooi nie",
  termNoFeeRest: "— een betaling per program op hierdie pad.",
  launchLabel: "Bekendstellingsprys · eenmalig · Paystack",
  orUsd: "of ${usd} USD",
  programmes: {
    kids: {
      name: "Super-Cube® Kinders",
      ageLabel: "Ouderdom 5–12",
      tagline: "Bou karakter, nuuskierigheid en vriendelikheid.",
      description:
        "’n Begeleide Super-Cube®-reis vir jonger leerders: eenvoudige taal, stories, speelgebaseerde oefening en ondersteuning vir ouers en onderwysers. Bou die ses vlakke van leierskap as alledaagse sterkpunte.",
    },
    adolescents: {
      name: "Super-Cube® Tieners",
      ageLabel: "Ouderdom 13–21",
      tagline: "Identiteit, invloed en wyse besluite.",
      description:
        "Vir tieners en jong volwassenes wat skool, sport, eerste werk en die digitale lewe navigeer. Ontwikkel keuses, beginsels, ingesteldheid, emosies, liggaam en doel, met werklike scenario’s.",
    },
    adults: {
      name: "Super-Cube® Volwassenes",
      ageLabel: "Ouderdom 22+",
      tagline: "Mensgesentreerde leierskap vir werk en lewe.",
      description:
        "Die volledige professionele Super-Cube®-pad: voor-assessering, ses temakursusse, doelbewuste oefening, ná-assessering en ’n persoonlike ontwikkelingsverslag vir leiers in die werkplek.",
    },
  },
  lifetimeAccess: "lewenslange toegang",
  features: [
    "Lewenslange toegang",
    "Voor-assessering as basislyn",
    "6 temakursusse (ouderdomsgepas)",
    "Oefenlaboratoriums en kontroles",
    "Ná-assessering en persoonlike verslag",
  ],
  buy: "Koop met Paystack · R{zar}",
  startFree: "Begin gratis op hierdie toestel (geen betaling)",
  pilotLabel: "Skole · maatskappye · groepe · Fase 2",
  pilotTitle: "Plekpakkette: betaal een keer, kry ’n groepkode",
  pilotBody:
    "Koop 10, 20 of 50 leerderplekke. Elke plek is lewenslange toegang tot die program vir daardie leerder. Ons skep ná betaling ’n groepkode. Leerders sluit aan onder Learn → Org. Afrigters sien tellings en voltooiing net as leerders instem, nooit joernaalteks nie.",
  tip: "Wenk: {signin} met dieselfde e-pos voordat jy betaal sodat administrateursregte aan jou rekening gekoppel word. Maak dan Learn → Afrigtergereedskap oop.",
  tipSignin: "registreer of meld aan",
  coachTools: "Afrigtergereedskap",
  facilitatorKit: "Fasiliteerderstel",
  createCoach: "Skep ’n afrigterrekening",
  pilotCall: "Verkies ’n begeleide loodsoproep",
  paymentsNote: "Betalings word veilig deur {paystack} verwerk. Ons sien of berg nooit jou volledige kaartbesonderhede nie.",
  learnDashboard: "Learn-paneelbord",
  startBaseline: "Begin gratis basislyn",
  seatPackNote: "Die plekpakket-betaling is in Engels.",
  checkout: "Betaal",
  closeCheckout: "Maak betaling toe",
  startFreeInstead: "Begin eerder gratis op hierdie toestel (geen betaling)",
  form: {
    email: "E-pos (nodig vir kwitansie)",
    name: "Naam (opsioneel)",
    namePlaceholder: "Jou naam",
    pay: "Betaal {price} · ontsluit {programme}",
    redirecting: "Stuur jou na Paystack…",
    unavailable:
      "Aanlyn betaling is tydelik onbeskikbaar. Jy kan steeds gratis op hierdie toestel begin, of ons kontak om toegang te reël.",
    unavailableShort: "Aanlyn betaling is tydelik onbeskikbaar. Begin gratis op hierdie toestel of kontak ons.",
    secure: "Veilige betaling via Paystack · {price} eenmalig · lewenslange toegang · geen intekening",
    invalidEmail: "Voer ’n geldige e-posadres vir jou betalingskwitansie in.",
    couldNotStart: "Betaling kon nie begin nie. Probeer weer.",
    network: "Netwerkfout. Gaan jou verbinding na en probeer weer.",
  },
};

const DRAFTS: Partial<Record<Locale, Draft>> = { fr, pt, sw, ar, zu, af };

/** This language's pricing copy, English per string where a translation is missing. */
export function pricingStrings(locale: Locale): PricingStrings {
  const d = DRAFTS[locale];
  if (!d) return en;
  const programmes = { ...en.programmes };
  for (const id of Object.keys(programmes) as ProgrammeId[]) {
    programmes[id] = { ...en.programmes[id], ...d.programmes?.[id] };
  }
  return { ...en, ...d, programmes, form: { ...en.form, ...d.form } } as PricingStrings;
}
