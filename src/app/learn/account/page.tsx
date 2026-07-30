"use client";

import { useEffect, useState } from "react";
import { LearnShell } from "@/components/learn/LearnShell";
import { Button } from "@/components/ui";
import {
  loadLmsState,
  saveLmsState,
  type LocalLmsState,
} from "@/lib/lms/store";
import { getProgramme } from "@/lib/programmes";

export default function AccountPage() {
  const [state, setState] = useState<LocalLmsState | null>(null);
  useEffect(() => setState(loadLmsState()), []);

  function clearDemo() {
    localStorage.removeItem("supercube_lms_v1");
    setState(loadLmsState());
  }

  if (!state) {
    return (
      <LearnShell title="Account">
        <p className="text-muted">Loading…</p>
      </LearnShell>
    );
  }

  const programme = state.subscription?.programmeId
    ? getProgramme(state.subscription.programmeId)
    : state.user?.programmeId
      ? getProgramme(state.user.programmeId)
      : undefined;

  return (
    <LearnShell
      title="Account"
      subtitle="Profile and subscription status. Connect Supabase + Paystack for production auth and billing."
    >
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-black/[0.08] bg-white p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-ink">Profile</h2>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-muted">Name</dt>
              <dd className="font-semibold text-ink">
                {state.user?.fullName || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-muted">Email</dt>
              <dd className="font-semibold text-ink">
                {state.user?.email || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-muted">Programme</dt>
              <dd className="font-semibold text-ink">
                {programme?.name || "Not selected"}
              </dd>
            </div>
          </dl>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button href="/login" variant="ghost">
              Sign in (Supabase)
            </Button>
            <Button href="/signup" variant="ghost">
              Create account
            </Button>
          </div>
        </section>

        <section className="rounded-2xl border border-black/[0.08] bg-white p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-ink">Subscription</h2>
          <p className="mt-3 text-sm text-slate">
            Status:{" "}
            <strong className="text-ink">
              {state.subscription?.status ?? "none"}
            </strong>
          </p>
          {state.subscription && (
            <p className="mt-1 text-sm text-muted">
              Plan {state.subscription.planId} · since{" "}
              {new Date(state.subscription.activatedAt).toLocaleDateString()}
            </p>
          )}
          <div className="mt-6 flex flex-wrap gap-3">
            <Button href="/pricing" variant="primary">
              Manage plan
            </Button>
            <button
              type="button"
              onClick={clearDemo}
              className="rounded-full border border-black/[0.12] px-5 py-2.5 text-sm font-semibold text-ink"
            >
              Reset local demo data
            </button>
          </div>
        </section>
      </div>
    </LearnShell>
  );
}
