"use client";

import { downloadFacilitatorOnePager } from "@/lib/lms/facilitator-pdf";

export function FacilitatorDownloadButton({
  orgName,
  orgCode,
  className = "",
}: {
  orgName?: string;
  orgCode?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      className={
        className ||
        "inline-flex min-h-11 items-center justify-center rounded-full bg-ink px-5 text-sm font-semibold text-white hover:bg-ink-soft"
      }
      onClick={() => downloadFacilitatorOnePager({ orgName, orgCode })}
    >
      Download one-pager PDF
    </button>
  );
}
