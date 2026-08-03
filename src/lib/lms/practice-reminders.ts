import { getLocaleFromStorage, t } from "@/lib/i18n";
import { loadLmsState } from "@/lib/lms/store";

const LAST_KEY = "sc_practice_reminder_day";
const INTERVAL_MS = 15 * 60 * 1000;
/** Local hour after which we may fire a once-per-day reminder */
const REMINDER_AFTER_HOUR = 8;

let started = false;
let timer: ReturnType<typeof setInterval> | null = null;

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function practicedToday(state: ReturnType<typeof loadLmsState>): boolean {
  const day = todayKey();
  const log = state.microPracticeLog?.[day];
  return Boolean(log && log.length > 0);
}

/**
 * Fire at most one browser notification per calendar day when reminders are on.
 * Skips if permission missing, already fired today, or before morning window.
 */
export function maybeFirePracticeReminder(): void {
  if (typeof window === "undefined") return;
  if (!("Notification" in window)) return;
  if (Notification.permission !== "granted") return;

  let state;
  try {
    state = loadLmsState();
  } catch {
    return;
  }
  if (!state.notifyPractice) return;

  const hour = new Date().getHours();
  if (hour < REMINDER_AFTER_HOUR) return;

  const day = todayKey();
  try {
    if (localStorage.getItem(LAST_KEY) === day) return;
  } catch {
    return;
  }

  const locale = getLocaleFromStorage();
  const done = practicedToday(state);
  const title = t("learn.reminderTitle", locale);
  const body = done
    ? t("learn.reminderBodyDone", locale)
    : t("learn.reminderBody", locale);

  try {
    new Notification(title, {
      body,
      icon: "/icons/icon-192.png",
      tag: "sc-practice-daily",
    });
    localStorage.setItem(LAST_KEY, day);
  } catch {
    /* ignore */
  }
}

/** Start a lightweight loop (and check on visibility) for daily practice nudges. */
export function startPracticeReminderLoop(): () => void {
  if (typeof window === "undefined") return () => {};
  if (started) {
    maybeFirePracticeReminder();
    return () => {};
  }
  started = true;

  maybeFirePracticeReminder();
  timer = setInterval(maybeFirePracticeReminder, INTERVAL_MS);

  const onVis = () => {
    if (document.visibilityState === "visible") maybeFirePracticeReminder();
  };
  document.addEventListener("visibilitychange", onVis);

  return () => {
    if (timer) clearInterval(timer);
    timer = null;
    document.removeEventListener("visibilitychange", onVis);
    started = false;
  };
}
