/**
 * Super-Cube® Learn primary navigation.
 *
 * Mental model (5 destinations only):
 * 1. Today     — what to do now (dashboard)
 * 2. Learn     — courses / lessons
 * 3. Check-in  — daily face pulse
 * 4. Progress  — scores, growth report, pathway
 * 5. You       — profile, settings, cohort tools
 *
 * Formal pathway steps (Choose → … → Report) live as a compact progress
 * strip, not as competing primary tabs.
 */

export type LearnNavId = "today" | "learn" | "checkin" | "progress" | "you";

export type LearnNavItem = {
  id: LearnNavId;
  href: string;
  label: string;
  /** Short helper under label on desktop */
  hint: string;
  exact?: boolean;
};

export const LEARN_PRIMARY_NAV: LearnNavItem[] = [
  {
    id: "today",
    href: "/learn",
    label: "Today",
    hint: "Next action & plan",
    exact: true,
  },
  {
    id: "learn",
    href: "/learn/courses",
    label: "Learn",
    hint: "Six faces · sessions",
  },
  {
    id: "checkin",
    href: "/learn/pulse",
    label: "Check-in",
    hint: "Daily face pulse",
  },
  {
    id: "progress",
    href: "/learn/report",
    label: "Progress",
    hint: "Scores & report",
  },
  {
    id: "you",
    href: "/learn/account",
    label: "You",
    hint: "Profile & tools",
  },
];

/** Secondary destinations grouped under You / More */
export const LEARN_SECONDARY_LINKS: {
  href: string;
  label: string;
  group: "daily" | "pathway" | "org";
}[] = [
  { href: "/learn/practice", label: "Micro-practice", group: "daily" },
  { href: "/learn/feedback", label: "Narrative + cube", group: "daily" },
  { href: "/learn/assessment/mid", label: "Mid check-in", group: "pathway" },
  {
    href: "/learn/assessment/orientation",
    label: "Orientation",
    group: "pathway",
  },
  { href: "/learn/assessment/pre", label: "Baseline assessment", group: "pathway" },
  { href: "/learn/assessment/post", label: "Post assessment", group: "pathway" },
  { href: "/learn/programmes", label: "Programme", group: "pathway" },
  { href: "/learn/org", label: "Cohort / coach code", group: "org" },
  { href: "/learn/coach", label: "Coach tools", group: "org" },
  { href: "/pricing", label: "Plans & pricing", group: "org" },
];

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
  if (item.id === "checkin") {
    return (
      pathname.startsWith("/learn/pulse") ||
      pathname.startsWith("/learn/practice")
    );
  }
  if (item.id === "progress") {
    return (
      pathname.startsWith("/learn/report") ||
      pathname.startsWith("/learn/feedback") ||
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
      pathname.startsWith("/learn/programmes")
    );
  }
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}
