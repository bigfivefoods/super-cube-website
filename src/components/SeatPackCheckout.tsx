"use client";

import { useEffect, useState } from "react";
import { track } from "@/lib/analytics";
import {
  SEAT_PACKS,
  formatSeatPackPrice,
  type SeatPackId,
} from "@/lib/seat-packs";
import { loadLmsState, saveLmsState } from "@/lib/lms/store";
import type { ProgrammeId } from "@/lib/programmes";
import { programmes } from "@/lib/programmes";

export function SeatPackCheckout({ className = "" }: { className?: string }) {
  const [packId, setPackId] = useState<SeatPackId>("seats_20");
  const [programmeId, setProgrammeId] = useState<ProgrammeId>("adults");
  const [orgName, setOrgName] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [currency, setCurrency] = useState<"ZAR" | "USD">("ZAR");

  const pack = SEAT_PACKS.find((p) => p.id === packId)!;

  useEffect(() => {
    const s = loadLmsState();
    if (s.user?.email && !s.user.email.includes("@demo.")) {
      setEmail(s.user.email);
    }
    if (s.user?.fullName && s.user.fullName !== "Demo Learner") {
      setName(s.user.fullName);
    }
    void fetch("/api/paystack/initialize")
      .then((r) => r.json())
      .then((d) => {
        setConfigured(Boolean(d.configured));
        if (d.currency === "USD" || d.currency === "ZAR") setCurrency(d.currency);
      })
      .catch(() => setConfigured(false));
  }, []);

  async function pay() {
    setError(null);
    const cleanEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError("Enter a valid email for receipts and cohort ownership.");
      return;
    }
    if (!orgName.trim()) {
      setError("Enter your school or company name.");
      return;
    }

    setBusy(true);
    track("checkout_start", {
      mode: "seat_pack",
      packId,
      seats: pack.seats,
      programmeId,
      currency,
    });

    const state = loadLmsState();
    state.user = {
      email: cleanEmail,
      fullName: name.trim() || state.user?.fullName || "Coach",
      programmeId,
    };
    saveLmsState(state);
    try {
      localStorage.setItem("sc_checkout_email", cleanEmail);
      localStorage.setItem("sc_checkout_programme", programmeId);
      localStorage.setItem("sc_checkout_pack", packId);
      localStorage.setItem("sc_checkout_org", orgName.trim());
    } catch {
      /* ignore */
    }

    try {
      const res = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productType: "seat_pack",
          packId,
          programmeId,
          orgName: orgName.trim(),
          email: cleanEmail,
          fullName: name.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (data.authorization_url) {
        window.location.href = data.authorization_url;
        return;
      }
      setError(
        data.error ||
          data.message ||
          "Checkout could not start. Configure Paystack or try again."
      );
      setBusy(false);
    } catch {
      setError("Network error. Try again.");
      setBusy(false);
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="grid gap-2 sm:grid-cols-3">
        {SEAT_PACKS.map((p) => {
          const selected = p.id === packId;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setPackId(p.id)}
              className={`rounded-2xl border px-3 py-3 text-left transition ${
                selected
                  ? "border-ink bg-ink text-white"
                  : "border-black/[0.1] bg-white text-ink hover:border-black/25"
              }`}
            >
              {p.popular && (
                <span
                  className={`text-[0.6rem] font-semibold uppercase tracking-wider ${
                    selected ? "text-white/60" : "text-muted"
                  }`}
                >
                  Popular
                </span>
              )}
              <p className="text-sm font-semibold">{p.label}</p>
              <p
                className={`mt-0.5 text-[0.7rem] ${
                  selected ? "text-white/70" : "text-muted"
                }`}
              >
                {p.blurb}
              </p>
              <p className="mt-2 text-base font-semibold">
                {formatSeatPackPrice(p, currency)}
              </p>
            </button>
          );
        })}
      </div>

      <div>
        <label className="block text-[0.75rem] font-semibold text-muted">
          School / company name
        </label>
        <input
          value={orgName}
          onChange={(e) => setOrgName(e.target.value)}
          placeholder="e.g. Greenfield High · Acme L&D"
          className="mt-1 w-full rounded-xl border border-black/[0.1] bg-[#fafafa] px-3 py-2.5 text-sm outline-none focus:border-ink/40"
        />
      </div>

      <div>
        <label className="block text-[0.75rem] font-semibold text-muted">
          Default programme for learners
        </label>
        <select
          value={programmeId}
          onChange={(e) => setProgrammeId(e.target.value as ProgrammeId)}
          className="mt-1 w-full rounded-xl border border-black/[0.1] bg-[#fafafa] px-3 py-2.5 text-sm outline-none focus:border-ink/40"
        >
          {programmes.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} · {p.ageLabel}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-[0.75rem] font-semibold text-muted">
            Coach email (required)
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@school.co.za"
            className="mt-1 w-full rounded-xl border border-black/[0.1] bg-[#fafafa] px-3 py-2.5 text-sm outline-none focus:border-ink/40"
          />
        </div>
        <div>
          <label className="block text-[0.75rem] font-semibold text-muted">
            Your name
          </label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Facilitator name"
            className="mt-1 w-full rounded-xl border border-black/[0.1] bg-[#fafafa] px-3 py-2.5 text-sm outline-none focus:border-ink/40"
          />
        </div>
      </div>

      <p className="text-[0.75rem] leading-relaxed text-slate">
        After payment we create a <strong className="text-ink">cohort code</strong>{" "}
        automatically. Sign up / sign in with the same email first so we can
        attach admin rights. Learners join via Learn → Org. Journals stay private;
        coaches only see scores when learners consent.
      </p>

      <button
        type="button"
        disabled={busy}
        onClick={() => void pay()}
        className="flex min-h-12 w-full items-center justify-center rounded-full bg-ink px-4 text-sm font-semibold text-white hover:bg-ink-soft disabled:opacity-50"
      >
        {busy
          ? "Redirecting to Paystack…"
          : `Pay ${formatSeatPackPrice(pack, currency)} · ${pack.seats} seats`}
      </button>

      {configured === false && (
        <p className="text-[0.7rem] text-amber-800">
          Paystack keys not configured on this deployment yet.
        </p>
      )}
      {error && (
        <p className="text-[0.75rem] font-medium text-red-700">{error}</p>
      )}
    </div>
  );
}
