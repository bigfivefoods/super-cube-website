"use client";

import { useEffect, useState } from "react";
import { dirOf, type Locale } from "@/lib/i18n/config";
import { grantLtiAccess } from "@/lib/lms/store";
import type { ProgrammeId } from "@/lib/programmes";

export function EnterCourse({
  token,
  programmeId,
  courseId,
  orgCode,
  fullName,
  email,
  nextPath,
  locale,
  opening,
  openLabel,
  framed,
}: {
  token: string;
  programmeId: ProgrammeId;
  courseId: string;
  orgCode: string | null;
  fullName: string | null;
  email: string | null;
  nextPath: string;
  locale: Locale;
  opening: string;
  openLabel: string;
  framed: string;
}) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    grantLtiAccess({ programmeId, courseId, orgCode, fullName, email });
    void fetch(`/api/lti/session?lt=${encodeURIComponent(token)}`, { credentials: "same-origin" }).finally(() => {
      setReady(true);
      if (window.top === window.self) window.location.replace(nextPath);
    });
  }, [token, programmeId, courseId, orgCode, fullName, email, nextPath]);

  return (
    <main className="container-site py-8" lang={locale} dir={dirOf(locale)}>
      <h1 className="text-2xl font-semibold text-ink">Super-Cube®</h1>
      <p className="mt-2 max-w-xl text-slate">{ready ? framed : opening}</p>
      <a className="learn-btn learn-btn-primary mt-4 inline-flex" href={nextPath} target="_blank" rel="noreferrer">
        {openLabel}
      </a>
    </main>
  );
}
