import { DEFAULT_LOCALE, isPrefixedLocale, type Locale, type PrefixedLocale } from "@/lib/i18n/config";

/**
 * Learn catalogues (gettext: the English string is the key). One language is embedded in the
 * Learn page (`#sc-lms-locale`); the browser bundle does not import every language. Server
 * rendering reads the JSON here. A missing entry stays English, so a new string never blanks.
 */
export const LMS_LOCALE_DATA_ID = "sc-lms-locale";

export type LmsCatalogue = Record<string, string>;

/** Catalogue key: whitespace collapsed and trimmed. */
export function messageKey(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}

/**
 * Agreement scale, fixed so every language's questionnaire uses the same five points.
 * These win over the catalogue.
 */
const SCALE: Record<PrefixedLocale, Record<string, string>> = {
  fr: {
    "Strongly disagree": "Pas du tout d’accord",
    Disagree: "Pas d’accord",
    Neutral: "Neutre",
    Agree: "D’accord",
    "Strongly agree": "Tout à fait d’accord",
  },
  ar: {
    "Strongly disagree": "أعارض بشدة",
    Disagree: "أعارض",
    Neutral: "محايد",
    Agree: "أوافق",
    "Strongly agree": "أوافق بشدة",
  },
  pt: {
    "Strongly disagree": "Discordo totalmente",
    Disagree: "Discordo",
    Neutral: "Neutro",
    Agree: "Concordo",
    "Strongly agree": "Concordo totalmente",
  },
  sw: {
    "Strongly disagree": "Sikubaliani kabisa",
    Disagree: "Sikubaliani",
    Neutral: "Katikati",
    Agree: "Nakubali",
    "Strongly agree": "Nakubali kabisa",
  },
  zu: {
    "Strongly disagree": "Angivumelani nhlobo",
    Disagree: "Angivumelani",
    Neutral: "Phakathi nendawo",
    Agree: "Ngiyavuma",
    "Strongly agree": "Ngiyavuma kakhulu",
  },
  af: {
    "Strongly disagree": "Stem glad nie saam nie",
    Disagree: "Stem nie saam nie",
    Neutral: "Neutraal",
    Agree: "Stem saam",
    "Strongly agree": "Stem volkome saam",
  },
};

/**
 * Short chrome that the long catalogues don't carry (dashboard, pathway, report).
 * Exact-string lookup only, so a sentence that merely contains one of these words is left alone.
 */
