#!/usr/bin/env python3
"""Generate short TTS voice-overs and mux into course intro videos."""

from __future__ import annotations

import asyncio
import json
import subprocess
import sys
from pathlib import Path

import edge_tts

ROOT = Path(__file__).resolve().parents[1]
VIDEO_DIR = ROOT / "public" / "videos" / "courses"
AUDIO_DIR = ROOT / "public" / "videos" / "courses" / "_audio"
SCRIPTS_JSON = ROOT / "src" / "lib" / "lms" / "course-voiceovers.json"

# Warm, clear voices by age pathway
VOICES = {
    "kids": "en-US-AriaNeural",
    "adolescents": "en-US-JennyNeural",
    "adults": "en-US-AndrewNeural",
}

# ~12–14s when spoken — quote + one-line course promise
SCRIPTS: dict[str, dict[str, str]] = {
    "kids": {
        "choices": (
            "Choices. Good leaders choose carefully. "
            "The history of free people is written by choice—their choice. "
            "In this course you’ll practise making brave, kind decisions."
        ),
        "principles": (
            "Principles. Be the change you wish to see in the world. "
            "This course helps you keep promises, play fair, and earn trust."
        ),
        "mental": (
            "Mental. Imagination is more important than knowledge. "
            "You’ll grow curious thinking, big ideas, and problem-solving superpowers."
        ),
        "emotional": (
            "Emotional. Kindness is hard to give away—because it often comes back. "
            "Learn to name feelings, care for friends, and stay calm when things get hard."
        ),
        "physical": (
            "Physical. Take care of your body—it’s the only place you have to live. "
            "You’ll practise energy, movement, rest, and looking after yourself."
        ),
        "spiritual": (
            "Spiritual. Example is not the main thing in influencing others—it is the only thing. "
            "Discover what matters to you, and lead by how you show up for others."
        ),
    },
    "adolescents": {
        "choices": (
            "Choices. The history of free people is never written by chance, but by choice—their choice. "
            "This module trains wise decisions under pressure: values, judgement, and smart risk."
        ),
        "principles": (
            "Principles. You must be the change you wish to see in the world. "
            "Build integrity, fair process, and trust—online, at school, and with your team."
        ),
        "mental": (
            "Mental. Imagination is more important than knowledge. Memory is past—finite. Vision is future—infinite. "
            "Strengthen strategy, problem-solving, and the vision that pulls you forward."
        ),
        "emotional": (
            "Emotional. One of the most difficult things to give away is kindness—for it is often returned. "
            "Grow emotional intelligence, empathy, and influence that people actually want to follow."
        ),
        "physical": (
            "Physical. Take care of your body. It’s the only place you have to live. "
            "Protect energy, sleep, and resilience so you can lead without burning out."
        ),
        "spiritual": (
            "Spiritual. Example is not the main thing in influencing others. It is the only thing. "
            "Anchor purpose and meaning so your leadership lasts beyond the next deadline."
        ),
    },
    "adults": {
        "choices": (
            "Choices. Dwight Eisenhower: the history of free men is never written by chance, but by choice—their choice. "
            "This course develops decision intelligence, moral values, judgement, and calculated risk under complexity."
        ),
        "principles": (
            "Principles. Mahatma Gandhi: you must be the change you wish to see in the world. "
            "Earn lasting trust through ethical foundations, contextual awareness, and accountable governance."
        ),
        "mental": (
            "Mental. Albert Einstein: imagination is more important than knowledge. Memory is past—finite. Vision is future—infinite. "
            "Train strategic thinking, problem-solving, vision, and applied knowledge where it counts."
        ),
        "emotional": (
            "Emotional. Mark Ortman: one of the most difficult things to give away is kindness, for it’s often returned. "
            "Build emotional intelligence to strengthen relationships, motivation, and collective performance."
        ),
        "physical": (
            "Physical. Jim Rohn: take care of your body. It’s the only place you have to live. "
            "Steward health, energy, and resilience so leadership can be sustained—not merely sprinted."
        ),
        "spiritual": (
            "Spiritual. Albert Schweitzer: example is not the main thing in influencing others. It is the only thing. "
            "Lead from purpose, meaning, and deeper motivation that outlasts short-term pressure."
        ),
    },
}


