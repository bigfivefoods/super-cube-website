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

  // Primary nav
  "nav.model": "Model",
  "nav.sixFaces": "Six faces",
  "nav.programmes": "Programmes",
  "nav.learn": "Learn",
  "nav.pricing": "Pricing",
  "nav.more": "More",
  "nav.contact": "Contact",
  "nav.startFree": "Start free",
  "nav.startFreeBaseline": "Start free baseline",
  "nav.signIn": "Sign in",
  "nav.main": "Main",
  "nav.menu": "Menu",
  "nav.close": "Close menu",
  "nav.open": "Open menu",
  "nav.faq": "FAQ",

  // More menu groups
  "nav.group.story": "Story",
  "nav.group.proof": "Proof & practice",
  "nav.group.orgs": "Organisations",
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
  "footer.proof": "Proof",
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
  "home.watchEyebrow": "Watch",
  "home.watchTitle": "Understand the model in minutes.",
  "home.watchDesc":
    "A short founder explainer builds trust before the free baseline. Add your YouTube/Vimeo embed via NEXT_PUBLIC_FOUNDER_VIDEO_URL.",
  "home.cubeEyebrow": "The Super-Cube®",
  "home.cubeTitle": "Whole-person leadership—not one fad skill.",
  "home.cubeDesc":
    "Six developable faces with you at the centre. After your baseline, the cube lights by your scores so growth priorities are visible.",
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
  "home.facesEyebrow": "Six constructs",
  "home.facesTitle": "Develop leadership across every face of the cube.",
  "home.facesDesc":
    "Each construct is a developable set of capabilities—validated in practice and designed for deliberate growth.",

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

  "nav.model": "Imodeli",
  "nav.sixFaces": "Ubuso obuyisithupha",
  "nav.programmes": "Izinhlelo",
  "nav.learn": "Funda",
  "nav.pricing": "Amanani",
  "nav.more": "Okuningi",
  "nav.contact": "Xhumana",
  "nav.startFree": "Qala mahhala",
  "nav.startFreeBaseline": "Qala isisekelo samahhala",
  "nav.signIn": "Ngena ngemvume",
  "nav.main": "Okuyinhloko",
  "nav.menu": "Imenyu",
  "nav.close": "Vala imenyu",
  "nav.open": "Vula imenyu",
  "nav.faq": "Imibuzo",

  "nav.group.story": "Indaba",
  "nav.group.proof": "Ubufakazi nokuzilolonga",
  "nav.group.orgs": "Izinhlangano",
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
  "footer.proof": "Ubufakazi",
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
  "footer.journals":
    "Amadayari ayimfihlo · imvume yokwabelana nomqeqeshi",
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
  "home.watchEyebrow": "Buka",
  "home.watchTitle": "Qonda imodeli ngemizuzu.",
  "home.watchDesc":
    "Incazelo emfushane yomsunguli yakha ukwethemba ngaphambi kwesisekelo samahhala. Faka i-YouTube/Vimeo nge-NEXT_PUBLIC_FOUNDER_VIDEO_URL.",
  "home.cubeEyebrow": "I-Super-Cube®",
  "home.cubeTitle": "Ubuholi bomuntu wonke—hhayi ikhono elilodwa elidume.",
  "home.cubeDesc":
    "Ubuso obuyisithupha obungakhuliswa wena phakathi. Ngemva kwesisekelo, ikhyubhu ikhanya ngamanani akho ukuze izinto eziphambili zibonakale.",
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
  "home.facesEyebrow": "Izakhi eziyisithupha",
  "home.facesTitle": "Thuthukisa ubuholi ebusweni bonke bekhyubhu.",
  "home.facesDesc":
    "Isakhi ngasinye siyiqoqo lamakhono angakhuliswa—aqinisekiswe ekusebenzeni asungulelwe ukukhula okucabangiwe.",

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

  "nav.model": "Model",
  "nav.sixFaces": "Ses vlakke",
  "nav.programmes": "Programme",
  "nav.learn": "Leer",
  "nav.pricing": "Pryse",
  "nav.more": "Meer",
  "nav.contact": "Kontak",
  "nav.startFree": "Begin gratis",
  "nav.startFreeBaseline": "Begin gratis basislyn",
  "nav.signIn": "Meld aan",
  "nav.main": "Hoof",
  "nav.menu": "Kieslys",
  "nav.close": "Maak kieslys toe",
  "nav.open": "Maak kieslys oop",
  "nav.faq": "Gereelde vrae",

  "nav.group.story": "Storie",
  "nav.group.proof": "Bewys & oefening",
  "nav.group.orgs": "Organisasies",
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
  "footer.proof": "Bewys",
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
  "footer.journals":
    "Joernale privaat · toestemming vir afrigter-deling",
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
  "home.watchEyebrow": "Kyk",
  "home.watchTitle": "Verstaan die model in minute.",
  "home.watchDesc":
    "’n Kort stigter-verduideliking bou vertroue voor die gratis basislyn. Voeg jou YouTube/Vimeo-inbed via NEXT_PUBLIC_FOUNDER_VIDEO_URL by.",
  "home.cubeEyebrow": "Die Super-Cube®",
  "home.cubeTitle": "Heelpersoon-leierskap—nie een modevaardigheid nie.",
  "home.cubeDesc":
    "Ses ontwikkelbare vlakke met jou in die middel. Ná jou basislyn lig die kubus volgens jou tellings sodat groeiprioriteite sigbaar is.",
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
  "home.facesEyebrow": "Ses konstrukte",
  "home.facesTitle": "Ontwikkel leierskap oor elke vlak van die kubus.",
  "home.facesDesc":
    "Elke konstruk is ’n ontwikkelbare stel vermoëns—bevestig in praktyk en ontwerp vir doelbewuste groei.",

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
  vars?: Record<string, string | number>
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
  "/learn/start": "nav.learn",
  "/pricing": "nav.pricing",
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
};

export const moreGroupI18n: Record<string, I18nKey> = {
  Story: "nav.group.story",
  "Proof & practice": "nav.group.proof",
  Organisations: "nav.group.orgs",
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
  Proof: "footer.proof",
  Organisations: "footer.orgs",
  Company: "footer.company",
};
