"use client";

import Link from "next/link";
import { useActionState } from "react";
import { confirmAction, type ConfirmState } from "./actions";

export function ConfirmForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState<ConfirmState, FormData>(confirmAction, {});

  if (state.result === "confirmed") {
    return (
      <div className="mt-6 rounded-2xl border border-line bg-elevated p-5" role="status">
        <p className="text-lg font-semibold tracking-tight text-ink">You’re subscribed. Thank you.</p>
        <p className="mt-1.5 text-sm text-slate">
          New Super-Cube® posts will come to your inbox. Every email has an unsubscribe link.
        </p>
        <Link href="/news" className="sc-btn-primary mt-4 inline-flex min-h-11 items-center rounded-full px-5 text-sm font-semibold">
          Read the latest news
        </Link>
      </div>
    );
  }

  const message =
    state.result === "expired"
      ? "This link has expired. Please sign up again and we’ll send a new one."
      : state.result === "invalid"
        ? "This link isn’t valid any more. Please sign up again."
        : state.result === "limited"
          ? "Too many attempts. Please wait a few minutes and try again."
          : state.result === "unavailable"
            ? "We couldn’t confirm right now. Please try again in a moment."
            : null;

  return (
    <form action={action} className="mt-6">
      <input type="hidden" name="token" value={token} />
      <button
        type="submit"
        disabled={pending}
        className="sc-btn-primary inline-flex min-h-11 items-center justify-center rounded-full px-6 text-sm font-semibold disabled:opacity-60"
      >
        {pending ? "Confirming…" : "Confirm my subscription"}
      </button>
      {message && (
        <p className="mt-3 text-sm font-medium text-ink" role="alert">
          {message}
        </p>
      )}
    </form>
  );
}
