"use client";

import Link from "next/link";
import { useLmsT } from "@/lib/i18n/lms/use-lms-t";
import { LTI_GUIDE, lti } from "@/lib/lti/copy";

/** Corporate administrator guide for LTI 1.3 and LTI Advantage. */
export function LtiGuide() {
  const { t, L } = useLmsT();
  return (
    <article className="space-y-4">
      {LTI_GUIDE.map((section) => (
        <section key={section.heading} className="learn-card">
          <h2 className="learn-card-title">{t(section.heading)}</h2>
          {section.body.map((paragraph) => (
            <p key={paragraph} className="learn-body mt-2">{t(paragraph)}</p>
          ))}
        </section>
      ))}
      <p className="learn-meta">{t(lti.issuerLine)}</p>
      <p>
        <Link href={L("/learn/org/lti")} className="font-semibold text-ink underline underline-offset-2">
          {t(lti.backTo)}
        </Link>
      </p>
    </article>
  );
}
