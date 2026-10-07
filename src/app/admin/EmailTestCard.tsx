"use client";

import { useActionState } from "react";
import { sendTestEmailsAction, type EmailTestState } from "./email-actions";

const PREVIEWS = [
  ["welcome-demo", "Welcome (free demo)"],
  ["welcome-purchase", "Welcome (paid)"],
  ["receipt", "Payment receipt"],
  ["seat-pack", "Seat pack · cohort code"],
  ["weekly", "Weekly progress"],
  ["newsletter", "Newsletter layout"],
] as const;

/** Email templates: preview with sample data, or send the main set to yourself. */
export function EmailTestCard({ className }: { className: string }) {
  const [state, action, pending] = useActionState<EmailTestState, FormData>(sendTestEmailsAction, undefined);
  return (
    <section className={className} aria-labelledby="email-h">
      <h2 id="email-h" className="text-lg font-semibold tracking-tight text-ink">Email templates</h2>
      <p className="mt-1 text-sm text-slate">Preview each branded email with sample data, or send the main set to your own admin address.</p>
      <ul className="mt-3 flex flex-wrap gap-2">
        {PREVIEWS.map(([id, label]) => (
          <li key={id}>
            <a
              href={`/api/admin/email-preview?id=${id}`}
              target="_blank"
              rel="noopener"
              className="inline-flex min-h-11 items-center rounded-full border border-line-strong px-4 text-sm font-medium text-ink hover:border-ink"
            >
              {label}
            </a>
          </li>
        ))}
      </ul>
      <form action={action} className="mt-4">
        <button
          type="submit"
          disabled={pending}
          className="sc-btn-primary inline-flex min-h-11 items-center justify-center rounded-full px-5 text-sm font-semibold disabled:opacity-60"
        >
          {pending ? "Sending…" : "Send me the test set"}
        </button>
      </form>
      {state?.error && (
        <p role="alert" className="mt-3 text-sm font-medium text-red-700 dark:text-red-300">{state.error}</p>
      )}
      {state?.ok && (
        <p role="status" className="mt-3 text-sm font-medium text-emerald-800 dark:text-emerald-200">{state.message}</p>
      )}
    </section>
  );
}
