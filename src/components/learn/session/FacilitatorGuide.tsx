"use client";

import { useLmsT } from "@/lib/i18n/lms/use-lms-t";
import type { FacilitatorGuide as Guide } from "@/lib/lms/sessions";

/** Collapsed coach/teacher notes for group delivery. */
export function FacilitatorGuide({ guide, audience }: { guide: Guide; audience: string }) {
  const { t, fill } = useLmsT();

  return (
    <details className="group mt-4 rounded-2xl border border-dashed border-line bg-elevated px-4 py-3 sm:px-5" data-testid="facilitator-guide">
      <summary className="cursor-pointer list-none text-[0.8125rem] font-semibold text-ink marker:hidden">
        <span aria-hidden="true" className="mr-1.5 inline-block transition group-open:rotate-90">›</span>
        {fill("For facilitators, teachers and coaches · {audience} · ~{mins} min", {
          audience,
          mins: guide.minutes,
        })}
      </summary>
      <div className="mt-3 space-y-3 text-[0.8125rem] leading-relaxed text-slate">
        <div>
          <p className="font-semibold text-ink">{t("Discussion questions")}</p>
          <ul className="mt-1 list-disc space-y-1 pl-4">
            {guide.discussion.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-semibold text-ink">{t("Group activity")}</p>
          <p className="mt-1">{guide.activity}</p>
        </div>
        <p className="learn-meta">
          {t("Keep sharing voluntary, protect privacy, and refer any wellbeing or safeguarding concern to the right professional or your organisation's policy.")}
        </p>
      </div>
    </details>
  );
}