const CHROME: Record<PrefixedLocale, Record<string, string>> = {
  fr: {
    Streak: "Série",
    "Step {n}": "Étape {n}",
    Sessions: "Séances",
    "Good morning": "Bonjour",
    "Good afternoon": "Bon après-midi",
    "Good evening": "Bonsoir",
    "Pathway complete": "Parcours terminé",
    day: "jour",
    days: "jours",
    Best: "Record",
    "After step 1": "Après l’étape 1",
    "After orientation": "Après l’orientation",
    "Done today": "Fait aujourd’hui",
    "Check in": "Point du jour",
    "Go to": "Aller à",
    "{done} of {total} pathway steps done": "{done} des {total} étapes du parcours faites",
    "Six faces · courses": "Six faces · parcours",
    "Daily check-in": "Bilan du jour",
    Done: "Fait",
    "Not yet earned": "Pas encore obtenu",
    "Growth report and certificate": "Rapport de progression et certificat",
    "Profile and settings": "Profil et réglages",
    "Next construct": "Face suivante",
    "Save & resume later": "Enregistrer et reprendre plus tard",
    Before: "Avant",
    After: "Après",
    Pre: "Avant",
    Post: "Après",
    Change: "Évolution",
    Overall: "Global",
    Construct: "Face",
    Recommendations: "Recommandations",
    "Print / PDF view": "Imprimer / vue PDF",
    "Share growth link": "Partager le lien de progression",
    "YOU ARE HERE": "VOUS ÊTES ICI",
    COMPLETE: "TERMINÉ",
    Choose: "Choisir",
    Orient: "Orienter",
    Baseline: "Référence",
    Report: "Rapport",
    "Re-measure": "Remesurer",
    "Open →": "Ouvrir →",
    "Your growth story": "Votre histoire de progression",
    "Start baseline": "Commencer la référence",
    "Open weekly plan": "Ouvrir le plan de la semaine",
    "Today’s micro-practice": "Micro-pratique du jour",
    "Full report": "Rapport complet",
    "Choose your programme": "Choisissez votre parcours",
    "Orient your mind": "Orientez votre esprit",
    "Measure your baseline": "Mesurez votre référence",
    "Develop the six faces": "Développez les six faces",
    "Re-measure after the programme": "Remesurez après le parcours",
    "See your growth report": "Voyez votre rapport de progression",
    done: "fait",
  },
  ar: {
    Streak: "سلسلة",
    "Step {n}": "الخطوة {n}",
    Sessions: "الجلسات",
    "Good morning": "صباح الخير",
    "Good afternoon": "طاب نهارك",
    "Good evening": "مساء الخير",
    "Pathway complete": "اكتمل المسار",
    day: "يوم",
    days: "أيام",
    Best: "الأفضل",
    "After step 1": "بعد الخطوة 1",
    "After orientation": "بعد التهيئة",
    "Done today": "تم اليوم",
    "Check in": "سجّل اليوم",
    "Go to": "انتقل إلى",
    "{done} of {total} pathway steps done": "اكتملت {done} من {total} خطوات المسار",
    "Six faces · courses": "ستة أوجه · المسارات",
    "Daily check-in": "مراجعة اليوم",
    Done: "تم",
    "Not yet earned": "لم يُكتسب بعد",
    "Growth report and certificate": "تقرير النمو والشهادة",
    "Profile and settings": "الملف والإعدادات",
    "Next construct": "الوجه التالي",
    "Save & resume later": "احفظ وأكمل لاحقًا",
    Before: "قبل",
    After: "بعد",
    Pre: "قبل",
    Post: "بعد",
    Change: "التغير",
    Overall: "الإجمالي",
    Construct: "الوجه",
    Recommendations: "التوصيات",
    "Print / PDF view": "طباعة / عرض PDF",
    "Share growth link": "شارك رابط النمو",
    "YOU ARE HERE": "أنت هنا",
    COMPLETE: "مكتمل",
    Choose: "اختر",
    Orient: "التهيئة",
    Baseline: "خط الأساس",
    Report: "التقرير",
    "Re-measure": "أعد القياس",
    "Open →": "افتح ←",
    "Your growth story": "قصة نموك",
    "Start baseline": "ابدأ خط الأساس",
    "Open weekly plan": "افتح خطة الأسبوع",
    "Today’s micro-practice": "تدريب اليوم القصير",
    "Full report": "التقرير الكامل",
    "Choose your programme": "اختر برنامجك",
    "Orient your mind": "هيّئ ذهنك",
    "Measure your baseline": "قِس خط الأساس",
    "Develop the six faces": "طوّر الأوجه الستة",
    "Re-measure after the programme": "أعد القياس بعد البرنامج",
    "See your growth report": "اطلع على تقرير نموك",
    done: "تم",
  },
  pt: {
    Streak: "Sequência",
    "Step {n}": "Passo {n}",
    Sessions: "Sessões",
    "Good morning": "Bom dia",
    "Good afternoon": "Boa tarde",
    "Good evening": "Boa noite",
    "Pathway complete": "Percurso concluído",
    day: "dia",
    days: "dias",
    Best: "Recorde",
    "After step 1": "Depois do passo 1",
    "After orientation": "Depois da orientação",
    "Done today": "Feito hoje",
    "Check in": "Registo do dia",
    "Go to": "Ir para",
    "{done} of {total} pathway steps done": "{done} de {total} passos do percurso concluídos",
    "Six faces · courses": "Seis faces · percursos",
    "Daily check-in": "Balanço do dia",
    Done: "Feito",
    "Not yet earned": "Ainda não conquistado",
    "Growth report and certificate": "Relatório de progresso e certificado",
    "Profile and settings": "Perfil e definições",
    "Next construct": "Face seguinte",
    "Save & resume later": "Guardar e retomar mais tarde",
    Before: "Antes",
    After: "Depois",
    Pre: "Antes",
    Post: "Depois",
    Change: "Variação",
    Overall: "Global",
    Construct: "Face",
    Recommendations: "Recomendações",
    "Print / PDF view": "Imprimir / vista PDF",
    "Share growth link": "Partilhar a ligação de progresso",
    "YOU ARE HERE": "ESTÁ AQUI",
    COMPLETE: "CONCLUÍDO",
    Choose: "Escolher",
    Orient: "Orientar",
    Baseline: "Linha de base",
    Report: "Relatório",
    "Re-measure": "Voltar a medir",
    "Open →": "Abrir →",
    "Your growth story": "A sua história de progresso",
    "Start baseline": "Começar a linha de base",
    "Open weekly plan": "Abrir o plano da semana",
    "Today’s micro-practice": "Microprática de hoje",
    "Full report": "Relatório completo",
    "Choose your programme": "Escolha o seu percurso",
    "Orient your mind": "Oriente a sua mente",
    "Measure your baseline": "Meça a sua linha de base",
    "Develop the six faces": "Desenvolva as seis faces",
    "Re-measure after the programme": "Volte a medir depois do percurso",
    "See your growth report": "Veja o seu relatório de progresso",
    done: "feito",
  },
  sw: {
    Streak: "Mfululizo",
    "Step {n}": "Hatua {n}",
    Sessions: "Vipindi",
    "Good morning": "Habari za asubuhi",
    "Good afternoon": "Habari za mchana",
    "Good evening": "Habari za jioni",
    "Pathway complete": "Njia imekamilika",
    day: "siku",
    days: "siku",
    Best: "Bora",
    "After step 1": "Baada ya hatua ya 1",
    "After orientation": "Baada ya mwelekeo",
    "Done today": "Imefanyika leo",
    "Check in": "Angalia leo",
    "Go to": "Nenda",
    "{done} of {total} pathway steps done": "Hatua {done} kati ya {total} za njia zimekamilika",
    "Six faces · courses": "Pande sita · kozi",
    "Daily check-in": "Ukaguzi wa kila siku",
    Done: "Imefanyika",
    "Not yet earned": "Bado haijapata",
    "Growth report and certificate": "Ripoti ya ukuaji na cheti",
    "Profile and settings": "Wasifu na mipangilio",
    "Next construct": "Upande unaofuata",
    "Save & resume later": "Hifadhi na uendelee baadaye",
    Before: "Kabla",
    After: "Baada",
    Pre: "Kabla",
    Post: "Baada",
    Change: "Mabadiliko",
    Overall: "Jumla",
    Construct: "Upande",
    Recommendations: "Mapendekezo",
    "Print / PDF view": "Chapisha / mwonekano wa PDF",
    "Share growth link": "Shiriki kiungo cha ukuaji",
    "YOU ARE HERE": "UPO HAPA",
    COMPLETE: "IMEKAMILIKA",
    Choose: "Chagua",
    Orient: "Elekeza",
    Baseline: "Msingi",
    Report: "Ripoti",
    "Re-measure": "Pima tena",
    "Open →": "Fungua →",
    "Your growth story": "Hadithi ya ukuaji wako",
    "Start baseline": "Anza msingi",
    "Open weekly plan": "Fungua mpango wa wiki",
    "Today’s micro-practice": "Mazoezi mafupi ya leo",
    "Full report": "Ripoti kamili",
    "Choose your programme": "Chagua programu yako",
    "Orient your mind": "Elekeza akili yako",
    "Measure your baseline": "Pima msingi wako",
    "Develop the six faces": "Kuza pande sita",
    "Re-measure after the programme": "Pima tena baada ya programu",
    "See your growth report": "Ona ripoti ya ukuaji wako",
    done: "imefanyika",
  },
  zu: {
    Streak: "Ulandelelwano",
    "Step {n}": "Isinyathelo {n}",
    Sessions: "Izikhathi",
    "Good morning": "Sawubona ekuseni",
    "Good afternoon": "Sawubona emini",
    "Good evening": "Sawubona kusihlwa",
    "Pathway complete": "Indlela iqediwe",
    day: "usuku",
    days: "izinsuku",
    Best: "Okuhle kakhulu",
    "After step 1": "Ngemva kwesinyathelo 1",
    "After orientation": "Ngemva kokuqondisa",
    "Done today": "Kwenziwe namuhla",
    "Check in": "Hlola namuhla",
    "Go to": "Iya ku",
    "{done} of {total} pathway steps done": "{done} kwezinyathelo ezingu-{total} zindlela zenziwe",
    "Six faces · courses": "Izinhlangothi eziyisithupha · izifundo",
    "Daily check-in": "Ukuhlola kwansuku zonke",
    Done: "Kwenziwe",
    "Not yet earned": "Akukatholakali",
    "Growth report and certificate": "Umbiko wokukhula nesitifiketi",
    "Profile and settings": "Iphrofayela nezilungiselelo",
    "Next construct": "Uhlangothi olulandelayo",
    "Save & resume later": "Londoloza uqhubeke kamuva",
    Before: "Ngaphambi",
    After: "Ngemva",
    Pre: "Ngaphambi",
    Post: "Ngemva",
    Change: "Ushintsho",
    Overall: "Sekukonke",
    Construct: "Uhlangothi",
    Recommendations: "Izincomo",
    "Print / PDF view": "Phrinta / umbono we-PDF",
    "Share growth link": "Yabelana ngesixhumanisi sokukhula",
    "YOU ARE HERE": "ULAPHA",
    COMPLETE: "KUQEDIWE",
    Choose: "Khetha",
    Orient: "Qondisa",
    Baseline: "Isisekelo",
    Report: "Umbiko",
    "Re-measure": "Linganisa futhi",
    "Open →": "Vula →",
    "Your growth story": "Indaba yakho yokukhula",
    "Start baseline": "Qala isisekelo",
    "Open weekly plan": "Vula uhlelo lweviki",
    "Today’s micro-practice": "Umsebenzi omfushane wanamuhla",
    "Full report": "Umbiko ogcwele",
    "Choose your programme": "Khetha uhlelo lwakho",
    "Orient your mind": "Qondisa ingqondo yakho",
    "Measure your baseline": "Linganisa isisekelo sakho",
    "Develop the six faces": "Khulisa izinhlangothi eziyisithupha",
    "Re-measure after the programme": "Linganisa futhi ngemva kohlelo",
    "See your growth report": "Bona umbiko wakho wokukhula",
    done: "kwenziwe",
  },
  af: {
    Streak: "Reeks",
    "Step {n}": "Stap {n}",
    Sessions: "Sessies",
    "Good morning": "Goeiemôre",
    "Good afternoon": "Goeiemiddag",
    "Good evening": "Goeienaand",
    "Pathway complete": "Pad voltooi",
    day: "dag",
    days: "dae",
    Best: "Rekord",
    "After step 1": "Ná stap 1",
    "After orientation": "Ná oriëntering",
    "Done today": "Vandag klaar",
    "Check in": "Teken vandag aan",
    "Go to": "Gaan na",
    "{done} of {total} pathway steps done": "{done} van {total} padstappe klaar",
    "Six faces · courses": "Ses vlakke · kursusse",
    "Daily check-in": "Daaglikse aanmelding",
    Done: "Klaar",
    "Not yet earned": "Nog nie verdien nie",
    "Growth report and certificate": "Groeiverslag en sertifikaat",
    "Profile and settings": "Profiel en instellings",
    "Next construct": "Volgende vlak",
    "Save & resume later": "Stoor en gaan later voort",
    Before: "Voor",
    After: "Na",
    Pre: "Voor",
    Post: "Na",
    Change: "Verandering",
    Overall: "Algeheel",
    Construct: "Vlak",
    Recommendations: "Aanbevelings",
    "Print / PDF view": "Druk / PDF-aansig",
    "Share growth link": "Deel groeiskakel",
    "YOU ARE HERE": "JY IS HIER",
    COMPLETE: "VOLTOOI",
    Choose: "Kies",
    Orient: "Oriënteer",
    Baseline: "Basislyn",
    Report: "Verslag",
    "Re-measure": "Hermeet",
    "Open →": "Maak oop →",
    "Your growth story": "Jou groeistorie",
    "Start baseline": "Begin die basislyn",
    "Open weekly plan": "Maak die weekplan oop",
    "Today’s micro-practice": "Vandag se mikro-oefening",
    "Full report": "Volledige verslag",
    "Choose your programme": "Kies jou program",
    "Orient your mind": "Oriënteer jou denke",
    "Measure your baseline": "Meet jou basislyn",
    "Develop the six faces": "Ontwikkel die ses vlakke",
    "Re-measure after the programme": "Hermeet ná die program",
    "See your growth report": "Sien jou groeiverslag",
    done: "klaar",
  },
};

