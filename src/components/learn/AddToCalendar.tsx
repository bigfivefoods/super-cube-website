"use client";

import { formatDateZA } from "@/lib/datetime";
import { POST_MIN_DAYS } from "@/lib/lms/gates";
import { buildPostAssessmentIcs, postOpensDay } from "@/lib/lms/ics";
import { track } from "@/lib/analytics";

/** Downloads an .ics invite for the day the after-programme re-measure opens. */
export function AddToCalendar({
  preCompletedAt,
  programmeName,
  className = "learn-btn learn-btn-ghost",
}: {
  preCompletedAt: string;
  programmeName: string;
  className?: string;
}) {
  const day = postOpensDay(preCompletedAt, POST_MIN_DAYS);

  function download() {
    const ics = buildPostAssessmentIcs({
      preCompletedAt,
      minDays: POST_MIN_DAYS,
      programmeName,
      siteUrl: typeof window !== "undefined" ? window.location.origin : undefined,
    });
    const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "super-cube-re-measure.ics";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    track("calendar_invite_download", { kind: "post", day });
  }

  return (
    <button type="button" onClick={download} className={className} data-testid="add-to-calendar">
      Add day-{POST_MIN_DAYS} re-measure to calendar · {formatDateZA(`${day}T12:00:00+02:00`)}
    </button>
  );
}
