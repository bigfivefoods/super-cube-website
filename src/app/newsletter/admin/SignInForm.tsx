"use client";

import { useActionState } from "react";
import { signInAction } from "./actions";

const inputCls =
  "mt-1 block min-h-11 w-full rounded-xl border border-line-strong bg-elevated px-3 text-sm text-ink";

export function SignInForm({ next }: { next?: "/admin" | "/newsletter/admin" } = {}) {
  const [state, action, pending] = useActionState(signInAction, undefined);
  return (
    <form action={action} className="mt-6 space-y-4">
      {next && <input type="hidden" name="next" value={next} />}
      <div>
        <label htmlFor="nl-admin-email" className="text-sm font-medium text-ink">Email</label>
        <input id="nl-admin-email" name="email" type="email" autoComplete="username" required className={inputCls} />
      </div>
      <div>
        <label htmlFor="nl-admin-password" className="text-sm font-medium text-ink">Password</label>
        <input id="nl-admin-password" name="password" type="password" autoComplete="current-password" required className={inputCls} />
      </div>
      {state?.error && (
        <p className="text-sm font-medium text-red-700 dark:text-red-300" role="alert">{state.error}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="sc-btn-primary inline-flex min-h-11 items-center justify-center rounded-full px-6 text-sm font-semibold"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
