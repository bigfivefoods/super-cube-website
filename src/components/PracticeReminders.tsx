"use client";

import { useEffect } from "react";
import { startPracticeReminderLoop } from "@/lib/lms/practice-reminders";

/** Mount once in Learn layout to schedule daily practice browser notifications. */
export function PracticeReminders() {
  useEffect(() => startPracticeReminderLoop(), []);
  return null;
}
