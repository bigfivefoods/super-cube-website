/**
 * Super-Cube® UI translations.
 * Default locale: English (en). Also: isiZulu (zu), Afrikaans (af).
 * Preference stored in localStorage key `sc_locale`.
 */

export type Locale = "en" | "zu" | "af";

export const LOCALES: Locale[] = ["en", "zu", "af"];

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  zu: "isiZulu",
  af: "Afrikaans",
};

export const LOCALE_SHORT: Record<Locale, string> = {
  en: "EN",
  zu: "ZU",
  af: "AF",
};

const STORAGE_KEY = "sc_locale";

const en = {
  // Language UI
  "lang.label": "Language",
  "lang.en": "English",
  "lang.zu": "isiZulu",
  "lang.af": "Afrikaans",

  // Theme
  "theme.light": "Light",
  "theme.dark": "Dark",
  "theme.system": "System",
  "theme.toggle": "Theme",

  // Primary nav
  "nav.model": "The model",
  "nav.sixFaces": "Six faces",
  "nav.programmes": "Programmes",
  "nav.learn": "Learn",
  "nav.pricing": "Pricing",
  "nav.explore": "Explore",
  "nav.more": "Explore",
  "nav.contact": "Contact",
  "nav.startFree": "Start free",
  "nav.startFreeBaseline": "Start free baseline",
  "nav.signIn": "Sign in",
  "nav.main": "Main",
  "nav.menu": "Menu",
  "nav.close": "Close menu",
  "nav.open": "Open menu",
  "nav.faq": "FAQ",

  // Explore menu groups
  "nav.group.explore": "Explore",
  "nav.group.understand": "Understand",
  "nav.group.practice": "Practice",
  "nav.group.orgs": "Organisations",
  "nav.group.story": "Understand",
  "nav.group.proof": "Practice",
  "nav.group.connect": "Connect",
  "nav.why": "Why leadership",
  "nav.how": "How it works",
  "nav.research": "Research",
  "nav.about": "About",
  "nav.sampleReport": "Sample report",
  "nav.impact": "Impact",
  "nav.practices": "Practices",
  "nav.insights": "Insights",
  "nav.pilotPack": "Pilot pack",
  "nav.facilitator": "Facilitator kit",
  "nav.team": "Team cube",
  "nav.certify": "Certification",
  "nav.community": "Community",
  "nav.media": "Media kit",

  // Footer
  "footer.product": "Product",
  "footer.understand": "Understand",
  "footer.practice": "Practice",
  "footer.proof": "Practice",
  "footer.orgs": "Organisations",
  "footer.company": "Company",
  "footer.sixFaces": "Six faces",
  "footer.allConstructs": "All constructs →",
  "footer.tagline":
    "Human-centric leadership, developed from the core outward.",
  "footer.credit": "Craig Ross Muller · UKZN · 2020",
  "footer.startFree": "Start free",
  "footer.contact": "Contact",
  "footer.privacy": "Privacy",
  "footer.terms": "Terms",
  "footer.journals": "Journals private · consent for coach share",
  "footer.copyright": "Super-Cube® Leadership Model",

  // CTAs & common
  "cta.tryFree": "Start free baseline",
  "cta.bookPilot": "Book a pilot",
  "cta.exploreModel": "Explore the model",
  "cta.seeProgrammes": "View programmes",
  "cta.sampleReport": "See sample report",
  "cta.continue": "Continue",
  "cta.learnMore": "Learn more",

  // Learn
  "learn.continue": "Continue",
  "learn.baseline": "Baseline",
  "learn.weeklyPlan": "This week’s plan",
  "learn.microPractice": "Today’s micro-practice",
  "learn.shareCoach": "Share progress with my cohort coach",
  "learn.midCheck": "Mid-pathway check-in",
  "learn.doneToday": "Done for today",
  "learn.doneTodayShort": "Done today",
  "learn.peerPulse": "Peer / manager pulse",
  "learn.language": "Language",
  "learn.nextSession": "Next session",
  "learn.continueSession": "Continue session",
  "learn.remindersOn": "Reminders on",
  "learn.remindersEnable": "Enable practice reminders",
  "learn.reminderTitle": "Super-Cube® practice",
  "learn.reminderBody":
    "3–5 minutes on your weakest face keeps the streak alive. Open Learn → Practice.",
  "learn.reminderBodyDone":
    "Nice work if you practiced today. Open Learn anytime to continue your pathway.",

  // Faces
  "face.choices": "Choices",
  "face.principles": "Principles",
  "face.mental": "Mental",
  "face.emotional": "Emotional",
  "face.physical": "Physical",
  "face.spiritual": "Spiritual",
  "face.jump": "Faces",

  // Home hero + proof
  "home.eyebrow": "Measured leadership growth",
  "home.title": "Grow leadership you can measure—",
  "home.titleLine2": "across six faces, in weeks not slogans.",
  "home.lede":
    "Orient in minutes. Set a six-face baseline. Practice deliberately. Re-measure. Download a growth report and certificate with a public verify ID—built from doctoral research in African business networks.",
  "home.ctaBaseline": "Start free baseline · 10 min",
  "home.ctaSample": "See sample report",
  "home.whatChanges":
    "What changes: clarity on weak faces · weekly practice plan · pre→post evidence for you, coach, or school",
  "home.proof1": "UKZN doctoral research · 2020",
  "home.proof2": "Pre → post growth measured",
  "home.proof3": "Sample report + verify certificates",
  "home.proof4": "Private journals · consented coach share",
  "home.cubeEyebrow": "The Super-Cube®",
  "home.cubeTitle": "Whole-person leadership—not one fad skill.",
  "home.cubeDesc":
    "Six developable faces with you at the centre. After your baseline, the cube lights by your scores so growth priorities are visible.",
  "home.cubeBody":
    "Rotate the model. Each face is a domain you can practise—choices, principles, mind, emotion, body, and purpose—so growth priorities stay visible, not abstract.",
  "home.programmesEyebrow": "Who the programme is for",
  "home.programmesTitle": "Kids · Adolescents · Adults.",
  "home.programmesDesc":
    "One model across the lifespan. Choose the pathway for this season—the six faces stay with you as your world gets larger.",
  "home.programmesCta": "Explore programmes",
  "home.ptmEyebrow": "Philosophy · Theory · Model",
  "home.ptmTitle": "From human relation to a practiceable cube.",
  "home.ptmDesc":
    "Super-Cube® sits on clear philosophy, development theory, and a six-face model you can measure and train.",
  "home.philosophyTitle": "Philosophy",
  "home.philosophyBody":
    "Grounded in Buber’s I–Thou, the African philosophy of Ubuntu, and Wilber’s AQAL integral frame—people as subjects-in-relation, never objects of control.",
  "home.theoryTitle": "Theory",
  "home.theoryBody":
    "Illeris’s three-dimensional learning (content, incentive, interaction) plus major leadership literature strands. Roughly 70–76% of leadership capacity is developable through deliberate practice.",
  "home.modelTitle": "Model",
  "home.modelBody":
    "Super-Cube® makes that philosophy and theory practiceable: you at the centre, six interdependent faces, pre→post measurement, and deliberate growth.",
  "home.coreBeliefEyebrow": "Core belief",
  "home.coreBelief": "Leadership is largely learnable.",
  "home.coreBeliefBody":
    "Super-Cube® holds that roughly 70–76% of leadership capacity is developable through deliberate practice, experience, and structured intervention—not fixed by heredity alone. Development follows Illeris’s content, incentive, and interaction.",
  "home.theoryMapLabel": "Theory map (summary)",
  "home.ptmTheoryMap": "Open full literature map",
  "home.ptmHow": "How development works",
  "home.facesEyebrow": "Six constructs",
  "home.facesTitle": "Develop leadership across every face of the cube.",
  "home.facesDesc":
    "Each construct is a developable set of capabilities—validated in practice and designed for deliberate growth.",
  "home.benefitsEyebrow": "Why Super-Cube®",
  "home.benefitsTitle": "Benefits of the model.",
  "home.benefitsDesc":
    "Three design strengths: holistic across the whole person; longitudinal across a whole life; multi-level from one person to wider systems.",
  "home.benefit.holistic": "Holistic",
  "home.benefit.holisticTag": "The whole leader—not a single skill.",
  "home.benefit.holisticBody":
    "Six interdependent faces so growth in one domain strengthens the others. You stand at the centre: agency first, then impact outward.",
  "home.benefit.longitudinal": "Longitudinal",
  "home.benefit.longitudinalTag": "One model for a whole life.",
  "home.benefit.longitudinalBody":
    "From Kids to Adolescents to Adults, the architecture stays continuous. Language deepens with age; context expands from family to work and society.",
  "home.benefit.multilevel": "Multi-level",
  "home.benefit.multilevelTag": "From one person to whole systems.",
  "home.benefit.multilevelBody":
    "Capacity begins with the individual and can extend through organisations, networks, and industries—leadership development as infrastructure.",
  "home.benefitsCta": "Explore programmes & benefits",
  "home.trustFooter":
    "Validated at the University of KwaZulu-Natal · Peer-reviewed in SAJEMS · Pre→post certificates with public verify IDs",
  // Legacy buyer keys (kept for type stability / other surfaces)
  "home.buyersEyebrow": "Who it’s for",
  "home.buyersTitle": "One model. Clear paths for every buyer.",
  "home.buyersDesc":
    "Individuals, schools, companies, and coaches share the same cube—with the right onboarding and proof for each.",
  "home.buyer.individual": "Individual",
  "home.buyer.individualDesc":
    "Free baseline → deliberate practice → growth report & certificate.",
  "home.buyer.individualCta": "Start free",
  "home.buyer.school": "School",
  "home.buyer.schoolDesc":
    "Cohort code, facilitator calendar, consented roster & CSV export.",
  "home.buyer.schoolCta": "Facilitator kit",
  "home.buyer.corp": "Corporate L&D",
  "home.buyer.corpDesc":
    "Impact proof, pilot pricing, sample report, book a walkthrough.",
  "home.buyer.corpCta": "See impact",
  "home.buyer.coach": "Coach / partner",
  "home.buyer.coachDesc":
    "Share links, verify IDs, community clinic, certification ladder.",
  "home.buyer.coachCta": "Certification",

  // Constructs page hero
  "constructs.eyebrow": "The six faces",
  "constructs.title": "Human-centric constructs. Developable skills.",
  "constructs.description":
    "Each face of the Super-Cube® is a full domain of leadership practice—grounded in theory, validated in research, and built for deliberate growth. Scroll each face: full-bleed image, then a clear overview.",
  "constructs.ctaBaseline": "Start free baseline",
  "constructs.ctaModel": "How the model works",
  "constructs.faceOf": "Face {n} of 06",

  // FAQ
  "faq.eyebrow": "Help",
  "faq.title": "Frequently asked questions",
  "faq.lede":
    "Clear answers for learners, schools, and companies. Still stuck? Contact us.",
  "faq.ctaContact": "Contact",
  "faq.ctaStart": "Start free baseline",
  "faq.q1": "What is Super-Cube®?",
  "faq.a1":
    "A human-centric leadership model with six developable faces (Choices, Principles, Mental, Emotional, Physical, Spiritual). You measure a baseline, practice deliberately, re-measure, and can download a growth report and certificate.",
  "faq.q2": "Is the free baseline really free?",
  "faq.a2":
    "Yes. Orientation and the six-face baseline assessment are free. Paid programmes unlock full courses, mid check-in tools, and the post growth pathway depending on your plan.",
  "faq.q3": "How long does the baseline take?",
  "faq.a3":
    "About 10 minutes for the free guided start and baseline. Full pathway length depends on programme (e.g. multi-week school or corporate cohorts).",
  "faq.q4": "Are my journals private?",
  "faq.a4":
    "Yes. Reflections and journal text stay on your device by default. If you join a cohort and opt in, coaches only see scores and completion—not journal text.",
  "faq.q5": "What languages are supported?",
  "faq.a5":
    "The site chrome and key marketing copy support English (default), isiZulu, and Afrikaans via the language switcher. Course lessons and assessments remain English until full content tracks are published.",
  "faq.q6": "Can schools and companies run a pilot?",
  "faq.a6":
    "Yes. Use the pilot pack for pricing, 8-week calendar, consent notes, and coach tools. Create a cohort code, invite learners, and export roster progress when SQL orgs are enabled.",
  "faq.q7": "Is Super-Cube® research-based?",
  "faq.a7":
    "Yes. The model draws on doctoral research (UKZN, 2020) in African business networks and synthesises major leadership schools with Ubuntu, I–Thou, and integral frames.",
  "faq.q8": "How do certificates work?",
  "faq.a8":
    "After post assessment, you can earn a certificate with a public verify ID. Anyone can check authenticity on the verify page without seeing private journals.",
} as const;

