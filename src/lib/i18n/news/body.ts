import { DEFAULT_LOCALE, isPrefixedLocale, type Locale, type PrefixedLocale } from "@/lib/i18n/config";

/**
 * Full news-article bodies, one module per post and language.
 *
 * Titles, excerpts, tags and short buttons already live in src/lib/i18n/messages.
 * The bodies do not: those catalogues load on every translated page, and a news
 * article is only needed on that post. Each import() below is its own chunk, so
 * rendering one post loads that post's strings and not the other articles, and
 * not a second copy of the whole-site catalogue.
 * A missing translation stays English (admin posts, and any new code post until
 * it has a body here).
 */
type BodyModule = { default: string };
type Load = () => Promise<BodyModule>;

const LOADERS: Record<PrefixedLocale, Record<string, Load>> = {
  fr: {
    "leadership-is-learnable-new-book": () => import("./bodies/fr/leadership-is-learnable-new-book"),
    "twelve-weeks-six-faces-fmcg-leadership": () => import("./bodies/fr/twelve-weeks-six-faces-fmcg-leadership"),
    "grade-12-boarders-leadership-field-snapshot": () => import("./bodies/fr/grade-12-boarders-leadership-field-snapshot"),
    "start-free-pay-once-lifetime-access-r99": () => import("./bodies/fr/start-free-pay-once-lifetime-access-r99"),
    "super-cube-lms-accelerating-leadership-development": () =>
      import("./bodies/fr/super-cube-lms-accelerating-leadership-development"),
    "free-super-cube-leadership-book": () => import("./bodies/fr/free-super-cube-leadership-book"),
  },
  ar: {
    "leadership-is-learnable-new-book": () => import("./bodies/ar/leadership-is-learnable-new-book"),
    "twelve-weeks-six-faces-fmcg-leadership": () => import("./bodies/ar/twelve-weeks-six-faces-fmcg-leadership"),
    "grade-12-boarders-leadership-field-snapshot": () => import("./bodies/ar/grade-12-boarders-leadership-field-snapshot"),
    "start-free-pay-once-lifetime-access-r99": () => import("./bodies/ar/start-free-pay-once-lifetime-access-r99"),
    "super-cube-lms-accelerating-leadership-development": () =>
      import("./bodies/ar/super-cube-lms-accelerating-leadership-development"),
    "free-super-cube-leadership-book": () => import("./bodies/ar/free-super-cube-leadership-book"),
  },
  pt: {
    "leadership-is-learnable-new-book": () => import("./bodies/pt/leadership-is-learnable-new-book"),
    "twelve-weeks-six-faces-fmcg-leadership": () => import("./bodies/pt/twelve-weeks-six-faces-fmcg-leadership"),
    "grade-12-boarders-leadership-field-snapshot": () => import("./bodies/pt/grade-12-boarders-leadership-field-snapshot"),
    "start-free-pay-once-lifetime-access-r99": () => import("./bodies/pt/start-free-pay-once-lifetime-access-r99"),
    "super-cube-lms-accelerating-leadership-development": () =>
      import("./bodies/pt/super-cube-lms-accelerating-leadership-development"),
    "free-super-cube-leadership-book": () => import("./bodies/pt/free-super-cube-leadership-book"),
  },
  sw: {
    "leadership-is-learnable-new-book": () => import("./bodies/sw/leadership-is-learnable-new-book"),
    "twelve-weeks-six-faces-fmcg-leadership": () => import("./bodies/sw/twelve-weeks-six-faces-fmcg-leadership"),
    "grade-12-boarders-leadership-field-snapshot": () => import("./bodies/sw/grade-12-boarders-leadership-field-snapshot"),
    "start-free-pay-once-lifetime-access-r99": () => import("./bodies/sw/start-free-pay-once-lifetime-access-r99"),
    "super-cube-lms-accelerating-leadership-development": () =>
      import("./bodies/sw/super-cube-lms-accelerating-leadership-development"),
    "free-super-cube-leadership-book": () => import("./bodies/sw/free-super-cube-leadership-book"),
  },
  zu: {
    "leadership-is-learnable-new-book": () => import("./bodies/zu/leadership-is-learnable-new-book"),
    "twelve-weeks-six-faces-fmcg-leadership": () => import("./bodies/zu/twelve-weeks-six-faces-fmcg-leadership"),
    "grade-12-boarders-leadership-field-snapshot": () => import("./bodies/zu/grade-12-boarders-leadership-field-snapshot"),
    "start-free-pay-once-lifetime-access-r99": () => import("./bodies/zu/start-free-pay-once-lifetime-access-r99"),
    "super-cube-lms-accelerating-leadership-development": () =>
      import("./bodies/zu/super-cube-lms-accelerating-leadership-development"),
    "free-super-cube-leadership-book": () => import("./bodies/zu/free-super-cube-leadership-book"),
  },
  af: {
    "leadership-is-learnable-new-book": () => import("./bodies/af/leadership-is-learnable-new-book"),
    "twelve-weeks-six-faces-fmcg-leadership": () => import("./bodies/af/twelve-weeks-six-faces-fmcg-leadership"),
    "grade-12-boarders-leadership-field-snapshot": () => import("./bodies/af/grade-12-boarders-leadership-field-snapshot"),
    "start-free-pay-once-lifetime-access-r99": () => import("./bodies/af/start-free-pay-once-lifetime-access-r99"),
    "super-cube-lms-accelerating-leadership-development": () =>
      import("./bodies/af/super-cube-lms-accelerating-leadership-development"),
    "free-super-cube-leadership-book": () => import("./bodies/af/free-super-cube-leadership-book"),
  },
};

/** The post body in `locale`, or the English source when this post has no translation. */
export async function translateNewsBody(locale: Locale, slug: string, english: string): Promise<string> {
  if (locale === DEFAULT_LOCALE || !isPrefixedLocale(locale)) return english;
  const load = LOADERS[locale][slug];
  if (!load) return english;
  const mod = await load();
  const body = typeof mod.default === "string" ? mod.default : "";
  return body.trim() ? body : english;
}
