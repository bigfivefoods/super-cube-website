"use client";

import { useState, type FormEvent } from "react";
import { track } from "@/lib/analytics";

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const form = e.currentTarget;
    const data = new FormData(form);
    const payload = {
      name: String(data.get("name") || "").trim(),
      email: String(data.get("email") || "").trim(),
      organisation: String(data.get("organisation") || "").trim(),
      intent: String(data.get("interest") || "general"),
      message: String(data.get("message") || "").trim(),
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(j.error || "Could not send message");
      }
      setName(payload.name);
      setSubmitted(true);
      track("contact_submit", { intent: payload.intent });
      form.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-black/[0.08] bg-white p-8 md:p-10">
        <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted">
          Message received
        </p>
        <h2 className="heading-md mt-3 text-ink">
          Thank you{name ? `, ${name}` : ""}.
        </h2>
        <p className="mt-4 leading-relaxed text-slate">
          We’ve received your note. If you left a school or company pilot
          request, we’ll prioritise that conversation. Prefer email?{" "}
          <a
            href="mailto:hello@super-cube.me"
            className="font-semibold text-ink underline-offset-2 hover:underline"
          >
            hello@super-cube.me
          </a>
        </p>
        <button
          type="button"
          onClick={() => setSubmitted(false)}
          className="mt-6 text-sm font-semibold text-ink underline-offset-4 hover:underline"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-black/[0.08] bg-white p-6 md:p-8"
      noValidate={false}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block sm:col-span-1">
          <span className="text-sm font-semibold text-ink">Name</span>
          <input
            required
            name="name"
            type="text"
            autoComplete="name"
            className="mt-2 w-full rounded-lg border border-black/[0.12] bg-[#fafafa] px-4 py-3 text-sm text-ink outline-none transition focus:border-ink focus:bg-white focus:ring-1 focus:ring-ink"
            placeholder="Your name"
          />
        </label>
        <label className="block sm:col-span-1">
          <span className="text-sm font-semibold text-ink">Email</span>
          <input
            required
            name="email"
            type="email"
            autoComplete="email"
            className="mt-2 w-full rounded-lg border border-black/[0.12] bg-[#fafafa] px-4 py-3 text-sm text-ink outline-none transition focus:border-ink focus:bg-white focus:ring-1 focus:ring-ink"
            placeholder="you@organisation.com"
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="text-sm font-semibold text-ink">Organisation</span>
          <input
            name="organisation"
            type="text"
            autoComplete="organization"
            className="mt-2 w-full rounded-lg border border-black/[0.12] bg-[#fafafa] px-4 py-3 text-sm text-ink outline-none transition focus:border-ink focus:bg-white focus:ring-1 focus:ring-ink"
            placeholder="Optional — school, company, or network"
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="text-sm font-semibold text-ink">Interest</span>
          <select
            name="interest"
            className="mt-2 w-full rounded-lg border border-black/[0.12] bg-[#fafafa] px-4 py-3 text-sm text-ink outline-none transition focus:border-ink focus:bg-white focus:ring-1 focus:ring-ink"
            defaultValue="personal"
          >
            <option value="personal">Personal Super-Cube® plan</option>
            <option value="pipeline">Organisational leadership pipeline</option>
            <option value="school">School / youth pilot</option>
            <option value="network">Network / alliance programme</option>
            <option value="research">Research partnership</option>
            <option value="other">Something else</option>
          </select>
        </label>
        <label className="block sm:col-span-2">
          <span className="text-sm font-semibold text-ink">Message</span>
          <textarea
            required
            name="message"
            rows={5}
            className="mt-2 w-full resize-y rounded-lg border border-black/[0.12] bg-[#fafafa] px-4 py-3 text-sm text-ink outline-none transition focus:border-ink focus:bg-white focus:ring-1 focus:ring-ink"
            placeholder="Tell us about your context and goals…"
          />
        </label>
      </div>
      {error && (
        <p className="mt-4 text-sm font-medium text-red-700" role="alert">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="mt-6 w-full rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-ink-soft disabled:opacity-60 sm:w-auto"
      >
        {loading ? "Sending…" : "Send message"}
      </button>
      <p className="mt-4 text-xs text-muted">
        By submitting, you agree we may contact you about Super-Cube® programmes
        and resources.
      </p>
    </form>
  );
}
