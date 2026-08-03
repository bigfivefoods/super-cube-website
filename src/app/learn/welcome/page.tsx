"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LearnShell } from "@/components/learn/LearnShell";
import { track } from "@/lib/analytics";
import {
  AGE_BANDS,
  COHORT_KINDS,
  CONTEXTS,
  ROLES,
  getProfile,
  profileComplete,
  saveProfile,
  type AgeBand,
  type CohortKind,
  type LearningContext,
  type LearnerRole,
} from "@/lib/lms/profile";
import { setOrgCode as saveOrgCode, unlockDemo } from "@/lib/lms/store";
import { getProgramme } from "@/lib/programmes";

type Step = 1 | 2 | 3 | 4;

export default function WelcomeProfilePage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [ageBand, setAgeBand] = useState<AgeBand | "">("");
  const [role, setRole] = useState<LearnerRole | "">("");
  const [context, setContext] = useState<LearningContext | "">("");
  const [country, setCountry] = useState("South Africa");
  const [city, setCity] = useState("");
  const [goal, setGoal] = useState("");
  const [cohortKind, setCohortKind] = useState<CohortKind>("solo");
  const [codeInput, setCodeInput] = useState("");

  useEffect(() => {
    const p = getProfile();
    if (p) {
      setDisplayName(p.displayName || "");
      setEmail(p.email || "");
      setAgeBand(p.ageBand || "");
      setRole(p.role || "");
      setContext(p.context || "");
      setCountry(p.country || "South Africa");
      setCity(p.city || "");
      setGoal(p.goal || "");
      setCohortKind(p.cohortKind || "solo");
    }
    track("page_view", { path: "/learn/welcome" });
  }, []);

  function finish() {
    if (!displayName.trim() || !ageBand || !role || !context) return;
    const band = AGE_BANDS.find((a) => a.id === ageBand)!;
    saveProfile(
      {
        displayName: displayName.trim(),
        email: email.trim() || undefined,
        ageBand,
        role,
        context,
        country: country.trim() || undefined,
        city: city.trim() || undefined,
        goal: goal.trim() || undefined,
        cohortKind,
        programmeId: band.programmeId,
      },
      { complete: true }
    );
    unlockDemo(band.programmeId);
    if (codeInput.trim()) {
      saveOrgCode(codeInput);
    }
    track("profile_complete", {
      ageBand,
      role,
      context,
      cohortKind,
      programmeId: band.programmeId,
    });
    if (cohortKind !== "solo" && !codeInput.trim()) {
      router.push("/learn/org");
      return;
    }
    router.push("/learn/start");
  }

  const programme =
    ageBand && getProgramme(AGE_BANDS.find((a) => a.id === ageBand)!.programmeId);

  return (
    <LearnShell
      title="Welcome — tell us about you"
      subtitle="A 60-second profile so Learn, Report, and your cohort fit who you are. Private on this device until you sign in."
      hideJourneyRail
    >
      <div className="mb-5 flex gap-1.5">
        {([1, 2, 3, 4] as Step[]).map((s) => (
          <div
            key={s}
            className={`h-1.5 flex-1 rounded-full ${
              s <= step ? "bg-ink" : "bg-black/[0.08]"
            }`}
          />
        ))}
      </div>

      {step === 1 && (
        <section className="learn-card space-y-4">
          <h2 className="learn-card-title">Who are you?</h2>
          <label className="block">
            <span className="learn-label">Preferred name</span>
            <input
              className="learn-input mt-1.5 w-full"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Craig"
              autoComplete="name"
            />
          </label>
          <label className="block">
            <span className="learn-label">Email (optional — for sync later)</span>
            <input
              className="learn-input mt-1.5 w-full"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com"
              autoComplete="email"
            />
          </label>
          <button
            type="button"
            disabled={!displayName.trim()}
            onClick={() => setStep(2)}
            className="learn-btn learn-btn-primary w-full disabled:opacity-40"
          >
            Continue →
          </button>
        </section>
      )}

      {step === 2 && (
        <section className="learn-card space-y-4">
          <h2 className="learn-card-title">Age & programme</h2>
          <p className="learn-meta">
            We match Kids, Adolescents, or Adults content to your age band.
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {AGE_BANDS.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => setAgeBand(a.id)}
                className={`rounded-xl border px-3 py-3 text-left text-sm font-semibold ${
                  ageBand === a.id
                    ? "border-ink bg-ink text-white"
                    : "border-black/[0.08] bg-white text-ink"
                }`}
              >
                {a.label}
              </button>
            ))}
          </div>
          {programme && (
            <p className="rounded-xl bg-[#fafafa] px-3 py-2 text-[0.8125rem] text-slate">
              Matched programme:{" "}
              <strong className="text-ink">{programme.name}</strong> (
              {programme.ageLabel})
            </p>
          )}
          <div className="flex gap-2">
            <button type="button" onClick={() => setStep(1)} className="learn-btn learn-btn-ghost">
              Back
            </button>
            <button
              type="button"
              disabled={!ageBand}
              onClick={() => setStep(3)}
              className="learn-btn learn-btn-primary flex-1 disabled:opacity-40"
            >
              Continue →
            </button>
          </div>
        </section>
      )}

      {step === 3 && (
        <section className="learn-card space-y-4">
          <h2 className="learn-card-title">Role & context</h2>
          <p className="learn-label">I am a…</p>
          <div className="flex flex-wrap gap-2">
            {ROLES.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setRole(r.id)}
                className={`rounded-full border px-3 py-1.5 text-[0.75rem] font-semibold ${
                  role === r.id
                    ? "border-ink bg-ink text-white"
                    : "border-black/[0.1] text-ink"
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
          <p className="learn-label pt-2">Learning mainly for…</p>
          <div className="flex flex-wrap gap-2">
            {CONTEXTS.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setContext(c.id)}
                className={`rounded-full border px-3 py-1.5 text-[0.75rem] font-semibold ${
                  context === c.id
                    ? "border-ink bg-ink text-white"
                    : "border-black/[0.1] text-ink"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="learn-label">Country</span>
              <input
                className="learn-input mt-1 w-full"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              />
            </label>
            <label className="block">
              <span className="learn-label">City (optional)</span>
              <input
                className="learn-input mt-1 w-full"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </label>
          </div>
          <label className="block">
            <span className="learn-label">Primary growth goal (optional)</span>
            <textarea
              className="learn-input mt-1 min-h-[4rem] w-full"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="e.g. Lead my team with more presence and clarity"
            />
          </label>
          <div className="flex gap-2">
            <button type="button" onClick={() => setStep(2)} className="learn-btn learn-btn-ghost">
              Back
            </button>
            <button
              type="button"
              disabled={!role || !context}
              onClick={() => setStep(4)}
              className="learn-btn learn-btn-primary flex-1 disabled:opacity-40"
            >
              Continue →
            </button>
          </div>
        </section>
      )}

      {step === 4 && (
        <section className="learn-card space-y-4">
          <h2 className="learn-card-title">How will you learn?</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {COHORT_KINDS.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCohortKind(c.id)}
                className={`rounded-xl border p-3 text-left ${
                  cohortKind === c.id
                    ? "border-ink bg-ink text-white"
                    : "border-black/[0.08] bg-white"
                }`}
              >
                <p className="text-sm font-semibold">{c.label}</p>
                <p
                  className={`mt-0.5 text-[0.7rem] ${
                    cohortKind === c.id ? "text-white/70" : "text-muted"
                  }`}
                >
                  {c.hint}
                </p>
              </button>
            ))}
          </div>
          {cohortKind !== "solo" && (
            <label className="block">
              <span className="learn-label">
                {cohortKind === "family"
                  ? "Family code (optional)"
                  : "Cohort / school / company code (optional)"}
              </span>
              <input
                className="learn-input mt-1.5 w-full"
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
                placeholder="e.g. DEMO2026 or FAMILY-ABC"
                maxLength={24}
              />
              <p className="learn-meta mt-1">
                You can join later from You → Cohort. Try DEMO2026 for pilots.
              </p>
            </label>
          )}
          <div className="rounded-xl border border-black/[0.06] bg-[#fafafa] p-3 text-[0.8125rem] text-slate">
            Next: create a free account to sync across devices, or continue on this
            device only.{" "}
            <Link href="/signup" className="font-semibold text-ink underline">
              Sign up
            </Link>{" "}
            ·{" "}
            <Link href="/login" className="font-semibold text-ink underline">
              Sign in
            </Link>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setStep(3)} className="learn-btn learn-btn-ghost">
              Back
            </button>
            <button type="button" onClick={finish} className="learn-btn learn-btn-primary flex-1">
              Save profile & start →
            </button>
          </div>
        </section>
      )}

      {profileComplete(getProfile()) && (
        <p className="mt-4 text-center text-sm text-muted">
          Profile already saved.{" "}
          <Link href="/learn/start" className="font-semibold text-ink underline">
            Skip to guided start
          </Link>
        </p>
      )}
    </LearnShell>
  );
}