export type I18nKey = keyof typeof en;

const zu: Record<I18nKey, string> = {
  "lang.label": "Ulimi",
  "lang.en": "English",
  "lang.zu": "isiZulu",
  "lang.af": "isiBhunu",

  "theme.light": "Okukhanyayo",
  "theme.dark": "Okumnyama",
  "theme.system": "Isistimu",
  "theme.toggle": "Itimu",

  "nav.model": "Imodeli",
  "nav.sixFaces": "Ubuso obuyisithupha",
  "nav.programmes": "Izinhlelo",
  "nav.learn": "Funda",
  "nav.pricing": "Amanani",
  "nav.explore": "Hlola",
  "nav.more": "Hlola",
  "nav.contact": "Xhumana",
  "nav.startFree": "Qala mahhala",
  "nav.startFreeBaseline": "Qala isisekelo samahhala",
  "nav.signIn": "Ngena ngemvume",
  "nav.main": "Okuyinhloko",
  "nav.menu": "Imenyu",
  "nav.close": "Vala imenyu",
  "nav.open": "Vula imenyu",
  "nav.faq": "Imibuzo",

  "nav.group.explore": "Hlola",
  "nav.group.understand": "Qonda",
  "nav.group.practice": "Zilolonge",
  "nav.group.orgs": "Izinhlangano",
  "nav.group.story": "Qonda",
  "nav.group.proof": "Zilolonge",
  "nav.group.connect": "Xhumana",
  "nav.why": "Kungani ubuholi",
  "nav.how": "Kusebenza kanjani",
  "nav.research": "Ucwaningo",
  "nav.about": "Mayelana",
  "nav.sampleReport": "Umbiko wesampula",
  "nav.impact": "Umthelela",
  "nav.practices": "Imikhuba",
  "nav.insights": "Ukuqonda",
  "nav.pilotPack": "Iphakethe le-pilot",
  "nav.facilitator": "Ikhithi yomqeqeshi",
  "nav.team": "Ikhyubhu yethimba",
  "nav.certify": "Isitifiketi",
  "nav.community": "Umphakathi",
  "nav.media": "Ikhithi yezindaba",

  "footer.product": "Umkhiqizo",
  "footer.understand": "Qonda",
  "footer.practice": "Zilolonge",
  "footer.proof": "Zilolonge",
  "footer.orgs": "Izinhlangano",
  "footer.company": "Inkampani",
  "footer.sixFaces": "Ubuso obuyisithupha",
  "footer.allConstructs": "Zonke izakhi →",
  "footer.tagline":
    "Ubuholi obugxile kumuntu, bukhuliswa kusukela phakathi kuya ngaphandle.",
  "footer.credit": "Craig Ross Muller · UKZN · 2020",
  "footer.startFree": "Qala mahhala",
  "footer.contact": "Xhumana",
  "footer.privacy": "Ubumfihlo",
  "footer.terms": "Imigomo",
  "footer.journals": "Amadayari ayimfihlo · imvume yokwabelana nomqeqeshi",
  "footer.copyright": "Imodeli yobuholi ye-Super-Cube®",

  "cta.tryFree": "Qala isisekelo samahhala",
  "cta.bookPilot": "Bhuka i-pilot",
  "cta.exploreModel": "Hlola imodeli",
  "cta.seeProgrammes": "Buka izinhlelo",
  "cta.sampleReport": "Buka umbiko wesampula",
  "cta.continue": "Qhubeka",
  "cta.learnMore": "Funda kabanzi",

  "learn.continue": "Qhubeka",
  "learn.baseline": "Isisekelo",
  "learn.weeklyPlan": "Uhlelo lwaleli viki",
  "learn.microPractice": "Umsebenzi omncane wanamuhla",
  "learn.shareCoach": "Yabelana ngentuthuko nomqeqeshi weqembu lami",
  "learn.midCheck": "Ukuhlola maphakathi nendlela",
  "learn.doneToday": "Kuqediwe namuhla",
  "learn.doneTodayShort": "Kuqedile",
  "learn.peerPulse": "Ukuhlola kontanga / umphathi",
  "learn.language": "Ulimi",
  "learn.nextSession": "Iseshini elandelayo",
  "learn.continueSession": "Qhubeka neseshini",
  "learn.remindersOn": "Izikhumbuzi zivuliwe",
  "learn.remindersEnable": "Vula izikhumbuzi zokuzilolonga",
  "learn.reminderTitle": "Ukuzilolonga kwe-Super-Cube®",
  "learn.reminderBody":
    "Imizuzu emi-3–5 ebusweni bakho obubuthaka igcina uchungechunge. Vula Funda → Ukuzilolonga.",
  "learn.reminderBodyDone":
    "Kuhle uma uziqeqeshile namuhla. Vula Funda noma nini ukuze uqhubeke.",

  "face.choices": "Izinketho",
  "face.principles": "Izimiso",
  "face.mental": "Ingqondo",
  "face.emotional": "Imizwa",
  "face.physical": "Umzimba",
  "face.spiritual": "Umoya",
  "face.jump": "Ubuso",

  "home.eyebrow": "Ukukhula kobuholi okukalwayo",
  "home.title": "Khulisa ubuholi ongabukala—",
  "home.titleLine2": "ezbusweni obuyisithupha, emavikini hhayi iziqubulo.",
  "home.lede":
    "Qala ngemizuzu. Setha isisekelo sobuso obuyisithupha. Zilolonge ngamabomu. Phinda ukale. Landa umbiko wokukhula nesitifiketi esine-ID yokuqinisekisa—esakhiwe ngocwaningo lweziqu zobudokotela kumanethiwekhi webhizinisi e-Afrika.",
  "home.ctaBaseline": "Qala isisekelo samahhala · imizuzu engu-10",
  "home.ctaSample": "Buka umbiko wesampula",
  "home.whatChanges":
    "Okushintshayo: ukucaca kwebuso obubuthaka · uhlelo lokuzilolonga lweviki · ubufakazi bangaphambi nangemva kuwe, umqeqeshi, noma isikole",
  "home.proof1": "Ucwaningo lweziqu e-UKZN · 2020",
  "home.proof2": "Ukukhula kungaphambi → nangemva kukalwa",
  "home.proof3": "Umbiko wesampula + izitifiketi zokuqinisekisa",
  "home.proof4": "Amadayari ayimfihlo · ukwabelana nomqeqeshi ngemvume",
  "home.cubeEyebrow": "I-Super-Cube®",
  "home.cubeTitle": "Ubuholi bomuntu wonke—hhayi ikhono elilodwa elidume.",
  "home.cubeDesc":
    "Ubuso obuyisithupha obungakhuliswa wena phakathi. Ngemva kwesisekelo, ikhyubhu ikhanya ngamanani akho ukuze izinto eziphambili zibonakale.",
  "home.cubeBody":
    "Jikelezisa imodeli. Ubuso ngabunye buyindawo ongayilolonga—izinketho, izimiso, ingqondo, imizwa, umzimba, nenjongo—ukuze izinto ezibalulekile zokukhula zibonakale.",
  "home.programmesEyebrow": "Iqondene nobani uhlelo",
  "home.programmesTitle": "Izingane · Intsha · Abadala.",
  "home.programmesDesc":
    "Imodeli eyodwa empilweni yonke. Khetha indlela yalesi sikhathi—ubuso obuyisithupha buhlala nawe njengoba umhlaba wakho ukhula.",
  "home.programmesCta": "Hlola izinhlelo",
  "home.ptmEyebrow": "Ifilosofi · Ithiyori · Imodeli",
  "home.ptmTitle":
    "Kusuka ebudlelwaneni bomuntu kuya ekhyubhini engasetshenziswa.",
  "home.ptmDesc":
    "I-Super-Cube® imi phezukwefilosofi ecacile, ithiyori yokuthuthuka, nemodeli yobuso obuyisithupha ongayikala futhi uyilolonge.",
  "home.philosophyTitle": "Ifilosofi",
  "home.philosophyBody":
    "Isuselwa ku-I–Thou ka-Buber, ifilosofi yase-Afrika ye-Ubuntu, nohlaka lwe-AQAL luka-Wilber—abantu njengezinto ezisebudlelwaneni, hhayi izinto zokulawula.",
  "home.theoryTitle": "Ithiyori",
  "home.theoryBody":
    "Ukufunda kwezinhlangothi ezintathu kuka-Illeris (okuqukethwe, isisusa, ukuxhumana) kanye nemikhakha emikhulu yobuholi. Cishe u-70–76% wamandla obuholi ungathuthukiswa ngokuzilolonga ngamabomu.",
  "home.modelTitle": "Imodeli",
  "home.modelBody":
    "I-Super-Cube® yenza leyo filosofi nethiyori isebenze: wena phakathi, ubuso obuyisithupha obuxhumene, ukukala kwangaphambi → nangemva, nokukhula ngamabomu.",
  "home.coreBeliefEyebrow": "Inkolelo eyinhloko",
  "home.coreBelief": "Ubuholi bungafundwa kakhulu.",
  "home.coreBeliefBody":
    "I-Super-Cube® ithi cishe u-70–76% wamandla obuholi ungathuthukiswa ngokuzilolonga ngamabomu, isipiliyoni, nokungenelela okuhleliwe—hhayi nje ifa lodwa. Ukuthuthuka kulandela okuqukethwe, isisusa, nokuxhumana kuka-Illeris.",
  "home.theoryMapLabel": "Imephu yethiyori (isifinyezo)",
  "home.ptmTheoryMap": "Vula imephu ephelele yezincwadi",
  "home.ptmHow": "Ukuthuthuka kusebenza kanjani",
  "home.facesEyebrow": "Izakhi eziyisithupha",
  "home.facesTitle": "Thuthukisa ubuholi ebusweni bonke bekhyubhu.",
  "home.facesDesc":
    "Isakhi ngasinye siyiqoqo lamakhono angakhuliswa—aqinisekiswe ekusebenzeni asungulelwe ukukhula okucabangiwe.",
  "home.benefitsEyebrow": "Kungani i-Super-Cube®",
  "home.benefitsTitle": "Izinzuzo zemodeli.",
  "home.benefitsDesc":
    "Amandla amathathu: aphelele kuwo wonke umuntu; aqhubekayo empilweni yonke; ahlukahlukene kusuka kumuntu oyedwa kuya ezinhlelweni ezibanzi.",
  "home.benefit.holistic": "Okuphelele",
  "home.benefit.holisticTag": "Umholi wonke—hhayi ikhono elilodwa.",
  "home.benefit.holisticBody":
    "Ubuso obuyisithupha obuxhumene ukuze ukukhula kwendawo eyodwa kuqinise ezinye. Uma phakathi: amandla kuqala, bese umthelela ngaphandle.",
  "home.benefit.longitudinal": "Okuqhubekayo",
  "home.benefit.longitudinalTag": "Imodeli eyodwa yempilo yonke.",
  "home.benefit.longitudinalBody":
    "Kusuka ezinganeni kuya entsheni nabadala, ukwakheka kuhlala kufana. Ulimi lujula ngeminyaka; umongo ukhula kusuka emndenini kuya emsebenzini nomphakathi.",
  "home.benefit.multilevel": "Amazinga amaningi",
  "home.benefit.multilevelTag": "Kusuka kumuntu oyedwa kuya ezinhlelweni.",
  "home.benefit.multilevelBody":
    "Amandla aqala kumuntu futhi angadlulela ezinhlanganweni, amanethiwekhi, nezimboni—ukuthuthukiswa kobuholi njengengqalasizinda.",
  "home.benefitsCta": "Hlola izinhlelo nezinzuzo",
  "home.trustFooter":
    "Kuqinisekisiwe eNyuvesi yaKwaZulu-Natal · Kuhlolwe ontanga e-SAJEMS · Izitifiketi zangaphambi→nangemva ezinama-ID okuqinisekisa omphakathi",
  "home.buyersEyebrow": "Iqondene nobani",
  "home.buyersTitle": "Imodeli eyodwa. Izindlela ezicacile kubathengi bonke.",
  "home.buyersDesc":
    "Abantu, izikole, izinkampani, nabaqeqeshi babelana ngekhyubhu efanayo—nokungena nobufakazi obufanele ngamunye.",
  "home.buyer.individual": "Umuntu",
  "home.buyer.individualDesc":
    "Isisekelo samahhala → ukuzilolonga → umbiko wokukhula nesitifiketi.",
  "home.buyer.individualCta": "Qala mahhala",
  "home.buyer.school": "Isikole",
  "home.buyer.schoolDesc":
    "Ikhodi yeqembu, ikhalenda yomqeqeshi, uhlu ngemvume nokukhipha i-CSV.",
  "home.buyer.schoolCta": "Ikhithi yomqeqeshi",
  "home.buyer.corp": "I-Corporate L&D",
  "home.buyer.corpDesc":
    "Ubufakazi bomthelela, amanani e-pilot, umbiko wesampula, bhuka inkulumo.",
  "home.buyer.corpCta": "Buka umthelela",
  "home.buyer.coach": "Umqeqeshi / umlingani",
  "home.buyer.coachDesc":
    "Izixhumanisi zokwabelana, ama-ID okuqinisekisa, umphakathi, isitifiketi.",
  "home.buyer.coachCta": "Isitifiketi",

  "constructs.eyebrow": "Ubuso obuyisithupha",
  "constructs.title": "Izakhi ezigxile kumuntu. Amakhono angakhuliswa.",
  "constructs.description":
    "Ubuso ngabunye be-Super-Cube® buyisizinda esigcwele sobuholi—busekelwe kwithiyori, buqinisekisiwe ocwaningweni, bakhelwe ukukhula. Skrola ubuso ngabunye: isithombe esigcwele, bese isithombe esifingqiwe.",
  "constructs.ctaBaseline": "Qala isisekelo samahhala",
  "constructs.ctaModel": "Imodeli isebenza kanjani",
  "constructs.faceOf": "Ubuso {n} kokungu-06",

  "faq.eyebrow": "Usizo",
  "faq.title": "Imibuzo evame ukubuzwa",
  "faq.lede":
    "Izimpendulo ezicacile zabafundi, izikole, nezinkampani. Usangene? Sixhumane.",
  "faq.ctaContact": "Xhumana",
  "faq.ctaStart": "Qala isisekelo samahhala",
  "faq.q1": "Yini i-Super-Cube®?",
  "faq.a1":
    "Imodeli yobuholi egxile kumuntu enobuso obuyisithupha obungakhuliswa (Izinketho, Izimiso, Ingqondo, Imizwa, Umzimba, Umoya). Ulinganisa isisekelo, uzilolonge ngamabomu, uphinde ukale, bese ulanda umbiko wokukhula nesitifiketi.",
  "faq.q2": "Ingabe isisekelo samahhala simahhala ngempela?",
  "faq.a2":
    "Yebo. Ukuziqhelisa nokuhlolwa kwesisekelo sobuso obuyisithupha kumahhala. Izinhlelo ezikhokhelwayo zivula izifundo ezigcwele, amathuluzi okuhlola maphakathi, nendlela yokukhula ngemuva kuye ngephulani lakho.",
  "faq.q3": "Kuthatha isikhathi esingakanani isisekelo?",
  "faq.a3":
    "Cishe imizuzu engu-10 yokuqala ngesisekelo. Ubude bendlela ephelele buncike ohlelweni (isb. amaqembu esikole noma enkampani amaviki amaningi).",
  "faq.q4": "Ingabe amadayari ami ayimfihlo?",
  "faq.a4":
    "Yebo. Ukucabanga nombhalo wedayari kuhlala kudivayisi yakho ngokuzenzakalelayo. Uma ujoyina iqembu futhi uvuma, abaqeqeshi babona kuphela amanani nokuqedwa—hhayi umbhalo wedayari.",
  "faq.q5": "Yiziphi izilimi ezisekelwayo?",
  "faq.a5":
    "I-chrome yesayithi nomqulu wokumaketha osekelayo uxhasa i-English (okuzenzakalelayo), isiZulu, nesiBhunu ngesishintshi solimi. Izifundo nokuhlola kusalokhu kuyisiNgisi kuze kushicilelwe imikhondo yokuqukethwe egcwele.",
  "faq.q6": "Ingabe izikole nezinkampani zingenza i-pilot?",
  "faq.a6":
    "Yebo. Sebenzisa iphakethe le-pilot lamanani, ikhalenda yamaviki angu-8, amanothi emvume, namathuluzi omqeqeshi. Dala ikhodi yeqembu, mema abafundi, ukhiphe inqubekela phambili uma ama-SQL orgs evuliwe.",
  "faq.q7": "Ingabe i-Super-Cube® isekelwe ocwaningweni?",
  "faq.a7":
    "Yebo. Imodeli isuselwa ocwaningweni lweziqu (UKZN, 2020) kumanethiwekhi webhizinisi e-Afrika futhi ihlanganisa izikole ezinkulu zobuholi ne-Ubuntu, I–Thou, nohlaka oluhlangene.",
  "faq.q8": "Izitifiketi zisebenza kanjani?",
  "faq.a8":
    "Ngemva kokuhlolwa kokuphela, ungathola isitifiketi esine-ID yokuqinisekisa esidlangalaleni. Noma ubani angahlola ubuqiniso ekhasini lokuqinisekisa ngaphandle kokubona amadayari ayimfihlo.",
};

