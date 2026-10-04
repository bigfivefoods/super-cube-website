"use client";

import { useId, useState, type FormEvent } from "react";
import { track } from "@/lib/analytics";

export type EnquiryField = {
  name: string;
  label: string;
  type?: "text" | "email" | "number" | "date" | "select" | "textarea";
  required?: boolean;
  options?: string[];
  placeholder?: string;
  autoComplete?: string;
};

const inputCls =
  "mt-1.5 w-full rounded-lg border border-line-strong bg-surface px-4 py-3 text-sm text-ink outline-none transition focus:border-ink focus:bg-elevated focus:ring-1 focus:ring-ink";

/**
 * Generic enquiry form (request a quote, keynote booking). Posts to
 * /api/contact with an intent; extra fields are folded into the message.
 * The API only logs on preview deployments (never forwards).
 */
export function EnquiryForm({
  intent,
  source,
  fields,
  submitLabel,
  thanks = "Thank you. We’ll be in touch within two working days.",
  className = "",
}: {
  intent: string;
  source: string;
  fields: EnquiryField[];
  submitLabel: string;
  thanks?: string;
  className?: string;
}) {
  const id = useId();
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    const data = new FormData(form);
    const get = (k: string) => String(data.get(k) || "").trim();
    const extra = fields
      .filter((f) => !["name", "email", "organisation", "message"].includes(f.name))
      .map((f) => `${f.label}: ${get(f.name) || "—"}`)
      .join("\n");
    const message = [extra, get("message")].filter(Boolean).join("\n\n");
    setBusy(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: get("name"),
          email: get("email"),
          organisation: get("organisation"),
          message: message || "(no message)",
          intent,
          source,
          website: get("website"),
        }),
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(j.error || "Could not send. Please try again.");
      }
      setSent(true);
      track("contact_submit", { intent });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  if (sent) {
    return (
      <div className={`sc-card p-6 ${className}`} role="status">
        <p className="text-lg font-semibold tracking-tight text-ink">Request received.</p>
        <p className="mt-2 text-sm text-slate">{thanks}</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className={`grid gap-4 sc-card p-5 sm:grid-cols-2 sm:p-6 ${className}`}
    >
      {fields.map((f) => {
        const fid = `${id}-${f.name}`;
        const wide = f.type === "textarea";
        return (
          <div key={f.name} className={wide ? "sm:col-span-2" : ""}>
            <label htmlFor={fid} className="text-sm font-medium text-ink">
              {f.label}
              {f.required ? "" : <span className="font-normal text-muted"> (optional)</span>}
            </label>
            {f.type === "textarea" ? (
              <textarea
                id={fid}
                name={f.name}
                rows={4}
                required={f.required}
                placeholder={f.placeholder}
                className={inputCls}
              />
            ) : f.type === "select" ? (
              <select id={fid} name={f.name} required={f.required} className={inputCls} defaultValue="">
                <option value="" disabled>
                  Choose…
                </option>
                {f.options?.map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            ) : (
              <input
                id={fid}
                name={f.name}
                type={f.type || "text"}
                required={f.required}
                placeholder={f.placeholder}
                autoComplete={f.autoComplete}
                min={f.type === "number" ? 1 : undefined}
                className={inputCls}
              />
            )}
          </div>
        );
      })}
      <div aria-hidden="true" className="hidden">
        <label>
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <div className="sm:col-span-2">
        <button
          type="submit"
          disabled={busy}
          className="sc-btn-primary inline-flex min-h-11 w-full items-center justify-center rounded-full px-6 text-sm font-semibold tracking-tight disabled:opacity-60 sm:w-auto"
        >
          {busy ? "Sending…" : submitLabel}
        </button>
        <p className="mt-3 text-xs leading-relaxed text-slate">
          We use your details only to reply to this request. See our privacy
          notice.
        </p>
        {error && (
          <p className="mt-2 text-sm font-medium text-red-700" role="alert">
            {error}
          </p>
        )}
      </div>
    </form>
  );
}
