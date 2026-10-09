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

/** Progress light tiers: a dark face slowly takes on its full colour and then glows. */
const LIGHT_STYLE: { dim: number; glow?: number }[] = [{ dim: 0.84 }, { dim: 0.6 }, { dim: 0.32 }, { dim: 0 }, { dim: 0, glow: 22 }];

/**
 * Dim a face by laying a dark veil over its colour. Only the background darkens,
 * so the white face text keeps (and gains) contrast. Fading the whole face with
 * opacity used to drop the text below 4.5:1.
 */
function faceBackground(color: string, dim: number): string {
  if (dim <= 0) return color;
  const a = Math.min(0.9, dim).toFixed(2);
  return `linear-gradient(rgba(24, 27, 34, ${a}), rgba(24, 27, 34, ${a})), ${color}`;
}

export function SuperCube({
  className = "",
  showSkills = true,
  size = "md",
  autoSpin = true,
  scores,
  showScores = false,
  light,
  celebrate = null,
  hideControls = false,
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
  /** Progress light per face, tier 0 (dark) to 4 (fully lit): the cube lights up face by face */
  light?: Partial<Record<ConstructId, number>>;
  /** A face that just moved up a tier gets a short glow pulse (off with reduced motion) */
  celebrate?: ConstructId | null;
  /** Hide the rotate buttons (compact progress views) */
  hideControls?: boolean;
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
        aria-label={`Interactive Super-Cube®. Choices on top, Principles on the bottom, Mental, Emotional, Physical and Spiritual on the sides.${
          showSkills && !showScores ? " The skills on each face are listed below." : ""
        } Drag to rotate.`}
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
            // Weak faces read dimmer: 0 → a 0.55 veil, 100 → none
            const scoreDim = hasScore ? Math.max(0, Math.min(0.55, (1 - score / 100) * 0.55)) : 0;
            const tier = light ? Math.max(0, Math.min(4, light[face.id] ?? 0)) : null;
            const lit = tier === null ? null : LIGHT_STYLE[tier];
            return (
              <div
                key={face.className}
                className={`cube-face cube-face--colored ${face.className}${tier !== null ? ` cube-face--tier-${tier}` : ""}${
                  celebrate === face.id ? " cube-face--celebrate" : ""
                }`}
                data-face={face.id}
                data-tier={tier ?? undefined}
                style={
                  {
                    "--face-bg": c.color,
                    // All face text is white (Craig, Oct 2026); a soft dark shadow
                    // (globals.css) keeps it readable on the lighter faces.
                    "--face-fg": "#ffffff",
                    background: faceBackground(c.color, lit ? lit.dim : scoreDim),
                    color: "#ffffff",
                    textShadow: "0 1px 2px rgba(0, 0, 0, 0.45)",
                    boxShadow: lit
                      ? lit.glow
                        ? `0 0 ${lit.glow}px ${c.color}, inset 0 0 0 1px rgba(255,255,255,0.35)`
                        : undefined
                      : hasScore && score >= 70
                        ? `0 0 18px ${c.color}`
                        : undefined,
                  } as CSSProperties
                }
              >
                <span className="cube-face__name">{c.name}</span>
                {tier !== null && (
                  <span className="cube-face__pips" aria-hidden>
                    {[1, 2, 3, 4].map((t) => (
                      <i key={t} className={t <= tier ? "on" : undefined} />
                    ))}
                  </span>
                )}
                {showScores && hasScore && (
                  <span className="mt-1 block text-[0.65rem] font-bold tabular-nums">
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

      {/* Scores drawn on the faces are part of the picture; repeat them as text for screen readers. */}
      {scores && Object.keys(scores).length > 0 && (
        <ul className="sr-only" aria-label="Super-Cube® face scores out of 100">
          {faceLayout.map((face) => {
            const c = byId[face.id];
            const score = scores[face.id];
            return (
              <li key={face.id}>
                {c.name}: {typeof score === "number" ? `${Math.round(score)} out of 100` : "no score yet"}
              </li>
            );
          })}
        </ul>
      )}

      {light && (
        <ul className="sr-only" aria-label="How far each Super-Cube® face is lit, out of 4">
          {faceLayout.map((face) => (
            <li key={face.id}>
              {byId[face.id].name}: {light[face.id] ?? 0} of 4
            </li>
          ))}
        </ul>
      )}

      {/* The 3D faces are a picture (role="img"); give screen readers the faces and skills as text. */}
      {showSkills && !showScores && (
        <ul className="sr-only" aria-label="Super-Cube® faces and the skills each develops">
          {faceLayout.map((face) => {
            const c = byId[face.id];
            return (
              <li key={face.id}>
                {c.name}: {c.elements.join(", ")}
              </li>
            );
          })}
        </ul>
      )}

      {!hideControls && (
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
            className="cube-ctrl rounded-full border border-line bg-elevated px-2.5 py-1.5 text-[0.7rem] font-semibold text-ink touch-manipulation hover:border-ink/30 sm:px-2.5 sm:text-xs"
            aria-label="Rotate left"
          >
            <span aria-hidden="true">↺</span> Left
          </button>
          <button
            type="button"
            onClick={() => nudge("y", 25)}
            className="cube-ctrl rounded-full border border-line bg-elevated px-2.5 py-1.5 text-[0.7rem] font-semibold text-ink touch-manipulation hover:border-ink/30 sm:px-2.5 sm:text-xs"
            aria-label="Rotate right"
          >
            <span aria-hidden="true">↻</span> Right
          </button>
          <button
            type="button"
            onClick={() => nudge("x", -25)}
            className="cube-ctrl rounded-full border border-line bg-elevated px-2.5 py-1.5 text-[0.7rem] font-semibold text-ink touch-manipulation hover:border-ink/30 sm:px-2.5 sm:text-xs"
            aria-label="Tilt up"
          >
            <span aria-hidden="true">↑</span> Up
          </button>
          <button
            type="button"
            onClick={() => nudge("x", 25)}
            className="cube-ctrl rounded-full border border-line bg-elevated px-2.5 py-1.5 text-[0.7rem] font-semibold text-ink touch-manipulation hover:border-ink/30 sm:px-2.5 sm:text-xs"
            aria-label="Tilt down"
          >
            <span aria-hidden="true">↓</span> Down
          </button>
          <button
            type="button"
            onClick={() => nudge("z", 25)}
            className="cube-ctrl rounded-full border border-line bg-elevated px-2.5 py-1.5 text-[0.7rem] font-semibold text-ink touch-manipulation hover:border-ink/30 sm:px-2.5 sm:text-xs"
            aria-label="Roll"
          >
            <span aria-hidden="true">↷</span> Roll
          </button>
          <button
            type="button"
            onClick={reset}
            className="cube-ctrl rounded-full border border-line bg-elevated px-2.5 py-1.5 text-[0.7rem] font-semibold text-ink touch-manipulation hover:border-ink/30 sm:px-2.5 sm:text-xs"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={() => setAutoEnabled((v) => !v)}
            className={`cube-ctrl rounded-full border px-2.5 py-1.5 text-[0.7rem] font-semibold touch-manipulation sm:px-2.5 sm:text-xs ${
              autoEnabled
                ? "sc-btn-primary border-transparent"
                : "border-line bg-elevated text-ink hover:border-ink/30"
            }`}
            aria-pressed={autoEnabled}
          >
            {autoEnabled ? "Auto on" : "Auto off"}
          </button>
        </div>
      </div>
      )}
    </div>
  );
}
