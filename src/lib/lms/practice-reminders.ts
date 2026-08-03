import { getLocaleFromStorage, t } from "@/lib/i18n";
import { getTodayPulse } from "@/lib/lms/face-tracking";
import { loadLmsState } from "@/lib/lms/store";

const LAST_KEY = "sc_practice_reminder_day";
const LAST_PULSE_KEY = "sc_pulse_reminder_day";
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

/**
 * Separate once-per-day nudge to log a face pulse when none exists for today.
 */
export function maybeFirePulseReminder(): void {
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
    if (localStorage.getItem(LAST_PULSE_KEY) === day) return;
  } catch {
    return;
  }

  if (getTodayPulse(state)) {
    try {
      localStorage.setItem(LAST_PULSE_KEY, day);
    } catch {
      /* ignore */
    }
    return;
  }

  // Afternoon nudge for pulse so morning is practice-first
  if (hour < 12) return;

  try {
    new Notification("Super-Cube® face pulse", {
      body: "30 seconds: rate 3+ faces so patterns and practice stay aligned.",
      icon: "/icons/icon-192.png",
      tag: "sc-pulse-daily",
    });
    localStorage.setItem(LAST_PULSE_KEY, day);
  } catch {
    /* ignore */
  }
}

function tickReminders() {
  maybeFirePracticeReminder();
  maybeFirePulseReminder();
}

/** Start a lightweight loop for daily practice + pulse nudges. */
export function startPracticeReminderLoop(): () => void {
  if (typeof window === "undefined") return () => {};
  if (started) {
    tickReminders();
    return () => {};
  }
  started = true;

  tickReminders();
  timer = setInterval(tickReminders, INTERVAL_MS);

  const onVis = () => {
    if (document.visibilityState === "visible") tickReminders();
  };
  document.addEventListener("visibilitychange", onVis);

  return () => {
    if (timer) clearInterval(timer);
    timer = null;
    document.removeEventListener("visibilitychange", onVis);
    started = false;
  };
}
