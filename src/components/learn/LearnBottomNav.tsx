"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import {
  isLearnNavActive,
  LEARN_PRIMARY_NAV,
  LEARN_PROCESS_ACCENT,
  type LearnNavId,
  type LearnProcess,
} from "@/lib/lms/nav";

const icons: Record<LearnNavId, (p: { active: boolean }) => ReactNode> = {
  today: HomeIcon,
  learn: CoursesIcon,
  journal: JournalIcon,
  progress: ProgressIcon,
  you: YouIcon,
};

/** Subtle process tint on inactive icons (Learn/Progress blue, Journal teal). */
function processTint(
  process: LearnProcess | undefined,
  active: boolean
): string | undefined {
  if (active || !process) return undefined;
  if (process === "learning") return LEARN_PROCESS_ACCENT.learning.color;
  if (process === "journaling") return LEARN_PROCESS_ACCENT.journaling.color;
  return undefined;
}

/** Mobile bottom nav — pill dock, 5 dual-process destinations. */
export function LearnBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1 lg:hidden"
      aria-label="Learn app navigation"
    >
      <ul className="mx-auto flex max-w-md items-stretch justify-between rounded-2xl border border-line bg-elevated/95 px-1.5 py-1.5 shadow-[0_12px_40px_-12px_rgba(10,10,10,0.35)] backdrop-blur-xl">
        {LEARN_PRIMARY_NAV.map((tab) => {
          const active = isLearnNavActive(pathname, tab);
          const Icon = icons[tab.id];
          const tint = processTint(tab.process, active);
          return (
            <li key={tab.id} className="flex-1">
              <Link
                href={tab.href}
                className={`flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-xl px-0.5 text-[0.625rem] font-semibold tracking-tight transition ${
                  active
                    ? "bg-void text-void-fg"
                    : "text-muted hover:bg-black/[0.04] dark:hover:bg-white/[0.06] hover:text-ink"
                }`}
                style={
                  !active && tint
                    ? { color: tint, opacity: 0.85 }
                    : undefined
                }
                aria-current={active ? "page" : undefined}
              >
                <Icon active={active} />
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill={active ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9.5z"
      />
    </svg>
  );
}

function CoursesIcon({ active }: { active: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill={active ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M4 19.5A2.5 2.5 0 0 0 6.5 22H20V2H6.5A2.5 2.5 0 0 0 4 4.5v15z"
      />
    </svg>
  );
}

/** Notebook / journal — distinct from Learn book and Progress chart. */
function JournalIcon({ active }: { active: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill={active ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 4h9a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM8 8h7M8 12h5M6 4v16"
      />
    </svg>
  );
}

function ProgressIcon({ active }: { active: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill={active ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 19V5m4 14V9m4 10v-6m4 6V7m4 12V11"
      />
    </svg>
  );
}

function YouIcon({ active }: { active: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill={active ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.75"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 20a8 8 0 0 1 16 0"
      />
    </svg>
  );
}
