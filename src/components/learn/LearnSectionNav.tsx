"use client";

import { useEffect, useState } from "react";

const SECTIONS = [
  { id: "hero", label: "Start" },
  { id: "journey", label: "Journey" },
  { id: "check-in", label: "Check-in" },
  { id: "learn-now", label: "Learn" },
  { id: "progress", label: "Progress" },
] as const;

/** Sticky section chips for multi-page-feel vertical Today scroll. */
export function LearnSectionNav() {
  const [active, setActive] = useState<string>("hero");

  useEffect(() => {
    const els = SECTIONS.map((s) => document.getElementById(s.id)).filter(
      Boolean
    ) as HTMLElement[];
    if (!els.length) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]?.target?.id) setActive(visible[0].target.id);
      },
      { rootMargin: "-20% 0px -55% 0px", threshold: [0.1, 0.35, 0.6] }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <nav
      className="sticky top-[calc(3.5rem+env(safe-area-inset-top,0px))] z-30 -mx-1 mb-5 border-b border-black/[0.06] bg-[#fafafa]/95 px-1 py-2 backdrop-blur-md md:top-[calc(4rem+env(safe-area-inset-top,0px))] lg:top-20"
      aria-label="Today sections"
    >
      <ul className="flex gap-1 overflow-x-auto pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {SECTIONS.map((s) => {
          const on = active === s.id;
          return (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                className={`inline-flex min-h-9 items-center rounded-full px-3.5 text-[0.75rem] font-semibold transition ${
                  on
                    ? "bg-ink text-white shadow-sm"
                    : "bg-white text-slate ring-1 ring-black/[0.08] hover:text-ink"
                }`}
              >
                {s.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
