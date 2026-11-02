"use client";

import { useState } from "react";
import { useLmsT } from "@/lib/i18n/lms/use-lms-t";
import type { ProgrammeId } from "@/lib/programmes";

const FORMATS = [
  { id: "scorm12", label: "SCORM 1.2" },
  { id: "scorm2004", label: "SCORM 2004" },
  { id: "xapi", label: "xAPI (Tin Can)" },
] as const;

/** Download links for org admins. The files are built on the server. */
export function LmsPackageCard() {
  const { t } = useLmsT();
  const [programme, setProgramme] = useState<ProgrammeId>("adults");
  return (
    <section className="learn-card" aria-labelledby="lms-pack-h" data-testid="lms-packages">
      <h2 id="lms-pack-h" className="learn-card-title">{t("Load Super-Cube® in your own LMS")}</h2>
      <p className="learn-meta mt-0.5">
        {t("Download a package your learning platform can import. The course is the six Super-Cube® faces. Marking a lesson complete is reported back to the LMS.")}
      </p>
      <div className="mt-3 flex flex-wrap items-end gap-3">
        <label className="block">
          <span className="learn-eyebrow">{t("Programme")}</span>
          <select
            value={programme}
            onChange={(e) => setProgramme(e.target.value as ProgrammeId)}
            className="mt-1 block min-h-11 rounded-full border border-line-strong bg-elevated px-4 text-sm font-semibold text-ink"
          >
            <option value="adults">{t("Super-Cube® Adults")}</option>
            <option value="adolescents">{t("Super-Cube® Adolescents")}</option>
            <option value="kids">{t("Super-Cube® Kids")}</option>
          </select>
        </label>
        <div className="flex flex-wrap gap-2">
          {FORMATS.map((f) => (
            <a
              key={f.id}
              className="learn-btn learn-btn-primary"
              href={`/api/org/lms-package?format=${f.id}&programme=${programme}`}
              data-format={f.id}
            >
              {t(f.label)}
            </a>
          ))}
        </div>
      </div>
      <p className="learn-meta mt-2">{t("Issued by Super-Cube® by Big Five Group.")}</p>
    </section>
  );
}
