"use client";

import { LearnShell } from "@/components/learn/LearnShell";
import { LtiGuide } from "@/components/learn/LtiGuide";
import { lti } from "@/lib/lti/copy";

export default function LtiGuidePage() {
  return (
    <LearnShell title={lti.guideTitle} subtitle={lti.guideIntro} hideJourneyRail>
      <LtiGuide />
    </LearnShell>
  );
}