const af: Record<I18nKey, string> = {
  "lang.label": "Taal",
  "lang.en": "English",
  "lang.zu": "isiZulu",
  "lang.af": "Afrikaans",

  "theme.light": "Lig",
  "theme.dark": "Donker",
  "theme.system": "Stelsel",
  "theme.toggle": "Tema",

  "nav.model": "Die model",
  "nav.sixFaces": "Ses vlakke",
  "nav.programmes": "Programme",
  "nav.learn": "Leer",
  "nav.pricing": "Pryse",
  "nav.explore": "Verken",
  "nav.more": "Verken",
  "nav.contact": "Kontak",
  "nav.startFree": "Begin gratis",
  "nav.startFreeBaseline": "Begin gratis basislyn",
  "nav.signIn": "Meld aan",
  "nav.main": "Hoof",
  "nav.menu": "Kieslys",
  "nav.close": "Maak kieslys toe",
  "nav.open": "Maak kieslys oop",
  "nav.faq": "Gereelde vrae",

  "nav.group.explore": "Verken",
  "nav.group.understand": "Verstaan",
  "nav.group.practice": "Oefening",
  "nav.group.orgs": "Organisasies",
  "nav.group.story": "Verstaan",
  "nav.group.proof": "Oefening",
  "nav.group.connect": "Skakel",
  "nav.why": "Hoekom leierskap",
  "nav.how": "Hoe dit werk",
  "nav.research": "Navorsing",
  "nav.about": "Oor ons",
  "nav.sampleReport": "Voorbeeldverslag",
  "nav.impact": "Impak",
  "nav.practices": "Praktyke",
  "nav.insights": "Insigte",
  "nav.pilotPack": "Looods-pakket",
  "nav.facilitator": "Fasiliteerder-kit",
  "nav.team": "Spankubus",
  "nav.certify": "Sertifisering",
  "nav.community": "Gemeenskap",
  "nav.media": "Media-kit",

  "footer.product": "Produk",
  "footer.understand": "Verstaan",
  "footer.practice": "Oefening",
  "footer.proof": "Oefening",
  "footer.orgs": "Organisasies",
  "footer.company": "Maatskappy",
  "footer.sixFaces": "Ses vlakke",
  "footer.allConstructs": "Alle konstrukte →",
  "footer.tagline":
    "Mensgesentreerde leierskap, ontwikkel van die kern na buite.",
  "footer.credit": "Craig Ross Muller · UKZN · 2020",
  "footer.startFree": "Begin gratis",
  "footer.contact": "Kontak",
  "footer.privacy": "Privaatheid",
  "footer.terms": "Bepalings",
  "footer.journals": "Joernale privaat · toestemming vir afrigter-deling",
  "footer.copyright": "Super-Cube® Leierskapmodel",

  "cta.tryFree": "Begin gratis basislyn",
  "cta.bookPilot": "Bespreek ’n loods",
  "cta.exploreModel": "Verken die model",
  "cta.seeProgrammes": "Sien programme",
  "cta.sampleReport": "Sien voorbeeldverslag",
  "cta.continue": "Gaan voort",
  "cta.learnMore": "Leer meer",

  "learn.continue": "Gaan voort",
  "learn.baseline": "Basislyn",
  "learn.weeklyPlan": "Hierdie week se plan",
  "learn.microPractice": "Vandag se mikro-oefening",
  "learn.shareCoach": "Deel vordering met my kohort-afrigter",
  "learn.midCheck": "Middelpad-kontrole",
  "learn.doneToday": "Klaar vir vandag",
  "learn.doneTodayShort": "Klaar",
  "learn.peerPulse": "Portuur- / bestuurder-pols",
  "learn.language": "Taal",
  "learn.nextSession": "Volgende sessie",
  "learn.continueSession": "Gaan voort met sessie",
  "learn.remindersOn": "Herinneringe aan",
  "learn.remindersEnable": "Skakel oefening-herinneringe aan",
  "learn.reminderTitle": "Super-Cube® oefening",
  "learn.reminderBody":
    "3–5 minute op jou swakste vlak hou die reeks aan die gang. Open Leer → Oefening.",
  "learn.reminderBodyDone":
    "Goed as jy vandag geoefen het. Open Leer enige tyd om voort te gaan.",

  "face.choices": "Keuses",
  "face.principles": "Beginsels",
  "face.mental": "Geestelik",
  "face.emotional": "Emosioneel",
  "face.physical": "Fisies",
  "face.spiritual": "Spiritueel",
  "face.jump": "Vlakke",

  "home.eyebrow": "Meetbare leierskapsgroei",
  "home.title": "Groei leierskap wat jy kan meet—",
  "home.titleLine2": "oor ses vlakke, in weke nie slagspreuke nie.",
  "home.lede":
    "Oriënteer in minute. Stel ’n ses-vlak basislyn. Oefen doelbewus. Meet weer. Laai ’n groei-verslag en sertifikaat met openbare verifieer-ID af—gebou uit doktorale navorsing in Afrika-besigheidsnetwerke.",
  "home.ctaBaseline": "Begin gratis basislyn · 10 min",
  "home.ctaSample": "Sien voorbeeldverslag",
  "home.whatChanges":
    "Wat verander: helderheid oor swak vlakke · weeklikse oefenplan · pre→post bewys vir jou, afrigter of skool",
  "home.proof1": "UKZN doktorale navorsing · 2020",
  "home.proof2": "Pre → post groei gemeet",
  "home.proof3": "Voorbeeldverslag + verifieer sertifikate",
  "home.proof4": "Private joernale · afrigter-deling met toestemming",
  "home.cubeEyebrow": "Die Super-Cube®",
  "home.cubeTitle": "Heelpersoon-leierskap—nie een modevaardigheid nie.",
  "home.cubeDesc":
    "Ses ontwikkelbare vlakke met jou in die middel. Ná jou basislyn lig die kubus volgens jou tellings sodat groeiprioriteite sigbaar is.",
  "home.cubeBody":
    "Draai die model. Elke vlak is ’n domein wat jy kan oefen—keuses, beginsels, verstand, emosie, liggaam en doel—sodat groeiprioriteite sigbaar bly.",
  "home.programmesEyebrow": "Vir wie die program is",
  "home.programmesTitle": "Kinders · Adolessente · Volwassenes.",
  "home.programmesDesc":
    "Een model oor ’n leeftyd. Kies die pad vir hierdie seisoen—die ses vlakke bly by jou soos jou wêreld groter word.",
  "home.programmesCta": "Verken programme",
  "home.ptmEyebrow": "Filosofie · Teorie · Model",
  "home.ptmTitle": "Van menslike verhouding tot ’n beoefenbare kubus.",
  "home.ptmDesc":
    "Super-Cube® rus op duidelike filosofie, ontwikkelingsteorie, en ’n ses-vlak model wat jy kan meet en oefen.",
  "home.philosophyTitle": "Filosofie",
  "home.philosophyBody":
    "Gegrond in Buber se I–Thou, die Afrika-filosofie van Ubuntu, en Wilber se AQAL-integrale raam—mense as subjekte-in-verhouding, nooit voorwerpe van beheer nie.",
  "home.theoryTitle": "Teorie",
  "home.theoryBody":
    "Illeris se driedimensionele leer (inhoud, dryfveer, interaksie) plus groot leierskap-literatuur. Ongeveer 70–76% van leierskapvermoë is ontwikkelbaar deur doelbewuste oefening.",
  "home.modelTitle": "Model",
  "home.modelBody":
    "Super-Cube® maak daardie filosofie en teorie beoefenbaar: jy in die middel, ses onderlinge vlakke, pre→post meting, en doelbewuste groei.",
  "home.coreBeliefEyebrow": "Kernooruiging",
  "home.coreBelief": "Leierskap is grootliks leerbaar.",
  "home.coreBeliefBody":
    "Super-Cube® hou dat ongeveer 70–76% van leierskapvermoë ontwikkelbaar is deur doelbewuste oefening, ervaring en gestruktureerde intervensie—nie net erflikheid nie. Ontwikkeling volg Illeris se inhoud, dryfveer en interaksie.",
  "home.theoryMapLabel": "Teoriekaart (opsomming)",
  "home.ptmTheoryMap": "Maak volle literatuurkaart oop",
  "home.ptmHow": "Hoe ontwikkeling werk",
  "home.facesEyebrow": "Ses konstrukte",
  "home.facesTitle": "Ontwikkel leierskap oor elke vlak van die kubus.",
  "home.facesDesc":
    "Elke konstruk is ’n ontwikkelbare stel vermoëns—bevestig in praktyk en ontwerp vir doelbewuste groei.",
  "home.benefitsEyebrow": "Hoekom Super-Cube®",
  "home.benefitsTitle": "Voordele van die model.",
  "home.benefitsDesc":
    "Drie ontwerpstertkes: holisties oor die hele persoon; longitudinaal oor ’n hele lewe; multi-vlak van een persoon tot wyer stelsels.",
  "home.benefit.holistic": "Holisties",
  "home.benefit.holisticTag": "Die hele leier—nie een vaardigheid nie.",
  "home.benefit.holisticBody":
    "Ses onderlinge vlakke sodat groei in een domein die ander versterk. Jy staan in die middel: agentskap eers, dan impak na buite.",
  "home.benefit.longitudinal": "Longitudinaal",
  "home.benefit.longitudinalTag": "Een model vir ’n hele lewe.",
  "home.benefit.longitudinalBody":
    "Van Kinders tot Adolessente tot Volwassenes bly die argitektuur deurlopend. Taal verdiep met ouderdom; konteks brei uit van gesin tot werk en samelewing.",
  "home.benefit.multilevel": "Multi-vlak",
  "home.benefit.multilevelTag": "Van een persoon tot hele stelsels.",
  "home.benefit.multilevelBody":
    "Kapasiteit begin by die individu en kan uitbrei deur organisasies, netwerke en nywerhede—leierskapsontwikkeling as infrastruktuur.",
  "home.benefitsCta": "Verken programme & voordele",
  "home.trustFooter":
    "Geldig by die Universiteit van KwaZulu-Natal · Portuurbeoordeel in SAJEMS · Pre→post sertifikate met openbare verifieer-IDs",
  "home.buyersEyebrow": "Vir wie dit is",
  "home.buyersTitle": "Een model. Duidelike paaie vir elke koper.",
  "home.buyersDesc":
    "Individue, skole, maatskappye en afrigters deel dieselfde kubus—met die regte onboarding en bewys vir elkeen.",
  "home.buyer.individual": "Individu",
  "home.buyer.individualDesc":
    "Gratis basislyn → doelbewuste oefening → groei-verslag & sertifikaat.",
  "home.buyer.individualCta": "Begin gratis",
  "home.buyer.school": "Skool",
  "home.buyer.schoolDesc":
    "Kohortkode, fasiliteerder-kalender, toestemmingsrooster & CSV-uitvoer.",
  "home.buyer.schoolCta": "Fasiliteerder-kit",
  "home.buyer.corp": "Korporatiewe L&D",
  "home.buyer.corpDesc":
    "Impakbewys, loods-pryse, voorbeeldverslag, bespreek ’n deurgang.",
  "home.buyer.corpCta": "Sien impak",
  "home.buyer.coach": "Afrigter / vennoot",
  "home.buyer.coachDesc":
    "Deel-skakels, verifieer-IDs, gemeenskapskliniek, sertifiseringsleer.",
  "home.buyer.coachCta": "Sertifisering",

  "constructs.eyebrow": "Die ses vlakke",
  "constructs.title": "Mensgesentreerde konstrukte. Ontwikkelbare vaardighede.",
  "constructs.description":
    "Elke vlak van die Super-Cube® is ’n volle domein van leierskapspraktyk—gegrond in teorie, bevestig in navorsing, en gebou vir doelbewuste groei. Rol deur elke vlak: volbeeld, dan ’n duidelike oorsig.",
  "constructs.ctaBaseline": "Begin gratis basislyn",
  "constructs.ctaModel": "Hoe die model werk",
  "constructs.faceOf": "Vlak {n} van 06",

  "faq.eyebrow": "Hulp",
  "faq.title": "Gereelde vrae",
  "faq.lede":
    "Duidelike antwoorde vir leerders, skole en maatskappye. Steeds vas? Kontak ons.",
  "faq.ctaContact": "Kontak",
  "faq.ctaStart": "Begin gratis basislyn",
  "faq.q1": "Wat is Super-Cube®?",
  "faq.a1":
    "’n Mensgesentreerde leierskapmodel met ses ontwikkelbare vlakke (Keuses, Beginsels, Geestelik, Emosioneel, Fisies, Spiritueel). Jy meet ’n basislyn, oefen doelbewus, meet weer, en kan ’n groei-verslag en sertifikaat aflaai.",
  "faq.q2": "Is die gratis basislyn regtig gratis?",
  "faq.a2":
    "Ja. Oriëntasie en die ses-vlak basislyn-assessering is gratis. Betaalde programme ontsluit volle kursusse, mid-kontrole-gereedskap en die post-groeipad afhangend van jou plan.",
  "faq.q3": "Hoe lank neem die basislyn?",
  "faq.a3":
    "Omtrent 10 minute vir die gratis geleide begin en basislyn. Volle padlengte hang van die program af (bv. multi-week skool- of korporatiewe kohorte).",
  "faq.q4": "Is my joernale privaat?",
  "faq.a4":
    "Ja. Refleksies en joernaalteks bly standaard op jou toestel. As jy by ’n kohort aansluit en instem, sien afrigters slegs tellings en voltooiing—nie joernaalteks nie.",
  "faq.q5": "Watter tale word ondersteun?",
  "faq.a5":
    "Die webwerf-chrome en sleutelbemarkingskopie ondersteun Engels (verstek), isiZulu en Afrikaans via die taalskakelaar. Kursuslesse en assesserings bly Engels tot volle inhoudspore gepubliseer word.",
  "faq.q6": "Kan skole en maatskappye ’n loods hardloop?",
  "faq.a6":
    "Ja. Gebruik die loods-pakket vir pryse, 8-week kalender, toestemmingsnotas en afrigter-gereedskap. Skep ’n kohortkode, nooi leerders, en voer rooster-vordering uit wanneer SQL-organisasies aangeskakel is.",
  "faq.q7": "Is Super-Cube® navorsingsgebaseer?",
  "faq.a7":
    "Ja. Die model steun op doktorale navorsing (UKZN, 2020) in Afrika-besigheidsnetwerke en sintetiseer groot leierskappe-skole met Ubuntu, I–Thou en integrale rame.",
  "faq.q8": "Hoe werk sertifikate?",
  "faq.a8":
    "Ná post-assessering kan jy ’n sertifikaat met ’n openbare verifieer-ID verdien. Enigiemand kan egtheid op die verifieer-bladsy nagaan sonder om private joernale te sien.",
};