const SKIP_KEY =
  /^(id|href|color|colorSoft|accent|coverPath|instrumentId|constructId|courseId|lessonId|programmeId|itemType|lessonType|block|phase|tone|sessionHref|key|answer|value|score|sortOrder|reverse|durationMinutes|kind|process|urgency|status|serverId|completedAt)$/;

let clientCache: { locale: string; map: LmsCatalogue } | null = null;

function serverCatalogue(locale: PrefixedLocale): LmsCatalogue {
  // Server only. This branch is dropped from the browser bundle.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { LMS_MESSAGES } = require("./catalogues") as typeof import("./catalogues");
  return LMS_MESSAGES[locale] ?? {};
}

function clientCatalogue(locale: PrefixedLocale): LmsCatalogue {
  if (clientCache?.locale === locale) return clientCache.map;
  if (typeof document === "undefined") return {};
  const el = document.getElementById(LMS_LOCALE_DATA_ID);
  if (el?.getAttribute("data-locale") === locale && el.textContent) {
    try {
      const map = JSON.parse(el.textContent) as LmsCatalogue;
      clientCache = { locale, map };
      return map;
    } catch {
      clientCache = { locale, map: {} };
    }
  }
  return {};
}

export function lmsCatalogue(locale: Locale): LmsCatalogue {
  if (locale === DEFAULT_LOCALE || !isPrefixedLocale(locale)) return {};
  if (typeof window === "undefined") return serverCatalogue(locale);
  return clientCatalogue(locale);
}

