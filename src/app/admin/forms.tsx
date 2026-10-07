"use client";

import { startTransition, useActionState, useEffect, useId, useRef, useState, type FormEvent } from "react";
import {
  createCohortAction,
  createInviteAction,
  grantSeatsAction,
  revokeCertificateAction,
  type ActionState,
} from "./actions";

export const inputCls =
  "mt-1 block min-h-11 w-full rounded-xl border border-line-strong bg-elevated px-3 text-sm text-ink placeholder:text-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink";
export const labelCls = "text-sm font-medium text-ink";
export const primaryBtn =
  "sc-btn-primary inline-flex min-h-11 items-center justify-center rounded-full px-5 text-sm font-semibold disabled:opacity-60";

type CohortOption = { id: string; name: string; code: string };

function Feedback({ state }: { state: ActionState }) {
  if (!state) return null;
  if (state.error)
    return (
      <p role="alert" className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200">
        {state.error}
      </p>
    );
  return (
    <div role="status" className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-100">
      <p className="font-medium">{state.message}</p>
      {state.link && <CopyField value={state.link} label="Link" />}
    </div>
  );
}

export function CopyField({ value, label }: { value: string; label: string }) {
  const id = useId();
  const [copied, setCopied] = useState(false);
  return (
    <div className="mt-2">
      <label htmlFor={id} className="sr-only">{label}</label>
      <div className="flex gap-2">
        <input id={id} readOnly value={value} onFocus={(e) => e.currentTarget.select()} className={`${inputCls} mt-0 font-mono text-xs`} />
        <button
          type="button"
          className="inline-flex min-h-11 shrink-0 items-center rounded-full border border-line-strong bg-elevated px-4 text-sm font-semibold text-ink"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(value);
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            } catch {
              /* select-and-copy still works */
            }
          }}
        >
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <span className="sr-only" aria-live="polite">{copied ? "Copied to clipboard" : ""}</span>
    </div>
  );
}

/**
 * Submit without React's automatic form reset, so a validation error never
 * wipes what the admin typed. The form is cleared only after a success.
 */
function submitWith(action: (fd: FormData) => void) {
  return (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(() => action(fd));
  };
}

function useResetOnSuccess(state: ActionState) {
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state?.ok) ref.current?.reset();
  }, [state]);
  return ref;
}

export function CreateCohortForm() {
  const [state, action, pending] = useActionState(createCohortAction, undefined);
  const ref = useResetOnSuccess(state);
  return (
    <form ref={ref} onSubmit={submitWith(action)} className="grid gap-4 sm:grid-cols-2" aria-label="Create a cohort">
      <div className="sm:col-span-2">
        <label htmlFor="c-name" className={labelCls}>Cohort name</label>
        <input id="c-name" name="name" required minLength={2} maxLength={120} placeholder="e.g. Acme Leaders · Pilot 1" className={inputCls} />
      </div>
      <div>
        <label htmlFor="c-kind" className={labelCls}>Type</label>
        <select id="c-kind" name="kind" defaultValue="company" className={inputCls}>
          <option value="company">Company</option>
          <option value="school">School</option>
          <option value="cohort">Open cohort</option>
          <option value="network">Network</option>
        </select>
      </div>
      <div>
        <label htmlFor="c-code" className={labelCls}>Join code <span className="font-normal text-slate">(optional)</span></label>
        <input id="c-code" name="code" maxLength={24} placeholder="Made for you if blank" className={`${inputCls} uppercase placeholder:normal-case`} aria-describedby="c-code-hint" />
        <p id="c-code-hint" className="mt-1 text-xs text-slate">Letters and numbers only. Learners type this to join.</p>
      </div>
      <div>
        <label htmlFor="c-contact" className={labelCls}>Client contact email <span className="font-normal text-slate">(optional)</span></label>
        <input id="c-contact" name="contact_email" type="email" maxLength={200} className={inputCls} />
      </div>
      <div>
        <label htmlFor="c-seats" className={labelCls}>Opening seats</label>
        <input id="c-seats" name="seats" type="number" min={0} max={10000} defaultValue={0} inputMode="numeric" className={inputCls} />
      </div>
      <div>
        <label htmlFor="c-seat-kind" className={labelCls}>Seats paid by</label>
        <select id="c-seat-kind" name="seat_kind" defaultValue="invoiced" className={inputCls}>
          <option value="invoiced">Invoice</option>
          <option value="eft">EFT</option>
          <option value="comped">Complimentary (pilot)</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div>
        <label htmlFor="c-ref" className={labelCls}>Invoice / EFT reference</label>
        <input id="c-ref" name="reference" maxLength={80} placeholder="e.g. INV-2026-014" className={inputCls} />
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="c-notes" className={labelCls}>Notes <span className="font-normal text-slate">(internal)</span></label>
        <textarea id="c-notes" name="notes" maxLength={500} rows={2} className={`${inputCls} py-2`} />
      </div>
      <div className="sm:col-span-2">
        <button type="submit" disabled={pending} className={primaryBtn}>{pending ? "Creating…" : "Create cohort"}</button>
        <Feedback state={state} />
      </div>
    </form>
  );
}