const dictionaries: Record<Locale, Record<I18nKey, string>> = {
  en: en as Record<I18nKey, string>,
  zu,
  af,
};

export function isLocale(v: string | null | undefined): v is Locale {
  return v === "en" || v === "zu" || v === "af";
}

export function t(
  key: I18nKey,
  locale: Locale = "en",
  vars?: Record<string, string | number>,
): string {
  let s = dictionaries[locale]?.[key] ?? dictionaries.en[key] ?? key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      s = s.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
    }
  }
  return s;
}

export function getLocaleFromStorage(): Locale {
  if (typeof window === "undefined") return "en";
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    return isLocale(v) ? v : "en";
  } catch {
    return "en";
  }
}

export function setLocaleInStorage(locale: Locale) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, locale);
    document.documentElement.lang =
      locale === "en" ? "en" : locale === "zu" ? "zu" : "af";
  } catch {
    /* ignore */
  }
}

/** Map main nav href → translation key */
export const mainNavI18n: Record<string, I18nKey> = {
  "/the-model": "nav.model",
  "/constructs": "nav.sixFaces",
  "/what": "nav.programmes",
  "/how": "nav.how",
  "/pricing": "nav.pricing",
  "/learn/start": "nav.learn",
};

export const moreLinkI18n: Record<string, I18nKey> = {
  "/why": "nav.why",
  "/how": "nav.how",
  "/research": "nav.research",
  "/about": "nav.about",
  "/sample-report": "nav.sampleReport",
  "/impact": "nav.impact",
  "/practices": "nav.practices",
  "/insights": "nav.insights",
  "/pilot-pack": "nav.pilotPack",
  "/facilitator": "nav.facilitator",
  "/team": "nav.team",
  "/certify": "nav.certify",
  "/community": "nav.community",
  "/contact": "nav.contact",
  "/media": "nav.media",
  "/faq": "nav.faq",
  "/login": "nav.signIn",
  "/pricing#pilot": "cta.bookPilot",
};

export const moreGroupI18n: Record<string, I18nKey> = {
  Understand: "nav.group.understand",
  Practice: "nav.group.practice",
  Organisations: "nav.group.orgs",
  Explore: "nav.group.explore",
  // Legacy titles
  Story: "nav.group.story",
  "Proof & practice": "nav.group.proof",
  Connect: "nav.group.connect",
};

export const faceI18n: Record<string, I18nKey> = {
  choices: "face.choices",
  principles: "face.principles",
  mental: "face.mental",
  emotional: "face.emotional",
  physical: "face.physical",
  spiritual: "face.spiritual",
};

export const footerColI18n: Record<string, I18nKey> = {
  Product: "footer.product",
  Understand: "footer.understand",
  Practice: "footer.practice",
  Organisations: "footer.orgs",
  // Legacy titles
  Proof: "footer.proof",
  Company: "footer.company",
};
