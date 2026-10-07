/**
 * ISIZULU: site chrome and FAQ. Brand names are never translated and keep their marks
 * (Super-Cube®, Big Five Group™, Big Five Learn, SupplierAdvisor®); isiZulu noun prefixes go
 * before them with a hyphen (i-Super-Cube®, ye-Big Five Group), as on bigfivegroup.africa.
 * Missing keys fall back to English.
 */
import type { Dict } from "./en";

const zu: Dict = {
  "lang.label": "Ulimi",

  "theme.light": "Okukhanyayo",
  "theme.dark": "Okumnyama",
  "theme.system": "Isistimu",
  "theme.toggle": "Itimu",

  "nav.model": "Imodeli",
  "nav.sixFaces": "Ubuso obuyisithupha",
  "nav.programmes": "Izinhlelo",
  "nav.learn": "Funda",
  "nav.pricing": "Amanani",
  "nav.contact": "Xhumana",
  "nav.startFreeBaseline": "Qala isisekelo samahhala",
  "nav.signIn": "Ngena",
  "nav.main": "Okuyinhloko",
  "nav.menu": "Imenyu",
  "nav.close": "Vala imenyu",
  "nav.open": "Vula imenyu",
  "nav.faq": "Imibuzo evamile",

  "nav.group.explore": "Hlola",
  "nav.group.understand": "Qonda",
  "nav.group.practice": "Zilolonge",
  "nav.group.orgs": "Izinhlangano",
  "nav.group.story": "Qonda",
  "nav.group.proof": "Zilolonge",
  "nav.group.connect": "Xhumana",
  "nav.why": "Kungani ubuholi",
  "nav.leadershipChallenges": "Izinselelo zobuholi",
  "nav.how": "Kusebenza kanjani",
  "nav.research": "Ucwaningo",
  "nav.about": "Mayelana",
  "nav.sampleReport": "Umbiko wesampula",
  "nav.impact": "Umthelela",
  "nav.practices": "Imikhuba",
  "nav.insights": "Ukuqonda",
  "nav.news": "Izindaba",
  "nav.pilotPack": "Iphakethe le-pilot",
  "nav.facilitator": "Ikhithi yomqeqeshi",
  "nav.team": "Ikhyubhu yethimba",
  "nav.certify": "Isitifiketi",
  "nav.community": "Umphakathi",
  "nav.media": "Ikhithi yezindaba",
  "nav.individuals": "Abantu ngabanye",
  "nav.organisations": "Izinhlangano",
  "nav.schools": "Izikole",
  "nav.speaking": "Izinkulumo",
  "nav.moreLinks": "Okunye kwe-Super-Cube®",

  "nav.theModel": "Imodeli",
  "model.menuTitle": "Imodeli ye-Super-Cube®",
  "model.menuBlurb": "Ubuso obuyisithupha obungathuthukiswa, wena usenkabeni.",
  "model.cubeAlt":
    "I-Super-Cube®: Izinketho phezulu, Izimiso phansi, kanye neNgqondo, Imizwa, Umzimba noMoya ezinhlangothini",
  "model.overview": "Isifinyezo semodeli",
  "model.sixFaces": "Ubuso obuyisithupha ngokujulile",
  "model.research": "Ucwaningo nobufakazi",
  "model.assessment": "Ukuhlolwa kwesisekelo kwamahhala",
  "model.facesHeading": "Ubuso obuyisithupha",
  "model.top": "Phezulu",
  "model.bottom": "Phansi",
  "model.side": "Eceleni",

  "bc.label": "Indlela",
  "bc.home": "Ikhaya",
  "bc.verify": "Ukuqinisekisa isitifiketi",
  "bc.unsubscribe": "Zikhiphe ohlwini",

  "footer.product": "Umkhiqizo",
  "footer.understand": "Qonda",
  "footer.practice": "Zilolonge",
  "footer.proof": "Zilolonge",
  "footer.orgs": "Izinhlangano",
  "footer.company": "Inkampani",
  "footer.sixFaces": "Ubuso obuyisithupha",
  "footer.tagline":
    "Ubuholi obugxile kumuntu, bukhuliswa kusukela phakathi kuya ngaphandle.",
  "footer.credit": "Craig Ross Muller · UKZN · 2021",
  "footer.contactUs": "Xhumana nathi",
  "footer.formName": "Igama",
  "footer.formEmail": "I-imeyili",
  "footer.formMessage": "Umlayezo",
  "footer.formOrg": "Inhlangano (ongakhetha)",
  "footer.formSend": "Thumela umlayezo",
  "footer.formSending": "Iyathumela…",
  "footer.formThanks": "Siyabonga",
  "footer.formReceived": "Sithole umlayezo wakho.",
  "footer.formAnother": "Thumela omunye",
  "footer.formPrivacy":
    "Ngokuthumela, uyavuma ukuthi singaxhumana nawe mayelana nezinhlelo ze-Super-Cube®.",
  "footer.privacy": "Ubumfihlo",
  "footer.terms": "Imigomo",
  "footer.journals": "Amadayari ayimfihlo · imvume yokwabelana nomqeqeshi",
  "footer.copyright": "Imodeli yobuholi ye-Super-Cube®",
  "footer.newsletter": "Incwadi yezindaba",
  "footer.newsletterBlurb": "Umbono owodwa owusizo wobuholi njalo ngenyanga.",
  "footer.workWithUs": "Sebenza nathi",
  "footer.programmes": "Izinhlelo",
  "footer.resources": "Izinsiza",
  "footer.groupLearn": "Funda",
  "footer.groupRead": "Ucwaningo nemidiya",
  "footer.createAccount": "Vula i-akhawunti",
  "footer.social": "Izinkundla zokuxhumana",
  "footer.legal": "Okomthetho",
  "footer.rights": "Wonke amalungelo agodliwe.",
  "footer.partOf": "Ingxenye ye-Big Five Learn, uphiko lwe-Big Five Group oluthi Fundisa",
  "footer.companyProfile": "Iphrofayela yenkampani (PDF)",
  // Company profile download (home hero)
  "home.profileCta": "Landa iphrofayela yenkampani",
  "home.profileMeta": "Amakhasi angu-{pages} · PDF",
  "home.profileLabel": "Landa iphrofayela yenkampani (PDF, amakhasi angu-{pages}, {size})",
  // Free book (home section, footer, /book breadcrumb)
  "footer.book": "Incwadi yamahhala",
  "home.bookEyebrow": "Incwadi yamahhala",
  "home.bookHeading": "Funda incwadi echaza imodeli",
  "home.bookBody": "Incwadi kaDkt Craig R. Muller ichaza izinhlangothi eziyisithupha kalula, nemikhuba engu-36, amakhasi ayisithupha okuzihlola kanye nohlelo lokwenza lwezinsuku ezingu-30. Mahhala ukuyilanda nokuyabelana.",
  "home.bookCta": "Landa incwadi yamahhala",
  "home.bookMeta": "Amakhasi angu-{pages} · PDF",
  "home.bookLabel": "Landa incwadi yamahhala (PDF, amakhasi angu-{pages}, {size})",
  "home.bookMore": "Mayelana nencwadi",
  "home.bookLang": "NgesiNgisi",
  "home.bookCoverAlt": "Ikhava ye-The Super-Cube® Leadership Model kaDkt Craig R. Muller",

  "cta.tryFree": "Qala isisekelo samahhala",
  "cta.bookPilot": "Bhuka i-pilot",
  "cta.exploreModel": "Hlola imodeli",

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
    "Imenyu, ingxenye engezansi namakhasi abalulekile atholakala ngesiNgisi (okuzenzakalelayo), Français, العربية, Português, Kiswahili, isiZulu nesiBhunu: sebenzisa inkinobho yolimi phezulu. Izifundo nokuhlolwa kocwaningo kuhlala kungesiNgisi, ukuze wonke umfundi aphendule imibuzo efanayo eqinisekisiwe futhi imiphumela ihlale iqhathaniseka.",
  "faq.q6": "Ingabe izikole nezinkampani zingenza i-pilot?",
  "faq.a6":
    "Yebo. Sebenzisa iphakethe le-pilot lamanani, ikhalenda yamaviki angu-8, amanothi emvume, namathuluzi omqeqeshi. Dala ikhodi yeqembu, mema abafundi, ukhiphe inqubekela phambili uma ama-SQL orgs evuliwe.",
  "faq.q7": "Ingabe i-Super-Cube® isekelwe ocwaningweni?",
  "faq.a7":
    "Yebo. Imodeli isuselwa ocwaningweni lweziqu (UKZN, 2020) kumanethiwekhi webhizinisi e-Afrika futhi ihlanganisa izikole ezinkulu zobuholi ne-Ubuntu, I–Thou, nohlaka oluhlangene.",
  "faq.q8": "Izitifiketi zisebenza kanjani?",
  "faq.a8":
    "Ngemva kokuhlolwa kokuphela, ungathola isitifiketi esine-ID yokuqinisekisa esidlangalaleni. Noma ubani angahlola ubuqiniso ekhasini lokuqinisekisa ngaphandle kokubona amadayari ayimfihlo.",

  "lang.choose": "Khetha ulimi",
  "lang.englishOnly": "Leli khasi litholakala ngesiNgisi kuphela.",
  "lang.suggestion": "Le sayithi iyatholakala nangesiZulu.",
  "lang.suggestionCta": "Buka ngesiZulu",
  "lang.untranslated": "Le ngxenye ayikahunyushwa.",
  "common.dismiss": "Vala",
  "a11y.skip": "Yeqela kokuqukethwe okuyinhloko",
  "nav.homeLabel": "Ikhasi lasekhaya le-Super-Cube®",
  "footer.socialLinkedIn": "UDkt Craig Muller ku-LinkedIn",
  "footer.socialResearchGate": "UDkt Craig Muller ku-ResearchGate",

  // The Model menu: skills per face
  "skills.choices": "Ubuhlakani bokwenza izinqumo · Izindinganiso zokuziphatha · Ukwahlulela · Ukuthatha amathuba",
  "skills.principles": "Izisekelo zokuziphatha · Ukuqaphela isimo · Ukwahlulela ngokwesimo · Ukuphatha",
  "skills.mental": "Ubuhlakani bengqondo · Ukucabanga ngamasu · Ukuxazulula izinkinga · Umbono · Ukusebenzisa ulwazi",
  "skills.emotional": "Ubuhlakani bemizwa · Uzwela · Ubudlelwano nabanye · Ugqozi · Ukukhuthaza",
  "skills.physical": "Impilo yomzimba · Ukuphatha amandla · Ukuqina komzimba · Ukudla okunempilo · Ukubekezela komzimba",
  "skills.spiritual": "Inhloso · Incazelo · Ukholo · Ukudlula okubonakalayo · Ubuhlakani bomoya",
};

export default zu;
