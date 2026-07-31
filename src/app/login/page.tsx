"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useMemo, useState } from "react";
import { constructs } from "@/lib/content";
import { createClient } from "@/lib/supabase/client";
import { isSupabaseConfigured, loadLmsState, saveLmsState } from "@/lib/lms/store";

const rainbow = constructs.map((c) => c.color).join(", ");

function destinationLabel(next: string): string {
  if (next.startsWith("/learn/report")) return "your growth report";
  if (next.startsWith("/learn/courses")) return "your courses";
  if (next.startsWith("/learn/assessment")) return "assessment";
  if (next.startsWith("/learn/account")) return "your account";
  if (next.startsWith("/learn")) return "Super-Cube® Learn";
  if (next.startsWith("/pricing")) return "plans & pricing";
  return "your account";
}

function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") || "/learn";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const cloudReady = isSupabaseConfigured();

  const whereTo = useMemo(() => destinationLabel(next), [next]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    if (!supabase) {
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
    if (err) {
      setLoading(false);
      setError(
        err.message === "Invalid login credentials"
          ? "Email or password is incorrect. Try again, or create an account."
          : err.message
      );
      return;
    }
    try {
      const { syncLearnerState } = await import("@/lib/lms/sync");
      await syncLearnerState(supabase);
    } catch {
      /* continue even if sync table missing */
    }
    setLoading(false);
    router.push(next);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <div>
        <label htmlFor="login-email" className="block text-[0.8125rem] font-semibold text-ink">
          Email
        </label>
        <input
          id="login-email"
          required
          type="email"
          autoComplete="email"
          inputMode="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@organisation.com"
          className="mt-1.5 w-full rounded-xl border border-black/[0.1] bg-[#fafafa] px-4 py-3 text-[0.9375rem] text-ink outline-none transition placeholder:text-muted/80 focus:border-ink focus:bg-white focus:ring-2 focus:ring-ink/10"
        />
      </div>

      <div>
        <div className="flex items-center justify-between gap-2">
          <label
            htmlFor="login-password"
            className="block text-[0.8125rem] font-semibold text-ink"
          >
            Password
          </label>
        </div>
        <div className="relative mt-1.5">
          <input
            id="login-password"
            required
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Your password"
            className="w-full rounded-xl border border-black/[0.1] bg-[#fafafa] px-4 py-3 pr-12 text-[0.9375rem] text-ink outline-none transition placeholder:text-muted/80 focus:border-ink focus:bg-white focus:ring-2 focus:ring-ink/10"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute inset-y-0 right-0 flex items-center px-3.5 text-[0.75rem] font-semibold text-muted transition hover:text-ink"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-[0.8125rem] leading-relaxed text-red-800"
        >
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="flex w-full min-h-12 items-center justify-center rounded-full bg-ink px-5 text-sm font-semibold text-white transition hover:bg-ink-soft disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? (
          <span className="inline-flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            Signing in…
          </span>
        ) : (
          "Sign in →"
        )}
      </button>

      <p className="text-center text-[0.8125rem] text-slate">
        No account yet?{" "}
        <Link
          href={`/signup${next !== "/learn" ? `?next=${encodeURIComponent(next)}` : ""}`}
          className="font-semibold text-ink underline-offset-2 hover:underline"
        >
          Create one free
        </Link>
      </p>

      <div className="rounded-xl border border-black/[0.06] bg-[#f8f9fb] px-3.5 py-3 text-center text-[0.7rem] leading-relaxed text-muted">
        {cloudReady ? (
          <>
            Signed-in progress syncs across devices via Supabase—lessons,
            assessments, and your journal.
          </>
        ) : (
          <>
            Demo mode: sign-in saves a local session on this device. Add Supabase
            keys for cloud sync.
          </>
        )}
      </div>

      <p className="text-center text-[0.7rem] text-muted">
        After sign-in you&apos;ll continue to{" "}
        <span className="font-medium text-slate">{whereTo}</span>.
      </p>
    </form>
  );
}

function LoginShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-[calc(100svh-3.5rem)] bg-[#fafafa] md:min-h-[calc(100svh-4rem)]">
      {/* Soft brand wash */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-40 opacity-40"
        style={{
          background: `linear-gradient(180deg, rgba(10,10,10,0.04), transparent)`,
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-1"
        style={{ background: `linear-gradient(90deg, ${rainbow})` }}
        aria-hidden
      />

      <div className="container-site relative grid gap-8 py-10 sm:py-12 lg:grid-cols-2 lg:items-stretch lg:gap-0 lg:py-16">
        {/* Brand / value panel */}
        <aside className="flex flex-col justify-between overflow-hidden rounded-3xl border border-black/[0.07] bg-ink p-7 text-white shadow-[0_20px_50px_-28px_rgba(0,0,0,0.45)] sm:p-9 lg:rounded-r-none lg:border-r-0">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 text-white/90 transition hover:text-white"
            >
              <Image
                src="/brand/logo.png"
                alt=""
                width={36}
                height={36}
                className="h-9 w-9 object-contain brightness-0 invert"
                priority
              />
              <span className="text-[0.95rem] font-semibold tracking-tight">
                Super-Cube
                <span className="text-white/45">®</span>
              </span>
            </Link>

            <p className="mt-8 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-white/45">
              Welcome back
            </p>
            <h1 className="mt-2 text-[1.75rem] font-semibold leading-[1.15] tracking-tight sm:text-[2rem]">
              Sign in to your leadership pathway.
            </h1>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-white/65 sm:text-[0.9375rem]">
              Pick up where you left off—orient, assess, develop the six faces,
              re-measure, and see real growth.
            </p>

            <ul className="mt-8 space-y-3">
              {[
                {
                  t: "Cloud progress",
                  d: "Sync lessons, assessments, and reflections across devices.",
                },
                {
                  t: "Growth evidence",
                  d: "Pre → post scores, dual radar, PDF report & certificate.",
                },
                {
                  t: "Six faces of leadership",
                  d: "Choices · Principles · Mental · Emotional · Physical · Spiritual.",
                },
              ].map((item) => (
                <li key={item.t} className="flex gap-3">
                  <span
                    className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-white/80"
                    aria-hidden
                  />
                  <div>
                    <p className="text-[0.8125rem] font-semibold text-white">
                      {item.t}
                    </p>
                    <p className="mt-0.5 text-[0.75rem] leading-relaxed text-white/55">
                      {item.d}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-10 border-t border-white/10 pt-5">
            <div className="flex flex-wrap gap-1.5">
              {constructs.map((c) => (
                <span
                  key={c.id}
                  className="rounded-full px-2 py-0.5 text-[0.6rem] font-semibold text-white/90"
                  style={{ background: `${c.color}` }}
                >
                  {c.shortName}
                </span>
              ))}
            </div>
            <p className="mt-3 text-[0.7rem] text-white/40">
              Human-centric leadership · Super-Cube® Learn
            </p>
          </div>
        </aside>

        {/* Form panel */}
        <div className="flex flex-col justify-center rounded-3xl border border-black/[0.07] border-t-0 bg-white p-7 shadow-[0_12px_40px_-24px_rgba(0,0,0,0.2)] sm:p-9 lg:rounded-l-none lg:border-t lg:border-l-0">
          <div className="mb-7 lg:hidden">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-muted">
              Account
            </p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight text-ink">
              Sign in
            </h2>
          </div>
          <div className="mb-7 hidden lg:block">
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-muted">
              Secure access
            </p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight text-ink sm:text-2xl">
              Enter your details
            </h2>
            <p className="mt-1.5 text-sm text-slate">
              Use the email and password for your Super-Cube® account.
            </p>
          </div>

          {children}

          <p className="mt-8 text-center text-[0.7rem] text-muted">
            <Link href="/" className="font-medium hover:text-ink hover:underline">
              ← Back to site
            </Link>
            <span className="mx-2 text-black/15">·</span>
            <Link
              href="/learn"
              className="font-medium hover:text-ink hover:underline"
            >
              Browse Learn
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <LoginShell>
      <Suspense
        fallback={
          <div className="space-y-4">
            <div className="h-12 animate-pulse rounded-xl bg-black/[0.05]" />
            <div className="h-12 animate-pulse rounded-xl bg-black/[0.05]" />
            <div className="h-12 animate-pulse rounded-full bg-black/[0.08]" />
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </LoginShell>
  );
}
