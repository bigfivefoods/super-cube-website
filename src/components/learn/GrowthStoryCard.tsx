"use client";

"use client";

import { buildGrowthStory } from "@/lib/lms/growth-story";
import { useLmsT } from "@/lib/i18n/lms/use-lms-t";
import type { LocalLmsState } from "@/lib/lms/store";

export function GrowthStoryCard({ state }: { state: LocalLmsState }) {
  const { t } = useLmsT();
  const story = buildGrowthStory(state);

  return (
    <section className="mb-4 rounded-2xl border border-line bg-elevated p-4 sm:p-5 print:break-inside-avoid">
      <p className="learn-eyebrow">{t("Your growth story")}</p>
      <h2 className="mt-1 text-lg font-semibold tracking-tight text-ink">
        {t(story.headline)}
      </h2>
      <p className="mt-2 text-[0.875rem] leading-relaxed text-slate">
        {t(story.body)}
      </p>
      <p className="mt-3 rounded-xl bg-surface px-3 py-2 text-[0.8125rem] font-medium text-ink">
        {t(story.focusLine)}
      </p>
    </section>
  );
}
