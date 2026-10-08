import type { LocalLmsState } from "@/lib/lms/store";

/**
 * The growth report and certificate are rewards for practice the server recorded.
 * A post attempt only receives a server id after the after-test gate accepts it.
 * A certificate id exists only after the server issues one.
 */
export function serverHasRecordedPractice(
  state: Pick<LocalLmsState, "attempts" | "certificateId">,
): boolean {
  if (state.certificateId) return true;
  return state.attempts.some((a) => a.phase === "post" && Boolean(a.serverId));
}
