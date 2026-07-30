"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import { PageHero } from "@/components/ui";
import { createClient } from "@/lib/supabase/client";
import { loadLmsState, saveLmsState } from "@/lib/lms/store";

function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") || "/learn";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    if (!supabase) {
      // Local demo login
      const state = loadLmsState();
      state.user = {
        email,
        fullName: email.split("@")[0] || "Learner",
        programmeId: state.user?.programmeId || state.subscription?.programmeId,
      };
      saveLmsState(state);
      router.push(next);
      return;
    }

    const { error: err } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    router.push(next);
    router.refresh();
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto mt-10 max-w-md rounded-2xl border border-black/[0.08] bg-white p-6 sm:p-8"
    >
      <label className="block text-sm font-semibold text-ink">
        Email
        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-2 w-full rounded-lg border border-black/[0.12] bg-[#fafafa] px-4 py-3 text-sm outline-none focus:border-ink focus:bg-white"
        />
      </label>
      <label className="mt-4 block text-sm font-semibold text-ink">
        Password
        <input
          required
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-2 w-full rounded-lg border border-black/[0.12] bg-[#fafafa] px-4 py-3 text-sm outline-none focus:border-ink focus:bg-white"
        />
      </label>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="mt-6 w-full rounded-full bg-ink py-3 text-sm font-semibold text-white disabled:opacity-50"
      >
        {loading ? "Signing in…" : "Sign in"}
      </button>
      <p className="mt-4 text-center text-sm text-muted">
        No account?{" "}
        <Link href="/signup" className="font-semibold text-ink underline-offset-2 hover:underline">
          Sign up
        </Link>
      </p>
      <p className="mt-2 text-center text-xs text-muted">
        Without Supabase keys, sign-in saves a local demo session.
      </p>
    </form>
  );
}

export default function LoginPage() {
  return (
    <>
      <PageHero
        eyebrow="Account"
        title="Sign in"
        description="Access your Super-Cube® programme, assessments, courses, and report."
      />
      <section className="section-pad pt-0">
        <Suspense fallback={<p className="text-center text-muted">Loading…</p>}>
          <LoginForm />
        </Suspense>
      </section>
    </>
  );
}
