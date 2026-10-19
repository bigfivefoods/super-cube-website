"use client";

import { useMemo, useState } from "react";
import { SuperCube } from "@/components/SuperCube";
import { constructs, type ConstructId } from "@/lib/content";
import { TEAM_STRINGS, type TeamStrings } from "./team-strings";
import { Button, PageHero, SectionHeading } from "@/components/ui";

/**
 * Network / team cube — enter mean pre scores (0–100) to visualise collective profile.
 * Client-only; no PII stored.
 */

export function TeamCubeView({
  s = TEAM_STRINGS,
  impactHref = "/impact",
}: {
  s?: TeamStrings;
  /** /impact in the page's language */
  impactHref?: string;
}) {
  const [scores, setScores] = useState<Record<ConstructId, number>>(
    () =>
      Object.fromEntries(constructs.map((c) => [c.id, 55])) as Record<
        ConstructId,
        number
      >,
  );

  const overall = useMemo(() => {
    const vals = constructs.map((c) => scores[c.id]);
    return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
  }, [scores]);

  return (
    <>
      <PageHero
        theme="model"
        eyebrow={s.eyebrow}
        title={s.title}
        description={s.description}
      >
        <Button href="/learn/coach" variant="primary">
          {s.coachExport}
        </Button>
        <Button href={impactHref} variant="ghost">
          {s.impactStory}
        </Button>
      </PageHero>

      <section className="section-pad bg-surface">
        <div className="container-site grid gap-10 lg:grid-cols-[1fr_0.9fr] lg:items-start">
          <div>
            <SectionHeading
              title={s.meanTitle}
              description={s.meanDescription.replace("{overall}", String(overall))}
            />
            <ul className="mt-6 space-y-4">
              {constructs.map((c) => (
                <li key={c.id}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-ink">{s.faces[c.id]}</span>
                    <span className="tabular-nums text-muted">
                      {scores[c.id]}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={scores[c.id]}
                    onChange={(e) =>
                      setScores((prev) => ({
                        ...prev,
                        [c.id]: Number(e.target.value),
                      }))
                    }
                    className="mt-1 w-full accent-ink"
                    aria-label={s.meanScoreLabel.replace("{face}", s.faces[c.id])}
                  />
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col items-center sc-card p-6">
            <SuperCube
              size="lg"
              showSkills={false}
              showScores
              scores={scores}
              autoSpin
            />
            <p className="mt-4 max-w-xs text-center text-xs text-muted">
              {s.note}
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