export function GrantSeatsForm({ cohorts, defaultOrg }: { cohorts: CohortOption[]; defaultOrg?: string }) {
  const [state, action, pending] = useActionState(grantSeatsAction, undefined);
  const ref = useResetOnSuccess(state);
  return (
    <form ref={ref} onSubmit={submitWith(action)} className="grid gap-4 sm:grid-cols-2" aria-label="Add seats">
      <div className="sm:col-span-2">
        <label htmlFor="g-org" className={labelCls}>Cohort</label>
        <select id="g-org" name="org_id" required defaultValue={defaultOrg ?? ""} className={inputCls}>
          <option value="" disabled>Choose a cohort</option>
          {cohorts.map((c) => (
            <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="g-seats" className={labelCls}>Seats to add</label>
        <input id="g-seats" name="seats" type="number" min={1} max={10000} required inputMode="numeric" className={inputCls} />
      </div>
      <div>
        <label htmlFor="g-kind" className={labelCls}>Paid by</label>
        <select id="g-kind" name="kind" required defaultValue="invoiced" className={inputCls}>
          <option value="invoiced">Invoice</option>
          <option value="eft">EFT</option>
          <option value="comped">Complimentary (pilot)</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div>
        <label htmlFor="g-ref" className={labelCls}>Invoice / EFT reference</label>
        <input id="g-ref" name="reference" maxLength={80} className={inputCls} aria-describedby="g-ref-hint" />
        <p id="g-ref-hint" className="mt-1 text-xs text-slate">Required for invoice and EFT seats.</p>
      </div>
      <div>
        <label htmlFor="g-note" className={labelCls}>Note <span className="font-normal text-slate">(optional)</span></label>
        <input id="g-note" name="note" maxLength={300} className={inputCls} />
      </div>
      <div className="sm:col-span-2">
        <button type="submit" disabled={pending || cohorts.length === 0} className={primaryBtn}>{pending ? "Adding…" : "Add seats"}</button>
        <Feedback state={state} />
      </div>
    </form>
  );
}

export function InviteForm({ cohorts }: { cohorts: CohortOption[] }) {
  const [state, action, pending] = useActionState(createInviteAction, undefined);
  return (
    <form onSubmit={submitWith(action)} className="grid gap-4 sm:grid-cols-2" aria-label="Invite a coach or admin">
      <div className="sm:col-span-2">
        <label htmlFor="i-org" className={labelCls}>Cohort</label>
        <select id="i-org" name="org_id" required defaultValue="" className={inputCls}>
          <option value="" disabled>Choose a cohort</option>
          {cohorts.map((c) => (
            <option key={c.id} value={c.id}>{c.name} ({c.code})</option>
          ))}
        </select>
      </div>
      <fieldset className="sm:col-span-2">
        <legend className={labelCls}>Role</legend>
        <div className="mt-2 flex flex-wrap gap-4 text-sm text-ink">
          <label className="inline-flex min-h-11 items-center gap-2"><input type="radio" name="role" value="coach" defaultChecked className="size-4" /> Coach (sees consented scores, never journals)</label>
          <label className="inline-flex min-h-11 items-center gap-2"><input type="radio" name="role" value="admin" className="size-4" /> Organisation admin</label>
        </div>
      </fieldset>
      <div>
        <label htmlFor="i-email" className={labelCls}>Lock to email <span className="font-normal text-slate">(recommended)</span></label>
        <input id="i-email" name="email" type="email" maxLength={200} className={inputCls} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="i-days" className={labelCls}>Expires in (days)</label>
          <input id="i-days" name="days" type="number" min={1} max={30} defaultValue={7} inputMode="numeric" className={inputCls} />
        </div>
        <div>
          <label htmlFor="i-uses" className={labelCls}>Uses</label>
          <input id="i-uses" name="max_uses" type="number" min={1} max={50} defaultValue={1} inputMode="numeric" className={inputCls} />
        </div>
      </div>
      <div className="sm:col-span-2">
        <button type="submit" disabled={pending || cohorts.length === 0} className={primaryBtn}>{pending ? "Creating…" : "Create invite link"}</button>
        <p className="mt-2 text-xs text-slate">No email is sent. Share the link yourself; only a hash of it is stored.</p>
        <Feedback state={state} />
      </div>
    </form>
  );
}

export function RevokeCertificateForm({ id }: { id: string }) {
  const [state, action, pending] = useActionState(revokeCertificateAction, undefined);
  const [open, setOpen] = useState(false);
  const inputId = useId();
  if (state?.ok) return <p role="status" className="text-sm text-slate">{state.message}</p>;
  if (!open)
    return (
      <button type="button" onClick={() => setOpen(true)} className="min-h-11 rounded-full border border-line-strong px-4 text-sm font-semibold text-ink">
        Revoke…
      </button>
    );
  return (
    <form onSubmit={submitWith(action)} className="flex flex-wrap items-end gap-2">
      <input type="hidden" name="id" value={id} />
      <div className="min-w-[12rem] flex-1">
        <label htmlFor={inputId} className="text-xs font-medium text-ink">Reason (audit log)</label>
        <input id={inputId} name="reason" required minLength={4} maxLength={300} autoFocus className={`${inputCls} mt-0.5`} />
      </div>
      <button type="submit" disabled={pending} className="min-h-11 rounded-full bg-red-700 px-4 text-sm font-semibold text-white hover:bg-red-800 disabled:opacity-60">
        {pending ? "Revoking…" : "Confirm revoke"}
      </button>
      <button type="button" onClick={() => setOpen(false)} className="min-h-11 px-2 text-sm font-semibold text-ink underline underline-offset-2">Cancel</button>
      <Feedback state={state} />
    </form>
  );
}
