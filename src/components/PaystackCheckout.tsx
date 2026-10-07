"use client";

import { useEffect, useState } from "react";
import { track } from "@/lib/analytics";
import {
  COURSE_PRICE_USD,
  COURSE_PRICE_ZAR,
  formatCoursePrice,
  type ProgrammeId,
} from "@/lib/programmes";
import { loadLmsState, saveLmsState } from "@/lib/lms/store";
import { CHECKOUT_FORM_EN, type CheckoutFormStrings } from "@/lib/i18n/pages/checkout-form";
import { fill } from "@/lib/i18n/pages/format";

type Props = {
  programmeId: ProgrammeId;
  programmeName: string;
  className?: string;
  /** Label for primary button */
  label?: string;
  onDemoFallback?: () => void;
  /** Form labels in the page language (pricing passes them); English by default. */
  strings?: Partial<CheckoutFormStrings>;
};

/**
 * Email capture + Paystack redirect checkout.
 * Falls back to demo only when Paystack is not configured (and parent provides onDemoFallback).
 */
export function PaystackCheckout({
  programmeId,
  programmeName,
  className = "",
  label,
  onDemoFallback,
  strings,
}: Props) {
  const t = { ...CHECKOUT_FORM_EN, ...strings };
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [configured, setConfigured] = useState<boolean | null>(null);
  const [currency, setCurrency] = useState<"ZAR" | "USD">("ZAR");

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
        if (d.currency === "USD" || d.currency === "ZAR") {
          setCurrency(d.currency);
        }
      })
      .catch(() => setConfigured(false));
  }, []);

  async function pay() {
    setError(null);
    const cleanEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError(t.invalidEmail);
      return;
    }

    setBusy(true);
    track("checkout_start", { programmeId, currency });

    // Persist email for verify callback
    const state = loadLmsState();
    state.user = {
      email: cleanEmail,
      fullName: name.trim() || state.user?.fullName || "Learner",
      programmeId,
    };
    saveLmsState(state);
    try {
      localStorage.setItem("sc_checkout_email", cleanEmail);
      localStorage.setItem("sc_checkout_programme", programmeId);
    } catch {
      /* ignore */
    }

    try {
      const res = await fetch("/api/paystack/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          programmeId,
          planId: `${programmeId}_once`,
          email: cleanEmail,
          fullName: name.trim() || undefined,
        }),
      });
      const data = await res.json();

      if (data.authorization_url) {
        track("programme_selected", {
          programmeId,
          mode: "paystack",
          reference: data.reference,
        });
        window.location.href = data.authorization_url;
        return;
      }

      if (data.demo || data.configured === false) {
        setError(
          // the server's English message only on English pages
          (strings ? t.unavailableShort : data.message || t.unavailableShort),
        );
        if (onDemoFallback) {
          // Don't auto-start demo — let user choose
        }
        setBusy(false);
        return;
      }

      setError(strings ? t.couldNotStart : data.error || t.couldNotStart);
      setBusy(false);
    } catch {
      setError(t.network);
      setBusy(false);
    }
  }

  const priceLabel =
    currency === "USD" ? `$${COURSE_PRICE_USD} USD` : formatCoursePrice("ZAR");

  return (
    <div className={`space-y-3 ${className}`}>
      <div>
        <label className="block text-[0.75rem] font-semibold text-muted">
          {t.email}
        </label>
        <input
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t.emailPlaceholder}
          className="mt-1 w-full rounded-xl border border-line-strong bg-surface px-3 py-2.5 text-sm text-ink outline-none focus:border-ink/40"
        />
      </div>
      <div>
        <label className="block text-[0.75rem] font-semibold text-muted">
          {t.name}
        </label>
        <input
          type="text"
          autoComplete="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t.namePlaceholder}
          className="mt-1 w-full rounded-xl border border-line-strong bg-surface px-3 py-2.5 text-sm text-ink outline-none focus:border-ink/40"
        />
      </div>

      <button
        type="button"
        disabled={busy}
        onClick={() => void pay()}
        className="flex min-h-11 w-full items-center justify-center rounded-full sc-btn-primary px-4 py-2.5 text-sm font-semibold hover:opacity-90 disabled:opacity-50"
      >
        {busy ? t.redirecting : label || fill(t.pay, { price: priceLabel, programme: programmeName })}
      </button>

      {configured === false && (
        <p className="text-[0.7rem] leading-relaxed text-amber-800">
          {t.unavailable}
        </p>
      )}
      {configured === true && (
        <p className="text-[0.7rem] leading-relaxed text-muted">
          {fill(t.secure, {
            price: currency === "ZAR" ? `R${COURSE_PRICE_ZAR}` : `$${COURSE_PRICE_USD}`,
          })}
        </p>
      )}
      {error && (
        <p className="text-[0.75rem] font-medium leading-relaxed text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
