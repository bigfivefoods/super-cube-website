"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ConstructId } from "@/lib/content";
import {
  courseVideoPath,
  sessionVideoPath,
} from "@/lib/lms/course-videos";
import type { ProgrammeId } from "@/lib/programmes";

type Variant = "thumb" | "hero";

/**
 * Intro clip with poster + play control.
 * Pass programmeId+constructId for course intros, or src/lessonId for sessions.
 */
export function CourseVideo({
  programmeId,
  constructId,
  lessonId,
  src: srcProp,
  poster,
  title,
  color = "#0a0a0a",
  variant = "thumb",
  className = "",
  badge = "15s intro · with voice",
}: {
  programmeId?: ProgrammeId;
  constructId?: ConstructId;
  /** Session lesson id → /videos/sessions/{lessonId}.mp4 */
  lessonId?: string;
  /** Explicit video URL (overrides programme/construct/lesson) */
  src?: string;
  poster: string;
  title: string;
  color?: string;
  variant?: Variant;
  className?: string;
  badge?: string;
}) {
  const src =
    srcProp ??
    (lessonId
      ? sessionVideoPath(lessonId)
      : programmeId && constructId
        ? courseVideoPath(programmeId, constructId)
        : "");
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);
  const [error, setError] = useState(false);

  const stop = useCallback(() => {
    const v = videoRef.current;
    if (v) {
      v.pause();
      v.currentTime = 0;
    }
    setPlaying(false);
  }, []);

  const play = useCallback(
    (e?: React.MouseEvent) => {
      e?.preventDefault();
      e?.stopPropagation();
      if (error) return;
      const v = videoRef.current;
      if (!v) return;
      setStarted(true);
      void v.play().then(() => setPlaying(true)).catch(() => setError(true));
    },
    [error]
  );

  const toggle = useCallback(
    (e?: React.MouseEvent) => {
      e?.preventDefault();
      e?.stopPropagation();
      const v = videoRef.current;
      if (!v || error) return;
      if (v.paused) {
        setStarted(true);
        void v.play().then(() => setPlaying(true)).catch(() => setError(true));
      } else {
        v.pause();
        setPlaying(false);
      }
    },
    [error]
  );

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onEnded = () => {
      setPlaying(false);
      v.currentTime = 0;
    };
    const onPause = () => {
      if (!v.ended) setPlaying(false);
    };
    const onPlay = () => setPlaying(true);
    v.addEventListener("ended", onEnded);
    v.addEventListener("pause", onPause);
    v.addEventListener("play", onPlay);
    return () => {
      v.removeEventListener("ended", onEnded);
      v.removeEventListener("pause", onPause);
      v.removeEventListener("play", onPlay);
    };
  }, []);

  const isHero = variant === "hero";

  return (
    <div
      className={`group/video relative overflow-hidden bg-black/[0.04] ${
        isHero
          ? "aspect-[16/9] w-full rounded-xl sm:rounded-2xl"
          : "h-full w-full rounded-lg"
      } ${className}`}
      onClick={(e) => {
        // Keep card Link from firing when interacting with video
        e.preventDefault();
        e.stopPropagation();
      }}
    >
      {/* Poster — visible until playback starts */}
      {(!started || !playing) && (
        <Image
          src={poster}
          alt=""
          fill
          className={`object-cover transition duration-500 ${
            playing ? "opacity-0" : "opacity-100"
          } ${!isHero ? "group-hover:scale-[1.03]" : ""}`}
          sizes={isHero ? "(max-width: 768px) 100vw, 720px" : "96px"}
          priority={isHero}
        />
      )}

      <video
        ref={videoRef}
        src={src}
        className={`absolute inset-0 h-full w-full object-cover transition-opacity ${
          started && playing ? "opacity-100" : "opacity-0"
        }`}
        playsInline
        preload="metadata"
        controls={isHero && started}
        // User-gesture play unlocks audio (quote + overview voice-over)
        muted={false}
        onError={() => setError(true)}
        aria-label={`${title} intro video with voice-over`}
      />

      {/* Soft gradient for play button contrast */}
      {!playing && (
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-black/10 to-transparent"
          aria-hidden
        />
      )}

      {/* Play / pause control */}
      {!error && (
        <button
          type="button"
          onClick={isHero && started ? toggle : play}
          className={`absolute z-10 flex items-center justify-center rounded-full text-white shadow-lg transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
            isHero
              ? playing
                ? "bottom-3 right-3 h-10 w-10 bg-black/55 opacity-0 hover:bg-black/70 group-hover/video:opacity-100"
                : "left-1/2 top-1/2 h-14 w-14 -translate-x-1/2 -translate-y-1/2 bg-white/95 text-ink hover:scale-105 hover:bg-white sm:h-16 sm:w-16"
              : playing
                ? "inset-0 bg-black/25 opacity-0 group-hover/video:opacity-100"
                : "inset-0 bg-black/15 hover:bg-black/25"
          }`}
          style={
            !isHero && !playing
              ? undefined
              : isHero && !playing
                ? { color: color }
                : undefined
          }
          aria-label={playing ? `Pause ${title} video` : `Play ${title} video`}
        >
          {playing ? (
            isHero ? (
              <PauseIcon className="h-4 w-4" />
            ) : (
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-ink shadow">
                <PauseIcon className="h-3.5 w-3.5" />
              </span>
            )
          ) : isHero ? (
            <PlayIcon className="ml-0.5 h-6 w-6 sm:h-7 sm:w-7" style={{ color }} />
          ) : (
            <span
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/95 shadow-md transition group-hover/video:scale-110"
              style={{ color }}
            >
              <PlayIcon className="ml-0.5 h-3.5 w-3.5" />
            </span>
          )}
        </button>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 p-2 text-center">
          <p className="text-[0.65rem] font-medium text-white/90">
            Video unavailable
          </p>
        </div>
      )}

      {isHero && !playing && !error && badge && (
        <p className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-black/45 px-2.5 py-0.5 text-[0.65rem] font-semibold tracking-wide text-white backdrop-blur-sm sm:bottom-4 sm:left-4">
          {badge}
        </p>
      )}
    </div>
  );
}

/** Session-specific 15s intro (construct visual + lesson voice-over). */
export function SessionVideo({
  lessonId,
  poster,
  title,
  color,
  variant = "hero",
  className = "",
}: {
  lessonId: string;
  poster: string;
  title: string;
  color?: string;
  variant?: Variant;
  className?: string;
}) {
  return (
    <CourseVideo
      lessonId={lessonId}
      poster={poster}
      title={title}
      color={color}
      variant={variant}
      className={className}
      badge="Session intro · 15s"
    />
  );
}

function PlayIcon({
  className = "",
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      style={style}
      aria-hidden
    >
      <path d="M8 5.14v13.72a1 1 0 0 0 1.5.86l11.02-6.86a1 1 0 0 0 0-1.72L9.5 4.28A1 1 0 0 0 8 5.14z" />
    </svg>
  );
}

function PauseIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M7 5h3a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zm7 0h3a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1h-3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z" />
    </svg>
  );
}
