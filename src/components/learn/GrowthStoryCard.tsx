"use client";

import { buildGrowthStory } from "@/lib/lms/growth-story";
import type { LocalLmsState } from "@/lib/lms/store";

export function GrowthStoryCard({ state }: { state: LocalLmsState }) {
  const story = buildGrowthStory(state);

  return (
    <section className="mb-4 rounded-2xl border border-black/[0.07] bg-white p-4 sm:p-5 print:break-inside-avoid">
      <p className="learn-eyebrow">Your growth story</p>
      <h2 className="mt-1 text-lg font-semibold tracking-tight text-ink">
        {story.headline}
      </h2>
      <p className="mt-2 text-[0.875rem] leading-relaxed text-slate">
        {story.body}
      </p>
      <p className="mt-3 rounded-xl bg-[#f8f9fb] px-3 py-2 text-[0.8125rem] font-medium text-ink">
        {story.focusLine}
      </p>
    </section>
  );
}
