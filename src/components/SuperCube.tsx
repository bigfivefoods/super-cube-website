"use client";

import { useState, type CSSProperties } from "react";
import { constructs, type ConstructId } from "@/lib/content";

/** Map cube faces to constructs + orientation class */
const faceLayout: {
  className: string;
  id: ConstructId;
}[] = [
  { className: "front", id: "mental" },
  { className: "back", id: "spiritual" },
  { className: "right", id: "emotional" },
  { className: "left", id: "choices" },
  { className: "top", id: "principles" },
  { className: "bottom", id: "physical" },
];

const byId = Object.fromEntries(constructs.map((c) => [c.id, c])) as Record<
  ConstructId,
  (typeof constructs)[number]
>;

export function SuperCube({
  className = "",
  showSkills = true,
  size = "md",
}: {
  className?: string;
  /** Show high-level skills under each face name */
  showSkills?: boolean;
  size?: "sm" | "md" | "lg";
}) {
  const [paused, setPaused] = useState(false);

  return (
    <div
      className={`relative flex flex-col items-center gap-5 ${className}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className={`cube-scene cube-scene--${size}`}
        role="img"
        aria-label="Super-Cube®: six constructs around you at the centre — Choices, Principles, Mental, Emotional, Physical, Spiritual"
      >
        <div className={`cube ${paused ? "paused" : ""}`}>
          {faceLayout.map((face) => {
            const c = byId[face.id];
            return (
              <div
                key={face.className}
                className={`cube-face cube-face--colored ${face.className}`}
                style={
                  {
                    "--face-bg": c.color,
                    background: c.color,
                  } as CSSProperties
                }
              >
                <span className="cube-face__name">{c.name}</span>
                {showSkills && (
                  <ul className="cube-face__skills">
                    {c.elements.map((skill) => (
                      <li key={skill}>{skill}</li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <p className="max-w-[18rem] text-center text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-muted">
        You at the centre · six faces of leadership
      </p>
    </div>
  );
}
