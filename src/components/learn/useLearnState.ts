"use client";

import { useSyncExternalStore } from "react";
import {
  getLmsServerSnapshot,
  getLmsSnapshot,
  subscribeLms,
  type LocalLmsState,
} from "@/lib/lms/store";

/** Learner state that is ready on the first client render. Never sticks on a loading shell. */
export function useLmsState(): LocalLmsState {
  return useSyncExternalStore(subscribeLms, getLmsSnapshot, getLmsServerSnapshot);
}