/** Translation of an English string. English, and any string with no entry, is returned unchanged. */
export function lmsText(locale: Locale, s: string): string {
  if (locale === DEFAULT_LOCALE || !s) return s;
  const key = messageKey(s);
  if (!key || !/\p{L}/u.test(key)) return s;
  const hit =
    (isPrefixedLocale(locale) ? SCALE[locale]?.[key] ?? CHROME[locale]?.[key] : undefined) ??
    lmsCatalogue(locale)[key];
  if (hit == null || hit === "") return s;
  const lead = /^\s/.test(s) ? " " : "";
  const trail = /\s$/.test(s) ? " " : "";
  return `${lead}${hit}${trail}`;
}

function skipString(value: string, key?: string): boolean {
  if (key && SKIP_KEY.test(key)) return true;
  if (value.startsWith("/") || value.startsWith("http") || value.startsWith("#") || value.startsWith("mailto:")) return true;
  return false;
}

/**
 * Translate string leaves. Ids, hrefs, colours and enum fields stay as stored so item ids and
 * scores are identical in every language.
 */
export function localizeDeep<V>(locale: Locale, value: V, key?: string): V {
  if (locale === DEFAULT_LOCALE) return value;
  if (typeof value === "string") {
    if (skipString(value, key)) return value;
    return lmsText(locale, value) as V;
  }
  if (Array.isArray(value)) return value.map((v) => localizeDeep(locale, v)) as V;
  if (value && typeof value === "object") {
    const proto = Object.getPrototypeOf(value);
    if (proto !== Object.prototype && proto !== null) return value;
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [k, localizeDeep(locale, v, k)]),
    ) as V;
  }
  return value;
}

/** Fill `{placeholders}` after the template has been translated. */
export function fillCopy(template: string, vars: Record<string, string | number> = {}): string {
  return template.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m));
}
