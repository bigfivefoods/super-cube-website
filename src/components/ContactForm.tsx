"use client";

import { useState, type FormEvent } from "react";

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState("");

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    setName(String(data.get("name") || "").trim());
    setSubmitted(true);
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
          This demo form captures your interest locally. In production, wire
          this endpoint to your CRM or email service. We look forward to
          exploring Super-Cube® development with you.
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
            placeholder="Optional"
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
      <button
        type="submit"
        className="mt-6 w-full rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white transition hover:bg-ink-soft sm:w-auto"
      >
        Send message
      </button>
      <p className="mt-4 text-xs text-muted">
        By submitting, you agree we may contact you about Super-Cube® programmes
        and resources.
      </p>
    </form>
  );
}
