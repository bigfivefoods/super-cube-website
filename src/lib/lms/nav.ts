/**
 * Super-Cube® Learn primary navigation — dual-process model.
 *
 * Two distinct tracks (never mixed without labels):
 * 1. Learning   — course/programme pathway, assessments, progress
 * 2. Journaling — daily pulse, micro-practice, reflection
 *
 * Hub destinations:
 * · Today — both processes at a glance
 * · You   — profile & tools
 *
 * Formal pathway steps live as a compact progress strip, not primary tabs.
 */

export type LearnNavId = "today" | "learn" | "journal" | "progress" | "you";

/** Which process a nav item belongs to (hub/account sit outside both). */
export type LearnProcess = "learning" | "journaling" | "hub" | "account";

export type LearnNavItem = {
  id: LearnNavId;
  href: string;
  label: string;
  /** Short helper under label on desktop */
  hint: string;
  exact?: boolean;
  process?: LearnProcess;
};

export const LEARN_PRIMARY_NAV: LearnNavItem[] = [
  {
    id: "today",
    href: "/learn",
    label: "Today",
    hint: "Both processes at a glance",
    exact: true,
    process: "hub",
  },
  {
    id: "learn",
    href: "/learn/courses",
    label: "Learn",
    hint: "Your course pathway",
    process: "learning",
  },
  {
    id: "journal",
    href: "/learn/pulse",
    label: "Journal",
    hint: "Daily check-in & practice",
    process: "journaling",
  },
  {
    id: "progress",
    href: "/learn/report",
    label: "Progress",
    hint: "Scores & growth report",
    process: "learning",
  },
  {
    id: "you",
    href: "/learn/account",
    label: "You",
    hint: "Profile & tools",
    process: "account",
  },
];

/** Sidebar-only journaling shortcut (Practice also under Journal active match). */
export const LEARN_JOURNAL_PRACTICE = {
  href: "/learn/practice",
  label: "Practice",
  hint: "Micro-practice",
} as const;

/** Secondary destinations grouped by process under More tools */
export type SecondaryGroup = "learning" | "journaling" | "account";

export const LEARN_SECONDARY_LINKS: {
  href: string;
  label: string;
  group: SecondaryGroup;
}[] = [
  // Learning process
  {
    href: "/learn/assessment/orientation",
    label: "Orientation",
    group: "learning",
  },
  {
    href: "/learn/assessment/pre",
    label: "Baseline assessment",
    group: "learning",
  },
  { href: "/learn/assessment/mid", label: "Mid check-in", group: "learning" },
  {
    href: "/learn/assessment/post",
    label: "Post assessment",
    group: "learning",
  },
  { href: "/learn/programmes", label: "Programme", group: "learning" },
  // Journaling process
  { href: "/learn/practice", label: "Micro-practice", group: "journaling" },
  { href: "/learn/feedback", label: "Narrative + cube", group: "journaling" },
  // Account
  { href: "/learn/org", label: "Cohort / coach code", group: "account" },
  { href: "/learn/coach", label: "Coach tools", group: "account" },
  { href: "/pricing", label: "Plans & pricing", group: "account" },
];

export const SECONDARY_GROUP_LABELS: Record<SecondaryGroup, string> = {
  learning: "Learning",
  journaling: "Journaling",
  account: "Account",
};

/** Subtle process accents (construct teal vs blue). */
export const LEARN_PROCESS_ACCENT: Record<
  "learning" | "journaling",
  { color: string; label: string }
> = {
  learning: { color: "#26408C", label: "Learning" },
  journaling: { color: "#16979A", label: "Journaling" },
};

export function isLearnNavActive(
  pathname: string,
  item: Pick<LearnNavItem, "href" | "exact" | "id">
): boolean {
  if (item.exact) {
    return pathname === item.href || pathname === "/learn/";
  }
  if (item.id === "learn") {
    return pathname.startsWith("/learn/courses");
  }
  if (item.id === "journal") {
    return (
      pathname.startsWith("/learn/pulse") ||
      pathname.startsWith("/learn/practice")
    );
  }
  if (item.id === "progress") {
    return (
      pathname.startsWith("/learn/report") ||
      pathname.startsWith("/learn/analytics") ||
      pathname.startsWith("/learn/assessment")
    );
  }
  if (item.id === "you") {
    return (
      pathname.startsWith("/learn/account") ||
      pathname.startsWith("/learn/org") ||
      pathname.startsWith("/learn/coach") ||
      pathname.startsWith("/learn/welcome") ||
      pathname.startsWith("/learn/programmes") ||
      pathname.startsWith("/learn/feedback")
    );
  }
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

export function getNavItem(id: LearnNavId): LearnNavItem {
  return LEARN_PRIMARY_NAV.find((n) => n.id === id)!;
}
