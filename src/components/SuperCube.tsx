"use client";

import { useState } from "react";

const faces = [
  { className: "front", label: "Mental", sub: "Strategy & vision" },
  { className: "back", label: "Spiritual", sub: "Purpose & meaning" },
  { className: "right", label: "Emotional", sub: "Trust & empathy" },
  { className: "left", label: "Choices", sub: "Judgement & risk" },
  { className: "top", label: "Principles", sub: "Ethics & governance" },
  { className: "bottom", label: "Physical", sub: "Energy & resilience" },
] as const;

export function SuperCube({ className = "" }: { className?: string }) {
  const [paused, setPaused] = useState(false);

  return (
    <div
      className={`relative flex flex-col items-center gap-6 ${className}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="cube-scene" aria-hidden>
        <div className={`cube ${paused ? "paused" : ""}`}>
          {faces.map((face) => (
            <div key={face.className} className={`cube-face ${face.className}`}>
              <span>{face.label}</span>
              <small className="text-[0.6rem] font-medium tracking-wide opacity-80">
                {face.sub}
              </small>
            </div>
          ))}
        </div>
      </div>
      <p className="max-w-[16rem] text-center text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-muted">
        You at the centre
      </p>
    </div>
  );
}
