"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { PageHero } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";
import { loadLmsState, saveLmsState } from "@/lib/lms/store";
import { programmes, type ProgrammeId } from "@/lib/programmes";

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [programmeId, setProgrammeId] = useState<ProgrammeId>("adults");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const supabase = createClient();
    if (!supabase) {
      const state = loadLmsState();
      state.user = { email, fullName, programmeId };
      saveLmsState(state);
      router.push("/pricing");
      return;
    }

    const { data, error: err } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, programme_id: programmeId },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (err) {
      setLoading(false);
      setError(err.message);
      return;
    }
    // Seed local + cloud with programme choice
    const state = loadLmsState();
    state.user = { email, fullName, programmeId };
    saveLmsState(state);
    if (data.session) {
      try {
        const { syncLearnerState } = await import("@/lib/lms/sync");
        await syncLearnerState(supabase);
      } catch {
        /* ok */
      }
    }
    setLoading(false);
    setMessage("Check your email to confirm, or continue to pricing.");
    router.push("/pricing");
  }

  return (
    <>
      <PageHero
        eyebrow="Account"
        title="Create your account"
        description="Choose your age programme, then subscribe to unlock learning."
      />
      <section className="section-pad pt-0">
        <form
          onSubmit={onSubmit}
          className="mx-auto max-w-md rounded-2xl border border-black/[0.08] bg-white p-6 sm:p-8"
        >
          <label className="block text-sm font-semibold text-ink">
            Full name
            <input
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-2 w-full rounded-lg border border-black/[0.12] bg-[#fafafa] px-4 py-3 text-sm outline-none focus:border-ink"
            />
          </label>
          <label className="mt-4 block text-sm font-semibold text-ink">
            Email
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full rounded-lg border border-black/[0.12] bg-[#fafafa] px-4 py-3 text-sm outline-none focus:border-ink"
            />
          </label>
          <label className="mt-4 block text-sm font-semibold text-ink">
            Password
            <input
              required
              type="password"
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full rounded-lg border border-black/[0.12] bg-[#fafafa] px-4 py-3 text-sm outline-none focus:border-ink"
            />
          </label>
          <label className="mt-4 block text-sm font-semibold text-ink">
            Programme
            <select
              value={programmeId}
              onChange={(e) => setProgrammeId(e.target.value as ProgrammeId)}
              className="mt-2 w-full rounded-lg border border-black/[0.12] bg-[#fafafa] px-4 py-3 text-sm outline-none focus:border-ink"
            >
              {programmes.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.ageLabel})
                </option>
              ))}
            </select>
          </label>
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
          {message && <p className="mt-3 text-sm text-green-700">{message}</p>}
          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-full bg-ink py-3 text-sm font-semibold text-white disabled:opacity-50"
          >
            {loading ? "Creating…" : "Create account"}
          </button>
          <p className="mt-4 text-center text-sm text-muted">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-ink underline-offset-2 hover:underline">
              Sign in
            </Link>
          </p>
        </form>
      </section>
    </>
  );
}
