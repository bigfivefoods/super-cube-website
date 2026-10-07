"use client";

import { useEffect, useState } from "react";

const PREFIX = "sc-session-v2:";

/** A small per-device field (if–then plans, WOOP answers, ticks). Never synced. */
export function useLocalField<T>(key: string, initial: T): [T, (v: T) => void, boolean] {
  const [value, setValue] = useState<T>(initial);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(PREFIX + key);
      if (raw != null) setValue(JSON.parse(raw) as T);
    } catch {
      // private mode or bad JSON: keep the initial value
    }
    setLoaded(true);
  }, [key]);
  function set(v: T) {
    setValue(v);
    try {
      window.localStorage.setItem(PREFIX + key, JSON.stringify(v));
    } catch {
      // storage full or blocked: the value still lives for this visit
    }
  }
  return [value, set, loaded];
}

/** Read stored retrieval misses for spaced review (lesson ids → missed question texts). */
export function loadMisses(): Record<string, string[]> {
  try {
    const raw = window.localStorage.getItem(PREFIX + "misses");
    return raw ? (JSON.parse(raw) as Record<string, string[]>) : {};
  } catch {
    return {};
  }
}

export function saveMisses(lessonId: string, missed: string[]) {
  try {
    const all = loadMisses();
    if (missed.length) all[lessonId] = missed;
    else delete all[lessonId];
    window.localStorage.setItem(PREFIX + "misses", JSON.stringify(all));
  } catch {
    // ignore
  }
}
