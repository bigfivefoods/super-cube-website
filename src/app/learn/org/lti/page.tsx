"use client";

import { LearnShell } from "@/components/learn/LearnShell";
import { LtiAdmin } from "@/components/learn/LtiAdmin";
import { lti } from "@/lib/lti/copy";

export default function LtiAdminPage() {
  return (
    <LearnShell title={lti.connectTitle} subtitle={lti.connectBody} hideJourneyRail>
      <LtiAdmin />
    </LearnShell>
  );
}
