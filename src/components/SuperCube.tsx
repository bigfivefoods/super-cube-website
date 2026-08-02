"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { constructs, type ConstructId } from "@/lib/content";

/**
 * Cube face map:
 * - Top / bottom: Choices · Principles (as requested)
 * - Four sides: Mental · Emotional · Physical · Spiritual
 */
const faceLayout: {
  className: "front" | "back" | "right" | "left" | "top" | "bottom";
  id: ConstructId;
}[] = [
  { className: "top", id: "choices" },
  { className: "bottom", id: "principles" },
  { className: "front", id: "mental" },
  { className: "back", id: "spiritual" },
  { className: "right", id: "emotional" },
  { className: "left", id: "physical" },
];

const byId = Object.fromEntries(constructs.map((c) => [c.id, c])) as Record<
  ConstructId,
  (typeof constructs)[number]
>;

const DEFAULT_ROT = { x: -22, y: 32, z: 0 };

export function SuperCube({
  className = "",
  showSkills = true,
  size = "md",
  autoSpin = true,
  scores,
  showScores = false,
}: {
  className?: string;
  /** Show high-level skills under each face name */
  showSkills?: boolean;
  size?: "sm" | "md" | "lg";
  /** Gentle auto-spin when the user is not dragging */
  autoSpin?: boolean;
  /** Optional 0–100 scores per face — dims weak faces, lights strong ones */
  scores?: Partial<Record<ConstructId, number>>;
  /** Show numeric score under face name when scores provided */
  showScores?: boolean;
}) {
  const [rot, setRot] = useState(DEFAULT_ROT);
  const [dragging, setDragging] = useState(false);
  const [autoEnabled, setAutoEnabled] = useState(autoSpin);

  const rotRef = useRef(rot);
  const draggingRef = useRef(false);
  const lastPtr = useRef({ x: 0, y: 0 });
  const sceneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    rotRef.current = rot;
  }, [rot]);

  // Ambient auto-spin on Y when idle (respect reduced motion)
  useEffect(() => {
    if (!autoEnabled) return;
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    let frame = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(48, now - last);
      last = now;
      if (!draggingRef.current) {
        setRot((r) => {
          const next = { ...r, y: r.y + dt * 0.012 };
          rotRef.current = next;
          return next;
        });
      }
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [autoEnabled]);

  const onPointerDown = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    draggingRef.current = true;
    setDragging(true);
    lastPtr.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    const dx = e.clientX - lastPtr.current.x;
    const dy = e.clientY - lastPtr.current.y;
    lastPtr.current = { x: e.clientX, y: e.clientY };

    // Horizontal drag → rotate Y; vertical drag → rotate X (any direction)
    // Hold Shift for Z spin
    setRot((r) => {
      let next;
      if (e.shiftKey) {
        next = { ...r, z: r.z + dx * 0.45 };
      } else {
        next = {
          ...r,
          y: r.y + dx * 0.45,
          x: r.x - dy * 0.45,
        };
      }
      rotRef.current = next;
      return next;
    });
  }, []);

  const endDrag = useCallback((e: ReactPointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    setDragging(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* already released */
    }
  }, []);

  const reset = useCallback(() => {
    setRot(DEFAULT_ROT);
    rotRef.current = DEFAULT_ROT;
  }, []);

  const nudge = useCallback((axis: "x" | "y" | "z", delta: number) => {
    setRot((r) => {
      const next = { ...r, [axis]: r[axis] + delta };
      rotRef.current = next;
      return next;
    });
  }, []);

  return (
    <div className={`relative flex flex-col items-center gap-4 ${className}`}>
      <div
        ref={sceneRef}
        className={`cube-scene cube-scene--${size} cube-scene--interactive ${
          dragging ? "is-dragging" : ""
        }`}
        role="img"
        aria-label="Interactive Super-Cube®. Choices on top, Principles on the bottom, Mental, Emotional, Physical and Spiritual on the sides. Drag to rotate."
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerLeave={(e) => {
          if (draggingRef.current) endDrag(e);
        }}
      >
        <div
          className="cube cube--manual"
          style={
            {
              transform: `rotateX(${rot.x}deg) rotateY(${rot.y}deg) rotateZ(${rot.z}deg)`,
            } as CSSProperties
          }
        >
          {faceLayout.map((face) => {
            const c = byId[face.id];
            const score = scores?.[face.id];
            const hasScore = typeof score === "number";
            // Map 0–100 → opacity 0.35–1 so weak faces read dimmer
            const intensity = hasScore
              ? Math.min(1, Math.max(0.35, 0.35 + (score / 100) * 0.65))
              : 1;
            return (
              <div
                key={face.className}
                className={`cube-face cube-face--colored ${face.className}`}
                style={
                  {
                    "--face-bg": c.color,
                    background: c.color,
                    opacity: intensity,
                    boxShadow: hasScore && score >= 70
                      ? `0 0 18px ${c.color}`
                      : undefined,
                  } as CSSProperties
                }
              >
                <span className="cube-face__name">{c.name}</span>
                {showScores && hasScore && (
                  <span className="mt-1 block text-[0.65rem] font-bold tabular-nums text-white/95">
                    {Math.round(score)}
                  </span>
                )}
                {showSkills && !showScores && (
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

      <div className="flex w-full max-w-full flex-col items-center gap-2 px-0.5 sm:max-w-[20rem]">
        <p className="text-center text-[0.65rem] font-medium uppercase tracking-[0.12em] text-muted sm:text-[0.6875rem] sm:tracking-[0.14em]">
          <span className="sm:hidden">Drag to rotate</span>
          <span className="hidden sm:inline">
            Drag to rotate · Shift+drag for spin · Choices top · Principles
            bottom
          </span>
        </p>

        <div className="flex max-w-full flex-wrap items-center justify-center gap-1.5 sm:gap-1.5">
          <button
            type="button"
            onClick={() => nudge("y", -25)}
            className="cube-ctrl rounded-full border border-black/[0.1] bg-white px-2.5 py-1.5 text-[0.7rem] font-semibold text-ink touch-manipulation hover:border-ink/30 sm:px-2.5 sm:text-xs"
            aria-label="Rotate left"
          >
            ↺ Y
          </button>
          <button
            type="button"
            onClick={() => nudge("y", 25)}
            className="cube-ctrl rounded-full border border-black/[0.1] bg-white px-2.5 py-1.5 text-[0.7rem] font-semibold text-ink touch-manipulation hover:border-ink/30 sm:px-2.5 sm:text-xs"
            aria-label="Rotate right"
          >
            ↻ Y
          </button>
          <button
            type="button"
            onClick={() => nudge("x", -25)}
            className="cube-ctrl rounded-full border border-black/[0.1] bg-white px-2.5 py-1.5 text-[0.7rem] font-semibold text-ink touch-manipulation hover:border-ink/30 sm:px-2.5 sm:text-xs"
            aria-label="Tilt up"
          >
            ↑ X
          </button>
          <button
            type="button"
            onClick={() => nudge("x", 25)}
            className="cube-ctrl rounded-full border border-black/[0.1] bg-white px-2.5 py-1.5 text-[0.7rem] font-semibold text-ink touch-manipulation hover:border-ink/30 sm:px-2.5 sm:text-xs"
            aria-label="Tilt down"
          >
            ↓ X
          </button>
          <button
            type="button"
            onClick={() => nudge("z", 25)}
            className="cube-ctrl rounded-full border border-black/[0.1] bg-white px-2.5 py-1.5 text-[0.7rem] font-semibold text-ink touch-manipulation hover:border-ink/30 sm:px-2.5 sm:text-xs"
            aria-label="Roll"
          >
            ⟳ Z
          </button>
          <button
            type="button"
            onClick={reset}
            className="cube-ctrl rounded-full border border-black/[0.1] bg-white px-2.5 py-1.5 text-[0.7rem] font-semibold text-ink touch-manipulation hover:border-ink/30 sm:px-2.5 sm:text-xs"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={() => setAutoEnabled((v) => !v)}
            className={`cube-ctrl rounded-full border px-2.5 py-1.5 text-[0.7rem] font-semibold touch-manipulation sm:px-2.5 sm:text-xs ${
              autoEnabled
                ? "border-ink bg-ink text-white"
                : "border-black/[0.1] bg-white text-ink hover:border-ink/30"
            }`}
            aria-pressed={autoEnabled}
          >
            {autoEnabled ? "Auto on" : "Auto off"}
          </button>
        </div>
      </div>
    </div>
  );
}
