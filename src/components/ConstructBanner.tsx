"use client";

import Image from "next/image";
import { CourseVideo } from "@/components/learn/CourseVideo";
import type { ConstructId } from "@/lib/content";

/**
 * Construct page hero media — LMS-style video frame:
 * poster, soft gradient, centre play, duration badge, coloured rim.
 */
export function ConstructBanner({
  constructId,
  name,
  color,
  banner,
  quote,
  attribution,
}: {
  constructId: ConstructId;
  name: string;
  color: string;
  banner: string;
  quote?: string;
  attribution?: string;
}) {
  return (
    <figure className="space-y-3">
      <div
        className="relative overflow-hidden rounded-2xl bg-ink shadow-[0_20px_50px_-24px_rgba(0,0,0,0.45)] ring-1 ring-black/10"
        style={{
          boxShadow: `0 20px 50px -24px rgba(0,0,0,0.4), 0 0 0 1px ${color}33, inset 0 0 0 1px rgba(255,255,255,0.06)`,
        }}
      >
        {/* Top “player” chrome */}
        <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-ink/95 px-3 py-2 sm:px-4">
          <div className="flex min-w-0 items-center gap-2">
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ background: color }}
              aria-hidden
            />
            <p className="truncate text-[0.7rem] font-semibold tracking-tight text-white/90 sm:text-xs">
              {name} · Super-Cube® intro
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1.5" aria-hidden>
            <span className="h-1.5 w-1.5 rounded-full bg-white/25" />
            <span className="h-1.5 w-1.5 rounded-full bg-white/25" />
            <span className="h-1.5 w-1.5 rounded-full bg-white/40" />
          </div>
        </div>

        {/* Video stage — same player pattern as LMS CourseVideo */}
        <div className="relative bg-black">
          <CourseVideo
            programmeId="adults"
            constructId={constructId}
            poster={banner}
            title={`${name} construct`}
            color={color}
            variant="hero"
            badge="15s intro · with voice"
            className="!rounded-none"
          />
          {/* Soft inset vignette for depth */}
          <div
            className="pointer-events-none absolute inset-0 z-[1] shadow-[inset_0_0_48px_rgba(0,0,0,0.28)]"
            aria-hidden
          />
        </div>

        {/* Bottom progress-style accent (static design cue) */}
        <div className="relative h-1 bg-white/10" aria-hidden>
          <div
            className="absolute inset-y-0 left-0 w-[18%] rounded-r-full opacity-90"
            style={{ background: color }}
          />
        </div>
      </div>

      {quote && (
        <figcaption className="rounded-xl border border-black/[0.06] bg-white px-4 py-3 sm:px-5 sm:py-4">
          <div className="flex gap-3">
            <span
              className="mt-1 h-8 w-1 shrink-0 rounded-full"
              style={{ background: color }}
              aria-hidden
            />
            <div className="min-w-0">
              <p className="text-sm font-semibold leading-snug tracking-tight text-ink sm:text-base">
                “{quote}”
              </p>
              {attribution && (
                <p className="mt-1.5 text-xs font-medium text-muted sm:text-sm">
                  — {attribution}
                </p>
              )}
            </div>
          </div>
        </figcaption>
      )}

      {/* Compact poster fallback note for a11y context when video fails */}
      <span className="sr-only">
        Visual for {name}: still image and short intro video when available.
      </span>
    </figure>
  );
}

/** Decorative-only variant if video is unavailable (unused export kept for flexibility) */
export function ConstructBannerStatic({
  name,
  color,
  banner,
  quote,
  attribution,
}: {
  name: string;
  color: string;
  banner: string;
  quote?: string;
  attribution?: string;
}) {
  return (
    <figure className="space-y-3">
      <div
        className="relative overflow-hidden rounded-2xl bg-ink ring-1 ring-black/10"
        style={{
          boxShadow: `0 20px 50px -24px rgba(0,0,0,0.4), 0 0 0 1px ${color}33`,
        }}
      >
        <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2">
          <span
            className="h-2 w-2 rounded-full"
            style={{ background: color }}
            aria-hidden
          />
          <p className="text-[0.7rem] font-semibold text-white/90">{name}</p>
        </div>
        <div className="relative aspect-[16/9] w-full sm:aspect-[1441/630]">
          <Image src={banner} alt="" fill className="object-cover" sizes="(max-width: 1024px) 100vw, 66vw" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
          <div className="absolute left-1/2 top-1/2 flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white/95 shadow-lg">
            <span
              className="ml-0.5 border-y-[7px] border-l-[12px] border-y-transparent border-l-current"
              style={{ color }}
              aria-hidden
            />
          </div>
          <p className="absolute bottom-3 left-3 rounded-full bg-black/45 px-2.5 py-0.5 text-[0.65rem] font-semibold text-white backdrop-blur-sm">
            Construct overview
          </p>
        </div>
        <div className="h-1 bg-white/10">
          <div className="h-full w-[18%]" style={{ background: color }} />
        </div>
      </div>
      {quote && (
        <figcaption className="text-sm text-slate">
          “{quote}”{attribution ? ` — ${attribution}` : ""}
        </figcaption>
      )}
    </figure>
  );
}
