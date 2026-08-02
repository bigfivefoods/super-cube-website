"use client";

import { useMemo, useState } from "react";
import { SuperCube } from "@/components/SuperCube";
import { constructs, type ConstructId } from "@/lib/content";
import { Button, PageHero, SectionHeading } from "@/components/ui";

/**
 * Network / team cube — enter mean pre scores (0–100) to visualise collective profile.
 * Client-only; no PII stored.
 */
export default function TeamCubePage() {
  const [scores, setScores] = useState<Record<ConstructId, number>>(() =>
    Object.fromEntries(constructs.map((c) => [c.id, 55])) as Record<
      ConstructId,
      number
    >
  );

  const overall = useMemo(() => {
    const vals = constructs.map((c) => scores[c.id]);
    return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
  }, [scores]);

  return (
    <>
      <PageHero
        eyebrow="Teams & networks"
        title="Team Super-Cube®"
        description="Enter cohort mean scores (from consented export) to light a shared cube. Illustrates network-level impact—not individual ranking."
      >
        <Button href="/learn/coach" variant="primary">
          Coach export
        </Button>
        <Button href="/impact" variant="ghost">
          Impact story
        </Button>
      </PageHero>

      <section className="section-pad bg-[#fafafa]">
        <div className="container-site grid gap-10 lg:grid-cols-[1fr_0.9fr] lg:items-start">
          <div>
            <SectionHeading
              title="Mean scores by face"
              description={`Overall mean · ${overall}/100 · adjust sliders from your CSV averages.`}
            />
            <ul className="mt-6 space-y-4">
              {constructs.map((c) => (
                <li key={c.id}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-ink">{c.name}</span>
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
                      setScores((s) => ({
                        ...s,
                        [c.id]: Number(e.target.value),
                      }))
                    }
                    className="mt-1 w-full accent-ink"
                    aria-label={`${c.name} mean score`}
                  />
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-col items-center rounded-2xl border border-black/[0.08] bg-white p-6">
            <SuperCube
              size="lg"
              showSkills={false}
              showScores
              scores={scores}
              autoSpin
            />
            <p className="mt-4 max-w-xs text-center text-xs text-muted">
              Weak faces appear dimmer; stronger faces glow. Use for board
              updates and school reports—never to shame individuals.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
