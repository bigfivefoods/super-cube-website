#!/usr/bin/env python3
"""
Generate 15s session intro clips: construct video visual + lesson-specific voice-over.
Outputs: public/videos/sessions/{lessonId}.mp4
"""

from __future__ import annotations

import asyncio
import json
import re
import subprocess
import sys
from pathlib import Path

import edge_tts

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "scripts" / "session-manifest.json"
SILENT = ROOT / "public" / "videos" / "courses" / "_silent"
OUT_DIR = ROOT / "public" / "videos" / "sessions"
AUDIO_DIR = OUT_DIR / "_audio"
SCRIPTS_OUT = ROOT / "src" / "lib" / "lms" / "session-voiceovers.json"

VOICES = {
    "kids": "en-US-AriaNeural",
    "adolescents": "en-US-JennyNeural",
    "adults": "en-US-AndrewNeural",
}


def clean(s: str) -> str:
    s = re.sub(r"\s+", " ", s).strip()
    s = s.replace("Super-Cube®", "Super-Cube")
    return s


def script_for(row: dict) -> str:
    age = row["programmeId"]
    name = row["constructName"]
    title = clean(row["title"])
    outcome = clean(row["outcome"])
    typ = row["type"]

    # Keep roughly 12–14s spoken
    if age == "kids":
        if "Overview" in title:
            return (
                f"{name}. This is your overview session. {outcome} "
                f"Listen, try the activities, and take one small step today."
            )
        if typ == "practice":
            return (
                f"{name} practice lab. {outcome} "
                f"Get ready to try it for real—and notice what you learn."
            )
        if typ == "quiz":
            return (
                f"{name} quick check. {outcome} "
                f"Show what you know, then pick one habit to keep."
            )
        return (
            f"{name}. Session: {title}. {outcome} "
            f"Let’s practise this skill together."
        )

    if age == "adolescents":
        if "Overview" in title:
            return (
                f"{name}. Overview session. {outcome} "
                f"You’ll see why this face matters—and start one practice you can use this week."
            )
        if typ == "practice":
            return (
                f"{name} practice lab. {outcome} "
                f"Design a real experiment in your life, then reflect honestly."
            )
        if typ == "quiz":
            return (
                f"{name} quick check. {outcome} "
                f"Lock in understanding, then choose one habit that sticks."
            )
        return (
            f"{name}. {title}. {outcome} "
            f"Work the scenario, then take a micro-action before the day ends."
        )

    # adults
    if "Overview" in title:
        return (
            f"{name}. Module overview. {outcome} "
            f"This session frames the construct, then sets one deliberate practice in motion."
        )
    if typ == "practice":
        return (
            f"{name} practice lab. {outcome} "
            f"Apply the model in a live context and capture what changes."
        )
    if typ == "quiz":
        return (
            f"{name} quick check. {outcome} "
            f"Confirm mastery, then commit to one sustainable leadership habit."
        )
    return (
        f"{name}. {title}. {outcome} "
        f"Read, engage with the scenario, and apply a micro-action this week."
    )


def run(cmd: list[str]) -> None:
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        print((r.stderr or r.stdout)[:2000], file=sys.stderr)
        raise SystemExit(r.returncode)


async def synth(text: str, voice: str, out_mp3: Path) -> None:
    communicate = edge_tts.Communicate(text, voice, rate="-5%")
    await communicate.save(str(out_mp3))


def mux(video_in: Path, audio_in: Path, video_out: Path) -> None:
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
    filter_complex = (
        f"[1:a]afade=t=in:st=0:d=0.2,afade=t=out:st={max(duration - 0.35, 0)}:d=0.3,"
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
            filter_complex,
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
    if not MANIFEST.exists():
        print("Missing session-manifest.json — export curriculum first", file=sys.stderr)
        raise SystemExit(1)

    rows = json.loads(MANIFEST.read_text(encoding="utf-8"))
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    AUDIO_DIR.mkdir(parents=True, exist_ok=True)

    scripts: dict[str, str] = {}
    for row in rows:
        scripts[row["lessonId"]] = script_for(row)
    SCRIPTS_OUT.write_text(json.dumps(scripts, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {len(scripts)} scripts → {SCRIPTS_OUT.relative_to(ROOT)}")

    # TTS in moderate batches
    print(f"Synthesising {len(rows)} voice-overs…")
    sem = asyncio.Semaphore(4)

    async def one(row: dict) -> None:
        lid = row["lessonId"]
        age = row["programmeId"]
        audio = AUDIO_DIR / f"{lid}.mp3"
        if audio.exists() and audio.stat().st_size > 1000:
            return
        text = scripts[lid]
        voice = VOICES[age]
        async with sem:
            print(f"  TTS {lid}")
            await synth(text, voice, audio)

    await asyncio.gather(*(one(r) for r in rows))

    print("Muxing session videos…")
    for row in rows:
        lid = row["lessonId"]
        age = row["programmeId"]
        construct = row["constructId"]
        silent = SILENT / f"{age}-{construct}.mp4"
        # Fallback: course final (has VO) — prefer silent
        if not silent.exists():
            silent = ROOT / "public" / "videos" / "courses" / age / f"{construct}.mp4"
        if not silent.exists():
            print(f"  skip no visual {lid}")
            continue
        audio = AUDIO_DIR / f"{lid}.mp3"
        out = OUT_DIR / f"{lid}.mp4"
        if out.exists() and out.stat().st_size > 10_000:
            # still re-mux if audio newer
            if out.stat().st_mtime >= audio.stat().st_mtime:
                continue
        print(f"  mux {lid}")
        mux(silent, audio, out)

    done = list(OUT_DIR.glob("*.mp4"))
    print(f"Done. {len(done)} session clips in public/videos/sessions/")


if __name__ == "__main__":
    asyncio.run(main())
