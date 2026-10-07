/**
 * Breadcrumb trails: Home › Section › Page.
 *
 * Every crumb is a real route with a human label (never a raw slug). `parent`
 * links a page to its section; top-level pages have no parent. A path that is
 * not in the map (404s, private or app routes) gets no breadcrumbs at all.
 */
import { site } from "@/lib/content";
import { darkHeroPaths, lightHeroPaths } from "@/lib/hero-media";
import type { I18nKey } from "@/lib/i18n";
import { getInsight } from "@/lib/insights";

type RouteLabel = { label: string; i18n?: I18nKey; parent?: string };

export type Crumb = { href: string; label: string; i18n?: I18nKey };

export const routeLabels: Record<string, RouteLabel> = {
  // The model
  "/the-model": { label: "The Model", i18n: "nav.theModel" },
  "/constructs": { label: "Six faces", i18n: "nav.sixFaces", parent: "/the-model" },
  "/research": { label: "Research", i18n: "nav.research" },
  "/how": { label: "How it works", i18n: "nav.how" },
  "/practices": { label: "Practices", i18n: "nav.practices" },
  "/sample-report": { label: "Sample report", i18n: "nav.sampleReport" },
  "/impact": { label: "Impact", i18n: "nav.impact" },

  // Audiences
  "/what": { label: "Individuals", i18n: "nav.individuals" },
  "/programs": { label: "Programmes", i18n: "nav.programmes", parent: "/what" },
  "/organisations": { label: "Organisations", i18n: "nav.organisations" },
  "/pilot-pack": { label: "Pilot pack", i18n: "nav.pilotPack", parent: "/organisations" },
  "/facilitator": { label: "Facilitator kit", i18n: "nav.facilitator", parent: "/organisations" },
  "/team": { label: "Team cube", i18n: "nav.team", parent: "/organisations" },
  "/certify": { label: "Certification", i18n: "nav.certify", parent: "/organisations" },
  "/community": { label: "Community", i18n: "nav.community", parent: "/organisations" },
  "/schools": { label: "Schools", i18n: "nav.schools" },
  "/speaking": { label: "Speaking", i18n: "nav.speaking" },
  "/media": { label: "Media kit", i18n: "nav.media", parent: "/speaking" },
  "/pricing": { label: "Pricing", i18n: "nav.pricing" },

  // Understand
  "/why-leadership": { label: "Why leadership", i18n: "nav.why" },
  "/leadership-challenges": {
    label: "Leadership challenges",
    i18n: "nav.leadershipChallenges",
    parent: "/why-leadership",
  },
  "/about": { label: "About", i18n: "nav.about" },
  "/insights": { label: "Insights", i18n: "nav.insights" },

  // Help, legal and account
  "/faq": { label: "FAQ", i18n: "nav.faq" },
  "/contact": { label: "Contact", i18n: "nav.contact" },
  "/privacy": { label: "Privacy", i18n: "footer.privacy" },
  "/terms": { label: "Terms", i18n: "footer.terms" },
  "/signup": { label: "Create account", i18n: "footer.createAccount" },
  "/newsletter/unsubscribe": { label: "Unsubscribe", i18n: "bc.unsubscribe" },
};

/**
 * No breadcrumbs here: the LMS has its own app shell (sidebar, section chips and
 * bottom tabs), sign-in is a full-bleed card with its own "Back to site" link,
 * and admin / private share links are not part of the public site.
 */
const excludedPrefixes = ["/learn", "/login", "/share", "/newsletter/admin", "/auth", "/api"];

const HOME: Crumb = { href: "/", label: "Home", i18n: "bc.home" };

function normalise(pathname: string) {
  const p = pathname.split(/[?#]/)[0] || "/";
  return p.length > 1 ? p.replace(/\/+$/, "") : p;
}

function resolve(path: string): RouteLabel | null {
  const known = routeLabels[path];
  if (known) return known;

  const insight = path.match(/^\/insights\/([^/]+)$/);
  if (insight) {
    const post = getInsight(decodeURIComponent(insight[1]!));
    return post ? { label: post.title, parent: "/insights" } : null;
  }
  if (/^\/verify\/[^/]+$/.test(path)) {
    return { label: "Certificate verification", i18n: "bc.verify" };
  }
  return null;
}

/** Full trail starting at Home, or null when the page gets no breadcrumbs. */
export function breadcrumbTrail(pathname: string): Crumb[] | null {
  const path = normalise(pathname);
  if (path === "/") return null;
  if (excludedPrefixes.some((p) => path === p || path.startsWith(`${p}/`))) return null;

  const leaf = resolve(path);
  if (!leaf) return null;

  const trail: Crumb[] = [{ href: path, label: leaf.label, i18n: leaf.i18n }];
  const seen = new Set([path]);
  let parent = leaf.parent;
  while (parent && !seen.has(parent)) {
    seen.add(parent);
    const entry = routeLabels[parent];
    if (!entry) break;
    trail.unshift({ href: parent, label: entry.label, i18n: entry.i18n });
    parent = entry.parent;
  }
  return [HOME, ...trail];
}

/** schema.org BreadcrumbList (English labels, absolute canonical URLs). */
export function breadcrumbJsonLd(trail: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.label,
      item: c.href === "/" ? site.url : `${site.url}${c.href}`,
    })),
  };
}

/** What the breadcrumb row sits on, so it can match the hero's text colour. */
export function breadcrumbTone(pathname: string): "dark" | "light" | "plain" {
  const path = normalise(pathname);
  if ((darkHeroPaths as readonly string[]).includes(path)) return "dark";
  if ((lightHeroPaths as readonly string[]).includes(path)) return "light";
  return "plain";
}