def run(cmd: list[str]) -> None:
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        print(r.stderr or r.stdout, file=sys.stderr)
        raise SystemExit(r.returncode)


async def synth(text: str, voice: str, out_mp3: Path) -> None:
    communicate = edge_tts.Communicate(text, voice, rate="-5%")
    await communicate.save(str(out_mp3))


def mux(video_in: Path, audio_in: Path, video_out: Path) -> None:
    """Replace audio; keep video length at 15s; pad or trim audio to match."""
    # Probe video duration
    probe = subprocess.run(
        [
            "ffprobe",
            "-v",
            "error",
            "-show_entries",
            "format=duration",
            "-of",
            "default=noprint_wrappers=1:nokey=1",
            str(video_in),
        ],
        capture_output=True,
        text=True,
        check=True,
    )
    duration = float(probe.stdout.strip() or "15")

    # Mix: soft duck not needed (video silent). Fade in/out audio, pad/trim to video length.
    filter = (
        f"[1:a]afade=t=in:st=0:d=0.25,afade=t=out:st={max(duration - 0.4, 0)}:d=0.35,"
        f"apad=whole_dur={duration},atrim=0:{duration},asetpts=PTS-STARTPTS[a]"
    )
    tmp = video_out.with_suffix(".tmp.mp4")
    run(
        [
            "ffmpeg",
            "-y",
            "-i",
            str(video_in),
            "-i",
            str(audio_in),
            "-filter_complex",
            filter,
            "-map",
            "0:v:0",
            "-map",
            "[a]",
            "-c:v",
            "copy",
            "-c:a",
            "aac",
            "-b:a",
            "128k",
            "-shortest",
            "-movflags",
            "+faststart",
            str(tmp),
        ]
    )
    tmp.replace(video_out)


async def main() -> None:
    AUDIO_DIR.mkdir(parents=True, exist_ok=True)
    SCRIPTS_JSON.parent.mkdir(parents=True, exist_ok=True)
    SCRIPTS_JSON.write_text(json.dumps(SCRIPTS, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote scripts → {SCRIPTS_JSON.relative_to(ROOT)}")

    # Prefer silent masters from _raw if present (10s), else current finals
    raw = VIDEO_DIR / "_raw"
    silent_backup = VIDEO_DIR / "_silent"
    silent_backup.mkdir(exist_ok=True)

    jobs: list[tuple[str, str, Path, Path]] = []
    for age, constructs in SCRIPTS.items():
        for construct, text in constructs.items():
            final = VIDEO_DIR / age / f"{construct}.mp4"
            if not final.exists():
                print(f"skip missing video {final}")
                continue
            # Backup silent once
            backup = silent_backup / f"{age}-{construct}.mp4"
            if not backup.exists():
                backup.write_bytes(final.read_bytes())
            # Use silent backup as video source so re-runs don't stack audio
            video_src = backup
            audio = AUDIO_DIR / f"{age}-{construct}.mp3"
            jobs.append((age, construct, video_src, audio))

    print(f"Synthesising {len(jobs)} voice-overs…")
    for age, construct, _video, audio in jobs:
        text = SCRIPTS[age][construct]
        voice = VOICES[age]
        print(f"  TTS {age}/{construct} ({voice})")
        await synth(text, voice, audio)

    print("Muxing audio into videos…")
    for age, construct, video_src, audio in jobs:
        final = VIDEO_DIR / age / f"{construct}.mp4"
        print(f"  mux {age}/{construct}")
        mux(video_src, audio, final)

    print("Done. Voice-overs written into public/videos/courses/{age}/{construct}.mp4")


if __name__ == "__main__":
    asyncio.run(main())
