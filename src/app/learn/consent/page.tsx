"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { LearnShell } from "@/components/learn/LearnShell";
import { track } from "@/lib/analytics";
import {
  CONSENT_CHECKBOX_TEXT,
  CONSENT_INTRO,
  CONSENT_POINTS,
  CONSENT_TEXT_VERSION,
  GUARDIAN_RELATIONSHIPS,
  hasValidGuardianConsent,
  isMinorProfile,
} from "@/lib/lms/consent";
import { findAgeBand, getProfile, type LearnerProfile } from "@/lib/lms/profile";
import { loadLmsState, saveLmsState } from "@/lib/lms/store";

function safeNext(raw: string | null): string {
  return raw && raw.startsWith("/learn") && !raw.startsWith("//") ? raw : "/learn/start";
}

function ConsentForm() {
  const router = useRouter();
  const search = useSearchParams();
  const next = safeNext(search.get("next"));
  const [profile, setProfile] = useState<LearnerProfile | undefined>();
  const [already, setAlready] = useState(false);
  const [guardianName, setGuardianName] = useState("");
  const [relationship, setRelationship] = useState<string>("");
  const [guardianEmail, setGuardianEmail] = useState("");
  const [attested, setAttested] = useState(false);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => {
    const s = loadLmsState();
    const p = getProfile(s);
    setProfile(p);
    setAlready(hasValidGuardianConsent(p, s.guardianConsent) && isMinorProfile(p));
    track("page_view", { path: "/learn/consent" });
  }, []);

  const band = findAgeBand(profile?.ageBand);
  const canSubmit = guardianName.trim().length >= 2 && relationship && attested && !busy;

  async function submit() {
    if (!canSubmit || !profile?.ageBand) return;
    setBusy(true);
    setNote(null);
    const record = {
      guardianName: guardianName.trim(),
      guardianEmail: guardianEmail.trim() || undefined,
      relationship,
      ageBand: profile.ageBand,
      textVersion: CONSENT_TEXT_VERSION,
      grantedAt: new Date().toISOString(),
      method: "on_device_attestation" as const,
      cloudSaved: false,
    };
    try {
      const res = await fetch("/api/consent/guardian", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guardianName: record.guardianName,
          guardianEmail: record.guardianEmail,
          relationship,
          ageBand: profile.ageBand,
          learnerName: profile.displayName,
          attested: true,
        }),
      });
      record.cloudSaved = res.ok;
    } catch {
      record.cloudSaved = false;
    }
    const s = loadLmsState();
    s.guardianConsent = record;
    saveLmsState(s);
    track("guardian_consent", { ageBand: profile.ageBand, cloud: record.cloudSaved });
    setBusy(false);
    router.push(next);
  }

  function withdraw() {
    const s = loadLmsState();
    delete s.guardianConsent;
    saveLmsState(s);
    void fetch("/api/consent/guardian", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ withdraw: true }),
    }).catch(() => undefined);
    setAlready(false);
    setNote("Consent withdrawn. Learning is paused until a parent or guardian consents again. To erase all data, use Delete my data on the You page.");
  }

  if (!profile) {
    return <p className="learn-meta">Loading…</p>;
  }

  if (!isMinorProfile(profile)) {
    return (
      <div className="learn-card">
        <p className="learn-body">Guardian consent is only needed for learners under 18.</p>
        <Link href={next} className="learn-btn learn-btn-primary mt-3">Continue</Link>
      </div>
    );
  }

  if (already) {
    return (
      <div className="learn-card" data-testid="consent-granted">
        <p className="learn-body">
          A parent or guardian has given consent on this device. They can withdraw it at any time.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link href={next} className="learn-btn learn-btn-primary">Continue learning</Link>
          <button type="button" className="learn-btn learn-btn-ghost" onClick={withdraw}>
            Withdraw consent
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="consent-form">
      <section className="learn-card">
        <p className="learn-eyebrow">For the parent or guardian</p>
        <h2 className="learn-card-title mt-1">
          Before {profile.displayName || "your child"} starts
          {band?.label ? <span className="learn-meta"> · {band.label}</span> : null}
        </h2>
        <p className="learn-body mt-2">{CONSENT_INTRO}</p>
        <ul className="mt-3 space-y-2 text-[0.8125rem] leading-relaxed text-ink">
          {CONSENT_POINTS.map((p) => (
            <li key={p.label}>
              <strong>{p.label}:</strong>{" "}
              {p.label === "Questions" ? <a href={`mailto:${p.text}`} className="underline">{p.text}</a> : p.text}
            </li>
          ))}
        </ul>
      </section>

      <section className="learn-card space-y-3">
        <label className="block">
          <span className="learn-label">Your full name (parent or guardian)</span>
          <input
            className="learn-input mt-1.5 w-full"
            value={guardianName}
            onChange={(e) => setGuardianName(e.target.value)}
            autoComplete="name"
            name="guardianName"
          />
        </label>
        <label className="block">
          <span className="learn-label">Relationship to the learner</span>
          <select
            className="learn-input mt-1.5 w-full"
            value={relationship}
            onChange={(e) => setRelationship(e.target.value)}
            name="relationship"
          >
            <option value="">Choose…</option>
            {GUARDIAN_RELATIONSHIPS.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="learn-label">Your email (optional, so we can help if you ask us to delete or correct data)</span>
          <input
            className="learn-input mt-1.5 w-full"
            type="email"
            value={guardianEmail}
            onChange={(e) => setGuardianEmail(e.target.value)}
            autoComplete="email"
            name="guardianEmail"
          />
        </label>
        <label className="flex items-start gap-2 text-[0.8125rem] leading-relaxed text-ink">
          <input
            type="checkbox"
            className="mt-1"
            checked={attested}
            onChange={(e) => setAttested(e.target.checked)}
            name="attested"
          />
          <span>{CONSENT_CHECKBOX_TEXT}</span>
        </label>
        <button
          type="button"
          className="learn-btn learn-btn-primary disabled:opacity-40"
          disabled={!canSubmit}
          onClick={() => void submit()}
        >
          {busy ? "Saving…" : "I consent · continue"}
        </button>
        <p className="learn-meta">
          Consent version {CONSENT_TEXT_VERSION}. We&apos;ll only email you if you add your email address and ask us to.
        </p>
      </section>
      {note && <p className="learn-meta" role="status">{note}</p>}
    </div>
  );
}

export default function GuardianConsentPage() {
  return (
    <LearnShell
      title="Parent or guardian consent"
      subtitle="Needed before a learner under 18 can use Super-Cube® Learn."
      hideJourneyRail
    >
      <Suspense fallback={<p className="learn-meta">Loading…</p>}>
        <ConsentForm />
      </Suspense>
    </LearnShell>
  );
}
