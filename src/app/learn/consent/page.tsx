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
  MINOR_AGE_BANDS,
} from "@/lib/lms/consent";
import { AGE_BANDS, findAgeBand, getProfile, type AgeBand, type LearnerProfile } from "@/lib/lms/profile";
import { loadLmsState, saveLmsState } from "@/lib/lms/store";

function safeNext(raw: string | null): string {
  return raw && raw.startsWith("/learn") && !raw.startsWith("//") ? raw : "/learn/start";
}

function ConsentPoints() {
  return (
    <ul className="mt-3 space-y-2 text-[0.8125rem] leading-relaxed text-ink">
      {CONSENT_POINTS.map((p) => (
        <li key={p.label}>
          <strong>{p.label}:</strong>{" "}
          {p.label === "Questions" ? <a href={`mailto:${p.text}`} className="underline">{p.text}</a> : p.text}
        </li>
      ))}
    </ul>
  );
}

function ConsentForm() {
  const router = useRouter();
  const search = useSearchParams();
  const next = safeNext(search.get("next"));
  const [ready, setReady] = useState(false);
  const [profile, setProfile] = useState<LearnerProfile | undefined>();
  const [already, setAlready] = useState(false);
  const [guardianName, setGuardianName] = useState("");
  const [relationship, setRelationship] = useState<string>("");
  const [guardianEmail, setGuardianEmail] = useState("");
  const [learnerEmail, setLearnerEmail] = useState("");
  const [learnerName, setLearnerName] = useState("");
  const [ageBand, setAgeBand] = useState<AgeBand | "">("");
  const [attested, setAttested] = useState(false);
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  function readLocal() {
    const s = loadLmsState();
    const p = getProfile(s);
    setProfile(p);
    setAlready(hasValidGuardianConsent(p, s.guardianConsent) && isMinorProfile(p));
    if (p?.displayName && !isMinorProfile(p)) setGuardianName((name) => name || p.displayName);
  }

  useEffect(() => {
    readLocal();
    setReady(true);
    track("page_view", { path: "/learn/consent" });
    const onUpdate = () => readLocal();
    window.addEventListener("sc-lms-update", onUpdate);
    return () => window.removeEventListener("sc-lms-update", onUpdate);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- read local consent when the page opens or sync updates it
  }, []);

  const minor = isMinorProfile(profile);
  const band = findAgeBand(profile?.ageBand);
  const canSubmit =
    guardianName.trim().length >= 2 &&
    relationship &&
    attested &&
    learnerEmail.trim().includes("@") &&
    ageBand &&
    !busy;

  async function submit() {
    if (!canSubmit || !ageBand) return;
    setBusy(true);
    setNote(null);
    try {
      const res = await fetch("/api/consent/guardian", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guardianName: guardianName.trim(),
          guardianEmail: guardianEmail.trim() || undefined,
          relationship,
          ageBand,
          learnerName: learnerName.trim() || undefined,
          learnerEmail: learnerEmail.trim(),
          attested: true,
        }),
      });
      const body = (await res.json().catch(() => ({}))) as { error?: string; message?: string };
      if (!res.ok) {
        setNote(body.message || "Consent was not recorded. Sign in as the parent or guardian, not as the learner.");
        setBusy(false);
        return;
      }
      track("guardian_consent", { ageBand, cloud: true });
      setNote("Consent is recorded. The learner can continue the next time they open Super-Cube® on their account.");
      setAttested(false);
    } catch {
      setNote("Could not reach the server. Try again when you are online.");
    }
    setBusy(false);
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

  if (!ready) {
    return <p className="learn-meta">Loading…</p>;
  }

  if (minor && already) {
    return (
      <div className="learn-card" data-testid="consent-granted">
        <p className="learn-body">
          A parent or guardian has given consent. They can withdraw it at any time.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link href={next} className="learn-btn learn-btn-primary">Continue learning</Link>
          <button type="button" className="learn-btn learn-btn-ghost" onClick={withdraw}>
            Withdraw consent
          </button>
        </div>
        {note && <p className="learn-meta mt-3" role="status">{note}</p>}
      </div>
    );
  }

  if (minor) {
    return (
      <div className="space-y-4" data-testid="consent-minor">
        <section className="learn-card">
          <p className="learn-eyebrow">For the parent or guardian</p>
          <h2 className="learn-card-title mt-1">
            Before {profile?.displayName || "your child"} starts
            {band?.label ? <span className="learn-meta"> · {band.label}</span> : null}
          </h2>
          <p className="learn-body mt-2">{CONSENT_INTRO}</p>
          <ConsentPoints />
        </section>
        <section className="learn-card">
          <p className="learn-body">
            This account is the learner’s. A parent or guardian has to record consent while signed in on their own account. The learner cannot consent for themselves.
          </p>
          <p className="learn-body mt-2">
            Sign out, sign in as the parent or guardian, open this page, and enter the learner’s account email.
          </p>
          <Link href="/login?next=/learn/consent" className="learn-btn learn-btn-primary mt-3">Sign in as the parent or guardian</Link>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-4" data-testid="consent-form">
      <section className="learn-card">
        <p className="learn-eyebrow">For the parent or guardian</p>
        <h2 className="learn-card-title mt-1">Record consent for a learner under 18</h2>
        <p className="learn-body mt-2">{CONSENT_INTRO}</p>
        <ConsentPoints />
      </section>

      <section className="learn-card space-y-3">
        <label className="block">
          <span className="learn-label">Learner’s account email</span>
          <input
            className="learn-input mt-1.5 w-full"
            type="email"
            value={learnerEmail}
            onChange={(e) => setLearnerEmail(e.target.value)}
            autoComplete="off"
            name="learnerEmail"
          />
        </label>
        <label className="block">
          <span className="learn-label">Learner’s first name or nickname (optional)</span>
          <input
            className="learn-input mt-1.5 w-full"
            value={learnerName}
            onChange={(e) => setLearnerName(e.target.value)}
            name="learnerName"
          />
        </label>
        <label className="block">
          <span className="learn-label">Learner’s age band</span>
          <select
            className="learn-input mt-1.5 w-full"
            value={ageBand}
            onChange={(e) => setAgeBand(e.target.value as AgeBand | "")}
            name="ageBand"
          >
            <option value="">Choose…</option>
            {AGE_BANDS.filter((a) => MINOR_AGE_BANDS.includes(a.id)).map((a) => (
              <option key={a.id} value={a.id}>{a.label}</option>
            ))}
          </select>
        </label>
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
          Consent version {CONSENT_TEXT_VERSION}. This only counts from the parent or guardian’s own account. We’ll only email you if you add your email address and ask us to.
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
      subtitle="Needed before a learner under 18 can use Super-Cube® Learn. Recorded by the parent or guardian, not the learner."
      hideJourneyRail
    >
      <Suspense fallback={<p className="learn-meta">Loading…</p>}>
        <ConsentForm />
      </Suspense>
    </LearnShell>
  );
}
