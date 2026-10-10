"use client";

/**
 * In-memory store for the knowledge check on the open session, so the
 * session page can read the learner's first answers when they mark the
 * session complete, and reset the check for a retry.
 */
import { useSyncExternalStore } from "react";

type Entry = { answers: (number | null)[]; round: number };
const entries = new Map<string, Entry>();
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

function entry(id: string): Entry {
  let e = entries.get(id);
  if (!e) {
    e = { answers: [], round: 0 };
    entries.set(id, e);
  }
  return e;
}

/** Save the first answer per question for this round. */
export function setCheckAnswers(id: string, answers: (number | null)[]) {
  const e = entry(id);
  entries.set(id, { ...e, answers: answers.slice() });
  emit();
}

export function getCheckAnswers(id: string): (number | null)[] {
  return entries.get(id)?.answers ?? [];
}

export function getCheckRound(id: string): number {
  return entries.get(id)?.round ?? 0;
}

/** Clear the answers and start a new round (the check remounts empty). */
export function resetCheck(id: string) {
  const e = entry(id);
  entries.set(id, { answers: [], round: e.round + 1 });
  emit();
}

export function useCheckRound(id: string | undefined): number {
  return useSyncExternalStore(
    subscribe,
    () => (id ? getCheckRound(id) : 0),
    () => 0,
  );
}

export function useCheckAnswers(id: string | undefined): (number | null)[] {
  return useSyncExternalStore(
    subscribe,
    () => (id ? (entries.get(id)?.answers ?? EMPTY) : EMPTY),
    () => EMPTY,
  );
}

const EMPTY: (number | null)[] = [];
